# Profile Studio

[Public Studio](https://yagoborba.github.io/diagnostic-profile/) · by [Yago Borba](https://github.com/YagoBorba) · [source](https://github.com/YagoBorba/diagnostic-profile).

The Studio has 16 presets, six palettes and nine families. The six world families are Oficina Zero, Arquivo de Campo, Cartografia Orbital, Estação de Rádio, Inventário de Exploração and Herbário Digital. Diagnostic, Terminal and Minimal remain available.

## Create and export

Choose the format first: static visual kit, Markdown or Action. The preview uses the same renderer and content model as the matching export. The gallery uses demo data and thumbnails composed from the header, a project and a contact, so it does not build every asset of every preset.

In the static kit, the SVGs use only the content you entered, with relative paths in README.md. Metrics and calendars are left out, and pinned projects must be added by hand. Upload the whole assets/ folder with the README. The JSON configuration lets you edit and generate a new version later.

In Markdown, the preview is built from the same semantic model that generates the text. User content becomes DOM text, never arbitrary HTML. This format does not reproduce the SVG palettes and frames.

In the Action, the preview is explicitly fictional; the workflow fetches the real data. The reference is v0.2.1. Main, master, develop and the default branch cannot be asset destinations. Another account or repository requires a suitable PROFILE_PUBLISH_TOKEN. The kit's fictional files are kept apart in preview/.

Follow the [beginner guide](GETTING_STARTED.md) and the [installation reference](../README.md).

## Worlds and motion

Each family has a renderer for every widget and declares its author and license in src/families.mjs. SVG output uses the same engine in the CLI, the Action and the browser. Colors are independent from the family and come with contrast feedback; there are borders, density, alignment and narrow variants.

Choose **Compacta** (compact) for readability on small screens: shrinking a 1200 px panel is not the same as a narrow composition. The Studio warns when the preview is narrow while the wide layout is still selected. `<picture>` switches light and dark mode automatically; Markdown with a fixed image uses the chosen mode. Card grouping and alignment depend on the HTML that GitHub accepts.

Reduced motion is respected and the world families open without animation. Decorative figures and waves do not represent statistics. Skills and history are entered by hand; there is no XP or skill rating.

## Mixes and recipes

A seed decides the preset and palette. Locks keep the world, colors, layout and blocks, or motion; personal content is always kept. Optional challenges only change the blocks and are never required to export.

Recipes share only visual fields, without names, contacts, personal section titles or custom IDs. Sharing a full profile is a separate option that includes text and contacts. Links are validated and limited in size; use JSON for large configurations. Localhost links only work where the same server is reachable.

Favorites live in the browser, with an editable name and a thumbnail. Drafts are not synced. Typing in the same field is grouped for undo, and the history keeps up to 40 steps. Download the JSON as a backup. Starting over replaces the draft; favorites are removed one by one.

## Language and accessibility

The en/pt-BR locale controls generated labels, summaries, accessible descriptions and kit instructions. Personal text and technology names are kept as written. The Studio interface is in Portuguese and translates the common validation hints. CLI diagnostics keep their documented English format.

Controls have labels, visible focus and arrow keys for reordering. An optional text summary complements the images. SVG title and description help assistive technology, but how a screen reader announces images embedded in a GitHub README depends on GitHub, so keep the text summary enabled when the data matters.

## Development and quality

    npm ci
    npm run studio
    npm run proof -- --serve

Static build: npm run build:studio → dist/site. Visual review sheet: npm run proof → dist/proof, kept apart from the published site. CI uploads the sheet as an artifact for three days for human inspection; it is not an automated pixel comparison.

Architecture: src/families.mjs declares the contract, src/families/ holds the implementations, src/build.mjs composes the output, src/manual.mjs leaves automatic data out of the static kit, and src/readme-model.mjs shares semantics between the preview and Markdown. src/version.mjs keeps the release and schema references in one place.

The CLI keeps files and the generation date when the configuration, data and version are identical and the files are intact. --force regenerates. Edited generated files are detected; unrelated files are left alone. The timestamp describes generation, not each network request.

Small credits to Yago Borba and the repository are included in every non-empty README, regardless of the personal footer block. See the MIT license.
