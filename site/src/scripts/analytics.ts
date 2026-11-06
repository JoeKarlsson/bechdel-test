// Plausible (self-hosted, as on joekarlsson.com and Punc). No cookies, no
// personal data. Skipped for bots and headless browsers. Also reports 404s
// and script errors as events, so broken links and crashes show up.
type Plausible = ((event: string, options?: { props?: Record<string, string> }) => void) & { q?: unknown[] };

declare global {
	interface Window {
		plausible?: Plausible;
	}
}

const isBot =
	navigator.webdriver ||
	/bot|crawl|spider|scrape|headless|lighthouse/i.test(navigator.userAgent) ||
	!navigator.languages ||
	navigator.languages.length === 0;

if (!isBot) {
	// Queue events until the script arrives
	const queue: Plausible = window.plausible ?? (((...args: unknown[]) => (queue.q = queue.q ?? []).push(args)) as Plausible);
	window.plausible = queue;

	const s = document.createElement('script');
	s.defer = true;
	s.dataset.domain = 'bechdel.joekarlsson.com';
	s.src = 'https://plausible.joekarlsson.io/js/script.tagged-events.outbound-links.js';
	document.head.appendChild(s);

	if (document.body.dataset.notFound) queue('404', { props: { path: location.pathname + location.hash } });

	const report = (message: unknown) =>
		queue('JS Error', { props: { message: String(message).slice(0, 200), path: location.pathname } });
	window.addEventListener('error', (e) => report(e.message));
	window.addEventListener('unhandledrejection', (e) => report(e.reason instanceof Error ? e.reason.message : e.reason));
}

export {};
