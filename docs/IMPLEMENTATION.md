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

Public distribution is not complete: the repository remains private, the installation workflow is explicitly pre-release, and no Marketplace release or public Pages deployment has been claimed. External integrations, additional visual families, full localization, per-widget visual overrides, selectable telemetry metrics, live authenticated previews, real screen-reader checks and community remix submissions remain on the roadmap.

Destination-ref validation also checks reserved Git names/components against git check-ref-format; see issue #10.
