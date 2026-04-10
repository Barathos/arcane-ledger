const SPELL_INDEX_URL = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_spell_index.json';
const SPELL_DESC_URL  = 'https://raw.githubusercontent.com/Barathos/arcane-ledger/main/dnd35_spell_descriptions.json';

let _spellIndex = null;
let _spellDescs = null;
let _descPromise = null;

export async function loadSpellIndex() {
  if (_spellIndex) return _spellIndex;
  const res = await fetch(SPELL_INDEX_URL);
  if (!res.ok) throw new Error(`Spell index fetch failed: ${res.status}`);
  _spellIndex = await res.json();
  console.log('[SpellDB] Loaded', _spellIndex.length, 'spells');
  return _spellIndex;
}

export async function loadSpellDescriptions() {
  if (_spellDescs) return _spellDescs;
  if (_descPromise) return _descPromise;
  _descPromise = fetch(SPELL_DESC_URL)
    .then(r => r.json())
    .then(d => { _spellDescs = d; return d; })
    .catch(err => { console.error('[SpellDB] Desc load failed:', err); _spellDescs = {}; return {}; });
  return _descPromise;
}

export function getSpellIndex() { return _spellIndex || []; }
export function getSpellDescription(id) { return _spellDescs?.[id] || null; }

export function getSpellsForClass(className) {
  return (_spellIndex || []).filter(s => className in s.classes);
}