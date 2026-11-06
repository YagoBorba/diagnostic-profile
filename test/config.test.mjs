import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeConfig, resolveProjects } from '../src/config.mjs';

test('normalizeConfig fills defaults from the login', () => {
  const config = normalizeConfig({ login: 'octo-dev' });
  assert.equal(config.theme, 'amber');
  assert.equal(config.projects, 'pinned');
  assert.equal(config.header.prompt, '$ scan --target octo-dev');
  assert.equal(config.assetsBaseUrl, 'https://raw.githubusercontent.com/octo-dev/octo-dev/output/');
});

test('normalizeConfig falls back to the provided login', () => {
  assert.equal(normalizeConfig({}, 'from-env').login, 'from-env');
});

test('normalizeConfig reports every problem at once', () => {
  assert.throws(
    () => normalizeConfig({ theme: 'neon', projects: [{}], contacts: [{ label: 'Mail' }] }),
    (error) => {
      assert.match(error.message, /"login" is required/);
      assert.match(error.message, /"theme" must be one of/);
      assert.match(error.message, /projects\[0\]\.repo/);
      assert.match(error.message, /contacts\[0\]/);
      return true;
    },
  );
});

test('normalizeConfig derives contact ids and glyphs', () => {
  const config = normalizeConfig({ login: 'a', contacts: [{ label: 'Stack Overflow', url: 'https://stackoverflow.com' }] });
  assert.equal(config.contacts[0].id, 'stack-overflow');
  assert.equal(config.contacts[0].glyph, 'st');
});

test('resolveProjects uses pinned repositories by default', () => {
  const config = normalizeConfig({ login: 'a' });
  const projects = resolveProjects(config, {
    repos: {},
    pinned: [{ name: 'tool', description: 'A tool.', primaryLanguage: { name: 'Go' }, repositoryTopics: { nodes: [{ topic: { name: 'cli' } }] } }],
  });
  assert.deepEqual(projects, [{ repo: 'tool', title: 'tool', kind: 'Go', summary: 'A tool.', tags: ['cli'], url: 'https://github.com/a/tool' }]);
});
