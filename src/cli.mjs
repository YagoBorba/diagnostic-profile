#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { buildAssets } from './build.mjs';
import { loadConfig, normalizeConfig } from './config.mjs';
import { configWarnings } from './config-warnings.mjs';
import { WIDGETS, starterConfig } from './catalog.mjs';
import { fetchUser } from './github.mjs';
import { writeAssets } from './output.mjs';
import { summarize } from './stats.mjs';
import { paletteNames } from './themes.mjs';
import { generateWorkflow } from './workflow.mjs';
import { PRESETS } from './presets.mjs';
import { createHash } from 'node:crypto';

const HELP = [
  'Usage: diagnostic-profile [build|init|validate|doctor|list-themes|list-widgets|list-presets|preview] [options]',
  '', '  --config, -c   JSON config (default: diagnostic-profile.json)',
  '  --output, -o   Generated asset directory (default: dist)',
  '  --login        Override config.login; DP_LOGIN is only a fallback',
  '  --fixture      Saved fictional GraphQL user payload; skips the API',
  '  --dry-run      Render and list files without changing output',
  '  --json         Machine-readable result',
  '  --force        Replace init files or rebuild an unchanged asset set',
  '  --version      Print package version',
  '', 'init writes diagnostic-profile.json and .github/workflows/profile.yml.',
  'validate checks configuration without network access.',
  'doctor checks config, Node version and token presence without printing secrets.',
  'GITHUB_TOKEN is required only when building without --fixture.',
].join('\n');

export async function main(args = process.argv.slice(2), env = process.env) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: {
    config: { type: 'string', short: 'c', default: env.DP_CONFIG ?? 'diagnostic-profile.json' },
    output: { type: 'string', short: 'o', default: env.DP_OUTPUT_DIR ?? 'dist' },
    login: { type: 'string' }, fixture: { type: 'string' }, preset: { type: 'string' }, port: { type: 'string' }, help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean' }, json: { type: 'boolean' }, 'dry-run': { type: 'boolean' }, force: { type: 'boolean' },
  } });
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  if (values.help) { console.log(HELP); return; }
  if (values.version) { console.log(pkg.version); return; }
  const command = positionals[0] ?? 'build';
  if (positionals.length > 1) throw new Error('Only one command is accepted');
  const print = (data, message) => console.log(values.json ? JSON.stringify(data) : message);
  if (command === 'list-themes') { print(paletteNames, paletteNames.join('\n')); return; }
  if (command === 'list-widgets') { print(WIDGETS, WIDGETS.map((w) => w.id + ': ' + w.description).join('\n')); return; }
  if (command === 'list-presets') { print(PRESETS, Object.entries(PRESETS).map(([id, p]) => id + ': ' + p.name).join('\n')); return; }
  if (command === 'preview') {
    const { buildStudio, serveStudio } = await import('../scripts/studio.mjs');
    await buildStudio();
    await serveStudio(Number(values.port ?? 4173));
    return;
  }
  if (command === 'init') {
    const login = values.login ?? env.DP_LOGIN ?? env.GITHUB_REPOSITORY_OWNER ?? 'your-login';
    const config = starterConfig(login);
    if (values.preset) { delete config.theme; config.preset = values.preset; config.presetVersion = 1; }
    normalizeConfig(config);
    const configPath = resolve(values.config);
    const workflowPath = resolve('.github/workflows/profile.yml');
    // Exclusive creation is the default; --force is an explicit overwrite request.
    const flag = values.force ? 'w' : 'wx';
    await mkdir(dirname(configPath), { recursive: true });
    await mkdir(dirname(workflowPath), { recursive: true });
    if (!values.force) {
      for (const path of [configPath, workflowPath]) {
        try { await readFile(path); throw new Error('File already exists: ' + path + '; use --force to replace it'); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
    }
    await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', { flag });
    // Nonstandard config paths need an explicit matching workflow input.
    const workflow = generateWorkflow(config, { configPath: values.config, outputDir: values.output });
    await writeFile(workflowPath, workflow, { flag });
    print({ config: configPath, workflow: workflowPath }, 'Created config and workflow. Edit the profile, review permissions, then run validate.');
    return;
  }
  if (!['build', 'validate', 'doctor'].includes(command)) throw new Error('Unknown command: ' + command);
  const raw = await loadConfig(values.config);
  const input = values.login && raw && typeof raw === 'object' && !Array.isArray(raw) ? { ...raw, login: values.login } : raw;
  const config = normalizeConfig(input, env.DP_LOGIN);
  const warnings = configWarnings(raw);
  if (!values.json) warnings.forEach((warning) => console.error('warning: ' + warning));
  if (command === 'validate') { print({ valid: true, schemaVersion: config.schemaVersion, warnings }, 'Configuration valid (schema version ' + config.schemaVersion + ')'); return; }
  if (command === 'doctor') {
    const checks = { node: Number(process.versions.node.split('.')[0]) >= 22, config: true, tokenPresent: Boolean(env.GITHUB_TOKEN), fixtureMode: Boolean(values.fixture) };
    const ok = checks.node && (checks.tokenPresent || checks.fixtureMode);
    print({ ok, checks, warnings }, 'Node >=22: ' + checks.node + '\nConfiguration: valid\nToken present: ' + checks.tokenPresent + '\nFixture mode: ' + checks.fixtureMode);
    if (!ok) process.exitCode = 1;
    return;
  }
  let user;
  if (values.fixture) user = JSON.parse(await readFile(values.fixture, 'utf8'));
  else {
    if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required; use --fixture for an offline preview');
    user = await fetchUser(config.login, env.GITHUB_TOKEN, { projects: config.projects });
  }
  const data = summarize(user, config.telemetry);
  const files = buildAssets(config, data);
  const result = { output: resolve(values.output), files: [...Object.keys(files), 'manifest.json'], warnings, dryRun: Boolean(values['dry-run']) };
  if (!values['dry-run']) {
    const inputHash = createHash('sha256').update(JSON.stringify({ config, data, version: pkg.version, warnings })).digest('hex');
    const published = await writeAssets(values.output, files, { version: pkg.version, login: data.login, source: values.fixture ? 'fixture' : 'github', warnings, inputHash }, { force: values.force });
    result.unchanged = Boolean(published.unchanged);
  }
  print(result, (values['dry-run'] ? 'Would write ' : result.unchanged ? 'Unchanged: ' : 'Wrote ') + result.files.length + ' files to ' + result.output);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    const json = process.argv.includes('--json');
    console.error(json ? JSON.stringify({ error: error.message, code: error.code ?? 'INVALID_INPUT' }) : 'diagnostic-profile: ' + error.message);
    process.exitCode = 1;
  });
}
