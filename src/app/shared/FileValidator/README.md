# File Validation System

This directory contains a comprehensive file validation system for the Bechdel Test application's file uploader.

## Components

### FileValidator.js

The main validation class that provides comprehensive file validation including:

- **Basic File Properties**: File name, extension, MIME type, and size validation
- **Security Checks**: Detection of malicious patterns, script injection, command injection, and path traversal attempts
- **Script Format Validation**: Analysis of script structure, scene headings, character names, and dialogue
- **Content Analysis**: Binary content detection, encoding validation, and repetition analysis

### FileValidationNotificationManager.js

Manages validation notifications and provides:

- **Error Notifications**: Detailed error messages for validation failures
- **Warning Notifications**: Non-critical issues that users can choose to ignore
- **Help System**: Contextual help based on specific validation errors
- **User Guidance**: Clear instructions on how to fix validation issues

## Features

### Security Validation

- Detects HTML/JavaScript injection attempts
- Identifies command injection patterns
- Prevents path traversal attacks
- Blocks SQL injection attempts
- Validates file encoding

### File Format Validation

- Enforces .txt file extension only
- Validates MIME type (text/plain)
- Checks file size limits (100 bytes - 5MB)
- Analyzes script structure and formatting

### Content Analysis

- Detects binary content in text files
- Identifies excessive repetition (spam detection)
- Validates UTF-8 encoding
- Analyzes script formatting compliance

### User Experience

- Real-time validation feedback
- Detailed error messages with specific reasons
- Contextual help and guidance
- Option to proceed with warnings
- Clear rejection of invalid files

## Usage

```javascript
import { FileValidator, FileValidationNotificationManager } from './FileValidator';

// Create validator instance
const validator = new FileValidator();
const notificationManager = new FileValidationNotificationManager();

// Validate a file
const result = await validator.validateFile(file);

if (!result.isValid) {
    // Show error notification
    notificationManager.showValidationError(result, () => {
        // Handle validation failure
    });
} else if (result.warnings.length > 0) {
    // Show warning notification
    notificationManager.showValidationError(result, () => {
        // Allow user to proceed with warnings
    });
}
```

## Configuration

### File Size Limits

- Maximum: 5MB
- Minimum: 100 bytes
- Recommended: 2MB

### Allowed File Types

- Extensions: `.txt` only
- MIME Types: `text/plain` only

### Validation Patterns

The system includes comprehensive pattern matching for:

- Malicious content detection
- Script format validation
- Suspicious content identification

## Integration

The validation system is integrated into the Uploader component and provides:

- Pre-upload validation
- Real-time feedback
- Automatic file rejection for security issues
- User choice for format warnings

## Testing

Run the test suite to verify validation functionality:

```bash
npm test FileValidator.spec.js
```

The tests cover:

- Basic file validation
- Security pattern detection
- Script format validation
- Error handling
