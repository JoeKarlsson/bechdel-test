// The reduced-motion rule in global.css can't reach element.animate(), so
// scripted motion asks first
export const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
