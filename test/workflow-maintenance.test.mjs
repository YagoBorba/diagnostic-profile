import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { generateWorkflow } from '../src/workflow.mjs';

const yaml = (path) => parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const step = (steps, action) => steps.find((s) => s.uses?.startsWith(action + '@'));
test('exported installers and repository checks exercise the same pinned publication dependencies', () => {
  const generated = parse(generateWorkflow({ login: 'example' })).jobs.build.steps;
  const smoke = yaml('.github/workflows/profile-smoke.yml').jobs.smoke.steps;
  const pages = yaml('.github/workflows/studio-pages.yml').jobs.build.steps;
  const ci = yaml('.github/workflows/ci.yml').jobs.test.steps;
  for (const steps of [generated, smoke, pages, ci]) {
    assert.equal(step(steps, 'actions/checkout').uses, step(ci, 'actions/checkout').uses);
    assert.equal(step(steps, 'actions/checkout').with['persist-credentials'], false);
  }
  assert.equal(step(generated, 'crazy-max/ghaction-github-pages').uses, step(smoke, 'crazy-max/ghaction-github-pages').uses);
  assert.equal(step(pages, 'actions/upload-pages-artifact').uses, step(ci, 'actions/upload-pages-artifact').uses);
  assert.equal(step(ci, 'actions/upload-pages-artifact').with.name, 'studio-validation');
  assert.equal(step(ci, 'actions/upload-pages-artifact').if, "matrix.os == 'ubuntu-latest' && matrix.node == 22");
  const composite = yaml('action.yml').runs.steps;
  for (const steps of [composite, pages, ci]) {
    assert.equal(step(steps, 'actions/setup-node').uses, step(ci, 'actions/setup-node').uses);
    assert.equal(step(steps, 'actions/setup-node').with['package-manager-cache'], false);
  }
});
