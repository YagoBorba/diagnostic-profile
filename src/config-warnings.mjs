const known = {
  '': ['$schema', 'schemaVersion', 'preset', 'presetVersion', 'login', 'theme', 'assetsBaseUrl', 'header', 'projects', 'contacts', 'telemetry', 'footer', 'appearance', 'layout', 'content', 'widgets', 'destination'],
  appearance: ['family', 'motion', 'border', 'density', 'decorations', 'colors'],
  layout: ['type', 'mode', 'markup', 'projectColumns', 'headings', 'textSummary', 'align'],
  colors: ['dark', 'light'],
  palette: ['accent', 'signal', 'panel', 'text'],
  content: ['skills', 'learning', 'building', 'timeline'],
  destination: ['repository', 'branch'],
  widgets: ['id', 'type', 'enabled', 'title'],
  header: ['name', 'headline', 'prompt', 'systemLabel', 'readouts', 'tags'],
  telemetry: ['excludeLanguages', 'languageLimit'], footer: ['message'],
  projects: ['repo', 'title', 'kind', 'summary', 'tags', 'url'],
  contacts: ['id', 'label', 'url', 'glyph'], readouts: ['label', 'value'],
};
export function configWarnings(input) {
  const warnings = [];
  const inspect = (value, kind, path) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    for (const key of Object.keys(value)) {
      if (!known[kind].includes(key)) warnings.push('Unknown configuration field: ' + (path ? path + '.' : '') + key);
    }
  };
  inspect(input, '', '');
  for (const key of ['header', 'telemetry', 'footer', 'appearance', 'layout', 'content', 'destination']) inspect(input?.[key], key, key);
  for (const key of ['projects', 'contacts', 'widgets']) {
    if (Array.isArray(input?.[key])) input[key].forEach((entry, i) => inspect(entry, key, key + '[' + i + ']'));
  }
  inspect(input?.appearance?.colors, 'colors', 'appearance.colors');
  for (const mode of ['dark', 'light']) inspect(input?.appearance?.colors?.[mode], 'palette', 'appearance.colors.' + mode);
  if (Array.isArray(input?.header?.readouts)) input.header.readouts.forEach((entry, i) => inspect(entry, 'readouts', 'header.readouts[' + i + ']'));
  return warnings;
}
