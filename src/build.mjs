import { fileSlug, resolveProjects } from './config.mjs';
import { renderSnippet } from './snippet.mjs';
import { resolveTheme } from './themes.mjs';
import { applyAppearance } from './design.mjs';
import { textColumns } from './svg.mjs';
import { renderContact } from './widgets/contact.mjs';
import { renderFooter } from './widgets/footer.mjs';
import { renderHeader } from './widgets/header.mjs';
import { renderProject, renderCompactProject } from './widgets/project.mjs';
import { renderSpectrum } from './widgets/spectrum.mjs';
import { renderTelemetry } from './widgets/telemetry.mjs';
import { renderSimple } from './widgets/simple.mjs';

export const MODES = ['dark', 'light'];

export function buildAssets(config, data, now = new Date()) {
  const stamp = now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  const projects = resolveProjects(config, data).map((p) => ({ ...p, slug: fileSlug(p.repo) }));
  const ownerName = config.header.name ?? data.name ?? data.login;
  const files = {};
  const sections = [];
  const add = (name, content) => {
    if (Object.hasOwn(files, name)) throw new Error('Widget output filename collision: ' + name);
    files[name] = applyAppearance(content, config.appearance);
  };
  for (const widget of config.widgets.filter((w) => w.enabled)) {
    const section = { ...widget, items: [] };
    const compact = config.layout.type === 'compact' || config.appearance.density === 'compact';
    const simple = config.appearance.family !== 'diagnostic' || compact || !config.appearance.decorations;
    const item = (name, alt, url, width = '100%') => section.items.push({ name, alt, url, width });
    if (widget.type === 'projects') {
      projects.forEach((p) => item((widget.id === 'projects' ? 'project' : widget.id) + '-' + p.slug, p.title + (p.summary ? ': ' + p.summary : ''), p.url,
        config.layout.type === 'compact' || config.layout.projectColumns === 1 ? '100%' : '49%'));
    } else if (widget.type === 'contacts') {
      config.contacts.forEach((c) => item((widget.id === 'contacts' ? 'contact' : widget.id) + '-' + c.id, c.label, c.url, '220'));
    } else {
      const description = widget.type === 'header' ? ownerName + '. ' + (config.header.headline ?? data.bio ?? '') :
        widget.type === 'telemetry' ? 'GitHub: ' + data.totals.contributions + ' contributions in the reported calendar; ' + data.totals.stars + ' current stars; ' + data.totals.repositories + ' public owned non-fork repositories.' :
        widget.type === 'spectrum' ? 'Contributions per week for the last ' + data.weekly.length + ' weeks.' :
        widget.type === 'heatmap' ? 'Contribution calendar: ' + data.totals.contributions + ' contributions in the reported period.' :
        widget.type === 'footer' ? 'End of report. Assets generated ' + stamp + '.' :
        widget.type === 'skills' ? 'Technologies declared by the profile owner: ' + config.content.skills.join(', ') :
        widget.type === 'now' ? 'Learning: ' + config.content.learning.join(', ') + '. Building: ' + config.content.building.join(', ') :
        widget.type === 'timeline' ? config.content.timeline.join('. ') : widget.title || 'Section divider';
      item(widget.id, description);
    }
    for (const mode of MODES) {
      const theme = resolveTheme(config.theme, mode, config.appearance);
      if (widget.type === 'projects') {
        projects.forEach((p, i) => {
          const fullName = p.repo.includes('/') ? p.repo : config.login + '/' + p.repo;
          const render = compact ? renderCompactProject : renderProject;
          add(section.items[i].name + '-' + mode + '.svg', render(theme, p, i, data.repos[fullName.toLowerCase()] ?? data.repos[p.repo], now));
        });
      } else if (widget.type === 'contacts') {
        config.contacts.forEach((c, i) => add(section.items[i].name + '-' + mode + '.svg', renderContact(theme, c, ownerName)));
      } else {
        let svg;
        if (widget.type === 'header' && !simple && textColumns(ownerName) <= 36 && textColumns(config.header.headline ?? data.bio ?? '') <= 55 && textColumns(config.header.prompt) < 65 && textColumns(config.header.systemLabel) < 45 && config.header.readouts.every((r) => textColumns(r.value) <= 24 && textColumns(r.label) <= 24)) svg = renderHeader(theme, config, data);
        else if (widget.type === 'telemetry' && !simple) svg = renderTelemetry(theme, data, stamp);
        else if (widget.type === 'spectrum' && !simple) svg = renderSpectrum(theme, data.weekly);
        else if (widget.type === 'footer' && !compact && config.footer.message.length <= 45) svg = renderFooter(theme, config.footer.message, stamp);
        else svg = renderSimple(theme, widget.type, config, { ...data, generatedAt: stamp }, widget.title);
        add(widget.id + '-' + mode + '.svg', svg);
      }
    }
    if (section.items.length) sections.push(section);
  }
  files['README.snippet.md'] = renderSnippet(config, data, projects, sections);
  return files;
}
