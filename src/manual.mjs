import { VERSION } from './version.mjs';
import { normalizeConfig } from './config.mjs';
import { buildAssets } from './build.mjs';
import { exportConfig } from './transfer.mjs';
import { t } from './i18n.mjs';

export const DATA_WIDGETS = Object.freeze(['telemetry', 'spectrum', 'heatmap']);
export function manualProfile(input) {
  const original = normalizeConfig(input);
  const warnings = [];
  if (original.projects === 'pinned' && original.widgets.some((w) => w.enabled && w.type === 'projects')) warnings.push(original.locale === 'en' ? 'Pinned repositories require GitHub data; add projects manually for this static kit.' : 'Projetos fixados exigem consulta ao GitHub; adicione seus projetos manualmente para o kit estático.');
  if (original.widgets.some((w) => w.enabled && DATA_WIDGETS.includes(w.type))) warnings.push(original.locale === 'en' ? 'Metrics and calendars were omitted: this mode uses declared content only.' : 'Métricas e calendários foram omitidos: este modo usa somente conteúdo declarado.');
  const config = { ...original, assetsBaseUrl: './assets/', projects: original.projects === 'pinned' ? [] : original.projects,
    widgets: original.widgets.filter((w) => !DATA_WIDGETS.includes(w.type)), layout: { ...original.layout, textSummary: false } };
  const data = { login: config.login, name: config.header.name || config.login, bio: config.header.headline || '', source: 'manual',
    totals: {}, streaks: {}, languages: [], weekly: [], calendar: [], repos: Object.create(null), pinned: [] };
  return { config, data, warnings };
}
export function createVisualKit(input, now = new Date()) {
  const { config, data, warnings } = manualProfile(input);
  const assets = buildAssets(config, data, now);
  const svgFiles = Object.entries(assets).filter(([name]) => name.endsWith('.svg'));
  if (!svgFiles.length) throw new Error('Habilite ao menos um bloco de conteúdo manual para gerar o kit visual.');
  const files = {
    'README.md': assets['README.snippet.md'],
    'diagnostic-profile.json': JSON.stringify(exportConfig(input), null, 2) + '\n',
    'INSTALL.txt': [
      'DIAGNOSTIC PROFILE — KIT VISUAL ESTÁTICO',
      '1. Revise todos os textos, links e contatos; substitua os exemplos.',
      '2. Envie README.md e a pasta assets/ inteira para seu repositório público ' + config.login + '/' + config.login + '.',
      '3. Preserve os caminhos relativos. Se já houver README, mescle os conteúdos antes de salvar.',
      'Este kit não precisa de token, Action ou servidor de imagens. Os SVGs usam somente conteúdo declarado.',
      'Não inclui estatísticas, calendário ou repositórios fixados consultados da API.',
      'Para atualizar, importe diagnostic-profile.json no Studio, edite e envie o novo kit.',
      ...warnings,
      'Créditos: Yago Borba · https://github.com/YagoBorba/diagnostic-profile',
    ].join('\n') + '\n',
    'manifest.json': JSON.stringify({ generator: 'diagnostic-profile', version: VERSION, source: 'manual', generatedAt: now.toISOString(),
      locale: config.locale, warnings, files: svgFiles.map(([name]) => 'assets/' + name) }, null, 2) + '\n',
  };
  if (config.locale === 'en') files['INSTALL.txt'] = [
    'DIAGNOSTIC PROFILE — STATIC VISUAL KIT',
    '1. Review all texts and contacts; replace the sample content.',
    '2. Upload README.md and the complete assets/ folder to your public ' + config.login + '/' + config.login + ' repository.',
    '3. Keep relative image paths intact. Merge with an existing README before saving.',
    'No token, Action or image server is required. Images use declared content only, without GitHub statistics.',
    'Import diagnostic-profile.json in Studio to edit and regenerate. Files are updated manually.',
    ...warnings, 'Credits: Yago Borba · https://github.com/YagoBorba/diagnostic-profile',
  ].join('\n') + '\n';
  for (const [name, svg] of svgFiles) files['assets/' + name] = svg;
  return files;
}
