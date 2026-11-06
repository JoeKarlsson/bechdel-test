import type { ImageMetadata } from 'astro';

// Posters and backdrops downloaded by scripts/fetch-images.mjs. Astro turns
// these into sized AVIF/WebP files at build time.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/films/*.jpg', { eager: true });

const find = (id: string, kind: 'poster' | 'backdrop') => files[`../assets/films/${id}-${kind}.jpg`]?.default ?? null;

export const posterFor = (id: string) => find(id, 'poster');
export const backdropFor = (id: string) => find(id, 'backdrop');
