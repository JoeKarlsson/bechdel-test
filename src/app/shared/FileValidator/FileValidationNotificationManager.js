/**
 * Enhanced notification system for file validation
 * Provides detailed error messages and helpful guidance
 */

import Notification from '../Notification/Notification';

class FileValidationNotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 3;
    }

    /**
     * Show validation error notification
     * @param {Object} validationResult - Result from FileValidator
     * @param {Function} onClose - Callback when notification is closed
     */
    showValidationError(validationResult, onClose) {
        const { errors, warnings, fileInfo } = validationResult;

        // Show critical errors first
        if (errors.length > 0) {
            this.showErrorNotification(errors, fileInfo, onClose);
        }

        // Show warnings if no critical errors
        if (errors.length === 0 && warnings.length > 0) {
            this.showWarningNotification(warnings, fileInfo, onClose);
        }
    }

    /**
     * Show error notification for critical validation failures
     */
    showErrorNotification(errors, fileInfo, onClose) {
        const notification = {
            type: 'error',
            title: 'File Upload Rejected',
            message: this.formatErrorMessage(errors, fileInfo),
            duration: 0, // Don't auto-dismiss
            persistent: true,
            actionText: 'Learn More',
            onActionClick: () => this.showHelpDialog(errors),
            onClose: onClose
        };

        this.addNotification(notification);
    }

    /**
     * Show warning notification for non-critical issues
     */
    showWarningNotification(warnings, fileInfo, onClose) {
        const notification = {
            type: 'warning',
            title: 'File Upload Warning',
            message: this.formatWarningMessage(warnings, fileInfo),
            duration: 8000,
            persistent: false,
            actionText: 'Proceed Anyway',
            onActionClick: () => {
                this.removeNotification(notification);
                onClose && onClose();
            },
            onClose: onClose
        };

        this.addNotification(notification);
    }

    /**
     * Format error message with helpful details
     */
    formatErrorMessage(errors, fileInfo) {
        let message = `The file "${fileInfo.name}" was rejected:\n\n`;

        errors.forEach((error, index) => {
            message += `• ${error}\n`;
        });

        message += '\nPlease check the file requirements and try again.';

        return message;
    }

    /**
     * Format warning message with helpful details
     */
    formatWarningMessage(warnings, fileInfo) {
        let message = `The file "${fileInfo.name}" has some issues:\n\n`;

        warnings.forEach((warning, index) => {
            message += `• ${warning}\n`;
        });

        message += '\nYou can proceed, but the results may not be accurate.';

        return message;
    }

    /**
     * Show help dialog with detailed information
     */
    showHelpDialog(errors) {
        const helpContent = this.getHelpContent(errors);

        // Create a modal-like notification with help content
        const helpNotification = {
            type: 'info',
            title: 'File Requirements Help',
            message: helpContent,
            duration: 0,
            persistent: true,
            actionText: 'Got It',
            onActionClick: () => this.removeNotification(helpNotification)
        };

        this.addNotification(helpNotification);
    }

    /**
     * Get help content based on error types
     */
    getHelpContent(errors) {
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

        return helpContent;
    }

    /**
     * Add notification to the list
     */
    addNotification(notification) {
        this.notifications.push(notification);

        // Limit the number of notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.shift();
        }
    }

    /**
     * Remove notification from the list
     */
    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    /**
     * Get all current notifications
     */
    getNotifications() {
        return this.notifications;
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications = [];
    }
}

export default FileValidationNotificationManager;
