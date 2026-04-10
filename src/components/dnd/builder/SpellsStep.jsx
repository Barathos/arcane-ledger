import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASSES, getSpellsPerDay } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Plus, Trash2, Sparkles } from 'lucide-react';

export default function SpellsStep({ character, updateCharacter }) {
  const [newSpellClass, setNewSpellClass] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState(0);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellDesc, setNewSpellDesc] = useState('');

  const spellsPerDay = getSpellsPerDay(character);
  const casterClasses = character.classes.filter(c => CLASSES[c.name]?.caster);

  if (casterClasses.length === 0) {
    return (
      <SectionCard title="Spells">
        <p className="text-sm text-muted-foreground font-crimson text-center py-8">
          No spellcasting classes selected. Add a caster class to manage spells.
        </p>
      </SectionCard>
    );
  }

  const addSpell = () => {
    if (!newSpellName.trim() || !newSpellClass) return;
    const key = `${newSpellClass}_${newSpellLevel}`;
    const current = (character.spellsKnown || {})[key] || [];
    updateCharacter({
      spellsKnown: {
        ...(character.spellsKnown || {}),
        [key]: [...current, { name: newSpellName.trim(), description: newSpellDesc.trim() }]
      }
    });
    setNewSpellName('');
    setNewSpellDesc('');
  };

  const removeSpell = (key, idx) => {
    const current = [...((character.spellsKnown || {})[key] || [])];
    current.splice(idx, 1);
    updateCharacter({
      spellsKnown: { ...(character.spellsKnown || {}), [key]: current }
    });
  };

  return (
    <div className="space-y-4">
      {casterClasses.map(cls => {
        const classData = CLASSES[cls.name];
        const slots = spellsPerDay[cls.name] || {};
        const casterType = classData.casterType;

        return (
          <SectionCard key={cls.name} title={`${cls.name} Spells (${casterType === 'known' ? 'Spells Known' : 'Prepared'})`}>
            {/* Spell slots per day */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-crimson mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Spell Slots Per Day
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(slots).map(([level, count]) => (
                  <div key={level} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-center min-w-[60px]">
                    <div className="text-xs text-muted-foreground font-crimson">Lv {level}</div>
                    <div className="text-lg font-bold text-primary font-cinzel">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add spell */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <select
                value={newSpellClass === cls.name ? newSpellLevel : 0}
                onChange={e => { setNewSpellClass(cls.name); setNewSpellLevel(parseInt(e.target.value)); }}
                onClick={() => setNewSpellClass(cls.name)}
                className="bg-secondary/50 border border-border rounded px-2 py-1.5 text-sm font-crimson text-foreground w-24"
              >
                {Array.from({ length: 10 }, (_, i) => i).map(l => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
              <Input
                value={newSpellClass === cls.name ? newSpellName : ''}
                onChange={e => { setNewSpellClass(cls.name); setNewSpellName(e.target.value); }}
                onFocus={() => setNewSpellClass(cls.name)}
                placeholder="Spell name"
                className="bg-secondary/50 border-border font-crimson"
              />
              <Input
                value={newSpellClass === cls.name ? newSpellDesc : ''}
                onChange={e => { setNewSpellClass(cls.name); setNewSpellDesc(e.target.value); }}
                onFocus={() => setNewSpellClass(cls.name)}
                placeholder="Notes (optional)"
                className="bg-secondary/50 border-border font-crimson flex-1"
              />
              <Button onClick={addSpell} variant="outline" className="border-primary/30 text-primary shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Spell lists by level */}
            {Array.from({ length: 10 }, (_, i) => i).map(level => {
              const key = `${cls.name}_${level}`;
              const spells = (character.spellsKnown || {})[key] || [];
              if (spells.length === 0) return null;
              return (
                <div key={level} className="mb-2">
                  <p className="text-xs text-primary font-cinzel mb-1">Level {level} Spells</p>
                  <div className="space-y-1">
                    {spells.map((spell, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1">
                        <span className="text-sm font-crimson text-foreground flex-1">{spell.name}</span>
                        {spell.description && <span className="text-xs text-muted-foreground font-crimson">{spell.description}</span>}
                        <Button size="sm" variant="ghost" onClick={() => removeSpell(key, idx)} className="text-destructive h-6 w-6 p-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </SectionCard>
        );
      })}
    </div>
  );
}