import { exportConfig } from './transfer.mjs';
import { buildAssets } from './build.mjs';
import { summarize } from './stats.mjs';
import { generateWorkflow } from './workflow.mjs';

export function createInstallationKit(input, fixture, now = new Date()) {
  const config = exportConfig(input);
  const assets = buildAssets(config, summarize(fixture, config.telemetry), now);
  const files = {
    'diagnostic-profile.json': JSON.stringify(config, null, 2) + '\n',
    '.github/workflows/profile.yml': generateWorkflow(config),
    'README.snippet.md': assets['README.snippet.md'],
    'INSTALL.txt': [
      'DIAGNOSTIC PROFILE — INSTALLATION KIT',
      '1. Copy diagnostic-profile.json and .github/workflows/profile.yml into your profile repository.',
      '2. Review the Action reference, permissions and asset branch before running.',
      '3. Run the workflow to generate real GitHub data, then paste the snippet into your README.',
      'The pre-release Action must be accessible from the calling repository.',
      'Publishing to another repository requires a PROFILE_PUBLISH_TOKEN secret with write access to that destination.',
      'The preview/ folder contains FICTIONAL data, not your GitHub statistics. Do not deploy it as real data.',
      'Docs: https://github.com/YagoBorba/diagnostic-profile',
    ].join('\n') + '\n',
  };
  for (const [name, content] of Object.entries(assets)) if (name.endsWith('.svg')) files['preview/' + name] = content;
  return files;
}
