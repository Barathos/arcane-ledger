import { getSkillTotals, getDerivedStats, getSkillPointsSpent, SKILL_LIST } from '../../../lib/characterEngine';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';

export default function SkillsStep({ character, updateCharacter }) {
  const stats    = getDerivedStats(character);
  const skills   = getSkillTotals(character);
  const spent    = getSkillPointsSpent(character);
  const total    = stats.totalSkillPoints;
  const remaining = total - spent;

  const maxClassRank = stats.maxClassRanks;
  const maxCrossRank = stats.maxCrossRanks;

  const setRank = (skillId, isClass, value) => {
    const max = isClass ? maxClassRank : maxCrossRank;
    let v = parseFloat(value) || 0;
    // Cross-class ranks must be multiples of 0.5
    if (!isClass) v = Math.round(v * 2) / 2;
    v = Math.max(0, Math.min(max, v));
    updateCharacter({ skillRanks: { ...character.skillRanks, [skillId]: v } });
  };

  const setMisc = (skillId, value) => {
    updateCharacter({ skillMisc: { ...character.skillMisc, [skillId]: parseInt(value) || 0 } });
  };

  return (
    <SectionCard title="Skills">
      {/* Header stats */}
      <div className="mb-3 flex flex-wrap gap-4 text-xs font-crimson text-muted-foreground">
        <span>
          Max Class Rank: <span className="text-primary font-semibold">{maxClassRank}</span>
        </span>
        <span>
          Max Cross-Class Rank: <span className="text-primary font-semibold">{maxCrossRank}</span>
        </span>
        <span className={remaining < 0 ? 'text-destructive font-semibold' : ''}>
          Remaining:{' '}
          <span className={`font-semibold ${remaining < 0 ? 'text-destructive' : remaining > 0 ? 'text-green-400' : 'text-primary'}`}>
            {remaining}
          </span>
          <span className="text-muted-foreground ml-1">({spent}/{total} spent)</span>
        </span>
      </div>

      {/* Skill table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-crimson">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-1">Skill</th>
              <th className="text-center py-2 px-1 w-12">Key</th>
              <th className="text-center py-2 px-1 w-8" title="Class Skill">CS</th>
              <th className="text-center py-2 px-1 w-12">Mod</th>
              <th className="text-center py-2 px-1 w-20">Ranks</th>
              <th className="text-center py-2 px-1 w-16">Misc</th>
              <th className="text-center py-2 px-1 w-12">Total</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => {
              const ranks = character.skillRanks?.[skill.id] || 0;
              const misc  = character.skillMisc?.[skill.id] || 0;
              const isOver = ranks > (skill.isClass ? maxClassRank : maxCrossRank);

              return (
                <tr
                  key={skill.id}
                  className={`border-b border-border/50 hover:bg-secondary/30 ${
                    skill.isClass ? '' : 'opacity-80'
                  }`}
                >
                  {/* Skill name — dim if untrained-only and no ranks */}
                  <td className={`py-1 px-1 ${skill.cantUseUntrained && ranks === 0 ? 'text-muted-foreground/50 italic' : 'text-foreground'}`}>
                    {skill.name}
                    {skill.trained && <span className="text-muted-foreground/40 ml-1" title="Trained only">*</span>}
                  </td>

                  {/* Key ability */}
                  <td className="text-center text-muted-foreground uppercase">
                    {skill.ability}
                  </td>

                  {/* Class skill indicator */}
                  <td className="text-center">
                    {skill.isClass
                      ? <span className="text-primary font-bold">✓</span>
                      : <span className="text-muted-foreground/30">—</span>
                    }
                  </td>

                  {/* Ability modifier */}
                  <td className="text-center text-muted-foreground">
                    {skill.abilityMod >= 0 ? '+' : ''}{skill.abilityMod}
                    {skill.racialBonus > 0 && (
                      <span className="text-blue-400 ml-0.5" title={`+${skill.racialBonus} racial`}>
                        +{skill.racialBonus}r
                      </span>
                    )}
                  </td>

                  {/* Rank input */}
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={skill.isClass ? maxClassRank : maxCrossRank}
                        step={skill.isClass ? 1 : 0.5}
                        value={ranks || ''}
                        onChange={e => setRank(skill.id, skill.isClass, e.target.value)}
                        className={`h-6 w-14 mx-auto bg-background border-border text-center text-xs p-0 ${
                          isOver ? 'border-destructive text-destructive' : ''
                        }`}
                        placeholder="0"
                      />
                      {!skill.isClass && ranks > 0 && (
                        <span className="text-muted-foreground/50 text-xs" title="Cross-class: costs 2 points per rank">
                          ×2
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Misc bonus input */}
                  <td className="text-center">
                    <Input
                      type="number"
                      value={misc || ''}
                      onChange={e => setMisc(skill.id, e.target.value)}
                      className="h-6 w-14 mx-auto bg-background border-border text-center text-xs p-0"
                      placeholder="0"
                    />
                  </td>

                  {/* Total */}
                  <td className="text-center font-semibold text-primary">
                    {skill.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground font-crimson">
        <span>✓ = Class skill (1 point/rank)</span>
        <span>— = Cross-class (2 points/rank, half cap)</span>
        <span>* = Trained only</span>
        <span className="text-blue-400">r = racial bonus</span>
      </div>
    </SectionCard>
  );
}