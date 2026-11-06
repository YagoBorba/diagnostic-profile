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

const legacyPt = {
  'LIVE': 'AO VIVO', 'SIGNAL NOMINAL': 'SINAL NOMINAL', 'SYSTEM SCAN': 'LEITURA DO SISTEMA', 'LINK ESTABLISHED': 'CONEXÃO ATIVA',
  'CONTRIBUTIONS · 12 MO': 'CONTRIBUIÇÕES · 12 M', 'COMMITS': 'COMMITS', 'PULL REQUESTS': 'PULL REQUESTS', 'ISSUES': 'ISSUES',
  'STARS': 'ESTRELAS', 'PUBLIC REPOS': 'REPOS PÚBLICOS', 'FOLLOWERS': 'SEGUIDORES', 'LAST 12 MONTHS': 'ÚLTIMOS 12 MESES',
  'CURRENT TOTAL': 'TOTAL ATUAL', 'STREAK MONITOR': 'SEQUÊNCIAS', 'CURRENT STREAK': 'SEQUÊNCIA ATUAL', 'LONGEST (12 MO)': 'MAIOR (12 M)',
  'BEST DAY': 'MELHOR DIA', 'LANGUAGE MIX  //  PUBLIC REPOSITORIES BY CODE SIZE': 'LINGUAGENS  //  TAMANHO DO CÓDIGO PÚBLICO',
  'TELEMETRY  //  GITHUB OVERVIEW': 'TELEMETRIA  //  PANORAMA GITHUB', 'END OF REPORT': 'FIM DO RELATÓRIO', 'LAST SCAN': 'ÚLTIMA GERAÇÃO',
  'SPECTRUM  //  CONTRIBUTIONS PER WEEK  //  LOG SCALE': 'CONTRIBUIÇÕES SEMANAIS  //  ESCALA LOG', 'PEAK': 'PICO', 'ACTIVE WEEKS': 'SEMANAS ATIVAS',
  'RECENT': 'RECENTE', 'OLDER': 'ANTERIOR', 'UNKNOWN': 'SEM DATA', 'STABLE': 'ESTÁVEL',
  'GitHub overview': 'Panorama GitHub', 'Contribution calendar': 'Calendário de contribuições', 'End of report': 'Fim do relatório',
  'Next chapter': 'Próximo capítulo', 'Technologies I use': 'Tecnologias que uso', 'Milestones': 'Trajetória', 'Currently': 'Agora',
  'CONTRIBUTIONS · 12 MO': 'CONTRIBUIÇÕES · 12 M', 'COMMITS · 12 MO': 'COMMITS · 12 M', 'PULL REQUESTS · 12 MO': 'PULL REQUESTS · 12 M',
  'ISSUES · 12 MO': 'ISSUES · 12 M', 'STARS · CURRENT': 'ESTRELAS · ATUAIS', 'PUBLIC REPOS · CURRENT': 'REPOS PÚBLICOS · ATUAIS',
  'FOLLOWERS · CURRENT': 'SEGUIDORES · ATUAIS', 'CURRENT STREAK · DAYS': 'SEQUÊNCIA ATUAL · DIAS',
  'Language mix by public code size': 'Linguagens por tamanho de código público', 'No language data': 'Sem dados de linguagens',
  'Contributions per week · log scale': 'Contribuições semanais · escala log', 'No calendar data': 'Sem calendário',
  'Add your own items in the configuration.': 'Adicione seus itens na configuração.', 'Learning: ': 'Estudando: ', 'Building: ': 'Construindo: ',
};
export const legacyLabel = (locale, value) => locale === 'pt-BR' ? legacyPt[value] ?? value : value;
export function configErrorMessage(message) {
  return message.replace('Invalid config:', 'Configuração inválida:').replace(/"([^"]+)" is required/g, 'Preencha "$1"')
    .replace('must be a GitHub username', 'deve ser um login do GitHub, sem espaços ou barras')
    .replace(/must be one of:/g, 'deve usar uma destas opções:').replace(/must be a string/g, 'deve ser um texto')
    .replace(/must be an object/g, 'deve ser um objeto').replace(/must be an array/g, 'deve ser uma lista')
    .replace(/must be an integer between (\d+) and (\d+)/g, 'deve ser um inteiro entre $1 e $2')
    .replace(/must be a boolean/g, 'deve ser verdadeiro ou falso').replace(/accepts at most (\d+) entries/g, 'aceita até $1 itens')
    .replace(/must be a valid/g, 'deve ser válido:').replace(/URL without credentials/g, 'URL sem credenciais');
}
