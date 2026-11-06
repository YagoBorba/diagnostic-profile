import { renderLegacy } from './families/legacy.mjs';
import { renderWorld } from './families/worlds.mjs';
import { WIDGETS } from './catalog.mjs';
import { localizeMetadata } from './accessibility.mjs';

const definition = (name, renderer, world = false) => Object.freeze({ name, version: 1, world,
  formats: Object.freeze(['static', 'action']), widgets: Object.freeze(WIDGETS.map((w) => w.id)), render: (context) => localizeMetadata(renderer(context), context) });
export const FAMILIES = Object.freeze({
  diagnostic: definition('Diagnóstico', renderLegacy), terminal: definition('Terminal', renderLegacy), minimal: definition('Minimalista', renderLegacy),
  workshop: definition('Oficina Zero', renderWorld, true), fieldbook: definition('Arquivo de Campo', renderWorld, true),
  orbital: definition('Cartografia Orbital', renderWorld, true), radio: definition('Estação de Rádio', renderWorld, true),
  inventory: definition('Inventário de Exploração', renderWorld, true), herbarium: definition('Herbário Digital', renderWorld, true),
});
export const familyNames = Object.keys(FAMILIES);
export function getFamily(id) {
  if (!Object.hasOwn(FAMILIES, id)) throw new Error('Unknown visual family: ' + id);
  return FAMILIES[id];
}
