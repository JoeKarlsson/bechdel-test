// Plausible (self-hosted, as on joekarlsson.com and Punc). No cookies, no
// personal data. Skipped for bots and headless browsers. Also reports 404s
// and the first script error on each page as events, so broken links and
// crashes show up (errors from browser extensions are skipped).
import { isExtensionNoise } from '../lib/error-noise.mjs';

type Plausible = ((event: string, options?: { props?: Record<string, string> }) => void) & { q?: unknown[] };

declare global {
	interface Window {
		plausible?: Plausible;
		trustedTypes?: { createPolicy: (name: string, rules: { createScriptURL: (url: string) => string }) => { createScriptURL: (url: string) => unknown } };
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
	// Trusted Types (the CSP in Base.astro) lets a script URL through only via this policy, and it passes only this one
	const plausibleURL = 'https://plausible.joekarlsson.io/js/script.tagged-events.outbound-links.js';
	const policy = window.trustedTypes?.createPolicy('plausible', {
		createScriptURL: (url) => {
			if (url !== plausibleURL) throw new Error(`Blocked script URL: ${url}`);
			return url;
		},
	});
	s.src = (policy?.createScriptURL(plausibleURL) ?? plausibleURL) as string;
	document.head.appendChild(s);

	if (document.body.dataset.notFound) queue('404', { props: { path: location.pathname + location.hash } });

	// Only the first error per page: one crash can throw on every frame
	let reported = false;
	const report = (message: unknown, source: string, where: string) => {
		if (reported || isExtensionNoise(message, where, ['plausible'])) return;
		reported = true;
		queue('JS Error', { props: { message: String(message).slice(0, 200), source, path: location.pathname } });
	};
	window.addEventListener('error', (e) => report(e.message, `${e.filename}:${e.lineno}`, `${e.filename} ${e.error?.stack ?? ''}`));
	window.addEventListener('unhandledrejection', (e) =>
		report(e.reason instanceof Error ? e.reason.message : e.reason, 'promise', e.reason instanceof Error ? (e.reason.stack ?? '') : ''),
	);
}

export {};
