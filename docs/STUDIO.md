# Profile Studio

Studio edits the same configuration and SVG engine used by the CLI and Action. It runs locally with fictional data and does not request a GitHub token.

## Start

    npm ci
    npm run studio

Open the printed Local URL. npm run build:studio writes a static website to dist/site, including the shared renderer and fictional fixture. Relative URLs support repository subpaths.

## Create a profile

1. Search or filter ten templates by career, learning, community or technical identity. Each card explains its block order. Resume, Research notebook, Maker bench and Community join the original six templates.
2. Edit login, name, bio, focus tags and readouts. Replace fictional sample names, projects, contacts and locations before installing.
3. Choose a palette independently of the visual family. Adjust per-mode colors, borders, motion and layout.
4. Add, hide or reorder blocks. Arrow buttons are available alongside drag-and-drop.
5. Compare with a reference, inspect mobile width and check both modes.
6. Choose a standalone Markdown README (default) or the SVG installation kit. The plain README uses declared content only and omits data-dependent widgets; it does not reproduce SVG colors/animation. Download README.md directly or a ZIP with installation instructions. See the [beginner guide](GETTING_STARTED.md).

Blocks: header, contacts, projects, telemetry, spectrum, footer, skills, currently learning/building, contribution calendar, milestones and divider. Skills and milestones are supplied manually, without inferred skill levels.

## SVG installation kit

The ZIP contains diagnostic-profile.json, .github/workflows/profile.yml, README.snippet.md and INSTALL.txt. The separate preview/ folder contains FICTIONAL SVGs rather than real GitHub statistics.

The generated workflow matches the selected asset repository/branch. main, master and develop cannot be asset branches; the workflow also checks the actual default branch. A different repository requires the PROFILE_PUBLISH_TOKEN secret with appropriate write access.

The public Action uses v0.1.0. The free public Studio is available at https://yagoborba.github.io/diagnostic-profile/. Marketplace and npm distribution are not included; see [release instructions](RELEASE.md).

## Layout behavior

- Standard retains wide diagnostic panels.
- Compact uses 360-pixel main panels/project cards and incorporates projects in one column.
- Grid uses medium-width simple panels and explicit project columns.
- Two columns remain two columns on narrow READMEs. Choose Compact or one column for larger text.
- Automatic theme selection uses picture sources. Simple Markdown uses a fixed image; automatic mode falls back to dark.
- Group alignment applies to HTML project/contact groups, not plain Markdown.
- A plain-text metric summary is available alongside images.
- Reduced-motion CSS is included in the Studio and SVGs.

Studio controls use Brazilian Portuguese; generated system labels currently use English. Custom profile text is preserved as supplied. Additional locales remain planned.

The free static hosting plan, privacy details and launch blockers are documented in the [product review](PRODUCT_REVIEW.md). The Pages workflow is manual and restricted to released main. Deployment results are visible in the repository Actions and Pages settings.

## Save and share

The site and every non-empty exported README include a small linked credit to Yago Borba and the Diagnostic Profile repository. Hiding the optional profile footer does not remove this credit. The software remains MIT licensed; see LICENSE.

Drafts and favorites stay in the browser when local storage is available. Download JSON for a portable copy. Imports and shared links are validated; unsupported fields, including credential fields, are discarded.

Shared links contain profile texts and contacts in the URL fragment. Localhost links only work where the same server is reachable; use the hosted Studio origin to share with other people. Oversized configurations should be shared as files.

## Contribute

The next version adds six world families and a static visual kit through the shared family contract in src/families.mjs. Each family supports every registered widget. src/manual.mjs excludes data-dependent blocks and never loads the fictional fixture; its ZIP contains local assets and a matching README. These development changes reach the public site through the next release.

Presets in src/presets.mjs declare versioned defaults; explicit settings override them. Widget types are listed in src/catalog.mjs, validated in src/design.mjs and composed in src/build.mjs. Each instance has a unique id, type, enabled flag and optional title. No two instances may produce the same filename.

Update the schema, warnings, tests and gallery for new fields. Run npm test, npm run preview and npm run build:studio. XML/schema checks complement manual inspection; screen-reader sessions and a rendered GitHub README check remain separate verification.

![Studio desktop preview with fictional data](media/studio-desktop.png)
