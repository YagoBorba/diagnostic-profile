# Changelog

## [Unreleased]

### Fixed

- Paginate public repositories and repository languages instead of silently truncating profile totals.
- Keep pinned and explicitly selected projects associated with their real owner, URL and metadata.
- Validate configuration types, numeric limits, URL protocols and output filename collisions before rendering.
- Escape asset URLs in README attributes and report a true zero peak for an empty contribution spectrum.
- Bound GitHub request retries and timeouts, with specific authentication and rate-limit errors.

### Added

- Header, telemetry, spectrum, project card, contact and footer widgets in dark and light variants.
- Four palettes: amber, phosphor, ice and ember.
- JSON config with validation and pinned repository fallback.
- README snippet generation.
- Composite GitHub Action and CLI with a fixture mode.
- Test suite and CI with preview drift check.
