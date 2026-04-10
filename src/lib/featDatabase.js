// ============================================================
// D&D 3.5 Feat Database v2 — 1888 feats with full descriptions
// Lazy-loaded from CDN, cached in memory.
// ============================================================

const FEAT_DB_URL = 'https://media.base44.com/files/public/69d85a474a5d9fc60d361ab8/d6682f4c8_dnd35_feat_db_v2.json';

let _featDatabase = null;
let _loadPromise = null;

// System/internal feats that shouldn't appear in player browser
function isSystemFeat(feat) {
  return /^Bonus \d/.test(feat.name) ||
         /^Spell Immunity \d/.test(feat.name) ||
         feat.name.startsWith('Breed Spell') ||
         feat.name.startsWith('Breed Domain');
}

export async function loadFeatDatabase() {
  if (_featDatabase) return _featDatabase;
  if (_loadPromise) return _loadPromise;

  _loadPromise = fetch(FEAT_DB_URL)
    .then(r => r.json())
    .then(data => {
      _featDatabase = data.filter(f => !isSystemFeat(f));
      return _featDatabase;
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
  'All', 'General', 'Fighter Bonus', 'Metamagic', 'ItemCreate', 'Psionic',
  'Metapsion', 'Divine', 'Wild', 'Exalted', 'Vile', 'Draconic',
  'Domain', 'Bardic', 'Reserve', 'Tactical', 'Racial', 'Luck',
  'Ambush', 'Heritage', 'Regional', 'Ghost', 'Host', 'IllHerit',
];