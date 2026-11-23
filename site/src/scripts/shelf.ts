// Search, filter, sort and page through the shelf on the home page. The HTML
// holds only the first page of tapes; the first time someone uses the shelf,
// every film loads from /shelf.json as data. A tape is copied from the page's
// template only when its film is about to show, and the shelf only ever holds
// the tapes on screen. Without JavaScript the first page shows, with a link to every film.

import { posterFor } from '../lib/images';
import { closest, squash, titleKeys } from '../lib/search.mjs';
import { motionKind } from './motion';
import { track } from './track';

type Sort = 'popularity' | 'score' | 'new' | 'old' | 'az';
type ShelfFilm = { slug: string; title: string; year: number | null; director: string; score: number; popularity: number; poster: string | null; change?: true };

const n = (x: number) => x.toLocaleString('en-US');
const comparators: Record<Sort, (a: ShelfFilm, b: ShelfFilm) => number> = {
	popularity: (a, b) => a.popularity - b.popularity,
	score: (a, b) => b.score - a.score || a.popularity - b.popularity,
	new: (a, b) => (b.year ?? 0) - (a.year ?? 0),
	old: (a, b) => (a.year ?? 0) - (b.year ?? 0),
	az: (a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
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
	if (film.change) tape.dataset.change = '';
	tape.querySelector('a')!.href = `/films/${film.slug}/`;
	const img = tape.querySelector<HTMLImageElement>('img.poster');
	const poster = posterFor(film.poster);
	if (img && poster) {
		Object.assign(img, { src: poster.src, srcset: poster.srcset, loading: 'lazy' });
	} else if (img) {
		// No poster: the title on a blank box, as the component draws it
		const blank = document.createElement('span');
		const inner = document.createElement('span');
		// Astro scopes the component's styles with an astro-* class; the new spans need it too
		const scope = [...img.classList].filter((c) => c.startsWith('astro-'));
		blank.classList.add('blank', ...scope);
		inner.classList.add(...scope);
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
	const suggest = document.querySelector<HTMLElement>('[data-shelf-suggest]');
	const status = document.querySelector<HTMLElement>('[data-shelf-status]');
	const search = document.querySelector<HTMLElement>('[data-shelf-search]');
	if (!search || !form || !shelf || !template || !count || !empty || !clear || !moreWrap || !more || !suggest || !status) return;
	const suggestLink = suggest.querySelector('a')!;

	// Each film's title and director squashed once, so "madmax" finds Mad Max
	const keys = new WeakMap<ShelfFilm, string[]>();
	const keysOf = (film: ShelfFilm) => {
		let k = keys.get(film);
		if (!k) keys.set(film, (k = [squash(film.title), squash(film.director)]));
		return k;
	};

	// Tapes are made once, when their film first shows; the ones in the HTML are reused
	const tapeOf = new Map([...shelf.querySelectorAll<HTMLElement>('li')].map((t) => [t.dataset.slug!, t]));
	const tapeFor = (film: ShelfFilm) => {
		let tape = tapeOf.get(film.slug);
		if (!tape) tapeOf.set(film.slug, (tape = makeTape(template, film)));
		return tape;
	};

	let films: ShelfFilm[] = [];
	const sortedBy = new Map<Sort, ShelfFilm[]>();
	const sorted = (sort: Sort) => {
		let list = sortedBy.get(sort);
		if (!list) sortedBy.set(sort, (list = [...films].sort(comparators[sort] ?? comparators.popularity)));
		return list;
	};
	const total = Number(shelf.dataset.total ?? tapeOf.size);
	// Browsing, searching and filtering all show a page at a time: putting
	// hundreds of tapes on screen at once made each keystroke take a second on phones
	const pageSize = Number(shelf.dataset.pageSize ?? 60);
	let limit = pageSize;

	// Every film, fetched once, as data
	let loading: Promise<void> | null = null;
	// The shelf dims while the films load (CSS waits 200 ms, so a fast load never shows it)
	const loadAll = () =>
		(loading ??= (shelf.setAttribute('aria-busy', 'true'), fetch('/shelf.json'))
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<ShelfFilm[]>;
			})
			.then((all) => {
				films = all;
			})
			.catch((error) => {
				loading = null;
				count.textContent = `Couldn't load the rest of the shelf (${error.message}). Try again, or see every film A to Z.`;
				throw error;
			})
			.finally(() => shelf.removeAttribute('aria-busy')));
	// Start the download as soon as someone heads for the controls, not on their first keystroke
	const warm = () => loadAll().catch(() => {});
	form.addEventListener('pointerenter', warm, { once: true });
	form.addEventListener('focusin', warm, { once: true });

	// Tapes the visitor just asked for slide up row by row (the first eight rows
	// only). Reduced motion on a finger fades them in together instead. They
	// start at 0.001, not 0: Chromium skips drawing a layer that starts at 0.
	const dealIn = (list: HTMLElement[]) => {
		const kind = motionKind();
		if (!list.length || kind === 'none') return;
		const cols = getComputedStyle(shelf).gridTemplateColumns.split(' ').length;
		const root = getComputedStyle(document.documentElement);
		const easing = root.getPropertyValue('--ease-enter');
		const duration = parseFloat(root.getPropertyValue('--duration-enter'));
		list.slice(0, cols * 8).forEach((tape, i) =>
			tape.animate(
				kind === 'fade' ? { opacity: [0.001, 1] } : { opacity: [0.001, 1], translate: ['0 8px', '0 0'] },
				{ duration: kind === 'fade' ? 150 : duration, delay: kind === 'fade' ? 0 : Math.floor(i / cols) * 30, easing, fill: 'backwards' },
			),
		);
	};
	const update = () => {
		const data = new FormData(form);
		const typed = String(data.get('q') ?? '').trim();
		const q = squash(typed);
		const show = String(data.get('show') ?? 'all');
		const sort = String(data.get('sort') ?? 'popularity') as Sort;

		const browsing = !q && show === 'all';
		let matched = 0;
		let passing = 0;
		const onScreen: HTMLElement[] = [];
		for (const film of sorted(sort)) {
			const pass = film.score === 3;
			const shown = show === 'all' || (show === 'change' ? film.change === true : show === 'pass' ? pass : !pass);
			if (!shown || (q && !keysOf(film).some((k) => k.includes(q)))) continue;
			matched++;
			if (pass) passing++;
			if (matched <= limit) onScreen.push(tapeFor(film));
		}
		shelf.replaceChildren(...onScreen);
		const visible = Math.min(limit, matched);
		const left = matched - visible;

		count.textContent =
			visible === total
				? `All ${n(total)} films, ${n(passing)} pass`
				: browsing
					? `Showing ${n(visible)} of ${n(total)}, ${n(passing)} pass in all`
					: left > 0
						? `Showing ${n(visible)} of ${n(matched)} matches, ${n(passing)} pass`
						: matched === 0
							? 'No films match'
							: `${n(matched)} ${matched === 1 ? 'film matches' : 'films match'}, ${n(passing)} pass`;
		// The empty message below says it already; the text stays for the screen reader announcement
		count.hidden = matched === 0;
		announce();
		empty.hidden = matched > 0;
		// Nothing matched: offer the nearest title, if one is close
		const near = matched === 0 && typed ? closest(typed, films, (f) => titleKeys(f.title)) : null;
		suggest.hidden = !near;
		if (near) {
			suggestLink.href = `/films/${near.slug}/`;
			suggestLink.textContent = near.title;
		}
		moreWrap.hidden = left === 0;
		more.textContent = `Show ${Math.min(pageSize, left)} more`;
		saveToAddress(typed, show, sort);
		reportSearch(q, matched);
	};
	// One Shelf Search event per search someone settles on (typing paused a
	// second), not per keystroke; the words typed are never sent
	let searchTimer: number | undefined;
	let lastSearch = '';
	const reportSearch = (q: string, matched: number) => {
		clearTimeout(searchTimer);
		if (!q) lastSearch = '';
		if (!q || q === lastSearch) return;
		searchTimer = window.setTimeout(() => {
			lastSearch = q;
			track('Shelf Search', { results: matched === 0 ? 'none' : 'some' });
		}, 1000);
	};
	// The search, filter and sort live in the address, so Back, a refresh or a shared link keeps them
	const saveToAddress = (typed: string, show: string, sort: Sort) => {
		const params = new URLSearchParams();
		if (typed) params.set('q', typed);
		if (show !== 'all') params.set('show', show);
		if (sort !== 'popularity') params.set('sort', sort);
		const query = params.toString();
		history.replaceState(history.state, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
	};
	// Screen readers hear the count once typing pauses, not on every key
	let announceTimer: number | undefined;
	const announce = () => {
		clearTimeout(announceTimer);
		announceTimer = window.setTimeout(() => (status.textContent = count.textContent), 500);
	};

	// Every change first makes sure the whole shelf is loaded
	const refresh = () => loadAll().then(update, () => {});

	// Typing waits for a short pause before the shelf updates; Show and Sort update at once
	let typingTimer: number | undefined;
	form.addEventListener('input', (e) => {
		limit = pageSize;
		clearTimeout(typingTimer);
		if (e.target instanceof HTMLSelectElement) {
			// Sort and Show crossfade the old shelf into the new one; typing doesn't, or it would flicker on every key
			loadAll().then(
				() => (motionKind() !== 'none' && document.startViewTransition ? document.startViewTransition(update) : update()),
				() => {},
			);
		} else {
			typingTimer = window.setTimeout(refresh, 150);
		}
	});
	more.addEventListener('click', async () => {
		track('Show More');
		const firstNew = Math.min(limit, shelf.childElementCount);
		limit += pageSize;
		await refresh();
		const shown = [...shelf.children] as HTMLElement[];
		dealIn(shown.slice(firstNew));
		// Move focus to the first newly shown film, so keyboard users land there
		shown[firstNew]?.querySelector('a')?.focus();
	});
	form.addEventListener('submit', (e) => e.preventDefault());
	clear.addEventListener('click', () => {
		clearTimeout(typingTimer);
		form.reset();
		limit = pageSize;
		refresh();
		form.querySelector('input')?.focus();
	});
	search.hidden = false;
	// The page arrives sorted by popularity with nothing filtered: only the
	// "Show more" button needs setting up until someone uses the shelf
	moreWrap.hidden = total <= pageSize;
	more.textContent = `Show ${Math.min(pageSize, total - pageSize)} more`;

	// Arriving with a search in the address: fill the form from it and run it
	const fromAddress = new URLSearchParams(location.search);
	let restored = false;
	for (const name of ['q', 'show', 'sort']) {
		const value = fromAddress.get(name);
		const control = form.elements.namedItem(name);
		if (value === null || !(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) continue;
		// A select given a value it has no option for goes blank, which would filter the shelf to nothing sensible
		if (control instanceof HTMLSelectElement && ![...control.options].some((o) => o.value === value)) continue;
		control.value = value;
		restored = true;
	}
	if (restored) refresh();
}
