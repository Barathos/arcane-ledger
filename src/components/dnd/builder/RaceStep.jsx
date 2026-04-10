import { RACES, ABILITY_NAMES } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Shield } from 'lucide-react';

export default function RaceStep({ character, updateCharacter }) {
  const raceData = RACES[character.race];

  return (
    <div className="space-y-4">
      <SectionCard title="Race Selection">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.keys(RACES).map(race => (
            <button
              key={race}
              onClick={() => updateCharacter({ race, size: RACES[race].size })}
              className={`p-3 rounded-lg border text-center font-cinzel text-sm transition-all ${
                character.race === race
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-secondary/50 border-border text-foreground hover:border-primary/50 hover:bg-secondary'
              }`}
            >
              {race}
            </button>
          ))}
        </div>
      </SectionCard>

      {raceData && (
        <SectionCard title={`${character.race} Details`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-crimson">
                <span className="text-muted-foreground">Size:</span>
                <span className="text-primary font-semibold">{raceData.size}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-crimson">
                <span className="text-muted-foreground">Speed:</span>
                <span className="text-primary font-semibold">{raceData.speed} ft</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-crimson">
                <span className="text-muted-foreground">Favored Class:</span>
                <span className="text-primary font-semibold">{raceData.favoredClass}</span>
              </div>
              {Object.keys(raceData.abilityMods).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ability Modifiers:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(raceData.abilityMods).map(([ab, mod]) => (
                      <span key={ab} className={`text-xs px-2 py-1 rounded font-crimson font-semibold ${
                        mod > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                      }`}>
                        {ABILITY_NAMES[ab]}: {mod > 0 ? `+${mod}` : mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Racial Traits
              </p>
              <ul className="space-y-1">
                {raceData.traits.map((trait, i) => (
                  <li key={i} className="text-sm font-crimson text-foreground flex items-start gap-2">
                    <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}