import { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getRaceDatabase, loadAllRaces, clearRaceCache, getCacheTimestamp,
  formatAbilityMods, FALLBACK_RACES, ALL_SOURCES
} from '../../../lib/raceDataService';
import { RefreshCw, ExternalLink, X, Loader2, Search } from 'lucide-react';

function AbilityBadges({ abilityMods }) {
  if (!abilityMods) return null;
  const parts = [];
  const map = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
  Object.entries(abilityMods).forEach(([k, v]) => {
    if (v !== 0) parts.push({ key: k, label: map[k], val: v });
  });
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

function RaceDetailPanel({ race, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-primary">{race.name}</h2>
            <p className="text-xs text-muted-foreground font-crimson">{race.source}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-crimson">
            <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Size</div><div className="font-semibold text-foreground">{race.size}</div></div>
            <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Speed</div><div className="font-semibold text-foreground">{race.speed} ft</div></div>
            <div className={`rounded p-2 text-center ${race.LA > 0 ? 'bg-red-900/30' : 'bg-secondary/30'}`}><div className="text-xs text-muted-foreground">LA</div><div className={`font-semibold ${race.LA > 0 ? 'text-red-400' : 'text-foreground'}`}>+{race.LA}</div></div>
            <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Fav. Class</div><div className="font-semibold text-foreground text-xs">{race.favoredClass}</div></div>
          </div>

          {/* Ability mods */}
          <div>
            <p className="text-xs text-muted-foreground font-crimson mb-1">Ability Adjustments</p>
            <AbilityBadges abilityMods={race.abilityMods} />
          </div>

          {/* Special senses */}
          <div className="flex flex-wrap gap-2 text-xs">
            {race.darkvision > 0 && <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded font-crimson">Darkvision {race.darkvision} ft</span>}
            {race.lowLightVision && <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded font-crimson">Low-Light Vision</span>}
            {race.naturalArmor > 0 && <span className="bg-green-900/30 text-green-300 px-2 py-1 rounded font-crimson">+{race.naturalArmor} Natural Armor</span>}
            {race.SR && <span className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded font-crimson">SR: {race.SR}</span>}
            {race.swimSpeed && <span className="bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded font-crimson">Swim {race.swimSpeed} ft</span>}
            {race.flySpeed && <span className="bg-sky-900/30 text-sky-300 px-2 py-1 rounded font-crimson">Fly {race.flySpeed} ft</span>}
          </div>

          {/* Racial traits */}
          <div>
            <p className="text-xs text-muted-foreground font-crimson mb-2">Racial Traits</p>
            <ul className="space-y-1">
              {(race.traits || []).map((t, i) => (
                <li key={i} className="text-sm font-crimson text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1.5 shrink-0 w-1 h-1 rounded-full bg-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          {race.languages?.auto?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-crimson mb-1">Languages</p>
              <p className="text-sm font-crimson text-foreground">
                Auto: {race.languages.auto.join(', ')}
                {race.languages.bonus?.length > 0 && ` | Bonus: ${race.languages.bonus.join(', ')}`}
              </p>
            </div>
          )}

          {race.LA > 0 && (
            <div className="bg-red-900/20 border border-red-900/40 rounded p-3 text-sm font-crimson text-red-300">
              ⚠️ <strong>LA +{race.LA}:</strong> Effective Character Level = class levels + {race.LA}. This race is significantly more powerful and costs advancement levels.
            </div>
          )}
          {race.racialHD > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-900/40 rounded p-3 text-sm font-crimson text-yellow-300">
              ⚔️ <strong>Racial HD {race.racialHD}{race.racialHDType || ''}:</strong> This race has {race.racialHD} racial hit dice that count toward ECL.
            </div>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t border-border sticky bottom-0 bg-card">
          <Button onClick={() => onSelect(race)} className="flex-1 bg-primary text-primary-foreground font-cinzel">
            Select {race.name}
          </Button>
          <Button variant="outline" className="border-border text-muted-foreground" asChild>
            <a href={race.srdUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" /> SRD
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RaceBrowser({ character, updateCharacter, onClose }) {
  const [db, setDb] = useState(FALLBACK_RACES);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [laFilter, setLaFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [cacheTs, setCacheTs] = useState(getCacheTimestamp());

  useEffect(() => {
    const cached = getCacheTimestamp();
    if (cached) {
      const data = localStorage.getItem('dnd35_race_database');
      if (data) {
        try { setDb(JSON.parse(data)); } catch {}
      }
    } else {
      fetchAll();
    }
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setProgress({ done: 0, total: 21 });
    const result = await loadAllRaces((done, total) => setProgress({ done, total }));
    setDb(result);
    setCacheTs(getCacheTimestamp());
    setLoading(false);
  };

  const refresh = () => {
    clearRaceCache();
    setCacheTs(null);
    fetchAll();
  };

  const races = useMemo(() => {
    let list = Object.values(db);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.source?.toLowerCase().includes(q));
    }
    if (sourceFilter !== 'all') list = list.filter(r => r.source === sourceFilter);
    if (sizeFilter !== 'all') list = list.filter(r => r.size === sizeFilter);
    if (laFilter === 'la0') list = list.filter(r => r.LA === 0);
    else if (laFilter === 'la1') list = list.filter(r => r.LA === 1);
    else if (laFilter === 'la2') list = list.filter(r => r.LA === 2);
    else if (laFilter === 'la3plus') list = list.filter(r => r.LA >= 3);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [db, search, sourceFilter, sizeFilter, laFilter]);

  const sources = useMemo(() => {
    const s = new Set(Object.values(db).map(r => r.source));
    return Array.from(s).sort();
  }, [db]);

  const handleSelect = (race) => {
    const mods = race.abilityMods || {};
    // Convert to uppercase keys for existing character system
    const legacyMods = {};
    const keyMap = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
    Object.entries(mods).forEach(([k, v]) => { legacyMods[keyMap[k] || k] = v; });

    updateCharacter({
      race: race.name,
      size: race.size,
      srdRaceData: {
        name: race.name,
        source: race.source,
        speed: race.speed,
        swimSpeed: race.swimSpeed,
        flySpeed: race.flySpeed,
        abilityMods: legacyMods,
        LA: race.LA,
        racialHD: race.racialHD,
        racialHDType: race.racialHDType,
        naturalArmor: race.naturalArmor,
        SR: race.SR,
        darkvision: race.darkvision,
        lowLightVision: race.lowLightVision,
        traits: race.traits,
        favoredClass: race.favoredClass,
        languages: race.languages,
        srdUrl: race.srdUrl,
      }
    });
    setSelected(null);
    onClose?.();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-cinzel text-lg font-bold text-primary">Race Browser</h3>
          {cacheTs && <p className="text-xs text-muted-foreground font-crimson">Last updated: {cacheTs.toLocaleDateString()}</p>}
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-muted-foreground font-crimson flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading SRD… {progress.done}/{progress.total}
            </span>
          )}
          <Button onClick={refresh} variant="outline" size="sm" disabled={loading}
            className="border-primary/30 text-primary text-xs">
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh DB
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="icon" className="text-muted-foreground">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search races…"
            className="pl-9 bg-secondary/50 border-border font-crimson" />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="bg-secondary/50 border-border font-crimson"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="bg-secondary/50 border-border font-crimson"><SelectValue placeholder="Size" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {['Fine','Diminutive','Tiny','Small','Medium','Large','Huge','Gargantuan','Colossal'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={laFilter} onValueChange={setLaFilter}>
          <SelectTrigger className="bg-secondary/50 border-border font-crimson"><SelectValue placeholder="LA" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LA</SelectItem>
            <SelectItem value="la0">LA 0 only</SelectItem>
            <SelectItem value="la1">LA +1</SelectItem>
            <SelectItem value="la2">LA +2</SelectItem>
            <SelectItem value="la3plus">LA +3 or higher</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground font-crimson">{races.length} races found</p>

      {/* Race cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {races.map(race => {
          const isSelected = character.race === race.name;
          return (
            <button
              key={`${race.sourceKey}-${race.name}`}
              onClick={() => setSelected(race)}
              className={`text-left p-3 rounded-lg border transition-all hover:border-primary/50 hover:bg-secondary/70 ${
                isSelected ? 'bg-primary/10 border-primary shadow-sm shadow-primary/10' : 'bg-secondary/30 border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-cinzel text-sm font-bold text-foreground leading-tight">{race.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {race.LA > 0 && (
                    <span className="text-xs bg-red-900/50 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded font-crimson">
                      LA+{race.LA}
                    </span>
                  )}
                  {isSelected && <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-crimson">✓</span>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-crimson mb-1.5">{race.source} — {race.size}</p>
              <AbilityBadges abilityMods={race.abilityMods} />
              {race.favoredClass && race.favoredClass !== 'Any' && (
                <p className="text-xs text-muted-foreground font-crimson mt-1">FC: {race.favoredClass}</p>
              )}
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
    </div>
  );
}