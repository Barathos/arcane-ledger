import { useState } from 'react';
import { getDerivedStats, getSkillTotals, SKILL_LIST, getCustomModSum } from '../../../lib/characterEngine';
import SectionCard from '../SectionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

const BONUS_TYPES = [
  'untyped','enhancement','luck','circumstance','competence',
  'sacred','profane','morale','insight','alchemical',
];

// All stats that can receive a modifier
const STAT_OPTIONS = [
  { group: 'Ability Scores',
    stats: [
      { id:'str', label:'Strength' }, { id:'dex', label:'Dexterity' },
      { id:'con', label:'Constitution' }, { id:'int', label:'Intelligence' },
      { id:'wis', label:'Wisdom' }, { id:'cha', label:'Charisma' },
    ]
  },
  { group: 'Combat',
    stats: [
      { id:'ac', label:'Armor Class' }, { id:'deflection', label:'AC (Deflection)' },
      { id:'naturalArmor', label:'Natural Armor' }, { id:'initiative', label:'Initiative' },
      { id:'meleeAttack', label:'Melee Attack' }, { id:'rangedAttack', label:'Ranged Attack' },
      { id:'cmb', label:'CMB (Grapple/Trip)' }, { id:'speed', label:'Speed (ft)' },
      { id:'maxHP', label:'Max HP' },
    ]
  },
  { group: 'Saving Throws',
    stats: [
      { id:'fort', label:'Fortitude' }, { id:'ref', label:'Reflex' }, { id:'will', label:'Will' },
    ]
  },
  { group: 'Other',
    stats: [
      { id:'featSlots', label:'Bonus Feat Slots' },
      { id:'spellDC', label:'Spell Save DC (all)' },
      { id:'sr', label:'Spell Resistance' },
    ]
  },
  { group: 'Skills',
    stats: SKILL_LIST.map(s => ({ id: s.id, label: s.name }))
  },
];

const ALL_STATS = STAT_OPTIONS.flatMap(g => g.stats);

function getStatLabel(id) {
  return ALL_STATS.find(s => s.id === id)?.label || id;
}

function getCurrentTotal(character, statId) {
  const stats = getDerivedStats(character);
  const skills = getSkillTotals(character);

  // Ability scores
  if (['str','dex','con','int','wis','cha'].includes(statId)) return stats.scores[statId];
  // Combat/saves
  const map = {
    ac: stats.ac, deflection: null, naturalArmor: null,
    initiative: stats.initiative, meleeAttack: stats.meleeAtk,
    rangedAttack: stats.rangedAtk, cmb: stats.cmb, speed: stats.speed,
    maxHP: stats.maxHP, fort: stats.fort, ref: stats.ref, will: stats.will,
  };
  if (statId in map && map[statId] !== null) return map[statId];
  // Skills
  const skill = skills.find(s => s.id === statId);
  if (skill) return skill.total;
  return null;
}

