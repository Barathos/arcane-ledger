import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoStep from './builder/BasicInfoStep';
import RaceStep from './builder/RaceStep';
import ClassStep from './builder/ClassStep';
import AbilityStep from './builder/AbilityStep';
import HitPointsStep from './builder/HitPointsStep';
import SkillsStep from './builder/SkillsStep';
import FeatsStep from './builder/FeatsStep';
import SpellsStep from './builder/SpellsStep';
import EquipmentStep from './builder/EquipmentStep';
import CombatStatsStep from './builder/CombatStatsStep';

const STEPS = [
  { id: 'basic', label: 'Basic' },
  { id: 'race', label: 'Race' },
  { id: 'class', label: 'Class' },
  { id: 'abilities', label: 'Abilities' },
  { id: 'hp', label: 'HP' },
  { id: 'skills', label: 'Skills' },
  { id: 'feats', label: 'Feats' },
  { id: 'spells', label: 'Spells' },
  { id: 'equipment', label: 'Equip' },
  { id: 'combat', label: 'Combat' },
];

export default function CharacterBuilder({ character, updateCharacter }) {
  const [step, setStep] = useState('basic');

  return (
    <Tabs value={step} onValueChange={setStep}>
      <TabsList className="bg-secondary/50 border border-border flex flex-wrap h-auto gap-1 p-1">
        {STEPS.map(s => (
          <TabsTrigger key={s.id} value={s.id} className="font-crimson text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        <TabsContent value="basic"><BasicInfoStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="race"><RaceStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="class"><ClassStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="abilities"><AbilityStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="hp"><HitPointsStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="skills"><SkillsStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="feats"><FeatsStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="spells"><SpellsStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="equipment"><EquipmentStep character={character} updateCharacter={updateCharacter} /></TabsContent>
        <TabsContent value="combat"><CombatStatsStep character={character} updateCharacter={updateCharacter} /></TabsContent>
      </div>
    </Tabs>
  );
}