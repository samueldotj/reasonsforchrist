import type { ImageMetadata } from 'astro';

// Every image in src/assets/covers/ is picked up automatically —
// books.json only needs the filename (e.g. "my-book.jpg").
const covers = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/covers/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true }
);

export function getCover(filename: string): ImageMetadata {
  const entry = covers[`../assets/covers/${filename}`];
  if (!entry) {
    throw new Error(
      `Cover image "${filename}" not found in src/assets/covers/. ` +
        `Available: ${Object.keys(covers).join(', ')}`
    );
  }
  return entry.default;
}

const assets = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true }
);

export function getAsset(filename: string): ImageMetadata {
  const entry = assets[`../assets/${filename}`];
  if (!entry) {
    throw new Error(`Image "${filename}" not found in src/assets/.`);
  }
  return entry.default;
}
