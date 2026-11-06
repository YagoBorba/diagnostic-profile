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
  resume: { name: 'Resume', description: 'Text-first career summary with skills and milestones.', version: 1,
    config: { theme: 'monochrome', appearance: { family: 'minimal', motion: 'none', decorations: false }, layout: { type: 'standard', projectColumns: 1, textSummary: true },
      widgets: widgets('header', 'skills', 'timeline', 'projects', 'contacts') } },
  researcher: { name: 'Research notebook', description: 'Research interests, ongoing work and a chronological record.', version: 1,
    config: { theme: 'ice', appearance: { family: 'minimal', motion: 'none', border: 'square' }, layout: { type: 'standard', projectColumns: 1 },
      widgets: widgets('header', 'now', 'timeline', 'projects', 'contacts') } },
  maker: { name: 'Maker bench', description: 'A compact workbench for experiments and technical projects.', version: 1,
    config: { theme: 'ember', appearance: { family: 'terminal', motion: 'none', border: 'square' }, layout: { type: 'compact', projectColumns: 1 },
      widgets: widgets('header', 'skills', 'now', 'projects', 'contacts') } },
  community: { name: 'Community', description: 'Contribution activity, projects and ways to collaborate.', version: 1,
    config: { theme: 'phosphor', appearance: { family: 'diagnostic', motion: 'subtle', decorations: false }, layout: { type: 'grid', textSummary: true },
      widgets: widgets('header', 'now', 'projects', 'heatmap', 'contacts', 'footer') } },
};

// Studio copy explains the intended composition, independently of palette/family.
export const PRESET_GUIDE = {
  diagnostic: { category: 'creative', name: 'Console diagnóstico', description: 'Painel de instrumentos para quem quer uma identidade técnica marcante.' },
  terminal: { category: 'creative', name: 'Terminal', description: 'Composição compacta com o que você faz, projetos e métricas.' },
  minimal: { category: 'career', name: 'Essencial', description: 'Apresentação direta com projetos, tecnologias e contatos.' },
  opensource: { category: 'community', name: 'Open source', description: 'Destaque para repositórios, calendário e atividade pública.' },
  student: { category: 'learning', name: 'Jornada de aprendizado', description: 'O que você estuda, constrói e pratica, mesmo sem muitas contribuições.' },
  portfolio: { category: 'career', name: 'Portfólio', description: 'Projetos em grade e marcos profissionais preenchidos por você.' },
  resume: { category: 'career', name: 'Currículo', description: 'Tecnologias e trajetória primeiro; sem depender de números de popularidade.' },
  researcher: { category: 'learning', name: 'Caderno de pesquisa', description: 'Interesses, trabalho em andamento e marcos em uma coluna.' },
  maker: { category: 'creative', name: 'Bancada maker', description: 'Experimentos e projetos técnicos em uma composição estreita.' },
  community: { category: 'community', name: 'Comunidade', description: 'O que você constrói, onde contribui e como colaborar.' },
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
