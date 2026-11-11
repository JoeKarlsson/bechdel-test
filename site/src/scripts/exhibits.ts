// Exhibits fold under their titles: open on wide screens, closed on phones,
// so a phone gets a list of one-line summaries to open instead of eighteen
// screens of text. Each title becomes a button inside its <h3> (a heading in a
// <summary> is dropped by JAWS and TalkBack) and the body hides with
// hidden="until-found", so find-in-page still opens it. Without JavaScript
// every exhibit stays open, with no button that does nothing.
// Also runs the Her side / His side switch on the comparison exhibit.
import { motionKind } from './motion';

export function setUpExhibits() {
	const startOpen = !window.matchMedia('(max-width: 600px)').matches;
	for (const title of document.querySelectorAll<HTMLElement>('h3[data-fold]')) {
		const body = document.getElementById(title.dataset.fold ?? '');
		if (!body) throw new Error(`No fold body for ${title.id}`);
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'fold-button';
		button.append(...title.childNodes);
		title.append(button);
		const setOpen = (open: boolean) => {
			if (open) body.removeAttribute('hidden');
			else body.setAttribute('hidden', 'until-found');
			button.setAttribute('aria-expanded', String(open));
		};
		setOpen(startOpen);
		button.addEventListener('click', () => setOpen(body.hasAttribute('hidden')));
		// Find-in-page opens the body itself; the button follows
		body.addEventListener('beforematch', () => button.setAttribute('aria-expanded', 'true'));
	}
	if (!startOpen) document.documentElement.classList.add('folded');
	// The folds animate only from here on: one style read lands the first
	// state, so phones don't watch them close on load
	document.body.getBoundingClientRect();
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
