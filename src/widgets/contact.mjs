import { document, panel, text } from '../svg.mjs';

export function renderContact(theme, contact, ownerName) {
  const width = 220;
  const height = 52;
  const labelSize = contact.label.length > 15 ? 14 : 16;
  const body = `
${panel(width, height, theme, 10)}
<rect x="12" y="12" width="28" height="28" rx="6" fill="none" stroke="${theme.accent}"/>
${text(26, 31, contact.glyph, { cls: 'mono', size: 13, weight: 700, fill: theme.accent, anchor: 'middle' })}
${text(54, 32, contact.label, { size: labelSize, weight: 600, fill: theme.text })}
${text(width - 16, 32, '↗', { size: 16, fill: theme.muted, anchor: 'end' })}
`;
  return document({ width, height, title: contact.label, desc: `Contact ${ownerName} via ${contact.label}`, body });
}
