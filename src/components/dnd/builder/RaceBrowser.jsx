import { useState, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RACE_DATABASE, SOURCE_GROUPS } from '../../../lib/raceDataService';
import { ExternalLink, X, Search, AlertCircle } from 'lucide-react';

// ─── Ability badges ───────────────────────────────────────────────────────────
function AbilityBadges({ abilityMods }) {
  if (!abilityMods) return null;
  const map = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
  const parts = Object.entries(abilityMods).filter(([, v]) => v !== 0).map(([k, v]) => ({ key: k, label: map[k], val: v }));
  if (parts.length === 0) return <span className="text-xs text-muted-foreground font-crimson">No ability adj.</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {parts.map(p => (
        <span key={p.key} className={`text-xs px-1.5 py-0.5 rounded font-crimson font-semibold ${p.val > 0 ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
          {p.val > 0 ? '+' : ''}{p.val} {p.label}
        </span>
      ))}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function RaceDetailPanel({ race, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-primary">{race.name}</h2>
            <p className="text-xs text-muted-foreground font-crimson">{race.source}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-crimson">
            <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Size</div><div className="font-semibold">{race.size}</div></div>
            <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Speed</div><div className="font-semibold">{race.speed} ft</div></div>
            <div className={`rounded p-2 text-center ${race.LA > 0 ? 'bg-red-900/30' : 'bg-secondary/30'}`}>
              <div className="text-xs text-muted-foreground">LA</div>
              <div className={`font-semibold ${race.LA > 0 ? 'text-red-400' : ''}`}>+{race.LA}</div>
            </div>
            <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Fav. Class</div><div className="font-semibold text-xs truncate">{race.favoredClass || '—'}</div></div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-crimson mb-1">Ability Adjustments</p>
            <AbilityBadges abilityMods={race.abilityMods} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {race.darkvision > 0 && <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded font-crimson">Darkvision {race.darkvision} ft</span>}
            {race.lowLightVision && <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded font-crimson">Low-Light Vision</span>}
            {race.naturalArmor > 0 && <span className="bg-green-900/30 text-green-300 px-2 py-1 rounded font-crimson">+{race.naturalArmor} Natural Armor</span>}
            {race.SR && <span className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded font-crimson">SR: {race.SR}</span>}
            {race.swimSpeed > 0 && <span className="bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded font-crimson">Swim {race.swimSpeed} ft</span>}
            {race.flySpeed > 0 && <span className="bg-sky-900/30 text-sky-300 px-2 py-1 rounded font-crimson">Fly {race.flySpeed} ft</span>}
          </div>

          {race.languages && (
            <div>
              <p className="text-xs text-muted-foreground font-crimson mb-1">Languages</p>
              <p className="text-sm font-crimson text-foreground">{race.languages}</p>
            </div>
          )}

          {race.description && (
            <div>
              <p className="text-xs text-muted-foreground font-crimson mb-1">Description</p>
              <p className="text-sm font-crimson text-foreground">{race.description}</p>
            </div>
          )}

          {race.LA > 0 && (
            <div className="bg-red-900/20 border border-red-900/40 rounded p-3 text-sm font-crimson text-red-300">
              ⚠️ <strong>LA +{race.LA}:</strong> ECL = class levels + {race.LA}.
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border sticky bottom-0 bg-card">
          <Button onClick={() => onSelect(race)} className="w-full bg-primary text-primary-foreground font-cinzel">
            Select {race.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Reset confirmation ───────────────────────────────────────────────────────
function ResetConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-cinzel text-lg font-bold text-destructive">Reset Race Database?</h3>
        <p className="text-sm font-crimson text-muted-foreground">
          This will clear any saved race preferences. The static database is always available. Continue?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} className="font-cinzel">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="font-cinzel">Reset</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RaceBrowser({ character, updateCharacter, onClose }) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [laFilter, setLaFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showReset, setShowReset] = useState(false);

  const totalRaces = Object.keys(RACE_DATABASE).length;
  const totalSources = [...new Set(Object.values(RACE_DATABASE).map(r => r.source))].length;

  const races = useMemo(() => {
    let list = Object.values(RACE_DATABASE);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.source?.toLowerCase().includes(q));
    }
    if (sourceFilter !== 'all') list = list.filter(r => r.source === sourceFilter);
    if (sizeFilter !== 'all') list = list.filter(r => r.size === sizeFilter);
    if (typeFilter !== 'all') list = list.filter(r => r.raceType === typeFilter);
    if (laFilter === 'la0') list = list.filter(r => r.LA === 0);
    else if (laFilter === 'la1') list = list.filter(r => r.LA === 1);
    else if (laFilter === 'la2') list = list.filter(r => r.LA === 2);
    else if (laFilter === 'la3plus') list = list.filter(r => r.LA >= 3);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [search, sourceFilter, sizeFilter, laFilter, typeFilter]);

  const handleSelect = useCallback((race) => {
    // Set char.race as full race object (new engine format uses lowercase abilityMods)
    updateCharacter({ race, size: race.size || 'Medium' });
    setSelected(null);
    onClose?.();
  }, [updateCharacter, onClose]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-cinzel text-lg font-bold text-primary">Race Browser</h3>
          <p
            className="text-xs text-muted-foreground font-crimson cursor-default select-none"
            onClick={(e) => { if (e.shiftKey) setShowReset(true); }}
            title="Shift+click for debug options"
          >
            {totalRaces} races • {totalSources} sources
          </p>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="icon" className="text-muted-foreground">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search races…"
            className="pl-9 bg-secondary/50 border-border font-crimson" />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="bg-secondary/50 border-border font-crimson text-xs">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCE_GROUPS.map(group => group.sources.length > 0 && (
              <SelectGroup key={group.label}>
                <SelectLabel className="text-xs font-cinzel text-primary/70 py-1">{group.label}</SelectLabel>
                {group.sources.map(s => (
                  <SelectItem key={s} value={s} className="text-xs pl-4">{s}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="bg-secondary/50 border-border font-crimson text-xs"><SelectValue placeholder="All Sizes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {['Fine','Diminutive','Tiny','Small','Medium','Large','Huge','Gargantuan','Colossal'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={laFilter} onValueChange={setLaFilter}>
          <SelectTrigger className="bg-secondary/50 border-border font-crimson text-xs"><SelectValue placeholder="All LA" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LA</SelectItem>
            <SelectItem value="la0">LA 0 only</SelectItem>
            <SelectItem value="la1">LA +1</SelectItem>
            <SelectItem value="la2">LA +2</SelectItem>
            <SelectItem value="la3plus">LA +3 or higher</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground font-crimson">{races.length} races shown</p>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 h-7 bg-secondary/50 border-border font-crimson text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Normal">Normal (PC)</SelectItem>
            <SelectItem value="Extra">Extra (PC+)</SelectItem>
            <SelectItem value="MonstClass">Monster Class</SelectItem>
            <SelectItem value="NPC">NPC Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Race grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {races.map(race => {
          const isSelected = character.race === race.name;
          return (
            <button
              key={race.id}
              onClick={() => setSelected(race)}
              className={`text-left p-3 rounded-lg border transition-all hover:border-primary/50 hover:bg-secondary/70 ${
                isSelected ? 'bg-primary/10 border-primary' : 'bg-secondary/30 border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-cinzel text-sm font-bold text-foreground leading-tight">{race.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {race.LA > 0 && (
                    <span className="text-xs bg-red-900/50 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded font-crimson">LA+{race.LA}</span>
                  )}
                  {isSelected && <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-crimson">✓</span>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-crimson mb-1.5 truncate">{race.source}{race.size ? ` — ${race.size}` : ''}</p>
              <AbilityBadges abilityMods={race.abilityMods} />
            </button>
          );
        })}
        {races.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground font-crimson py-8">No races match your filters.</p>
        )}
      </div>

      {selected && (
        <RaceDetailPanel race={selected} onSelect={handleSelect} onClose={() => setSelected(null)} />
      )}

      {showReset && (
        <ResetConfirmDialog
          onConfirm={() => { localStorage.removeItem('dnd35_race_database'); localStorage.removeItem('dnd35_race_db_progress'); setShowReset(false); }}
          onCancel={() => setShowReset(false)}
        />
      )}
    </div>
  );
}