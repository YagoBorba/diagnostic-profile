const known = {
  '': ['$schema', 'schemaVersion', 'login', 'theme', 'assetsBaseUrl', 'header', 'projects', 'contacts', 'telemetry', 'footer'],
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
  for (const key of ['header', 'telemetry', 'footer']) inspect(input?.[key], key, key);
  for (const key of ['projects', 'contacts']) {
    if (Array.isArray(input?.[key])) input[key].forEach((entry, i) => inspect(entry, key, key + '[' + i + ']'));
  }
  if (Array.isArray(input?.header?.readouts)) input.header.readouts.forEach((entry, i) => inspect(entry, 'readouts', 'header.readouts[' + i + ']'));
  return warnings;
}
