import { document, esc, fmt, panel, text, wrap } from '../svg.mjs';

export function renderSimple(theme, type, config, data, title = '') {
  const compact = config.layout.type === 'compact' || config.appearance.density === 'compact';
  const width = compact ? 360 : config.layout.type === 'grid' ? 600 : 1200;
  const pad = 24;
  const color = theme.text;
  const muted = theme.muted;
  const line = (x, y, value, size = 16, fill = color, extra = {}) => text(x, y, value, { size, fill, ...extra });
  let body = '';
  let height = 200;
  let desc = '';
  let heading = title;
  const rows = (items, start, maxChars = Math.floor((width - pad * 2) / 9.6)) => {
    let y = start;
    let markup = '';
    for (const item of items) {
      for (const content of wrap(item, maxChars, 3)) { markup += line(pad, y, content, 16); y += 25; }
      y += 8;
    }
    return { markup, end: y };
  };
  if (type === 'header') {
    const name = config.header.name ?? data.name ?? data.login;
    const headline = config.header.headline ?? data.bio ?? '';
    heading ||= config.appearance.family === 'terminal' ? '$ whoami' : config.header.systemLabel;
    const nameLines = wrap(name, Math.floor((width - pad * 2) / ((compact ? 32 : 40) * 0.6)), 3);
    const headlineLines = wrap(headline, Math.floor((width - pad * 2) / 12), 3);
    let y = 98;
    nameLines.forEach((s) => { body += line(pad, y, s, compact ? 32 : 40, color, { weight: 700 }); y += compact ? 40 : 48; });
    headlineLines.forEach((s) => { body += line(pad, y, s, 20, muted); y += 28; });
    const readouts = config.header.readouts.map((r) => r.label + ': ' + r.value);
    if (readouts.length) {
      const rendered = rows(readouts, y + 16);
      body += rendered.markup; y = rendered.end;
    }
    if (config.header.tags.length) {
      const rendered = rows([config.header.tags.join(' · ')], y + 14);
      body += rendered.markup; y = rendered.end;
    }
    height = y + 20;
    desc = name + '. ' + headline + '. ' + readouts.join('. ');
  } else if (type === 'telemetry') {
    heading ||= 'GitHub overview';
    const metrics = [
      ['CONTRIBUTIONS · 12 MO', data.totals.contributions], ['COMMITS · 12 MO', data.totals.commits],
      ['PULL REQUESTS · 12 MO', data.totals.pullRequests], ['ISSUES · 12 MO', data.totals.issues],
      ['STARS · CURRENT', data.totals.stars], ['PUBLIC REPOS · CURRENT', data.totals.repositories],
      ['FOLLOWERS · CURRENT', data.totals.followers], ['CURRENT STREAK · DAYS', data.streaks.current],
    ];
    const columns = compact ? 1 : width <= 600 ? 2 : 4;
    const slot = (width - pad * 2) / columns;
    metrics.forEach(([label, value], i) => {
      const x = pad + (i % columns) * slot, y = 84 + Math.floor(i / columns) * 90;
      body += line(x, y, label, compact ? 14 : 12, muted, { cls: 'mono' });
      body += line(x, y + 39, fmt(value), 32, theme.accent, { weight: 700 });
    });
    const y = 92 + Math.ceil(metrics.length / columns) * 90;
    const languages = data.languages.map((l) => l.name + ' ' + (l.share * 100).toFixed(1) + '%').join(' · ');
    const rendered = rows(['Language mix by public code size', languages || 'No language data'], y);
    body += rendered.markup; height = rendered.end + 10;
    desc = metrics.map(([label, value]) => label + ': ' + value).join('. ') + '. ' + languages;
  } else if (type === 'spectrum') {
    heading ||= 'Contributions per week · log scale';
    const values = data.weekly;
    const peak = Math.max(0, ...values.map((w) => w.count));
    const step = (width - pad * 2) / Math.max(1, values.length);
    height = compact ? 240 : 260;
    const floor = height - 44;
    values.forEach((w, i) => {
      const h = w.count ? Math.max(3, Math.log1p(w.count) / Math.log1p(Math.max(1, peak)) * (height - 120)) : 2;
      body += '<rect x="' + (pad + i * step).toFixed(2) + '" y="' + (floor - h).toFixed(2) + '" width="' + Math.max(2, step - 2).toFixed(2) + '" height="' + h.toFixed(2) + '" fill="' + (w.count ? theme.accent : theme.grid) + '"/>';
    });
    body += line(pad, height - 17, 'Peak: ' + peak + ' · Active weeks: ' + values.filter((w) => w.count).length + '/' + values.length, 14, muted);
    desc = 'Weekly contribution chart. Peak ' + peak + '. ' + values.map((w) => w.start + ': ' + w.count).join('; ');
  } else if (type === 'heatmap') {
    heading ||= 'Contribution calendar';
    const days = data.calendar ?? [];
    const offset = days[0] ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0;
    const cols = Math.max(1, Math.ceil((days.length + offset) / 7));
    const cell = Math.min(18, (width - pad * 2) / cols);
    const max = Math.max(1, ...days.map((d) => d.contributionCount));
    days.forEach((day, i) => {
      const n = i + offset;
      const x = pad + Math.floor(n / 7) * cell, y = 72 + (n % 7) * cell;
      const opacity = day.contributionCount ? 0.35 + 0.65 * Math.log1p(day.contributionCount) / Math.log1p(max) : 1;
      body += '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + (cell - 1).toFixed(2) + '" height="' + (cell - 1).toFixed(2) + '" rx="1" fill="' + (day.contributionCount ? theme.accent : theme.grid) + '" opacity="' + opacity.toFixed(2) + '"><title>' + esc(day.date + ': ' + day.contributionCount) + '</title></rect>';
    });
    height = 110 + cell * 7;
    body += line(pad, height - 15, days.length ? days[0].date + ' — ' + days.at(-1).date : 'No calendar data', 14, muted);
    desc = 'GitHub contribution calendar. ' + data.totals.contributions + ' contributions in the reported period.';
  } else if (type === 'footer') {
    heading ||= 'End of report';
    const rendered = rows([config.footer.message, data.generatedAt ?? ''], 82);
    body += rendered.markup; height = rendered.end + 10;
    desc = config.footer.message + '. Last scan ' + (data.generatedAt ?? '');
  } else if (type === 'divider') {
    heading ||= 'Next chapter';
    height = 68;
    body += '<line x1="' + pad + '" y1="54" x2="' + (width - pad) + '" y2="54" stroke="' + theme.border + '"/>';
    desc = heading;
  } else {
    const items = type === 'skills' ? config.content.skills : type === 'timeline' ? config.content.timeline :
      [...config.content.learning.map((x) => 'Learning: ' + x), ...config.content.building.map((x) => 'Building: ' + x)];
    heading ||= ({ skills: 'Technologies I use', timeline: 'Milestones', now: 'Currently' })[type] ?? type;
    const rendered = rows(items.length ? items : ['Add your own items in the configuration.'], 88);
    body += rendered.markup;
    height = Math.max(144, rendered.end + 10);
    desc = heading + '. ' + (items.length ? items.join('. ') : 'No items supplied.');
  }
  const status = config.appearance.family === 'terminal' ? '> ' : '';
  body = panel(width, height, theme, config.appearance.family === 'minimal' ? 4 : 12) +
    line(pad, 35, wrap(status + heading, Math.floor((width - pad * 2) / 10.8), 1)[0] ?? '', compact ? 16 : 18, theme.accent, { weight: 600 }) + body;
  const accessibleTitle = type === 'header' ? (config.header.name ?? data.name ?? data.login) + (config.header.headline ? ' — ' + config.header.headline : '') : heading;
  return document({ width, height, title: accessibleTitle, desc, body });
}
