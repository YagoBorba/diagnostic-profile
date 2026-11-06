import { normalizeConfig } from '../src/config.mjs';
import { resolvePreset, PRESETS, PRESET_GUIDE } from '../src/presets.mjs';
import { buildAssets } from '../src/build.mjs';
import { summarize } from '../src/stats.mjs';
import { resolveTheme, paletteNames } from '../src/themes.mjs';
import { WIDGETS } from '../src/catalog.mjs';
import { contrastRatio } from '../src/design.mjs';
import { exportConfig, encodeConfig, decodeConfig, zipFiles } from '../src/transfer.mjs';
import { generateWorkflow } from '../src/workflow.mjs';
import { configWarnings } from '../src/config-warnings.mjs';
import { createInstallationKit } from '../src/kit.mjs';
import { generateReadme, createReadmeKit } from '../src/readme.mjs';
import { manualProfile, createVisualKit } from '../src/manual.mjs';
import { FAMILIES } from '../src/families.mjs';
import { renderThumbnail } from '../src/thumbnail.mjs';
import { applyRecipe, encodeRecipe, decodeRecipe, shuffleStyle } from '../src/playground.mjs';
import { renderMarkdownPreview } from './markdown-preview.mjs';
import { configErrorMessage } from '../src/i18n.mjs';

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
let state = { ...clone(example), locale: 'pt-BR' }, selected = 'diagnostic', previewMode = 'dark', codeTab = 'readme', exportMode = 'static';
let lastValid, files, baselineState, renderTimer, toastTimer, manualProjects = clone(example.projects);
let undo = [], redo = [], previewUrls = [], galleryUrls = [], favoriteUrls = [], lastEdit;
const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
};
try {
  state = storage.get('diagnostic-profile.draft.v1', state);
  if (location.hash.startsWith('#config=')) state = decodeConfig(location.hash.slice(8));
  if (location.hash.startsWith('#style=')) state = applyRecipe(state, decodeRecipe(location.hash.slice(7)));
  normalizeConfig(state);
} catch { state = clone(example); toast('Não foi possível abrir a configuração salva; carregamos o exemplo.'); }
function toast(message) {
  $('toast').textContent = message; $('toast').hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500);
}
function saveBefore(key) {
  const now = performance.now();
  if (!key || lastEdit?.key !== key || now - lastEdit.time > 900) { undo.push(clone(state)); if (undo.length > 40) undo.shift(); }
  lastEdit = key ? { key, time: now } : undefined; redo = [];
}
function mutate(fn, redraw = false, historyKey) {
  let previous;
  try { previous = normalizeConfig(state); } catch { previous = lastValid; }
  const active = document.activeElement;
  const fieldKey = !redraw && active?.matches('input:not([type=checkbox]),textarea') ? active.dataset.configPath || active.id : undefined;
  saveBefore(historyKey || fieldKey); fn(); clearTimeout(renderTimer);
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
  $(id).addEventListener(check ? 'change' : 'input', () => mutate(() => setPath(path, transform(check ? $(id).checked : $(id).value)), false, check ? undefined : id));
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
    figure.className = isProject ? 'project' : isContact ? 'contact' + (FAMILIES[configuration.appearance.family].world ? ' world-contact' : '') : '';
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
  const readme = generateReadme(lastValid);
  const code = codeTab === 'readme' ? (exportMode === 'static' ? files['README.snippet.md'] : readme) : codeTab === 'config' ? json(exportConfig(lastValid)) : codeTab === 'snippet' ? files['README.snippet.md'] : generateWorkflow(lastValid);
  $('code').textContent = code || 'Habilite a apresentação ou um bloco com conteúdo para gerar o README.';
  const invalid = !$('errors').hidden;
  $('copy').disabled = invalid || !code.trim();
  $('download-readme').disabled = invalid || !readme.trim();
  $('download').disabled = invalid || (exportMode === 'readme' && !readme.trim()) || (exportMode === 'static' && !Object.keys(files).some((name) => name.endsWith('.svg')));
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
      const hint = element('span', configErrorMessage(message.replace(/^-\s*/, '')), 'field-error');
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
    const declared = exportMode !== 'action' ? manualProfile(config) : undefined;
    const renderConfig = declared?.config ?? config;
    const data = declared?.data ?? summarize(user, config.telemetry);
    const oldUrls = previewUrls; previewUrls = [];
    const paint = (target, input) => {
      target.classList.toggle('plain', exportMode === 'readme'); target.dataset.mode = previewMode;
      if (exportMode === 'readme') { renderMarkdownPreview(target, input); return { 'README.snippet.md': generateReadme(input) }; }
      const model = exportMode === 'static' ? manualProfile(input) : { config: input, data: summarize(user, input.telemetry) };
      return drawPreview(target, model.config, model.data, previewMode);
    };
    files = exportMode === 'readme' ? paint($('preview'), config) : drawPreview($('preview'), renderConfig, data, previewMode);
    $('preview').classList.toggle('plain', exportMode === 'readme');
    if (baselineState) paint($('baseline'), normalizeConfig(baselineState));
    oldUrls.forEach((url) => URL.revokeObjectURL(url));
    lastValid = config; $('errors').hidden = true; fieldErrors();
    ['download', 'download-readme', 'save-json', 'share', 'share-style', 'copy', 'favorite'].forEach((id) => { $(id).disabled = false; });
    $('data-warning').hidden = !declared?.warnings.length || exportMode === 'readme';
    $('data-warning').textContent = declared?.warnings.join(' ') ?? '';
    $('demo-banner').textContent = exportMode === 'action'
      ? 'DADOS FICTÍCIOS — a Action buscará seus dados reais.'
      : exportMode === 'static' ? 'CONTEÚDO DECLARADO — kit visual sem estatísticas de demonstração.' : 'MARKDOWN — conteúdo e links do arquivo exportado; a aparência final segue o GitHub.';
    $('render-status').textContent = exportMode === 'readme' ? 'Markdown · conteúdo declarado'
      : Object.keys(files).filter((n) => n.endsWith('.svg')).length + ' SVGs · ' + Math.round(performance.now() - start) + ' ms · ' + (exportMode === 'static' ? 'conteúdo declarado' : 'preview fictício');
    themeSwatches(config); renderCode();
    const saved = storage.set('diagnostic-profile.draft.v1', exportConfig(state));
    $('draft-status').textContent = saved ? 'Rascunho salvo neste navegador.' : 'Armazenamento indisponível; baixe o JSON para guardar.';
  } catch (error) {
    fieldErrors(error);
    $('errors').textContent = 'Revise a configuração:\n' + configErrorMessage(error.message); $('errors').hidden = false;
    ['download', 'download-readme', 'save-json', 'share', 'share-style', 'copy', 'favorite'].forEach((id) => { $(id).disabled = true; });
    $('render-status').textContent = 'O último preview válido foi mantido.';
  }
  $('undo').disabled = !undo.length; $('redo').disabled = !redo.length;
}
function updateForms() {
  let config;
  try { config = normalizeConfig(state); } catch { config = lastValid; }
  if (!config) return;
  const values = {
    locale: config.locale, 'language-limit': config.telemetry.languageLimit, 'excluded-languages': config.telemetry.excludeLanguages.join(', '),
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
  for (const id of Object.keys(PRESETS)) {
    const guide = PRESET_GUIDE[id];
    const config = normalizeConfig({ ...example, theme: undefined, preset: id });
    const data = summarize(user, config.telemetry);
    const thumbnail = renderThumbnail(config, data);
    const card = button('', () => { applyPreset(id); $('workspace').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, 'Usar modelo ' + guide.name);
    card.className = 'preset-card'; card.dataset.preset = id; card.dataset.category = guide.category;
    card.dataset.search = (guide.name + ' ' + guide.description + ' ' + config.widgets.map((w) => labels[w.type]).join(' ')).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); card.setAttribute('aria-pressed', String(id === selected));
    const thumb = element('div', undefined, 'preset-thumb'), img = element('img');
    const url = URL.createObjectURL(new Blob([thumbnail], { type: 'image/svg+xml' })); galleryUrls.push(url);
    img.src = url; img.alt = ''; thumb.append(img);
    const info = element('div', undefined, 'preset-info'), copy = element('div');
    copy.append(element('strong', guide.name), element('small', guide.description), element('span', config.widgets.map((w) => labels[w.type]).join(' → '), 'preset-blocks'));
    info.append(copy, element('span', '↗', 'preset-arrow')); card.append(thumb, info); $('presets').append(card);
  }
}
function drawFavorites() {
  favoriteUrls.forEach((url) => URL.revokeObjectURL(url)); favoriteUrls = [];
  $('favorites').replaceChildren();
  const favorites = storage.get('diagnostic-profile.favorites.v1', []);
  if (!Array.isArray(favorites)) return;
  favorites.slice(0, 6).forEach((favorite, index) => {
    const row = element('div', undefined, 'favorite-row');
    let config;
    try { config = exportConfig(favorite.config); } catch { return; }
    const model = manualProfile(config), img = element('img');
    const url = URL.createObjectURL(new Blob([renderThumbnail(model.config, model.data)], { type: 'image/svg+xml' }));
    favoriteUrls.push(url); img.src = url; img.alt = '';
    const name = element('input'); name.value = String(favorite.name ?? 'Minha receita').slice(0, 80); name.maxLength = 80;
    name.setAttribute('aria-label', 'Nome do favorito ' + (index + 1));
    name.addEventListener('change', () => { favorite.name = name.value.trim() || 'Minha receita'; storage.set('diagnostic-profile.favorites.v1', favorites); });
    const load = button('Abrir', () => { mutate(() => { state = config; }, true); }, 'Abrir favorito ' + name.value);
    const remove = button('Excluir', () => { favorites.splice(index, 1); storage.set('diagnostic-profile.favorites.v1', favorites); drawFavorites(); }, 'Excluir favorito ' + name.value);
    load.className = remove.className = 'text-button'; row.append(img, name, load, remove); $('favorites').append(row);
  });
}
for (const [id, family] of Object.entries(FAMILIES)) { const option = element('option', family.name); option.value = id; $('family').append(option); }

for (const name of paletteNames) { const option = element('option', name); option.value = name; $('theme').append(option); }
for (const widget of WIDGETS) { const option = element('option', labels[widget.id]); option.value = widget.id; $('new-widget').append(option); }
bind('locale', ['locale']); bind('language-limit', ['telemetry', 'languageLimit'], Number);
bind('excluded-languages', ['telemetry', 'excludeLanguages'], (value) => value.split(',').map((v) => v.trim()).filter(Boolean));
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
$('undo').addEventListener('click', () => { if (!undo.length) return; redo.push(clone(state)); lastEdit = undefined; state = undo.pop(); updateForms(); render(); });
$('redo').addEventListener('click', () => { if (!redo.length) return; undo.push(clone(state)); lastEdit = undefined; state = redo.pop(); updateForms(); render(); });
$('random').addEventListener('click', () => {
  try {
    const locks = Object.fromEntries(['world', 'colors', 'layout', 'motion'].map((key) => [key, $('lock-' + key).checked]));
    const mixed = shuffleStyle(state, $('recipe-seed').value, locks);
    mutate(() => { state = mixed; }, true);
  } catch (error) { toast(error.message); }
});
for (const [id, types] of Object.entries({ projects: ['header', 'projects', 'contacts'], notes: ['header', 'now', 'timeline', 'contacts'], story: ['header', 'timeline', 'projects', 'contacts'] })) {
  $('challenge-' + id).addEventListener('click', () => mutate(() => { state.widgets = types.map((type) => ({ id: type, type, enabled: true })); }, true));
}
$('share-style').addEventListener('click', () => { try { copyText(location.origin + location.pathname + '#style=' + encodeRecipe(state)); } catch (error) { toast(error.message); } });

$('reset').addEventListener('click', () => mutate(() => { state = { ...clone(example), locale: 'pt-BR' }; selected = 'diagnostic'; history.replaceState(null, '', location.pathname + location.search); }, true));
for (const tab of ['readme', 'config', 'snippet', 'workflow']) $('show-' + tab).addEventListener('click', () => { codeTab = tab; ['readme', 'config', 'snippet', 'workflow'].forEach((t) => $('show-' + t).setAttribute('aria-pressed', String(t === tab))); renderCode(); });
$('copy').addEventListener('click', () => { render(); if ($('errors').hidden && !$('copy').disabled) copyText($('code').textContent); });
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
    const kit = exportMode === 'readme' ? createReadmeKit(state) : exportMode === 'static' ? createVisualKit(state) : createInstallationKit(state, user, sampleDate);
    download(exportMode === 'readme' ? 'diagnostic-profile-readme.zip' : exportMode === 'static' ? 'diagnostic-profile-visual.zip' : 'diagnostic-profile-kit.zip', zipFiles(kit), 'application/zip');
    toast(exportMode === 'action' ? 'Kit da Action gerado; previews fictícios separados.' : 'Kit gerado com seu conteúdo. Revise os exemplos antes de publicar.');
  } catch (error) { render(); toast(error.message); }
});
function filterGallery() {
  const query = $('preset-search').value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let count = 0;
  document.querySelectorAll('.preset-card').forEach((card) => {
    card.hidden = !card.dataset.search.includes(query) || ($('preset-category').value !== 'all' && card.dataset.category !== $('preset-category').value);
    if (!card.hidden) count++;
  });
  $('gallery-status').textContent = count ? count + (count === 1 ? ' modelo encontrado.' : ' modelos encontrados.') + ' A lista de blocos mostra a composição de cada um.' : 'Nenhum modelo encontrado. Tente outro termo ou objetivo.';
}
$('preset-search').addEventListener('input', filterGallery);
$('preset-category').addEventListener('change', filterGallery);
$('clear-example').addEventListener('click', () => {
  mutate(() => {
    if (state.login === example.login) state.login = '';
    state.header = { name: '', headline: '', tags: [], readouts: [] };
    state.projects = exportMode === 'static' ? [] : 'pinned'; manualProjects = [];
    state.contacts = []; state.content = { skills: [], learning: [], building: [], timeline: [] };
    state.footer = { message: '' }; delete state.assetsBaseUrl;
  }, true);
  $('login').focus();
  toast('Textos de exemplo removidos. Preencha seu perfil e os blocos que quiser usar.');
});
$('download-readme').addEventListener('click', () => {
  try { download('README.md', createReadmeKit(state)['README.md'], 'text/markdown;charset=utf-8'); }
  catch (error) { render(); toast(error.message); }
});
function updateMode() {
  exportMode = $('export-mode').value;
  const simple = exportMode === 'readme', action = exportMode === 'action';
  codeTab = action ? 'snippet' : 'readme';
  for (const tab of ['readme', 'config', 'snippet', 'workflow']) {
    $('show-' + tab).hidden = action ? tab === 'readme' : ['snippet', 'workflow'].includes(tab);
    $('show-' + tab).setAttribute('aria-pressed', String(tab === codeTab));
  }
  $('download-readme').hidden = !simple;
  $('tab-style').hidden = simple;
  if (simple && $('tab-style').getAttribute('aria-selected') === 'true') $('tab-profile').click();
  $('metrics-options').hidden = !action;
  const description = simple
    ? 'README em Markdown com textos e links. O preview mostra o conteúdo do arquivo; cores e formas de SVG não se aplicam.'
    : action ? 'Configuração, snippet e workflow para SVGs atualizados com dados reais do GitHub.'
    : 'README e SVGs com seus textos e links. Envie o ZIP completo para seu repositório, sem token ou Action.';
  $('mode-help').textContent = $('export-description').textContent = description;
  $('export-limitations').textContent = simple ? 'Atualização manual. O ZIP contém README.md e instruções.'
    : action ? 'Action pública versionada. Os previews usam dados fictícios; confira a referência e permissões.'
    : 'Conteúdo manual. Métricas, calendários e consulta de projetos fixados não entram neste kit. Não baixe apenas o README: envie também assets/.';
  $('install-steps').replaceChildren(...(action
    ? ['Adicione a configuração e o workflow ao repositório de perfil.', 'Confira o destino, permissões e referência da Action.', 'Execute o workflow e incorpore o snippet no README.']
    : simple ? ['Revise seus textos e links.', 'Abra ou crie seu repositório público login/login.', 'Envie o README.md para a raiz.']
    : ['Revise seus textos, projetos e contatos.', 'Baixe e extraia o kit ZIP.', 'Envie README.md e a pasta assets/ para a raiz do seu repositório público.']).map((text) => element('li', text)));
  render();
}
$('export-mode').addEventListener('change', updateMode);

drawGallery(); filterGallery(); updateForms(); drawFavorites(); updateMode();
window.addEventListener('beforeunload', () => [...previewUrls, ...galleryUrls, ...favoriteUrls].forEach((url) => URL.revokeObjectURL(url)));
