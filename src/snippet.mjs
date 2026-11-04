const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const markdownText = (v) => String(v).replace(/[\\[\]]/g, '\\$&').replace(/[\r\n]+/g, ' ');

export function renderSnippet(config, data, projects, sections) {
  const base = config.assetsBaseUrl.endsWith('/') ? config.assetsBaseUrl : config.assetsBaseUrl + '/';
  const image = (item) => {
    const url = (mode) => base + item.name + '-' + mode + '.svg';
    if (config.layout.markup === 'markdown') {
      const src = encodeURI(url(config.layout.mode === 'light' ? 'light' : 'dark')).replace(/[()]/g, (x) => '%' + x.charCodeAt(0).toString(16));
      const content = '![' + markdownText(item.alt) + '](' + src + ')';
      return item.url ? '[' + content + '](' + encodeURI(item.url).replace(/[()]/g, (x) => '%' + x.charCodeAt(0).toString(16)) + ')' : content;
    }
    const size = item.width === '220' ? 'height="44"' : 'width="' + item.width + '"';
    const img = '<img alt="' + attr(item.alt) + '" src="' + attr(url(config.layout.mode === 'light' ? 'light' : 'dark')) + '" ' + size + '>';
    const content = config.layout.mode === 'auto' ? [
      '<picture>', '  <source media="(prefers-color-scheme: dark)" srcset="' + attr(url('dark')) + '">',
      '  <source media="(prefers-color-scheme: light)" srcset="' + attr(url('light')) + '">', '  ' + img, '</picture>',
    ].join('\n') : img;
    return item.url ? '<a href="' + attr(item.url) + '">\n' + content + '\n</a>' : content;
  };
  const output = [];
  for (const section of sections) {
    const heading = section.title || (section.type === 'projects' ? 'Featured projects' : section.type === 'telemetry' ? 'Telemetry' : '');
    if (config.layout.headings && heading) output.push('## ' + markdownText(heading));
    const content = section.items.map(image).join('\n');
    output.push(config.layout.markup === 'picture' && ['projects', 'contacts'].includes(section.type) ?
      '<p align="' + config.layout.align + '">\n' + content + '\n</p>' : content);
    if (section.type === 'telemetry' && config.layout.textSummary) output.push(
      data.totals.contributions + ' contributions in the reported calendar; ' + data.totals.stars + ' current stars; ' +
      data.totals.repositories + ' public owned non-fork repositories; ' + data.totals.followers + ' current followers.',
    );
  }
  return output.join('\n\n') + '\n';
}
