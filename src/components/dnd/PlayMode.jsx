import HPTracker from './play/HPTracker';
import DiceRoller from './play/DiceRoller';
import ConditionsTracker from './play/ConditionsTracker';
import CombatRoundTracker from './play/CombatRoundTracker';
import SpellSlotTracker from './play/SpellSlotTracker';
import { CLASSES } from '../../lib/dndData';

export default function PlayMode({ character, updateCharacter }) {
  const hasCaster = character.classes.some(c => CLASSES[c.name]?.caster);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <HPTracker character={character} updateCharacter={updateCharacter} />
        <DiceRoller character={character} updateCharacter={updateCharacter} />
      </div>
      <div className="space-y-4">
        <CombatRoundTracker character={character} updateCharacter={updateCharacter} />
        {hasCaster && <SpellSlotTracker character={character} updateCharacter={updateCharacter} />}
        <ConditionsTracker character={character} updateCharacter={updateCharacter} />
      </div>
    </div>
  );
}