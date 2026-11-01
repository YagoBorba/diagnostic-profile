# Conventional Commits Reference

Format: type(optional-scope): description

Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert.

Messages are written in English, in lowercase after the colon, without emojis and without a trailing period. Use imperative mood, explain what and why, and keep body lines under 72 characters where practical.

Scopes: api, stats, config, themes, widgets, layout, cli, action, studio, a11y, docs, deps, release.

Examples:

    feat(studio): add preset comparison
    fix(api): follow language pagination
    docs: explain private contribution visibility
    build(release): bump version to 0.2.0

Reference related issues in the footer: Closes #123, Fixes #456, Relates to #789.

Mark breaking changes with ! and explain migration in a BREAKING CHANGE footer.
