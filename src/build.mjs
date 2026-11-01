import { fileSlug, resolveProjects } from './config.mjs';
import { renderSnippet } from './snippet.mjs';
import { resolveTheme } from './themes.mjs';
import { renderContact } from './widgets/contact.mjs';
import { renderFooter } from './widgets/footer.mjs';
import { renderHeader } from './widgets/header.mjs';
import { renderProject } from './widgets/project.mjs';
import { renderSpectrum } from './widgets/spectrum.mjs';
import { renderTelemetry } from './widgets/telemetry.mjs';

export const MODES = ['dark', 'light'];

export function buildAssets(config, data, now = new Date()) {
  const stamp = `${now.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
  const projects = resolveProjects(config, data).map((project) => ({ ...project, slug: fileSlug(project.repo) }));
  const ownerName = config.header.name ?? data.name ?? data.login;
  const files = {};

  for (const mode of MODES) {
    const theme = resolveTheme(config.theme, mode);
    files[`header-${mode}.svg`] = renderHeader(theme, config, data);
    files[`telemetry-${mode}.svg`] = renderTelemetry(theme, data, stamp);
    files[`spectrum-${mode}.svg`] = renderSpectrum(theme, data.weekly);
    files[`footer-${mode}.svg`] = renderFooter(theme, config.footer.message, stamp);
    projects.forEach((project, index) => {
      files[`project-${project.slug}-${mode}.svg`] = renderProject(theme, project, index, data.repos[project.repo], now);
    });
    for (const contact of config.contacts) {
      files[`contact-${contact.id}-${mode}.svg`] = renderContact(theme, contact, ownerName);
    }
  }

  files['README.snippet.md'] = renderSnippet(config, data, projects);
  return files;
}
