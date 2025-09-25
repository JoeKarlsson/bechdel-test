import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import React, { useEffect, useRef, useState } from 'react';
import { Uppy } from '@uppy/core';
import { Dashboard } from '@uppy/react';
import XHRUpload from '@uppy/xhr-upload';
import ErrorBoundary from '../../../shared/ErrorBoundary/ErrorBoundary';
import Notification from '../../../shared/Notification';
import LoadingAnimation from '../../../shared/LoadingAnimation';
import { FileValidator } from '../../../shared/FileValidator';

const Uploader = () => {
	const uppyRef = useRef(null);
	const eventSourceRef = useRef(null);
	const fileValidatorRef = useRef(new FileValidator({
		strictMode: false,
		skipFormatValidation: true // Skip format validation entirely - focus on security only
	}));
	const [uppy, setUppy] = useState(null);
	const [notification, setNotification] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingStatus, setProcessingStatus] = useState({
		stage: 'initializing',
		progress: 0,
		message: 'Starting script processing...'
	});
	const [currentProcessId, setCurrentProcessId] = useState(null);

	// Helper methods for validation messages
	const formatValidationErrorMessage = (errors, fileName) => {
		let message = `The file "${fileName}" was rejected:\n\n`;
		errors.forEach((error, index) => {
			message += `• ${error}\n`;
		});
		message += '\nPlease check the file requirements and try again.';
		return message;
	};

	const formatValidationWarningMessage = (warnings, fileName) => {
		let message = `The file "${fileName}" has some issues:\n\n`;
		warnings.forEach((warning, index) => {
			message += `• ${warning}\n`;
		});
		message += '\nYou can proceed, but the results may not be accurate.';
		return message;
	};

	const showValidationHelp = (errors) => {
		let helpContent = 'File Requirements:\n\n';
		helpContent += '• File type: Only .txt files are allowed\n';
		helpContent += '• File size: Between 100 bytes and 5MB\n';
		helpContent += '• Format: Must follow standard script format\n';
		helpContent += '• Content: Must be a valid movie script\n\n';

		helpContent += 'Common Issues:\n\n';

		if (errors.some(e => e.includes('file type'))) {
			helpContent += '• Make sure your file has a .txt extension\n';
			helpContent += '• Convert from other formats (PDF, DOC) to plain text\n\n';
		}

		if (errors.some(e => e.includes('size'))) {
			helpContent += '• Large files: Try splitting into smaller parts\n';
			helpContent += '• Small files: Ensure it\'s a complete script\n\n';
		}

		if (errors.some(e => e.includes('malicious'))) {
			helpContent += '• Remove any HTML, JavaScript, or other code\n';
			helpContent += '• Ensure the file contains only script text\n\n';
		}

		if (errors.some(e => e.includes('format'))) {
			helpContent += '• Use standard script formatting\n';
			helpContent += '• Include scene headings (INT./EXT.)\n';
			helpContent += '• Include character names and dialogue\n\n';
		}

		helpContent += 'Need more help? Check our documentation or contact support.';

		setNotification({
			type: 'info',
			title: 'File Requirements Help',
			message: helpContent,
			duration: 0,
			persistent: true,
			actionText: 'Got It',
			onActionClick: () => setNotification(null)
		});
	};

	// Function to poll for final results when processing is complete
	const pollForFinalResults = (processId) => {
		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch(`/api/film/process/${processId}`);
				const data = await response.json();

				if (data.success && data.status !== 'processing') {
					clearInterval(pollInterval);
					setIsProcessing(false);

					// Show success notification with option to view film
					setNotification({
						type: 'success',
						title: 'Upload Complete!',
						message: `Your script "${data.title || 'Untitled'}" has been processed successfully.`,
						actionText: 'View Film',
						onActionClick: () => {
							window.location = `/film/${data._id}`;
						},
						duration: 8000, // Longer duration to give user time to read
					});
				} else if (data.success === false && data.status !== 'processing') {
					clearInterval(pollInterval);
					setIsProcessing(false);
					setNotification({
						type: 'error',
						title: 'Processing Failed',
						message: data.error || 'An error occurred during processing.',
						duration: 6000,
					});
				}
			} catch (error) {
				console.error('Error polling for final results:', error);
			}
		}, 2000); // Poll every 2 seconds
	};

	// Function to connect to Server-Sent Events for real-time status updates
	const connectToStatusStream = (processId) => {
		console.log('Connecting to SSE for processId:', processId);

		// Close existing connection if any
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		// Create new EventSource connection
		const eventSource = new EventSource(`/api/status/${processId}`);
		eventSourceRef.current = eventSource;

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				if (data.type === 'status') {
					console.log('SSE status update received:', data);
					setProcessingStatus({
						stage: data.stage,
						progress: data.progress,
						message: data.message
					});
				} else if (data.type === 'connected') {
					console.log('Connected to status stream for process:', processId);
				} else if (data.type === 'ping') {
					// Keep connection alive
					console.log('Status stream ping received');
				}
			} catch (error) {
				console.error('Error parsing SSE data:', error);
			}
		};

		eventSource.onerror = (error) => {
			console.error('SSE connection error:', error);
			// Don't close connection on error, let it retry
		};

		eventSource.onopen = () => {
			console.log('SSE connection opened for process:', processId);
		};
	};

	// Cleanup SSE connection on unmount
	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
			}
		};
	}, []);

	useEffect(() => {
		const uppyInstance = new Uppy({
			id: 'uppy',
			meta: { type: 'script' },
			restrictions: {
				maxNumberOfFiles: 10,
				maxFileSize: 5 * 1024 * 1024, // 5MB max
				minNumberOfFiles: 1,
				allowedFileTypes: ['.txt'], // More specific file type restriction
			},
			thumbnailGeneration: true,
			autoProceed: false, // Disable auto-proceed to allow validation
			debug: true,
		}).use(XHRUpload, {
			endpoint: '/api/film',
			fieldName: 'script',
			method: 'post',
			formData: true,
			limit: 10,
			getResponseData: xhr => {
				try {
					console.log('Uppy xhr object:', xhr);
					console.log('xhr.response:', xhr.response);
					console.log('xhr.status:', xhr.status);
					console.log('xhr.responseText:', xhr.responseText);
					console.log('xhr.responseXML:', xhr.responseXML);

					// Uppy might pass response data differently
					let responseData = xhr.response || xhr.responseText;

					if (!responseData) {
						console.error('No response data received from server');
						throw new Error('No response data received from server');
					}

					console.log('Raw response data:', responseData);

					let response = JSON.parse(responseData);
					console.log('Parsed response:', response);

					// Handle different response formats
					if (response['0']) {
						response = response['0'];
					}

					console.log('Final response:', response);

					// Store the process ID for SSE connection immediately
					if (response.processId) {
						console.log('Setting processId:', response.processId);
						setCurrentProcessId(response.processId);
						connectToStatusStream(response.processId);

						// Start polling for final results
						pollForFinalResults(response.processId);
					} else {
						console.error('No processId in response:', response);
					}

					// Don't show success notification here - wait for final results
					return {
						url: xhr.responseXML ? xhr.responseXML.querySelector('Location')?.textContent : 'upload-complete',
					};
				} catch (error) {
					console.error('Error in getResponseData:', error);
					console.error('Response data:', xhr.response || xhr.responseText);
					console.error('Response type:', typeof (xhr.response || xhr.responseText));
					throw error;
				}
			},
		});

		// Add file validation before upload
		uppyInstance.on('file-added', async (file) => {
			console.log('File added:', file.name, file.type, file.size);
			console.log('File object structure:', Object.keys(file));

			// Handle Uppy file objects - they have a 'data' property with the actual File/Blob
			const actualFile = file.data || file;
			const fileSize = actualFile.size || file.size;

			// Basic validation first
			if (!file.name.toLowerCase().endsWith('.txt')) {
				console.log('File extension validation failed');
				uppyInstance.removeFile(file.id);
				setNotification({
					type: 'error',
					title: 'File Upload Rejected',
					message: `The file "${file.name}" was rejected because it's not a .txt file. Only .txt files are allowed.`,
					duration: 0,
					persistent: true,
					actionText: 'Learn More',
					onActionClick: () => showValidationHelp(['file type']),
				});
				return;
			}

			if (fileSize > 5 * 1024 * 1024) {
				console.log('File size validation failed');
				uppyInstance.removeFile(file.id);
				setNotification({
					type: 'error',
					title: 'File Upload Rejected',
					message: `The file "${file.name}" was rejected because it's too large (${Math.round(fileSize / 1024 / 1024 * 100) / 100}MB). Maximum size allowed is 5MB.`,
					duration: 0,
					persistent: true,
					actionText: 'Learn More',
					onActionClick: () => showValidationHelp(['size']),
				});
				return;
			}

			if (fileSize < 100) {
				console.log('File size validation failed - too small');
				uppyInstance.removeFile(file.id);
				setNotification({
					type: 'error',
					title: 'File Upload Rejected',
					message: `The file "${file.name}" was rejected because it's too small (${fileSize} bytes). Minimum size required is 100 bytes.`,
					duration: 0,
					persistent: true,
					actionText: 'Learn More',
					onActionClick: () => showValidationHelp(['size']),
				});
				return;
			}

			try {
				const result = await fileValidatorRef.current.validateFile(file);
				console.log('Validation result:', result);

				if (!result.isValid) {
					console.log('File validation failed:', result.errors);
					// Remove the file and show error notification
					uppyInstance.removeFile(file.id);

					// Show validation error notification directly
					setNotification({
						type: 'error',
						title: 'File Upload Rejected',
						message: formatValidationErrorMessage(result.errors, file.name),
						duration: 0, // Don't auto-dismiss
						persistent: true,
						actionText: 'Learn More',
						onActionClick: () => showValidationHelp(result.errors),
					});
				} else if (result.warnings.length > 0) {
					console.log('File validation warnings:', result.warnings);
					// Show warning notification but allow upload
					setNotification({
						type: 'warning',
						title: 'File Upload Warning',
						message: formatValidationWarningMessage(result.warnings, file.name),
						duration: 8000,
						persistent: false,
						actionText: 'Proceed Anyway',
						onActionClick: () => setNotification(null),
					});
				} else {
					console.log('File validation passed');
				}
			} catch (error) {
				console.error('File validation error:', error);
				uppyInstance.removeFile(file.id);
				setNotification({
					type: 'error',
					title: 'Validation Error',
					message: `Failed to validate file ${file.name}: ${error.message}`,
					duration: 6000,
				});
			}
		});

		// Add event listeners for upload progress and errors
		uppyInstance.on('upload', () => {
			console.log('Upload started, currentProcessId:', currentProcessId);
			setIsProcessing(true);
			setProcessingStatus({
				stage: 'initializing',
				progress: 0,
				message: 'Starting script processing...'
			});
			setNotification({
				type: 'info',
				title: 'Processing Script',
				message: 'Your script is being uploaded and analyzed. This may take a few moments...',
				duration: 0, // Don't auto-dismiss
				persistent: true,
			});
		});

		uppyInstance.on('upload-error', (file, error) => {
			console.error('Upload error:', error);
			setIsProcessing(false);
			setNotification({
				type: 'error',
				title: 'Upload Failed',
				message: `Failed to upload ${file.name}. Please try again.`,
				duration: 6000,
			});
		});

		uppyInstance.on('complete', (result) => {
			setIsProcessing(false);
			// Only show success notification if there were no errors
			if (result.failed.length === 0) {
				// Success notification is handled in getResponseData
			} else {
				setNotification({
					type: 'error',
					title: 'Upload Issues',
					message: `${result.failed.length} file(s) failed to upload. Please check your files and try again.`,
					duration: 6000,
				});
			}
		});

		uppyRef.current = uppyInstance;
		setUppy(uppyInstance);

		return () => {
			if (uppyRef.current) {
				uppyRef.current.close();
			}
		};
	}, []);

	const handleNotificationClose = () => {
		setNotification(null);
	};

	// Don't render components until Uppy is initialized
	if (!uppy) {
		return <div>Loading uploader...</div>;
	}

	return (
		<>
			<ErrorBoundary>
				<Dashboard
					uppy={uppy}
					locale={{
						strings: {
							chooseFile: 'Choose a script file',
							orDragDrop: 'or drag and drop it here',
							upload: 'Upload Script',
							uploadXFiles: 'Upload %{smart_count} script',
						},
					}}
					showProgressDetails={true}
					hideUploadButton={false}
					hideRetryButton={false}
					hidePauseResumeButton={false}
					hideCancelButton={false}
					note="Only .txt files are allowed. Files will be validated before upload."
				/>
			</ErrorBoundary>

			{notification && (
				<Notification
					{...notification}
					onClose={handleNotificationClose}
				/>
			)}

			<LoadingAnimation
				isVisible={isProcessing}
				status={processingStatus}
				processId={currentProcessId}
			/>
		</>
	);
};

export default Uploader;
