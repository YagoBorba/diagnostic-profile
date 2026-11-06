import { exportConfig, encodeConfig, decodeConfig } from './transfer.mjs';
import { resolvePreset, PRESETS } from './presets.mjs';
import { paletteNames } from './themes.mjs';
const fields = ['theme', 'appearance', 'layout', 'widgets'];
export function recipe(input) {
  const c = exportConfig(input);
  return { recipeVersion: 1, ...Object.fromEntries(fields.map((key) => [key, c[key]])),
    widgets: c.widgets.map((w, index) => ({ id: w.type + '-' + index, type: w.type, enabled: w.enabled, title: '' })) };
}
export function applyRecipe(input, style) {
  if (!style || style.recipeVersion !== 1) throw new Error('Receita incompatível; use a versão 1.');
  const safe = recipe({ login: 'recipe-preview', ...Object.fromEntries(fields.filter((key) => Object.hasOwn(style, key)).map((key) => [key, style[key]])) });
  const base = structuredClone(input); delete base.preset; delete base.presetVersion;
  return exportConfig({ ...base, ...Object.fromEntries(fields.map((key) => [key, safe[key]])) });
}
export function encodeRecipe(input) {
  const style = recipe(input);
  return encodeConfig({ login: 'recipe-preview', ...Object.fromEntries(fields.map((key) => [key, style[key]])), projects: [], contacts: [] });
}
export function decodeRecipe(value) { return recipe(decodeConfig(value)); }
export function shuffleStyle(input, seed, locks = { motion: true }) {
  if (typeof seed !== 'string' || seed.length < 1 || seed.length > 80) throw new Error('A semente deve ter entre 1 e 80 caracteres.');
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.codePointAt(0), 16777619) >>> 0;
  const next = () => { state = Math.imul(state, 1664525) + 1013904223 >>> 0; return state / 4294967296; };
  const original = exportConfig(input), base = structuredClone(original);
  fields.forEach((key) => { delete base[key]; });
  const ids = Object.keys(PRESETS);
  const mixed = exportConfig(resolvePreset({ ...base, preset: ids[Math.floor(next() * ids.length)], theme: paletteNames[Math.floor(next() * paletteNames.length)] }));
  mixed.locale = original.locale;
  if (locks.world) for (const key of ['family', 'border', 'density', 'decorations']) mixed.appearance[key] = original.appearance[key];
  if (locks.layout) { mixed.layout = original.layout; mixed.widgets = original.widgets; }
  if (locks.colors) { mixed.theme = original.theme; mixed.appearance.colors = original.appearance.colors; }
  if (locks.motion !== false) mixed.appearance.motion = original.appearance.motion;
  return mixed;
}
