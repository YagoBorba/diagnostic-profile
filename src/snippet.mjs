const attr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function picture(base, name, alt, size, indent = '') {
  return [
    `${indent}<picture>`,
    `${indent}  <source media="(prefers-color-scheme: dark)" srcset="${base}${name}-dark.svg">`,
    `${indent}  <source media="(prefers-color-scheme: light)" srcset="${base}${name}-light.svg">`,
    `${indent}  <img alt="${attr(alt)}" src="${base}${name}-dark.svg" ${size}>`,
    `${indent}</picture>`,
  ].join('\n');
}

const linked = (url, content) => [`  <a href="${attr(url)}">`, content, '  </a>'].join('\n');

export function renderSnippet(config, data, projects) {
  const base = attr(config.assetsBaseUrl.endsWith('/') ? config.assetsBaseUrl : `${config.assetsBaseUrl}/`);
  const name = config.header.name ?? data.name ?? data.login;
  const headline = config.header.headline ?? data.bio ?? '';
  const sections = [];

  sections.push(picture(base, 'header', `${name}${headline ? `, ${headline}` : ''}. Header styled as a diagnostic console.`, 'width="100%"'));

  if (config.contacts.length) {
    const buttons = config.contacts
      .map((contact) => linked(contact.url, picture(base, `contact-${contact.id}`, contact.label, 'height="44"', '    ')))
      .join('\n');
    sections.push(`<p align="center">\n${buttons}\n</p>`);
  }

  if (projects.length) {
    const cards = projects
      .map((project) => {
        const alt = project.summary ? `${project.title}: ${project.summary}` : project.title;
        return linked(project.url, picture(base, `project-${project.slug}`, alt, 'width="49%"', '    '));
      })
      .join('\n');
    sections.push(`## Featured projects\n\n<p align="center">\n${cards}\n</p>`);
  }

  sections.push(
    [
      '## Telemetry',
      '',
      picture(base, 'telemetry', 'GitHub telemetry for the last 12 months: contributions, commits, pull requests, issues, stars, repositories, followers, streaks and language mix.', 'width="100%"'),
      '',
      picture(base, 'spectrum', 'Weekly contribution spectrum for the last 52 weeks.', 'width="100%"'),
    ].join('\n'),
  );

  sections.push(picture(base, 'footer', 'End of report. Assets regenerated automatically by GitHub Actions.', 'width="100%"'));

  return `${sections.join('\n\n')}\n`;
}
