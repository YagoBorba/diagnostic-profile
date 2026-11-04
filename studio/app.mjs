import { normalizeConfig } from '../src/config.mjs';
import { resolvePreset, PRESETS } from '../src/presets.mjs';
import { buildAssets } from '../src/build.mjs';
import { summarize } from '../src/stats.mjs';
import { resolveTheme, paletteNames } from '../src/themes.mjs';
import { WIDGETS } from '../src/catalog.mjs';
import { contrastRatio } from '../src/design.mjs';
import { exportConfig, encodeConfig, decodeConfig, zipFiles } from '../src/transfer.mjs';
import { generateWorkflow } from '../src/workflow.mjs';
import { configWarnings } from '../src/config-warnings.mjs';
import { createInstallationKit } from '../src/kit.mjs';

const $ = (id) => document.getElementById(id);
const clone = (value) => structuredClone(value);
const labels = { header: 'Apresentação', contacts: 'Contatos', projects: 'Projetos', telemetry: 'Métricas', spectrum: 'Contribuições semanais', footer: 'Rodapé', skills: 'Tecnologias', now: 'Agora', heatmap: 'Calendário', timeline: 'Trajetória', divider: 'Divisória' };
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const sampleDate = new Date('2026-10-31T12:00:00Z');
const [example, user] = await Promise.all(['../examples/diagnostic-profile.json', '../test/fixtures/user.json'].map(async (path) => {
  const response = await fetch(new URL(path, import.meta.url));
  if (!response.ok) throw new Error('Não foi possível carregar os dados fictícios.');
  return response.json();
}));
let state = clone(example), selected = 'diagnostic', previewMode = 'dark', codeTab = 'config';
let lastValid, files, baselineState, renderTimer, toastTimer, manualProjects = clone(example.projects);
let undo = [], redo = [], previewUrls = [], galleryUrls = [];
const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
};
try {
  if (location.hash.startsWith('#config=')) state = decodeConfig(location.hash.slice(8));
  else state = storage.get('diagnostic-profile.draft.v1', state);
  normalizeConfig(state);
} catch { state = clone(example); toast('Não foi possível abrir a configuração salva; carregamos o exemplo.'); }
function toast(message) {
  $('toast').textContent = message; $('toast').hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500);
}
function saveBefore() { undo.push(clone(state)); if (undo.length > 40) undo.shift(); redo = []; }
function mutate(fn, redraw = false) {
  let previous;
  try { previous = normalizeConfig(state); } catch { previous = lastValid; }
  saveBefore(); fn(); clearTimeout(renderTimer);
  if (previous) {
    const oldTarget = previous.destination.repository || previous.login + '/' + previous.login;
    const oldBase = 'https://raw.githubusercontent.com/' + oldTarget + '/' + previous.destination.branch + '/';
    const changed = (state.login ?? previous.login) !== previous.login || (state.destination?.repository ?? '') !== previous.destination.repository || (state.destination?.branch ?? 'output') !== previous.destination.branch;
    if (changed && state.assetsBaseUrl === oldBase) { delete state.assetsBaseUrl; $('base-url').value = ''; }
    if ((state.login ?? previous.login) !== previous.login && state.header?.prompt === '$ scan --target ' + previous.login.toLowerCase()) {
      delete state.header.prompt; $('prompt').value = '';
    }
  }
  if (redraw) updateForms();
  renderTimer = setTimeout(render, 90);
}
function setPath(path, value) {
  let target = state;
  path.slice(0, -1).forEach((key) => { target[key] ??= {}; target = target[key]; });
  target[path.at(-1)] = value;
}
function bind(id, path, transform = (v) => v, check = false) {
  $(id).dataset.configPath = path.join('.');
  $(id).addEventListener(check ? 'change' : 'input', () => mutate(() => setPath(path, transform(check ? $(id).checked : $(id).value))));
}
function element(tag, text, className) {
  const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el;
}
function button(text, handler, label = text) {
  const b = element('button', text); b.type = 'button'; b.setAttribute('aria-label', label); b.addEventListener('click', handler); return b;
}
function download(name, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = element('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copiado.'); }
  catch { toast('A cópia não está disponível. Use o download ou selecione o código.'); }
}
function themeSwatches(config) {
  const theme = resolveTheme(config.theme, previewMode, config.appearance);
  $('swatches').replaceChildren();
  for (const key of ['panel', 'accent', 'signal', 'text']) {
    const swatch = element('span'); swatch.style.backgroundColor = theme[key]; swatch.title = key + ': ' + theme[key]; $('swatches').append(swatch);
  }
  $('accent').value = theme.accent; $('panel-color').value = theme.panel;
  $('text-color').value = theme.text; $('signal-color').value = theme.signal;
  const checks = [['Texto', theme.text, theme.panel], ['Destaque', theme.accent, theme.panel], ['Sinal', theme.signal, theme.panel], ['Texto secundário', theme.muted, theme.panel]];
  const failed = checks.filter(([, a, b]) => contrastRatio(a, b) < 4.5);
  $('contrast-warning').hidden = !failed.length;
  $('contrast-warning').textContent = failed.length ? 'Confira o contraste destas cores: ' + failed.map(([name, a, b]) => name + ' (' + contrastRatio(a, b).toFixed(2) + ':1)').join(', ') + '. Prefira 4,5:1 ou mais para textos pequenos.' : '';
}
function drawPreview(target, configuration, data, mode) {
  const assets = buildAssets(configuration, data, sampleDate);
  target.replaceChildren(); target.dataset.mode = mode;
  target.dataset.align = configuration.layout.align;
  for (const [name, svg] of Object.entries(assets)) {
    if (!name.endsWith('-' + mode + '.svg')) continue;
    const figure = element('figure');
    const isProject = configuration.widgets.some((w) => w.type === 'projects' && name.startsWith((w.id === 'projects' ? 'project' : w.id) + '-'));
    const isContact = configuration.widgets.some((w) => w.type === 'contacts' && name.startsWith((w.id === 'contacts' ? 'contact' : w.id) + '-'));
    figure.className = isProject ? 'project' : isContact ? 'contact' : '';
    if (isProject && (configuration.layout.projectColumns === 1 || configuration.layout.type === 'compact')) figure.classList.add('single');
    const img = element('img');
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); previewUrls.push(url);
    img.src = url;
    img.alt = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('#title')?.textContent ?? name;
    figure.append(img); target.append(figure);
  }
  return assets;
}
function renderCode() {
  if (!lastValid || !files) return;
  $('code').textContent = codeTab === 'config' ? json(exportConfig(state)) : codeTab === 'snippet' ? files['README.snippet.md'] : generateWorkflow(state);
}
function fieldErrors(error) {
  document.querySelectorAll('.field-error').forEach((el) => el.remove());
  document.querySelectorAll('[data-config-path]').forEach((el) => { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); });
  if (!error) return;
  for (const message of error.message.split('\n')) {
    const path = message.match(/"([^"]+)"/)?.[1];
    if (!path) continue;
    for (const field of document.querySelectorAll('[data-config-path]')) {
      const key = field.dataset.configPath;
      if (key !== path && !path.startsWith(key + '[') && !key.startsWith(path + '.')) continue;
      field.setAttribute('aria-invalid', 'true');
      const hint = element('span', message.replace(/^-\s*/, ''), 'field-error');
      hint.id = 'field-error-' + key.replace(/[^a-z0-9]/gi, '-');
      field.setAttribute('aria-describedby', hint.id);
      field.insertAdjacentElement('afterend', hint);
    }
  }
}
function render() {
  try {
    const start = performance.now();
    const config = normalizeConfig(state);
    selected = Object.keys(PRESETS).find((id) => {
      const preset = normalizeConfig({ login: config.login, preset: id });
      return preset.theme === config.theme && preset.appearance.family === config.appearance.family &&
        preset.layout.type === config.layout.type && preset.widgets.map((w) => w.type).join(',') === config.widgets.map((w) => w.type).join(',');
    });
    document.querySelectorAll('.preset-card').forEach((card) => card.setAttribute('aria-pressed', String(card.dataset.preset === selected)));
    const data = summarize(user, config.telemetry);
    const oldUrls = previewUrls; previewUrls = [];
    files = drawPreview($('preview'), config, data, previewMode);
    if (baselineState) drawPreview($('baseline'), normalizeConfig(baselineState), summarize(user, normalizeConfig(baselineState).telemetry), previewMode);
    oldUrls.forEach((url) => URL.revokeObjectURL(url));
    lastValid = config; $('errors').hidden = true; fieldErrors();
    ['download', 'save-json', 'share', 'copy', 'favorite'].forEach((id) => { $(id).disabled = false; });
    if (!config.widgets.some((w) => w.enabled)) { $('render-status').textContent = 'Adicione ou habilite um bloco para montar seu perfil.'; }
    else $('render-status').textContent = Object.keys(files).filter((n) => n.endsWith('.svg')).length + ' SVGs · ' + Math.round(performance.now() - start) + ' ms · preview fictício';
    themeSwatches(config); renderCode();
    const saved = storage.set('diagnostic-profile.draft.v1', exportConfig(state));
    $('draft-status').textContent = saved ? 'Rascunho salvo neste navegador.' : 'Armazenamento indisponível; baixe o JSON para guardar.';
  } catch (error) {
    fieldErrors(error);
    $('errors').textContent = 'Revise a configuração:\n' + error.message; $('errors').hidden = false;
    ['download', 'save-json', 'share', 'copy', 'favorite'].forEach((id) => { $(id).disabled = true; });
    $('render-status').textContent = 'O último preview válido foi mantido.';
  }
  $('undo').disabled = !undo.length; $('redo').disabled = !redo.length;
}
function updateForms() {
  let config;
  try { config = normalizeConfig(state); } catch { config = lastValid; }
  if (!config) return;
  const values = {
    login: state.login ?? config.login, name: state.header?.name ?? '', headline: state.header?.headline ?? '',
    prompt: state.header?.prompt ?? '', 'system-label': state.header?.systemLabel ?? config.header.systemLabel,
    tags: (state.header?.tags ?? []).join(', '), family: config.appearance.family, theme: config.theme, layout: config.layout.type,
    motion: config.appearance.motion, border: config.appearance.border, density: config.appearance.density,
    columns: String(config.layout.projectColumns), alignment: config.layout.align, 'readme-mode': config.layout.mode, markup: config.layout.markup,
    skills: (state.content?.skills ?? []).join('\n'), learning: (state.content?.learning ?? []).join('\n'),
    building: (state.content?.building ?? []).join('\n'), timeline: (state.content?.timeline ?? []).join('\n'),
    'footer-message': state.footer?.message ?? config.footer.message, destination: state.destination?.repository ?? '',
    branch: state.destination?.branch ?? 'output', 'base-url': state.assetsBaseUrl ?? '',
  };
  for (const [id, value] of Object.entries(values)) $(id).value = value;
  $('decorations').checked = config.appearance.decorations; $('headings').checked = config.layout.headings;
  $('text-summary').checked = config.layout.textSummary; $('pinned').checked = state.projects === 'pinned' || state.projects === undefined;
  drawEditors(); drawWidgets(config);
}
function drawEditors() {
  $('projects-editor').replaceChildren(); $('contacts-editor').replaceChildren(); $('readouts-editor').replaceChildren();
  $('add-readout').disabled = (state.header?.readouts?.length ?? 0) >= 3;
  (state.header?.readouts ?? []).forEach((entry, index) => {
    const box = element('div', undefined, 'item-editor');
    for (const [key, text] of [['label', 'Rótulo'], ['value', 'Valor']]) {
      const label = element('label', text), input = element('input'); input.value = entry[key] ?? ''; input.maxLength = key === 'label' ? 40 : 80;
      input.dataset.configPath = 'header.readouts[' + index + '].' + key;
      input.addEventListener('input', () => mutate(() => { state.header.readouts[index][key] = input.value; }));
      label.append(input); box.append(label);
    }
    const remove = button('Remover campo', () => mutate(() => state.header.readouts.splice(index, 1), true));
    remove.className = 'quiet'; box.append(remove); $('readouts-editor').append(box);
  });
  $('add-project').disabled = !Array.isArray(state.projects) || state.projects.length >= 8;
  $('add-contact').disabled = (state.contacts?.length ?? 0) >= 12;
  const draw = (kind, target, fields) => {
    const items = Array.isArray(state[kind]) ? state[kind] : [];
    items.forEach((entry, index) => {
      const box = element('div', undefined, 'item-editor');
      for (const [key, labelText] of fields) {
        const label = element('label', labelText), input = element(key === 'summary' ? 'textarea' : 'input');
        input.value = Array.isArray(entry[key]) ? entry[key].join(', ') : entry[key] ?? '';
        input.dataset.configPath = kind + '[' + index + '].' + key;
        input.maxLength = key === 'summary' ? 1000 : key === 'url' ? 2048 : key === 'glyph' ? 3 : 140;
        input.addEventListener('input', () => mutate(() => {
          const value = key === 'tags' ? input.value.split(',').map((x) => x.trim()).filter(Boolean) : input.value;
          const required = kind === 'projects' ? ['repo'] : ['label', 'url', 'id'];
          if (value === '' && !required.includes(key)) delete state[kind][index][key];
          else state[kind][index][key] = value;
        }));
        label.append(input); box.append(label);
      }
      const remove = button('Remover', () => mutate(() => state[kind].splice(index, 1), true), 'Remover ' + (entry.title ?? entry.label ?? entry.repo));
      remove.className = 'quiet'; box.append(remove); $(target).append(box);
    });
  };
  draw('projects', 'projects-editor', [['repo', 'Repositório'], ['title', 'Título'], ['kind', 'Categoria'], ['summary', 'Descrição'], ['tags', 'Tecnologias, separadas por vírgula'], ['url', 'Link personalizado (opcional)']]);
  draw('contacts', 'contacts-editor', [['label', 'Rótulo'], ['url', 'Link'], ['glyph', 'Símbolo'], ['id', 'Identificador único']]);
}
let dragging;
function drawWidgets(config) {
  state.widgets ??= clone(config.widgets);
  $('widget-list').replaceChildren();
  state.widgets.forEach((widget, index) => {
    const li = element('li', undefined, 'widget-row'); li.draggable = true; li.dataset.id = widget.id;
    const top = element('div', undefined, 'widget-heading'), label = element('label', undefined, 'check');
    const check = element('input'); check.type = 'checkbox'; check.checked = widget.enabled !== false;
    check.addEventListener('change', () => mutate(() => { state.widgets[index].enabled = check.checked; }));
    label.append(check, document.createTextNode(labels[widget.type] ?? widget.type)); top.append(label);
    const actions = element('div', undefined, 'widget-actions');
    const move = (delta) => mutate(() => {
      const next = index + delta;
      if (next < 0 || next >= state.widgets.length) return;
      [state.widgets[index], state.widgets[next]] = [state.widgets[next], state.widgets[index]];
      setTimeout(() => document.querySelector('[data-id="' + widget.id + '"] .widget-actions button')?.focus(), 120);
    }, true);
    const up = button('↑', () => move(-1), 'Mover ' + labels[widget.type] + ' para cima'); up.disabled = index === 0;
    const down = button('↓', () => move(1), 'Mover ' + labels[widget.type] + ' para baixo'); down.disabled = index === state.widgets.length - 1;
    const remove = button('×', () => mutate(() => state.widgets.splice(index, 1), true), 'Remover bloco ' + labels[widget.type]);
    actions.append(up, down, remove); top.append(actions); li.append(top);
    const title = element('input'); title.placeholder = 'Título da seção (opcional)'; title.value = widget.title ?? ''; title.maxLength = 80;
    title.setAttribute('aria-label', 'Título de ' + labels[widget.type]);
    title.addEventListener('input', () => mutate(() => { state.widgets[index].title = title.value; })); li.append(title);
    li.addEventListener('dragstart', () => { dragging = index; li.classList.add('dragging'); });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));
    li.addEventListener('dragover', (event) => event.preventDefault());
    li.addEventListener('drop', (event) => { event.preventDefault(); if (dragging === undefined) return; mutate(() => { const [item] = state.widgets.splice(dragging, 1); state.widgets.splice(index, 0, item); }, true); dragging = undefined; });
    $('widget-list').append(li);
  });
  $('add-widget').disabled = state.widgets.length >= 16;
}
function applyPreset(id) {
  mutate(() => {
    const base = clone(state);
    for (const key of ['preset', 'presetVersion', 'theme', 'appearance', 'layout', 'widgets']) delete base[key];
    state = resolvePreset({ ...base, preset: id, presetVersion: 1 }); delete state.preset; delete state.presetVersion;
    selected = id;
    document.querySelectorAll('.preset-card').forEach((card) => card.setAttribute('aria-pressed', String(card.dataset.preset === id)));
  }, true);
}
function drawGallery() {
  for (const [id, preset] of Object.entries(PRESETS)) {
    const config = normalizeConfig({ ...example, theme: undefined, preset: id });
    const data = summarize(user, config.telemetry);
    const assets = buildAssets(config, data, sampleDate);
    const header = config.widgets.find((w) => w.type === 'header');
    const card = button('', () => { applyPreset(id); $('workspace').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, 'Usar modelo ' + preset.name);
    card.className = 'preset-card'; card.dataset.preset = id; card.setAttribute('aria-pressed', String(id === selected));
    const thumb = element('div', undefined, 'preset-thumb'), img = element('img');
    const url = URL.createObjectURL(new Blob([assets[header.id + '-dark.svg']], { type: 'image/svg+xml' })); galleryUrls.push(url);
    img.src = url; img.alt = ''; thumb.append(img);
    const info = element('div', undefined, 'preset-info'), copy = element('div');
    copy.append(element('strong', preset.name), element('small', preset.description));
    info.append(copy, element('span', '↗', 'preset-arrow')); card.append(thumb, info); $('presets').append(card);
  }
}
function drawFavorites() {
  $('favorites').replaceChildren();
  const favorites = storage.get('diagnostic-profile.favorites.v1', []);
  if (!Array.isArray(favorites)) return;
  favorites.slice(0, 6).forEach((favorite, index) => {
    const row = element('div');
    const load = button('★ ' + favorite.name, () => { try { const imported = exportConfig(favorite.config); mutate(() => { state = imported; }, true); } catch (error) { toast(error.message); } }); load.className = 'text-button';
    const remove = button(' ×', () => { favorites.splice(index, 1); storage.set('diagnostic-profile.favorites.v1', favorites); drawFavorites(); }, 'Excluir favorito ' + favorite.name); remove.className = 'text-button';
    row.append(load, remove); $('favorites').append(row);
  });
}
for (const name of paletteNames) { const option = element('option', name); option.value = name; $('theme').append(option); }
for (const widget of WIDGETS) { const option = element('option', labels[widget.id]); option.value = widget.id; $('new-widget').append(option); }
bind('login', ['login']); bind('name', ['header', 'name']); bind('headline', ['header', 'headline']);
bind('system-label', ['header', 'systemLabel']);
$('prompt').addEventListener('input', () => mutate(() => { state.header ??= {}; if ($('prompt').value) state.header.prompt = $('prompt').value; else delete state.header.prompt; }));
bind('tags', ['header', 'tags'], (v) => v.split(',').map((x) => x.trim()).filter(Boolean));
for (const key of ['family', 'motion', 'border', 'density']) bind(key, ['appearance', key]);
bind('theme', ['theme']); bind('layout', ['layout', 'type']); bind('columns', ['layout', 'projectColumns'], Number);
bind('readme-mode', ['layout', 'mode']); bind('markup', ['layout', 'markup']);
bind('alignment', ['layout', 'align']);
bind('headings', ['layout', 'headings'], (v) => v, true); bind('text-summary', ['layout', 'textSummary'], (v) => v, true);
bind('decorations', ['appearance', 'decorations'], (v) => v, true);
for (const key of ['skills', 'learning', 'building', 'timeline']) bind(key, ['content', key], (v) => v.split('\n').map((x) => x.trim()).filter(Boolean));
bind('footer-message', ['footer', 'message']);
bind('destination', ['destination', 'repository']); bind('branch', ['destination', 'branch']);
$('base-url').addEventListener('input', () => mutate(() => { if ($('base-url').value) state.assetsBaseUrl = $('base-url').value; else delete state.assetsBaseUrl; }));
for (const [id, key] of [['accent', 'accent'], ['panel-color', 'panel'], ['text-color', 'text'], ['signal-color', 'signal']]) $(id).addEventListener('input', () => mutate(() => setPath(['appearance', 'colors', previewMode, key], $(id).value)));
$('reset-colors').addEventListener('click', () => mutate(() => { if (state.appearance) delete state.appearance.colors; }, true));
$('pinned').addEventListener('change', () => mutate(() => { if ($('pinned').checked) { if (Array.isArray(state.projects)) manualProjects = clone(state.projects); state.projects = 'pinned'; } else state.projects = clone(manualProjects ?? []); }, true));
$('add-project').addEventListener('click', () => mutate(() => { if (Array.isArray(state.projects)) state.projects.push({ repo: 'owner/new-project', title: 'New project', summary: '', tags: [] }); }, true));
$('add-contact').addEventListener('click', () => mutate(() => { state.contacts ??= []; state.contacts.push({ id: 'contact-' + Date.now().toString(36), label: 'Contato', url: 'https://example.com', glyph: '@' }); }, true));
$('add-readout').addEventListener('click', () => mutate(() => { state.header ??= {}; state.header.readouts ??= []; state.header.readouts.push({ label: 'Campo', value: 'Valor' }); }, true));
$('add-widget').addEventListener('click', () => mutate(() => { const type = $('new-widget').value; let id = type, n = 2; while (state.widgets.some((w) => w.id === id)) id = type + '-' + n++; state.widgets.push({ id, type, enabled: true, title: '' }); }, true));
document.querySelectorAll('[data-tab]').forEach((tab, index, tabs) => {
  const select = () => { tabs.forEach((other) => { const active = other === tab; other.setAttribute('aria-selected', String(active)); other.tabIndex = active ? 0 : -1; $('panel-' + other.dataset.tab).hidden = !active; }); };
  tab.addEventListener('click', select);
  tab.addEventListener('keydown', (event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[next].click(); tabs[next].focus(); } });
  tab.tabIndex = index === 0 ? 0 : -1;
});
for (const mode of ['dark', 'light']) $('preview-' + mode).addEventListener('click', () => { previewMode = mode; ['dark', 'light'].forEach((m) => $('preview-' + m).setAttribute('aria-pressed', String(m === mode))); render(); });
for (const size of ['desktop', 'mobile']) $(size).addEventListener('click', () => { ['desktop', 'mobile'].forEach((s) => $(s).setAttribute('aria-pressed', String(s === size))); $('preview').classList.toggle('mobile', size === 'mobile'); $('baseline').classList.toggle('mobile', size === 'mobile'); });
$('compare').addEventListener('click', () => { if (baselineState) baselineState = undefined; else { try { baselineState = exportConfig(state); } catch (error) { toast(error.message); return; } } $('baseline').hidden = !baselineState; $('comparison').classList.toggle('comparing', Boolean(baselineState)); $('compare').setAttribute('aria-pressed', String(Boolean(baselineState))); render(); });
$('undo').addEventListener('click', () => { if (!undo.length) return; redo.push(clone(state)); state = undo.pop(); updateForms(); render(); });
$('redo').addEventListener('click', () => { if (!redo.length) return; undo.push(clone(state)); state = redo.pop(); updateForms(); render(); });
$('random').addEventListener('click', () => { const motion = lastValid?.appearance.motion ?? 'none'; const ids = Object.keys(PRESETS); applyPreset(ids[Math.floor(Math.random() * ids.length)]); state.theme = paletteNames[Math.floor(Math.random() * paletteNames.length)]; state.appearance ??= {}; state.appearance.motion = motion; updateForms(); render(); });
$('reset').addEventListener('click', () => mutate(() => { state = clone(example); selected = 'diagnostic'; history.replaceState(null, '', location.pathname + location.search); }, true));
for (const tab of ['config', 'snippet', 'workflow']) $('show-' + tab).addEventListener('click', () => { codeTab = tab; ['config', 'snippet', 'workflow'].forEach((t) => $('show-' + t).setAttribute('aria-pressed', String(t === tab))); renderCode(); });
$('copy').addEventListener('click', () => { render(); if ($('errors').hidden) copyText($('code').textContent); });
$('save-json').addEventListener('click', () => { try { download('diagnostic-profile.json', json(exportConfig(state)), 'application/json'); } catch (error) { render(); toast(error.message); } });
$('share').addEventListener('click', () => { try { copyText(location.origin + location.pathname + '#config=' + encodeConfig(state)); } catch (error) { toast(error.message); } });
$('import').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async () => {
  const file = $('import-file').files[0]; if (!file) return;
  try {
    if (file.size > 128 * 1024) throw new Error('O arquivo deve ter até 128 KiB.');
    const raw = JSON.parse(await file.text());
    const warnings = configWarnings(raw);
    const imported = exportConfig(raw);
    mutate(() => { state = imported; }, true);
    toast(warnings.length ? 'Configuração importada. ' + warnings.length + ' campos desconhecidos foram ignorados: ' + warnings[0] : 'Configuração importada.');
  } catch (error) { toast(error.message); }
  $('import-file').value = '';
});
$('favorite').addEventListener('click', () => {
  let config;
  try { config = exportConfig(state); } catch (error) { toast(error.message); return; }
  const favorites = storage.get('diagnostic-profile.favorites.v1', []);
  const list = Array.isArray(favorites) ? favorites : [];
  list.unshift({ name: (state.header?.name || state.login || 'Meu perfil') + ' · ' + config.theme, config });
  storage.set('diagnostic-profile.favorites.v1', list.slice(0, 6)); drawFavorites(); toast('Favorito salvo neste navegador.');
});
$('download').addEventListener('click', () => {
  try {
    const kit = createInstallationKit(state, user, sampleDate);
    download('diagnostic-profile-kit.zip', zipFiles(kit), 'application/zip');
    toast('Kit gerado. Os SVGs de preview usam dados fictícios.');
  } catch (error) { render(); toast(error.message); }
});
drawGallery(); updateForms(); drawFavorites(); render();
window.addEventListener('beforeunload', () => [...previewUrls, ...galleryUrls].forEach((url) => URL.revokeObjectURL(url)));
