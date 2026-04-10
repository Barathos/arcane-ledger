// ============================================================
// D&D 3.5 Feat Database — lazy-loaded from GitHub, cached in memory.
// ============================================================

const FEAT_INDEX_URL = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_feat_index.json';
const FEAT_DESC_URL  = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_feat_descriptions.json';

let _featIndex = null;
let _featDescriptions = null;

export async function loadFeatDatabase() {
  if (_featIndex) return _featIndex;
  console.log('[FeatDB] Fetching index from:', FEAT_INDEX_URL);
  const response = await fetch(FEAT_INDEX_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  _featIndex = await response.json();
  console.log('[FeatDB] Index loaded:', _featIndex.length, 'feats');
  return _featIndex;
}

export async function loadFeatDescriptions() {
  if (_featDescriptions) return _featDescriptions;
  console.log('[FeatDB] Fetching descriptions from:', FEAT_DESC_URL);
  const response = await fetch(FEAT_DESC_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  _featDescriptions = await response.json();
  console.log('[FeatDB] Descriptions loaded:', Object.keys(_featDescriptions).length, 'entries');
  return _featDescriptions;
}

export function getFeatDescription(id) {
  return _featDescriptions?.[id] || null;
}

export function getFeatDatabase() {
  return _featIndex || [];
}

export function getFeatById(id) {
  return (_featIndex || []).find(f => f.id === id) || null;
}

export function getFeatsByCategory(category) {
  return (_featIndex || []).filter(f =>
    f.categories?.some(c => c.toLowerCase() === category.toLowerCase())
  );
}

export const FEAT_CATEGORIES = [
  'All', 'General', 'Fighter Bonus', 'Metamagic', 'ItemCreate', 'Psionic',
  'Metapsion', 'Divine', 'Wild', 'Exalted', 'Vile', 'Draconic',
  'Domain', 'Bardic', 'Reserve', 'Tactical', 'Racial', 'Luck',
  'Ambush', 'Heritage', 'Regional', 'Ghost', 'Host', 'IllHerit',
];