import { document, esc, text, wrap, wrapPixels } from '../svg.mjs';
import { t, number } from '../i18n.mjs';

const frame = {
  workshop: (w, h, c) => '<path d="M16 1H' + (w - 16) + 'L' + (w - 1) + ' 16V' + (h - 16) + 'L' + (w - 16) + ' ' + (h - 1) + 'H16L1 ' + (h - 16) + 'V16Z" fill="' + c.panel + '" stroke="' + c.border + '"/><path d="M14 64V' + (h - 22) + 'H26" fill="none" stroke="' + c.accent + '"/>' + [24, w - 24].map((x) => '<circle cx="' + x + '" cy="20" r="3" fill="none" stroke="' + c.muted + '"/>').join(''),
  fieldbook: (w, h, c) => '<path d="M1 17H' + (w - 100) + 'V1H' + (w - 1) + 'V' + (h - 1) + 'H1Z" fill="' + c.panel + '" stroke="' + c.border + '"/><path d="M34 50V' + (h - 16) + 'M48 68H' + (w - 24) + '" fill="none" stroke="' + c.signal + '"/>' + [87, 111, 135].map((y) => '<circle cx="17" cy="' + y + '" r="3" fill="' + c.border + '"/>').join(''),
  orbital: (w, h, c) => '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" rx="24" fill="' + c.panel + '" stroke="' + c.border + '"/><path d="M20 62H' + (w - 20) + 'M20 ' + (h - 20) + 'H' + (w - 20) + '" stroke="' + c.grid + '"/>' + '<ellipse cx="' + (w - 48) + '" cy="32" rx="28" ry="12" fill="none" stroke="' + c.accent + '" transform="rotate(-25 ' + (w - 48) + ' 32)"/><circle cx="' + (w - 48) + '" cy="32" r="4" fill="' + c.signal + '"/>',
  radio: (w, h, c) => '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" rx="14" fill="' + c.panel + '" stroke="' + c.border + '"/><rect x="1" y="1" width="' + (w - 2) + '" height="54" rx="14" fill="' + c.inset + '"/>' + Array.from({ length: 9 }, (_, i) => '<path d="M' + (w - 100 + i * 9) + ' 22v' + (i % 2 ? 13 : 8) + '" stroke="' + c.accent + '"/>').join('') + '<path d="M20 ' + (h - 16) + 'H' + (w - 20) + '" stroke="' + c.signal + '"/>',
  inventory: (w, h, c) => '<path d="M9 1H' + (w - 9) + 'V9H' + (w - 1) + 'V' + (h - 9) + 'H' + (w - 9) + 'V' + (h - 1) + 'H9V' + (h - 9) + 'H1V9H9Z" fill="' + c.panel + '" stroke="' + c.accent + '" stroke-width="2"/><path d="M10 57H' + (w - 10) + '" stroke="' + c.border + '"/>' + [0, 1, 2].map((i) => '<rect x="' + (w - 60 + i * 14) + '" y="24" width="8" height="8" fill="' + c.signal + '"/>').join(''),
  herbarium: (w, h, c) => '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="' + c.panel + '" stroke="' + c.border + '"/><rect x="8" y="8" width="' + (w - 16) + '" height="' + (h - 16) + '" fill="none" stroke="' + c.grid + '"/><path d="M26 ' + (h - 25) + 'V85m0 30c-16-8-16-20 0-24m0 62c16-8 16-20 0-24" fill="none" stroke="' + c.signal + '"/>',
};

