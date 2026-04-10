import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadFeatDatabase, getFeatDatabase, FEAT_CATEGORIES } from '../../../lib/featDatabase';
import { checkAllPrereqs, getTotalLevel } from '../../../lib/characterEngine';
import { X } from 'lucide-react';

const COMMON_WEAPONS = ['Longsword','Shortsword','Rapier','Greatsword','Battleaxe','Greataxe','Dagger','Handaxe','Warhammer','Longbow','Shortbow','Crossbow, Heavy','Spear','Quarterstaff','Flail','Mace, Heavy'];
const WEAPON_SELECT_FEATS = ['fWepFoc','fWepSpec','fImpCrit','fGreWepFoc','fGreWepSpec'];

function needsWeaponSelect(featId) {
  return WEAPON_SELECT_FEATS.some(prefix => featId?.startsWith(prefix));
}

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n\n').map((para, i) => {
    const html = para
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

function getFeatSlots(character) {
  const totalLevel = getTotalLevel(character);
  // Regular feats: L1, 3, 5, 7, 9, 11, 13, 15, 17, 19 = ceil(totalLevel/2)
  let slots = Math.ceil(totalLevel / 2);
  // Human bonus feat at L1
  const isHuman = character.race?.name === 'Human' || character.race?.id === 'rHuman2' || character.race?.name?.includes('Human');
  if (isHuman && totalLevel >= 1) slots += 1;

  // Fighter bonus feats: L1, L2, L4, L6... = 1 + floor(fighterLevels/2)
  const fighterLevels = (character.classes || []).find(c => c.name === 'Fighter')?.levels || 0;
  const fighterBonusSlots = fighterLevels > 0 ? 1 + Math.floor(fighterLevels / 2) : 0;

  const takenRegular = (character.feats || []).filter(f => !f.isFighterBonus).length;
  const takenFighter = (character.feats || []).filter(f => f.isFighterBonus).length;

  return { slots, fighterBonusSlots, takenRegular, takenFighter, totalLevel };
}

function AvailabilityDot({ result, noPrereqs }) {
  if (noPrereqs) return <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" title="No prerequisites" />;
  if (!result) return <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" />;
  if (result.meetsAll) return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Eligible" />;
  if (result.failed.length === 0) return <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" title="Unknown requirements" />;
  return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" title="Prerequisites not met" />;
}

