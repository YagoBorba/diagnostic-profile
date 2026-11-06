import { MONO, MONO_RATIO, SANS } from './themes.mjs';

export const esc = (value) =>
  String(value).toWellFormed().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const graphemes = (value) => Array.from(segmenter.segment(String(value)), (entry) => entry.segment);
const columns = (value) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Extended_Pictographic}]/u.test(value) ? 2 : 1;
export const textColumns = (value) => graphemes(value).reduce((sum, part) => sum + columns(part), 0);
export const monoWidth = (content, size) => textColumns(content) * size * MONO_RATIO;

export const fmt = (value) => new Intl.NumberFormat('en-US').format(value);

export function wrap(content, maxChars, maxLines) {
  if (!Number.isInteger(maxChars) || maxChars < 2 || !Number.isInteger(maxLines) || maxLines < 1) throw new Error('Text wrapping needs positive line limits');
  const lines = [];
  let line = '';
  const words = String(content).trim().split(/\s+/).flatMap((word) => {
    const chunks = [];
    let chunk = '', width = 0;
    for (const part of graphemes(word)) {
      if (width + columns(part) > maxChars && chunk) { chunks.push(chunk); chunk = ''; width = 0; }
      chunk += part; width += columns(part);
    }
    if (chunk) chunks.push(chunk);
    return chunks;
  });
  for (const word of words) {
    const candidate = line ? line + ' ' + word : word;
    if (textColumns(candidate) > maxChars && line) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    const last = graphemes(kept[maxLines - 1]);
    while (textColumns(last.join('')) > maxChars - 1) last.pop();
    kept[maxLines - 1] = last.join('').trimEnd() + '…';
    return kept;
  }
  return lines;
}

// Conservative glyph widths for proportional SVG fonts, without a browser/canvas dependency.
export function wrapPixels(content, maxWidth, size, { mono = false, maxLines = 12 } = {}) {
  const measure = (value) => graphemes(value).reduce((sum, part) => {
    if (mono) return sum + textColumns(part) * size * 0.62;
    const first = part[0];
    const factor = textColumns(part) > 1 ? 2 : /[WMwm@#%&]/.test(first) ? 1 : /[ilI.,:;'!| ]/.test(first) ? 0.36 : /[A-Z]/.test(first) ? 0.84 : first.codePointAt(0) > 127 ? 1.15 : 0.7;
    return sum + size * factor;
  }, 0);
  const words = String(content).trim().split(/\s+/).flatMap((word) => {
    const parts = []; let current = '';
    for (const part of graphemes(word)) {
      if (current && measure(current + part) > maxWidth) { parts.push(current); current = ''; }
      current += part;
    }
    if (current) parts.push(current);
    return parts;
  });
  const lines = []; let current = '';
  for (const word of words) {
    const candidate = current ? current + ' ' + word : word;
    if (current && measure(candidate) > maxWidth) { lines.push(current); current = word; } else current = candidate;
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines), end = graphemes(kept.at(-1));
  while (end.length && measure(end.join('') + '…') > maxWidth) end.pop();
  kept[kept.length - 1] = end.join('') + '…';
  return kept;
}

export function document({ width, height, title, desc, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>
.mono{font-family:${MONO}}
.sans{font-family:${SANS}}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;
}

export const panel = (width, height, theme, radius = 12) =>
  `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${theme.radius ?? radius}" fill="${theme.panel}" stroke="${theme.border}"/>`;

export const text = (x, y, content, { size = 14, fill, cls = 'sans', weight = 400, anchor = 'start', extra = '' } = {}) =>
  `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${extra}>${esc(content)}</text>`;

export function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function arc(cx, cy, r, startDeg, endDeg) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const start = [cx + r * Math.cos(rad(startDeg)), cy + r * Math.sin(rad(startDeg))];
  const end = [cx + r * Math.cos(rad(endDeg)), cy + r * Math.sin(rad(endDeg))];
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${start[0].toFixed(2)},${start[1].toFixed(2)} A${r},${r} 0 ${large} 1 ${end[0].toFixed(2)},${end[1].toFixed(2)}`;
}

export function niceCeil(value) {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return 10 * magnitude;
}
