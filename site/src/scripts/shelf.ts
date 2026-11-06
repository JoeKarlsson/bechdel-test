// Search, filter and sort for the shelf on the home page. The page works
// without this: every film is listed and the controls stay hidden.

type Sort = 'popularity' | 'score' | 'new' | 'old' | 'az';

const num = (el: HTMLElement, key: string) => Number(el.dataset[key] ?? 0);

const comparators: Record<Sort, (a: HTMLElement, b: HTMLElement) => number> = {
	popularity: (a, b) => num(a, 'popularity') - num(b, 'popularity'),
	score: (a, b) => num(b, 'score') - num(a, 'score') || num(a, 'popularity') - num(b, 'popularity'),
	new: (a, b) => num(b, 'year') - num(a, 'year'),
	old: (a, b) => num(a, 'year') - num(b, 'year'),
	az: (a, b) => (a.dataset.title ?? '').localeCompare(b.dataset.title ?? ''),
};

export function setUpShelf() {
	const form = document.querySelector<HTMLFormElement>('[data-shelf-controls]');
	const shelf = document.querySelector<HTMLElement>('[data-shelf]');
	const count = document.querySelector<HTMLElement>('[data-shelf-count]');
	const empty = document.querySelector<HTMLElement>('[data-shelf-empty]');
	const clear = document.querySelector<HTMLButtonElement>('[data-shelf-clear]');
	if (!form || !shelf || !count || !empty || !clear) return;

	const tapes = [...shelf.querySelectorAll<HTMLElement>('li')];
	const total = tapes.length;

	const update = () => {
		const data = new FormData(form);
		const q = String(data.get('q') ?? '').trim().toLowerCase();
		const show = String(data.get('show') ?? 'all');
		const sort = String(data.get('sort') ?? 'popularity') as Sort;

		let shown = 0;
		let passing = 0;
		for (const tape of tapes) {
			const pass = num(tape, 'score') === 3;
			const matches =
				(show === 'all' || (show === 'pass' ? pass : !pass)) &&
				(!q || (tape.dataset.title ?? '').includes(q) || (tape.dataset.director ?? '').includes(q));
			tape.hidden = !matches;
			if (matches) {
				shown++;
				if (pass) passing++;
			}
		}
		shelf.append(...[...tapes].sort(comparators[sort] ?? comparators.popularity));

		count.textContent = shown === total ? `All ${total} films, ${passing} pass` : `Showing ${shown} of ${total}, ${passing} pass`;
		empty.hidden = shown > 0;
	};

	form.addEventListener('input', update);
	form.addEventListener('submit', (e) => e.preventDefault());
	clear.addEventListener('click', () => {
		form.reset();
		update();
		form.querySelector('input')?.focus();
	});
	form.hidden = false;
}
