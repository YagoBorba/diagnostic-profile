import { legacyLabel, number } from '../i18n.mjs';
import { document, text } from '../svg.mjs';

export function renderFooter(theme, message, stamp) {
  const width = 1200;
  const height = 48;
  const line = `${legacyLabel(theme.locale, 'END OF REPORT')}  ·  ${message.toUpperCase()}  ·  ${legacyLabel(theme.locale, 'LAST SCAN')} ${stamp}`;
  const body = `
<line x1="0" y1="8" x2="${width}" y2="8" stroke="${theme.border}" stroke-dasharray="4 6"/>
${text(width / 2, 36, line, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'middle', extra: ' letter-spacing="1"' })}
`;
  return document({ width, height, title: 'End of report', desc: `Profile assets last generated ${stamp}`, body });
}
