import { normalizeConfig } from './config.mjs';
import { CREDITS } from './credits.mjs';

// User text is always prose, never Markdown or HTML supplied by the visitor.
const prose = (value) => String(value).replace(/[\r\n\t]+/g, ' ').replace(/&/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\\`*_{}[\]#!|~]/g, '\\$&');
const link = (label, url) => '[' + prose(label) + '](<' + url.replace(/[\s<>\\]/g, (c) => encodeURIComponent(c)) + '>)';

/** A standalone README from declared content only: no fixture, API or image host. */
export function generateReadme(input) {
  const config = normalizeConfig(input);
  const blocks = [];
  for (const widget of config.widgets) {
    if (!widget.enabled) continue;
    const heading = (fallback) => config.layout.headings ? '## ' + prose(widget.title || fallback) : '';
    switch (widget.type) {
      case 'header': {
        const lines = ['# ' + prose(config.header.name || config.login)];
        if (config.header.headline) lines.push(prose(config.header.headline));
        if (config.header.tags.length) lines.push(config.header.tags.map(prose).join(' · '));
        for (const entry of config.header.readouts) if (entry.value) lines.push('**' + prose(entry.label) + ':** ' + prose(entry.value));
        blocks.push(lines.join('\n\n'));
        break;
      }
      case 'projects':
        if (config.projects === 'pinned') blocks.push(heading('Projetos') + '\n\n' + link('Veja meus repositórios no GitHub', 'https://github.com/' + config.login + '?tab=repositories'));
        else if (config.projects.length) blocks.push(heading('Projetos') + '\n\n' + config.projects.map((p) => {
          const fullName = p.repo.includes('/') ? p.repo : config.login + '/' + p.repo;
          return '- ' + link(p.title || p.repo, p.url || 'https://github.com/' + fullName) +
            (p.summary ? ' — ' + prose(p.summary) : '') + (p.tags?.length ? ' (' + p.tags.map(prose).join(', ') + ')' : '');
        }).join('\n'));
        break;
      case 'contacts':
        if (config.contacts.length) blocks.push(heading('Contato') + '\n\n' + config.contacts.map((c) => '- ' + link(c.label, c.url)).join('\n'));
        break;
      case 'skills':
      case 'timeline': {
        const values = config.content[widget.type];
        if (values.length) blocks.push(heading(widget.type === 'skills' ? 'Tecnologias' : 'Trajetória') + '\n\n' + values.map((v) => '- ' + prose(v)).join('\n'));
        break;
      }
      case 'now': {
        const lines = [];
        for (const [key, label] of [['learning', 'Estudando'], ['building', 'Construindo']]) {
          if (config.content[key].length) lines.push('**' + label + '**\n\n' + config.content[key].map((v) => '- ' + prose(v)).join('\n'));
        }
        if (lines.length) blocks.push(heading('Agora') + '\n\n' + lines.join('\n\n'));
        break;
      }
      case 'divider': blocks.push('---'); break;
      // Statistics, calendars and timestamps need real GitHub data. Never fabricate them.
      default: break;
    }
  }
  return blocks.length ? blocks.map((block) => block.trim()).join('\n\n') + '\n\n' + CREDITS + '\n' : '';
}

export function createReadmeKit(input) {
  const readme = generateReadme(input);
  if (!readme.trim()) throw new Error('Habilite a apresentação ou um bloco com conteúdo para gerar o README.');
  const config = normalizeConfig(input);
  return {
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
}
