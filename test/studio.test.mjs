import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020.js';
import { SaxesParser } from 'saxes';
import { unzipSync, strFromU8 } from 'fflate';
import { parse } from 'yaml';
import { normalizeConfig } from '../src/config.mjs';
import { buildAssets } from '../src/build.mjs';
import { summarize } from '../src/stats.mjs';
import { PRESETS, resolvePreset } from '../src/presets.mjs';
import { WIDGETS } from '../src/catalog.mjs';
import { contrastRatio } from '../src/design.mjs';
import { resolveTheme, paletteNames } from '../src/themes.mjs';
import { encodeConfig, decodeConfig, exportConfig, zipFiles } from '../src/transfer.mjs';
import { generateWorkflow } from '../src/workflow.mjs';
import { createInstallationKit } from '../src/kit.mjs';
import { wrap, textColumns } from '../src/svg.mjs';

const example = JSON.parse(readFileSync(new URL('../examples/diagnostic-profile.json', import.meta.url), 'utf8'));
const user = JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url), 'utf8'));
const now = new Date('2026-10-31T12:00:00Z');
const schema = JSON.parse(readFileSync(new URL('../schema/diagnostic-profile.schema.json', import.meta.url), 'utf8'));
const validateSchema = new Ajv2020().compile(schema);
const input = (overrides = {}) => ({ ...example, ...overrides, content: { skills: ['Go', 'Rust'], learning: ['Distributed systems'], building: ['A tool'], timeline: ['2026 · First project'] } });

test('diagnostic telemetry distinguishes period activity from current snapshot totals', () => {
  const config = normalizeConfig(input());
  const files = buildAssets(config, summarize(user), now);
  for (const mode of ['dark', 'light']) {
    const svg = files['telemetry-' + mode + '.svg'];
    const parser = new SaxesParser();
    const text = [];
    parser.on('text', (value) => text.push(value));
    parser.write(svg).close();
    const labels = text.join(' ');
    assert.match(labels, /GITHUB OVERVIEW/);
    assert.match(labels, /CONTRIBUTIONS · 12 MO/);
    for (const name of ['COMMITS', 'PULL REQUESTS', 'ISSUES']) assert.match(labels, new RegExp(name + ' LAST 12 MONTHS'));
    for (const name of ['STARS', 'PUBLIC REPOS', 'FOLLOWERS']) assert.match(labels, new RegExp(name + ' CURRENT TOTAL'));
    assert.match(labels, /issues in the last 12 months\. Current totals:/);
    assert.doesNotMatch(labels, /STARS EARNED|GitHub telemetry for the last 12 months/);
  }
});

test('every preset and palette exports schema-valid configs and well-formed SVGs', () => {
  for (const preset of Object.keys(PRESETS)) {
    for (const theme of paletteNames) {
      const raw = input({ preset, theme });
      const config = normalizeConfig(raw);
      const exported = JSON.parse(JSON.stringify(exportConfig(raw)));
      assert.ok(validateSchema(exported), JSON.stringify(validateSchema.errors));
      const files = buildAssets(config, summarize(user, config.telemetry), now);
      for (const [name, svg] of Object.entries(files).filter(([n]) => n.endsWith('.svg'))) {
        assert.doesNotThrow(() => new SaxesParser({ xmlns: true }).write(svg).close(), preset + '/' + theme + '/' + name);
        assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
      }
    }
  }
});
test('preset defaults survive omitted values and explicit overrides win', () => {
  const config = normalizeConfig({ login: 'a', preset: 'portfolio', theme: undefined });
  assert.equal(config.theme, 'monochrome');
  assert.equal(config.appearance.family, 'minimal');
  assert.equal(normalizeConfig({ login: 'a', preset: 'portfolio', theme: 'ember' }).theme, 'ember');
  assert.throws(() => normalizeConfig({ login: 'a', preset: '__proto__' }), /preset/);
  assert.throws(() => normalizeConfig({ login: 'a', preset: 'terminal', presetVersion: 2 }), /presetVersion/);
});

