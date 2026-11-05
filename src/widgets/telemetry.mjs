import { arc, document, esc, fmt, niceCeil, panel, text } from '../svg.mjs';

const WIDTH = 1200;
const HEIGHT = 430;

function gauge(theme, value) {
  const cx = 180;
  const cy = 196;
  const r = 104;
  const start = 150;
  const sweep = 240;
  const max = niceCeil(value * 1.15);
  const ratio = Math.min(1, value / max);
  const ticks = [];
  for (let i = 0; i <= 24; i += 1) {
    const angle = ((start + (sweep / 24) * i) * Math.PI) / 180;
    const major = i % 6 === 0;
    const inner = r - (major ? 28 : 22);
    const outer = r - 16;
    ticks.push(`<line x1="${(cx + inner * Math.cos(angle)).toFixed(2)}" y1="${(cy + inner * Math.sin(angle)).toFixed(2)}" x2="${(cx + outer * Math.cos(angle)).toFixed(2)}" y2="${(cy + outer * Math.sin(angle)).toFixed(2)}" stroke="${major ? theme.muted : theme.border}" stroke-width="${major ? 2 : 1}"/>`);
  }
  const needle = ((start + sweep * ratio) * Math.PI) / 180;
  const valueArc = ratio > 0 ? arc(cx, cy, r, start, start + sweep * ratio) : '';

  const markup = `
<path d="${arc(cx, cy, r, start, start + sweep)}" fill="none" stroke="${theme.grid}" stroke-width="12" stroke-linecap="round"/>
${valueArc ? `<path class="fill" d="${valueArc}" pathLength="1" fill="none" stroke="${theme.accent}" stroke-width="12" stroke-linecap="round"/>` : ''}
${ticks.join('')}
<g class="needle" style="transform-origin:${cx}px ${cy}px">
<line x1="${cx}" y1="${cy}" x2="${(cx + (r - 34) * Math.cos(needle)).toFixed(2)}" y2="${(cy + (r - 34) * Math.sin(needle)).toFixed(2)}" stroke="${theme.signal}" stroke-width="3" stroke-linecap="round"/>
</g>
<circle cx="${cx}" cy="${cy}" r="7" fill="${theme.panel}" stroke="${theme.signal}" stroke-width="3"/>
${text(cx, cy + 62, fmt(value), { size: 40, weight: 700, fill: theme.text, anchor: 'middle' })}
${text(cx, cy + 84, 'CONTRIBUTIONS · 12 MO', { cls: 'mono', size: 11, fill: theme.muted, anchor: 'middle', extra: ' letter-spacing="1.5"' })}
${text(cx - r * 0.87, cy + r * 0.5 + 26, '0', { cls: 'mono', size: 11, fill: theme.muted, anchor: 'middle' })}
${text(cx + r * 0.87, cy + r * 0.5 + 26, fmt(max), { cls: 'mono', size: 11, fill: theme.muted, anchor: 'middle' })}`;
  return { markup, swing: sweep * ratio };
}

