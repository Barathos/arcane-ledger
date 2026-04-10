import { useState, useEffect, useMemo } from 'react';
import { loadSpellIndex, loadSpellDescriptions, getSpellDescription, getSpellIndex } from '../../../lib/spellDatabase';
import { getDerivedStats } from '../../../lib/characterEngine';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, BookOpen, Sparkles } from 'lucide-react';

const SCHOOL_COLORS = {
  Abjuration: 'text-blue-300', Conjuration: 'text-green-300', Divination: 'text-yellow-300',
  Enchantment: 'text-pink-300', Evocation: 'text-orange-300', Illusion: 'text-purple-300',
  Necromancy: 'text-red-300', Transmutation: 'text-teal-300', Universal: 'text-gray-300',
};

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

function SpellDetail({ spell, iKnown, onLearn, onForget, onClose }) {
  const [desc, setDesc] = useState(() => getSpellDescription(spell.id));

  useEffect(() => {
    if (!desc) {
      loadSpellDescriptions().then(() => setDesc(getSpellDescription(spell.id)));
    }
  }, [spell.id]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-cinzel text-lg font-bold text-primary">{spell.name}</h3>
          <p className={`text-xs font-crimson ${SCHOOL_COLORS[spell.school] || 'text-muted-foreground'}`}>
            {spell.school}{spell.subschool ? ` (${spell.subschool})` : ''}
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1 text-xs font-crimson">
        {spell.castingTime && <div><span className="text-muted-foreground">Casting: </span>{spell.castingTime}</div>}
        {spell.range && <div><span className="text-muted-foreground">Range: </span>{spell.range}</div>}
        {(spell.target || spell.area) && <div><span className="text-muted-foreground">{spell.area ? 'Area' : 'Target'}: </span>{spell.area || spell.target}</div>}
        {spell.duration && <div><span className="text-muted-foreground">Duration: </span>{spell.duration}</div>}
        {spell.savingThrow && <div><span className="text-muted-foreground">Save: </span>{spell.savingThrow}</div>}
        {spell.spellResistance && <div><span className="text-muted-foreground">SR: </span>{spell.spellResistance}</div>}
        {spell.components?.length > 0 && <div><span className="text-muted-foreground">Components: </span>{spell.components.join(', ')}</div>}
        <div><span className="text-muted-foreground">Source: </span>{spell.source}</div>
      </div>

      {/* Class levels */}
      <div className="flex flex-wrap gap-1">
        {Object.entries(spell.classes).map(([cls, lv]) => (
          <span key={cls} className="text-xs bg-secondary/50 rounded px-1.5 py-0.5 font-crimson">
            {cls} {lv}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="border-t border-border pt-3">
        {desc ? renderMarkdown(desc) : <p className="text-xs text-muted-foreground font-crimson italic">Loading…</p>}
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border flex gap-2">
        {iKnown ? (
          <Button onClick={onForget} variant="outline" className="flex-1 font-cinzel border-red-900/50 text-red-400 hover:bg-red-900/20 text-xs">
            Remove from Spellbook
          </Button>
        ) : (
          <Button onClick={onLearn} className="flex-1 font-cinzel text-xs">
            <BookOpen className="w-3 h-3 mr-1" /> Add to Spellbook
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SpellsStep({ character, updateCharacter }) {
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [showKnownOnly, setShowKnownOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  const stats = getDerivedStats(character);

  // Get caster classes from character
  const casterClasses = useMemo(() => {
    const classSpellMap = {
      Wizard: 'Wizard', Sorcerer: 'Sorcerer', Cleric: 'Cleric', Druid: 'Druid',
      Bard: 'Bard', Paladin: 'Paladin', Ranger: 'Ranger',
      Archivist: 'Cleric', 'Favored Soul': 'Cleric', 'Dread Necromancer': 'Sorcerer',
      Warmage: 'Sorcerer', 'Wu Jen': 'Wizard', Beguiler: 'Bard',
      Hexblade: 'Sorcerer', Duskblade: 'Sorcerer',
    };
    const result = [];
    (character.classes || []).forEach(cls => {
      if (cls.spellcasting && cls.spellcasting !== null) {
        const spellListName = classSpellMap[cls.name] || cls.name;
        result.push({ className: cls.name, spellListName, levels: cls.levels || 0 });
      }
    });
    return result;
  }, [character.classes]);

  useEffect(() => {
    loadSpellIndex().then(data => {
      setSpells(data);
      setLoading(false);
      if (casterClasses.length > 0) setSelectedClass(casterClasses[0].spellListName);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (casterClasses.length > 0 && !selectedClass) {
      setSelectedClass(casterClasses[0].spellListName);
    }
  }, [casterClasses, selectedClass]);

  // Known/prepared spells stored as character.spells[className] = [{id, name, level}]
  const knownSpells = useMemo(() => {
    const map = {};
    Object.entries(character.spells || {}).forEach(([cls, list]) => {
      (list || []).forEach(s => { map[`${cls}:${s.id}`] = true; });
    });
    return map;
  }, [character.spells]);

  const isKnown = (spell, cls) => knownSpells[`${cls}:${spell.id}`] || false;

  const learnSpell = (spell, cls) => {
    const level = spell.classes[cls] ?? spell.classes[selectedClass] ?? 0;
    const existing = character.spells?.[cls] || [];
    if (existing.some(s => s.id === spell.id)) return;
    updateCharacter(prev => ({
      ...prev,
      spells: {
        ...(prev.spells || {}),
        [cls]: [...existing, { id: spell.id, name: spell.name, level }],
      }
    }));
  };

  const forgetSpell = (spell, cls) => {
    updateCharacter(prev => ({
      ...prev,
      spells: {
        ...(prev.spells || {}),
        [cls]: (prev.spells?.[cls] || []).filter(s => s.id !== spell.id),
      }
    }));
  };

  const schools = useMemo(() => {
    const s = new Set(spells.map(sp => sp.school).filter(Boolean));
    return [...s].sort();
  }, [spells]);

  const filtered = useMemo(() => {
    if (!spells.length || !selectedClass) return [];
    let list = spells.filter(s => selectedClass in s.classes);
    if (levelFilter !== 'all') list = list.filter(s => s.classes[selectedClass] === parseInt(levelFilter));
    if (schoolFilter !== 'all') list = list.filter(s => s.school === schoolFilter);
    if (showKnownOnly) list = list.filter(s => isKnown(s, selectedClass));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || (s.school || '').toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      const la = a.classes[selectedClass] ?? 99;
      const lb = b.classes[selectedClass] ?? 99;
      if (la !== lb) return la - lb;
      return a.name.localeCompare(b.name);
    });
  }, [spells, selectedClass, levelFilter, schoolFilter, showKnownOnly, search, knownSpells]);

  if (casterClasses.length === 0) {
    return (
      <SectionCard title="Spells">
        <div className="text-center py-12 text-muted-foreground font-crimson">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p>No spellcasting classes selected.</p>
          <p className="text-xs mt-1">Add a class with spellcasting (Wizard, Cleric, Sorcerer, etc.)</p>
        </div>
      </SectionCard>
    );
  }

  // Spellbook summary for known spells
  const knownByLevel = {};
  (character.spells?.[selectedClass] || []).forEach(s => {
    if (!knownByLevel[s.level]) knownByLevel[s.level] = [];
    knownByLevel[s.level].push(s);
  });

  return (
    <div className="space-y-4">
      {/* Spellbook summary */}
      {Object.keys(knownByLevel).length > 0 && (
        <SectionCard title="Spellbook">
          {Object.entries(knownByLevel).sort(([a],[b]) => +a - +b).map(([lv, spellList]) => (
            <div key={lv} className="mb-2">
              <p className="text-xs font-cinzel text-primary mb-1">Level {lv}</p>
              <div className="flex flex-wrap gap-1">
                {spellList.map(s => (
                  <span key={s.id} className="text-xs bg-secondary/40 rounded px-2 py-0.5 font-crimson text-foreground/80">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </SectionCard>
      )}

      {/* Spell browser */}
      <SectionCard title="Spell Browser">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          {casterClasses.length > 1 && (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {casterClasses.map(c => (
                  <SelectItem key={c.spellListName} value={c.spellListName} className="text-xs">{c.className}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson w-28"><SelectValue placeholder="All Levels" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {[0,1,2,3,4,5,6,7,8,9].map(l => <SelectItem key={l} value={String(l)} className="text-xs">Level {l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={schoolFilter} onValueChange={setSchoolFilter}>
            <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson w-36"><SelectValue placeholder="All Schools" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search spells…"
            className="h-8 text-xs bg-secondary/50 font-crimson w-40"
          />
          <label className="flex items-center gap-1 text-xs font-crimson cursor-pointer">
            <input type="checkbox" checked={showKnownOnly} onChange={e => setShowKnownOnly(e.target.checked)} />
            Known only
          </label>
        </div>

        {/* List + Detail panel */}
        <div className="flex gap-3" style={{ minHeight: 400 }}>
          <div className="flex-1 border border-border rounded-lg overflow-y-auto" style={{ maxHeight: 500 }}>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground font-crimson text-sm">Loading spells…</div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground px-3 py-1.5 border-b border-border bg-secondary/20 font-crimson">
                  {filtered.length} spells
                  {selectedClass && ` • ${selectedClass} list`}
                </div>
                <div className="divide-y divide-border/50">
                  {filtered.map(spell => {
                    const known = isKnown(spell, selectedClass);
                    const spellLevel = spell.classes[selectedClass];
                    return (
                      <button
                        key={spell.id}
                        onClick={() => setSelected(spell)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-secondary/50 transition-colors flex items-center gap-2 ${selected?.id === spell.id ? 'bg-primary/10' : ''}`}
                      >
                        <span className="w-5 text-center text-xs font-cinzel text-muted-foreground shrink-0">{spellLevel}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-crimson text-sm text-foreground">{spell.name}</span>
                            {known && <span className="text-xs text-primary font-cinzel">✓</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-crimson ${SCHOOL_COLORS[spell.school] || 'text-muted-foreground'}`}>{spell.school}</span>
                            {spell.components?.length > 0 && (
                              <span className="text-xs text-muted-foreground font-crimson">{spell.components.join('')}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground font-crimson text-sm py-8">No spells match your filters.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {selected && (
            <div className="w-80 shrink-0 border border-border rounded-lg bg-secondary/10 overflow-hidden">
              <SpellDetail
                spell={selected}
                iKnown={isKnown(selected, selectedClass)}
                onLearn={() => learnSpell(selected, selectedClass)}
                onForget={() => forgetSpell(selected, selectedClass)}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}