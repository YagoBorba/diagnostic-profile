export const WIDGETS = [
  { id: 'header', description: 'Profile introduction and animated scope' },
  { id: 'contacts', description: 'Contact buttons' },
  { id: 'projects', description: 'Pinned or selected public repository cards' },
  { id: 'telemetry', description: 'GitHub contribution and current repository metrics' },
  { id: 'spectrum', description: 'Weekly contribution chart' },
  { id: 'footer', description: 'Generation timestamp and message' },
  { id: 'skills', description: 'Technologies declared by you, without inferred skill scores' },
  { id: 'now', description: 'What you are learning and building' },
  { id: 'heatmap', description: 'Contribution calendar' },
  { id: 'timeline', description: 'Milestones supplied by you' },
  { id: 'divider', description: 'Section divider' },
];
export const DEFAULT_WIDGETS = ['header', 'contacts', 'projects', 'telemetry', 'spectrum', 'footer'];
export const SCHEMA_VERSION = 1;
export function starterConfig(login) {
  return {
    $schema: 'https://raw.githubusercontent.com/YagoBorba/diagnostic-profile/v0.1.0/schema/diagnostic-profile.schema.json',
    schemaVersion: SCHEMA_VERSION, login, theme: 'amber',
    header: { headline: 'Building useful things', tags: ['OPEN SOURCE'] },
    projects: 'pinned', contacts: [],
  };
}
