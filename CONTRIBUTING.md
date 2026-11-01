# Contributing to Diagnostic Profile

## Git Workflow (GitFlow)

This project follows the same workflow as [BorbaCarLabs](https://github.com/YagoBorba/BorbaCarLabs/blob/develop/CONTRIBUTING.md).

- main: published versions only; every release receives an annotated vX.Y.Z tag.
- develop: integration branch and default branch for the next version.
- feature/<name>: new features, from develop.
- fix/<name>: bug fixes, from develop.
- docs/<name> and chore/<name>: documentation and maintenance, from develop.
- release/X.Y.Z: version and CHANGELOG preparation, from develop, merged into main.
- hotfix/X.Y.Z: urgent fixes from main, merged into main and develop.

Open pull requests against develop. Require green CI, review the diff and use a merge commit; delete the supporting branch afterwards. After a release is merged into main, tag the release and merge main back into develop. Never squash a release back-merge.

## Local setup

Node.js 22 or newer and Git are required. The rendering engine has no runtime dependencies.

    git clone https://github.com/YagoBorba/diagnostic-profile.git
    cd diagnostic-profile
    git switch develop
    git switch -c feature/my-feature
    npm test
    npm run preview

Use the fictional fixture for local work. It does not require a token:

    node src/cli.mjs --config examples/diagnostic-profile.json --fixture test/fixtures/user.json --output dist

## Commit convention

Follow [.github/COMMIT_CONVENTION.md](.github/COMMIT_CONVENTION.md): Conventional Commits, English, lowercase description, no emojis or trailing period.

    feat(themes): add a monochrome palette
    fix(stats): include all repository pages

## Pull requests

- Describe the concrete problem, resulting behavior and relevant tradeoffs.
- Link an issue and roadmap IDs when applicable.
- Run npm test and git diff --check.
- Regenerate previews and inspect intended visual changes.
- Add meaningful tests for new behavior and reproduced bugs.
- Update documentation and CHANGELOG for user-visible changes.
- Keep fixture data clearly labeled as fictional.
- Do not commit tokens, private profile payloads or temporary build output.

CI must pass before merging. Do not mark a browser, accessibility or live-API check complete unless it was actually performed.

## Architecture

- src/github.mjs: GitHub data collection and errors.
- src/stats.mjs: pure aggregation of profile data.
- src/config.mjs: configuration normalization and project resolution.
- src/widgets/: pure SVG rendering.
- src/build.mjs and src/snippet.mjs: composition and README output.
- scripts/preview.mjs: deterministic fixture previews.
- test/: unit and integration-style tests with fixtures and simulated network responses.

Keep browser-compatible rendering separate from Node.js file/network orchestration. Prefer a shared contract over separate implementations of the same widget.

## Roadmap and scope

[docs/ROADMAP.md](docs/ROADMAP.md) contains the approved 183-task proposal. [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) records delivery evidence. Pending tasks are not advertised as implemented. P2/P3 proposals require the acceptance criteria and maintenance demand described in the roadmap.

## Support

Report bugs using an issue template. Report security concerns privately using [SECURITY.md](SECURITY.md). Support is best effort; no response time is guaranteed.
