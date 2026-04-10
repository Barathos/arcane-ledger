import { Input } from "@/components/ui/input";
import { SKILLS, ABILITY_NAMES, getAbilityMod, getClassSkills, getTotalLevel, getTotalSkillPoints, getSpentSkillPoints } from '../../../lib/dndData';
import SectionCard from '../SectionCard';

export default function SkillsStep({ character, updateCharacter }) {
  const classSkills = getClassSkills(character);
  const totalLevel = getTotalLevel(character);
  const maxClassRank = totalLevel + 3;
  const maxCrossRank = (totalLevel + 3) / 2;
  const totalPoints = getTotalSkillPoints(character);
  const spentPoints = getSpentSkillPoints(character);
  const remaining = totalPoints - spentPoints;

  const setRank = (skillName, value) => {
    const isClass = classSkills.has(skillName);
    const max = isClass ? maxClassRank : maxCrossRank;
    const v = Math.max(0, Math.min(max, parseFloat(value) || 0));
    updateCharacter({ skillRanks: { ...character.skillRanks, [skillName]: v } });
  };

  const setMisc = (skillName, value) => {
    updateCharacter({ skillMisc: { ...character.skillMisc, [skillName]: parseInt(value) || 0 } });
  };

  return (
    <SectionCard title={`Skills — Points: ${remaining} remaining (${spentPoints}/${totalPoints})`}>
      <div className="mb-3 flex flex-wrap gap-4 text-xs font-crimson text-muted-foreground">
        <span>Max Class Rank: <span className="text-primary font-semibold">{maxClassRank}</span></span>
        <span>Max Cross-Class Rank: <span className="text-primary font-semibold">{maxCrossRank}</span></span>
        <span className={remaining < 0 ? 'text-destructive font-semibold' : ''}>
          Remaining: <span className={`font-semibold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>{remaining}</span>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-crimson">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-1">Skill</th>
              <th className="text-center py-2 px-1 w-12">Key</th>
              <th className="text-center py-2 px-1 w-10">CS</th>
              <th className="text-center py-2 px-1 w-10">Mod</th>
              <th className="text-center py-2 px-1 w-16">Ranks</th>
              <th className="text-center py-2 px-1 w-16">Misc</th>
              <th className="text-center py-2 px-1 w-12">Total</th>
            </tr>
          </thead>
          <tbody>
            {SKILLS.map(skill => {
              const isClass = classSkills.has(skill.name);
              const abilityMod = skill.ability ? getAbilityMod(character, skill.ability) : 0;
              const ranks = character.skillRanks?.[skill.name] || 0;
              const misc = character.skillMisc?.[skill.name] || 0;
              const total = abilityMod + ranks + misc;

              return (
                <tr key={skill.name} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-1 px-1 text-foreground">{skill.name}</td>
                  <td className="text-center text-muted-foreground">{skill.ability || '—'}</td>
                  <td className="text-center">
                    {isClass ? (
                      <span className="text-primary font-bold">✓</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="text-center text-muted-foreground">{abilityMod >= 0 ? '+' : ''}{abilityMod}</td>
                  <td className="text-center">
                    <Input
                      type="number"
                      min={0}
                      max={isClass ? maxClassRank : maxCrossRank}
                      step={isClass ? 1 : 0.5}
                      value={ranks || ''}
                      onChange={e => setRank(skill.name, e.target.value)}
                      className="h-6 w-14 mx-auto bg-background border-border text-center text-xs p-0"
                    />
                  </td>
                  <td className="text-center">
                    <Input
                      type="number"
                      value={misc || ''}
                      onChange={e => setMisc(skill.name, e.target.value)}
                      className="h-6 w-14 mx-auto bg-background border-border text-center text-xs p-0"
                    />
                  </td>
                  <td className="text-center font-semibold text-primary">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}