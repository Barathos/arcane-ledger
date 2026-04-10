import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadFeatDatabase, getFeatDatabase, FEAT_CATEGORIES, loadFeatDescriptions, getFeatDescription } from '../../../lib/featDatabase';
import { checkAllPrereqs, getTotalLevel, buildCharacterState, SKILL_LIST, getRacialBenefits } from '../../../lib/characterEngine';
import { X } from 'lucide-react';

const COMMON_WEAPONS = ['Longsword','Shortsword','Rapier','Greatsword','Battleaxe','Greataxe','Dagger','Handaxe','Warhammer','Longbow','Shortbow','Crossbow, Heavy','Spear','Quarterstaff','Flail','Mace, Heavy'];
const WEAPON_SELECT_FEATS = ['fWepFoc','fWepSpec','fImpCrit','fGreWepFoc','fGreWepSpec'];

function needsWeaponSelect(featId) {
  return WEAPON_SELECT_FEATS.some(prefix => featId?.startsWith(prefix));
}

function getPrereqCurrentValue(expr, cs) {
  const abilMap = { aSTR:'STR', aDEX:'DEX', aCON:'CON', aINT:'INT', aWIS:'WIS', aCHA:'CHA' };
  for (const [key, stat] of Object.entries(abilMap)) {
    if (expr.includes(`child[${key}]`)) return cs[stat];
  }
  if (expr.includes('tAtkBase')) return `+${cs.BAB}`;
  const skM = expr.match(/#skillranks\[(\w+)\]/) || expr.match(/childfound\[(\w+)\]\.field\[kUserRanks\]/);
  if (skM) {
    const ranks = cs.skillRanks[skM[1]] || 0;
    const skillName = SKILL_LIST.find(s => s.id === skM[1])?.name || skM[1];
    return `${ranks} ranks in ${skillName}`;
  }
  if (expr.includes('herofield[tLevel]') || expr.includes('#totallevelcount')) return `Level ${cs.totalLevel}`;
  const clsM = expr.match(/#levelcount\[(\w+)\]/) || expr.match(/tagcount\[Classes\.(\w+)\]/);
  if (clsM) return `${cs.classLevel(clsM[1])} levels in ${clsM[1]}`;
  const svM = expr.match(/child\[v(Fort|Ref|Will)\]\.field\[vBase\]\.value/);
  if (svM) return `Base ${svM[1]} +${cs[svM[1].toLowerCase() + 'Base']}`;
  const fM = expr.match(/#hasfeat\[(\w+)\]/);
  if (fM) return cs.featIds.has(fM[1]) ? 'Have it' : 'Not taken';
  if (expr.includes('tagcount[Hero.Arcane]')) {
    const m = expr.match(/tagcount\[Hero\.Arcane\]\s*>=\s*(\d+)/);
    return `Arcane level ${cs.maxArcaneLevel} (need ${m ? m[1] : '?'})`;
  }
  if (expr.includes('tagcount[Hero.Divine]')) return `Divine level ${cs.maxDivineLevel}`;
  if (expr.includes('xSneakAtt')) return `Sneak attack ${cs.sneakAttack}d6`;
  return null;
}

function PrereqRow({ prereq, passed, unknown, charState }) {
  const currentValue = (!passed && !unknown) ? getPrereqCurrentValue(prereq.expr, charState) : null;
  return (
    <div className="flex items-start gap-2 text-xs font-crimson py-0.5">
      <span className={`mt-0.5 shrink-0 ${passed ? 'text-green-400' : unknown ? 'text-yellow-400' : 'text-red-400'}`}>
        {passed ? '✓' : unknown ? '⚠' : '✗'}
      </span>
      <span className={passed ? 'text-green-400/80' : unknown ? 'text-yellow-400/80' : 'text-red-400/80'}>
        {prereq.message}
        {currentValue !== null && (
          <span className="text-muted-foreground ml-1 italic">— Current: {currentValue}</span>
        )}
      </span>
    </div>
  );
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
  let slots = totalLevel === 0 ? 0 : Math.ceil(totalLevel / 2);
  
  const benefits = getRacialBenefits(character);
  if ((benefits?.bonusFeatAtL1 || (character.race?.name === 'Human') || (character.race?.id === 'rHuman2')) && totalLevel >= 1) {
    slots += 1;
  }

  const fighterLevels = (character.classes || []).find(c => c.name === 'Fighter')?.levels || 0;
  const fighterBonusSlots = fighterLevels > 0 ? 1 + Math.floor(fighterLevels / 2) : 0;

  // noCount feats (override + don't count) are excluded from slot consumption
  const takenRegular = (character.feats || []).filter(f => !f.isFighterBonus && !f.noCount).length;
  const takenFighter = (character.feats || []).filter(f => f.isFighterBonus && !f.noCount).length;

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
  const [override, setOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [noCount, setNoCount] = useState(false);
  const [description, setDescription] = useState(() => getFeatDescription(feat.id));

  useEffect(() => {
    async function loadDesc() {
      try {
        await loadFeatDescriptions();
        setDescription(getFeatDescription(feat.id));
      } catch (err) {
        console.error('[FeatBrowser] Failed to load descriptions:', err);
      }
    }
    if (!description) loadDesc();
  }, [feat.id]);

  const isTaken = (character.feats || []).some(f => f.id === feat.id);
  const prereqResult = feat.prereqs?.length ? checkAllPrereqs(feat.prereqs, character) : null;
  const charState = feat.prereqs?.length ? buildCharacterState(character) : null;
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

      {description ? (
        <div className="text-sm font-crimson text-foreground/90 leading-relaxed">
          {renderMarkdown(description)}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-crimson italic">Loading description…</p>
      )}

      {feat.prereqs?.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-crimson uppercase tracking-wide">Prerequisites</p>
          {feat.prereqs.map((p, i) => {
            const r = prereqResult?.all[i];
            return (
              <PrereqRow
                key={i}
                prereq={p}
                passed={r?.passed === true}
                unknown={r?.unknown === true}
                charState={charState}
              />
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

      {/* Override section */}
      {!isTaken && (
        <div className="pt-2 border-t border-border space-y-2">
          <label className="flex items-center gap-2 text-xs font-crimson cursor-pointer">
            <input
              type="checkbox"
              checked={override}
              onChange={e => { setOverride(e.target.checked); if (!e.target.checked) setNoCount(false); }}
              className="rounded"
            />
            <span className={override ? 'text-yellow-400' : 'text-muted-foreground'}>Override prerequisites &amp; slot limit</span>
          </label>
          {override && (
            <>
              <textarea
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="Reason for override (DM approval, house rule, etc.)…"
                className="w-full text-xs font-crimson bg-secondary/50 border border-yellow-700/50 rounded p-2 text-foreground placeholder:text-muted-foreground resize-none h-16"
              />
              <label className="flex items-center gap-2 text-xs font-crimson cursor-pointer">
                <input
                  type="checkbox"
                  checked={noCount}
                  onChange={e => setNoCount(e.target.checked)}
                  className="rounded"
                />
                <span className={noCount ? 'text-blue-400' : 'text-muted-foreground'}>Don't count against feat slots</span>
              </label>
            </>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-border flex gap-2">
        {isTaken ? (
          <Button onClick={() => onRemove(feat)} variant="outline" className="flex-1 font-cinzel border-red-900/50 text-red-400 hover:bg-red-900/20">
            Remove Feat
          </Button>
        ) : (
          <Button
            onClick={() => onTake(feat, weaponChoice, override, overrideReason, noCount)}
            disabled={(requiresWeapon && !weaponChoice) || (!override && (!hasSlots || (prereqResult && !prereqResult.meetsAll)))}
            className={`flex-1 font-cinzel ${override ? 'border border-yellow-700/60 bg-yellow-900/20 text-yellow-300 hover:bg-yellow-900/40' : ''}`}
            title={!hasSlots && !override ? 'No feat slots remaining' : requiresWeapon && !weaponChoice ? 'Select a weapon first' : ''}
          >
            {override ? '⚠ Override Take Feat' : 'Take Feat'}
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
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadFeatDatabase();
        setFeats(data);
        setLoadFailed(data.length === 0);
      } catch (err) {
        console.error('[FeatBrowser] Failed to load feats:', err);
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }
    load();
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
      const q = search.toLowerCase().trim();
      const scored = list.map(feat => {
        const name = feat.name.toLowerCase();
        const desc = (feat.description || '').toLowerCase();
        let score = 0;
        if (name === q)              score = 100;
        else if (name.startsWith(q)) score = 80;
        else if (name.includes(q))   score = 60;
        else if (desc.includes(q))   score = 20;
        return { feat, score };
      }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
      list = scored.map(({ feat }) => feat);
    }
    if (availability !== 'Show All') {
      list = list.filter(feat => {
        if (!feat.prereqs?.length) {
          return availability === 'Available Only';
        }
        const r = checkAllPrereqs(feat.prereqs, character);
        return availability === 'Available Only' ? r.meetsAll : !r.meetsAll;
      });
    }
    return list;
  }, [feats, category, fighterOnly, search, availability, character]);

  const handleTake = (feat, weaponId, override, overrideReason, noCount) => {
    updateCharacter(prev => ({
      ...prev,
      feats: [...(prev.feats || []), {
        id: feat.id,
        name: feat.name,
        weaponId: weaponId || null,
        isFighterBonus: false,
        override: override || false,
        overrideReason: override ? (overrideReason || '') : undefined,
        noCount: override && noCount ? true : undefined,
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
          ) : loadFailed ? (
            <div className="flex items-center justify-center h-40 text-center px-4">
              <p className="text-red-400 font-crimson text-sm">Failed to load feat database.<br/><span className="text-xs text-muted-foreground">Check the browser console for details.</span></p>
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