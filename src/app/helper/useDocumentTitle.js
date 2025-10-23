import { useEffect } from 'react';

/**
 * Custom hook for managing document title
 * @param {string} title - The title to set for the document
 * @param {string} suffix - Optional suffix to append (defaults to 'bechdel.io')
 * @param {boolean} includeSuffix - Whether to include the suffix (defaults to true)
 */
const useDocumentTitle = (title, suffix = 'bechdel.io', includeSuffix = true) => {
	useEffect(() => {
		const previousTitle = document.title;

		// Set the new title
		if (title && title.trim() !== '') {
			if (includeSuffix && suffix) {
				document.title = `${title} | ${suffix}`;
			} else {
				document.title = title;
			}
		} else {
			document.title = suffix || 'bechdel.io';
		}

		// Cleanup function to restore previous title when component unmounts
		return () => {
			document.title = previousTitle;
		};
	}, [title, suffix, includeSuffix]);
};

export default useDocumentTitle;
