// The who-talks timeline: hover, tap, slide a finger along or arrow-key to a group of scenes and the
// readout says where they happen and who talks. One tab stop for the whole
// chart (roving tabindex); the arrow keys, Home and End move within it.
type Speaker = { name: string; gender: 'w' | 'm' | null; lines: number };

const el = (tag: string, text: string, className?: string) => {
	const node = document.createElement(tag);
	node.textContent = text;
	if (className) node.className = className;
	return node;
};

export function setUpTimeline() {
	const chart = document.querySelector<HTMLElement>('[data-timeline]');
	const readout = document.querySelector<HTMLElement>('[data-readout]');
	if (!chart || !readout) return;
	const cols = [...chart.querySelectorAll<HTMLButtonElement>('button')];

	const show = (col: HTMLButtonElement) => {
		for (const c of cols) {
			c.setAttribute('aria-pressed', String(c === col));
			c.tabIndex = c === col ? 0 : -1;
		}
		const { from, to, w, m, places } = col.dataset;
		const speakers: Speaker[] = JSON.parse(col.dataset.speakers ?? '[]');

		const title = el('p', from === to ? `Scene ${from}` : `Scenes ${from} to ${to}`, 'readout-title');
		const where = el('p', places ? `Where: ${places}` : 'No scene headings here');
		const counts = document.createElement('p');
		counts.append(el('span', `Women ${w} lines`, 'w'), document.createTextNode(`, men ${m}`));
		// Speakers in their chart colors: pink for women
		const who = document.createElement('p');
		if (speakers.length) {
			who.append('Most lines: ');
			speakers.forEach((s, n) => {
				if (n) who.append(', ');
				who.append(el('span', `${s.name} ${s.lines}`, s.gender === 'w' ? 'w' : ''));
			});
		} else {
			who.textContent = 'Nobody speaks in these scenes';
		}
		readout.replaceChildren(title, where, counts, who);
	};

	// A finger anywhere on the chart picks the nearest group, and sliding along
	// it scrubs: the bars are a few pixels wide on phones. Mice keep hover.
	const showNearest = (e: PointerEvent) => {
		if (e.pointerType === 'mouse') return;
		const distance = (c: HTMLElement) => {
			const r = c.getBoundingClientRect();
			return Math.abs(r.left + r.width / 2 - e.clientX);
		};
		show(cols.reduce((best, c) => (distance(c) < distance(best) ? c : best)));
	};
	chart.addEventListener('pointerdown', showNearest);
	chart.addEventListener('pointermove', (e) => e.buttons && showNearest(e));

	cols.forEach((col, i) => {
		col.addEventListener('mouseenter', () => show(col));
		col.addEventListener('focus', () => show(col));
		col.addEventListener('click', () => show(col));
		col.addEventListener('keydown', (e) => {
			const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: cols.length - 1 }[e.key];
			if (next === undefined) return;
			e.preventDefault();
			cols[Math.max(0, Math.min(cols.length - 1, next))].focus();
		});
	});
}
