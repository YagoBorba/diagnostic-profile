const en = { header: 'Profile', projects: 'Projects', contacts: 'Contact', telemetry: 'GitHub overview', spectrum: 'Weekly contributions',
  heatmap: 'Contribution calendar', footer: 'End of report', skills: 'Technologies', now: 'Currently', timeline: 'Milestones', divider: 'Next chapter',
  learning: 'Learning', building: 'Building', empty: 'No items declared', manual: 'Manually supplied content', repository: 'Repository',
  contributions: 'Contributions · 12 months', commits: 'Commits · 12 months', pullRequests: 'Pull requests · 12 months', issues: 'Issues · 12 months',
  stars: 'Stars · current', repositories: 'Public repos · current', followers: 'Followers · current', days: 'days', noData: 'No data',
  codeSize: 'Languages by public code size', peak: 'Peak', updated: 'Generated', inspect: 'View my repositories on GitHub',
  workshop: 'BENCH / MODULE', fieldbook: 'FIELD RECORD', orbital: 'MISSION LOG', radio: 'ON THE AIR / CHANNEL', inventory: 'EXPLORER / INVENTORY', herbarium: 'DIGITAL SPECIMEN',
};
const pt = { header: 'Apresentação', projects: 'Projetos', contacts: 'Contato', telemetry: 'Panorama GitHub', spectrum: 'Contribuições semanais',
  heatmap: 'Calendário de contribuições', footer: 'Fim do relatório', skills: 'Tecnologias', now: 'Agora', timeline: 'Trajetória', divider: 'Próximo capítulo',
  learning: 'Estudando', building: 'Construindo', empty: 'Nenhum item declarado', manual: 'Conteúdo fornecido manualmente', repository: 'Repositório',
  contributions: 'Contribuições · 12 meses', commits: 'Commits · 12 meses', pullRequests: 'Pull requests · 12 meses', issues: 'Issues · 12 meses',
  stars: 'Estrelas · atuais', repositories: 'Repos públicos · atuais', followers: 'Seguidores · atuais', days: 'dias', noData: 'Sem dados',
  codeSize: 'Linguagens por tamanho de código público', peak: 'Pico', updated: 'Gerado em', inspect: 'Veja meus repositórios no GitHub',
  workshop: 'BANCADA / MÓDULO', fieldbook: 'REGISTRO DE CAMPO', orbital: 'DIÁRIO DE MISSÃO', radio: 'NO AR / CANAL', inventory: 'EXPLORAÇÃO / INVENTÁRIO', herbarium: 'ESPÉCIME DIGITAL',
};
export const locales = ['en', 'pt-BR'];
export const t = (locale, key) => (locale === 'pt-BR' ? pt : en)[key] ?? en[key] ?? key;
export const number = (locale, value) => new Intl.NumberFormat(locale).format(value);