test('editing a resolved preset never mutates catalog defaults or another profile', () => {
  const previous = structuredClone(PRESETS);
  const resolved = resolvePreset({ login: 'a', preset: 'terminal' });
  resolved.appearance.motion = 'none';
  resolved.widgets[0].enabled = false;
  assert.deepEqual(PRESETS, previous);
  assert.equal(normalizeConfig({ login: 'b', preset: 'terminal' }).appearance.motion, 'subtle');
  const malicious = resolvePreset(JSON.parse('{"login":"a","preset":"terminal","__proto__":{"poisoned":true}}'));
  assert.equal(Object.getPrototypeOf(malicious), Object.prototype);
  assert.equal(malicious.poisoned, undefined);
});
test('import/export and share links preserve rendered output and discard unsupported credential fields', () => {
  const raw = input({ preset: 'terminal', header: { name: 'Júlia 🛠️ 山田', tags: ['R&D <Lab>'] }, token: 'must-not-export',
    appearance: { colors: { dark: { accent: '#aabbcc', token: 'must-not-export' } } } });
  const imported = decodeConfig(encodeConfig(raw));
  const exported = JSON.stringify(exportConfig(raw));
  assert.doesNotMatch(exported, /must-not-export/);
  assert.equal(imported.header.name, raw.header.name);
  assert.deepEqual(buildAssets(normalizeConfig(raw), summarize(user), now), buildAssets(normalizeConfig(imported), summarize(user), now));
  assert.throws(() => decodeConfig('not a configuration'), /Invalid/);
  assert.throws(() => decodeConfig('a'.repeat(32769)), /Invalid/);
});
test('ZIP installation kit round-trips using an independent ZIP implementation', () => {
  const expected = { 'diagnostic-profile.json': JSON.stringify({ login: 'a', name: 'Júlia 山田' }),
    '.github/workflows/profile.yml': generateWorkflow({ login: 'a' }), 'preview/header-dark.svg': '<svg><text>🛠️</text></svg>' };
  const zip = zipFiles(expected);
  const unpacked = unzipSync(zip);
  assert.deepEqual(Object.fromEntries(Object.entries(unpacked).map(([path, bytes]) => [path, strFromU8(bytes)])), expected);
  for (const name of ['../escape', '/absolute', 'C:/absolute', 'folder\\escape']) assert.throws(() => zipFiles({ [name]: 'bad' }), /Unsafe/);
});
test('widget order, disabled widgets, custom identifiers and text summary affect actual output', () => {
  const config = normalizeConfig(input({ layout: { mode: 'light', textSummary: true }, widgets: [
    { id: 'my-skills', type: 'skills' }, { id: 'main-metrics', type: 'telemetry' }, { id: 'hidden', type: 'header', enabled: false },
  ] }));
  const files = buildAssets(config, summarize(user), now);
  assert.ok(files['my-skills-light.svg']);
  assert.equal(files['hidden-light.svg'], undefined);
  const snippet = files['README.snippet.md'];
  assert.ok(snippet.indexOf('my-skills-light.svg') < snippet.indexOf('main-metrics-light.svg'));
  assert.doesNotMatch(snippet, /<picture>|srcset/);
  assert.match(snippet, /current stars/);
  assert.throws(() => normalizeConfig(input({ widgets: [{ id: 'x', type: 'header' }, { id: 'x', type: 'skills' }] })), /unique/);
});
test('all registered widget types render and reject generated filename collisions', () => {
  const config = normalizeConfig(input({ widgets: WIDGETS.map((w) => ({ id: w.id, type: w.id })) }));
  const files = buildAssets(config, summarize(user), now);
  for (const name of ['skills', 'now', 'heatmap', 'timeline', 'divider']) assert.ok(files[name + '-dark.svg']);
  const collision = normalizeConfig(input({ widgets: [{ id: 'project-fleetlink', type: 'header' }, { id: 'projects', type: 'projects' }] }));
  assert.throws(() => buildAssets(collision, summarize(user), now), /filename collision/);
});
test('compact layout uses narrow SVGs and one-column incorporation; motion can be disabled', () => {
  const config = normalizeConfig(input({ layout: { type: 'compact' }, appearance: { motion: 'none' } }));
  const files = buildAssets(config, summarize(user), now);
  assert.match(files['header-dark.svg'], /width="360"/);
  assert.match(files['telemetry-dark.svg'], /width="360"/);
  assert.match(files['footer-dark.svg'], /width="360"/);
  assert.match(files['project-fleetlink-dark.svg'], /width="360"/);
  assert.match(files['header-dark.svg'], /\*\{animation:none!important\}/);
  assert.doesNotMatch(files['README.snippet.md'], /width="49%"/);
});

