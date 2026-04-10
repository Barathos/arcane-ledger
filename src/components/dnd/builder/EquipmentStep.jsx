import { useState, useEffect, useMemo } from 'react';
import { loadEquipmentIndex, loadEquipmentDescriptions, getItemDescription } from '../../../lib/equipmentDatabase';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';

const CATEGORIES = ['All', 'Weapon', 'Armor', 'Gear', 'Wondrous Item', 'Ring', 'Staff', 'Rod', 'Potion/Oil'];
const PROFICIENCY_COLORS = { Simple: 'text-green-400', Martial: 'text-yellow-400', Exotic: 'text-orange-400' };
const ARMOR_TYPE_COLORS  = { Light: 'text-green-400', Medium: 'text-yellow-400', Heavy: 'text-red-400', Shield: 'text-blue-400' };

const BODY_SLOTS = [
  { id: 'Head',      label: 'Head',      max: 1, icon: '👑', hint: 'Circlets, crowns, hats, headbands, helmets, phylacteries' },
  { id: 'Face',      label: 'Face',      max: 1, icon: '👓', hint: 'Goggles, lenses, masks, spectacles, third eyes' },
  { id: 'Throat',    label: 'Throat',    max: 1, icon: '📿', hint: 'Amulets, badges, brooches, collars, necklaces, pendants, periapts, scarabs, torcs' },
  { id: 'Shoulders', label: 'Shoulders', max: 1, icon: '🧣', hint: 'Capes, cloaks, mantles, shawls' },
  { id: 'Body',      label: 'Body',      max: 1, icon: '🛡', hint: 'Armor, robes' },
  { id: 'Torso',     label: 'Torso',     max: 1, icon: '👕', hint: 'Shirts, tunics, vests, vestments' },
  { id: 'Arms',      label: 'Arms',      max: 1, icon: '💪', hint: 'Armbands, bracelets, bracers' },
  { id: 'Hands',     label: 'Hands',     max: 1, icon: '🧤', hint: 'Gauntlets, gloves' },
  { id: 'Ring',      label: 'Ring',      max: 2, icon: '💍', hint: 'Rings (2 slots)' },
  { id: 'Waist',     label: 'Waist',     max: 1, icon: '🎗', hint: 'Belts, girdles, sashes' },
  { id: 'Feet',      label: 'Feet',      max: 1, icon: '👢', hint: 'Boots, sandals, shoes, slippers' },
];

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n\n').map((para, i) => {
    const html = para
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return <p key={i} className="mb-2 last:mb-0 text-sm font-crimson leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

function formatCost(gp) {
  if (!gp) return 'free';
  if (gp >= 1000) return `${(gp/1000).toFixed(gp%1000===0?0:1)}k gp`;
  return `${gp} gp`;
}

