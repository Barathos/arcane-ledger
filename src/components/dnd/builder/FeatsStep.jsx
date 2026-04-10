import SectionCard from '../SectionCard';
import FeatBrowser from './FeatBrowser';

export default function FeatsStep({ character, updateCharacter }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Feats">
        <FeatBrowser character={character} updateCharacter={updateCharacter} />
      </SectionCard>
    </div>
  );
}