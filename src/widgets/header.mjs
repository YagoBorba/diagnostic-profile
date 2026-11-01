import { document, esc, fmt, monoWidth, panel, smoothPath, text } from '../svg.mjs';

const WIDTH = 1200;
const HEIGHT = 380;
const SCOPE = { x: 740, y: 76, w: 428, h: 228 };

function oscilloscope(theme) {
  const plot = { x: SCOPE.x + 1, y: SCOPE.y + 40, w: SCOPE.w - 2, h: SCOPE.h - 64 };
  const period = plot.w / 2;
  const span = plot.w + period;
  const analog = [];
  for (let i = 0; i <= 180; i += 1) {
    const t = (i / 180) * (span / period);
    const wave = 0.55 * Math.sin(2 * Math.PI * t) + 0.28 * Math.sin(6 * Math.PI * t + 0.6) + 0.12 * Math.sin(14 * Math.PI * t + 1.1);
    analog.push([plot.x + t * period, plot.y + plot.h * 0.36 - wave * plot.h * 0.3]);
  }
  const trace = smoothPath(analog);
  const bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1];
  const bitWidth = period / bits.length;
  const high = plot.y + plot.h * 0.8;
  const low = plot.y + plot.h * 0.95;
  const bus = Array.from({ length: Math.ceil(span / bitWidth) }, (_, index) => {
    const x = plot.x + index * bitWidth;
    const y = bits[index % bits.length] ? high : low;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y} L${(x + bitWidth).toFixed(1)},${y}`;
  }).join(' ');

  const grid = [];
  for (let i = 1; i < 10; i += 1) {
    const x = SCOPE.x + (SCOPE.w / 10) * i;
    grid.push(`<line x1="${x}" y1="${SCOPE.y + 1}" x2="${x}" y2="${SCOPE.y + SCOPE.h - 1}"/>`);
  }
  for (let i = 1; i < 6; i += 1) {
    const y = SCOPE.y + (SCOPE.h / 6) * i;
    grid.push(`<line x1="${SCOPE.x + 1}" y1="${y}" x2="${SCOPE.x + SCOPE.w - 1}" y2="${y}"/>`);
  }

  const markup = `
<rect x="${SCOPE.x}" y="${SCOPE.y}" width="${SCOPE.w}" height="${SCOPE.h}" rx="8" fill="${theme.inset}" stroke="${theme.border}"/>
<g stroke="${theme.grid}" stroke-width="1">${grid.join('')}</g>
<g clip-path="url(#screen)">
<g class="scroll">
${theme.glow > 0 ? `<path d="${trace}" fill="none" stroke="${theme.accent}" stroke-width="4" opacity="${theme.glow}" filter="url(#glow)"/>` : ''}
<path d="${trace}" fill="none" stroke="${theme.accent}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="${bus}" fill="none" stroke="${theme.signal}" stroke-width="1.8" stroke-linejoin="round"/>
</g>
</g>`;
  return { markup, period };
}

export function renderHeader(theme, config, data) {
  const header = config.header;
  const name = header.name ?? data.name ?? data.login;
  const headline = header.headline ?? data.bio ?? '';
  const nameSize = Math.min(64, Math.floor(680 / Math.max(1, name.length * 0.58)));
  const { markup: scope, period } = oscilloscope(theme);

  const readouts = header.readouts
    .map(({ label, value }, index) => {
      const x = 32 + index * 220;
      return text(x, 268, label.toUpperCase(), { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1.5"' }) +
        text(x, 290, value, { cls: 'mono', size: 15, fill: theme.text });
    })
    .join('');

  const link = `github.com/${data.login}`;
  const chipLimit = WIDTH - 64 - monoWidth(link, 12) - 24;
  let chipX = 32;
  const chips = [];
  header.tags.forEach((label, index) => {
    const code = `PID ${String(index + 1).padStart(2, '0')}`;
    const chipWidth = monoWidth(`${code}  ${label}`, 12) + 24;
    if (chipX + chipWidth > chipLimit) return;
    chips.push(
      `<rect x="${chipX}" y="324" width="${chipWidth}" height="28" rx="14" fill="none" stroke="${theme.border}"/>` +
        `<text x="${chipX + 12}" y="342" class="mono" font-size="12"><tspan fill="${theme.accent}">${code}</tspan><tspan fill="${theme.text}" dx="${monoWidth('  ', 12)}">${esc(label)}</tspan></text>`,
    );
    chipX += chipWidth + 12;
  });

  const status = 'LINK ESTABLISHED';
  const statusX = WIDTH - 32 - monoWidth(status, 13);
  const code = data.login.slice(0, 2).toUpperCase();

  const body = `
<defs>${theme.glow > 0 ? '<filter id="glow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>' : ''}
<clipPath id="screen"><rect x="${SCOPE.x}" y="${SCOPE.y}" width="${SCOPE.w}" height="${SCOPE.h}" rx="8"/></clipPath>
</defs>
${panel(WIDTH, HEIGHT, theme)}
${text(32, 34, `${code}-01  //  ${header.systemLabel.toUpperCase()}  //  SYSTEM SCAN`, { cls: 'mono', size: 13, fill: theme.muted, extra: ' letter-spacing="1"' })}
<circle class="pulse" cx="${statusX - 14}" cy="29.5" r="5" fill="${theme.ok}"/>
${text(WIDTH - 32, 34, status, { cls: 'mono', size: 13, fill: theme.ok, anchor: 'end' })}
<line x1="0" y1="52" x2="${WIDTH}" y2="52" stroke="${theme.border}"/>
${text(32, 104, header.prompt, { cls: 'mono', size: 15, fill: theme.accent })}
<rect class="cursor" x="${32 + monoWidth(header.prompt, 15) + 6}" y="92" width="9" height="16" fill="${theme.accent}"/>
${text(32, 176, name, { size: nameSize, weight: 700, fill: theme.text, extra: ' letter-spacing="-1"' })}
${text(32, 218, headline, { size: 22, fill: theme.muted })}
${readouts}
${scope}
<text x="${SCOPE.x + 16}" y="${SCOPE.y + 24}" class="mono" font-size="11" letter-spacing="1"><tspan fill="${theme.accent}">CH1 ANALOG</tspan><tspan fill="${theme.signal}" dx="16">CH2 DATA BUS</tspan></text>
${text(SCOPE.x + SCOPE.w - 16, SCOPE.y + 24, 'LIVE', { cls: 'mono', size: 11, fill: theme.muted, anchor: 'end' })}
${text(SCOPE.x + 16, SCOPE.y + SCOPE.h - 8, 'SIGNAL NOMINAL', { cls: 'mono', size: 11, fill: theme.muted })}
${text(SCOPE.x + SCOPE.w - 16, SCOPE.y + SCOPE.h - 8, `${fmt(data.totals.contributions)} CONTRIBUTIONS / 12 MO`, { cls: 'mono', size: 11, fill: theme.muted, anchor: 'end' })}
${chips.join('')}
${text(WIDTH - 32, 343, link, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
`;

  const css = `
.pulse{animation:pulse 2s ease-in-out infinite}
.cursor{animation:blink 1.1s steps(1) infinite}
.scroll{animation:scroll 6s linear infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes blink{0%,50%{opacity:1}50.01%,100%{opacity:0}}
@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-${period}px)}}
`;

  const focus = header.tags.length ? ` Focus areas: ${header.tags.join(', ')}.` : '';
  return document({
    width: WIDTH,
    height: HEIGHT,
    title: headline ? `${name} — ${headline}` : name,
    desc: `Profile header styled as a diagnostic console.${focus} An oscilloscope shows an animated analog signal and data bus, next to ${fmt(data.totals.contributions)} GitHub contributions in the last 12 months.`,
    css,
    body,
  });
}