export default function ModifiersStep({ character, updateCharacter }) {
  const [newStat, setNewStat] = useState('str');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newType, setNewType] = useState('untyped');

  const mods = character.customMods || [];

  const addMod = () => {
    if (!newStat || newValue === '' || !newReason.trim()) return;
    const mod = {
      id: `mod_${Date.now()}`,
      stat: newStat,
      value: parseInt(newValue) || 0,
      reason: newReason.trim(),
      type: newType,
    };
    updateCharacter({ customMods: [...mods, mod] });
    setNewValue('');
    setNewReason('');
  };

  const removeMod = (id) => {
    updateCharacter({ customMods: mods.filter(m => m.id !== id) });
  };

  // Group active mods by stat for the summary view
  const modsByStat = {};
  mods.forEach(m => {
    if (!modsByStat[m.stat]) modsByStat[m.stat] = [];
    modsByStat[m.stat].push(m);
  });

  return (
    <div className="space-y-4">
      {/* Add new modifier */}
      <SectionCard title="Add Modifier">
        <p className="text-xs text-muted-foreground font-crimson mb-3">
          Add custom bonuses or penalties from magic items, spells, conditions, or DM rulings.
          These apply on top of all other calculations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
          {/* Stat selector */}
          <div>
            <label className="text-xs text-muted-foreground font-crimson">Stat</label>
            <Select value={newStat} onValueChange={setNewStat}>
              <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {STAT_OPTIONS.map(group => (
                  <div key={group.group}>
                    <div className="px-2 py-1 text-xs text-muted-foreground font-cinzel border-t border-border first:border-0">
                      {group.group}
                    </div>
                    {group.stats.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs font-crimson pl-4">
                        {s.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value */}
          <div>
            <label className="text-xs text-muted-foreground font-crimson">Value</label>
            <Input
              type="number"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="+2 or -1"
              className="h-8 text-xs bg-secondary/50 font-crimson"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs text-muted-foreground font-crimson">Reason / Source</label>
            <Input
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
              placeholder="Ring of Protection +2"
              className="h-8 text-xs bg-secondary/50 font-crimson"
              onKeyDown={e => e.key === 'Enter' && addMod()}
            />
          </div>

          {/* Bonus type */}
          <div>
            <label className="text-xs text-muted-foreground font-crimson">Bonus Type</label>
            <div className="flex gap-2">
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BONUS_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="text-xs font-crimson capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={addMod}
                disabled={!newValue || !newReason.trim()}
                className="h-8 px-3 font-cinzel"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 font-crimson mt-2">
          Note: Same bonus types (except untyped) don't stack in D&D 3.5 — only the highest applies.
          This tracker shows all modifiers; stacking rules are your responsibility.
        </p>
      </SectionCard>

      {/* Active modifiers list */}
      {mods.length > 0 && (
        <SectionCard title={`Active Modifiers (${mods.length})`}>
          <div className="space-y-1">
            {mods.map(mod => {
              const currentTotal = getCurrentTotal(character, mod.stat);
              return (
                <div
                  key={mod.id}
                  className="flex items-center gap-3 px-3 py-2 rounded bg-secondary/30 hover:bg-secondary/50 group"
                >
                  {/* Value badge */}
                  <span className={`font-cinzel font-bold text-sm w-10 text-center shrink-0 ${
                    mod.value > 0 ? 'text-green-400' : mod.value < 0 ? 'text-red-400' : 'text-muted-foreground'
                  }`}>
                    {mod.value > 0 ? '+' : ''}{mod.value}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-crimson text-sm text-foreground">{mod.reason}</span>
                      <span className="text-xs text-muted-foreground font-crimson">→ {getStatLabel(mod.stat)}</span>
                      {mod.type !== 'untyped' && (
                        <span className="text-xs bg-secondary/60 rounded px-1.5 py-0.5 font-crimson capitalize text-muted-foreground">
                          {mod.type}
                        </span>
                      )}
                    </div>
                    {currentTotal !== null && (
                      <div className="text-xs text-muted-foreground font-crimson mt-0.5">
                        Current {getStatLabel(mod.stat)}: <span className="text-primary">{currentTotal >= 0 && !['str','dex','con','int','wis','cha','maxHP','speed','sr'].includes(mod.stat) ? '+' : ''}{currentTotal}</span>
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeMod(mod.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary by stat */}
          {Object.keys(modsByStat).length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground font-cinzel mb-2">SUMMARY BY STAT</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(modsByStat).map(([statId, statMods]) => {
                  const total = statMods.reduce((s, m) => s + m.value, 0);
                  return (
                    <div key={statId} className="bg-secondary/20 rounded px-2 py-1.5 text-xs font-crimson">
                      <div className="text-muted-foreground">{getStatLabel(statId)}</div>
                      <div className={`font-bold font-cinzel ${total > 0 ? 'text-green-400' : total < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {total > 0 ? '+' : ''}{total}
                        <span className="text-muted-foreground font-normal ml-1">
                          ({statMods.length} mod{statMods.length > 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {mods.length === 0 && (
        <SectionCard title="Active Modifiers">
          <p className="text-center text-muted-foreground font-crimson py-6 text-sm">
            No custom modifiers applied. Use the form above to add magic item bonuses, spell effects, or DM rulings.
          </p>
        </SectionCard>
      )}
    </div>
  );
}