// Builds the Trinity Explained front end into dist/trinity, from the same trinity commit that
// Cargo.lock pins for the Rust API (api/handler.rs). Runs after `astro build`.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
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

console.log(`Trinity Explained ${rev.slice(0, 7)} built into dist/trinity`);
