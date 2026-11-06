# Preset gallery

Version 0.2.0 adds six complete worlds, three-block thumbnails and manual SVG export. See [worlds and recipes](WORLDS.md) for complete compositions and the [beginner guide](GETTING_STARTED.md) for the three export formats.

Every preview below uses the same fictional Ada Mercer profile. Change the preset without losing your profile fields; explicit configuration values override preset defaults. All templates have dark and light assets.

| Preset | Dark example |
| --- | --- |
| Diagnostic console — instrument panel and animated scope | ![Diagnostic](preview/preset-diagnostic-dark.svg) |
| Terminal — compact monospace composition | ![Terminal](preview/preset-terminal-dark.svg) |
| Minimal — quiet project presentation | ![Minimal](preview/preset-minimal-dark.svg) |
| Open source — repositories and contribution calendar | ![Open source](preview/preset-opensource-dark.svg) |
| Learning journey — skills and work in progress | ![Learning journey](preview/preset-student-dark.svg) |
| Portfolio — projects and manually supplied milestones | ![Portfolio](preview/preset-portfolio-dark.svg) |
| Resume — skills and milestones before projects | ![Resume](preview/preset-resume-dark.svg) |
| Research notebook — ongoing work and a chronological record | ![Research notebook](preview/preset-researcher-dark.svg) |
| Maker bench — narrow technical workbench | ![Maker bench](preview/preset-maker-dark.svg) |
| Community — current work, projects and collaboration | ![Community](preview/preset-community-dark.svg) |

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
