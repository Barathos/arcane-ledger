import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAbilityMod, getBAB, getSaveBase } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Dices } from 'lucide-react';

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export default function DiceRoller({ character, updateCharacter }) {
  const [numDice, setNumDice] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const history = character.diceHistory || [];

  const dexMod = getAbilityMod(character, 'DEX');
  const misc = character.combatMisc || {};
  const bab = getBAB(character);
  const init = dexMod + (misc.miscInit || 0);
  const meleeAtk = bab + getAbilityMod(character, 'STR') + (misc.miscMeleeAttack || 0);
  const rangedAtk = bab + dexMod + (misc.miscRangedAttack || 0);
  const fort = getSaveBase(character, 'Fort') + getAbilityMod(character, 'CON') + (misc.miscFort || 0);
  const ref = getSaveBase(character, 'Ref') + dexMod + (misc.miscRef || 0);
  const will = getSaveBase(character, 'Will') + getAbilityMod(character, 'WIS') + (misc.miscWill || 0);

  const doRoll = (sides, count = numDice, mod = modifier, label = '') => {
    const rolls = Array.from({ length: count }, () => rollDie(sides));
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + mod;
    const result = {
      label: label || `${count}d${sides}${mod >= 0 ? `+${mod}` : mod}`,
      rolls,
      modifier: mod,
      total,
      timestamp: Date.now()
    };
    setLastResult(result);
    const newHistory = [result, ...history].slice(0, 10);
    updateCharacter({ diceHistory: newHistory });
  };

  const quickRoll = (label, mod) => {
    const roll = rollDie(20);
    const total = roll + mod;
    const result = { label, rolls: [roll], modifier: mod, total, timestamp: Date.now() };
    setLastResult(result);
    const newHistory = [result, ...(character.diceHistory || [])].slice(0, 10);
    updateCharacter({ diceHistory: newHistory });
  };

  const dice = [4, 6, 8, 10, 12, 20, 100];

  return (
    <SectionCard title="Dice Roller">
      {/* Last result */}
      {lastResult && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 text-center">
          <div className="text-xs text-muted-foreground font-crimson">{lastResult.label}</div>
          <div className="text-3xl font-cinzel font-bold text-primary">{lastResult.total}</div>
          <div className="text-xs text-muted-foreground font-crimson">
            [{lastResult.rolls.join(', ')}]{lastResult.modifier !== 0 ? ` ${lastResult.modifier >= 0 ? '+' : ''}${lastResult.modifier}` : ''}
          </div>
        </div>
      )}

      {/* Dice controls */}
      <div className="flex items-center gap-2 mb-3">
        <Input type="number" min={1} max={20} value={numDice} onChange={e => setNumDice(parseInt(e.target.value) || 1)}
          className="w-16 h-8 bg-secondary/50 border-border text-center font-crimson text-sm" />
        <span className="text-xs text-muted-foreground">dice</span>
        <span className="text-xs text-muted-foreground">+</span>
        <Input type="number" value={modifier} onChange={e => setModifier(parseInt(e.target.value) || 0)}
          className="w-16 h-8 bg-secondary/50 border-border text-center font-crimson text-sm" />
        <span className="text-xs text-muted-foreground">mod</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {dice.map(d => (
          <Button key={d} onClick={() => doRoll(d)} variant="outline" size="sm"
            className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-cinzel text-xs h-9 min-w-[48px]">
            d{d}
          </Button>
        ))}
      </div>

      {/* Quick rolls */}
      <div className="border-t border-border pt-3 mb-3">
        <p className="text-xs text-muted-foreground font-crimson mb-2">Quick Rolls</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => quickRoll(`Melee Attack (d20+${meleeAtk})`, meleeAtk)} size="sm" variant="outline"
            className="border-red-800/50 text-red-400 text-xs h-8">
            ⚔ Melee ({meleeAtk >= 0 ? '+' : ''}{meleeAtk})
          </Button>
          <Button onClick={() => quickRoll(`Ranged Attack (d20+${rangedAtk})`, rangedAtk)} size="sm" variant="outline"
            className="border-red-800/50 text-red-400 text-xs h-8">
            🏹 Ranged ({rangedAtk >= 0 ? '+' : ''}{rangedAtk})
          </Button>
          <Button onClick={() => quickRoll(`Initiative (d20+${init})`, init)} size="sm" variant="outline"
            className="border-blue-800/50 text-blue-400 text-xs h-8">
            ⚡ Initiative ({init >= 0 ? '+' : ''}{init})
          </Button>
          <Button onClick={() => quickRoll(`Fort Save (d20+${fort})`, fort)} size="sm" variant="outline"
            className="border-green-800/50 text-green-400 text-xs h-8">
            Fort ({fort >= 0 ? '+' : ''}{fort})
          </Button>
          <Button onClick={() => quickRoll(`Ref Save (d20+${ref})`, ref)} size="sm" variant="outline"
            className="border-blue-800/50 text-blue-400 text-xs h-8">
            Ref ({ref >= 0 ? '+' : ''}{ref})
          </Button>
          <Button onClick={() => quickRoll(`Will Save (d20+${will})`, will)} size="sm" variant="outline"
            className="border-purple-800/50 text-purple-400 text-xs h-8">
            Will ({will >= 0 ? '+' : ''}{will})
          </Button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground font-crimson mb-2">History</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-crimson text-muted-foreground bg-secondary/20 rounded px-2 py-1">
                <span>{h.label}</span>
                <span className="font-semibold text-foreground">{h.total} <span className="text-muted-foreground">[{h.rolls.join(',')}]{h.modifier ? (h.modifier >= 0 ? '+' : '') + h.modifier : ''}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}