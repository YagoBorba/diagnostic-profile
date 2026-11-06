import { DEFAULT_WIDGETS, WIDGETS } from './catalog.mjs';
import { familyNames } from './families.mjs';

const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export function normalizeDesign(input, errors) {
  const record = (v, path) => {
    if (v === undefined) return {};
    if (!object(v)) { errors.push('"' + path + '" must be an object'); return {}; }
    return v;
  };
  const option = (v, choices, fallback, path) => {
    if (v === undefined) return fallback;
    if (!choices.includes(v)) { errors.push('"' + path + '" must be one of: ' + choices.join(', ')); return fallback; }
    return v;
  };
  const boolean = (v, fallback, path) => {
    if (v === undefined) return fallback;
    if (typeof v !== 'boolean') { errors.push('"' + path + '" must be a boolean'); return fallback; }
    return v;
  };
  const text = (v, fallback, max, path) => {
    if (v === undefined) return fallback;
    if (typeof v !== 'string' || v.length > max || /[\u0000-\u001f]/.test(v)) { errors.push('"' + path + '" must be text up to ' + max + ' characters without control characters'); return fallback; }
    return v;
  };
  const a = record(input.appearance, 'appearance');
  const l = record(input.layout, 'layout');
  const c = record(input.content, 'content');
  const colors = {};
  const overrides = record(a.colors, 'appearance.colors');
  for (const mode of ['dark', 'light']) {
    const palette = record(overrides[mode], 'appearance.colors.' + mode);
    colors[mode] = {};
    for (const key of ['accent', 'signal', 'panel', 'text']) {
      if (palette[key] !== undefined) {
        if (typeof palette[key] !== 'string' || !/^#[a-f0-9]{6}$/i.test(palette[key])) errors.push('"appearance.colors.' + mode + '.' + key + '" must be a six-digit hex color');
        else colors[mode][key] = palette[key];
      }
    }
  }
  const appearance = {
    family: option(a.family, familyNames, 'diagnostic', 'appearance.family'),
    motion: option(a.motion, ['none', 'subtle', 'full'], 'full', 'appearance.motion'),
    border: option(a.border, ['rounded', 'square'], 'rounded', 'appearance.border'),
    density: option(a.density, ['compact', 'comfortable'], 'comfortable', 'appearance.density'),
    decorations: boolean(a.decorations, true, 'appearance.decorations'), colors,
  };
  const layout = {
    type: option(l.type, ['standard', 'compact', 'grid'], 'standard', 'layout.type'),
    projectColumns: option(l.projectColumns, [1, 2], 2, 'layout.projectColumns'),
    mode: option(l.mode, ['auto', 'dark', 'light'], 'auto', 'layout.mode'),
    markup: option(l.markup, ['picture', 'markdown'], 'picture', 'layout.markup'),
    headings: boolean(l.headings, true, 'layout.headings'),
    textSummary: boolean(l.textSummary, false, 'layout.textSummary'),
    align: option(l.align, ['left', 'center', 'right'], 'center', 'layout.align'),
  };
  const list = (v, path) => {
    if (v === undefined) return [];
    if (!Array.isArray(v) || v.length > 16) { errors.push('"' + path + '" accepts up to 16 text items'); return []; }
    return v.map((item, i) => text(item, '', 140, path + '[' + i + ']'));
  };
  const content = { skills: list(c.skills, 'content.skills'), learning: list(c.learning, 'content.learning'),
    building: list(c.building, 'content.building'), timeline: list(c.timeline, 'content.timeline') };
  let widgets = input.widgets ?? DEFAULT_WIDGETS.map((type) => ({ id: type, type, enabled: true }));
  if (!Array.isArray(widgets) || widgets.length > 16) { errors.push('"widgets" accepts up to 16 widget objects'); widgets = []; }
  const seen = new Set();
  widgets = widgets.map((entry, i) => {
    const w = record(entry, 'widgets[' + i + ']');
    const type = option(w.type, WIDGETS.map((x) => x.id), 'header', 'widgets[' + i + '].type');
    const id = text(w.id, type, 50, 'widgets[' + i + '].id');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || seen.has(id)) errors.push('"widgets[' + i + '].id" must be a unique lowercase filename identifier');
    seen.add(id);
    return { id, type, enabled: boolean(w.enabled, true, 'widgets[' + i + '].enabled'), title: text(w.title, '', 80, 'widgets[' + i + '].title') };
  });
  const destination = record(input.destination, 'destination');
  const repository = text(destination.repository, '', 140, 'destination.repository');
  const branch = text(destination.branch, 'output', 100, 'destination.branch');
  if (repository && !/^[a-z\d][a-z\d-]*\/[a-z\d_.-]+$/i.test(repository)) errors.push('"destination.repository" must be owner/repository');
  if (!/^[a-z\d][a-z\d._/-]*$/i.test(branch) || branch.includes('..') || branch.includes('//') || branch.endsWith('/') || branch.endsWith('.lock')) errors.push('"destination.branch" must be a valid branch path');
  if (branch === 'HEAD' || branch.endsWith('.') || branch.split('/').some((part) => part.startsWith('.') || part.endsWith('.lock'))) errors.push('"destination.branch" contains a reserved or invalid Git ref component');
  if (['main', 'master', 'develop'].includes(branch.toLowerCase())) errors.push('"destination.branch" must be a dedicated asset branch, not main, master or develop');
  return { locale: option(input.locale, ['en', 'pt-BR'], 'en', 'locale'), appearance, layout, content, widgets, destination: { repository, branch } };
}

export function applyAppearance(svg, appearance) {
  if (appearance.motion !== 'full') {
    const rule = appearance.motion === 'none' ? '*{animation:none!important}' : '.pulse,.cursor,.scroll{animation:none!important}';
    svg = svg.replace('</style>', rule + '\n</style>');
  }
  if (appearance.family === 'terminal') svg = svg.replace('</style>', '.sans{font-family:ui-monospace,Consolas,monospace}\n</style>');
  return svg;
}
export function contrastRatio(a, b) {
  const luminance = (hex) => {
    const rgb = hex.slice(1).match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
