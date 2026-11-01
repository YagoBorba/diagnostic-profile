import assert from 'node:assert/strict';
import { test } from 'node:test';
import { esc, niceCeil, wrap } from '../src/svg.mjs';

test('esc escapes markup characters', () => {
  assert.equal(esc('<a href="x">R&D</a>'), '&lt;a href=&quot;x&quot;&gt;R&amp;D&lt;/a&gt;');
});

test('wrap breaks on words and truncates with an ellipsis', () => {
  assert.deepEqual(wrap('one two three four', 9, 3), ['one two', 'three', 'four']);
  const lines = wrap('alpha beta gamma delta epsilon zeta', 11, 2);
  assert.equal(lines.length, 2);
  assert.ok(lines[1].endsWith('…'));
});

test('niceCeil rounds up to a readable scale', () => {
  assert.equal(niceCeil(0), 10);
  assert.equal(niceCeil(204), 250);
  assert.equal(niceCeil(701), 1000);
  assert.equal(niceCeil(1500), 2000);
});
