# Releases and migration

Public Studio: **https://yagoborba.github.io/diagnostic-profile/**. The full list of changes is in the [CHANGELOG](../CHANGELOG.md).

## 0.2.2 — 2026-11-25

Documentation release. The guides are in English throughout, with the Studio buttons quoted in Portuguese as they appear on screen, and the README keeps a short list of future ideas. Exported installers now use YagoBorba/diagnostic-profile@v0.2.2; the Action, worlds, data and schema 1 are unchanged, so updating the reference is enough.

## 0.2.1 — 2026-11-06

Maintenance release for the Actions used by the project and by exported workflows: checkout 7.0.1, setup-node 7.1.0, upload-pages-artifact 5.0.0, deploy-pages 5.0.1 and ghaction-github-pages 5.0.0, all pinned by SHA. Pull-request CI now also packages the Pages artifact.

Worlds, data, credits and schema 1 are unchanged. Exported installers now use YagoBorba/diagnostic-profile@v0.2.1. When migrating, update both the Action reference and the workflow pins; changing only the tag does not update checkout or publication.

Self-hosted runners must support Node 24 (Actions Runner 2.327.1+). The project is tested on Node 22 and 24. Automatic package caching and persisted checkout credentials are explicitly disabled. See [compatibility and rollback](ACTION_MAINTENANCE.md).

## 0.2.0 — 2026-11-06

- Six complete worlds besides the three earlier families: 16 presets and six palettes.
- Static visual kit without a token or Action, Markdown with a matching semantic preview, and the Action for up-to-date public data.
- Seeded mixes, locks, recipes without personal data, optional challenges and favorites with a name and thumbnail.
- English and Portuguese output, wrapping for wide names, accessible descriptions and localized instructions.
- Manifests, and no publication commits caused only by timestamps when the data did not change.
- Small linked credits to the author and the project in every README format, even with the personal footer disabled.

The [public example in another repository](https://github.com/YagoBorba/diagnostic-profile-example) shows the Action being consumed from outside this repository; its runs are on that example's Actions page.

### Migrating from 0.1.0

schemaVersion stays 1 and the earlier preset IDs are still accepted. Legacy SVG comparisons check the previous default output; the new families and locale are additional options. JSON without a locale uses en; new Studio profiles use pt-BR. To keep Markdown in Portuguese, select pt-BR explicitly.

The Studio now starts with the static visual kit. It does not fetch real data: it produces README.md with assets/ and leaves API widgets out. Choose the Action for automatic updates, using YagoBorba/diagnostic-profile@v0.2.0 or newer. Changing the world does not erase content, but keep a JSON copy before experimenting.

In an existing workflow, update the Action reference and review the CHANGELOG. For strict immutability, use the tag's full commit SHA. Keep the configuration and secrets, and run the workflow manually before replacing images in use.

## Rollback

Restore the previous reference and configuration and run again; do not delete your asset branch to update. --force asks the CLI for a rebuild when needed. For the site, publish a reviewed build of main again; never move tags. Drafts are stored by the browser for this site only, so JSON exports are the portable backup.

## Scope

npm, the Marketplace, OAuth and writing directly to the visitor's account are not part of the project. The npm package stays private to prevent accidental publication; the site and the Action are public. Private metrics are not supported. The Studio interface is in Portuguese; generated output is available in English and Portuguese.

## 0.1.0 — 2026-11-05

[v0.1.0](https://github.com/YagoBorba/diagnostic-profile/releases/tag/v0.1.0) was the first public release, with the Studio, ten presets and the Action.
