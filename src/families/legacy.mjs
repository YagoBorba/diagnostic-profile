import { textColumns } from '../svg.mjs';
import { renderContact } from '../widgets/contact.mjs';
import { renderFooter } from '../widgets/footer.mjs';
import { renderHeader } from '../widgets/header.mjs';
import { renderProject, renderCompactProject } from '../widgets/project.mjs';
import { renderSpectrum } from '../widgets/spectrum.mjs';
import { renderTelemetry } from '../widgets/telemetry.mjs';
import { renderSimple } from '../widgets/simple.mjs';
import { t } from '../i18n.mjs';

// The v0.1.0 renderer is retained as a compatibility implementation of the contract.
export function renderLegacy({ type, theme, config, data, now, project, repo, index, contact, title, stamp, ownerName }) {
  const compact = config.layout.type === 'compact' || config.appearance.density === 'compact';
  const simple = config.appearance.family !== 'diagnostic' || compact || !config.appearance.decorations;
  if (type === 'projects') return (compact ? renderCompactProject : renderProject)(theme, project, index, repo, now);
  if (type === 'contacts') return renderContact(theme, contact, ownerName);
  if (type === 'header' && !simple && textColumns(ownerName) <= 36 && textColumns(config.header.headline ?? data.bio ?? '') <= 55 && textColumns(config.header.prompt) < 65 && textColumns(config.header.systemLabel) < 45 && config.header.readouts.every((r) => textColumns(r.value) <= 24 && textColumns(r.label) <= 24)) return renderHeader(theme, config, data);
  if (type === 'telemetry' && !simple) return renderTelemetry(theme, data, stamp);
  if (type === 'spectrum' && !simple) return renderSpectrum(theme, data.weekly);
  if (type === 'footer' && data.source === 'manual') return renderSimple(theme, type, config, { ...data, generatedAt: t(config.locale, 'manual') }, title);
  if (type === 'footer' && !compact && config.footer.message.length <= 45) return renderFooter(theme, config.footer.message, stamp);
  return renderSimple(theme, type, config, { ...data, generatedAt: stamp }, title);
}