function ItemDetail({ item, onEquip, onEquipToSlot, targetSlot, onClose }) {
  const [desc, setDesc] = useState(() => getItemDescription(item.id));
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!desc) {
      loadEquipmentDescriptions().then(() => setDesc(getItemDescription(item.id)));
    }
  }, [item.id]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-cinzel text-base font-bold text-primary">{item.name}</h3>
          <p className="text-xs text-muted-foreground font-crimson">{item.source}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1 text-xs font-crimson bg-secondary/30 rounded p-2">
        <div><span className="text-muted-foreground">Cost: </span><span className="text-primary font-semibold">{formatCost(item.cost)}</span></div>
        {item.weight > 0 && <div><span className="text-muted-foreground">Weight: </span>{item.weight} lb</div>}

        {/* Weapon stats */}
        {item.category === 'Weapon' && <>
          <div><span className="text-muted-foreground">Damage: </span><span className="font-semibold">{item.damage}</span></div>
          <div><span className="text-muted-foreground">Crit: </span>{item.critRange}</div>
          <div><span className="text-muted-foreground">Type: </span>{item.damageType}</div>
          <div><span className="text-muted-foreground">Class: </span>{item.weaponClass}</div>
          <div className={PROFICIENCY_COLORS[item.proficiency] || ''}>{item.proficiency}</div>
          {item.range > 0 && <div><span className="text-muted-foreground">Range: </span>{item.range} ft</div>}
        </>}

        {/* Armor stats */}
        {item.category === 'Armor' && <>
          <div><span className="text-muted-foreground">AC Bonus: </span><span className="text-green-400 font-bold">+{item.acBonus}</span></div>
          {item.maxDex < 99 && <div><span className="text-muted-foreground">Max Dex: </span>+{item.maxDex}</div>}
          {item.acp > 0 && <div><span className="text-muted-foreground">ACP: </span>-{item.acp}</div>}
          {item.spellFail > 0 && <div><span className="text-muted-foreground">Spell Fail: </span>{item.spellFail}%</div>}
          <div className={ARMOR_TYPE_COLORS[item.armorType] || ''}>{item.armorType}</div>
        </>}

        {/* Magic item stats */}
        {item.slot && <div className="col-span-2"><span className="text-muted-foreground">Slot: </span><span className="text-primary font-semibold">{item.slot || 'Slotless'}</span></div>}
        {item.charges > 0 && <div><span className="text-muted-foreground">Charges: </span>{item.charges}</div>}
      </div>

      {/* Description */}
      {desc && (
        <div className="border-t border-border pt-3">
          {renderMarkdown(desc)}
        </div>
      )}
      {!desc && <p className="text-xs text-muted-foreground font-crimson italic">Loading description…</p>}

      {/* Add to equipment */}
      <div className="pt-2 border-t border-border">
        <div className="flex gap-2 items-center flex-col">
          {(item.category === 'Gear' || item.category === 'Potion/Oil') && (
            <div className="flex items-center gap-1 w-full">
              <span className="text-xs text-muted-foreground font-crimson">Qty:</span>
              <Input type="number" min={1} max={99} value={qty}
                onChange={e => setQty(Math.max(1,parseInt(e.target.value)||1))}
                className="h-7 w-16 text-xs bg-secondary/50 text-center flex-1" />
            </div>
          )}
          {targetSlot && item.slot === targetSlot && (
            <Button onClick={() => onEquipToSlot(item, targetSlot)} className="flex-1 w-full font-cinzel text-xs h-8 bg-primary">
              Equip to {targetSlot} Slot
            </Button>
          )}
          {!targetSlot && (
            <Button onClick={() => onEquip(item, qty)} className="flex-1 w-full font-cinzel text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> Add to Equipment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PaperDoll({ character, updateCharacter, onBrowseSlot }) {
  const slotted = character.equipment?.slottedItems || {};

  const getSlotItems = (slotId) => {
    const items = slotted[slotId];
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  };

  const removeSlotItem = (slotId, idx) => {
    const items = [...getSlotItems(slotId)];
    items.splice(idx, 1);
    updateCharacter({ equipment: {
      ...character.equipment,
      slottedItems: { ...slotted, [slotId]: items.length === 0 ? undefined : items }
    }});
  };

  return (
    <SectionCard title="Paper Doll — Worn Items">
      <p className="text-xs text-muted-foreground font-crimson mb-3">
        Click a slot to browse items for that slot. Rings allow 2 items, all others allow 1.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {BODY_SLOTS.map(slot => {
          const items = getSlotItems(slot.id);
          const full = items.length >= slot.max;
          return (
            <div key={slot.id} className={`border rounded-lg p-2 transition-colors ${
              full ? 'border-primary/40 bg-primary/5' : 'border-border bg-secondary/20 hover:border-primary/30'
            }`}>
              {/* Slot header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{slot.icon}</span>
                  <span className="font-cinzel text-xs text-primary">{slot.label}</span>
                  {slot.max > 1 && (
                    <span className="text-xs text-muted-foreground">×{slot.max}</span>
                  )}
                </div>
                {!full && (
                  <button
                    onClick={() => onBrowseSlot(slot.id)}
                    className="text-xs text-primary hover:text-primary/80 font-cinzel"
                    title={`Browse ${slot.hint}`}
                  >
                    +
                  </button>
                )}
              </div>

              {/* Equipped items */}
              {items.length === 0 ? (
                <button
                  onClick={() => onBrowseSlot(slot.id)}
                  className="w-full text-left text-xs text-muted-foreground/40 font-crimson italic hover:text-muted-foreground/70 transition-colors py-1"
                  title={slot.hint}
                >
                  Empty — {slot.hint.split(',')[0]}...
                </button>
              ) : (
                <div className="space-y-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 group">
                      <span className="font-crimson text-xs flex-1 truncate text-foreground/90" title={item.name}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeSlotItem(slot.id, idx)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {items.length < slot.max && (
                    <button onClick={() => onBrowseSlot(slot.id)}
                      className="text-xs text-muted-foreground/40 font-crimson italic hover:text-muted-foreground/70 w-full text-left">
                      + add another
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export default function EquipmentStep({ character, updateCharacter }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [slotFilter, setSlotFilter] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadEquipmentIndex().then(data => { console.log('[Equip] loaded', data.length, 'items, rings:', data.filter(i=>i.category==='Ring').length); setItems(data); setLoading(false); })
      .catch(err => { console.error('[Equip] failed', err); setLoading(false); });
  }, []);

  const sources = useMemo(() => {
    const s = new Set(items.map(i => i.source).filter(Boolean));
    return ['all', ...Array.from(s).sort()];
  }, [items]);

  const handleBrowseSlot = (slotId) => {
    setSlotFilter(slotId);
    setCategory('Wondrous Item');
    setSearch('');
    document.getElementById('equip-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const equipToSlot = (item, slotId) => {
    const slotDef = BODY_SLOTS.find(s => s.id === slotId);
    if (!slotDef) return;
    const slotted = { ...(character.equipment?.slottedItems || {}) };
    const existing = Array.isArray(slotted[slotId]) ? slotted[slotId] : (slotted[slotId] ? [slotted[slotId]] : []);
    if (existing.length >= slotDef.max) return;
    slotted[slotId] = [...existing, { id: item.id, name: item.name, cost: item.cost, weight: item.weight || 0 }];
    updateCharacter({ equipment: { ...character.equipment, slottedItems: slotted } });
    setSelected(null);
  };

  const filtered = useMemo(() => {
    let list = items;
    if (category !== 'All') list = list.filter(i => i.category === category);
    if (sourceFilter !== 'all') list = list.filter(i => i.source === sourceFilter);
    
    // Slot filter (wondrous items only)
    if (slotFilter && category === 'Wondrous Item') {
      if (slotFilter === 'Slotless') {
        list = list.filter(i => !i.slot || i.slot === '');
      } else {
        list = list.filter(i => i.slot === slotFilter);
      }
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [items, category, sourceFilter, search, slotFilter]);

  const addItem = (item, qty = 1) => {
    const equip = character.equipment || { weapons:[], armor:null, shield:null, gear:[], slottedItems:{}, currency:{pp:0,gp:0,sp:0,cp:0} };

    if (item.category === 'Weapon') {
      const weapons = [...(equip.weapons || [])];
      weapons.push({
        id: item.id, name: item.name, damage: item.damage,
        critRange: item.critRange, damageType: item.damageType,
        range: item.range, attackBonus: 0, weight: item.weight,
        qty: 1, notes: '',
      });
      updateCharacter({ equipment: { ...equip, weapons } });
    } else if (item.category === 'Armor' && item.armorType === 'Shield') {
      updateCharacter({ equipment: { ...equip, shield: {
        id: item.id, name: item.name, acBonus: item.acBonus,
        acp: item.acp, spellFail: item.spellFail, weight: item.weight,
      }}});
    } else if (item.category === 'Armor') {
      updateCharacter({ equipment: { ...equip, armor: {
        id: item.id, name: item.name, acBonus: item.acBonus,
        maxDex: item.maxDex, acp: item.acp, spellFail: item.spellFail,
        type: item.armorType.toLowerCase(), weight: item.weight,
      }}});
    } else {
      const gear = [...(equip.gear || [])];
      const existing = gear.findIndex(g => g.id === item.id);
      if (existing >= 0) gear[existing] = { ...gear[existing], qty: (gear[existing].qty||1) + qty };
      else gear.push({ id: item.id, name: item.name, weight: item.weight, qty, value: item.cost, notes: '' });
      updateCharacter({ equipment: { ...equip, gear } });
    }
    setSelected(null);
  };

  const removeWeapon = (idx) => {
    const weapons = [...(character.equipment?.weapons || [])];
    weapons.splice(idx, 1);
    updateCharacter({ equipment: { ...character.equipment, weapons } });
  };

  const removeGear = (idx) => {
    const gear = [...(character.equipment?.gear || [])];
    gear.splice(idx, 1);
    updateCharacter({ equipment: { ...character.equipment, gear } });
  };

  const equip = character.equipment || {};
  const wepWeight = (equip.weapons||[]).reduce((s,w)=>s+(w.weight||0)*(w.qty||1),0);
  const armorWeight = (equip.armor?.weight||0) + (equip.shield?.weight||0);
  const gearWeight = (equip.gear||[]).reduce((s,g)=>s+(g.weight||0)*(g.qty||1),0);
  const slottedWeight = Object.values(equip.slottedItems||{}).flat().reduce((s,i)=>s+(i?.weight||0),0);
  const totalWeight = wepWeight + armorWeight + gearWeight + slottedWeight;

  const currency = equip.currency || { pp:0, gp:0, sp:0, cp:0 };
  const updateCurrency = (coin, val) => updateCharacter({
    equipment: { ...equip, currency: { ...currency, [coin]: parseInt(val)||0 } }
  });

  return (
    <div className="space-y-4">
      {/* Paper doll */}
      <PaperDoll character={character} updateCharacter={updateCharacter} onBrowseSlot={handleBrowseSlot} />

      {/* Currently equipped */}
      <SectionCard title={`Equipped — ${totalWeight.toFixed(1)} lb total`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weapons */}
          <div>
            <p className="text-xs font-cinzel text-muted-foreground mb-1">WEAPONS</p>
            {(equip.weapons||[]).length === 0 && (
              <p className="text-xs text-muted-foreground/50 font-crimson italic">None</p>
            )}
            {(equip.weapons||[]).map((w, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1 mb-1 group">
                <div className="flex-1 min-w-0">
                  <span className="font-crimson text-sm">{w.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{w.damage} {w.damageType} | {w.critRange}</span>
                </div>
                <button onClick={() => removeWeapon(i)} className="opacity-0 group-hover:opacity-100 text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Armor & Shield */}
          <div>
            <p className="text-xs font-cinzel text-muted-foreground mb-1">ARMOR & SHIELD</p>
            {equip.armor ? (
              <div className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1 mb-1 group">
                <div className="flex-1">
                  <span className="font-crimson text-sm">{equip.armor.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">+{equip.armor.acBonus} AC | ACP -{equip.armor.acp}</span>
                </div>
                <button onClick={() => updateCharacter({ equipment: { ...equip, armor: null } })} className="opacity-0 group-hover:opacity-100 text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : <p className="text-xs text-muted-foreground/50 font-crimson italic">No armor</p>}
            {equip.shield ? (
              <div className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1 mb-1 group">
                <div className="flex-1">
                  <span className="font-crimson text-sm">{equip.shield.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">+{equip.shield.acBonus} AC</span>
                </div>
                <button onClick={() => updateCharacter({ equipment: { ...equip, shield: null } })} className="opacity-0 group-hover:opacity-100 text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : <p className="text-xs text-muted-foreground/50 font-crimson italic">No shield</p>}
          </div>
        </div>

        {/* Gear */}
        {(equip.gear||[]).length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-cinzel text-muted-foreground mb-1">GEAR & MAGIC ITEMS</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {(equip.gear||[]).map((g, i) => (
                <div key={i} className="flex items-center gap-1 bg-secondary/20 rounded px-2 py-1 group text-xs">
                  <span className="font-crimson flex-1 truncate">{g.name}{g.qty > 1 ? ` ×${g.qty}` : ''}</span>
                  <button onClick={() => removeGear(i)} className="opacity-0 group-hover:opacity-100 text-red-400 shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currency */}
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-cinzel text-muted-foreground mb-2">CURRENCY</p>
          <div className="flex gap-3 flex-wrap">
            {[['pp','Platinum'],['gp','Gold'],['sp','Silver'],['cp','Copper']].map(([coin, label]) => (
              <div key={coin} className="flex flex-col items-center">
                <label className="text-xs text-muted-foreground font-crimson">{label}</label>
                <Input type="number" min={0} value={currency[coin]||0}
                  onChange={e => updateCurrency(coin, e.target.value)}
                  className="h-8 w-20 text-center text-sm bg-secondary/50 font-cinzel" />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Browser */}
      <SectionCard title="Equipment Browser" id="equip-browser">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items…"
            className="h-8 text-xs bg-secondary/50 font-crimson w-44" />
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson w-48"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60">
              {sources.map(s => <SelectItem key={s} value={s} className="text-xs">{s === 'all' ? 'All Sources' : s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Slot filter row */}
        {category === 'Wondrous Item' && (
          <div className="flex flex-wrap gap-1 mb-3 items-center">
            <span className="text-xs text-muted-foreground font-crimson">Slot:</span>
            {['All Slots', ...BODY_SLOTS.map(s => s.id), 'Slotless'].map(s => (
              <button key={s}
                onClick={() => setSlotFilter(s === 'All Slots' ? null : s)}
                className={`text-xs px-2 py-0.5 rounded font-crimson transition-colors ${
                  (s === 'All Slots' && !slotFilter) || slotFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}>
                {s === 'Slotless' ? s : s === 'All Slots' ? s : BODY_SLOTS.find(b => b.id === s)?.label || s}
              </button>
            ))}
          </div>
        )}

        {/* Category tabs */}
        <div className="flex overflow-x-auto gap-1 pb-1 mb-3">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); if (cat !== 'Wondrous Item') setSlotFilter(null); }}
              className={`shrink-0 text-xs px-2.5 py-1 rounded font-cinzel transition-colors ${
                category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* List + detail */}
        <div className="flex gap-3" style={{ minHeight: 400 }}>
          <div className="flex-1 border border-border rounded-lg overflow-y-auto" style={{ maxHeight: 480 }}>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground font-crimson text-sm">Loading equipment…</div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground px-3 py-1.5 border-b border-border bg-secondary/20 font-crimson">
                  {filtered.length} items
                </div>
                <div className="divide-y divide-border/50">
                  {filtered.map(item => (
                    <button key={item.id} onClick={() => setSelected(item)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-secondary/50 transition-colors flex items-center gap-2 ${selected?.id === item.id ? 'bg-primary/10' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-crimson text-sm text-foreground">{item.name}</span>
                          <span className="text-xs text-muted-foreground font-crimson">{formatCost(item.cost)}</span>
                          {item.category === 'Weapon' && (
                            <span className={`text-xs font-crimson ${PROFICIENCY_COLORS[item.proficiency]}`}>
                              {item.damage} {item.damageType}
                            </span>
                          )}
                          {item.category === 'Armor' && (
                            <span className={`text-xs font-crimson ${ARMOR_TYPE_COLORS[item.armorType]}`}>
                              +{item.acBonus} AC ({item.armorType})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground/60 font-crimson">{item.source}</span>
                      </div>
                    </button>
                  ))}
                  {filtered.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground font-crimson text-sm py-8">No items match.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {selected && (
            <div className="w-80 shrink-0 border border-border rounded-lg bg-secondary/10 overflow-hidden">
              <ItemDetail item={selected} onEquip={addItem} onEquipToSlot={equipToSlot} targetSlot={slotFilter} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}