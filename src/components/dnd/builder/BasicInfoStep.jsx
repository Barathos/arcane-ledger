import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALIGNMENTS } from '../../../lib/dndData';
import SectionCard from '../SectionCard';

export default function BasicInfoStep({ character, updateCharacter }) {
  const field = (key, label, placeholder = '') => (
    <div>
      <Label className="text-xs text-muted-foreground font-crimson">{label}</Label>
      <Input
        value={character[key] || ''}
        onChange={e => updateCharacter({ [key]: e.target.value })}
        placeholder={placeholder}
        className="bg-secondary/50 border-border text-foreground font-crimson"
      />
    </div>
  );

  return (
    <SectionCard title="Basic Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {field('name', 'Character Name', 'Tordek Ironforge')}
        {field('playerName', 'Player Name', 'Your name')}
        {field('campaign', 'Campaign', 'Campaign name')}
        <div>
          <Label className="text-xs text-muted-foreground font-crimson">Alignment</Label>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {ALIGNMENTS.map(a => (
              <button
                key={a}
                onClick={() => updateCharacter({ alignment: a })}
                className={`text-xs py-1.5 px-1 rounded border font-crimson transition-all ${
                  character.alignment === a
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {a.replace('True ', '')}
              </button>
            ))}
          </div>
        </div>
        {field('deity', 'Deity', 'Moradin')}
        {field('age', 'Age')}
        {field('gender', 'Gender')}
        {field('height', 'Height', "4'6\"")}
        {field('weight', 'Weight', '160 lbs')}
        {field('eyes', 'Eyes', 'Brown')}
        {field('hair', 'Hair', 'Black')}
        {field('skin', 'Skin', 'Tan')}
      </div>
    </SectionCard>
  );
}