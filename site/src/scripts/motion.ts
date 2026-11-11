// The reduced-motion rule in global.css can't reach element.animate(), so
// scripted motion asks first. Under reduced motion a mouse gets instant
// changes; a finger gets a short opacity fade, since a change that just
// happens under a thumb reads as a glitch.
export type MotionKind = 'full' | 'fade' | 'none';
export const motionKind = (): MotionKind => {
	if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'full';
	return window.matchMedia('(pointer: coarse)').matches ? 'fade' : 'none';
};
