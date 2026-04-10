// ============================================================
// D&D 3.5 Feat Database v2 — 1888 feats with full descriptions
// Lazy-loaded from CDN, cached in memory.
// ============================================================

const FEAT_INDEX_URL = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_feat_index.json';
const FEAT_DESC_URL  = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_feat_descriptions.json';

let _featDatabase = null;
let _loadPromise = null;
let _featDescriptions = null;
let _descLoadPromise = null;

export async function loadFeatDatabase() {
  if (_featDatabase) return _featDatabase;
  if (_loadPromise) return _loadPromise;

  _loadPromise = fetch(FEAT_INDEX_URL)
    .then(r => r.json())
    .then(data => {
      _featDatabase = data.filter(f => !isSystemFeat(f));
      return _featDatabase;
    });

  return _loadPromise;
}

export async function loadFeatDescriptions() {
  if (_featDescriptions) return _featDescriptions;
  if (_descLoadPromise) return _descLoadPromise;

  _descLoadPromise = fetch(FEAT_DESC_URL)
    .then(r => r.json())
    .then(data => {
      _featDescriptions = data;
      return _featDescriptions;
    });

  return _descLoadPromise;
}

export function getFeatDescription(id) {
  return _featDescriptions?.[id] || null;
}

export function getFeatDatabase() {
  return _featDatabase || [];
}

export function getFeatById(id) {
  return (_featDatabase || []).find(f => f.id === id) || null;
}

export function getFeatsByCategory(category) {
  return (_featDatabase || []).filter(f =>
    f.categories?.some(c => c.toLowerCase() === category.toLowerCase())
  );
}

export const FEAT_CATEGORIES = [
  'All', 'General', 'Fighter Bonus', 'Metamagic', 'ItemCreate', 'Psionic',
  'Metapsion', 'Divine', 'Wild', 'Exalted', 'Vile', 'Draconic',
  'Domain', 'Bardic', 'Reserve', 'Tactical', 'Racial', 'Luck',
  'Ambush', 'Heritage', 'Regional', 'Ghost', 'Host', 'IllHerit',
];