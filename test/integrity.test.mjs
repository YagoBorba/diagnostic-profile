import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fetchUser } from '../src/github.mjs';
import { normalizeConfig, resolveProjects } from '../src/config.mjs';
import { buildAssets } from '../src/build.mjs';
import { summarize } from '../src/stats.mjs';
import { renderSpectrum } from '../src/widgets/spectrum.mjs';
import { resolveTheme } from '../src/themes.mjs';

const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url), 'utf8'));
function repo(owner, name, stars = 1) {
  return { name, nameWithOwner: owner + '/' + name, url: 'https://github.com/' + owner + '/' + name, isPrivate: false,
    owner: { login: owner }, stargazerCount: stars, pushedAt: '2026-10-30T00:00:00Z',
    languages: { edges: [{ size: 100, node: { name: 'Go', color: '#00ADD8' } }], pageInfo: { hasNextPage: false, endCursor: null } } };
}
const response = (data, status = 200, headers = {}) => new Response(JSON.stringify({ data }), { status, headers });

test('fetchUser follows repository and language cursors and includes the 101st repository', async () => {
  const first = fixture();
  first.pinnedItems.nodes = [];
  first.repositories = { totalCount: 101, nodes: Array.from({ length: 100 }, (_, i) => repo(first.login, 'repo-' + i)),
    pageInfo: { hasNextPage: true, endCursor: 'page-2' } };
  first.repositories.nodes[0].languages.pageInfo = { hasNextPage: true, endCursor: 'lang-2' };
  const second = fixture();
  second.repositories = { totalCount: 101, nodes: [repo(first.login, 'repo-100', 42)], pageInfo: { hasNextPage: false, endCursor: null } };
  const calls = [];
  const user = await fetchUser(first.login, 'test-token', { fetchImpl: async (_, options) => {
    const { query, variables } = JSON.parse(options.body);
    calls.push(variables);
    if (query.includes('query Languages')) return response({ repository: { languages: {
      edges: [{ size: 50, node: { name: 'Rust', color: '#dea584' } }], pageInfo: { hasNextPage: false } } } });
    return response({ user: variables.after ? second : first });
  } });
  const summary = summarize(user);
  assert.equal(summary.totals.stars, 142);
  assert.equal(summary.totals.repositories, 101);
  assert.equal(summary.languages.find((l) => l.name === 'Rust').size, 50);
  assert.equal(calls.length, 3);
});

test('foreign pinned projects retain their identity, URL and metadata', async () => {
  const user = fixture();
  user.repositories.nodes = [repo(user.login, 'tool', 1)];
  user.pinnedItems.nodes = [repo('another-owner', 'tool', 123)];
  const config = normalizeConfig({ login: user.login });
  const summary = summarize(user);
  const projects = resolveProjects(config, summary);
  assert.equal(projects[0].repo, 'another-owner/tool');
  assert.equal(projects[0].url, 'https://github.com/another-owner/tool');
  const files = buildAssets(config, summary);
  assert.match(files['project-another-owner-tool-dark.svg'], /123/);
  assert.match(files['README.snippet.md'], /github.com\/another-owner\/tool/);
  assert.equal(summary.totals.stars, 1);
});

test('explicit projects outside owned repositories are fetched without changing profile totals', async () => {
  const user = fixture();
  user.repositories = { totalCount: 0, nodes: [], pageInfo: { hasNextPage: false } };
  user.pinnedItems.nodes = [];
  const fetched = await fetchUser(user.login, 'test-token', { projects: [{ repo: 'org/library' }], fetchImpl: async (_, options) => {
    const { query } = JSON.parse(options.body);
    return query.includes('query Repository') ? response({ repository: repo('org', 'library', 99) }) : response({ user });
  } });
  assert.equal(summarize(fetched).totals.stars, 0);
  assert.equal(summarize(fetched).repos['org/library'].stargazerCount, 99);
});

