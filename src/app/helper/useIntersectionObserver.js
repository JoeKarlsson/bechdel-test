import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for intersection observer to detect when elements come into view
 * @param {Object} options - Intersection observer options
 * @param {number} options.threshold - Threshold for intersection (0-1)
 * @param {string} options.rootMargin - Root margin for intersection
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once
 * @returns {Object} - { ref, isIntersecting }
 */
const useIntersectionObserver = (options = {}) => {
	const {
		threshold = 0.1,
		rootMargin = '0px 0px -50px 0px',
		triggerOnce = true
	} = options;

	const [isIntersecting, setIsIntersecting] = useState(false);
	const [hasIntersected, setHasIntersected] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				const isElementIntersecting = entry.isIntersecting;
				setIsIntersecting(isElementIntersecting);

				if (isElementIntersecting && !hasIntersected) {
					setHasIntersected(true);
				}
			},
			{
				threshold,
				rootMargin
			}
		);

		observer.observe(element);

		return () => {
			observer.unobserve(element);
		};
	}, [threshold, rootMargin, hasIntersected]);

	// Return the appropriate intersection state based on triggerOnce setting
	const shouldAnimate = triggerOnce ? hasIntersected : isIntersecting;

	return { ref, isIntersecting: shouldAnimate };
};

export default useIntersectionObserver;
