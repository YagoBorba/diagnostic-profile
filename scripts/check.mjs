import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
async function walk(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await walk(child)); else files.push(child);
  }
  return files;
}
const all = [];
for (const folder of ['src', 'scripts', 'studio', 'test', 'schema', 'examples', 'docs', '.github']) all.push(...await walk(join(root, folder)));
for (const name of ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md', 'package.json']) all.push(join(root, name));
let modules = 0, links = 0;
const errors = [];
for (const path of all) {
  if (path.endsWith('.mjs')) {
    const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    if (result.status !== 0) errors.push(result.stderr || 'Syntax check failed: ' + path);
    modules += 1;
  }
  if (path.endsWith('.json')) {
    try { JSON.parse(await readFile(path, 'utf8')); } catch (error) { errors.push(path + ': ' + error.message); }
  }
  if (path.endsWith('.md')) {
    const content = await readFile(path, 'utf8');
    for (const [, raw] of content.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      const target = raw.split(/\s+"/)[0].replace(/^<|>$/g, '').split('#')[0];
      if (!target || /^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('//')) continue;
      const resolved = target.startsWith('/') ? resolve(root, '.' + target) : resolve(dirname(path), target);
      try { await stat(resolved); links += 1; } catch { errors.push(path + ': missing local link ' + target); }
    }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Checked ' + modules + ' JavaScript modules, JSON files and ' + links + ' local Markdown links.');
