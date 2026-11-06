import { ACTION_REF } from './version.mjs';
import { normalizeConfig } from './config.mjs';

export function generateWorkflow(input = { login: 'your-login' }, { configPath = 'diagnostic-profile.json', outputDir = 'dist' } = {}) {
  const config = normalizeConfig(input);
  const target = config.destination.repository || config.login + '/' + config.login;
  const branch = config.destination.branch;
  return [
    'name: Build profile assets', '',
    'on:', '  workflow_dispatch:', '  schedule:', '    - cron: "17 */6 * * *"',
    '  push:', '    paths:', '      - ' + JSON.stringify(configPath), '      - .github/workflows/profile.yml', '',
    'permissions:', '  contents: write', '',
    'concurrency:', '  group: ' + JSON.stringify('diagnostic-profile-' + target + '-' + branch), '  cancel-in-progress: false', '',
    'jobs:', '  build:', '    runs-on: ubuntu-latest', '    timeout-minutes: 10', '    steps:',
    '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1',
    '        with:', '          persist-credentials: false',
    '      - name: Check publication destination',
    '        env:', '          TARGET_BRANCH: ' + JSON.stringify(branch),
    '          DEFAULT_BRANCH: ' + '$' + '{{ github.event.repository.default_branch }}',
    '          TARGET_REPOSITORY: ' + JSON.stringify(target),
    '          CURRENT_REPOSITORY: ' + '$' + '{{ github.repository }}',
    '          PROFILE_PUBLISH_TOKEN: ' + '$' + '{{ secrets.PROFILE_PUBLISH_TOKEN }}',
    '        run: |',
    '          if [ "$TARGET_BRANCH" = "$DEFAULT_BRANCH" ]; then',
    '            echo "::error::Choose a dedicated asset branch, not the default source branch."',
    '            exit 1', '          fi',
    '          shopt -s nocasematch',
    '          if [[ "$TARGET_REPOSITORY" != "$CURRENT_REPOSITORY" && -z "$PROFILE_PUBLISH_TOKEN" ]]; then',
    '            echo "::error::Publishing to another repository requires the PROFILE_PUBLISH_TOKEN secret."',
    '            exit 1', '          fi',
    '      # Versioned release; pin its full commit SHA for an immutable reference.',
    '      - uses: ' + ACTION_REF,
    '        with:', '          config: ' + JSON.stringify(configPath), '          output_dir: ' + JSON.stringify(outputDir),
    '      - uses: crazy-max/ghaction-github-pages@1d6ee9b181a81033a16bd707a1401afa978daab4 # v5.0.0',
    '        with:', '          repo: ' + JSON.stringify(target), '          target_branch: ' + JSON.stringify(branch),
    '          build_dir: ' + JSON.stringify(outputDir), '          keep_history: true', '          allow_empty_commit: false',
    '        env:', '          GITHUB_TOKEN: ' + '$' + '{{ secrets.PROFILE_PUBLISH_TOKEN || secrets.GITHUB_TOKEN }}', '',
  ].join('\n');
}
