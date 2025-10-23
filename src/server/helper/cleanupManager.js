const fs = require('fs');
const path = require('path');
const script = require('../methods/script');
const filmData = require('../methods/getFilmData/FilmData');

/**
 * Cleanup Manager - Handles cleanup of failed or stuck processing operations
 */
class CleanupManager {
	constructor() {
		this.activeProcesses = new Map(); // Track active processing operations
		this.cleanupInterval = null;
		this.maxProcessingTime = 5 * 60 * 1000; // 5 minutes max processing time
		this.cleanupCheckInterval = 30 * 1000; // Check every 30 seconds
	}

	/**
     * Register a new processing operation
     * @param {string} processId - Unique identifier for the process
     * @param {string} scriptPath - Path to the uploaded script file
     * @param {string} title - Title of the film being processed
     */
	registerProcess(processId, scriptPath, title) {
		const processInfo = {
			id: processId,
			scriptPath,
			title,
			startTime: Date.now(),
			status: 'processing',
			stage: 'initializing',
			progress: 0,
			message: 'Starting script processing...',
			stages: {
				'initializing': { progress: 5, message: 'Initializing processing...' },
				'fetching_film_data': { progress: 10, message: 'Fetching film data from external APIs...' },
				'omdb_api': { progress: 15, message: 'Getting basic film info from OMDB...' },
				'tmdb_images': { progress: 25, message: 'Fetching images from TMDB...' },
				'bechdel_api': { progress: 35, message: 'Getting Bechdel test data...' },
				'tmdb_credits': { progress: 45, message: 'Fetching cast and crew from TMDB...' },
				'reading_script': { progress: 55, message: 'Reading and parsing script file...' },
				'analyzing_characters': { progress: 65, message: 'Analyzing character dialogue...' },
				'extracting_scenes': { progress: 75, message: 'Extracting and analyzing scenes...' },
				'running_bechdel_test': { progress: 85, message: 'Running Bechdel test analysis...' },
				'saving_results': { progress: 95, message: 'Saving results to database...' },
				'completed': { progress: 100, message: 'Processing completed successfully!' }
			}
		};

		this.activeProcesses.set(processId, processInfo);
		console.log(`Registered processing operation: ${processId} for "${title}"`);

		// Start cleanup monitoring if not already running
		if (!this.cleanupInterval) {
			this.startCleanupMonitoring();
		}

		// Send initial status update
		this.updateProcessStage(processId, 'initializing');
	}

	/**
     * Update process stage and progress
     * @param {string} processId - Process identifier
     * @param {string} stage - Current processing stage
     * @param {string} customMessage - Optional custom message
     */
	updateProcessStage(processId, stage, customMessage = null) {
		const processInfo = this.activeProcesses.get(processId);
		if (!processInfo) {
			console.warn(`Process ${processId} not found for stage update`);
			return;
		}

		const stageInfo = processInfo.stages[stage];
		if (stageInfo) {
			processInfo.stage = stage;
			processInfo.progress = stageInfo.progress;
			processInfo.message = customMessage || stageInfo.message;
			processInfo.lastUpdate = Date.now();

			console.log(`Process ${processId} - Stage: ${stage} (${processInfo.progress}%) - ${processInfo.message}`);

			// Send status update via SSE if available
			if (this.sendStatusUpdate) {
				this.sendStatusUpdate(processId, {
					status: processInfo.status,
					stage: processInfo.stage,
					progress: processInfo.progress,
					message: processInfo.message
				});
			}
		}
	}

	/**
     * Set custom message for current stage
     * @param {string} processId - Process identifier
     * @param {string} message - Custom message
     */
	setProcessMessage(processId, message) {
		const processInfo = this.activeProcesses.get(processId);
		if (processInfo) {
			processInfo.message = message;
			processInfo.lastUpdate = Date.now();

			if (this.sendStatusUpdate) {
				this.sendStatusUpdate(processId, {
					status: processInfo.status,
					stage: processInfo.stage,
					progress: processInfo.progress,
					message: processInfo.message
				});
			}
		}
	}

	/**
     * Get detailed process information
     * @param {string} processId - Process identifier
     */
	getProcessInfo(processId) {
		return this.activeProcesses.get(processId);
	}

	/**
     * Mark a process as completed and clean up
     * @param {string} processId - Process identifier
     * @param {boolean} success - Whether the process succeeded
     */
	completeProcess(processId, success = true) {
		const processInfo = this.activeProcesses.get(processId);
		if (!processInfo) {
			console.warn(`Process ${processId} not found in active processes`);
			return;
		}

		// Update to completed stage
		this.updateProcessStage(processId, 'completed');

		console.log(`Process ${processId} completed with status: ${success ? 'success' : 'failure'}`);

		// Clean up the script file
		this.cleanupScriptFile(processInfo.scriptPath);

		// Remove from active processes after a short delay to allow final status update
		setTimeout(() => {
			this.activeProcesses.delete(processId);

			// Stop monitoring if no more active processes
			if (this.activeProcesses.size === 0) {
				this.stopCleanupMonitoring();
			}
		}, 2000);
	}

