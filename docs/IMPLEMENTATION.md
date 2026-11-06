# Implementation evidence

The approved scope is in [ROADMAP.md](ROADMAP.md). Checked tasks describe implemented behavior with evidence. Public publication, a real screen-reader session and rendered GitHub compatibility are not implied by unit tests.

## Gitflow

The maintainer selected the BorbaCarLabs convention: English Conventional Commits without emojis, supporting branches from develop, merge commits after green CI, releases through release/X.Y.Z to main with a tag and a back-merge to develop.

- [PR #3 — reliability](https://github.com/YagoBorba/diagnostic-profile/pull/3), merged.
- [PR #5 — conventions and roadmap](https://github.com/YagoBorba/diagnostic-profile/pull/5), merged.
- [PR #7 — schema, CLI and transactional output](https://github.com/YagoBorba/diagnostic-profile/pull/7), merged.
- [PR #9 — Studio](https://github.com/YagoBorba/diagnostic-profile/pull/9), merged after all four CI jobs passed.

## Reliability and setup

- Repository/language pagination, correct foreign project identities and explicit project lookup.
- Type/length/range/URL validation and filename collision checks.
- Bounded timeout/retry handling and specific API errors.
- Version-1 schema, backwards-compatible unversioned configs and unknown-field warnings.
- init, validate, doctor, catalogs, dry-run and structured JSON output.
- Staged output with rollback, locking, manifests and preservation of unrelated/edited files.
- Node 22/24 on Linux/Windows; 37 tests passed in all four jobs before the Studio batch.

A prior read-only live request loaded 8 public owned non-fork repositories and 5 public pinned projects for YagoBorba. No private payload was committed.

## Studio verification — 2026-11-04

- Six presets/palettes and three families use the shared render engine.
- Registered blocks have ordered unique instances; visibility, title, grouping and incorporation are configurable.
- Skills, learning/building, calendar, milestone and divider blocks are available.
- Narrow main/project variants, custom colors, contrast feedback and motion controls are included.
- Browser checks covered preset selection, name/theme/layout changes, block arrow reordering, favorites, JSON reimport and ZIP download.
- The downloaded 26-file ZIP was opened with an independent implementation; its selected theme/family/layout/order matched the displayed configuration, and fictional SVGs stayed under preview/.
- At 390 px the document/editor stayed within viewport width. This is a responsive layout check, not a screen-reader or device usability study.
- JSON Schema, XML, ZIP, workflow destinations, configuration round-trips and grapheme wrapping are covered by the 54-test suite.
- Static module syntax, JSON and local documentation links are checked; the Studio build is included in CI.
- Presets/widgets/palettes have deterministic committed fixture previews.

## Pending

Historical state before release 0.1.0: the repository was private and workflows used develop. The public source and versioned Action are now part of [release 0.1.0](RELEASE.md). Marketplace is not included. External integrations, additional visual families, full localization, per-widget visual overrides, selectable telemetry metrics, live authenticated previews, real screen-reader checks and community remix submissions remain on the roadmap.

Destination-ref validation also checks reserved Git names/components against git check-ref-format; see issue #10.

## Usability and free hosting review — 2026-11-05

- [PR #13](https://github.com/YagoBorba/diagnostic-profile/pull/13) passed all four CI jobs and was integrated into develop with a merge commit. Issue #12 tracks the standalone README flow and the public launch assessment.
- Ten presets now include Resume, Research notebook, Maker bench and Community. Portuguese gallery descriptions expose their block order, goal filters and accent-insensitive search.
- Standalone Markdown export is the default. It uses declared content only, skips metric/calendar/timestamp widgets and downloads README.md directly or in a two-file ZIP. The SVG/Action kit remains a separate option.
- Browser QA covered sample clearing, a new manual profile, the downloaded ZIP contents, filters/no results, export-mode switching, a project subpath and a 390 px viewport without horizontal overflow.
- GitHub's Markdown API rendered a hostile-text sample as escaped prose and an encoded HTTPS destination. This verifies the text renderer, not the full SVG embedding or screen-reader experience on a profile page.
- The suite has 61 passing tests, including new Markdown safety, empty/data-only content, ZIP and Pages publication-policy checks. Schema/XML checks also cover the four new presets across every palette.
- The opt-in Pages workflow is restricted to main, uses pinned Actions and has not been executed. No repository or Site audience was changed.
- Issue #14 corrects the diagnostic telemetry heading, per-metric period labels and text alternative: contributions/commits/PRs/issues cover 12 months; stars/repos/followers are current totals. The new regression parses both SVG modes. Desktop inspection checked the additional labels; DATA-01 is implemented.
- npm audit reported zero known vulnerabilities on 2026-11-05.
- The beginner guide and [product review](PRODUCT_REVIEW.md) describe installation, troubleshooting, privacy, launch blockers and acceptance criteria.

## Public release — 2026-11-05

- The owner explicitly authorized public repository visibility. The public site is https://yagoborba.github.io/diagnostic-profile/; no ChatGPT login is required there. The earlier chatgpt.site URL remains a private preview mirror, not the public entry point.
- [PR #17](https://github.com/YagoBorba/diagnostic-profile/pull/17) integrated minimal linked author/repository credits into develop. Attribution is independent of optional footer widgets and covered for every preset.
- [PR #18](https://github.com/YagoBorba/diagnostic-profile/pull/18) integrated release/0.1.0 into main after green CI. Annotated v0.1.0 points to c205ad67276a49e3eb9973a42c62c97e70ea6605. [PR #19](https://github.com/YagoBorba/diagnostic-profile/pull/19) merged main back into develop after green CI. Supporting feature/release branches were removed.
- [Pages deployment](https://github.com/YagoBorba/diagnostic-profile/actions/runs/42135215085) succeeded. GitHub initially created an environment policy for the default develop branch; it was corrected to main, matching the release-only workflow, and the deployment then passed.
- [Released Action verification](https://github.com/YagoBorba/diagnostic-profile/actions/runs/42135393488) succeeded using v0.1.0, GITHUB_TOKEN and public YagoBorba data. It verified manifest/source/credits and published 17 generated files to demo-assets. An unauthenticated request returned HTTP 200 for header-dark.svg and verified the public snippet credits.
- Browser verification of the actual Pages URL covered ten loaded templates, sample clearing, a new profile, README.md download, both author/repository links and no console errors. The GitHub Markdown API preserved the small sub/anchor attribution in rendered HTML.
- 62 tests passed locally and in Linux/Windows with Node 22/24. The repository is public and its homepage points to Pages. No npm or Marketplace publication is claimed. Another-repository installation, screen-reader testing and independent user research remain pending.
