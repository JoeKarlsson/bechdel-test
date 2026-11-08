// The by-year charts on the numbers page: hover, tap or arrow-key to a year
// and the readout under the chart gives its numbers. One tab stop per chart
// (roving tabindex), like the who-talks timeline on film pages.
export function setUpYearCharts() {
	for (const chart of document.querySelectorAll<HTMLElement>('[data-year-chart]')) {
		const readout = chart.querySelector<HTMLElement>('[data-year-readout]');
		const years = [...chart.querySelectorAll<HTMLButtonElement>('.years button')];
		if (!readout) continue;

		const show = (year: HTMLButtonElement) => {
			for (const y of years) {
				y.setAttribute('aria-pressed', String(y === year));
				y.tabIndex = y === year ? 0 : -1;
			}
			readout.textContent = year.dataset.says ?? '';
		};

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
