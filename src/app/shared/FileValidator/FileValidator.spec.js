import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileValidator } from ".";

describe('FileValidator', () => {
	let validator;

	beforeEach(() => {
		validator = new FileValidator();
	});

	describe('Basic file validation', () => {
		it('should reject files without proper extension', async () => {
			const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
			const result = await validator.validateFile(file);

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('File type not supported. Only .txt files are allowed.');
		});

		it('should reject files that are too large', async () => {
			const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
			const file = new File([largeContent], 'test.txt', { type: 'text/plain' });
			const result = await validator.validateFile(file);

			expect(result.isValid).toBe(false);
			expect(result.errors.some(error => error.includes('too large'))).toBe(true);
		});

		it('should reject files that are too small', async () => {
			const file = new File(['x'], 'test.txt', { type: 'text/plain' });
			const result = await validator.validateFile(file);

			expect(result.isValid).toBe(false);
			expect(result.errors.some(error => error.includes('too small'))).toBe(true);
		});

		it('should accept valid text files', async () => {
			const scriptContent = `INT. LIVING ROOM - DAY

JOHN sits on the couch, reading a book.

JOHN
Hello, this is a test script.

MARY enters the room.

MARY
Hi John, how are you?

JOHN
I'm doing well, thank you.`;

			const file = new File([scriptContent], 'test.txt', { type: 'text/plain' });
			const result = await validator.validateFile(file);

			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});

	describe('Security validation', () => {
		it('should reject files with malicious content', async () => {
			// Pad content to meet minimum size requirement (100 bytes)
			const maliciousContent = `<script>alert('xss')</script>` + ' '.repeat(100);
			const file = new File([maliciousContent], 'test.txt', { type: 'text/plain' });
			const result = await validator.validateFile(file);

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('File contains potentially malicious content');
		});

		it('should reject files with command injection patterns', async () => {
			// Pad content to meet minimum size requirement (100 bytes)
			const maliciousContent = `; rm -rf /important` + ' '.repeat(100);
			const file = new File([maliciousContent], 'test.txt', { type: 'text/plain' });
			const result = await validator.validateFile(file);

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('File contains potentially malicious content');
		});
	});

	describe('Script format validation', () => {
		it('should warn about files that may not be proper scripts', async () => {
			// Content must be at least 100 bytes to pass size validation
			const nonScriptContent = `This is just a regular text file without any script formatting. It contains no scene headings, character names, or dialogue that would indicate it's a movie script. This is just random prose.`;
			const file = new File([nonScriptContent], 'test.txt', { type: 'text/plain' });
			const result = await validator.validateFile(file);

			expect(result.isValid).toBe(true); // Should still be valid
			expect(result.warnings.length).toBeGreaterThan(0);
			expect(result.warnings.some(warning => warning.includes('script format') || warning.includes('short'))).toBe(true);
		});
	});
});
