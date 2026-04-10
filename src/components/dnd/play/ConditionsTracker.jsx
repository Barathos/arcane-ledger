import { CONDITIONS } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ConditionsTracker({ character, updateCharacter }) {
  const activeConditions = character.conditions || [];

  const toggleCondition = (name) => {
    const isActive = activeConditions.includes(name);
    updateCharacter({
      conditions: isActive
        ? activeConditions.filter(c => c !== name)
        : [...activeConditions, name]
    });
  };

  return (
    <SectionCard title={`Conditions (${activeConditions.length} active)`}>
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map(cond => {
            const isActive = activeConditions.includes(cond.name);
            return (
              <Tooltip key={cond.name}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleCondition(cond.name)}
                    className={`text-xs px-2 py-1 rounded border font-crimson transition-all ${
                      isActive
                        ? 'bg-red-900/50 border-red-700 text-red-300 shadow-sm shadow-red-900/30'
                        : 'bg-secondary/30 border-border text-muted-foreground hover:border-border hover:bg-secondary/50'
                    }`}
                  >
                    {isActive && '● '}{cond.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-card border-border text-foreground">
                  <p className="text-xs font-crimson"><span className="font-semibold text-primary">{cond.name}:</span> {cond.effect}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      {activeConditions.length > 0 && (
        <div className="mt-3 border-t border-border pt-3 space-y-1">
          {activeConditions.map(name => {
            const cond = CONDITIONS.find(c => c.name === name);
            return (
              <div key={name} className="text-xs font-crimson bg-red-900/20 rounded px-2 py-1">
                <span className="text-red-300 font-semibold">{name}:</span>{' '}
                <span className="text-red-200/70">{cond?.effect}</span>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}