import { renderHook } from '@testing-library/react';
import useDocumentTitle from './useDocumentTitle';

describe('useDocumentTitle', () => {
	it('should update document title', () => {
		const title = 'Test Title';
		renderHook(() => useDocumentTitle(title));
		expect(document.title).toBe(title);
	});

	it('should update document title when title changes', () => {
		const { rerender } = renderHook(
			({ title: hookTitle }) => useDocumentTitle(hookTitle),
			{ initialProps: { title: 'Initial Title' } }
		);

		expect(document.title).toBe('Initial Title');

		rerender({ title: 'Updated Title' });
		expect(document.title).toBe('Updated Title');
	});
});
