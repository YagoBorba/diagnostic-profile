import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAssets } from '../src/build.mjs';
import { normalizeConfig } from '../src/config.mjs';
import { summarize } from '../src/stats.mjs';
import { paletteNames, resolveTheme } from '../src/themes.mjs';
import { renderHeader } from '../src/widgets/header.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outputDir = join(root, 'docs', 'preview');
const now = new Date('2026-10-31T12:00:00Z');

const config = normalizeConfig(JSON.parse(await readFile(join(root, 'examples', 'diagnostic-profile.json'), 'utf8')));
const user = JSON.parse(await readFile(join(root, 'test', 'fixtures', 'user.json'), 'utf8'));
const data = summarize(user, config.telemetry);

const files = buildAssets(config, data, now);
delete files['README.snippet.md'];
for (const palette of paletteNames) {
  for (const mode of ['dark', 'light']) {
    files[`theme-${palette}-${mode}.svg`] = renderHeader(resolveTheme(palette, mode), { ...config, theme: palette }, data);
  }
}

await mkdir(outputDir, { recursive: true });
await Promise.all(Object.entries(files).map(([name, content]) => writeFile(join(outputDir, name), content)));
console.log(`preview: wrote ${Object.keys(files).length} files to docs/preview`);
