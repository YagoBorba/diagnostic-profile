import { fileSlug, resolveProjects } from './config.mjs';
import { renderSnippet } from './snippet.mjs';
import { resolveTheme } from './themes.mjs';
import { applyAppearance } from './design.mjs';
import { getFamily } from './families.mjs';
import { blockDescription } from './accessibility.mjs';

export const MODES = ['dark', 'light'];

export function buildAssets(config, data, now = new Date()) {
  const stamp = now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  const family = getFamily(config.appearance.family);
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
    const item = (name, alt, url, width = '100%') => section.items.push({ name, alt, url, width });
    if (widget.type === 'projects') {
      projects.forEach((p) => item((widget.id === 'projects' ? 'project' : widget.id) + '-' + p.slug, config.locale === 'pt-BR' ? blockDescription('projects', config, data, { project: p }) : p.title + (p.summary ? ': ' + p.summary : ''), p.url,
        config.layout.type === 'compact' || config.layout.projectColumns === 1 ? '100%' : '49%'));
    } else if (widget.type === 'contacts') {
      config.contacts.forEach((c) => item((widget.id === 'contacts' ? 'contact' : widget.id) + '-' + c.id, c.label, c.url, family.world ? '360' : '220'));
    } else {
      const description = widget.type === 'header' ? ownerName + '. ' + (config.header.headline ?? data.bio ?? '') :
        widget.type === 'telemetry' ? 'GitHub: ' + data.totals.contributions + ' contributions in the reported calendar; ' + data.totals.stars + ' current stars; ' + data.totals.repositories + ' public owned non-fork repositories.' :
        widget.type === 'spectrum' ? 'Contributions per week for the last ' + data.weekly.length + ' weeks.' :
        widget.type === 'heatmap' ? 'Contribution calendar: ' + data.totals.contributions + ' contributions in the reported period.' :
        widget.type === 'footer' ? 'End of report. Assets generated ' + stamp + '.' :
        widget.type === 'skills' ? 'Technologies declared by the profile owner: ' + config.content.skills.join(', ') :
        widget.type === 'now' ? 'Learning: ' + config.content.learning.join(', ') + '. Building: ' + config.content.building.join(', ') :
        widget.type === 'timeline' ? config.content.timeline.join('. ') : widget.title || 'Section divider';
      item(widget.id, config.locale === 'pt-BR' ? blockDescription(widget.type, config, data, { stamp }) : description);
    }
    for (const mode of MODES) {
      const theme = { ...resolveTheme(config.theme, mode, config.appearance), locale: config.locale };
      if (widget.type === 'projects') {
        projects.forEach((p, i) => {
          const fullName = p.repo.includes('/') ? p.repo : config.login + '/' + p.repo;
          add(section.items[i].name + '-' + mode + '.svg', family.render({ type: widget.type, theme, config, data, now, project: p, repo: data.repos[fullName.toLowerCase()] ?? data.repos[p.repo], index: i, stamp, ownerName }));
        });
      } else if (widget.type === 'contacts') {
        config.contacts.forEach((c, i) => add(section.items[i].name + '-' + mode + '.svg', family.render({ type: widget.type, theme, config, data, now, contact: c, stamp, ownerName })));
      } else {
        const svg = family.render({ type: widget.type, theme, config, data, now, title: widget.title, stamp, ownerName });
        add(widget.id + '-' + mode + '.svg', svg);
      }
    }
    if (section.items.length) sections.push(section);
  }
  files['README.snippet.md'] = renderSnippet(config, data, projects, sections);
  return files;
}
