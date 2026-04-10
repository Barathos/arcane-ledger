import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COMMON_FEATS, getAvailableFeats } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Plus, Trash2, Search } from 'lucide-react';

export default function FeatsStep({ character, updateCharacter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newFeatName, setNewFeatName] = useState('');
  const [newFeatDesc, setNewFeatDesc] = useState('');
  const availableCount = getAvailableFeats(character);

  const addFeat = (name = newFeatName, desc = newFeatDesc) => {
    if (!name.trim()) return;
    updateCharacter({
      feats: [...character.feats, { name: name.trim(), description: desc.trim() }]
    });
    setNewFeatName('');
    setNewFeatDesc('');
  };

  const removeFeat = (idx) => {
    updateCharacter({ feats: character.feats.filter((_, i) => i !== idx) });
  };

  const filteredCommon = COMMON_FEATS.filter(f =>
    f.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !character.feats.find(cf => cf.name === f)
  );

  return (
    <div className="space-y-4">
      <SectionCard title={`Feats — ${character.feats.length}/${availableCount} selected`}>
        <div className="space-y-3">
          {/* Add from common feats */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search common feats..."
              className="pl-9 bg-secondary/50 border-border font-crimson"
            />
          </div>
          {searchTerm && (
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {filteredCommon.map(feat => (
                <button
                  key={feat}
                  onClick={() => addFeat(feat, '')}
                  className="text-xs bg-secondary/50 hover:bg-primary/20 text-foreground px-2 py-1 rounded border border-border font-crimson transition-colors"
                >
                  + {feat}
                </button>
              ))}
            </div>
          )}

          {/* Custom feat */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={newFeatName}
              onChange={e => setNewFeatName(e.target.value)}
              placeholder="Feat name"
              className="bg-secondary/50 border-border font-crimson"
            />
            <Input
              value={newFeatDesc}
              onChange={e => setNewFeatDesc(e.target.value)}
              placeholder="Description/notes (optional)"
              className="bg-secondary/50 border-border font-crimson flex-1"
            />
            <Button onClick={() => addFeat()} variant="outline" className="border-primary/30 text-primary shrink-0">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          {/* Feat list */}
          <div className="space-y-2">
            {character.feats.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-secondary/30 rounded-lg p-2">
                <div className="flex-1">
                  <span className="font-cinzel text-sm font-semibold text-primary">{feat.name}</span>
                  {feat.description && (
                    <p className="text-xs text-muted-foreground font-crimson mt-0.5">{feat.description}</p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeFeat(idx)} className="text-destructive shrink-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {character.feats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 font-crimson">No feats selected yet</p>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}