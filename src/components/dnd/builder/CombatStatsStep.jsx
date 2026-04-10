import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RACES, SIZE_MODS, getAbilityMod, getBAB, getSaveBase } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Swords, Shield } from 'lucide-react';

export default function CombatStatsStep({ character, updateCharacter }) {
  const misc = character.combatMisc || {};
  const setMisc = (key, value) => {
    updateCharacter({ combatMisc: { ...misc, [key]: parseInt(value) || 0 } });
  };

  const dexMod = getAbilityMod(character, 'DEX');
  const strMod = getAbilityMod(character, 'STR');
  const conMod = getAbilityMod(character, 'CON');
  const wisMod = getAbilityMod(character, 'WIS');
  const bab = getBAB(character);
  const sizeMod = SIZE_MODS[character.size || 'Medium'] || 0;
  const raceData = RACES[character.race];
  const speed = raceData?.speed || 30;

  const armorBonus = misc.armorBonus || 0;
  const shieldBonus = misc.shieldBonus || 0;
  const naturalArmor = misc.naturalArmor || 0;
  const deflection = misc.deflection || 0;
  const miscAC = misc.miscAC || 0;

  const ac = 10 + armorBonus + shieldBonus + dexMod + sizeMod + naturalArmor + deflection + miscAC;
  const touchAC = 10 + dexMod + sizeMod + deflection + miscAC;
  const flatFootedAC = 10 + armorBonus + shieldBonus + sizeMod + naturalArmor + deflection;
  const initiative = dexMod + (misc.miscInit || 0);
  const meleeAttack = bab + strMod + sizeMod + (misc.miscMeleeAttack || 0);
  const rangedAttack = bab + dexMod + sizeMod + (misc.miscRangedAttack || 0);
  const grapple = bab + strMod + sizeMod + (misc.miscGrapple || 0);

  const fortBase = getSaveBase(character, 'Fort');
  const refBase = getSaveBase(character, 'Ref');
  const willBase = getSaveBase(character, 'Will');
  const fort = fortBase + conMod + (misc.miscFort || 0);
  const ref = refBase + dexMod + (misc.miscRef || 0);
  const will = willBase + wisMod + (misc.miscWill || 0);

  const StatBox = ({ label, value, formula, color = 'text-primary' }) => (
    <div className="bg-secondary/30 border border-border rounded-lg p-3 text-center">
      <div className="text-xs text-muted-foreground font-crimson mb-1">{label}</div>
      <div className={`text-2xl font-cinzel font-bold ${color}`}>{value >= 0 && label !== 'AC' && label !== 'Touch AC' && label !== 'Flat-Footed' ? '+' : ''}{value}</div>
      {formula && <div className="text-xs text-muted-foreground font-crimson mt-1">{formula}</div>}
    </div>
  );

  const MiscField = ({ label, miscKey }) => (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground font-crimson w-24 shrink-0">{label}</Label>
      <Input
        type="number"
        value={misc[miscKey] || 0}
        onChange={e => setMisc(miscKey, e.target.value)}
        className="h-8 w-20 bg-secondary/50 border-border text-center font-crimson text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <SectionCard title="Armor Class">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox label="AC" value={ac} formula={`10+${armorBonus}+${shieldBonus}+${dexMod}+${sizeMod}+${naturalArmor}+${deflection}+${miscAC}`} />
          <StatBox label="Touch AC" value={touchAC} />
          <StatBox label="Flat-Footed" value={flatFootedAC} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MiscField label="Armor Bonus" miscKey="armorBonus" />
          <MiscField label="Shield Bonus" miscKey="shieldBonus" />
          <MiscField label="Natural Armor" miscKey="naturalArmor" />
          <MiscField label="Deflection" miscKey="deflection" />
          <MiscField label="Misc AC" miscKey="miscAC" />
        </div>
      </SectionCard>

      <SectionCard title="Attack & Combat">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatBox label="Initiative" value={initiative} formula={`DEX ${dexMod} + misc ${misc.miscInit || 0}`} />
          <StatBox label="BAB" value={bab} color="text-red-400" />
          <StatBox label="Melee Attack" value={meleeAttack} formula={`BAB+STR+Size+misc`} />
          <StatBox label="Ranged Attack" value={rangedAttack} formula={`BAB+DEX+Size+misc`} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <StatBox label="Grapple (CMB)" value={grapple} formula={`BAB+STR+Size+misc`} />
          <StatBox label="Speed" value={`${speed} ft`} color="text-blue-400" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MiscField label="Misc Initiative" miscKey="miscInit" />
          <MiscField label="Misc Melee" miscKey="miscMeleeAttack" />
          <MiscField label="Misc Ranged" miscKey="miscRangedAttack" />
          <MiscField label="Misc Grapple" miscKey="miscGrapple" />
        </div>
      </SectionCard>

      <SectionCard title="Saving Throws">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox label="Fortitude" value={fort} formula={`Base ${fortBase} + CON ${conMod} + misc ${misc.miscFort || 0}`} color="text-green-400" />
          <StatBox label="Reflex" value={ref} formula={`Base ${refBase} + DEX ${dexMod} + misc ${misc.miscRef || 0}`} color="text-blue-400" />
          <StatBox label="Will" value={will} formula={`Base ${willBase} + WIS ${wisMod} + misc ${misc.miscWill || 0}`} color="text-purple-400" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <MiscField label="Misc Fort" miscKey="miscFort" />
          <MiscField label="Misc Ref" miscKey="miscRef" />
          <MiscField label="Misc Will" miscKey="miscWill" />
        </div>
      </SectionCard>
    </div>
  );
}