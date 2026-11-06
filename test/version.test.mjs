import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { VERSION, ACTION_REF, SCHEMA_URL } from '../src/version.mjs';
import { generateWorkflow } from '../src/workflow.mjs';
import { exportConfig } from '../src/transfer.mjs';
import { starterConfig } from '../src/catalog.mjs';
test('package, schema exports and generated Action references share one release version', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
  assert.equal(pkg.version, VERSION);
  assert.equal(lock.version, VERSION);
  assert.equal(lock.packages[''].version, VERSION);
  assert.ok(generateWorkflow({ login: 'a' }).includes(ACTION_REF));
  assert.equal(exportConfig({ login: 'a' }).$schema, SCHEMA_URL);
  assert.equal(starterConfig('a').$schema, SCHEMA_URL);
});
