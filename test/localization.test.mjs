import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { normalizeConfig } from '../src/config.mjs';
import { buildAssets } from '../src/build.mjs';
import { summarize } from '../src/stats.mjs';
import { createVisualKit } from '../src/manual.mjs';
import { configErrorMessage } from '../src/i18n.mjs';
const fixture = JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url)));
test('Portuguese legacy labels, metadata, README summaries and kit instructions preserve user text', () => {
  const config = normalizeConfig({ login: 'a', locale: 'pt-BR', header: { name: 'FOLLOWERS', headline: 'STARS' },
    layout: { textSummary: true }, projects: [{ repo: 'fleetlink', summary: 'My English text' }], contacts: [{ label: 'COMMITS', url: 'https://example.org' }] });
  const files = buildAssets(config, summarize(fixture), new Date('2026-10-31T12:00:00Z'));
  assert.match(files['header-dark.svg'], />FOLLOWERS<\/text>/);
  assert.match(files['header-dark.svg'], />STARS<\/text>/);
  assert.match(files['telemetry-dark.svg'], /SEGUIDORES/);
  assert.match(files['telemetry-dark.svg'], /TOTAL ATUAL/);
  assert.match(files['telemetry-dark.svg'], /ÚLTIMOS 12 MESES/);
  assert.match(files['telemetry-dark.svg'], /Panorama GitHub/);
  assert.match(files['README.snippet.md'], /seguidores atuais/);
  assert.match(files['contact-commits-dark.svg'], />COMMITS<\/text>/);
  assert.match(files['project-fleetlink-dark.svg'], /My English text/);
  assert.match(createVisualKit(config)['INSTALL.txt'], /KIT VISUAL ESTÁTICO/);
  assert.match(createVisualKit({ ...config, locale: 'en' })['INSTALL.txt'], /STATIC VISUAL KIT/);
  assert.match(configErrorMessage('Invalid config:\n- "login" is required'), /Preencha "login"/);
});
