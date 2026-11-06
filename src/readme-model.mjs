import { normalizeConfig } from './config.mjs';
import { t } from './i18n.mjs';

export function readmeModel(input) {
  const c = normalizeConfig(input), blocks = [], locale = c.locale;
  const heading = (w) => { if (c.layout.headings) blocks.push({ kind: 'heading', level: 2, text: w.title || t(locale, w.type) }); };
  const list = (items) => blocks.push({ kind: 'list', items: items.map((item) => typeof item === 'string' ? { text: item } : item) });
  for (const w of c.widgets.filter((entry) => entry.enabled)) {
    if (w.type === 'header') {
      blocks.push({ kind: 'heading', level: 1, text: c.header.name || c.login });
      if (c.header.headline) blocks.push({ kind: 'paragraph', text: c.header.headline });
      if (c.header.tags.length) blocks.push({ kind: 'paragraph', text: c.header.tags.join(' · ') });
      c.header.readouts.filter((r) => r.value).forEach((r) => blocks.push({ kind: 'paragraph', label: r.label, text: r.value }));
    } else if (w.type === 'projects') {
      if (c.projects === 'pinned') {
        heading(w); list([{ label: t(locale, 'inspect'), url: 'https://github.com/' + c.login + '?tab=repositories' }]);
      } else if (c.projects.length) {
        heading(w); list(c.projects.map((p) => ({ label: p.title || p.repo, url: p.url || 'https://github.com/' + (p.repo.includes('/') ? p.repo : c.login + '/' + p.repo), description: p.summary, tags: p.tags })));
      }
    } else if (w.type === 'contacts' && c.contacts.length) {
      heading(w); list(c.contacts.map((entry) => ({ label: entry.label, url: entry.url })));
    } else if (['skills', 'timeline'].includes(w.type) && c.content[w.type].length) {
      heading(w); list(c.content[w.type]);
    } else if (w.type === 'now' && (c.content.learning.length || c.content.building.length)) {
      heading(w);
      for (const key of ['learning', 'building']) if (c.content[key].length) {
        blocks.push({ kind: 'label', text: t(locale, key) }); list(c.content[key]);
      }
    } else if (w.type === 'divider') blocks.push({ kind: 'divider' });
  }
  return blocks;
}
