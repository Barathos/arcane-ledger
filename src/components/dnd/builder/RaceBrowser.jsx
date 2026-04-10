import { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getRaceDatabase, hardResetRaceDatabase, loadAllRacesWithResume,
  buildCatalogStubs, isFullyLoaded, getLoadProgress,
  SOURCE_GROUPS, TOTAL_SOURCES,
} from '../../../lib/raceDataService';
import { ExternalLink, X, Loader2, Search, AlertCircle, Settings } from 'lucide-react';

// ─── Ability badges ───────────────────────────────────────────────────────────
function AbilityBadges({ abilityMods }) {
  if (!abilityMods) return <span className="text-xs text-muted-foreground/50 font-crimson italic">Stats loading…</span>;
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

// ─── Detail panel ─────────────────────────────────────────────────────────────
function RaceDetailPanel({ race, onSelect, onClose }) {
  const hasStats = race.statsLoaded !== false && race.size !== null;
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
          {!hasStats ? (
            <div className="bg-secondary/30 border border-border rounded-lg p-4 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-crimson text-muted-foreground">Stats unavailable — SRD page could not be parsed.</p>
              {race.srdUrl && (
                <a href={race.srdUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-crimson">
                  <ExternalLink className="w-4 h-4" /> View full entry on SRD
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-crimson">
                <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Size</div><div className="font-semibold">{race.size}</div></div>
                <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Speed</div><div className="font-semibold">{race.speed} ft</div></div>
                <div className={`rounded p-2 text-center ${race.LA > 0 ? 'bg-red-900/30' : 'bg-secondary/30'}`}>
                  <div className="text-xs text-muted-foreground">LA</div>
                  <div className={`font-semibold ${race.LA > 0 ? 'text-red-400' : ''}`}>+{race.LA}</div>
                </div>
                <div className="bg-secondary/30 rounded p-2 text-center"><div className="text-xs text-muted-foreground">Fav. Class</div><div className="font-semibold text-xs">{race.favoredClass}</div></div>
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
                {race.swimSpeed && <span className="bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded font-crimson">Swim {race.swimSpeed} ft</span>}
                {race.flySpeed && <span className="bg-sky-900/30 text-sky-300 px-2 py-1 rounded font-crimson">Fly {race.flySpeed} ft</span>}
              </div>
              {race.traits && (
                <div>
                  <p className="text-xs text-muted-foreground font-crimson mb-2">Racial Traits</p>
                  <ul className="space-y-1">
                    {race.traits.map((t, i) => (
                      <li key={i} className="text-sm font-crimson text-foreground flex items-start gap-2">
                        <span className="text-primary mt-1.5 shrink-0 w-1 h-1 rounded-full bg-primary" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                  ⚠️ <strong>LA +{race.LA}:</strong> ECL = class levels + {race.LA}.
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t border-border sticky bottom-0 bg-card">
          <Button onClick={() => onSelect(race)} className="flex-1 bg-primary text-primary-foreground font-cinzel" disabled={!hasStats}>
            {hasStats ? `Select ${race.name}` : 'Stats Unavailable'}
          </Button>
          {race.srdUrl && (
            <Button variant="outline" className="border-border text-muted-foreground" asChild>
              <a href={race.srdUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" /> SRD
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reset confirmation dialog ────────────────────────────────────────────────
function ResetConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-cinzel text-lg font-bold text-destructive">Reset Race Database?</h3>
        <p className="text-sm font-crimson text-muted-foreground">
          This will delete all cached race data and re-fetch everything from the SRD.
          This should only be needed if data appears corrupted. Continue?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} className="font-cinzel">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="font-cinzel">Reset & Re-fetch</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RaceBrowser({ character, updateCharacter, onClose }) {
  const [db, setDb] = useState(() => buildCatalogStubs());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(() => getLoadProgress());
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [laFilter, setLaFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [raceCountClicks, setRaceCountClicks] = useState(0);

  // On mount: load from cache or start fetch
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const cached = await getRaceDatabase();
      if (!cancelled) {
        setDb(cached);
        setProgress(getLoadProgress());

        // If load was interrupted, resume silently in background
        if (!isFullyLoaded()) {
          setLoading(true);
          await loadAllRacesWithResume((done, total, partial) => {
            if (!cancelled) {
              setProgress({ done, total });
              setDb({ ...partial });
            }
          });
          if (!cancelled) setLoading(false);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // Handle shift-click on race count to reveal debug reset
  const handleRaceCountClick = (e) => {
    if (e.shiftKey) setShowReset(true);
  };

  const handleConfirmReset = useCallback(async () => {
    setShowReset(false);
    hardResetRaceDatabase();
    const stubs = buildCatalogStubs();
    setDb(stubs);
    setProgress({ done: 0, total: TOTAL_SOURCES });
    setLoading(true);
    await loadAllRacesWithResume((done, total, partial) => {
      setProgress({ done, total });
      setDb({ ...partial });
    });
    setLoading(false);
  }, []);

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

  const handleSelect = useCallback((race) => {
    const mods = race.abilityMods || {};
    const keyMap = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
    const legacyMods = {};
    Object.entries(mods).forEach(([k, v]) => { legacyMods[keyMap[k] || k] = v; });

    updateCharacter({
      race: race.name,
      size: race.size || 'Medium',
      srdRaceData: {
        name: race.name, source: race.source,
        speed: race.speed || 30,
        swimSpeed: race.swimSpeed, flySpeed: race.flySpeed,
        abilityMods: legacyMods,
        LA: race.LA || 0, racialHD: race.racialHD, racialHDType: race.racialHDType,
        naturalArmor: race.naturalArmor, SR: race.SR,
        darkvision: race.darkvision, lowLightVision: race.lowLightVision,
        traits: race.traits || [], favoredClass: race.favoredClass || 'Any',
        languages: race.languages, srdUrl: race.srdUrl,
      }
    });
    setSelected(null);
    onClose?.();
  }, [updateCharacter, onClose]);

  const totalRaces = Object.keys(RACE_SOURCE_CATALOG_COUNT).length; // approx

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-cinzel text-lg font-bold text-primary">Race Browser</h3>
          {/* Shift-click to reveal debug reset */}
          <p
            className="text-xs text-muted-foreground font-crimson cursor-default select-none"
            onClick={handleRaceCountClick}
            title="Shift+click for debug options"
          >
            429 races • 26 sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-muted-foreground font-crimson flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              ⏳ Resuming load… {progress.done}/{progress.total} sources complete
            </span>
          )}
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
          <SelectTrigger className="bg-secondary/50 border-border font-crimson text-xs">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCE_GROUPS.map(group => (
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

      <p className="text-xs text-muted-foreground font-crimson">{races.length} races shown</p>

      {/* Race cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {races.map(race => {
          const isSelected = character.race === race.name;
          const hasStats = race.statsLoaded !== false && race.size !== null;
          return (
            <button
              key={`${race.source}-${race.name}`}
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
              {hasStats ? (
                <AbilityBadges abilityMods={race.abilityMods} />
              ) : (
                <span className="text-xs text-muted-foreground/40 font-crimson italic">Stats unavailable</span>
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

      {showReset && (
        <ResetConfirmDialog onConfirm={handleConfirmReset} onCancel={() => setShowReset(false)} />
      )}
    </div>
  );
}

// Approximate count used for display label only
const RACE_SOURCE_CATALOG_COUNT = { _: new Array(429) };