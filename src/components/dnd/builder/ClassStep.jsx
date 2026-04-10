import SectionCard from '../SectionCard';
import ClassBrowser from './ClassBrowser';

export default function ClassStep({ character, updateCharacter }) {
  const totalLevel = (character.classes || []).reduce((s, c) => s + (c.levels || 0), 0);
  const classStr = character.classes.map(c => `${c.name} ${c.levels}`).join(' / ') || 'No class selected';

  return (
    <div className="space-y-4">
      <SectionCard title="Class Selection">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <p className="font-cinzel text-xl font-bold text-primary">{classStr}</p>
            <p className="text-xs text-muted-foreground font-crimson">Total Level: {totalLevel} / 20</p>
          </div>
        </div>
        <ClassBrowser character={character} updateCharacter={updateCharacter} />
      </SectionCard>
    </div>
  );
}