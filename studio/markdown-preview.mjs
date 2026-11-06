import { readmeModel } from '../src/readme-model.mjs';

// Render the same semantic model as the Markdown exporter. User text never becomes HTML.
export function renderMarkdownPreview(target, config) {
  const node = (tag, text) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; return el; };
  const body = node('article'); body.className = 'markdown-output'; body.lang = config.locale;
  for (const b of readmeModel(config)) {
    if (b.kind === 'heading') body.append(node('h' + b.level, b.text));
    if (b.kind === 'paragraph') { const p = node('p'); if (b.label) p.append(node('strong', b.label + ': ')); p.append(document.createTextNode(b.text)); body.append(p); }
    if (b.kind === 'label') { const p = node('p'); p.append(node('strong', b.text)); body.append(p); }
    if (b.kind === 'divider') body.append(node('hr'));
    if (b.kind === 'list') {
      const ul = node('ul');
      for (const item of b.items) {
        const li = node('li');
        if (item.url) { const a = node('a', item.label); a.href = item.url; a.rel = 'noopener noreferrer'; a.target = '_blank'; li.append(a); }
        else li.append(document.createTextNode(item.text));
        if (item.description) li.append(document.createTextNode(' — ' + item.description));
        if (item.tags?.length) li.append(document.createTextNode(' (' + item.tags.join(', ') + ')'));
        ul.append(li);
      }
      body.append(ul);
    }
  }
  if (body.childNodes.length) {
    const credit = node('small');
    for (const [label, href] of [['Diagnostic Profile', 'https://github.com/YagoBorba/diagnostic-profile'], ['Yago Borba', 'https://github.com/YagoBorba']]) {
      if (credit.childNodes.length) credit.append(document.createTextNode(' · '));
      const a = node('a', label); a.href = href; credit.append(a);
    }
    body.append(credit);
  }
  target.replaceChildren(body);
}
