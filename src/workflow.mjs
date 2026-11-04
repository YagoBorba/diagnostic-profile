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
    '      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4',
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
    '      # Pre-release reference; replace with a reviewed release commit when available.',
    '      - uses: YagoBorba/diagnostic-profile@develop',
    '        with:', '          config: ' + JSON.stringify(configPath), '          output_dir: ' + JSON.stringify(outputDir),
    '      - uses: crazy-max/ghaction-github-pages@df5cc2bfa78282ded844b354faee141f06b41865 # v4',
    '        with:', '          repo: ' + JSON.stringify(target), '          target_branch: ' + JSON.stringify(branch),
    '          build_dir: ' + JSON.stringify(outputDir), '          keep_history: true', '          allow_empty_commit: false',
    '        env:', '          GITHUB_TOKEN: ' + '$' + '{{ secrets.PROFILE_PUBLISH_TOKEN || secrets.GITHUB_TOKEN }}', '',
  ].join('\n');
}
