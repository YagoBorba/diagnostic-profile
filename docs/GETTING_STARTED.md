# Create your first README

Open the free [public Studio](https://yagoborba.github.io/diagnostic-profile/); no sign-in is needed. Choose the format first: the preview always follows what will be exported. The Studio interface is in Portuguese, so buttons are named here as they appear on screen.

## Static visual kit: style with nothing to install

1. Choose a world and click **Limpar textos de exemplo** (clear sample text).
2. Fill in your login, name, introduction, projects and contacts. Projects are entered by hand; this format does not query GitHub.
3. Check the preview in light and dark mode. Use the **Compacta** (compact) composition for smaller screens and review the contrast warnings.
4. Download the ZIP, extract it and upload **README.md and the whole assets/ folder** to the root of your public login/login repository. Keep the relative paths, and merge your existing README before saving.
5. Visit your profile. To change the content later, import diagnostic-profile.json in the Studio and upload the updated kit.

No token, Node.js, Action or image server is needed. API metrics, calendars and pinned projects are left out. Review all sample content before publishing. Credits to Yago Borba and the project are included in the README.

## Markdown: text and links

Choose **README em Markdown** to copy or download text and links only. This format follows GitHub's own look, without the shapes and colors of the SVGs. The ZIP contains README.md and INSTALL.txt. Automatic data blocks are not part of this mode; updates are manual.

## Action: up-to-date public data

Choose **SVGs e métricas — com GitHub Action**. Export the JSON, workflow and snippet, check the permissions and run the workflow in your repository. The public reference is YagoBorba/diagnostic-profile@v0.2.2; use the tag's full commit SHA if you need an immutable reference. Follow the [full installation](../README.md).

The Action preview uses **fictional** data. The fictional SVGs are kept apart in preview/ inside the ZIP; do not publish them as your statistics. The workflow generates the real data. To publish to another account or repository, set PROFILE_PUBLISH_TOKEN with write access to that destination. Never put a token in the JSON, README, a URL or the browser.

The image destination must be public so visitors can load it without signing in. An output branch in a private repository stays private. Do not copy temporary authenticated URLs of private images.

[Example configuration](../examples/diagnostic-profile.json) · [Released Action check](../.github/workflows/profile-smoke.yml) · [Generated output](https://github.com/YagoBorba/diagnostic-profile/tree/demo-assets).

The released Action check runs the published tag against a minimal public configuration with the repository's own GITHUB_TOKEN, without a personal access token, and publishes real images and a README snippet to the public demo-assets branch. Start from the example configuration and adapt the login and destination before using it.

## Profile repository and running locally

On GitHub, the repository must be public, have the same name as your login and contain a non-empty README.md at the root. See the [official requirements](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme), including the restriction for managed accounts.

To run the Studio locally:

    npm ci
    npm run studio

Open the Local address that is printed. There is no public npm package for npx.

## Common problems

| Symptom | What to check |
| --- | --- |
| The profile does not show the README | Repository named after the login, public, with README.md at the root. |
| Ada still shows up | Clear the samples and also review projects, contacts, fields and exported text. |
| A static image is broken | Upload assets/ together with README.md and keep the relative paths. |
| No colors in Markdown | This format uses text and links; choose the static visual kit or the Action for SVGs. |
| Technologies or traits disappeared | Fill in **Conteúdo pessoal** and enable the matching blocks. |
| I cannot download | Fix the highlighted fields and enable a block that fits the chosen format. |
| Metrics do not appear in the static kit | This mode uses manual content; choose the Action for real statistics. |
| Action not found | Check v0.2.2, the Actions permissions and access to the reference; do not invent tags. |
| Action data did not change | Check the run, logs, default branch and image cache. Identical output keeps files and timestamps; --force rebuilds in the CLI. |
| Token or publication failure | Keep reading the data separate from writing to the destination; check secrets without pasting them in issues. |
| My draft is gone | Drafts are stored by the browser for this site only. Download the JSON as a portable backup. |

More: [Studio](STUDIO.md), [worlds and recipes](WORLDS.md), [gallery](GALLERY.md), [releases and migration](RELEASE.md).
