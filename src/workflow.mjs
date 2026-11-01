// This module is browser-compatible so the CLI and configurator share the same export.
export function generateWorkflow() {
  return [
    'name: Build profile assets', '',
    'on:', '  workflow_dispatch:', '  schedule:', '    - cron: "17 */6 * * *"',
    '  push:', '    paths:', '      - diagnostic-profile.json', '      - .github/workflows/profile.yml', '',
    'permissions:', '  contents: write', '',
    'concurrency:', '  group: diagnostic-profile', '  cancel-in-progress: false', '',
    'jobs:', '  build:', '    runs-on: ubuntu-latest', '    timeout-minutes: 10', '    steps:',
    '      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4',
    '      # Pre-release reference; use a published immutable release SHA when available.',
    '      - uses: YagoBorba/diagnostic-profile@develop',
    '        with:', '          config: diagnostic-profile.json', '          output_dir: dist',
    '      - uses: crazy-max/ghaction-github-pages@df5cc2bfa78282ded844b354faee141f06b41865 # v4',
    '        with:', '          target_branch: output', '          build_dir: dist',
    '        env:', '          GITHUB_TOKEN: ' + '$' + '{{ secrets.GITHUB_TOKEN }}', '',
  ].join('\n');
}
