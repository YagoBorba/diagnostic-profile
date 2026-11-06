import { getFamily } from './families.mjs';
import { resolveTheme } from './themes.mjs';
import { document } from './svg.mjs';
import { resolveProjects } from './config.mjs';

// Three renderer calls, one mode: no full asset build or hidden calendar rendering.
export function renderThumbnail(config, data) {
  const family = getFamily(config.appearance.family);
  const reduced = { ...config, layout: { ...config.layout, type: 'compact' }, appearance: { ...config.appearance, motion: 'none' },
    header: { ...config.header, readouts: [], tags: [] } };
  const theme = resolveTheme(config.theme, 'dark', config.appearance);
  const context = { config: reduced, theme, data, now: new Date('2026-10-31T12:00:00Z'), stamp: '', ownerName: config.header.name || data.name || config.login };
  const renderers = [family.render({ ...context, type: 'header', title: '' })];
  const project = resolveProjects(config, data)[0];
  if (project) renderers.push(family.render({ ...context, type: 'projects', project: { ...project, summary: project.summary.slice(0, 120), tags: project.tags.slice(0, 2) }, index: 0 }));
  if (config.contacts[0]) renderers.push(family.render({ ...context, type: 'contacts', contact: config.contacts[0] }));
  let y = 0;
  const body = renderers.map((svg) => {
    const h = Number(svg.match(/height="([\d.]+)"/)[1]);
    const width = Number(svg.match(/width="([\d.]+)"/)[1]);
    const height = h * 360 / width;
    const nested = svg.replace('<svg ', '<svg x="0" y="' + y + '" ').replace(/width="[\d.]+" height="[\d.]+"/, 'width="360" height="' + height + '"')
      .replace(/<title id="title">[\s\S]*?<\/title>|<desc id="desc">[\s\S]*?<\/desc>/g, '').replace('aria-labelledby="title desc"', 'aria-hidden="true"');
    y += height + 12;
    return nested;
  }).join('');
  return document({ width: 360, height: y, title: family.name, desc: 'Composição de apresentação, projeto e contato. Dados fictícios.', body });
}
