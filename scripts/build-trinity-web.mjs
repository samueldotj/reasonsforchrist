// Builds the Trinity Explained front end into dist/trinity, from the same trinity commit that
// Cargo.lock pins for the Rust API (api/handler.rs). Runs after `astro build`.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const work = resolve(root, '.trinity');
const outDir = resolve(root, 'dist', 'trinity');
const repo = 'https://github.com/samueldotj/trinity.git';

// npm and npx are .cmd scripts on Windows, which only start through a shell.
const run = (cmd, args, cwd = root) =>
  execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' && cmd !== 'git' });

// The commit Cargo.lock pins for trinity-core.
const lock = readFileSync(resolve(root, 'Cargo.lock'), 'utf8');
const match = lock.match(/source = "git\+https:\/\/github\.com\/samueldotj\/trinity\.git[^#"]*#([0-9a-f]{40})"/);
if (!match) throw new Error('Cargo.lock has no trinity-core git source. Run `cargo generate-lockfile`.');
const rev = match[1];

// Shallow fetch of exactly that commit.
if (!existsSync(resolve(work, '.git'))) {
  mkdirSync(work, { recursive: true });
  run('git', ['init', '--quiet'], work);
  run('git', ['remote', 'add', 'origin', repo], work);
}
run('git', ['fetch', '--quiet', '--depth', '1', 'origin', rev], work);
run('git', ['checkout', '--quiet', '--force', rev], work);

const web = resolve(work, 'web');
run('npm', ['ci', '--no-audit', '--no-fund'], web);
rmSync(outDir, { recursive: true, force: true });
run('npx', ['vite', 'build', '--base', '/trinity/', '--outDir', outDir, '--emptyOutDir'], web);

// Google Analytics, with the same PUBLIC_GA_ID as the Astro pages (src/layouts/Layout.astro).
// Trinity routes by hash (#/screen?query), which GA drops from page paths, so each screen is
// sent as its own page_view at /trinity/screen?query.
const gaId = process.env.PUBLIC_GA_ID;
if (gaId) {
  if (!/^G-[A-Z0-9]+$/.test(gaId)) throw new Error(`PUBLIC_GA_ID "${gaId}" is not a GA4 measurement ID (G-XXXXXXX).`);
  const snippet = `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', '${gaId}', { send_page_view: false });
  (function () {
    var last;
    function view() {
      var path = location.pathname + location.hash.replace(/^#\\/?/, '');
      if (path === last) return;
      last = path;
      // After the app's own hashchange handler has set document.title.
      setTimeout(function () {
        gtag('event', 'page_view', { page_location: location.origin + path, page_title: document.title });
      }, 0);
    }
    window.addEventListener('hashchange', view);
    window.addEventListener('load', view);
  })();
</script>
`;
  const indexHtml = resolve(outDir, 'index.html');
  writeFileSync(indexHtml, readFileSync(indexHtml, 'utf8').replace('</head>', `${snippet}</head>`));
  console.log('Added Google Analytics to dist/trinity');
}

console.log(`Trinity Explained ${rev.slice(0, 7)} built into dist/trinity`);
