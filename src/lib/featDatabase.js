// ============================================================
// D&D 3.5 Feat Database v2 — lazy-loaded from GitHub, cached in memory.
// ============================================================

const FEAT_INDEX_URL = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_feat_index.json';
const FEAT_DESC_URL  = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_feat_descriptions.json';
const FETCH_OPTS = { method: 'GET', headers: { 'Accept': 'application/json' }, mode: 'cors' };

let _featDatabase = null;
let _loadPromise = null;
let _featDescriptions = null;
let _descLoadPromise = null;

export async function loadFeatDatabase() {
  if (_featDatabase) return _featDatabase;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      console.log('[FeatDB] Loading index from:', FEAT_INDEX_URL);
      const r = await fetch(FEAT_INDEX_URL, FETCH_OPTS);
      if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
      const data = await r.json();
      console.log('[FeatDB] Index loaded:', data.length, 'feats');
      _featDatabase = Array.isArray(data) ? data : [];
      return _featDatabase;
    } catch (err) {
      console.error('[FeatDB] Index load error:', err);
      _featDatabase = [];
      _loadPromise = null;
      return [];
    }
  })();

  return _loadPromise;
}

export async function loadFeatDescriptions() {
  if (_featDescriptions) return _featDescriptions;
  if (_descLoadPromise) return _descLoadPromise;

  _descLoadPromise = (async () => {
    try {
      console.log('[FeatDB] Loading descriptions from:', FEAT_DESC_URL);
      const r = await fetch(FEAT_DESC_URL, FETCH_OPTS);
      if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
      const data = await r.json();
      console.log('[FeatDB] Descriptions loaded:', Object.keys(data).length, 'entries');
      _featDescriptions = (data && typeof data === 'object') ? data : {};
      return _featDescriptions;
    } catch (err) {
      console.error('[FeatDB] Descriptions load error:', err);
      _featDescriptions = {};
      _descLoadPromise = null;
      return {};
    }
  })();

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