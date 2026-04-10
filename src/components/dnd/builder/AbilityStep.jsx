import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ABILITIES, ABILITY_NAMES, RACES, POINT_BUY_COSTS, calcMod, getAbilityScore, getTotalLevel } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Dices, RefreshCw } from 'lucide-react';

const METHODS = [
  { value: 'pointbuy28', label: 'Point Buy — 28 pts' },
  { value: 'pointbuy32', label: 'Point Buy — 32 pts' },
  { value: 'pointbuycustom', label: 'Point Buy — Custom' },
  { value: 'manual', label: 'Manual (No Validation)' },
  { value: '4d6', label: '4d6 Drop Lowest' },
];

function roll4d6DropLowest() {
  const rolls = [
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
  ];
  const min = Math.min(...rolls);
  const droppedIdx = rolls.indexOf(min);
  const kept = rolls.filter((_, i) => i !== droppedIdx);
  return { total: kept.reduce((a, b) => a + b, 0), rolls, droppedIdx };
}

export default function AbilityStep({ character, updateCharacter }) {
  const [method, setMethod] = useState('pointbuy28');
  const [customPoints, setCustomPoints] = useState(36);
  const [rollResults, setRollResults] = useState(null);
  const [assignments, setAssignments] = useState({});

  const totalLevel = getTotalLevel(character);
  const levelUpLevels = [4, 8, 12, 16, 20].filter(l => l <= totalLevel);

  const pointBudget = method === 'pointbuy28' ? 28 : method === 'pointbuy32' ? 32 : customPoints;
  const pointBuyTotal = ABILITIES.reduce((sum, ab) => {
    const score = character.baseAbilities?.[ab] ?? 10;
    return sum + (POINT_BUY_COSTS[score] ?? 0);
  }, 0);

  const setBase = (ability, value) => {
    const v = Math.max(1, Math.min(30, parseInt(value) || 0));
    updateCharacter({ baseAbilities: { ...character.baseAbilities, [ability]: v } });
  };

  const setLevelUpAbility = (level, ability) => {
    updateCharacter({ levelUpAbilities: { ...character.levelUpAbilities, [level]: ability } });
  };

  const handleRoll = () => {
    setRollResults(Array.from({ length: 6 }, () => roll4d6DropLowest()));
    setAssignments({});
  };

  const handleAssign = (ability, rollIndexStr) => {
    const rollIndex = parseInt(rollIndexStr);
    const cleaned = Object.fromEntries(
      Object.entries(assignments).filter(([ab, ri]) => ab !== ability && ri !== rollIndex)
    );
    setAssignments({ ...cleaned, [ability]: rollIndex });
  };

  const applyRollAssignments = () => {
    const newBase = { ...character.baseAbilities };
    ABILITIES.forEach(ab => {
      if (assignments[ab] !== undefined && rollResults?.[assignments[ab]]) {
        newBase[ab] = rollResults[assignments[ab]].total;
      }
    });
    updateCharacter({ baseAbilities: newBase });
  };

  const allAssigned = rollResults && ABILITIES.every(ab => assignments[ab] !== undefined);
  const usedIndices = new Set(Object.values(assignments));
  const isPointBuy = method.startsWith('pointbuy');

  return (
    <div className="space-y-4">
      <SectionCard title="Stat Generation Method">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="bg-secondary/50 border-border font-crimson w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METHODS.map(m => (
                <SelectItem key={m.value} value={m.value} className="font-crimson">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {method === 'pointbuycustom' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-crimson">Points:</span>
              <Input
                type="number"
                value={customPoints}
                onChange={e => setCustomPoints(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 h-9 bg-secondary/50 border-border text-center font-crimson"
              />
            </div>
          )}

          {isPointBuy && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-crimson text-muted-foreground">Points spent:</span>
              <span className={`font-cinzel text-xl font-bold ${
                pointBuyTotal > pointBudget ? 'text-destructive' :
                pointBuyTotal === pointBudget ? 'text-green-400' : 'text-primary'
              }`}>
                {pointBuyTotal} / {pointBudget}
              </span>
              {pointBuyTotal > pointBudget && (
                <span className="text-xs text-destructive font-crimson">Over budget!</span>
              )}
            </div>
          )}
        </div>
        {isPointBuy && (
          <p className="text-xs text-muted-foreground font-crimson mt-2">
            Cost: 8→0, 9→1, 10→2, 11→3, 12→4, 13→5, 14→6, 15→8, 16→10, 17→13, 18→16
          </p>
        )}
      </SectionCard>

      {method === '4d6' && (
        <SectionCard title="4d6 Drop Lowest Roller">
          <div className="space-y-3">
            <Button onClick={handleRoll} className="font-cinzel gap-2">
              <Dices className="w-4 h-4" />
              {rollResults ? 'Re-Roll All' : 'Roll Stats'}
            </Button>

            {rollResults && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {rollResults.map((r, i) => {
                    const isUsed = usedIndices.has(i);
                    return (
                      <div key={i} className={`rounded-lg border p-2 text-center transition-all ${
                        isUsed ? 'border-primary/60 bg-primary/10' : 'border-border bg-secondary/20'
                      }`}>
                        <div className="font-cinzel text-2xl font-bold text-primary">{r.total}</div>
                        <div className="text-xs text-muted-foreground font-crimson mt-0.5">
                          [{r.rolls.map((d, di) => (
                            <span key={di} className={di === r.droppedIdx ? 'line-through text-red-400/60' : ''}>
                              {di > 0 ? ',' : ''}{d}
                            </span>
                          ))}]
                        </div>
                        {isUsed && (
                          <div className="text-xs text-primary font-cinzel mt-0.5">
                            {ABILITIES.find(ab => assignments[ab] === i)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ABILITIES.map(ab => (
                    <div key={ab} className="flex items-center gap-2 bg-secondary/20 rounded-lg p-2">
                      <span className="font-cinzel text-sm font-bold text-primary w-10 shrink-0">{ab}</span>
                      <Select
                        value={assignments[ab] !== undefined ? String(assignments[ab]) : ''}
                        onValueChange={v => handleAssign(ab, v)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson flex-1">
                          <SelectValue placeholder="Assign…" />
                        </SelectTrigger>
                        <SelectContent>
                          {rollResults.map((r, i) => (
                            <SelectItem
                              key={i}
                              value={String(i)}
                              disabled={usedIndices.has(i) && assignments[ab] !== i}
                              className="font-crimson text-xs"
                            >
                              {r.total} [{r.rolls.join(',')}]
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={applyRollAssignments}
                  disabled={!allAssigned}
                  className="font-cinzel gap-2 w-full"
                  variant={allAssigned ? 'default' : 'outline'}
                >
                  <RefreshCw className="w-4 h-4" />
                  Apply to Character
                </Button>
                {!allAssigned && (
                  <p className="text-xs text-muted-foreground font-crimson text-center">
                    Assign all 6 rolls to stats before applying.
                  </p>
                )}
              </>
            )}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Ability Scores">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ABILITIES.map(ab => {
            const base = character.baseAbilities?.[ab] ?? 10;
            const raceMod = RACES[character.race]?.abilityMods?.[ab] || 0;
            const levelUps = Object.values(character.levelUpAbilities || {}).filter(a => a === ab).length;
            const total = getAbilityScore(character, ab);
            const mod = calcMod(total);

            return (
              <div key={ab} className="bg-secondary/30 border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cinzel text-sm font-bold text-primary">{ab}</span>
                  <span className="text-xs text-muted-foreground font-crimson">{ABILITY_NAMES[ab]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Base</label>
                    <Input
                      type="number"
                      value={base}
                      onChange={e => setBase(ab, e.target.value)}
                      className="bg-background border-border text-center font-crimson h-9"
                    />
                  </div>
                  {raceMod !== 0 && (
                    <div className="text-center">
                      <label className="text-xs text-muted-foreground">Race</label>
                      <div className={`h-9 flex items-center justify-center text-sm font-semibold font-crimson ${raceMod > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {raceMod > 0 ? '+' : ''}{raceMod}
                      </div>
                    </div>
                  )}
                  {levelUps > 0 && (
                    <div className="text-center">
                      <label className="text-xs text-muted-foreground">Lvl</label>
                      <div className="h-9 flex items-center justify-center text-sm font-semibold text-blue-400 font-crimson">
                        +{levelUps}
                      </div>
                    </div>
                  )}
                  <div className="text-center min-w-[40px]">
                    <label className="text-xs text-muted-foreground">Total</label>
                    <div className="h-9 flex items-center justify-center text-lg font-bold text-primary font-cinzel">
                      {total}
                    </div>
                  </div>
                  <div className="text-center min-w-[40px]">
                    <label className="text-xs text-muted-foreground">Mod</label>
                    <div className={`h-9 flex items-center justify-center text-lg font-bold font-cinzel ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {mod >= 0 ? '+' : ''}{mod}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {levelUpLevels.length > 0 && (
        <SectionCard title="Level-Up Ability Increases (+1 every 4 levels)">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {levelUpLevels.map(lvl => (
              <div key={lvl} className="bg-secondary/30 rounded-lg p-2">
                <label className="text-xs text-muted-foreground font-crimson">Level {lvl}</label>
                <Select
                  value={character.levelUpAbilities?.[lvl] || ''}
                  onValueChange={v => setLevelUpAbility(lvl, v)}
                >
                  <SelectTrigger className="bg-background border-border font-crimson h-8 text-sm">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {ABILITIES.map(ab => (
                      <SelectItem key={ab} value={ab} className="font-crimson">{ab} ({ABILITY_NAMES[ab]})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}