function FeatDetail({ feat, character, onTake, onRemove }) {
  const [weaponChoice, setWeaponChoice] = useState('');
  const isTaken = (character.feats || []).some(f => f.id === feat.id);
  const prereqResult = feat.prereqs?.length ? checkAllPrereqs(feat.prereqs, character) : null;
  const { slots, takenRegular } = getFeatSlots(character);
  const hasSlots = takenRegular < slots;
  const requiresWeapon = needsWeaponSelect(feat.id);

  const equippedWeapons = (character.equipment?.weapons || []).map(w => w.name).filter(Boolean);
  const weaponOptions = [...new Set([...equippedWeapons, ...COMMON_WEAPONS])];

  return (
    <div className="p-4 space-y-3 h-full overflow-y-auto">
      <div>
        <h3 className="font-cinzel text-lg font-bold text-primary">{feat.name}</h3>
        <p className="text-xs text-muted-foreground font-crimson">{feat.source}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {(feat.categories || []).map(c => (
            <span key={c} className="text-xs bg-secondary/50 rounded px-1.5 py-0.5 font-crimson">{c}</span>
          ))}
          {feat.fighterBonus && (
            <span className="text-xs bg-orange-900/30 text-orange-300 rounded px-1.5 py-0.5 font-crimson">Fighter Bonus</span>
          )}
        </div>
      </div>

      {feat.description && (
        <div className="text-sm font-crimson text-foreground/90 leading-relaxed">
          {renderMarkdown(feat.description)}
        </div>
      )}

      {feat.prereqs?.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-crimson uppercase tracking-wide">Prerequisites</p>
          {feat.prereqs.map((p, i) => {
            const r = prereqResult?.all[i];
            return (
              <div key={i} className="flex items-start gap-2 text-xs font-crimson py-0.5">
                <span className={`mt-0.5 shrink-0 ${r?.passed === true ? 'text-green-400' : r?.passed === false ? 'text-red-400' : 'text-yellow-400'}`}>
                  {r?.passed === true ? '✓' : r?.passed === false ? '✗' : '⚠'}
                </span>
                <span className={r?.passed === true ? 'text-green-400/80' : r?.passed === false ? 'text-red-400/80' : 'text-yellow-400/80'}>
                  {p.message}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {requiresWeapon && !isTaken && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-crimson">Select Weapon</p>
          <Select value={weaponChoice} onValueChange={setWeaponChoice}>
            <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson"><SelectValue placeholder="Choose weapon…" /></SelectTrigger>
            <SelectContent className="max-h-48">
              {weaponOptions.map(w => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="pt-2 border-t border-border flex gap-2">
        {isTaken ? (
          <Button onClick={() => onRemove(feat)} variant="outline" className="flex-1 font-cinzel border-red-900/50 text-red-400 hover:bg-red-900/20">
            Remove Feat
          </Button>
        ) : (
          <Button
            onClick={() => onTake(feat, weaponChoice)}
            disabled={!hasSlots || (requiresWeapon && !weaponChoice)}
            className="flex-1 font-cinzel"
            title={!hasSlots ? 'No feat slots remaining' : requiresWeapon && !weaponChoice ? 'Select a weapon first' : ''}
          >
            Take Feat
          </Button>
        )}
      </div>
    </div>
  );
}

export default function FeatBrowser({ character, updateCharacter }) {
  const [feats, setFeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('Show All');
  const [fighterOnly, setFighterOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadFeatDatabase().then(data => {
      setFeats(data);
      setLoading(false);
    });
  }, []);

  const { slots, fighterBonusSlots, takenRegular, takenFighter } = getFeatSlots(character);

  const filtered = useMemo(() => {
    if (!feats.length) return [];
    let list = feats;

    if (category !== 'All') {
      list = list.filter(f => f.categories?.includes(category));
    }
    if (fighterOnly) {
      list = list.filter(f => f.fighterBonus === true);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q)
      );
    }
    if (availability !== 'Show All') {
      list = list.filter(feat => {
        if (!feat.prereqs?.length) {
          return availability === 'Available Only'; // no prereqs = always available
        }
        const r = checkAllPrereqs(feat.prereqs, character);
        const isAvailable = r.meetsAll;
        return availability === 'Available Only' ? isAvailable : !isAvailable;
      });
    }
    return list;
  }, [feats, category, fighterOnly, search, availability, character]);

  const handleTake = (feat, weaponId) => {
    updateCharacter(prev => ({
      ...prev,
      feats: [...(prev.feats || []), {
        id: feat.id,
        name: feat.name,
        weaponId: weaponId || null,
        isFighterBonus: false,
      }]
    }));
    setSelected(null);
  };

  const handleRemove = (feat) => {
    updateCharacter(prev => ({
      ...prev,
      feats: (prev.feats || []).filter(f => f.id !== feat.id)
    }));
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header / slot counts */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-crimson bg-secondary/30 rounded-lg px-3 py-2">
        <span>Feats: <strong className="text-primary">{takenRegular}/{slots}</strong> taken</span>
        {fighterBonusSlots > 0 && (
          <span>Fighter bonus: <strong className="text-primary">{takenFighter}/{fighterBonusSlots}</strong></span>
        )}
        <span className={slots - takenRegular > 0 ? 'text-green-400' : 'text-muted-foreground'}>
          {slots - takenRegular} slot{slots - takenRegular !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or description…"
          className="h-8 text-xs bg-secondary/50 font-crimson w-48"
        />
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Show All">Show All</SelectItem>
            <SelectItem value="Available Only">Available Only</SelectItem>
            <SelectItem value="Unavailable Only">Unavailable Only</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-1.5 text-xs font-crimson cursor-pointer">
          <input
            type="checkbox"
            checked={fighterOnly}
            onChange={e => setFighterOnly(e.target.checked)}
            className="rounded"
          />
          Fighter bonus only
        </label>
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1">
        {FEAT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 text-xs px-2.5 py-1 rounded font-cinzel transition-colors ${
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main area */}
      <div className="flex gap-3" style={{ minHeight: 400 }}>
        {/* Feat list */}
        <div className="flex-1 overflow-y-auto border border-border rounded-lg" style={{ maxHeight: 480 }}>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground font-crimson text-sm">
              Loading feats…
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground font-crimson px-3 py-1.5 border-b border-border bg-secondary/20">
                {filtered.length} feats
              </div>
              <div className="divide-y divide-border/50">
                {filtered.map(feat => {
                  const isTaken = (character.feats || []).some(f => f.id === feat.id);
                  const noPrereqs = !feat.prereqs?.length;
                  const prereqResult = noPrereqs ? null : checkAllPrereqs(feat.prereqs, character);
                  return (
                    <button
                      key={feat.id}
                      onClick={() => setSelected(feat)}
                      className={`w-full text-left px-3 py-2 hover:bg-secondary/50 transition-colors flex items-center gap-2 ${
                        selected?.id === feat.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <AvailabilityDot result={prereqResult} noPrereqs={noPrereqs} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-crimson text-sm text-foreground">{feat.name}</span>
                          {isTaken && (
                            <span className="text-xs bg-primary/20 text-primary rounded px-1.5 py-0.5 font-cinzel shrink-0">✓ Taken</span>
                          )}
                          {feat.fighterBonus && (
                            <span className="text-xs bg-orange-900/20 text-orange-400 rounded px-1 font-crimson shrink-0">F</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-crimson">{feat.source}</span>
                          {(feat.categories || []).slice(0, 2).map(c => (
                            <span key={c} className="text-xs bg-secondary/60 rounded px-1 font-crimson text-foreground/60">{c}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <p className="text-center text-muted-foreground font-crimson text-sm py-8">No feats match your filters.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 border border-border rounded-lg bg-secondary/10 overflow-hidden relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <FeatDetail
              feat={selected}
              character={character}
              onTake={handleTake}
              onRemove={handleRemove}
            />
          </div>
        )}
      </div>
    </div>
  );
}