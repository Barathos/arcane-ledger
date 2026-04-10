// Add a version timestamp so the URL changes when we need to bust the cache
// Update this number when you upload new equipment data
const CACHE_BUST = 'v2';

const EQUIP_INDEX_URL = `https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_equipment_index.json?cb=${CACHE_BUST}`;
const EQUIP_DESC_URL  = `https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_equipment_descriptions.json?cb=${CACHE_BUST}`;

let _index = null;
let _descs = null;
let _descPromise = null;
let _indexPromise = null;

export async function loadEquipmentIndex() {
  if (_index) return _index;
  if (_indexPromise) return _indexPromise;

  _indexPromise = fetch(EQUIP_INDEX_URL, {
    cache: 'no-cache',  // bypass browser cache — always get latest
  })
    .then(r => {
      if (!r.ok) throw new Error(`Equipment index fetch failed: ${r.status}`);
      return r.json();
    })
    .then(data => {
      _index = data;
      console.log('[EquipDB] Loaded', _index.length, 'items');
      return _index;
    })
    .catch(err => {
      console.error('[EquipDB] Failed to load:', err);
      _indexPromise = null; // allow retry
      return [];
    });

  return _indexPromise;
}

export async function loadEquipmentDescriptions() {
  if (_descs) return _descs;
  if (_descPromise) return _descPromise;

  _descPromise = fetch(EQUIP_DESC_URL, { cache: 'no-cache' })
    .then(r => r.json())
    .then(d => { _descs = d; return d; })
    .catch(err => {
      console.error('[EquipDB] Desc load failed:', err);
      _descs = {};
      return {};
    });

  return _descPromise;
}

export function getEquipmentIndex() { return _index || []; }
export function getItemDescription(id) { return _descs?.[id] || null; }

// Call this if you need to force a fresh fetch (e.g. after uploading new data)
export function clearEquipmentCache() {
  _index = null;
  _descs = null;
  _descPromise = null;
  _indexPromise = null;
}