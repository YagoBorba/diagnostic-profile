# Action maintenance

Every third-party Action is pinned by its full commit SHA, including in the workflows exported by the Studio and the CLI.

| Dependency | Reviewed version | Used by |
| --- | --- | --- |
| [checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | 7.0.1 | CI, Pages, smoke test and exported workflow |
| [setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | 7.1.0 | CI, Pages and the composite Action |
| [upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | 5.0.0 | Pages and real packaging in pull-request CI |
| [deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | 5.0.1 | Studio publication |
| [ghaction-github-pages](https://github.com/crazy-max/ghaction-github-pages/releases/tag/v5.0.0) | 5.0.0 | SVG publication and exported workflow |
| [upload-artifact](https://github.com/actions/upload-artifact/releases/tag/v7.0.2) | 7.0.2 | Visual review sheets in CI |

## Compatibility

The updated Actions run on Node 24; the project code is tested on Node 22 and 24. Self-hosted runners must support that runtime (Actions Runner 2.327.1 or newer). Authenticated Git commands inside a Docker container action with a modern checkout need runner 2.329.0 or newer; this project does not use that path. GitHub.com with ubuntu-latest and windows-latest is the verified environment. Older GitHub Enterprise Server installations are not assumed to be compatible.

setup-node 7 moved to ESM internally and removed the placeholder NODE_AUTH_TOKEN fallback. This project does not configure registry-url or publish to npm. Automatic caching is explicitly disabled, including in the composite Action that runs in the user's repository. See the [official notes](https://github.com/actions/setup-node#whats-new-in-v7).

Checkout uses persist-credentials: false. Asset publication receives GITHUB_TOKEN explicitly in the publication step and does not rely on credentials left by checkout. The permission policy and the restriction of Pages to main stay in place.

## Updating a dependency

1. Review the official changelogs and manifests and keep the SHA pins.
2. Update the YAML files, src/workflow.mjs and the README example. Dependabot does not rewrite JavaScript strings.
3. Run the tests and the four required checks. CI uploads a studio-validation artifact with the same upload Action used by Pages, without deploying from a pull request.
4. Merge into develop through a pull request with a merge commit, prepare a patch release, merge it into main and create a new annotated tag. Never move published tags.
5. Run Pages and the smoke test of the published version, and check the result, manifest, credits and public URLs. Pull-request CI alone does not prove the deployment.

To roll back, restore the previous version reference and its compatible workflow. Do not delete the asset branch or move a published tag. The code at v0.2.0 keeps the previous dependencies for installations that need them.
