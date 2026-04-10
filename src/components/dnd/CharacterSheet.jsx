import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import {
  ABILITIES, ABILITY_NAMES, RACES, SIZE_MODS, SKILLS,
  getAbilityScore, getAbilityMod, getBAB, getSaveBase, getMaxHP,
  getClassSkills, getClassFeatures, getSpellsPerDay, getTotalLevel,
  getTotalWeight, getEncumbrance
} from '../../lib/dndData';
import SectionCard from './SectionCard';

export default function CharacterSheet({ character }) {
  const totalLevel = getTotalLevel(character);
  const classStr = character.classes.map(c => `${c.name} ${c.level}`).join(' / ');
  const misc = character.combatMisc || {};
  const raceData = RACES[character.race];
  const sizeMod = SIZE_MODS[character.size || 'Medium'] || 0;
  const dexMod = getAbilityMod(character, 'DEX');
  const strMod = getAbilityMod(character, 'STR');
  const conMod = getAbilityMod(character, 'CON');
  const wisMod = getAbilityMod(character, 'WIS');
  const bab = getBAB(character);
  const maxHP = getMaxHP(character);
  const classSkills = getClassSkills(character);
  const features = getClassFeatures(character);
  const spellsPerDay = getSpellsPerDay(character);

  const armorBonus = misc.armorBonus || 0;
  const shieldBonus = misc.shieldBonus || 0;
  const naturalArmor = misc.naturalArmor || 0;
  const deflection = misc.deflection || 0;
  const miscAC = misc.miscAC || 0;
  const ac = 10 + armorBonus + shieldBonus + dexMod + sizeMod + naturalArmor + deflection + miscAC;
  const touchAC = 10 + dexMod + sizeMod + deflection + miscAC;
  const flatFootedAC = 10 + armorBonus + shieldBonus + sizeMod + naturalArmor + deflection;
  const init = dexMod + (misc.miscInit || 0);
  const meleeAtk = bab + strMod + sizeMod + (misc.miscMeleeAttack || 0);
  const rangedAtk = bab + dexMod + sizeMod + (misc.miscRangedAttack || 0);
  const grapple = bab + strMod + sizeMod + (misc.miscGrapple || 0);
  const fort = getSaveBase(character, 'Fort') + conMod + (misc.miscFort || 0);
  const ref = getSaveBase(character, 'Ref') + dexMod + (misc.miscRef || 0);
  const will = getSaveBase(character, 'Will') + wisMod + (misc.miscWill || 0);

  const fmt = (v) => v >= 0 ? `+${v}` : `${v}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()} variant="outline" className="border-primary/30 text-primary">
          <Printer className="w-4 h-4 mr-2" /> Print Character Sheet
        </Button>
      </div>

      {/* Header */}
      <SectionCard>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm font-crimson">
          <div><span className="text-xs text-muted-foreground block">Name</span><span className="font-cinzel font-bold text-primary text-lg">{character.name || 'Unnamed'}</span></div>
          <div><span className="text-xs text-muted-foreground block">Class/Level</span><span className="font-semibold">{classStr}</span></div>
          <div><span className="text-xs text-muted-foreground block">Race</span><span className="font-semibold">{character.race}</span></div>
          <div><span className="text-xs text-muted-foreground block">Alignment</span><span>{character.alignment}</span></div>
          <div><span className="text-xs text-muted-foreground block">Deity</span><span>{character.deity || '—'}</span></div>
          <div><span className="text-xs text-muted-foreground block">Size</span><span>{character.size}</span></div>
        </div>
      </SectionCard>

      {/* Abilities */}
      <SectionCard title="Ability Scores">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ABILITIES.map(ab => {
            const score = getAbilityScore(character, ab);
            const mod = getAbilityMod(character, ab);
            return (
              <div key={ab} className="text-center bg-secondary/30 rounded-lg p-2 border border-border">
                <div className="font-cinzel text-xs font-bold text-primary">{ab}</div>
                <div className="text-2xl font-cinzel font-bold text-foreground">{score}</div>
                <div className={`text-sm font-semibold ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(mod)}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Combat */}
      <SectionCard title="Combat">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center text-sm font-crimson">
          <div className="bg-red-900/20 rounded-lg p-2 border border-red-900/30">
            <div className="text-xs text-red-300">HP</div>
            <div className="text-xl font-cinzel font-bold text-red-400">{character.currentHP ?? maxHP} / {maxHP}</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">AC</div>
            <div className="text-xl font-cinzel font-bold text-primary">{ac}</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Touch / FF</div>
            <div className="font-cinzel font-bold text-primary">{touchAC} / {flatFootedAC}</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Initiative</div>
            <div className="text-xl font-cinzel font-bold">{fmt(init)}</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Speed</div>
            <div className="font-cinzel font-bold">{raceData?.speed || 30} ft</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">BAB</div>
            <div className="text-xl font-cinzel font-bold text-red-400">{fmt(bab)}</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Melee</div>
            <div className="font-cinzel font-bold">{fmt(meleeAtk)}</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Ranged</div>
            <div className="font-cinzel font-bold">{fmt(rangedAtk)}</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Grapple</div>
            <div className="font-cinzel font-bold">{fmt(grapple)}</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-2 border border-green-900/30">
            <div className="text-xs text-green-300">Fort</div>
            <div className="font-cinzel font-bold text-green-400">{fmt(fort)}</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-900/30">
            <div className="text-xs text-blue-300">Ref</div>
            <div className="font-cinzel font-bold text-blue-400">{fmt(ref)}</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-900/30">
            <div className="text-xs text-purple-300">Will</div>
            <div className="font-cinzel font-bold text-purple-400">{fmt(will)}</div>
          </div>
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5 text-xs font-crimson">
          {SKILLS.map(skill => {
            const ranks = character.skillRanks?.[skill.name] || 0;
            const abilityMod = skill.ability ? getAbilityMod(character, skill.ability) : 0;
            const miscMod = character.skillMisc?.[skill.name] || 0;
            const total = abilityMod + ranks + miscMod;
            const isClass = classSkills.has(skill.name);
            if (ranks === 0 && miscMod === 0 && !isClass) return null;
            return (
              <div key={skill.name} className="flex justify-between py-0.5 border-b border-border/30">
                <span className={isClass ? 'text-primary' : 'text-foreground'}>
                  {isClass && '● '}{skill.name}
                </span>
                <span className="font-semibold">{fmt(total)} <span className="text-muted-foreground">({ranks}r {fmt(abilityMod)}ab {miscMod ? fmt(miscMod)+'m' : ''})</span></span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Feats */}
      <SectionCard title="Feats">
        <div className="flex flex-wrap gap-2">
          {character.feats.map((feat, i) => (
            <div key={i} className="bg-primary/10 border border-primary/20 rounded px-3 py-1">
              <span className="font-cinzel text-xs text-primary font-semibold">{feat.name}</span>
              {feat.description && <span className="text-xs text-muted-foreground ml-1">— {feat.description}</span>}
            </div>
          ))}
          {character.feats.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
        </div>
      </SectionCard>

      {/* Class Features */}
      <SectionCard title="Class Features">
        <div className="flex flex-wrap gap-1">
          {features.map((f, i) => (
            <span key={i} className="text-xs bg-secondary/50 rounded px-2 py-1 font-crimson text-foreground">{f}</span>
          ))}
          {features.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
        </div>
      </SectionCard>

      {/* Racial Traits */}
      <SectionCard title="Racial Traits">
        <div className="flex flex-wrap gap-1">
          {(raceData?.traits || []).map((t, i) => (
            <span key={i} className="text-xs bg-accent rounded px-2 py-1 font-crimson text-accent-foreground">{t}</span>
          ))}
        </div>
      </SectionCard>

      {/* Equipment */}
      <SectionCard title="Equipment">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-crimson">
          <div>
            <p className="text-primary font-cinzel text-xs font-semibold mb-1">Weapons</p>
            {(character.equipment.weapons || []).map((w, i) => (
              <div key={i} className="text-foreground">{w.name} — {w.damage} ({w.critRange}) {w.damageType}</div>
            ))}
          </div>
          <div>
            <p className="text-primary font-cinzel text-xs font-semibold mb-1">Armor</p>
            {(character.equipment.armor || []).map((a, i) => (
              <div key={i} className="text-foreground">{a.name} — AC+{a.acBonus} MaxDEX {a.maxDex}</div>
            ))}
          </div>
          <div>
            <p className="text-primary font-cinzel text-xs font-semibold mb-1">Gear</p>
            {(character.equipment.gear || []).map((g, i) => (
              <div key={i} className="text-foreground">{g.name} x{g.quantity || 1}</div>
            ))}
          </div>
        </div>
        <div className="mt-2 text-xs font-crimson text-muted-foreground">
          Total Weight: {getTotalWeight(character).toFixed(1)} lbs |
          Money: {character.money.pp}pp {character.money.gp}gp {character.money.sp}sp {character.money.cp}cp
        </div>
      </SectionCard>

      {/* Spells */}
      {Object.keys(spellsPerDay).length > 0 && (
        <SectionCard title="Spells">
          {Object.entries(spellsPerDay).map(([className, slots]) => (
            <div key={className} className="mb-4">
              <p className="font-cinzel text-sm font-semibold text-primary mb-2">{className}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(slots).map(([level, count]) => (
                  <span key={level} className="bg-secondary/50 rounded px-2 py-1 text-xs font-crimson">
                    Lv{level}: {count}/day
                  </span>
                ))}
              </div>
              {Array.from({ length: 10 }, (_, i) => i).map(level => {
                const key = `${className}_${level}`;
                const spells = character.spellsKnown[key] || [];
                if (spells.length === 0) return null;
                return (
                  <div key={level} className="ml-2 mb-1">
                    <span className="text-xs text-muted-foreground font-crimson">Level {level}:</span>
                    {spells.map((s, i) => (
                      <span key={i} className="text-xs text-foreground font-crimson ml-2">{s.name}{s.description ? ` (${s.description})` : ''}{i < spells.length - 1 ? ',' : ''}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </SectionCard>
      )}

      {/* Notes */}
      <SectionCard title="Notes">
        <p className="text-sm font-crimson text-foreground whitespace-pre-wrap">{character.notes || 'No notes.'}</p>
      </SectionCard>
    </div>
  );
}