export function renderWorld({ type, theme, config, data, now, project, repo, index = 0, contact, title = '', stamp }) {
  const family = config.appearance.family;
  const locale = config.locale ?? 'en';
  const narrow = config.layout.type === 'compact' || config.appearance.density === 'compact';
  const w = type === 'contacts' ? 360 : type === 'projects' ? (narrow ? 360 : 580) : narrow ? 360 : config.layout.type === 'grid' ? 600 : 960;
  const pad = ['fieldbook', 'herbarium'].includes(family) ? 48 : 28;
  const font = ['fieldbook', 'herbarium'].includes(family) ? 'editorial' : ['workshop', 'radio', 'inventory'].includes(family) ? 'mono' : 'sans';
  let y = family === 'fieldbook' ? 106 : family === 'inventory' ? 98 : 92;
  let content = '', desc = '', label = title || t(locale, type);
  const line = (value, size = 16, color = theme.text, gap = 10, maxLines = 12) => {
    const lines = wrapPixels(value, w - pad * 2, size, { mono: font === 'mono', maxLines });
    for (const entry of lines) { content += text(pad, y, entry, { size, cls: font, fill: color }); y += size * 1.45; }
    if (lines.length) y += gap;
  };
  const item = (value, n) => {
    const marker = family === 'fieldbook' ? String(n + 1).padStart(2, '0') + ' / ' : family === 'inventory' ? '▣ ' : family === 'orbital' ? '↗ ' : family === 'radio' ? '▷ ' : family === 'herbarium' ? '· ' : '+ ';
    line(marker + value);
  };
  if (type === 'header') {
    const name = config.header.name || data.name || config.login;
    label = t(locale, family);
    line(name, narrow ? 30 : family === 'fieldbook' ? 46 : 40, theme.text, 14, 24);
    line(config.header.headline ?? data.bio ?? '', 18, theme.muted, 16);
    config.header.readouts.forEach((r, i) => { if (r.value) item(r.label + ': ' + r.value, i); });
    if (config.header.tags.length) line(config.header.tags.join(' / '), 14, theme.accent);
    desc = [name, config.header.headline ?? data.bio ?? '', ...config.header.readouts.map((r) => r.label + ': ' + r.value)].join('. ');
  } else if (type === 'projects') {
    label = t(locale, family) + ' ' + String(index + 1).padStart(2, '0');
    if (family === 'radio') line((locale === 'pt-BR' ? 'LADO ' : 'SIDE ') + (index % 2 ? 'B' : 'A') + ' / ' + String(index + 1).padStart(2, '0'), 13, theme.signal);
    if (family === 'fieldbook') line(project.kind, 13, theme.muted);
    line(project.title, family === 'herbarium' ? 30 : 26, theme.text, 14);
    if (family !== 'fieldbook') line(project.kind, 13, theme.accent);
    line(project.summary, 16, theme.muted);
    if (project.tags.length) line(project.tags.join(family === 'inventory' ? '  ▣  ' : ' · '), 14, theme.signal);
    if (data.source !== 'manual' && repo?.stargazerCount !== undefined) line(number(locale, repo.stargazerCount) + ' ' + t(locale, 'stars'), 13, theme.muted);
    desc = project.title + '. ' + project.summary + '. ' + project.tags.join(', ');
  } else if (type === 'contacts') {
    label = t(locale, 'contacts');
    line(contact.label + ' ↗', 22, theme.accent);
    desc = contact.label + '. ' + contact.url;
  } else if (type === 'telemetry') {
    const keys = ['contributions', 'commits', 'pullRequests', 'issues', 'stars', 'repositories', 'followers'];
    keys.forEach((key, i) => item(t(locale, key) + ': ' + number(locale, data.totals[key]), i));
    line(t(locale, 'codeSize'), 14, theme.accent);
    data.languages.forEach((entry, i) => item(entry.name + ': ' + new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(entry.share), i));
    desc = keys.map((key) => t(locale, key) + ': ' + number(locale, data.totals[key])).join('. ');
  } else if (type === 'spectrum') {
    const values = data.weekly;
    const peak = Math.max(0, ...values.map((v) => v.count));
    const step = (w - pad * 2) / Math.max(1, values.length);
    values.forEach((v, i) => {
      const h = v.count ? Math.max(3, Math.log1p(v.count) / Math.log1p(Math.max(1, peak)) * 95) : 2;
      content += '<rect x="' + (pad + i * step).toFixed(2) + '" y="' + (y + 100 - h).toFixed(2) + '" width="' + Math.max(1, step - 1).toFixed(2) + '" height="' + h.toFixed(2) + '" fill="' + (v.count ? theme.accent : theme.grid) + '"><title>' + esc(v.start + ': ' + v.count) + '</title></rect>';
    });
    y += 130; line(t(locale, 'peak') + ': ' + number(locale, peak), 14, theme.muted);
    desc = t(locale, 'spectrum') + '. ' + values.map((v) => v.start + ': ' + v.count).join('; ');
  } else if (type === 'heatmap') {
    const days = data.calendar ?? [];
    const offset = days[0] ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0;
    const columns = Math.max(1, Math.ceil((days.length + offset) / 7));
    const cell = Math.min(16, (w - pad * 2) / columns);
    const max = Math.max(1, ...days.map((d) => d.contributionCount));
    days.forEach((d, i) => {
      const n = i + offset;
      content += '<rect x="' + (pad + Math.floor(n / 7) * cell).toFixed(2) + '" y="' + (y + n % 7 * cell).toFixed(2) + '" width="' + Math.max(1, cell - 1).toFixed(2) + '" height="' + Math.max(1, cell - 1).toFixed(2) + '" fill="' + (d.contributionCount ? theme.accent : theme.grid) + '" opacity="' + (d.contributionCount ? 0.4 + 0.6 * d.contributionCount / max : 1).toFixed(2) + '"><title>' + esc(d.date + ': ' + d.contributionCount) + '</title></rect>';
    });
    y += cell * 7 + 30;
    line(days.length ? days[0].date + ' — ' + days.at(-1).date : t(locale, 'noData'), 13, theme.muted);
    desc = t(locale, 'heatmap') + '. ' + days.map((d) => d.date + ': ' + d.contributionCount).join('; ');
  } else if (type === 'footer') {
    line(config.footer.message, 16, theme.muted);
    line(data.source === 'manual' ? t(locale, 'manual') : t(locale, 'updated') + ': ' + stamp, 13, theme.muted);
    desc = config.footer.message;
  } else if (type === 'divider') {
    content += '<path d="M' + pad + ' ' + y + 'H' + (w - pad) + '" stroke="' + theme.signal + '"/>'; y += 8;
    desc = label;
  } else {
    const values = type === 'skills' ? config.content.skills : type === 'timeline' ? config.content.timeline :
      [...config.content.learning.map((s) => t(locale, 'learning') + ': ' + s), ...config.content.building.map((s) => t(locale, 'building') + ': ' + s)];
    (values.length ? values : [t(locale, 'empty')]).forEach(item);
    desc = label + '. ' + values.join('. ');
  }
  const height = Math.max(type === 'divider' ? 110 : 150, Math.ceil(y + 28));
  const titleWidth = w - pad - (['orbital', 'radio', 'inventory'].includes(family) ? 116 : pad);
  const heading = wrap(label.toLocaleUpperCase(locale), Math.max(12, Math.floor(titleWidth / 8)), 2);
  // Ornamentation is confined to the frame. Data never determines decorative positions.
  const chrome = config.appearance.decorations ? frame[family](w, height, theme) : '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (height - 2) + '" fill="' + theme.panel + '" stroke="' + theme.border + '"/>';
  const headingY = family === 'fieldbook' ? 43 : 30;
  const headingMarkup = heading.map((s, i) => text(pad, headingY + i * 17, s, { size: 13, cls: 'mono', fill: theme.accent })).join('');
  return document({ width: w, height, title: type === 'header' ? (config.header.name || data.name || config.login) : type === 'projects' ? project.title : type === 'contacts' ? contact.label : label,
    desc, body: chrome + headingMarkup + content,
    css: '.editorial{font-family:Georgia,"Times New Roman",serif}' });
}
