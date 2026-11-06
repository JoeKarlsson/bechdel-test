// The old site used hash routes (/#/film/<id>, /#/about). Browsers never send
// the hash to the server, so every old link lands on the home page; this sends
// it on to the new page. The id-to-slug map is a JSON block on the home page.
const OLD_PAGES: Record<string, string> = {
	'/': '/',
	'/films': '/',
	'/about': '/about/',
	'/case-study': '/case-study/',
	'/privacy': '/privacy/',
	'/api-docs': '/about/',
	'/film/new': '/',
};

export function legacyTarget(hash: string, slugs: Record<string, string>): string | null {
	if (!hash.startsWith('#/')) return null;
	const route = hash.slice(1).split('?')[0].replace(/\/+$/, '') || '/';
	const film = route.match(/^\/film\/([a-f0-9]{24})$/);
	if (film) return slugs[film[1]] ? `/films/${slugs[film[1]]}/` : '/';
	return OLD_PAGES[route] ?? '/';
}

const data = document.getElementById('legacy-film-slugs');
if (data && location.hash.startsWith('#/')) {
	const target = legacyTarget(location.hash, JSON.parse(data.textContent ?? '{}'));
	if (target && target !== location.pathname + location.hash) location.replace(target);
}