	/**
     * Clean up a specific script file
     * @param {string} scriptPath - Path to the script file
     */
	async cleanupScriptFile(scriptPath) {
		if (!scriptPath) return;

		try {
			await script.clearTemp(scriptPath);
			console.log(`Cleaned up script file: ${scriptPath}`);
		} catch (error) {
			console.error(`Failed to cleanup script file ${scriptPath}:`, error);
		}
	}

	/**
     * Clean up all resources for a failed process
     * @param {string} processId - Process identifier
     * @param {Error} error - The error that caused the failure
     */
	async cleanupFailedProcess(processId, error) {
		const processInfo = this.activeProcesses.get(processId);
		if (!processInfo) {
			console.warn(`Process ${processId} not found for cleanup`);
			return;
		}

		console.error(`Cleaning up failed process ${processId}:`, error.message);

		try {
			// Clear film data cache
			filmData.clear();

			// Clean up script file
			await this.cleanupScriptFile(processInfo.scriptPath);

			// Mark process as failed
			processInfo.status = 'failed';
			processInfo.error = error.message;
			processInfo.endTime = Date.now();

		} catch (cleanupError) {
			console.error(`Error during cleanup of process ${processId}:`, cleanupError);
		} finally {
			// Remove from active processes
			this.activeProcesses.delete(processId);

			// Stop monitoring if no more active processes
			if (this.activeProcesses.size === 0) {
				this.stopCleanupMonitoring();
			}
		}
	}

	/**
     * Start monitoring for stuck processes
     */
	startCleanupMonitoring() {
		if (this.cleanupInterval) return;

		console.log('Starting cleanup monitoring...');
		this.cleanupInterval = setInterval(() => {
			this.checkForStuckProcesses();
		}, this.cleanupCheckInterval);
	}

	/**
     * Stop monitoring for stuck processes
     */
	stopCleanupMonitoring() {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
			console.log('Stopped cleanup monitoring');
		}
	}

	/**
     * Check for processes that have been running too long
     */
	async checkForStuckProcesses() {
		const now = Date.now();
		const stuckProcesses = [];

		for (const [processId, processInfo] of this.activeProcesses) {
			const processingTime = now - processInfo.startTime;

			if (processingTime > this.maxProcessingTime) {
				stuckProcesses.push({ processId, processInfo, processingTime });
			}
		}

		// Clean up stuck processes
		for (const { processId, processInfo, processingTime } of stuckProcesses) {
			const error = new Error(`Process timeout after ${Math.round(processingTime / 1000)}s`);
			console.error(`Process ${processId} timed out:`, error.message);
			await this.cleanupFailedProcess(processId, error);
		}
	}

	/**
     * Clean up old files in uploads directory
     * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
     */
	async cleanupOldUploads(maxAge = 60 * 60 * 1000) {
		const uploadsDir = path.join(process.cwd(), 'uploads');

		try {
			const files = await fs.promises.readdir(uploadsDir);
			const now = Date.now();
			let cleanedCount = 0;

			for (const file of files) {
				const filePath = path.join(uploadsDir, file);
				const stats = await fs.promises.stat(filePath);

				if (now - stats.mtime.getTime() > maxAge) {
					try {
						await fs.promises.unlink(filePath);
						cleanedCount++;
						console.log(`Cleaned up old upload file: ${file}`);
					} catch (error) {
						console.error(`Failed to delete old file ${file}:`, error);
					}
				}
			}

			if (cleanedCount > 0) {
				console.log(`Cleaned up ${cleanedCount} old upload files`);
			}
		} catch (error) {
			console.error('Error during uploads cleanup:', error);
		}
	}

	/**
     * Get status of all active processes
     */
	getActiveProcessesStatus() {
		const processes = [];
		for (const [processId, processInfo] of this.activeProcesses) {
			processes.push({
				id: processId,
				title: processInfo.title,
				status: processInfo.status,
				stage: processInfo.stage,
				progress: processInfo.progress,
				message: processInfo.message,
				startTime: processInfo.startTime,
				duration: Date.now() - processInfo.startTime,
				lastUpdate: processInfo.lastUpdate,
				scriptPath: processInfo.scriptPath
			});
		}
		return processes;
	}

	/**
     * Force cleanup of all active processes (emergency cleanup)
     */
	async forceCleanupAll() {
		console.log('Force cleaning up all active processes...');

		const processIds = Array.from(this.activeProcesses.keys());

		for (const processId of processIds) {
			const error = new Error('Force cleanup initiated');
			await this.cleanupFailedProcess(processId, error);
		}

		this.stopCleanupMonitoring();
		console.log('Force cleanup completed');
	}
}

// Create singleton instance
const cleanupManager = new CleanupManager();

// Method to set SSE callback
cleanupManager.setStatusUpdateCallback = function (callback) {
	this.sendStatusUpdate = callback;
};

// Clean up old uploads on startup
cleanupManager.cleanupOldUploads();

// Graceful shutdown handling
process.on('SIGINT', async () => {
	console.log('Received SIGINT, cleaning up...');
	await cleanupManager.forceCleanupAll();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.log('Received SIGTERM, cleaning up...');
	await cleanupManager.forceCleanupAll();
	process.exit(0);
});

module.exports = cleanupManager;
