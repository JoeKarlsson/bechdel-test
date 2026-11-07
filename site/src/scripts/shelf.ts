// Search, filter, sort and page through the shelf on the home page. The HTML
// holds only the first page of tapes; the first time someone uses the shelf,
// every film loads from /shelf.json and gets a tape copied from the page's
// template. Without JavaScript the first page shows, with a link to every film.

import { posterFor } from '../lib/images';

type Sort = 'popularity' | 'score' | 'new' | 'old' | 'az';
type ShelfFilm = { slug: string; title: string; year: number | null; director: string; score: number; popularity: number; poster: string | null };

const num = (el: HTMLElement, key: string) => Number(el.dataset[key] ?? 0);

const comparators: Record<Sort, (a: HTMLElement, b: HTMLElement) => number> = {
	popularity: (a, b) => num(a, 'popularity') - num(b, 'popularity'),
	score: (a, b) => num(b, 'score') - num(a, 'score') || num(a, 'popularity') - num(b, 'popularity'),
	new: (a, b) => num(b, 'year') - num(a, 'year'),
	old: (a, b) => num(a, 'year') - num(b, 'year'),
	az: (a, b) => (a.dataset.title ?? '').localeCompare(b.dataset.title ?? ''),
};

/** A tape for one film, copied from the page's template so it keeps the component's styles */
export function makeTape(template: HTMLTemplateElement, film: ShelfFilm): HTMLElement {
	const tape = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
	Object.assign(tape.dataset, {
		slug: film.slug,
		title: film.title.toLowerCase(),
		director: film.director.toLowerCase(),
		score: String(film.score),
		year: String(film.year ?? 0),
		popularity: String(film.popularity),
	});
	tape.querySelector('a')!.href = `/films/${film.slug}/`;
	const img = tape.querySelector<HTMLImageElement>('img.poster');
	const poster = posterFor(film.poster);
	if (img && poster) {
		Object.assign(img, { src: poster.src, srcset: poster.srcset, loading: 'lazy' });
	} else if (img) {
		// No poster: the title on a blank box, as the component draws it
		const blank = document.createElement('span');
		const inner = document.createElement('span');
		for (const { name, value } of img.attributes) if (name.startsWith('data-astro-cid')) [blank, inner].forEach((el) => el.setAttribute(name, value));
		blank.className = 'blank';
		blank.setAttribute('aria-hidden', 'true');
		inner.textContent = film.title;
		blank.append(inner);
		img.replaceWith(blank);
	}
	tape.querySelector('.title')!.textContent = film.title;
	const meta = tape.querySelector('.meta')!;
	meta.firstChild!.textContent = `${film.year ?? ''}, ${film.score} of 3`;
	const sticker = tape.querySelector('.sticker')!;
	sticker.classList.toggle('pass', film.score === 3);
	sticker.classList.toggle('fail', film.score !== 3);
	sticker.textContent = film.score === 3 ? 'Passes' : 'Fails';
	return tape;
}

export function setUpShelf() {
	const form = document.querySelector<HTMLFormElement>('[data-shelf-controls]');
	const shelf = document.querySelector<HTMLElement>('[data-shelf]');
	const template = document.querySelector<HTMLTemplateElement>('[data-tape-template]');
	const count = document.querySelector<HTMLElement>('[data-shelf-count]');
	const empty = document.querySelector<HTMLElement>('[data-shelf-empty]');
	const clear = document.querySelector<HTMLButtonElement>('[data-shelf-clear]');
	const moreWrap = document.querySelector<HTMLElement>('[data-shelf-more-wrap]');
	const more = document.querySelector<HTMLButtonElement>('[data-shelf-more]');
	if (!form || !shelf || !template || !count || !empty || !clear || !moreWrap || !more) return;

	let tapes = [...shelf.querySelectorAll<HTMLElement>('li')];
	const total = Number(shelf.dataset.total ?? tapes.length);
	// Browsing shows a page at a time; searching or filtering shows every match
	const pageSize = Number(shelf.dataset.pageSize ?? 60);
	let limit = pageSize;

	// Every film, fetched once; the tapes already on the page are reused
	let loading: Promise<void> | null = null;
	const loadAll = () =>
		(loading ??= fetch('/shelf.json')
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<ShelfFilm[]>;
			})
			.then((films) => {
				const onPage = new Map(tapes.map((t) => [t.dataset.slug, t]));
				tapes = films.map((f) => onPage.get(f.slug) ?? makeTape(template, f));
			})
			.catch((error) => {
				loading = null;
				count.textContent = `Couldn't load the rest of the shelf (${error.message}). Try again, or see every film A to Z.`;
				throw error;
			}));

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
	// Every change first makes sure the whole shelf is loaded
	const refresh = () => loadAll().then(update, () => {});

	form.addEventListener('input', () => {
		limit = pageSize;
		refresh();
	});
	more.addEventListener('click', async () => {
		const firstNew = Math.min(limit, tapes.length);
		limit += pageSize;
		await refresh();
		// Move focus to the first newly shown film, so keyboard users land there
		shelf.querySelectorAll<HTMLElement>('li:not([hidden]) a')[firstNew]?.focus();
	});
	form.addEventListener('submit', (e) => e.preventDefault());
	clear.addEventListener('click', () => {
		form.reset();
		limit = pageSize;
		refresh();
		form.querySelector('input')?.focus();
	});
	form.hidden = false;
	// The page arrives sorted by popularity with nothing filtered: only the
	// "Show more" button needs setting up until someone uses the shelf
	moreWrap.hidden = total <= pageSize;
	more.textContent = `Show ${Math.min(pageSize, total - pageSize)} more`;
}
