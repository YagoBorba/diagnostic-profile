import assert from 'node:assert/strict';
import { test } from 'node:test';
import { unzipSync, strFromU8 } from 'fflate';
import { generateReadme, createReadmeKit } from '../src/readme.mjs';
import { PRESETS, PRESET_GUIDE } from '../src/presets.mjs';
import { zipFiles } from '../src/transfer.mjs';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

test('standalone README uses declared content and never introduces fixture statistics or image services', () => {
  const text = generateReadme({ login: 'new-user', preset: 'resume', header: { name: 'Júlia 山田', headline: 'Backend engineer' },
    content: { skills: ['Go', 'Rust'], timeline: ['2026: First job'] }, projects: [{ repo: 'lib', summary: 'A library' }],
    contacts: [{ label: 'Email', url: 'mailto:hello@example.org' }] });
  assert.match(text, /^# Júlia 山田/);
  assert.match(text, /https:\/\/github.com\/new-user\/lib/);
  assert.match(text, /mailto:hello@example.org/);
  assert.ok(text.indexOf('Tecnologias') < text.indexOf('Trajetória'));
  assert.doesNotMatch(text, /Ada|Mercer|fleetlink|stars|contributions|\.svg|raw\.githubusercontent|<img|<picture/);
  const beginner = generateReadme({ login: 'new-user', projects: [] });
  assert.equal(beginner, '# new-user\n');
  assert.match(generateReadme({ login: 'new-user' }), /new-user\?tab=repositories/);
});

test('README treats Markdown and HTML in names, titles and links as text', () => {
  const text = generateReadme({ login: 'a', header: { name: '<img src=x onerror=alert(1)>\n# PWN', headline: '[click](javascript:alert(1))' },
    projects: [{ repo: 'a/repo', title: '![bad](https://example.org)', url: 'https://example.org/a b/<x>' }],
    content: { skills: ['`code` | **bold**'] }, widgets: [{ type: 'header' }, { type: 'skills' }, { type: 'projects' }] });
  assert.doesNotMatch(text, /<img|\n# PWN|!\[bad\]|\*\*bold\*\*/);
  assert.match(text, /&lt;img/);
  assert.ok(text.includes('\\[click\\]'));
  assert.ok(text.includes('https://example.org/a%20b/%3Cx%3E'));
  assert.throws(() => generateReadme({ login: 'a', contacts: [{ label: 'X', url: 'javascript:alert(1)' }] }), /URL/);
});

test('empty, disabled and data-only widgets do not produce a misleading download', () => {
  const config = { login: 'a', projects: [], widgets: [{ type: 'telemetry' }, { type: 'heatmap' }, { type: 'header', enabled: false }, { type: 'skills' }] };
  assert.equal(generateReadme(config), '');
  assert.throws(() => createReadmeKit(config), /Habilite/);
  const ordered = generateReadme({ login: 'a', content: { learning: ['Databases'], skills: ['SQL'] }, widgets: [
    { id: 'one', type: 'divider' }, { type: 'now', title: 'Em andamento' }, { id: 'two', type: 'divider' }, { type: 'skills' },
  ] });
  assert.equal((ordered.match(/---/g) ?? []).length, 2);
  assert.ok(ordered.indexOf('Em andamento') < ordered.indexOf('Tecnologias'));
  assert.doesNotMatch(generateReadme({ login: 'a', layout: { headings: false }, content: { skills: ['SQL'] }, widgets: [{ type: 'skills' }] }), /##/);
});

test('manual README ZIP has no workflow, fictional previews or credentials', () => {
  const files = createReadmeKit({ login: 'real-user', token: 'secret-not-exported' });
  const archive = unzipSync(zipFiles(files));
  assert.deepEqual(Object.keys(archive).sort(), ['INSTALL.txt', 'README.md']);
  const contents = Object.values(archive).map(strFromU8).join('\n');
  assert.doesNotMatch(contents, /secret-not-exported|Ada Mercer|fleetlink/);
  assert.match(files['INSTALL.txt'], /real-user\/real-user/);
});

test('each template explains its purpose and works for a user without activity or contacts', () => {
  assert.equal(Object.keys(PRESETS).length, 10);
  assert.deepEqual(Object.keys(PRESET_GUIDE), Object.keys(PRESETS));
  for (const preset of Object.keys(PRESETS)) {
    assert.ok(PRESET_GUIDE[preset].category);
    assert.match(generateReadme({ login: 'new-user', preset, projects: [] }), /^# new-user/);
  }
});

test('Pages publication is manual, restricted to released main and uses pinned Actions', () => {
  const workflow = parse(readFileSync(new URL('../.github/workflows/studio-pages.yml', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch']);
  assert.equal(workflow.jobs.build.if, "github.ref == 'refs/heads/main'");
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.deepEqual(workflow.jobs.deploy.permissions, { pages: 'write', 'id-token': 'write' });
  assert.equal(workflow.jobs.deploy.needs, 'build');
  for (const job of Object.values(workflow.jobs)) for (const step of job.steps) {
    if (step.uses) assert.match(step.uses, /^actions\/[a-z-]+@[a-f0-9]{40}$/);
  }
  assert.equal(workflow.jobs.build.steps.find((s) => s.uses?.startsWith('actions/upload-pages-artifact@')).with.path, 'dist/site');
});
