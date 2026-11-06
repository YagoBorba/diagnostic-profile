import { legacyLabel, number } from '../i18n.mjs';
import { document, fmt, panel, text } from '../svg.mjs';

const WIDTH = 1200;
const HEIGHT = 220;

export function renderSpectrum(theme, weekly) {
  const area = { x: 32, y: 72, w: WIDTH - 64, h: 104 };
  const slot = area.w / Math.max(1, weekly.length);
  const barWidth = Math.max(2, slot - 5);
  const peak = Math.max(0, ...weekly.map((week) => week.count));
  const scale = Math.log1p(Math.max(1, peak));
  const floor = area.y + area.h;

  const bars = weekly
    .map((week, index) => {
      const x = area.x + index * slot + (slot - barWidth) / 2;
      if (week.count === 0) {
        return `<rect x="${x.toFixed(1)}" y="${floor - 2}" width="${barWidth.toFixed(1)}" height="2" fill="${theme.grid}"/>`;
      }
      const height = Math.max(4, (Math.log1p(week.count) / scale) * area.h);
      const fill = index === weekly.length - 1 ? theme.signal : theme.accent;
      return `<rect class="bar" style="animation-delay:${(index * 18).toFixed(0)}ms" x="${x.toFixed(1)}" y="${(floor - height).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" rx="1.5" fill="${fill}"/>`;
    })
    .join('');

  let lastMonth = null;
  const months = weekly
    .map((week, index) => {
      if (!week.start) return '';
      const month = new Date(`${week.start}T00:00:00Z`).toLocaleString(theme.locale ?? 'en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
      if (month === lastMonth) return '';
      lastMonth = month;
      if (index > weekly.length - 3) return '';
      return text(area.x + index * slot, floor + 22, month, { cls: 'mono', size: 11, fill: theme.muted });
    })
    .join('');

  const guides = [0.25, 0.5, 0.75]
    .map((ratio) => `<line x1="${area.x}" y1="${(floor - area.h * ratio).toFixed(1)}" x2="${area.x + area.w}" y2="${(floor - area.h * ratio).toFixed(1)}" stroke="${theme.grid}" stroke-dasharray="2 6"/>`)
    .join('');

  const active = weekly.filter((week) => week.count > 0).length;
  const body = `
${panel(WIDTH, HEIGHT, theme)}
${text(32, 34, legacyLabel(theme.locale, 'SPECTRUM  //  CONTRIBUTIONS PER WEEK  //  LOG SCALE'), { cls: 'mono', size: 13, fill: theme.muted, extra: ' letter-spacing="1"' })}
${text(WIDTH - 32, 34, `${legacyLabel(theme.locale, 'PEAK')} ${number(theme.locale ?? 'en', peak)}  ·  ${legacyLabel(theme.locale, 'ACTIVE WEEKS')} ${active}/${weekly.length}`, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
<line x1="0" y1="52" x2="${WIDTH}" y2="52" stroke="${theme.border}"/>
${guides}
${bars}
${months}
`;

  const css = `
.bar{transform-box:fill-box;transform-origin:50% 100%;animation:rise .9s cubic-bezier(.2,.9,.3,1) both}
@keyframes rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
`;

  return document({
    width: WIDTH,
    height: HEIGHT,
    title: 'Weekly contribution spectrum',
    desc: `Contributions per week over the last ${weekly.length} weeks on a log scale. Peak week: ${fmt(peak)} contributions. Active weeks: ${active} of ${weekly.length}.`,
    css,
    body,
  });
}
