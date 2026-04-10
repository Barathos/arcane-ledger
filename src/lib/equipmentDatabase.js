const EQUIP_INDEX_URL = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_equipment_index.json';
const EQUIP_DESC_URL  = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_equipment_descriptions.json';

let _index = null;
let _descs = null;
let _descPromise = null;

export async function loadEquipmentIndex() {
  if (_index) return _index;
  const res = await fetch(EQUIP_INDEX_URL);
  if (!res.ok) throw new Error(`Equipment fetch failed: ${res.status}`);
  _index = await res.json();
  console.log('[EquipDB] Loaded', _index.length, 'items');
  return _index;
}

export async function loadEquipmentDescriptions() {
  if (_descs) return _descs;
  if (_descPromise) return _descPromise;
  _descPromise = fetch(EQUIP_DESC_URL)
    .then(r => r.json())
    .then(d => { _descs = d; return d; })
    .catch(() => { _descs = {}; return {}; });
  return _descPromise;
}

export function getEquipmentIndex() { return _index || []; }
export function getItemDescription(id) { return _descs?.[id] || null; }