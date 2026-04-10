import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMaxHP, getAbilityMod } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Heart, Shield, Minus, Plus } from 'lucide-react';

export default function HPTracker({ character, updateCharacter }) {
  const [damageInput, setDamageInput] = useState('');
  const [healInput, setHealInput] = useState('');
  const maxHP = getMaxHP(character);
  const currentHP = character.currentHP ?? maxHP;
  const nonlethal = character.nonlethalDamage || 0;
  const tempHP = character.tempHP || 0;
  const conMod = getAbilityMod(character, 'CON');
  const conScore = character.baseAbilities?.CON || 10;

  const takeDamage = () => {
    const dmg = parseInt(damageInput) || 0;
    if (dmg <= 0) return;
    let remaining = dmg;
    let newTemp = tempHP;
    let newHP = currentHP;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, remaining);
      newTemp -= absorbed;
      remaining -= absorbed;
    }
    newHP -= remaining;
    updateCharacter({ currentHP: newHP, tempHP: newTemp });
    setDamageInput('');
  };

  const heal = () => {
    const h = parseInt(healInput) || 0;
    if (h <= 0) return;
    updateCharacter({ currentHP: Math.min(maxHP, currentHP + h) });
    setHealInput('');
  };

  const addNonlethal = () => {
    const dmg = parseInt(damageInput) || 0;
    if (dmg <= 0) return;
    updateCharacter({ nonlethalDamage: nonlethal + dmg });
    setDamageInput('');
  };

  // Status calculation
  let status, statusColor;
  if (currentHP <= -(conScore)) {
    status = '💀 Dead'; statusColor = 'text-gray-500';
  } else if (currentHP < 0) {
    status = '😵 Unconscious'; statusColor = 'text-red-600';
  } else if (currentHP === 0) {
    status = '⚠️ Disabled'; statusColor = 'text-orange-400';
  } else if (currentHP <= maxHP * 0.25) {
    status = '🩸 Bloodied'; statusColor = 'text-red-400';
  } else if (currentHP <= maxHP * 0.5) {
    status = '⚔️ Wounded'; statusColor = 'text-yellow-400';
  } else {
    status = '💚 Healthy'; statusColor = 'text-green-400';
  }

  const hpPct = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));

  return (
    <SectionCard title="HP Tracker">
      <div className="text-center mb-4">
        <div className={`text-4xl font-cinzel font-bold ${statusColor}`}>
          {currentHP} <span className="text-lg text-muted-foreground">/ {maxHP}</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${hpPct}%`,
              background: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#eab308' : '#ef4444'
            }}
          />
        </div>
        <div className={`text-sm font-cinzel font-semibold mt-2 ${statusColor}`}>{status}</div>
        {tempHP > 0 && (
          <div className="text-xs text-blue-400 font-crimson mt-1">
            <Shield className="w-3 h-3 inline mr-1" />Temp HP: {tempHP}
          </div>
        )}
        {nonlethal > 0 && (
          <div className="text-xs text-orange-400 font-crimson mt-1">Nonlethal Damage: {nonlethal}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input type="number" value={damageInput} onChange={e => setDamageInput(e.target.value)}
              placeholder="Damage" className="bg-secondary/50 border-border font-crimson h-9" />
          </div>
          <Button onClick={takeDamage} className="w-full bg-red-800 hover:bg-red-700 text-white h-9">
            <Minus className="w-4 h-4 mr-1" /> Take Damage
          </Button>
          <Button onClick={addNonlethal} variant="outline" size="sm" className="w-full border-orange-700 text-orange-400 h-8 text-xs">
            + Nonlethal
          </Button>
        </div>
        <div className="space-y-2">
          <Input type="number" value={healInput} onChange={e => setHealInput(e.target.value)}
            placeholder="Heal" className="bg-secondary/50 border-border font-crimson h-9" />
          <Button onClick={heal} className="w-full bg-green-800 hover:bg-green-700 text-white h-9">
            <Plus className="w-4 h-4 mr-1" /> Heal
          </Button>
          <Button onClick={() => updateCharacter({ currentHP: maxHP, nonlethalDamage: 0, tempHP: 0 })}
            variant="outline" size="sm" className="w-full border-primary/30 text-primary h-8 text-xs">
            Full Rest
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground font-crimson">Temp HP</label>
          <Input type="number" value={tempHP} onChange={e => updateCharacter({ tempHP: parseInt(e.target.value) || 0 })}
            className="bg-secondary/50 border-border font-crimson h-8 text-sm" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground font-crimson">Nonlethal</label>
          <Input type="number" value={nonlethal} onChange={e => updateCharacter({ nonlethalDamage: parseInt(e.target.value) || 0 })}
            className="bg-secondary/50 border-border font-crimson h-8 text-sm" />
        </div>
      </div>
    </SectionCard>
  );
}