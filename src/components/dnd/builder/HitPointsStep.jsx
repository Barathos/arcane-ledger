import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateMaxHP, getAbilityMods, getAbilityScores } from '../../../lib/characterEngine';
import SectionCard from '../SectionCard';
import { Heart } from 'lucide-react';

export default function HitPointsStep({ character, updateCharacter }) {
  const mods   = getAbilityMods(character);
  const scores = getAbilityScores(character);
  const conMod = mods.con;
  const maxHP  = calculateMaxHP(character);

  // Build one row per character level from all classes
  const levelRows = [];
  let charLevel = 0;
  for (const cls of (character.classes || [])) {
    for (let i = 1; i <= (cls.levels || 0); i++) {
      charLevel++;
      levelRows.push({
        charLevel,
        className: cls.name,
        classLevel: i,
        hd: cls.hd || 8,
        isFirst: charLevel === 1,
      });
    }
  }

  // Rolls stored as [{level, classHD, value}]
  const rolls = character.hp?.rolls || [];
  const getRollValue = (lvl) => rolls.find(r => r.level === lvl)?.value ?? null;

  // Auto-save level 1 on mount so calculateMaxHP stays consistent
  useEffect(() => {
    if (levelRows.length === 0) return;
    const level1 = levelRows[0];
    const alreadySaved = rolls.find(r => r.level === 1);
    if (!alreadySaved) {
      const others = rolls.filter(r => r.level !== 1);
      updateCharacter({
        hp: {
          ...character.hp,
          rolls: [{ level: 1, classHD: level1.hd, value: level1.hd }, ...others]
            .sort((a, b) => a.level - b.level),
        }
      });
    }
  }, [levelRows.length]);

  const setRoll = (charLevel, hd, raw) => {
    const val = Math.max(1, Math.min(hd, parseInt(raw) || 1));
    const others = rolls.filter(r => r.level !== charLevel);
    updateCharacter({
      hp: {
        ...character.hp,
        rolls: [...others, { level: charLevel, classHD: hd, value: val }]
          .sort((a, b) => a.level - b.level),
      }
    });
  };

  const setAllMax = () => {
    updateCharacter({
      hp: {
        ...character.hp,
        rolls: levelRows.map(r => ({ level: r.charLevel, classHD: r.hd, value: r.hd })),
      }
    });
  };

  const setAllAvg = () => {
    updateCharacter({
      hp: {
        ...character.hp,
        rolls: levelRows.map(r => ({
          level: r.charLevel,
          classHD: r.hd,
          value: r.isFirst ? r.hd : Math.ceil(r.hd / 2) + 1,
        })),
      }
    });
  };

  const currentDamage = character.hp?.currentDamage || 0;
  const currentHP = maxHP - currentDamage;
  const tempHP    = character.hp?.tempHP || 0;

  if (levelRows.length === 0) {
    return (
      <SectionCard title="Hit Points">
        <div className="text-center py-12 text-muted-foreground font-crimson">
          <Heart className="w-8 h-8 mx-auto mb-3 opacity-30 text-red-400" />
          <p>No classes selected. Add a class first.</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── HP Total & tracker ── */}
      <SectionCard title="Hit Points">
        <div className="flex flex-wrap gap-8 items-end mb-4">
          <div>
            <div className="text-xs text-muted-foreground font-crimson mb-1">Max HP</div>
            <div className="font-cinzel text-5xl font-bold text-red-400">{maxHP}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-crimson mb-1">Current HP</div>
            <div className={`font-cinzel text-5xl font-bold ${
              currentHP <= 0 ? 'text-red-600' : currentHP < maxHP * 0.5 ? 'text-yellow-400' : 'text-green-400'
            }`}>{currentHP}</div>
          </div>
          {tempHP > 0 && (
            <div>
              <div className="text-xs text-muted-foreground font-crimson mb-1">Temp HP</div>
              <div className="font-cinzel text-5xl font-bold text-blue-400">{tempHP}</div>
            </div>
          )}
        </div>

        {/* HP bar */}
        <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className={`h-full transition-all ${
              currentHP / maxHP > 0.5 ? 'bg-green-500' :
              currentHP / maxHP > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, (currentHP / maxHP) * 100))}%` }}
          />
        </div>

        {/* Tracker controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-muted-foreground font-crimson block mb-1">Damage Taken</label>
            <Input
              type="number" min={0}
              value={currentDamage}
              onChange={e => updateCharacter({ hp: { ...character.hp, currentDamage: Math.max(0, parseInt(e.target.value) || 0) } })}
              className="w-24 h-9 bg-secondary/50 font-cinzel text-center"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-crimson block mb-1">Temp HP</label>
            <Input
              type="number" min={0}
              value={tempHP}
              onChange={e => updateCharacter({ hp: { ...character.hp, tempHP: Math.max(0, parseInt(e.target.value) || 0) } })}
              className="w-24 h-9 bg-secondary/50 font-cinzel text-center"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"
              onClick={() => updateCharacter({ hp: { ...character.hp, currentDamage: Math.max(0, currentDamage - 1) } })}
              className="h-9 font-cinzel text-green-400 border-green-900/40">Heal 1</Button>
            <Button size="sm" variant="outline"
              onClick={() => updateCharacter({ hp: { ...character.hp, currentDamage: Math.max(0, currentDamage - 10) } })}
              className="h-9 font-cinzel text-green-400 border-green-900/40">Heal 10</Button>
            <Button size="sm" variant="outline"
              onClick={() => updateCharacter({ hp: { ...character.hp, currentDamage: currentDamage + 1 } })}
              className="h-9 font-cinzel text-red-400 border-red-900/40">Dmg 1</Button>
            <Button size="sm" variant="outline"
              onClick={() => updateCharacter({ hp: { ...character.hp, currentDamage: currentDamage + 10 } })}
              className="h-9 font-cinzel text-red-400 border-red-900/40">Dmg 10</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Per-level HP rolls ── */}
      <SectionCard title={`HP Per Level  ·  CON ${conMod >= 0 ? '+' : ''}${conMod} per level  ·  Level 1 always max`}>

        {/* Bulk fill buttons */}
        <div className="flex gap-2 mb-4">
          <Button onClick={setAllMax} variant="outline" size="sm"
            className="font-cinzel text-xs border-primary/30 text-primary">
            Max All Levels
          </Button>
          <Button onClick={setAllAvg} variant="outline" size="sm"
            className="font-cinzel text-xs border-primary/30 text-primary">
            Average All Levels
          </Button>
        </div>

        {/* Per-level rows */}
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {levelRows.map(row => {
            const rolled = row.isFirst ? row.hd : getRollValue(row.charLevel);
            const hpThis = rolled !== null ? Math.max(1, rolled + conMod) : null;

            return (
              <div key={row.charLevel}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${
                  hpThis !== null ? 'bg-secondary/40' : 'bg-secondary/15 border border-dashed border-border/40'
                }`}
              >
                {/* Level number */}
                <span className="font-cinzel text-base font-bold text-primary w-6 text-right shrink-0">
                  {row.charLevel}
                </span>

                {/* Class name */}
                <span className="font-crimson text-sm text-foreground w-28 shrink-0">
                  {row.className}
                  <span className="text-muted-foreground text-xs ml-1">({row.classLevel})</span>
                </span>

                {/* Die type */}
                <span className="font-crimson text-sm text-muted-foreground w-8 shrink-0">
                  d{row.hd}
                </span>

                {/* Roll — max at level 1, input otherwise */}
                {row.isFirst ? (
                  <span className="font-crimson text-sm">
                    <span className="text-muted-foreground">(</span>
                    <span className="font-bold text-green-400">{row.hd}</span>
                    <span className="text-muted-foreground">) max</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-crimson text-sm">(</span>
                    <Input
                      type="number"
                      min={1}
                      max={row.hd}
                      value={rolled ?? ''}
                      placeholder={`1-${row.hd}`}
                      onChange={e => setRoll(row.charLevel, row.hd, e.target.value)}
                      className="w-16 h-8 bg-background border-border text-center font-cinzel text-sm p-1"
                    />
                    <span className="text-muted-foreground font-crimson text-sm">)</span>
                    <Button size="sm" variant="ghost"
                      onClick={() => setRoll(row.charLevel, row.hd, row.hd)}
                      className="h-7 px-2 text-xs font-crimson text-muted-foreground hover:text-primary">
                      max
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => setRoll(row.charLevel, row.hd, Math.ceil(row.hd / 2) + 1)}
                      className="h-7 px-2 text-xs font-crimson text-muted-foreground hover:text-primary">
                      avg
                    </Button>
                  </div>
                )}

                {/* + CON */}
                <span className={`font-crimson text-sm shrink-0 ${conMod >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                  + {conMod >= 0 ? '' : '('}{conMod}{conMod < 0 ? ')' : ''}
                </span>

                {/* = total */}
                <span className="font-cinzel text-sm font-bold ml-auto shrink-0">
                  {hpThis !== null ? (
                    <span className="text-foreground">= {hpThis}</span>
                  ) : (
                    <span className="text-muted-foreground/30">= —</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Grand total */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
          <span className="font-crimson text-sm text-muted-foreground">
            {rolls.length} / {levelRows.length} levels filled
          </span>
          <div className="flex items-center gap-3">
            <span className="font-crimson text-sm text-muted-foreground">Total Max HP:</span>
            <span className="font-cinzel text-2xl font-bold text-red-400">{maxHP}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}