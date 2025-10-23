/**
 * Comprehensive file validation utility for script uploads
 * Provides security checks, format validation, and content analysis
 */

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
	MAX_SIZE: 5 * 1024 * 1024, // 5MB
	MIN_SIZE: 100, // 100 bytes
	RECOMMENDED_MAX: 2 * 1024 * 1024, // 2MB recommended
};

// Allowed file extensions and MIME types
const ALLOWED_EXTENSIONS = ['.txt'];
const ALLOWED_MIME_TYPES = ['text/plain'];

// Malicious patterns to detect
const MALICIOUS_PATTERNS = [
	// Script injection patterns
	/<script[^>]*>.*?<\/script>/gi,
	/javascript:/gi,
	/vbscript:/gi,
	/onload\s*=/gi,
	/onerror\s*=/gi,
	/onclick\s*=/gi,

	// Command injection patterns - more specific to avoid false positives
	/;\s*(rm|del|format|shutdown|reboot)/gi,
	/\|\s*(rm|del|format|shutdown|reboot)/gi,
	/`\s*(rm|del|format|shutdown|reboot)/gi,
	/\$\s*\(/gi, // Command substitution
	/exec\s*\(/gi,
	/system\s*\(/gi,
	/eval\s*\(/gi,
	/shell_exec\s*\(/gi,

	// Path traversal patterns - more specific
	/\.\.\/\.\.\/\.\./g, // Multiple ../ patterns
	/\.\.\\\.\.\\\.\./g, // Multiple ..\ patterns
	/%2e%2e%2f%2e%2e%2f/gi, // URL encoded path traversal

	// SQL injection patterns
	/union\s+select/gi,
	/drop\s+table/gi,
	/delete\s+from/gi,
	/insert\s+into/gi,
	/update\s+set/gi,
	/'or\s+'1'\s*=\s*'1/gi,
	/"or\s+"1"\s*=\s*"1/gi,
];

// Script format validation patterns
const SCRIPT_FORMAT_PATTERNS = {
	// Common script elements - patterns that match actual screenplay formats
	SCENE_HEADINGS: /^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.|FADE IN|FADE OUT|CUT TO|DISSOLVE TO|OVER BLACK|FADE UP ON).*$/gmi,
	CHARACTER_NAMES: /^[A-Z][A-Z\s\-\.]+$/gm,
	DIALOGUE: /^[A-Z][A-Z\s\-\.]+$/gm,
	ACTION_LINES: /^[A-Za-z].*$/gm,

	// Alternative patterns for different script formats
	SCENE_DESCRIPTIONS: /^(SCENE|ACT|CHAPTER).*$/gmi,
	CHARACTER_INTROS: /^[A-Z][A-Z\s\-\.]+(\(.*\))?$/gm,

	// Minimum requirements for a valid script - very lenient
	MIN_SCENE_HEADINGS: 0, // Allow scripts without explicit scene headings
	MIN_CHARACTER_NAMES: 0, // Allow scripts without character names
	MIN_DIALOGUE_LINES: 0, // Allow scripts without dialogue
};

// Suspicious content patterns - only truly problematic patterns
const SUSPICIOUS_PATTERNS = [
	// Excessive special characters - very lenient threshold
	/[!@#$%^&*()_+={}[\]|\\:";'<>?,./]{50,}/g, // Increased from 20 to 50

	// Repeated patterns that might indicate spam - very lenient
	/(.{50,})\1{20,}/g, // Increased thresholds significantly

	// Excessive whitespace - very lenient
	/\s{100,}/g, // Increased from 50 to 100
];

class FileValidator {
	constructor(options = {}) {
		this.errors = [];
		this.warnings = [];
		this.strictMode = options.strictMode !== false; // Default to strict mode
		this.skipFormatValidation = options.skipFormatValidation === true; // Skip format validation if requested
	}

	/**
     * Main validation method
     * @param {File} file - The file to validate
     * @returns {Object} Validation result with success, errors, and warnings
     */
	async validateFile(file) {
		this.errors = [];
		this.warnings = [];

		// Basic file checks
		this.validateBasicProperties(file);

		// Security checks
		await this.validateSecurity(file);

		// Format validation (skip if requested)
		if (!this.skipFormatValidation) {
			await this.validateScriptFormat(file);
		}

		// Content analysis
		await this.validateContent(file);

		return {
			isValid: this.errors.length === 0,
			errors: this.errors,
			warnings: this.warnings,
			fileInfo: this.getFileInfo(file)
		};
	}

	/**
     * Validate basic file properties
     */
	validateBasicProperties(file) {
		if (!file) {
			this.errors.push('No file provided');
			return;
		}

		// File name validation
		if (!file.name || file.name.trim() === '') {
			this.errors.push('File must have a name');
		}

		// File extension validation
		const extension = this.getFileExtension(file.name);
		if (!ALLOWED_EXTENSIONS.includes(extension)) {
			this.errors.push(`File type not supported. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`);
		}

		// MIME type validation
		if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
			this.errors.push(`File MIME type '${file.type}' is not supported. Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed.`);
		}

		// File size validation
		if (file.size > FILE_SIZE_LIMITS.MAX_SIZE) {
			this.errors.push(`File is too large. Maximum size allowed is ${this.formatFileSize(FILE_SIZE_LIMITS.MAX_SIZE)}`);
		}

		if (file.size < FILE_SIZE_LIMITS.MIN_SIZE) {
			this.errors.push(`File is too small. Minimum size required is ${this.formatFileSize(FILE_SIZE_LIMITS.MIN_SIZE)}`);
		}

		if (file.size > FILE_SIZE_LIMITS.RECOMMENDED_MAX) {
			this.warnings.push(`File is large (${this.formatFileSize(file.size)}). Processing may take longer.`);
		}

		// File name security checks
		if (this.containsSuspiciousCharacters(file.name)) {
			this.errors.push('File name contains suspicious characters');
		}
	}

	/**
     * Validate file security
     */
	async validateSecurity(file) {
		try {
			const content = await this.readFileContent(file);

			// Check for malicious patterns with detailed logging
			for (const pattern of MALICIOUS_PATTERNS) {
				const matches = content.match(pattern);
				if (matches) {
					console.log('Malicious pattern detected:', pattern.toString(), 'Matches:', matches);
					if (this.strictMode) {
						this.errors.push('File contains potentially malicious content');
						break;
					} else {
						// In non-strict mode, only warn about obvious threats
						if (pattern.toString().includes('script') || pattern.toString().includes('javascript')) {
							this.warnings.push('File contains potentially suspicious content');
						}
					}
				}
			}

			// Check for suspicious patterns with debugging - very lenient
			for (const pattern of SUSPICIOUS_PATTERNS) {
				if (pattern.test(content)) {
					console.log('Suspicious pattern detected:', pattern.toString());
					// Only warn about extremely suspicious patterns
					if (pattern.toString().includes('50,') && content.length > 10000) {
						this.warnings.push('File contains unusual patterns that may indicate non-script content');
					}
					break;
				}
			}

			// Check for binary content
			if (this.containsBinaryContent(content)) {
				console.log('Binary content detected in file');
				if (this.strictMode) {
					this.errors.push('File appears to contain binary data');
				}
				// In non-strict mode, don't warn about binary content unless it's truly problematic
			}

		} catch (error) {
			this.errors.push(`Unable to read file content: ${error.message}`);
		}
	}

	/**
     * Validate script format
     */
	async validateScriptFormat(file) {
		try {
			const content = await this.readFileContent(file);

			// Debug: Log first few lines to see what we're working with
			const lines = content.split('\n').slice(0, 10);
			console.log('First 10 lines of script:', lines);

			// Check for basic script structure with more flexible patterns
			const sceneHeadings = content.match(SCRIPT_FORMAT_PATTERNS.SCENE_HEADINGS);
			const sceneDescriptions = content.match(SCRIPT_FORMAT_PATTERNS.SCENE_DESCRIPTIONS);
			const characterNames = content.match(SCRIPT_FORMAT_PATTERNS.CHARACTER_NAMES);
			const characterIntros = content.match(SCRIPT_FORMAT_PATTERNS.CHARACTER_INTROS);

			console.log('Script analysis:', {
				sceneHeadings: sceneHeadings ? sceneHeadings.length : 0,
				sceneDescriptions: sceneDescriptions ? sceneDescriptions.length : 0,
				characterNames: characterNames ? characterNames.length : 0,
				characterIntros: characterIntros ? characterIntros.length : 0
			});

			// Count total scene indicators
			const totalScenes = (sceneHeadings ? sceneHeadings.length : 0) + (sceneDescriptions ? sceneDescriptions.length : 0);
			const totalCharacters = (characterNames ? characterNames.length : 0) + (characterIntros ? characterIntros.length : 0);

			// Check for dialogue with more flexible counting
			const dialogueLines = this.countDialogueLines(content);
			console.log('Dialogue lines detected:', dialogueLines);

			// Only warn if there are absolutely no script-like elements at all
			if (totalScenes === 0 && totalCharacters === 0 && dialogueLines === 0) {
				// Check if it's at least a text file with some content
				if (content.length > 100) {
					this.warnings.push('File may not be in proper script format - no script elements detected');
				}
			}

		} catch (error) {
			this.errors.push(`Unable to validate script format: ${error.message}`);
		}
	}

	/**
     * Validate content quality and structure
     */
	async validateContent(file) {
		try {
			const content = await this.readFileContent(file);

			// Check content length
			if (content.length < 500) {
				this.warnings.push('File is very short and may not be a complete script');
			}

			if (content.length > 1000000) { // 1MB of text
				this.warnings.push('File is very long and may take a while to process');
			}

			// Check for excessive repetition
			if (this.hasExcessiveRepetition(content)) {
				this.warnings.push('File contains excessive repetition which may indicate poor quality content');
			}

			// Check for proper encoding
			if (!this.isValidTextEncoding(content)) {
				this.errors.push('File contains invalid text encoding');
			}

		} catch (error) {
			this.errors.push(`Unable to validate content: ${error.message}`);
		}
	}

	/**
     * Helper methods
     */
	getFileExtension(filename) {
		return filename.toLowerCase().substring(filename.lastIndexOf('.'));
	}

	formatFileSize(bytes) {
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		if (bytes === 0) return '0 Bytes';
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${Math.round(bytes / 1024**i * 100) / 100  } ${  sizes[i]}`;
	}

	containsSuspiciousCharacters(filename) {
		const suspiciousChars = /[<>:"/\\|?*\x00-\x1f]/;
		return suspiciousChars.test(filename);
	}

	async readFileContent(file) {
		return new Promise((resolve, reject) => {
			// Handle Uppy file objects - they have a 'data' property with the actual File/Blob
			const fileToRead = file.data || file;

			// Check if it's a File or Blob
			if (!(fileToRead instanceof File) && !(fileToRead instanceof Blob)) {
				reject(new Error('Invalid file object - not a File or Blob'));
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = (e) => reject(new Error('Failed to read file'));
			reader.readAsText(fileToRead, 'UTF-8');
		});
	}

	containsBinaryContent(content) {
		// Check for truly binary content - null bytes and high ASCII characters
		// Allow common text control characters: \t (9), \n (10), \r (13)
		const binaryPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/;
		const hasBinary = binaryPattern.test(content);

		if (hasBinary) {
			// Find all binary characters for debugging
			const matches = content.match(binaryPattern);
			if (matches) {
				console.log('Binary characters detected:', matches.map(m => `charCode: ${m.charCodeAt(0)}`));

				// Check if all detected characters are common text control characters
				const allTextChars = matches.every(match => {
					const charCode = match.charCodeAt(0);
					return charCode === 9 || charCode === 10 || charCode === 13; // tab, newline, carriage return
				});

				if (allTextChars) {
					console.log('All detected characters are common text control characters - allowing');
					return false;
				}
			}
		}

		return hasBinary;
	}

	countDialogueLines(content) {
		const lines = content.split('\n');
		let dialogueCount = 0;

		for (const line of lines) {
			const trimmed = line.trim();

			// More flexible dialogue detection
			// Character names (all caps, possibly with hyphens, periods, or parentheses)
			if (trimmed.match(/^[A-Z][A-Z\s\-\.]+(\(.*\))?$/)) {
				dialogueCount++;
			}
			// Lines that look like dialogue (quoted text)
			else if (trimmed.match(/^["'].*["']$/)) {
				dialogueCount++;
			}
			// Lines that start with common dialogue indicators
			else if (trimmed.match(/^(SAYS?|SPEAKS?|REPLIES?|ANSWERS?|WHISPERS?|SHOUTS?)/i)) {
				dialogueCount++;
			}
		}

		return dialogueCount;
	}

	hasProperScriptFormatting(content) {
		const lines = content.split('\n');
		let hasSceneHeadings = false;
		let hasCharacterNames = false;
		let hasActionLines = false;

		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/)) {
				hasSceneHeadings = true;
			}
			if (trimmed.match(/^[A-Z][A-Z\s]+$/)) {
				hasCharacterNames = true;
			}
			if (trimmed.match(/^[A-Za-z].*$/) && !trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/)) {
				hasActionLines = true;
			}
		}

		return hasSceneHeadings && hasCharacterNames && hasActionLines;
	}

	hasExcessiveRepetition(content) {
		// Check for repeated phrases or words
		const words = content.toLowerCase().split(/\s+/);
		const wordCounts = {};

		for (const word of words) {
			if (word.length > 3) { // Only check words longer than 3 characters
				wordCounts[word] = (wordCounts[word] || 0) + 1;
			}
		}

		// Check if any word appears more than 10% of the time
		const totalWords = words.length;
		for (const count of Object.values(wordCounts)) {
			if (count / totalWords > 0.1) {
				return true;
			}
		}

		return false;
	}

	isValidTextEncoding(content) {
		// Check for valid UTF-8 encoding
		try {
			// Try to encode and decode the content
			const encoded = encodeURIComponent(content);
			const decoded = decodeURIComponent(encoded);
			return decoded === content;
		} catch (error) {
			return false;
		}
	}

	getFileInfo(file) {
		// Handle Uppy file objects - they have a 'data' property with the actual File/Blob
		const actualFile = file.data || file;

		return {
			name: file.name,
			size: actualFile.size || file.size,
			type: actualFile.type || file.type,
			lastModified: actualFile.lastModified || file.lastModified,
			extension: this.getFileExtension(file.name)
		};
	}
}

export default FileValidator;
