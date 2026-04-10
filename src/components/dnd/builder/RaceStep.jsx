import { useState } from 'react';
import SectionCard from '../SectionCard';
import RaceBrowser from './RaceBrowser';
import { Button } from '@/components/ui/button';
import { Shield, BookOpen, ExternalLink } from 'lucide-react';

export default function RaceStep({ character, updateCharacter }) {
  const [showBrowser, setShowBrowser] = useState(false);

  // Prefer SRD data if available
  const srdData = character.srdRaceData;
  const raceData = srdData ? {
    size: srdData.size,
    speed: srdData.speed,
    favoredClass: srdData.favoredClass,
    abilityMods: (() => {
      const m = {};
      Object.entries(srdData.abilityMods || {}).forEach(([k, v]) => { if (v !== 0) m[k] = v; });
      return m;
    })(),
    traits: srdData.traits || [],
    source: srdData.source,
    srdUrl: srdData.srdUrl,
    LA: srdData.LA,
    darkvision: srdData.darkvision,
    lowLightVision: srdData.lowLightVision,
  } : null;

  if (showBrowser) {
    return (
      <SectionCard title="Race Browser">
        <RaceBrowser character={character} updateCharacter={updateCharacter} onClose={() => setShowBrowser(false)} />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Race Selection">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <p className="font-cinzel text-2xl font-bold text-primary">{(typeof character.race === 'string' ? character.race : character.race?.name) || 'None Selected'}</p>
            {raceData?.source && <p className="text-xs text-muted-foreground font-crimson">{raceData.source}</p>}
          </div>
          <Button onClick={() => setShowBrowser(true)} className="bg-primary text-primary-foreground font-cinzel">
            <BookOpen className="w-4 h-4 mr-2" /> Browse All Races
          </Button>
        </div>

        {raceData && (
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
              {raceData.LA > 0 && (
                <div className="text-sm font-crimson bg-red-900/20 border border-red-900/30 rounded px-3 py-2">
                  <span className="text-red-400 font-semibold">Level Adjustment: +{raceData.LA}</span>
                  <p className="text-xs text-red-300/70 mt-0.5">ECL = class levels + {raceData.LA}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {raceData.darkvision > 0 && <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded font-crimson">Darkvision {raceData.darkvision}ft</span>}
                {raceData.lowLightVision && <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded font-crimson">Low-Light Vision</span>}
              </div>
              {Object.keys(raceData.abilityMods).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ability Adjustments:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(raceData.abilityMods).map(([ab, mod]) => (
                      <span key={ab} className={`text-xs px-2 py-1 rounded font-crimson font-semibold ${
                        mod > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                      }`}>
                        {ab}: {mod > 0 ? `+${mod}` : mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {raceData.srdUrl && (
                <a href={raceData.srdUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-crimson">
                  <ExternalLink className="w-3 h-3" /> View full SRD entry
                </a>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Racial Traits
              </p>
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {raceData.traits.map((trait, i) => (
                  <li key={i} className="text-sm font-crimson text-foreground flex items-start gap-2">
                    <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!raceData && (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-crimson mb-4">No race selected. Click "Browse All Races" to choose one.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}