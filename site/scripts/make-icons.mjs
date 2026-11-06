// Renders the PNG icons from public/favicon.svg. Run after changing the SVG:
// `node scripts/make-icons.mjs`
import sharp from 'sharp';

const svg = new URL('../public/favicon.svg', import.meta.url).pathname;
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname;

for (const [name, size] of [
	['favicon-32.png', 32],
	['apple-touch-icon.png', 180],
	['icon-192.png', 192],
	['icon-512.png', 512],
]) {
	await sharp(svg, { density: 72 * (size / 64) }).resize(size, size).png().toFile(out(name));
	console.log(`wrote ${name}`);
}
