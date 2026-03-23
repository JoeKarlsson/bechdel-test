import { renderHook } from '@testing-library/react';
import useDocumentTitle from './useDocumentTitle';

describe('useDocumentTitle', () => {
	it('should update document title with suffix', () => {
		const title = 'Test Title';
		renderHook(() => useDocumentTitle(title));
		expect(document.title).toBe('Test Title | bechdel.io');
	});

	it('should update document title when title changes', () => {
		const { rerender } = renderHook(
			({ title: hookTitle }) => useDocumentTitle(hookTitle),
			{ initialProps: { title: 'Initial Title' } }
		);

		expect(document.title).toBe('Initial Title | bechdel.io');

		rerender({ title: 'Updated Title' });
		expect(document.title).toBe('Updated Title | bechdel.io');
	});

	it('should allow title without suffix', () => {
		const title = 'Test Title';
		renderHook(() => useDocumentTitle(title, '', false));
		expect(document.title).toBe('Test Title');
	});
});