function readouts(theme, totals) {
  const metrics = [
    ['COMMITS', totals.commits, 'LAST 12 MONTHS'],
    ['PULL REQUESTS', totals.pullRequests, 'LAST 12 MONTHS'],
    ['ISSUES', totals.issues, 'LAST 12 MONTHS'],
    ['STARS', totals.stars, 'CURRENT TOTAL'],
    ['PUBLIC REPOS', totals.repositories, 'CURRENT TOTAL'],
    ['FOLLOWERS', totals.followers, 'CURRENT TOTAL'],
  ];
  return metrics
    .map(([label, value, period], index) => {
      const x = 372 + (index % 3) * 164;
      const y = 76 + Math.floor(index / 3) * 104;
      return `<rect x="${x}" y="${y}" width="152" height="92" rx="8" fill="${theme.inset}" stroke="${theme.border}"/>` +
        `<rect x="${x}" y="${y + 18}" width="3" height="16" fill="${theme.accent}"/>` +
        text(x + 16, y + 31, label, { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1"' }) +
        text(x + 16, y + 47, period, { cls: 'mono', size: 9, fill: theme.muted }) +
        text(x + 16, y + 80, fmt(value), { cls: 'mono', size: 30, weight: 700, fill: theme.text });
    })
    .join('');
}

function streakMonitor(theme, streaks) {
  const x = 880;
  const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;
  return `
<rect x="${x}" y="76" width="288" height="196" rx="8" fill="${theme.inset}" stroke="${theme.border}"/>
${text(x + 20, 104, 'STREAK MONITOR', { cls: 'mono', size: 11, fill: theme.signal, extra: ' letter-spacing="1"' })}
<text x="${x + 20}" y="162" class="sans" fill="${theme.text}"><tspan font-size="54" font-weight="700">${streaks.current}</tspan><tspan font-size="16" fill="${theme.muted}" dx="8">${streaks.current === 1 ? 'day' : 'days'}</tspan></text>
${text(x + 20, 186, 'CURRENT STREAK', { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1"' })}
<line x1="${x + 20}" y1="204" x2="${x + 268}" y2="204" stroke="${theme.border}"/>
${text(x + 20, 230, 'LONGEST (12 MO)', { cls: 'mono', size: 12, fill: theme.muted })}
${text(x + 268, 230, plural(streaks.longest, 'day'), { cls: 'mono', size: 12, fill: theme.text, anchor: 'end' })}
${text(x + 20, 254, 'BEST DAY', { cls: 'mono', size: 12, fill: theme.muted })}
${text(x + 268, 254, plural(streaks.bestDay, 'contribution'), { cls: 'mono', size: 12, fill: theme.text, anchor: 'end' })}`;
}

function languageMix(theme, languages) {
  const barX = 32;
  const barW = WIDTH - 64;
  const gap = 3;
  const usable = barW - gap * Math.max(0, languages.length - 1);
  let cursor = barX;
  const segments = languages
    .map((entry) => {
      const segmentWidth = Math.max(2, usable * entry.share);
      const rect = `<rect x="${cursor.toFixed(2)}" y="334" width="${segmentWidth.toFixed(2)}" height="12" fill="${entry.color ?? theme.muted}"/>`;
      cursor += segmentWidth + gap;
      return rect;
    })
    .join('');
  const slot = barW / Math.max(1, languages.length);
  const legend = languages
    .map((entry, index) => {
      const x = barX + index * slot;
      return `<circle cx="${x + 5}" cy="377" r="5" fill="${entry.color ?? theme.muted}"/>` +
        `<text x="${x + 16}" y="381" class="mono" font-size="12"><tspan fill="${theme.text}">${esc(entry.name)}</tspan><tspan fill="${theme.muted}" dx="7">${(entry.share * 100).toFixed(1)}%</tspan></text>`;
    })
    .join('');
  return `
<defs><clipPath id="bar"><rect x="${barX}" y="334" width="${barW}" height="12" rx="6"/></clipPath></defs>
<line x1="0" y1="300" x2="${WIDTH}" y2="300" stroke="${theme.border}"/>
${text(32, 322, 'LANGUAGE MIX  //  PUBLIC REPOSITORIES BY CODE SIZE', { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1"' })}
<rect x="${barX}" y="334" width="${barW}" height="12" rx="6" fill="${theme.grid}"/>
<g clip-path="url(#bar)" class="grow">${segments}</g>
${legend}`;
}

export function renderTelemetry(theme, data, stamp) {
  const { totals, streaks, languages } = data;
  const dial = gauge(theme, totals.contributions);

  const body = `
${panel(WIDTH, HEIGHT, theme)}
${text(32, 34, 'TELEMETRY  //  GITHUB OVERVIEW', { cls: 'mono', size: 13, fill: theme.muted, extra: ' letter-spacing="1"' })}
${text(WIDTH - 32, 34, `SOURCE GITHUB GRAPHQL API  ·  ${stamp}`, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
<line x1="0" y1="52" x2="${WIDTH}" y2="52" stroke="${theme.border}"/>
${dial.markup}
${readouts(theme, totals)}
${streakMonitor(theme, streaks)}
${languageMix(theme, languages)}
`;

  const css = `
.fill{stroke-dasharray:1;animation:draw 1.8s ease-out both}
.needle{animation:swing 1.8s cubic-bezier(.3,1.4,.5,1) both}
.grow{animation:fade 1.2s ease-out both}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes swing{from{transform:rotate(-${dial.swing.toFixed(1)}deg)}to{transform:rotate(0)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
`;

  const languageSummary = languages.map((entry) => `${entry.name} ${(entry.share * 100).toFixed(1)}%`).join(', ');
  return document({
    width: WIDTH,
    height: HEIGHT,
    title: 'GitHub overview: contribution period and current totals',
    desc: `${fmt(totals.contributions)} contributions, ${fmt(totals.commits)} commits, ${fmt(totals.pullRequests)} pull requests, ${fmt(totals.issues)} issues in the last 12 months. Current totals: ${fmt(totals.stars)} stars, ${totals.repositories} public repositories, ${totals.followers} followers. Current streak ${streaks.current} days, longest in the reported 12 months ${streaks.longest} days. Current language mix by public code size: ${languageSummary || 'no data'}.`,
    css,
    body,
  });
}
