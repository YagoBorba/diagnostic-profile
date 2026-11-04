# Changelog

## [Unreleased]

### Studio and personalization

- Add a browser Studio with six presets, six palettes, three visual families and shared-engine previews.
- Add configurable blocks, narrow panels/project cards, custom colors, alignment, motion and incorporation formats.
- Add skills, learning/building, calendar, milestone and divider widgets.
- Add drafts/favorites, comparison, undo/redo, JSON import, share links and ZIP installation kits.
- Match generated workflows to their destination and guard source branches and cross-repository credentials.
- Preserve grapheme clusters when wrapping text and distinguish unknown metrics from real zero values.

### Fixed

- Paginate public repositories and repository languages instead of silently truncating profile totals.
- Keep pinned and explicitly selected projects associated with their real owner, URL and metadata.
- Validate configuration types, numeric limits, URL protocols and output filename collisions before rendering.
- Escape asset URLs in README attributes and report a true zero peak for an empty contribution spectrum.
- Bound GitHub request retries and timeouts, with specific authentication and rate-limit errors.

### Improved

- Add schema version 1, editor JSON Schema and warnings for unknown configuration fields.
- Add init, validate, doctor, list-themes, list-widgets, structured JSON output and dry-run commands.
- Stage complete asset sets with rollback, output locking, safe stale-file cleanup and SHA-256 manifests.
- Validate SVG XML with a real parser and test supported Node versions on Linux and Windows.

### Added

- Gitflow contribution instructions, Conventional Commits reference, issue/PR templates and the approved roadmap with delivery evidence.

- Header, telemetry, spectrum, project card, contact and footer widgets in dark and light variants.
- Four palettes: amber, phosphor, ice and ember.
- JSON config with validation and pinned repository fallback.
- README snippet generation.
- Composite GitHub Action and CLI with a fixture mode.
- Test suite and CI with preview drift check.
