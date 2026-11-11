// The by-year charts on the numbers page: hover, tap, slide a finger along or arrow-key to a year
// and the readout under the chart gives its numbers. One tab stop per chart
// (roving tabindex), like the who-talks timeline on film pages.
export function setUpYearCharts() {
	for (const chart of document.querySelectorAll<HTMLElement>('[data-year-chart]')) {
		const readout = chart.querySelector<HTMLElement>('[data-year-readout]');
		const bars = chart.querySelector<HTMLElement>('.years');
		const years = [...chart.querySelectorAll<HTMLButtonElement>('.years button')];
		if (!readout || !bars || !years.length) continue;

		const show = (year: HTMLButtonElement) => {
			for (const y of years) {
				y.setAttribute('aria-pressed', String(y === year));
				y.tabIndex = y === year ? 0 : -1;
			}
			readout.textContent = year.dataset.says ?? '';
		};

		// A finger anywhere on the chart picks the nearest year, and sliding along
		// it scrubs: a year is a few pixels wide on phones. Mice keep hover.
		const showNearest = (e: PointerEvent) => {
			if (e.pointerType === 'mouse') return;
			const distance = (y: HTMLElement) => {
				const r = y.getBoundingClientRect();
				return Math.abs(r.left + r.width / 2 - e.clientX);
			};
			show(years.reduce((best, y) => (distance(y) < distance(best) ? y : best)));
		};
		bars.addEventListener('pointerdown', showNearest);
		bars.addEventListener('pointermove', (e) => e.buttons && showNearest(e));

		years.forEach((year, i) => {
			year.addEventListener('mouseenter', () => show(year));
			year.addEventListener('focus', () => show(year));
			year.addEventListener('click', () => show(year));
			year.addEventListener('keydown', (e) => {
				const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: years.length - 1 }[e.key];
				if (next === undefined) return;
				e.preventDefault();
				years[Math.max(0, Math.min(years.length - 1, next))].focus();
			});
		});
	}
}
