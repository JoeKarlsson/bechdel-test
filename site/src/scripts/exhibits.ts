// Exhibits are <details open> so everything shows without JavaScript and on
// wide screens. On phones they start closed, so the page is a list of
// one-line summaries to open instead of eighteen screens of text.
// Also runs the Her side / His side switch on the comparison exhibit.
import { motionKind } from './motion';

export function setUpExhibits() {
	const folds = document.querySelectorAll<HTMLDetailsElement>('details[data-fold]');
	if (window.matchMedia('(max-width: 600px)').matches) {
		for (const fold of folds) fold.open = false;
		document.documentElement.classList.add('folded');
	}
	// The folds animate only from here on: one style read lands the closed
	// state first, so they don't animate shut on load, and their + marks
	// skip straight to the end of the crossfade that read started
	folds[0]?.getBoundingClientRect();
	for (const sign of document.querySelectorAll('details[data-fold] > summary .fold-mark > span')) for (const a of sign.getAnimations()) a.finish();
	document.documentElement.dataset.foldsReady = '';

	const sw = document.querySelector<HTMLElement>('[data-side-switch]');
	const split = document.querySelector<HTMLElement>('[data-split]');
	if (!sw || !split) return;
	const buttons = [...sw.querySelectorAll<HTMLButtonElement>('button')];
	const show = (side: string) => {
		split.dataset.show = side;
		for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.side === side));
	};
	// A press fades the other side in (opacity only, so reduced motion on a
	// finger keeps it); the first show() on load doesn't animate
	for (const b of buttons)
		b.addEventListener('click', () => {
			const side = b.dataset.side ?? 'w';
			if (side === split.dataset.show) return;
			show(side);
			if (motionKind() === 'none') return;
			for (const cell of split.querySelectorAll<HTMLElement>(`.split-cell.${side}`)) cell.animate({ opacity: [0.001, 1] }, { duration: 160, easing: 'ease-out' });
		});
	sw.hidden = false;
	show('w');
}
