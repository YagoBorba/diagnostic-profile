import { document, monoWidth, panel, text, wrap } from '../svg.mjs';

const WIDTH = 580;
const HEIGHT = 210;
const ACTIVE_WINDOW = 1000 * 60 * 60 * 24 * 60;

export function renderProject(theme, project, index, repo, now) {
  const pushed = repo?.pushedAt ? new Date(repo.pushedAt) : null;
  const active = Boolean(pushed && now - pushed < ACTIVE_WINDOW);
  const status = active ? 'ACTIVE' : 'STABLE';
  const statusColor = active ? theme.ok : theme.signal;
  const pillWidth = monoWidth(status, 11) + 34;
  const pillX = WIDTH - 24 - pillWidth;

  const lines = wrap(project.summary, 66, 3)
    .map((line, lineIndex) => text(24, 110 + lineIndex * 21, line, { size: 14, fill: theme.muted }))
    .join('');

  const month = pushed ? pushed.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : '';
  const meta = [`★ ${repo?.stargazerCount ?? 0}`, month].filter(Boolean).join('  ·  ');
  const chipLimit = WIDTH - 24 - monoWidth(meta, 12) - 16;

  let chipX = 24;
  const chips = [];
  for (const tag of project.tags) {
    const chipWidth = monoWidth(tag, 11) + 18;
    if (chipX + chipWidth > chipLimit) break;
    chips.push(
      `<rect x="${chipX}" y="168" width="${chipWidth}" height="22" rx="5" fill="${theme.inset}" stroke="${theme.border}"/>` +
        text(chipX + 9, 183, tag, { cls: 'mono', size: 11, fill: theme.text }),
    );
    chipX += chipWidth + 8;
  }

  const moduleLabel = `MOD-${String(index + 1).padStart(2, '0')}  ·  ${project.kind.toUpperCase()}`;
  const titleSize = Math.min(26, Math.floor((pillX - 40) / Math.max(1, project.title.length * 0.6)));

  const body = `
${panel(WIDTH, HEIGHT, theme)}
<rect x="0.5" y="24" width="3" height="20" fill="${theme.accent}"/>
${text(24, 39, moduleLabel, { cls: 'mono', size: 12, fill: theme.muted, extra: ' letter-spacing="1"' })}
<rect x="${pillX}" y="22" width="${pillWidth}" height="22" rx="11" fill="none" stroke="${theme.border}"/>
<circle cx="${pillX + 13}" cy="33" r="4" fill="${statusColor}"/>
${text(pillX + 24, 37, status, { cls: 'mono', size: 11, fill: statusColor })}
${text(24, 80, project.title, { size: titleSize, weight: 700, fill: theme.text })}
${lines}
${chips.join('')}
${text(WIDTH - 24, 184, meta, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
`;

  const built = project.tags.length ? ` Built with ${project.tags.join(', ')}.` : '';
  return document({
    width: WIDTH,
    height: HEIGHT,
    title: `${project.title} — ${project.kind}`,
    desc: `${project.summary}${built} Status: ${status.toLowerCase()}.`.trim(),
    body,
  });
}
