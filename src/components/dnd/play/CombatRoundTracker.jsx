import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SectionCard from '../SectionCard';
import { Plus, Trash2, ChevronRight, RotateCcw } from 'lucide-react';

export default function CombatRoundTracker({ character, updateCharacter }) {
  const [newName, setNewName] = useState('');
  const [newInit, setNewInit] = useState('');
  const combatants = character.combatants || [];
  const currentTurn = character.currentTurn || 0;
  const roundNumber = character.roundNumber || 1;

  const addCombatant = () => {
    if (!newName.trim()) return;
    const initVal = parseInt(newInit) || 0;
    const newList = [...combatants, { name: newName.trim(), initiative: initVal, dead: false }]
      .sort((a, b) => b.initiative - a.initiative);
    updateCharacter({ combatants: newList });
    setNewName('');
    setNewInit('');
  };

  const removeCombatant = (idx) => {
    updateCharacter({ combatants: combatants.filter((_, i) => i !== idx) });
  };

  const toggleDead = (idx) => {
    const newList = [...combatants];
    newList[idx] = { ...newList[idx], dead: !newList[idx].dead };
    updateCharacter({ combatants: newList });
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    let next = currentTurn + 1;
    let newRound = roundNumber;
    if (next >= combatants.length) {
      next = 0;
      newRound++;
    }
    // Skip dead combatants
    let attempts = 0;
    while (combatants[next]?.dead && attempts < combatants.length) {
      next++;
      if (next >= combatants.length) {
        next = 0;
        newRound++;
      }
      attempts++;
    }
    updateCharacter({ currentTurn: next, roundNumber: newRound });
  };

  const resetCombat = () => {
    updateCharacter({ combatants: [], currentTurn: 0, roundNumber: 1 });
  };

  return (
    <SectionCard title={`Combat — Round ${roundNumber}`}>
      <div className="flex gap-2 mb-3">
        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name"
          className="bg-secondary/50 border-border font-crimson" />
        <Input type="number" value={newInit} onChange={e => setNewInit(e.target.value)} placeholder="Init"
          className="w-20 bg-secondary/50 border-border font-crimson" />
        <Button onClick={addCombatant} variant="outline" size="sm" className="border-primary/30 text-primary shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1 mb-3">
        {combatants.map((c, idx) => (
          <div key={idx} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-crimson transition-all ${
            idx === currentTurn && !c.dead
              ? 'bg-primary/20 border border-primary/40 shadow-sm'
              : c.dead
                ? 'bg-secondary/20 opacity-40 line-through'
                : 'bg-secondary/30 border border-transparent'
          }`}>
            {idx === currentTurn && !c.dead && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
            <span className="font-semibold flex-1 text-foreground">{c.name}</span>
            <span className="text-xs text-muted-foreground w-12 text-center">Init {c.initiative}</span>
            <Button size="sm" variant="ghost" onClick={() => toggleDead(idx)}
              className={`h-6 text-xs ${c.dead ? 'text-green-400' : 'text-orange-400'}`}>
              {c.dead ? '↩' : '💀'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => removeCombatant(idx)} className="text-destructive h-6 w-6 p-0">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        {combatants.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 font-crimson">No combatants — add some to begin!</p>
        )}
      </div>

      {combatants.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={nextTurn} className="flex-1 bg-primary text-primary-foreground font-cinzel">
            <ChevronRight className="w-4 h-4 mr-1" /> Next Turn
          </Button>
          <Button onClick={resetCombat} variant="outline" className="border-destructive/30 text-destructive">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}
    </SectionCard>
  );
}