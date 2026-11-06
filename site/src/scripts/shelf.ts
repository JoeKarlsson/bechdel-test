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
	const moreWrap = document.querySelector<HTMLElement>('[data-shelf-more-wrap]');
	const more = document.querySelector<HTMLButtonElement>('[data-shelf-more]');
	if (!form || !shelf || !count || !empty || !clear || !moreWrap || !more) return;

	const tapes = [...shelf.querySelectorAll<HTMLElement>('li')];
	const total = tapes.length;
	// Browsing shows a page at a time; searching or filtering shows every match
	const pageSize = Number(shelf.dataset.pageSize ?? 60);
	let limit = pageSize;

	const update = () => {
		const data = new FormData(form);
		const q = String(data.get('q') ?? '').trim().toLowerCase();
		const show = String(data.get('show') ?? 'all');
		const sort = String(data.get('sort') ?? 'popularity') as Sort;

		const sorted = [...tapes].sort(comparators[sort] ?? comparators.popularity);
		shelf.append(...sorted);

		const browsing = !q && show === 'all';
		let matched = 0;
		let passing = 0;
		for (const tape of sorted) {
			const pass = num(tape, 'score') === 3;
			const matches =
				(show === 'all' || (show === 'pass' ? pass : !pass)) &&
				(!q || (tape.dataset.title ?? '').includes(q) || (tape.dataset.director ?? '').includes(q));
			if (matches) {
				matched++;
				if (pass) passing++;
			}
			tape.hidden = !matches || (browsing && matched > limit);
		}
		const visible = browsing ? Math.min(limit, matched) : matched;
		const left = matched - visible;

		count.textContent =
			visible === total ? `All ${total} films, ${passing} pass` : browsing ? `Showing ${visible} of ${total}, ${passing} pass in all` : `Showing ${matched} of ${total}, ${passing} pass`;
		empty.hidden = matched > 0;
		moreWrap.hidden = left === 0;
		more.textContent = `Show ${Math.min(pageSize, left)} more`;
	};

	form.addEventListener('input', () => {
		limit = pageSize;
		update();
	});
	more.addEventListener('click', () => {
		const firstNew = tapes.filter((t) => !t.hidden).length;
		limit += pageSize;
		update();
		// Move focus to the first newly shown film, so keyboard users land there
		shelf.querySelectorAll<HTMLElement>('li:not([hidden]) a')[firstNew]?.focus();
	});
	form.addEventListener('submit', (e) => e.preventDefault());
	clear.addEventListener('click', () => {
		form.reset();
		limit = pageSize;
		update();
		form.querySelector('input')?.focus();
	});
	form.hidden = false;
	update();
}
