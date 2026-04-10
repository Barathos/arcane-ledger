import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLASSES, getTotalLevel } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Plus, Trash2 } from 'lucide-react';

export default function ClassStep({ character, updateCharacter }) {
  const totalLevel = getTotalLevel(character);

  const addClass = () => {
    if (totalLevel >= 20) return;
    const available = Object.keys(CLASSES).filter(c => !character.classes.find(cc => cc.name === c));
    if (available.length === 0) return;
    updateCharacter({ classes: [...character.classes, { name: available[0], level: 1 }] });
  };

  const updateClass = (idx, key, value) => {
    const newClasses = [...character.classes];
    newClasses[idx] = { ...newClasses[idx], [key]: value };
    updateCharacter({ classes: newClasses });
  };

  const removeClass = (idx) => {
    if (character.classes.length <= 1) return;
    updateCharacter({ classes: character.classes.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <SectionCard title={`Class Selection (Total Level: ${totalLevel}/20)`}>
        <div className="space-y-3">
          {character.classes.map((cls, idx) => {
            const classData = CLASSES[cls.name];
            return (
              <div key={idx} className="border border-border rounded-lg p-3 bg-secondary/30">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={cls.name} onValueChange={v => updateClass(idx, 'name', v)}>
                    <SelectTrigger className="w-40 bg-secondary/50 border-border font-crimson">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {Object.keys(CLASSES).map(c => (
                        <SelectItem key={c} value={c} className="font-crimson">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Level:</span>
                    <Select value={String(cls.level)} onValueChange={v => updateClass(idx, 'level', parseInt(v))}>
                      <SelectTrigger className="w-20 bg-secondary/50 border-border font-crimson">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-h-60">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(l => (
                          <SelectItem key={l} value={String(l)} className="font-crimson">{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {character.classes.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeClass(idx)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {classData && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-crimson">
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-muted-foreground">Hit Die:</span> <span className="text-primary font-semibold">d{classData.hd}</span>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-muted-foreground">BAB:</span> <span className="text-primary font-semibold">{classData.bab[cls.level - 1]}</span>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-muted-foreground">Skill Pts/Lvl:</span> <span className="text-primary font-semibold">{classData.skillPoints}</span>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-muted-foreground">Caster:</span> <span className="text-primary font-semibold">{classData.caster ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                )}
                {classData && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Class Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(classData.features).filter(([lvl]) => parseInt(lvl) <= cls.level).map(([lvl, feats]) =>
                        feats.map((f, fi) => (
                          <span key={`${lvl}-${fi}`} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-crimson">
                            Lv{lvl}: {f}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Button onClick={addClass} variant="outline" size="sm" className="border-primary/30 text-primary" disabled={totalLevel >= 20}>
            <Plus className="w-4 h-4 mr-1" /> Add Multiclass
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}