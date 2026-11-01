#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildAssets } from './build.mjs';
import { loadConfig, normalizeConfig } from './config.mjs';
import { fetchUser } from './github.mjs';
import { summarize } from './stats.mjs';

const { values } = parseArgs({
  options: {
    config: { type: 'string', short: 'c', default: process.env.DP_CONFIG ?? 'diagnostic-profile.json' },
    output: { type: 'string', short: 'o', default: process.env.DP_OUTPUT_DIR ?? 'dist' },
    fixture: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: diagnostic-profile [--config file] [--output dir] [--fixture file]

  --config, -c   JSON config file (default: diagnostic-profile.json)
  --output, -o   Directory for the generated SVGs (default: dist)
  --fixture      Render from a saved GraphQL user payload instead of the API

Environment: GITHUB_TOKEN (required unless --fixture), DP_LOGIN to override the login.`);
  process.exit(0);
}

try {
  const config = normalizeConfig(await loadConfig(values.config), process.env.DP_LOGIN);
  let user;
  if (values.fixture) {
    user = JSON.parse(await readFile(values.fixture, 'utf8'));
  } else {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN is required');
    user = await fetchUser(config.login, token);
  }

  const data = summarize(user, config.telemetry);
  const files = buildAssets(config, data);
  await mkdir(values.output, { recursive: true });
  await Promise.all(Object.entries(files).map(([name, content]) => writeFile(join(values.output, name), content)));
  console.log(`diagnostic-profile: wrote ${Object.keys(files).length} files to ${values.output}`);
} catch (error) {
  console.error(`diagnostic-profile: ${error.message}`);
  process.exit(1);
}
