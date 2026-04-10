import { Button } from "@/components/ui/button";
import { getSpellsPerDay } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { RotateCcw, Sparkles } from 'lucide-react';

export default function SpellSlotTracker({ character, updateCharacter }) {
  const spellsPerDay = getSpellsPerDay(character);
  const slotsUsed = character.spellSlotsUsed || {};

  const toggleSlot = (className, level, slotIdx) => {
    const key = `${className}_${level}`;
    const current = slotsUsed[key] || [];
    const newSlots = current.includes(slotIdx)
      ? current.filter(i => i !== slotIdx)
      : [...current, slotIdx];
    updateCharacter({ spellSlotsUsed: { ...slotsUsed, [key]: newSlots } });
  };

  const resetAll = () => {
    updateCharacter({ spellSlotsUsed: {} });
  };

  const hasSpells = Object.keys(spellsPerDay).length > 0;
  if (!hasSpells) return null;

  return (
    <SectionCard title="Spell Slots">
      {Object.entries(spellsPerDay).map(([className, slots]) => (
        <div key={className} className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-cinzel text-sm font-semibold text-primary">{className}</span>
          </div>
          <div className="space-y-2">
            {Object.entries(slots).map(([level, count]) => {
              if (count === 0) return null;
              const key = `${className}_${level}`;
              const used = slotsUsed[key] || [];
              return (
                <div key={level} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-crimson w-10 shrink-0">Lv {level}</span>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: count }, (_, i) => {
                      const isUsed = used.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleSlot(className, level, i)}
                          className={`w-7 h-7 rounded border text-xs font-cinzel font-bold transition-all ${
                            isUsed
                              ? 'bg-secondary/50 border-border text-muted-foreground/30 line-through'
                              : 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
                          }`}
                        >
                          {isUsed ? '✕' : '◆'}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs text-muted-foreground font-crimson">
                    {count - used.length}/{count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <Button onClick={resetAll} variant="outline" size="sm" className="border-primary/30 text-primary mt-2">
        <RotateCcw className="w-3 h-3 mr-1" /> Rest (Reset All)
      </Button>
    </SectionCard>
  );
}