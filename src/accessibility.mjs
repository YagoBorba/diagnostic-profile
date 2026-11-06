import { t, number } from './i18n.mjs';
import { esc } from './svg.mjs';

export function blockDescription(type, config, data, { project, contact, stamp = '' } = {}) {
  const locale = config.locale;
  if (type === 'header') return [config.header.name || data.name || config.login, config.header.headline ?? data.bio ?? '', ...config.header.readouts.map((r) => r.label + ': ' + r.value), ...config.header.tags].filter(Boolean).join('. ');
  if (type === 'projects') return project.title + '. ' + project.summary + (project.tags.length ? '. ' + t(locale, 'skills') + ': ' + project.tags.join(', ') : '');
  if (type === 'contacts') return t(locale, 'contacts') + ': ' + contact.label;
  if (type === 'telemetry') return ['contributions', 'commits', 'pullRequests', 'issues', 'stars', 'repositories', 'followers'].map((key) => t(locale, key) + ': ' + number(locale, data.totals[key])).join('. ');
  if (type === 'skills' || type === 'timeline') return t(locale, type) + ': ' + config.content[type].join(', ');
  if (type === 'now') return [t(locale, 'learning') + ': ' + config.content.learning.join(', '), t(locale, 'building') + ': ' + config.content.building.join(', ')].join('. ');
  if (type === 'footer') return [config.footer.message, data.source === 'manual' ? t(locale, 'manual') : t(locale, 'updated') + ': ' + stamp].filter(Boolean).join('. ');
  return t(locale, type) + (type === 'spectrum' ? '. ' + data.weekly.map((v) => v.start + ': ' + number(locale, v.count)).join('; ') : type === 'heatmap' ? '. ' + data.calendar.map((v) => v.date + ': ' + number(locale, v.contributionCount)).join('; ') : '');
}
export function localizeMetadata(svg, context) {
  if (context.config.locale !== 'pt-BR') return svg;
  const desc = blockDescription(context.type, context.config, context.data, context);
  const title = context.type === 'header' ? context.config.header.name || context.data.name || context.config.login : context.type === 'projects' ? context.project.title : context.type === 'contacts' ? context.contact.label : context.title || t(context.config.locale, context.type);
  return svg.replace(/<title id="title">[\s\S]*?<\/title>/, '<title id="title">' + esc(title) + '</title>')
    .replace(/<desc id="desc">[\s\S]*?<\/desc>/, '<desc id="desc">' + esc(desc) + '</desc>');
}
