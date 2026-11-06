import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { writeAssets } from '../src/output.mjs';
import { normalizeConfig } from '../src/config.mjs';
import { configWarnings } from '../src/config-warnings.mjs';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../src/cli.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('./fixtures/user.json', import.meta.url));
async function temporary(t) {
  const path = await mkdtemp(join(tmpdir(), 'diagnostic-profile-test-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}
const run = (cwd, ...args) => execFileSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', env: { ...process.env, GITHUB_TOKEN: '', DP_LOGIN: '' } });

test('unchanged semantic input preserves generated files and timestamp, while force/tampering rebuilds', async (t) => {
  const root = await temporary(t), output = join(root, 'assets');
  const metadata = { inputHash: 'same-semantic-input', version: '0.2.0' };
  const first = await writeAssets(output, { 'header-dark.svg': '<svg>first</svg>' }, metadata);
  await writeFile(join(output, 'notes.txt'), 'unrelated');
  const second = await writeAssets(output, { 'header-dark.svg': '<svg>new timestamp only</svg>' }, metadata);
  assert.equal(second.unchanged, true);
  assert.equal(second.generatedAt, first.generatedAt);
  assert.equal(await readFile(join(output, 'header-dark.svg'), 'utf8'), '<svg>first</svg>');
  await writeAssets(output, { 'header-dark.svg': '<svg>forced</svg>' }, metadata, { force: true });
  assert.equal(await readFile(join(output, 'header-dark.svg'), 'utf8'), '<svg>forced</svg>');
  await writeFile(join(output, 'header-dark.svg'), 'edited');
  const repaired = await writeAssets(output, { 'header-dark.svg': '<svg>repaired</svg>' }, metadata);
  assert.notEqual(repaired.unchanged, true);
  assert.equal(await readFile(join(output, 'notes.txt'), 'utf8'), 'unrelated');
});

test('output publication preserves unrelated and edited files and cleans only unchanged owned assets', async (t) => {
  const root = await temporary(t);
  const dest = join(root, 'dist');
  await writeAssets(dest, { 'header-dark.svg': '<svg/>', 'old-dark.svg': '<svg>old</svg>', 'edited-dark.svg': '<svg>original</svg>' });
  await writeFile(join(dest, 'keep.txt'), 'unrelated');
  await writeFile(join(dest, 'edited-dark.svg'), 'user edit');
  await writeAssets(dest, { 'header-dark.svg': '<svg>new</svg>' });
  assert.equal(await readFile(join(dest, 'header-dark.svg'), 'utf8'), '<svg>new</svg>');
  assert.equal(await readFile(join(dest, 'keep.txt'), 'utf8'), 'unrelated');
  assert.equal(await readFile(join(dest, 'edited-dark.svg'), 'utf8'), 'user edit');
  await assert.rejects(readFile(join(dest, 'old-dark.svg')), { code: 'ENOENT' });
  const manifest = JSON.parse(await readFile(join(dest, 'manifest.json'), 'utf8'));
  assert.equal(manifest.generator, 'diagnostic-profile');
  assert.match(manifest.files['header-dark.svg'], /^[a-f0-9]{64}$/);
  assert.deepEqual((await readdir(root)).sort(), ['dist']);
});
test('failed staging leaves the previous result and unrelated files intact', async (t) => {
  const root = await temporary(t);
  const dest = join(root, 'dist');
  await writeAssets(dest, { 'header-dark.svg': 'original' });
  const previous = await readFile(join(dest, 'manifest.json'), 'utf8');
  await assert.rejects(writeAssets(dest, { 'header-dark.svg': 'replacement' }, {}, { beforePublish: () => { throw new Error('simulated disk failure'); } }), /disk failure/);
  assert.equal(await readFile(join(dest, 'header-dark.svg'), 'utf8'), 'original');
  assert.equal(await readFile(join(dest, 'manifest.json'), 'utf8'), previous);
  assert.deepEqual(await readdir(root), ['dist']);
});
test('unsafe filenames, Git repositories and project-root output are rejected', async (t) => {
  const root = await temporary(t);
  await assert.rejects(writeAssets(join(root, 'dist'), { '../escape.svg': 'bad' }), /Unsafe/);
  await assert.rejects(writeAssets(resolve('.'), { 'header-dark.svg': 'bad' }), /project directory/);
  await mkdir(join(root, 'repo', '.git'), { recursive: true });
  await assert.rejects(writeAssets(join(root, 'repo'), { 'header-dark.svg': 'bad' }), /Git repository/);
});
test('init, validate, doctor, dry-run and build work without a token using a fixture', async (t) => {
  const root = await temporary(t);
  const init = JSON.parse(run(root, 'init', '--login', 'ada-mercer', '--json'));
  assert.equal(JSON.parse(await readFile(init.config, 'utf8')).schemaVersion, 1);
  assert.match(await readFile(init.workflow, 'utf8'), /concurrency:/);
  const valid = JSON.parse(run(root, 'validate', '--json'));
  assert.equal(valid.valid, true);
  const doctor = JSON.parse(run(root, 'doctor', '--fixture', fixture, '--json'));
  assert.equal(doctor.ok, true);
  const dryRun = JSON.parse(run(root, '--fixture', fixture, '--dry-run', '--json'));
  assert.equal(dryRun.dryRun, true);
  await assert.rejects(readFile(join(root, 'dist', 'manifest.json')), { code: 'ENOENT' });
  const built = JSON.parse(run(root, '--fixture', fixture, '--json'));
  assert.ok(built.files.includes('manifest.json'));
  assert.equal(JSON.parse(await readFile(join(root, 'dist', 'manifest.json'), 'utf8')).source, 'fixture');
  const repeatInit = spawnSync(process.execPath, [cli, 'init'], { cwd: root, encoding: 'utf8' });
  assert.equal(repeatInit.status, 1);
  assert.match(repeatInit.stderr, /already exists/);
});
test('validation rejects future schemas and warns about misspelled configuration keys', () => {
  assert.equal(normalizeConfig({ login: 'a' }).schemaVersion, 1);
  assert.throws(() => normalizeConfig({ schemaVersion: 2, login: 'a' }), /schemaVersion/);
  assert.deepEqual(configWarnings({ login: 'a', them: 'amber', header: { tagz: [] } }),
    ['Unknown configuration field: them', 'Unknown configuration field: header.tagz']);
});
test('CLI parsing errors are concise and structured when requested', async (t) => {
  const root = await temporary(t);
  const result = spawnSync(process.execPath, [cli, '--nonexistent', '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stderr).code, 'ERR_PARSE_ARGS_UNKNOWN_OPTION');
  assert.doesNotMatch(result.stderr, /at main|node:internal/);
});
