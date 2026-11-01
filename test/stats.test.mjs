import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { languageMix, streaks, summarize } from '../src/stats.mjs';

const day = (date, contributionCount) => ({ date, contributionCount });

test('streaks counts the current run even when today is still empty', () => {
  const days = [day('2026-10-26', 0), day('2026-10-27', 2), day('2026-10-28', 1), day('2026-10-29', 4), day('2026-10-30', 0)];
  assert.deepEqual(streaks(days), { current: 3, longest: 3, bestDay: 4 });
});

test('streaks resets after two empty days', () => {
  const days = [day('2026-10-27', 5), day('2026-10-28', 5), day('2026-10-29', 0), day('2026-10-30', 0)];
  assert.deepEqual(streaks(days), { current: 0, longest: 2, bestDay: 5 });
});

test('streaks handles an empty calendar', () => {
  assert.deepEqual(streaks([]), { current: 0, longest: 0, bestDay: 0 });
});

test('languageMix excludes markup, keeps the top entries and groups the rest', () => {
  const repos = [
    { languages: { edges: [{ size: 600, node: { name: 'Go', color: '#00ADD8' } }, { size: 900, node: { name: 'HTML', color: '#e34c26' } }] } },
    { languages: { edges: [{ size: 300, node: { name: 'Rust', color: '#dea584' } }, { size: 100, node: { name: 'Lua', color: '#000080' } }] } },
  ];
  const mix = languageMix(repos, new Set(['HTML']), 2);
  assert.deepEqual(mix.map((entry) => entry.name), ['Go', 'Rust', 'Other']);
  assert.equal(mix[0].share, 0.6);
  assert.equal(mix[2].color, null);
});

test('summarize derives totals, weekly series and pinned repositories from the fixture', () => {
  const user = JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url), 'utf8'));
  const data = summarize(user);
  assert.equal(data.login, 'ada-mercer');
  assert.equal(data.totals.stars, 184 + 96 + 57 + 41 + 12 + 8);
  assert.equal(data.weekly.length, 52);
  assert.equal(data.pinned[0].name, 'fleetlink');
  assert.ok(data.languages.every((entry) => entry.name !== 'CSS'));
});
