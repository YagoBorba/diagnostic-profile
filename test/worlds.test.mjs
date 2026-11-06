import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { SaxesParser } from 'saxes';
import { unzipSync, strFromU8 } from 'fflate';
import { normalizeConfig } from '../src/config.mjs';
import { buildAssets } from '../src/build.mjs';
import { FAMILIES } from '../src/families.mjs';
import { WIDGETS } from '../src/catalog.mjs';
import { summarize } from '../src/stats.mjs';
import { manualProfile, createVisualKit } from '../src/manual.mjs';
import { zipFiles } from '../src/transfer.mjs';
const example = JSON.parse(readFileSync(new URL('../examples/diagnostic-profile.json', import.meta.url)));
const fixture = JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url)));
const now = new Date('2026-10-31T12:00:00Z');
const worlds = Object.keys(FAMILIES).filter((id) => FAMILIES[id].world);

test('family contract preserves every committed v0.1 SVG widget in its default configuration', () => {
  const config = normalizeConfig({ ...example, widgets: WIDGETS.map((w) => ({ id: w.id, type: w.id })) });
  const files = buildAssets(config, summarize(fixture, config.telemetry), now);
  for (const [name, svg] of Object.entries(files).filter(([n]) => n.endsWith('.svg'))) {
    assert.equal(svg.replace(/\r\n/g, '\n'), readFileSync(new URL('../docs/preview/' + name, import.meta.url), 'utf8').replace(/\r\n/g, '\n'), name);
  }
});

test('six worlds render every widget in both widths and locales with bounded text geometry', () => {
  for (const family of worlds) for (const type of ['compact', 'standard']) for (const locale of ['en', 'pt-BR']) {
    const config = normalizeConfig({ ...example, locale, appearance: { family, motion: 'none' }, layout: { type }, widgets: WIDGETS.map((w) => ({ id: w.id, type: w.id })) });
    const files = buildAssets(config, summarize(fixture), now);
    for (const [name, svg] of Object.entries(files).filter(([n]) => n.endsWith('.svg'))) {
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
      const parser = new SaxesParser();
      let width, height;
      parser.on('opentag', (tag) => {
        if (tag.name === 'svg') { width = Number(tag.attributes.width); height = Number(tag.attributes.height); }
        if (tag.name === 'text') {
          assert.ok(Number(tag.attributes.x) >= 0 && Number(tag.attributes.x) <= width, family + '/' + name);
          assert.ok(Number(tag.attributes.y) >= 0 && Number(tag.attributes.y) < height, family + '/' + name);
        }
      });
      parser.write(svg).close();
    }
  }
});

test('worlds have distinct project, contact and footer structures with the same monochrome content', () => {
  const output = worlds.map((family) => buildAssets(normalizeConfig({ ...example, theme: 'monochrome', appearance: { family, motion: 'none' } }), summarize(fixture), now));
  for (const name of ['header-dark.svg', 'project-fleetlink-dark.svg', 'contact-email-dark.svg', 'footer-dark.svg']) {
    assert.equal(new Set(output.map((files) => files[name])).size, 6, name);
  }
  assert.match(output[2]['header-dark.svg'], /<ellipse/);
  assert.match(output[4]['header-dark.svg'], /stroke-width="2"/);
});

test('manual kit never imports fictional API data, statistics or credentials and resolves all image paths', () => {
  const input = { login: 'real-user', preset: 'orbital', token: 'do-not-export', header: { name: 'Júlia 山田', headline: 'My own text' },
    projects: [{ repo: 'real-user/tool', title: 'My tool', summary: 'My project', tags: ['Go'] }], contacts: [{ label: 'Contact', url: 'https://example.org' }],
    widgets: WIDGETS.map((w) => ({ id: w.id, type: w.id })) };
  const files = createVisualKit(input, now);
  const archive = unzipSync(zipFiles(files));
  assert.ok(archive['README.md']);
  assert.equal(JSON.parse(files['manifest.json']).source, 'manual');
  assert.doesNotMatch(Object.values(files).join('\n'), /Ada Mercer|FleetLink|do-not-export|telemetry-dark|heatmap-dark|spectrum-dark/);
  assert.match(files['README.md'], />Yago Borba<\/a>/);
  for (const [, name] of files['README.md'].matchAll(/\.\/assets\/([a-z0-9-]+\.svg)/g)) assert.ok(archive['assets/' + name], name);
  assert.equal(strFromU8(archive['README.md']), files['README.md']);
  const profile = manualProfile({ login: 'new-user' });
  assert.deepEqual(profile.config.projects, []);
  assert.equal(profile.data.source, 'manual');
  assert.equal(profile.warnings.length, 2);
  assert.throws(() => createVisualKit({ login: 'a', widgets: [{ type: 'telemetry' }] }, now), /bloco/);
});