test('network failures retry within bounds and never disclose the token', async () => {
  let calls = 0;
  await assert.rejects(fetchUser('a', 'very-secret', {
    fetchImpl: async () => { calls += 1; throw new Error('very-secret'); }, sleep: async () => {},
  }), (error) => error.code === 'NETWORK' && !error.message.includes('very-secret'));
  assert.equal(calls, 3);
});
test('authentication errors are not retried', async () => {
  let calls = 0;
  await assert.rejects(fetchUser('a', 'secret', { fetchImpl: async () => { calls += 1; return response(null, 401); } }), /invalid or expired/);
  assert.equal(calls, 1);
});
test('rate limits with long retry-after fail promptly', async () => {
  await assert.rejects(fetchUser('a', 'secret', { fetchImpl: async () => response(null, 429, { 'retry-after': '3600' }), sleep: async () => assert.fail('must not wait an hour') }), /rate limit/);
});
test('GraphQL partial errors reject rather than publish incomplete data', async () => {
  await assert.rejects(fetchUser('a', 'secret', { fetchImpl: async () => new Response(JSON.stringify({ data: { user: fixture() }, errors: [{ message: 'Missing permission' }] })) }), /Missing permission/);
});
test('repeated pagination cursors fail rather than loop forever', async () => {
  const user = fixture();
  user.pinnedItems.nodes = [];
  user.repositories = { totalCount: 200, nodes: [repo(user.login, 'one')], pageInfo: { hasNextPage: true, endCursor: 'same' } };
  await assert.rejects(fetchUser(user.login, 'secret', { fetchImpl: async () => response({ user }) }), /invalid repository cursor/);
});
test('private explicitly selected projects cannot leak into generated assets', async () => {
  const user = fixture();
  user.repositories = { totalCount: 0, nodes: [], pageInfo: { hasNextPage: false } };
  user.pinnedItems.nodes = [];
  await assert.rejects(fetchUser(user.login, 'secret', { projects: [{ repo: 'org/private' }], fetchImpl: async (_, options) => {
    const { query } = JSON.parse(options.body);
    return query.includes('query Repository') ? response({ repository: { ...repo('org', 'private'), isPrivate: true } }) : response({ user });
  } }), /Private project/);
});

test('config rejects incorrect types with field paths instead of internal TypeErrors', () => {
  for (const input of [null, [], 3]) assert.throws(() => normalizeConfig(input), /config must be an object/);
  assert.throws(() => normalizeConfig({ login: 'a', header: { readouts: {} }, telemetry: { languageLimit: 'abc' } }),
    (e) => e.message.includes('header.readouts') && e.message.includes('telemetry.languageLimit') && !e.message.includes('.map'));
  for (const limit of [0, -1, 1.2, 11]) assert.throws(() => normalizeConfig({ login: 'a', telemetry: { languageLimit: limit } }), /languageLimit/);
});
test('contact and project filename collisions are rejected', () => {
  assert.throws(() => normalizeConfig({ login: 'a', contacts: [
    { label: 'Mail', url: 'mailto:a@example.com' }, { label: 'Mail', url: 'mailto:b@example.com' },
  ] }), /unique filename/);
  assert.throws(() => normalizeConfig({ login: 'a', contacts: [{ id: '🔥', label: 'Fire', url: 'https://example.com' }] }), /nonempty/);
  assert.throws(() => normalizeConfig({ login: 'a', projects: [{ repo: 'a.b' }, { repo: 'a-b' }] }), /duplicate output filename/);
});
test('unsafe protocols and control characters are rejected', () => {
  assert.throws(() => normalizeConfig({ login: 'a', contacts: [{ label: 'Link', url: 'javascript:alert(1)' }] }), /valid/);
  assert.throws(() => normalizeConfig({ login: 'a', header: { name: 'A\u0001B' } }), /control/);
});
test('snippet escapes base URL attributes', () => {
  const config = normalizeConfig({ login: 'a', assetsBaseUrl: 'https://example.com/"data-review="value/' });
  const snippet = buildAssets(config, summarize(fixture()))['README.snippet.md'];
  assert.doesNotMatch(snippet, /srcset="https:[^"]*"data-review=/);
  assert.match(snippet, /&quot;data-review=&quot;/);
});
test('empty contribution calendars have a true zero peak without invalid geometry', () => {
  const svg = renderSpectrum(resolveTheme('amber', 'dark'), [{ start: '2026-10-25', count: 0 }]);
  assert.match(svg, /Peak week: 0 contributions/);
  assert.doesNotMatch(svg, /NaN|Infinity/);
});
