import { normalizeConfig } from './config.mjs';
import { CREDITS } from './credits.mjs';
import { readmeModel } from './readme-model.mjs';

// User text is always prose, never Markdown or HTML supplied by the visitor.
const prose = (value) => String(value).replace(/[\r\n\t]+/g, ' ').replace(/&/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\\`*_{}[\]#!|~]/g, '\\$&');
const link = (label, url) => '[' + prose(label) + '](<' + url.replace(/[\s<>\\]/g, (c) => encodeURIComponent(c)) + '>)';

/** A standalone README from declared content only: no fixture, API or image host. */
export function generateReadme(input) {
  const blocks = readmeModel(input).map((b) => {
    if (b.kind === 'heading') return '#'.repeat(b.level) + ' ' + prose(b.text);
    if (b.kind === 'paragraph') return (b.label ? '**' + prose(b.label) + ':** ' : '') + prose(b.text);
    if (b.kind === 'label') return '**' + prose(b.text) + '**';
    if (b.kind === 'divider') return '---';
    return b.items.map((item) => '- ' + (item.url ? link(item.label, item.url) : prose(item.text)) +
      (item.description ? ' — ' + prose(item.description) : '') + (item.tags?.length ? ' (' + item.tags.map(prose).join(', ') + ')' : '')).join('\n');
  });
  return blocks.length ? blocks.join('\n\n') + '\n\n' + CREDITS + '\n' : '';
}

export function createReadmeKit(input) {
  const readme = generateReadme(input);
  if (!readme.trim()) throw new Error('Habilite a apresentação ou um bloco com conteúdo para gerar o README.');
  const config = normalizeConfig(input);
  const files = {
    'README.md': readme,
    'INSTALL.txt': [
      'README SEM AUTOMAÇÃO',
      '1. Revise os textos, links, projetos e contatos; substitua todo conteúdo de exemplo.',
      '2. Crie ou abra seu repositório público ' + config.login + '/' + config.login + '.',
      '3. Adicione o conteúdo de README.md ao README existente na raiz, preservando o que desejar.',
      '4. Salve a alteração no GitHub e visite seu perfil.',
      'Não precisa de token, Node.js, Action ou servidor de imagens.',
      'Este arquivo usa somente os textos declarados. Não inclui estatísticas fictícias nem SVGs.',
      'A aparência segue o Markdown do GitHub; paletas e animações são exclusivas da opção SVG.',
      'Atualize os textos manualmente. Para métricas atualizadas, escolha a opção SVG com Action no Studio.',
      'https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme',
    ].join('\n') + '\n',
  };
  if (config.locale === 'en') files['INSTALL.txt'] = [
    'README WITHOUT AUTOMATION',
    '1. Review all sample text, projects and contacts.',
    '2. Create or open your public ' + config.login + '/' + config.login + ' repository.',
    '3. Merge README.md into the file at the repository root and save.',
    'No token, Node.js, Action or image server is required.',
    'This Markdown uses declared text only and follows GitHub appearance. Update it manually.',
    'Credits: Yago Borba · https://github.com/YagoBorba/diagnostic-profile',
  ].join('\n') + '\n';
  return files;
}
