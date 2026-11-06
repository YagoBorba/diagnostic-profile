import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { normalizeConfig } from '../src/config.mjs';
import { buildAssets } from '../src/build.mjs';
import { summarize } from '../src/stats.mjs';
import { FAMILIES } from '../src/families.mjs';
import { WIDGETS } from '../src/catalog.mjs';
import { MONO, SANS } from '../src/themes.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'dist', 'proof');
const example = JSON.parse(await readFile(join(root, 'examples', 'diagnostic-profile.json')));
const fixture = JSON.parse(await readFile(join(root, 'test', 'fixtures', 'user.json')));
let body = '<h1>Diagnostic Profile — revisão visual</h1><p>Dados fictícios. Seis mundos, dois modos, duas larguras e conteúdo normal/extremo. Esta folha permite inspeção humana; não é teste automático de pixels.</p><nav>';
const worlds = Object.entries(FAMILIES).filter(([, family]) => family.world);
body += worlds.map(([id, family]) => '<a href="#' + id + '">' + family.name + '</a>').join(' · ') + '</nav>';
for (const [family, descriptor] of worlds) {
  body += '<h2 id="' + family + '">' + descriptor.name + '</h2>';
  for (const mode of ['dark', 'light']) for (const narrow of [true, false]) for (const extreme of [false, true]) {
    const raw = { ...example, locale: 'pt-BR', appearance: { family, motion: 'none' }, layout: { type: narrow ? 'compact' : 'standard', mode }, widgets: WIDGETS.map((w) => ({ id: w.id, type: w.id })) };
    if (extreme) {
      raw.header = { name: 'W'.repeat(120), headline: '山田 👩🏽‍💻 '.repeat(15), tags: ['W'.repeat(50)] };
      raw.projects = [{ repo: 'a/tool', title: 'W'.repeat(120), summary: 'W'.repeat(400), tags: ['W'.repeat(50)] }];
      raw.contacts = [{ label: 'W'.repeat(40), url: 'https://example.org' }];
      raw.content = { skills: ['W'.repeat(140)], learning: ['Unicode: 山田 👩🏽‍💻'], building: ['A & B <test>'], timeline: ['2026 · ' + 'W'.repeat(120)] };
    }
    const config = normalizeConfig(raw), files = buildAssets(config, summarize(fixture), new Date('2026-10-31T12:00:00Z'));
    const key = [family, mode, narrow ? 'compact' : 'standard', extreme ? 'long' : 'normal'].join('/');
    body += '<h3>' + key + '</h3>';
    for (const [name, svg] of Object.entries(files).filter(([name]) => name.endsWith('-' + mode + '.svg'))) body += '<section class="sample" data-case="' + key + '/' + name + '"><h4>' + name + '</h4>' + svg + '</section>';
  }
}
body += '<footer>Yago Borba · <a href="https://github.com/YagoBorba/diagnostic-profile">Diagnostic Profile</a></footer>';
await mkdir(output, { recursive: true });
await writeFile(join(output, 'styles.css'), 'body{margin:16px;background:#ddd;color:#20241f;font:14px sans-serif}.sample{max-width:960px;margin:24px 0}.sample svg{display:block;max-width:100%;height:auto}h3,h4{font-size:14px}.mono{font-family:' + MONO + '}.sans{font-family:' + SANS + '}.editorial{font-family:Georgia,"Times New Roman",serif}svg *{animation:none!important}nav a{display:inline-block;padding:12px}');
await writeFile(join(output, 'index.html'), '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Diagnostic Profile — revisão visual</title><link rel="stylesheet" href="./styles.css"></head><body>' + body + '</body></html>');
console.log('Visual proof: ' + output);
if (process.argv.includes('--serve')) {
  const server = createServer(async (req, res) => {
    const name = req.url === '/' || req.url === '/index.html' ? 'index.html' : req.url === '/styles.css' ? 'styles.css' : null;
    if (!name) { res.writeHead(404).end(); return; }
    try { res.writeHead(200, { 'Content-Type': name.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(await readFile(join(output, name))); }
    catch { res.writeHead(500).end(); }
  });
  server.listen(4175, '127.0.0.1', () => console.log('Local proof: http://127.0.0.1:4175/'));
}
