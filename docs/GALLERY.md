# Preset gallery

Every preview below uses the same fictional Ada Mercer profile. Change the preset without losing your profile fields; explicit configuration values override preset defaults. All templates have dark and light assets.

| Preset | Dark example |
| --- | --- |
| Diagnostic console — instrument panel and animated scope | ![Diagnostic](preview/preset-diagnostic-dark.svg) |
| Terminal — compact monospace composition | ![Terminal](preview/preset-terminal-dark.svg) |
| Minimal — quiet project presentation | ![Minimal](preview/preset-minimal-dark.svg) |
| Open source — repositories and contribution calendar | ![Open source](preview/preset-opensource-dark.svg) |
| Learning journey — skills and work in progress | ![Learning journey](preview/preset-student-dark.svg) |
| Portfolio — projects and manually supplied milestones | ![Portfolio](preview/preset-portfolio-dark.svg) |

Example configuration:

    {
      "schemaVersion": 1,
      "login": "your-login",
      "preset": "terminal",
      "presetVersion": 1,
      "theme": "violet",
      "layout": { "projectColumns": 1 }
    }

The preset chooses defaults; violet overrides its normal phosphor palette. Use the Studio to preview all fields before exporting.

## Additional widgets

![Skills declared manually](preview/skills-dark.svg)

![Learning and building supplied manually](preview/now-dark.svg)

![Contribution calendar](preview/heatmap-dark.svg)

![Milestones supplied manually](preview/timeline-dark.svg)

![Section divider](preview/divider-dark.svg)

Run npm run preview to regenerate these examples from the committed fixture.
