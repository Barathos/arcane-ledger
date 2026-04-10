// ============================================================
// D&D 3.5 Feat Database — 1888 feats
// Loaded from hosted JSON and cached in memory.
// ============================================================

const FEAT_DB_URL = 'https://media.base44.com/files/public/69d85a474a5d9fc60d361ab8/de29caaad_dnd35_feat_db.json';

let _featDatabase = null;
let _loadPromise = null;

export async function loadFeatDatabase() {
  if (_featDatabase) return _featDatabase;
  if (_loadPromise) return _loadPromise;

  _loadPromise = fetch(FEAT_DB_URL)
    .then(r => r.json())
    .then(data => {
      _featDatabase = data;
      return data;
    });

  return _loadPromise;
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
  'General', 'Fighter Bonus', 'Metamagic', 'ItemCreate', 'Psionic',
  'Metapsion', 'Divine', 'Wild', 'Exalted', 'Vile', 'Draconic',
  'Domain', 'Bardic', 'Reserve', 'Tactical', 'Racial', 'Luck',
  'Ambush', 'Heritage', 'Regional', 'Ghost', 'Special',
];