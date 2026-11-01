export const WIDGETS = [
  { id: 'header', description: 'Profile introduction and animated scope' },
  { id: 'contacts', description: 'Contact buttons' },
  { id: 'projects', description: 'Pinned or selected public repository cards' },
  { id: 'telemetry', description: 'GitHub contribution and current repository metrics' },
  { id: 'spectrum', description: 'Weekly contribution chart' },
  { id: 'footer', description: 'Generation timestamp and message' },
];
export const SCHEMA_VERSION = 1;
export function starterConfig(login) {
  return {
    $schema: 'https://raw.githubusercontent.com/YagoBorba/diagnostic-profile/develop/schema/diagnostic-profile.schema.json',
    schemaVersion: SCHEMA_VERSION, login, theme: 'amber',
    header: { headline: 'Building useful things', tags: ['OPEN SOURCE'] },
    projects: 'pinned', contacts: [],
  };
}
