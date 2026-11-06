import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recipe, applyRecipe, encodeRecipe, decodeRecipe, shuffleStyle } from '../src/playground.mjs';
import { decodeConfig } from '../src/transfer.mjs';
import { normalizeConfig } from '../src/config.mjs';
import { readmeModel } from '../src/readme-model.mjs';
import { generateReadme } from '../src/readme.mjs';
import { renderThumbnail } from '../src/thumbnail.mjs';
import { summarize } from '../src/stats.mjs';
import { readFileSync } from 'node:fs';
import { SaxesParser } from 'saxes';

const input = { login: 'private-name', locale: 'pt-BR', header: { name: 'Private Person', headline: 'Private Bio' },
  contacts: [{ label: 'Private Contact', url: 'mailto:private@example.org' }], content: { skills: ['My skill'] },
  widgets: [{ id: 'private-company', type: 'header', title: 'Private Section' }], appearance: { family: 'orbital', motion: 'none' } };
test('style recipes exclude profile content, contact details and custom widget titles/ids', () => {
  const encoded = encodeRecipe(input);
  const decoded = JSON.stringify(decodeConfig(encoded));
  assert.doesNotMatch(decoded, /private-name|Private Person|Private Bio|Private Contact|private@example|Private Section|private-company|My skill/);
  const applied = applyRecipe(input, decodeRecipe(encoded));
  assert.equal(applied.header.name, input.header.name);
  assert.equal(applied.contacts[0].url, input.contacts[0].url);
  assert.equal(applied.appearance.family, 'orbital');
  assert.deepEqual(recipe(applied), decodeRecipe(encoded));
  assert.throws(() => applyRecipe(input, { recipeVersion: 2 }), /incompatível/);
});
test('seeded mixes are reproducible, respect every lock and preserve content', () => {
  assert.deepEqual(shuffleStyle(input, 'oficina-01'), shuffleStyle(input, 'oficina-01'));
  const locked = shuffleStyle(input, 'a new recipe', { world: true, colors: true, layout: true, motion: true });
  const original = normalizeConfig(input);
  assert.equal(locked.appearance.family, original.appearance.family);
  assert.equal(locked.theme, original.theme);
  assert.equal(locked.appearance.motion, 'none');
  assert.deepEqual(locked.widgets, original.widgets);
  assert.deepEqual(locked.layout, original.layout);
  assert.deepEqual(locked.header, original.header);
  assert.deepEqual(locked.content, original.content);
  assert.deepEqual(locked.contacts, original.contacts);
  assert.equal(locked.locale, original.locale);
  assert.throws(() => shuffleStyle(input, ''), /semente/);
});
test('Markdown preview model and export use the same ordered user text and locale labels', () => {
  const data = { login: 'a', locale: 'en', header: { name: '<script>text</script>' }, content: { skills: ['TypeScript'], learning: ['Databases'] },
    projects: [{ repo: 'tool', summary: 'A tool' }], widgets: [{ type: 'header' }, { type: 'now' }, { type: 'skills' }, { type: 'projects' }] };
  const model = readmeModel(data), markdown = generateReadme(data);
  assert.equal(model[0].text, '<script>text</script>');
  assert.match(markdown, /&lt;script&gt;/);
  assert.ok(model.find((block) => block.kind === 'label' && block.text === 'Learning'));
  assert.match(markdown, /\*\*Learning\*\*/);
  assert.ok(markdown.indexOf('Databases') < markdown.indexOf('TypeScript'));
  assert.match(generateReadme({ ...data, locale: 'pt-BR' }), /\*\*Estudando\*\*/);
});
test('gallery thumbnails compose actual header/project/contact widgets with well-formed XML', () => {
  const example = JSON.parse(readFileSync(new URL('../examples/diagnostic-profile.json', import.meta.url)));
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url)));
  const thumbnail = renderThumbnail(normalizeConfig({ ...example, preset: 'workshop' }), summarize(fixture));
  const parser = new SaxesParser(); let svgs = 0;
  parser.on('opentag', (tag) => { if (tag.name === 'svg') svgs++; });
  parser.write(thumbnail).close();
  assert.equal(svgs, 4);
  assert.match(thumbnail, /FleetLink/);
});
