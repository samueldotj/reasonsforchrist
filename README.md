# Reasons for Christ

A fast, static website that freely distributes books on the reasons for believing in Christ. Each book can be read free online or purchased in print (Amazon).

Built with [Astro](https://astro.build) + [Tailwind CSS](https://tailwindcss.com), hosted on [Vercel](https://vercel.com).

## Adding a book

1. Add the cover image to `src/assets/covers/` (e.g. `src/assets/covers/my-book.jpg`). Use a 2:3 ratio at roughly **1000×1500px** (anything from 800×1200 up is fine) — Astro automatically generates resized, compressed WebP versions at build time, so there is no need to optimize the file yourself.
2. Add an entry to [`data/books.json`](data/books.json):

   ```json
   {
     "slug": "my-book",
     "title": "My Book Title",
     "subtitle": "Optional subtitle",
     "description": "A short 1-3 sentence description.",
     "coverImage": "my-book.jpg",
     "heyzineUrl": "https://heyzine.com/flip-book/...",
     "amazonUrl": "https://www.amazon.com/dp/...",
     "publishedDate": "2026-08-30"
   }
   ```

   `subtitle`, `amazonUrl`, and `publishedDate` are optional — omit `amazonUrl` if there is no printed edition yet.

3. Commit and push to `main`. Vercel rebuilds and deploys automatically in about a minute.

Removing a book: delete its entry from `books.json` (and its cover image), then push.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # production build to dist/
```
