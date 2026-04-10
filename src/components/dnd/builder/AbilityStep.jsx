import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ABILITIES, ABILITY_NAMES, RACES, POINT_BUY_COSTS, calcMod, getAbilityScore, getTotalLevel } from '../../../lib/dndData';
import SectionCard from '../SectionCard';

export default function AbilityStep({ character, updateCharacter }) {
  const [showPointBuy, setShowPointBuy] = useState(false);
  const totalLevel = getTotalLevel(character);
  const levelUpLevels = [4, 8, 12, 16, 20].filter(l => l <= totalLevel);

  const setBase = (ability, value) => {
    const v = Math.max(1, Math.min(30, parseInt(value) || 0));
    updateCharacter({ baseAbilities: { ...character.baseAbilities, [ability]: v } });
  };

  const pointBuyTotal = Object.values(character.baseAbilities).reduce((sum, score) => {
    return sum + (POINT_BUY_COSTS[score] ?? 0);
  }, 0);

  const setLevelUpAbility = (level, ability) => {
    updateCharacter({ levelUpAbilities: { ...character.levelUpAbilities, [level]: ability } });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Ability Scores">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ABILITIES.map(ab => {
            const base = character.baseAbilities[ab] || 10;
            const raceMod = RACES[character.race]?.abilityMods[ab] || 0;
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

      <SectionCard title="Point Buy Helper (28 points)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-crimson text-sm text-muted-foreground">Points Spent:</span>
            <span className={`font-cinzel text-xl font-bold ${pointBuyTotal > 28 ? 'text-destructive' : pointBuyTotal === 28 ? 'text-green-400' : 'text-primary'}`}>
              {pointBuyTotal} / 28
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-crimson">
            Cost: 8→0, 9→1, 10→2, 11→3, 12→4, 13→5, 14→6, 15→8, 16→10, 17→13, 18→16
          </div>
        </div>
      </SectionCard>
    </div>
  );
}