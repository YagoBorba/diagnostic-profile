import { document, monoWidth, panel, text, wrap } from '../svg.mjs';

const WIDTH = 580;
const HEIGHT = 210;
const ACTIVE_WINDOW = 1000 * 60 * 60 * 24 * 60;

function projectMetadata(repo, now) {
  const timestamp = Date.parse(repo?.pushedAt);
  const pushed = Number.isFinite(timestamp) ? new Date(timestamp) : null;
  const status = pushed && now >= pushed ? (now - pushed < ACTIVE_WINDOW ? 'RECENT' : 'OLDER') : 'UNKNOWN';
  return { pushed, status, stars: '★ ' + (repo?.stargazerCount ?? '—'),
    month: pushed ? pushed.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : '' };
}

export function renderProject(theme, project, index, repo, now) {
  const titleLines = wrap(project.title, 32, 2);
  const height = HEIGHT + Math.max(0, titleLines.length - 1) * 28;
  const { pushed, status } = projectMetadata(repo, now);
  const statusColor = status === 'RECENT' ? theme.ok : theme.signal;
  const pillWidth = monoWidth(status, 11) + 34;
  const pillX = WIDTH - 24 - pillWidth;

  const lines = wrap(project.summary, 66, 3)
    .map((line, lineIndex) => text(24, 110 + Math.max(0, titleLines.length - 1) * 28 + lineIndex * 21, line, { size: 14, fill: theme.muted }))
    .join('');

  const month = pushed ? pushed.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : '';
  const meta = [`★ ${repo?.stargazerCount ?? '—'}`, month].filter(Boolean).join('  ·  ');
  const chipLimit = WIDTH - 24 - monoWidth(meta, 12) - 16;

  let chipX = 24;
  const chips = [];
  for (const tag of project.tags) {
    const chipWidth = monoWidth(tag, 11) + 18;
    if (chipX + chipWidth > chipLimit) break;
    chips.push(
      `<rect x="${chipX}" y="${height - 42}" width="${chipWidth}" height="22" rx="5" fill="${theme.inset}" stroke="${theme.border}"/>` +
        text(chipX + 9, height - 27, tag, { cls: 'mono', size: 11, fill: theme.text }),
    );
    chipX += chipWidth + 8;
  }

  const moduleLabel = `MOD-${String(index + 1).padStart(2, '0')}  ·  ${project.kind.toUpperCase()}`;
  const titleSize = 26;

  const body = `
${panel(WIDTH, height, theme)}
<rect x="0.5" y="24" width="3" height="20" fill="${theme.accent}"/>
${text(24, 39, wrap(moduleLabel, 50, 1)[0] ?? '', { cls: 'mono', size: 12, fill: theme.muted, extra: ' letter-spacing="1"' })}
<rect x="${pillX}" y="22" width="${pillWidth}" height="22" rx="11" fill="none" stroke="${theme.border}"/>
<circle cx="${pillX + 13}" cy="33" r="4" fill="${statusColor}"/>
${text(pillX + 24, 37, status, { cls: 'mono', size: 11, fill: statusColor })}
${titleLines.map((line, i) => text(24, 80 + i * 28, line, { size: titleSize, weight: 700, fill: theme.text })).join('')}
${lines}
${chips.join('')}
${text(WIDTH - 24, height - 26, meta, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
`;

  const built = project.tags.length ? ` Built with ${project.tags.join(', ')}.` : '';
  return document({
    width: WIDTH,
    height,
    title: `${project.title} — ${project.kind}`,
    desc: `${project.summary}${built} Status: ${status.toLowerCase()}.`.trim(),
    body,
  });
}

export function renderCompactProject(theme, project, index, repo, now) {
  const width = 360;
  const { status, stars, month } = projectMetadata(repo, now);
  let y = 76;
  let body = text(24, 30, wrap('MOD-' + String(index + 1).padStart(2, '0') + ' · ' + project.kind, 38, 1)[0] ?? '', { cls: 'mono', size: 12, fill: theme.muted });
  for (const line of wrap(project.title, 21, 2)) {
    body += text(24, y, line, { size: 24, weight: 700, fill: theme.text }); y += 30;
  }
  y += 6;
  for (const line of wrap(project.summary, 30, 4)) {
    body += text(24, y, line, { size: 16, fill: theme.muted }); y += 24;
  }
  y += 10;
  for (const line of wrap(project.tags.join(' · '), 40, 2)) {
    body += text(24, y, line, { cls: 'mono', size: 12, fill: theme.accent }); y += 18;
  }
  const height = y + 58;
  body += '<line x1="24" y1="' + (height - 44) + '" x2="336" y2="' + (height - 44) + '" stroke="' + theme.border + '"/>';
  body += text(24, height - 20, [stars, month].filter(Boolean).join(' · '), { cls: 'mono', size: 12, fill: theme.muted });
  body += text(width - 24, height - 20, status, { cls: 'mono', size: 12, fill: status === 'RECENT' ? theme.ok : theme.signal, anchor: 'end' });
  return document({ width, height, title: project.title + ' — ' + project.kind,
    desc: project.summary + '. Technologies: ' + project.tags.join(', ') + '. Push status: ' + status.toLowerCase() + '.',
    body: panel(width, height, theme) + body });
}