test('installation kit renders from the exported configuration in one operation', () => {
  const kit = createInstallationKit(input({ theme: 'violet', layout: { align: 'right', type: 'compact' } }), user, now);
  const config = JSON.parse(kit['diagnostic-profile.json']);
  const expected = buildAssets(normalizeConfig(config), summarize(user, config.telemetry), now);
  assert.equal(kit['preview/header-dark.svg'], expected['header-dark.svg']);
  assert.equal(kit['README.snippet.md'], expected['README.snippet.md']);
  assert.match(kit['README.snippet.md'], /align="right"/);
  assert.match(kit['INSTALL.txt'], /FICTIONAL/);
  assert.equal(kit['header-dark.svg'], undefined);
});
test('default palettes keep primary text and accent readable in both modes', () => {
  for (const palette of paletteNames) for (const mode of ['dark', 'light']) {
    const theme = resolveTheme(palette, mode);
    assert.ok(contrastRatio(theme.text, theme.panel) >= 4.5, palette + '/' + mode + '/text');
    assert.ok(contrastRatio(theme.accent, theme.panel) >= 4.5, palette + '/' + mode + '/accent');
  }
  assert.throws(() => normalizeConfig({ login: 'a', appearance: { colors: { dark: { accent: 'url(javascript:bad)' } } } }), /hex color/);
});
test('generated workflows preserve destination and require credentials only through secret references', () => {
  const config = normalizeConfig({ login: 'a', destination: { repository: 'org/profile-assets', branch: 'profile/output' } });
  assert.equal(config.assetsBaseUrl, 'https://raw.githubusercontent.com/org/profile-assets/profile/output/');
  const workflow = parse(generateWorkflow(config, { configPath: 'config/profile.json', outputDir: 'profile-dist' }));
  assert.deepEqual(workflow.on.push.paths, ['config/profile.json', '.github/workflows/profile.yml']);
  const publish = workflow.jobs.build.steps.at(-1);
  assert.equal(publish.with.repo, 'org/profile-assets');
  assert.equal(publish.with.target_branch, 'profile/output');
  assert.equal(publish.with.build_dir, 'profile-dist');
  assert.equal(publish.with.keep_history, true);
  assert.match(publish.env.GITHUB_TOKEN, /secrets.PROFILE_PUBLISH_TOKEN/);
  for (const branch of ['main', 'develop', 'master', '../main']) assert.throws(() => normalizeConfig({ login: 'a', destination: { branch } }), /destination.branch/);
});

test('destination branch validation agrees with Git for reserved path components', () => {
  for (const branch of ['topic/.hidden', 'topic/a.lock/child', 'name.', 'HEAD']) {
    const git = spawnSync('git', ['check-ref-format', '--branch', branch], { encoding: 'utf8' });
    assert.notEqual(git.status, 0, branch + ' must be rejected by Git');
    assert.throws(() => normalizeConfig({ login: 'a', destination: { branch } }), /destination.branch/);
  }
  for (const branch of ['profile-output', 'assets/2026.11', 'topic/project-lock']) {
    const git = spawnSync('git', ['check-ref-format', '--branch', branch], { encoding: 'utf8' });
    assert.equal(git.status, 0, git.stderr);
    assert.equal(normalizeConfig({ login: 'a', destination: { branch } }).destination.branch, branch);
  }
});
test('long words and grapheme clusters wrap without breaking emoji or exceeding column limits', () => {
  for (const value of ['longword'.repeat(20), '山田開発者'.repeat(10), '👩‍💻'.repeat(20), 'e\u0301'.repeat(40)]) {
    const lines = wrap(value, 16, 10);
    assert.ok(lines.every((line) => textColumns(line) <= 16));
    assert.ok(lines.every((line) => !line.startsWith('\u200d') && !line.endsWith('\u200d')));
  }
});
test('unknown repository data is distinguished from real zero statistics', () => {
  const config = normalizeConfig(input({ projects: [{ repo: 'org/unavailable', title: 'A long project title '.repeat(4) }] }));
  const svg = buildAssets(config, summarize(user), now)['project-org-unavailable-dark.svg'];
  assert.match(svg, /UNKNOWN/);
  assert.match(svg, /★ —/);
  assert.doesNotMatch(svg, /STABLE/);
});
