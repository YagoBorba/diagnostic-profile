const widgets = (...types) => types.map((type) => ({ id: type, type, enabled: true }));
export const PRESETS = {
  diagnostic: { name: 'Diagnostic console', description: 'Instrument panel, gauges and an oscilloscope.', version: 1,
    config: { theme: 'amber', appearance: { family: 'diagnostic' }, layout: { type: 'standard' } } },
  terminal: { name: 'Terminal', description: 'A compact, monochrome-font workspace.', version: 1,
    config: { theme: 'phosphor', appearance: { family: 'terminal', motion: 'subtle', border: 'square' }, layout: { type: 'compact' },
      widgets: widgets('header', 'now', 'projects', 'telemetry', 'contacts', 'footer') } },
  minimal: { name: 'Minimal', description: 'Quiet presentation with a focus on your projects.', version: 1,
    config: { theme: 'ice', appearance: { family: 'minimal', motion: 'none', decorations: false },
      widgets: widgets('header', 'projects', 'skills', 'contacts', 'footer') } },
  opensource: { name: 'Open source', description: 'Repositories and contribution history.', version: 1,
    config: { theme: 'violet', appearance: { family: 'minimal', motion: 'none' }, layout: { type: 'grid', textSummary: true },
      widgets: widgets('header', 'projects', 'heatmap', 'telemetry', 'contacts', 'footer') } },
  student: { name: 'Learning journey', description: 'What you are learning, building and practicing.', version: 1,
    config: { theme: 'ember', appearance: { family: 'minimal', motion: 'none' }, layout: { type: 'compact', projectColumns: 1 },
      widgets: widgets('header', 'now', 'skills', 'projects', 'contacts', 'footer') } },
  portfolio: { name: 'Portfolio', description: 'Project cards and milestones in a neutral style.', version: 1,
    config: { theme: 'monochrome', appearance: { family: 'minimal', motion: 'none' }, layout: { type: 'grid' },
      widgets: widgets('header', 'projects', 'timeline', 'contacts', 'footer') } },
};
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clone(entry)]));
  return value;
}
function merge(base, overrides) {
  const entries = new Map(Object.entries(base).map(([key, value]) => [key, clone(value)]));
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    const previous = entries.get(key);
    entries.set(key, isObject(value) && isObject(previous) ? merge(previous, value) : clone(value));
  }
  return Object.fromEntries(entries);
}
export function resolvePreset(input) {
  if (input.preset === undefined) return input;
  if (!Object.hasOwn(PRESETS, input.preset)) throw new Error('Invalid config:\n- "preset" must be one of: ' + Object.keys(PRESETS).join(', '));
  if (input.presetVersion !== undefined && input.presetVersion !== 1) throw new Error('Invalid config:\n- "presetVersion" must be 1');
  return merge(PRESETS[input.preset].config, input);
}
