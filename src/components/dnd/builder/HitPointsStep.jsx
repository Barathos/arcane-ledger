import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASSES, getAbilityMod, getMaxHP } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Heart } from 'lucide-react';

export default function HitPointsStep({ character, updateCharacter }) {
  const conMod = getAbilityMod(character, 'CON');
  const maxHP = getMaxHP(character);

  const setHPRoll = (level, value) => {
    updateCharacter({ hpRolls: { ...character.hpRolls, [level]: parseInt(value) || 0 } });
  };

  const setMaxRoll = (level, hd) => {
    updateCharacter({ hpRolls: { ...character.hpRolls, [level]: hd } });
  };

  let levelCounter = 0;
  const rows = [];
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (!classData) continue;
    for (let i = 1; i <= cls.level; i++) {
      levelCounter++;
      rows.push({
        level: levelCounter,
        className: cls.name,
        classLevel: i,
        hd: classData.hd,
        isFirst: levelCounter === 1
      });
    }
  }

  return (
    <SectionCard title={`Hit Points — Total: ${maxHP}`}>
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-red-400" />
        <span className="font-cinzel text-2xl font-bold text-red-400">{maxHP}</span>
        <span className="text-sm text-muted-foreground font-crimson">HP</span>
        <span className="text-xs text-muted-foreground ml-4 font-crimson">(CON mod: {conMod >= 0 ? '+' : ''}{conMod})</span>
      </div>
      <div className="space-y-2">
        {rows.map(row => {
          const rolled = row.isFirst ? row.hd : (character.hpRolls?.[row.level] ?? Math.ceil(row.hd / 2));
          const hpForLevel = row.isFirst ? row.hd + conMod : Math.max(1, rolled + conMod);
          return (
            <div key={row.level} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-2">
              <span className="text-xs text-muted-foreground w-16 font-crimson">
                Lvl {row.level}
              </span>
              <span className="text-xs text-primary font-crimson w-24">
                {row.className} {row.classLevel}
              </span>
              <span className="text-xs text-muted-foreground font-crimson">d{row.hd}</span>
              {row.isFirst ? (
                <span className="text-sm font-crimson text-green-400 font-semibold">
                  Max ({row.hd}) + CON ({conMod}) = {hpForLevel}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={row.hd}
                    value={rolled}
                    onChange={e => setHPRoll(row.level, e.target.value)}
                    className="w-16 h-8 bg-background border-border text-center font-crimson text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => setMaxRoll(row.level, row.hd)}
                    className="h-8 text-xs border-primary/30 text-primary">
                    Max
                  </Button>
                  <span className="text-xs text-muted-foreground font-crimson">
                    + CON ({conMod}) = <span className="text-foreground font-semibold">{hpForLevel}</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}