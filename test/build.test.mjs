import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildAssets } from '../src/build.mjs';
import { normalizeConfig } from '../src/config.mjs';
import { summarize } from '../src/stats.mjs';
import { paletteNames } from '../src/themes.mjs';

const user = JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url), 'utf8'));
const example = JSON.parse(readFileSync(new URL('../examples/diagnostic-profile.json', import.meta.url), 'utf8'));
const now = new Date('2026-10-31T12:00:00Z');

function assertBalanced(svg, name) {
  const stack = [];
  const body = svg.replace(/<style>[\s\S]*?<\/style>/, '');
  for (const [, closing, tag, selfClosing] of body.matchAll(/<(\/?)([a-zA-Z][\w:-]*)[^>]*?(\/?)>/g)) {
    if (selfClosing) continue;
    if (closing) {
      assert.equal(stack.pop(), tag, `${name}: unexpected </${tag}>`);
    } else {
      stack.push(tag);
    }
  }
  assert.deepEqual(stack, [], `${name}: unclosed tags`);
}

test('buildAssets renders every widget in both modes for each palette', () => {
  for (const theme of paletteNames) {
    const config = normalizeConfig({ ...example, theme });
    const files = buildAssets(config, summarize(user, config.telemetry), now);
    const svgs = Object.entries(files).filter(([name]) => name.endsWith('.svg'));
    assert.equal(svgs.length, 2 * (4 + config.projects.length + config.contacts.length));
    for (const [name, svg] of svgs) {
      assert.ok(svg.startsWith('<svg'), `${name} starts with <svg`);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${name} has no invalid numbers`);
      assert.match(svg, /<title id="title">[^<]+<\/title>/, `${name} has a title`);
      assertBalanced(svg, name);
    }
  }
});

test('buildAssets falls back to pinned repositories', () => {
  const config = normalizeConfig({ login: 'ada-mercer' });
  const files = buildAssets(config, summarize(user), now);
  assert.ok(files['project-fleetlink-dark.svg']);
  assert.match(files['README.snippet.md'], /github\.com\/ada-mercer\/fleetlink/);
});

test('snippet references every generated asset with dark and light sources', () => {
  const config = normalizeConfig(example);
  const files = buildAssets(config, summarize(user, config.telemetry), now);
  const snippet = files['README.snippet.md'];
  const referenced = [...snippet.matchAll(/output\/([\w-]+)-(dark|light)\.svg/g)].map(([, name, mode]) => `${name}-${mode}.svg`);
  for (const name of new Set(referenced)) {
    assert.ok(files[name], `${name} exists`);
  }
  assert.doesNotMatch(snippet, /srcset="[^"]*,/);
});

test('the header escapes user supplied text', () => {
  const config = normalizeConfig({ ...example, header: { ...example.header, name: 'R&D <Lab>' } });
  const files = buildAssets(config, summarize(user, config.telemetry), now);
  assert.match(files['header-dark.svg'], /R&amp;D &lt;Lab&gt;/);
});
