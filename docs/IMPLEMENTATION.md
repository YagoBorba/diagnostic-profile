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

## Distinctive worlds — 2026-11-06

- PRs [#22](https://github.com/YagoBorba/diagnostic-profile/pull/22), [#23](https://github.com/YagoBorba/diagnostic-profile/pull/23) and [#24](https://github.com/YagoBorba/diagnostic-profile/pull/24) were merged into develop with merge commits after all four Linux/Windows × Node 22/24 checks passed.
- Six complete visual families bring the catalog to 16 presets and nine families. Static SVG kits use declared content; Markdown previews share the export model; fictional data is labeled and confined to Action previews.
- Reproducible style recipes exclude personal content. Seeded mixing, locks, named local favorites and grouped undo support experimentation. Generated output supports English and Brazilian Portuguese; the editor interface remains Portuguese.
- 75 tests cover compatibility, XML, manual kits, localization, recipes, publication caching and version consistency. Browser measurements checked 648 proof samples and 4,196 text boxes without frame overflow; 320/390 px layouts had no horizontal document overflow. These checks do not substitute for screen-reader testing or independent usability research.
- Main and develop now require pull requests, four successful strict CI checks and resolved conversations; force pushes/deletion are disabled. Dependabot targets develop weekly.
- The release workflow additionally uploads the visual proof sheet for human inspection. It is not an automated pixel comparison.

## Release 0.2.0 and external installation — 2026-11-06

- [Release PR #30](https://github.com/YagoBorba/diagnostic-profile/pull/30) passed all four checks and merged release/0.2.0 into main. Annotated v0.2.0 identifies 48934d330957079de1c13f7b98318c55522e3189; v0.1.0 was not moved. [PR #31](https://github.com/YagoBorba/diagnostic-profile/pull/31) back-merged main into develop after green CI. The release branch was removed.
- [Pages publication](https://github.com/YagoBorba/diagnostic-profile/actions/runs/42156022051) and [released Action smoke test](https://github.com/YagoBorba/diagnostic-profile/actions/runs/42156024978) succeeded. The public demo manifest reports version 0.2.0, source github and no warnings.
- The separate public [installation example](https://github.com/YagoBorba/diagnostic-profile-example) consumes v0.2.0, tests real API output in CI, and follows its own feature/develop/release/main cycle with annotated example v0.1.0. It leaves the owner's personal profile repository untouched.
- [External publication](https://github.com/YagoBorba/diagnostic-profile-example/actions/runs/42156188833) succeeded with the repository GITHUB_TOKEN, no PAT and no schedule. An unauthenticated HTTP request returned 200 for output/header-dark.svg; its manifest reports source github and version 0.2.0. CI verifies linked author/source attribution. This verifies a second repository under the same owner, not adoption by an independent participant.
- The existing owner-private Sites preview mirror was updated without changing audience. GitHub Pages remains the public entry point.

## Action maintenance 0.2.1 — 2026-11-06

- [PR #33](https://github.com/YagoBorba/diagnostic-profile/pull/33) consolidated the exact dependency proposals #25–29 on current develop, preserving their commit authorship. The five original PRs were closed as superseded after integration; their branches were removed. SHA pins were verified against official release commits.
- Exported Studio/CLI workflows and README examples now match the tested checkout/publication dependencies. Setup-node automatic package caching and checkout persisted credentials are explicitly disabled. Runner requirements and rollback are documented in [ACTION_MAINTENANCE.md](ACTION_MAINTENANCE.md).
- [Maintenance CI](https://github.com/YagoBorba/diagnostic-profile/actions/runs/42310801430) passed all four Linux/Windows × Node 22/24 checks and 76 tests. It uploaded studio-validation using the Pages uploader and four visual-proof artifacts using upload-artifact 7.0.2. No publication occurs in PR CI.
- [PR #34](https://github.com/YagoBorba/diagnostic-profile/pull/34) released 0.2.1 into main after green CI. Annotated v0.2.1 targets 27b311c851a00029d0e7eba8f44935b003aff07a. [PR #35](https://github.com/YagoBorba/diagnostic-profile/pull/35) back-merged main into develop after green CI. The release branch was removed, without changing v0.1.0/v0.2.0.
- [Pages deployment](https://github.com/YagoBorba/diagnostic-profile/actions/runs/42311236212) succeeded with upload-pages-artifact 5.0.0 and deploy-pages 5.0.1. Public HTTP checks returned 200 and verified deployed VERSION 0.2.1 plus the new installer pins.
- [Released Action publication](https://github.com/YagoBorba/diagnostic-profile/actions/runs/42311239370) succeeded with the updated composite Action and publication runtime. The public manifest reports source github, version 0.2.1 and no warnings; the header returned HTTP 200 and the snippet retained linked Yago Borba/repository credits.
