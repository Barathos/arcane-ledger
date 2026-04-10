import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateMaxHP, getAbilityMods, getAbilityScores, getDerivedStats } from '../../../lib/characterEngine';
import SectionCard from '../SectionCard';
import { Heart, Dices, Maximize2, X } from 'lucide-react';

export default function HitPointsStep({ character, updateCharacter }) {
  const mods     = getAbilityMods(character);
  const scores   = getAbilityScores(character);
  const conMod   = mods.con;
  const maxHP    = calculateMaxHP(character);

  // Build the ordered level list from character.classes (new format: cls.levels)
  const levelRows = [];
  let levelCounter = 0;
  for (const cls of (character.classes || [])) {
    const levels = cls.levels || 0;
    const hd = cls.hd || 8;
    for (let i = 1; i <= levels; i++) {
      levelCounter++;
      levelRows.push({
        charLevel:  levelCounter,
        className:  cls.name,
        classLevel: i,
        hd,
        isFirst: levelCounter === 1,
      });
    }
  }

  // hp.rolls is [{level, classHD, value}]
  const rolls = character.hp?.rolls || [];
  const getRoll = (charLevel) => rolls.find(r => r.level === charLevel);

  const setRoll = (charLevel, hd, value) => {
    const clamped = Math.max(1, Math.min(hd, parseInt(value) || 1));
    const existing = rolls.filter(r => r.level !== charLevel);
    const newRolls = [
      ...existing,
      { level: charLevel, classHD: hd, value: clamped }
    ].sort((a, b) => a.level - b.level);
    updateCharacter({ hp: { ...character.hp, rolls: newRolls } });
  };

  const setMax = (charLevel, hd) => setRoll(charLevel, hd, hd);
  const setAvg = (charLevel, hd) => setRoll(charLevel, hd, Math.ceil(hd / 2) + 1);

  const removeLevel = (charLevel) => {
    const newRolls = rolls.filter(r => r.level !== charLevel);
    updateCharacter({ hp: { ...character.hp, rolls: newRolls } });
  };

  // Fill all missing levels at once
  const fillAllAverage = () => {
    const newRolls = levelRows.map((row, i) => {
      const existing = getRoll(row.charLevel);
      if (row.isFirst) return { level: row.charLevel, classHD: row.hd, value: row.hd };
      return existing || { level: row.charLevel, classHD: row.hd, value: Math.ceil(row.hd / 2) + 1 };
    });
    updateCharacter({ hp: { ...character.hp, rolls: newRolls } });
  };

  const fillAllMax = () => {
    const newRolls = levelRows.map(row => ({
      level: row.charLevel, classHD: row.hd, value: row.hd
    }));
    updateCharacter({ hp: { ...character.hp, rolls: newRolls } });
  };

  const currentHP  = maxHP - (character.hp?.currentDamage || 0);
  const tempHP     = character.hp?.tempHP || 0;
  const nonlethal  = character.hp?.nonlethalDamage || 0;

  const setCurrentDamage = (val) => updateCharacter({ hp: { ...character.hp, currentDamage: Math.max(0, parseInt(val) || 0) } });
  const setTempHP = (val)        => updateCharacter({ hp: { ...character.hp, tempHP: Math.max(0, parseInt(val) || 0) } });
  const heal = (amt)             => updateCharacter({ hp: { ...character.hp, currentDamage: Math.max(0, (character.hp?.currentDamage || 0) - amt) } });
  const damage = (amt)           => updateCharacter({ hp: { ...character.hp, currentDamage: (character.hp?.currentDamage || 0) + amt } });

  const hpPercent = maxHP > 0 ? Math.max(0, Math.min(100, (currentHP / maxHP) * 100)) : 0;
  const hpColor   = hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  if (levelRows.length === 0) {
    return (
      <SectionCard title="Hit Points">
        <div className="text-center py-12 text-muted-foreground font-crimson">
          <Heart className="w-8 h-8 mx-auto mb-3 opacity-30 text-red-400" />
          <p>No classes selected.</p>
          <p className="text-xs mt-1">Add a class to begin tracking hit points.</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">

      {/* HP Summary */}
      <SectionCard title="Hit Points">
        <div className="flex flex-wrap gap-6 items-center mb-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-crimson mb-1">Max HP</div>
            <div className="font-cinzel text-4xl font-bold text-red-400">{maxHP}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-crimson mb-1">Current HP</div>
            <div className={`font-cinzel text-4xl font-bold ${currentHP <= 0 ? 'text-red-600' : currentHP < maxHP * 0.5 ? 'text-yellow-400' : 'text-green-400'}`}>
              {currentHP}
            </div>
          </div>
          {tempHP > 0 && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-crimson mb-1">Temp HP</div>
              <div className="font-cinzel text-4xl font-bold text-blue-400">{tempHP}</div>
            </div>
          )}
          <div className="flex-1 min-w-32">
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full ${hpColor} transition-all`} style={{ width: `${hpPercent}%` }} />
            </div>
            <div className="text-xs text-muted-foreground font-crimson mt-1 text-center">
              {currentHP} / {maxHP}
            </div>
          </div>
        </div>

        {/* HP Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
          <div>
            <label className="text-xs text-muted-foreground font-crimson">Damage Taken</label>
            <Input type="number" min={0} value={character.hp?.currentDamage || 0}
              onChange={e => setCurrentDamage(e.target.value)}
              className="h-8 bg-secondary/50 font-cinzel text-center text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-crimson">Temp HP</label>
            <Input type="number" min={0} value={tempHP}
              onChange={e => setTempHP(e.target.value)}
              className="h-8 bg-secondary/50 font-cinzel text-center text-sm" />
          </div>
          <div className="flex items-end gap-1">
            <Button onClick={() => heal(1)}  variant="outline" className="flex-1 h-8 text-xs font-cinzel text-green-400 border-green-900/40">Heal 1</Button>
            <Button onClick={() => heal(10)} variant="outline" className="flex-1 h-8 text-xs font-cinzel text-green-400 border-green-900/40">Heal 10</Button>
          </div>
          <div className="flex items-end gap-1">
            <Button onClick={() => damage(1)}  variant="outline" className="flex-1 h-8 text-xs font-cinzel text-red-400 border-red-900/40">Dmg 1</Button>
            <Button onClick={() => damage(10)} variant="outline" className="flex-1 h-8 text-xs font-cinzel text-red-400 border-red-900/40">Dmg 10</Button>
          </div>
        </div>
      </SectionCard>

      {/* Per-level HP rolls */}
      <SectionCard title={`HP by Level — CON modifier: ${conMod >= 0 ? '+' : ''}${conMod} (score ${scores.con})`}>

        {/* Bulk actions */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button onClick={fillAllMax} variant="outline" size="sm"
            className="font-cinzel text-xs border-primary/30 text-primary">
            <Maximize2 className="w-3 h-3 mr-1" /> Max All
          </Button>
          <Button onClick={fillAllAverage} variant="outline" size="sm"
            className="font-cinzel text-xs border-primary/30 text-primary">
            <Dices className="w-3 h-3 mr-1" /> Average All
          </Button>
          <span className="text-xs text-muted-foreground font-crimson self-center ml-2">
            {rolls.length}/{levelRows.length} levels filled
          </span>
        </div>

        {/* Column headers */}
        <div className="grid gap-1 mb-1 px-2 text-xs text-muted-foreground font-cinzel uppercase tracking-wide"
          style={{ gridTemplateColumns: '3rem 8rem 3rem 1fr 3rem 4rem 1.5rem' }}>
          <span>Lvl</span>
          <span>Class</span>
          <span>HD</span>
          <span>Roll</span>
          <span className="text-center">CON</span>
          <span className="text-right">= Total</span>
          <span></span>
        </div>

        {/* Level rows */}
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
          {levelRows.map(row => {
            const rollEntry = getRoll(row.charLevel);
            const rollValue = row.isFirst ? row.hd : (rollEntry?.value ?? null);
            const hpThisLevel = rollValue !== null ? Math.max(1, rollValue + conMod) : null;
            const isFilled = rollValue !== null;
            const isFirstRow = row.isFirst;

            return (
              <div key={row.charLevel}
                className={`grid items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                  isFilled ? 'bg-secondary/30' : 'bg-secondary/10 border border-dashed border-border/50'
                }`}
                style={{ gridTemplateColumns: '3rem 8rem 3rem 1fr 3rem 4rem 1.5rem' }}>

                {/* Level */}
                <span className="font-cinzel text-sm font-bold text-primary">{row.charLevel}</span>

                {/* Class */}
                <span className="font-crimson text-sm text-foreground truncate" title={`${row.className} (class level ${row.classLevel})`}>
                  {row.className}
                  <span className="text-muted-foreground text-xs ml-1">{row.classLevel}</span>
                </span>

                {/* Hit die */}
                <span className="text-xs text-muted-foreground font-crimson">d{row.hd}</span>

                {/* Roll input */}
                <div className="flex items-center gap-1">
                  {isFirstRow ? (
                    <div className="flex items-center gap-1">
                      <span className="font-cinzel text-sm font-bold text-green-400">{row.hd}</span>
                      <span className="text-xs text-muted-foreground font-crimson">(max)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        max={row.hd}
                        value={rollValue ?? ''}
                        placeholder={`1–${row.hd}`}
                        onChange={e => setRoll(row.charLevel, row.hd, e.target.value)}
                        className="w-16 h-7 bg-background border-border text-center font-cinzel text-sm p-0"
                      />
                      <Button size="sm" variant="ghost" onClick={() => setMax(row.charLevel, row.hd)}
                        className="h-7 px-1.5 text-xs font-crimson text-muted-foreground hover:text-primary"
                        title="Set to max">
                        Max
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAvg(row.charLevel, row.hd)}
                        className="h-7 px-1.5 text-xs font-crimson text-muted-foreground hover:text-primary"
                        title="Set to average">
                        Avg
                      </Button>
                    </div>
                  )}
                </div>

                {/* CON modifier */}
                <span className={`text-center text-sm font-crimson font-semibold ${conMod >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                  {conMod >= 0 ? '+' : ''}{conMod}
                </span>

                {/* Total HP this level */}
                <span className={`text-right font-cinzel font-bold text-sm ${
                  hpThisLevel === null ? 'text-muted-foreground/30' : 'text-foreground'
                }`}>
                  {hpThisLevel !== null ? hpThisLevel : '—'}
                </span>

                {/* Remove */}
                {!isFirstRow && isFilled && (
                  <button onClick={() => removeLevel(row.charLevel)}
                    className="text-muted-foreground/30 hover:text-red-400 transition-colors justify-self-center">
                    <X className="w-3 h-3" />
                  </button>
                )}
                {(isFirstRow || !isFilled) && <span />}
              </div>
            );
          })}
        </div>

        {/* Running total */}
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="font-crimson text-sm text-muted-foreground">
            {rolls.length} of {levelRows.length} levels filled
          </span>
          <div className="flex items-center gap-2">
            <span className="font-crimson text-sm text-muted-foreground">Total HP:</span>
            <span className="font-cinzel text-xl font-bold text-red-400">{maxHP}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
