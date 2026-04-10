import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import {
  getDerivedStats, getAbilityScores, getAbilityMods, getSkillTotals,
  SKILL_LIST, ABILITY_KEYS, formatModifier, getTotalLevel,
} from '../../lib/characterEngine';
import SectionCard from './SectionCard';
import { Tooltip, StatBreakdown, FeatTooltipContent, getStatBreakdown } from './SheetTooltips';

const ABILITY_LABELS = { str:'STR', dex:'DEX', con:'CON', int:'INT', wis:'WIS', cha:'CHA' };
const fmt = (v) => v >= 0 ? `+${v}` : `${v}`;

function StatTooltip({ char, stat, children }) {
  const breakdown = getStatBreakdown(char, stat);
  if (!breakdown) return <>{children}</>;
  return (
    <Tooltip content={<StatBreakdown {...breakdown} />}>
      {children}
    </Tooltip>
  );
}

export default function CharacterSheet({ character }) {
  const char = character;
  const stats   = getDerivedStats(char);
  const scores  = getAbilityScores(char);
  const mods    = getAbilityMods(char);
  const skills  = getSkillTotals(char);
  const totalLevel = getTotalLevel(char);

  const classStr = (char.classes || []).map(c => `${c.name} ${c.levels || c.level || 1}`).join(' / ') || 'No class';
  const raceName = char.race?.name || char.race || '—';

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()} variant="outline" className="border-primary/30 text-primary">
          <Printer className="w-4 h-4 mr-2" /> Print Character Sheet
        </Button>
      </div>

      {/* Header */}
      <SectionCard>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm font-crimson">
          <div><span className="text-xs text-muted-foreground block">Name</span><span className="font-cinzel font-bold text-primary text-lg">{char.name || 'Unnamed'}</span></div>
          <div><span className="text-xs text-muted-foreground block">Class/Level</span><span className="font-semibold">{classStr}</span></div>
          <div><span className="text-xs text-muted-foreground block">Race</span><span className="font-semibold">{raceName}</span></div>
          <div><span className="text-xs text-muted-foreground block">Alignment</span><span>{char.alignment}</span></div>
          <div><span className="text-xs text-muted-foreground block">Deity</span><span>{char.deity || '—'}</span></div>
          <div><span className="text-xs text-muted-foreground block">Size</span><span>{stats.size}</span></div>
        </div>
      </SectionCard>

      {/* Ability Scores */}
      <SectionCard title="Ability Scores">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ABILITY_KEYS.map(ab => (
            <div key={ab} className="text-center bg-secondary/30 rounded-lg p-2 border border-border">
              <div className="font-cinzel text-xs font-bold text-primary mb-1">{ABILITY_LABELS[ab]}</div>
              <Tooltip content={<StatBreakdown {...getStatBreakdown(char, ab)} />}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', cursor: 'help',
                              borderBottom: '1px dotted rgba(255,200,50,0.3)', display: 'inline-block' }}>
                  {scores[ab]}
                </div>
              </Tooltip>
              <div className={`text-sm font-semibold mt-0.5 ${mods[ab] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <Tooltip content={<StatBreakdown {...getStatBreakdown(char, ab + 'Mod')} />}>
                  <div style={{ cursor: 'help', borderBottom: '1px dotted rgba(255,200,50,0.3)', display: 'inline-block' }}>
                    {fmt(mods[ab])}
                  </div>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Combat */}
      <SectionCard title="Combat">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center text-sm font-crimson">

          <div className="bg-red-900/20 rounded-lg p-2 border border-red-900/30">
            <div className="text-xs text-red-300">HP</div>
            <div className="text-xl font-cinzel font-bold text-red-400">
              {stats.currentHP} / <StatTooltip char={char} stat="hp">{stats.maxHP}</StatTooltip>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">AC</div>
            <div className="text-xl font-cinzel font-bold text-primary">
              <StatTooltip char={char} stat="ac">{stats.ac}</StatTooltip>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Touch / FF</div>
            <div className="font-cinzel font-bold text-primary">
              <StatTooltip char={char} stat="touchAC">{stats.touchAC}</StatTooltip>
              {' / '}
              <StatTooltip char={char} stat="flatFootAC">{stats.flatFootAC}</StatTooltip>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Initiative</div>
            <div className="text-xl font-cinzel font-bold">
              <StatTooltip char={char} stat="initiative">{fmt(stats.initiative)}</StatTooltip>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Speed</div>
            <div className="font-cinzel font-bold">
              <StatTooltip char={char} stat="speed">{stats.speed}</StatTooltip> ft
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">BAB</div>
            <div className="text-xl font-cinzel font-bold text-red-400">
              {fmt(stats.totalBAB)}
              {stats.attacks?.length > 1 && (
                <span className="text-sm ml-1 text-muted-foreground">
                  ({stats.attacks.map(a => fmt(a)).join('/')})
                </span>
              )}
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Melee</div>
            <div className="font-cinzel font-bold">
              <StatTooltip char={char} stat="melee">{fmt(stats.meleeAtk)}</StatTooltip>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">Ranged</div>
            <div className="font-cinzel font-bold">
              <StatTooltip char={char} stat="ranged">{fmt(stats.rangedAtk)}</StatTooltip>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-2 border border-border">
            <div className="text-xs text-muted-foreground">CMB</div>
            <div className="font-cinzel font-bold">
              <StatTooltip char={char} stat="cmb">{fmt(stats.cmb)}</StatTooltip>
            </div>
          </div>

          <div className="bg-green-900/20 rounded-lg p-2 border border-green-900/30">
            <div className="text-xs text-green-300">Fort</div>
            <div className="font-cinzel font-bold text-green-400">
              <StatTooltip char={char} stat="fort">{fmt(stats.fort)}</StatTooltip>
            </div>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-900/30">
            <div className="text-xs text-blue-300">Ref</div>
            <div className="font-cinzel font-bold text-blue-400">
              <StatTooltip char={char} stat="ref">{fmt(stats.ref)}</StatTooltip>
            </div>
          </div>

          <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-900/30">
            <div className="text-xs text-purple-300">Will</div>
            <div className="font-cinzel font-bold text-purple-400">
              <StatTooltip char={char} stat="will">{fmt(stats.will)}</StatTooltip>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5 text-xs font-crimson">
          {skills.filter(s => s.ranks > 0 || s.miscMod !== 0 || s.isClass).map(skill => (
            <div key={skill.id} className="flex justify-between py-0.5 border-b border-border/30">
              <span className={skill.isClass ? 'text-primary' : 'text-foreground'}>
                {skill.isClass && '● '}{skill.name}
              </span>
              <span className="font-semibold">
                {fmt(skill.total)}
                <span className="text-muted-foreground ml-1">
                  ({skill.ranks}r {fmt(skill.abilityMod)}ab{skill.miscMod ? ` ${fmt(skill.miscMod)}m` : ''})
                </span>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Feats */}
      <SectionCard title="Feats">
        <div className="flex flex-wrap gap-2">
          {(char.feats || []).map((feat, i) => (
            <div key={i} className={`border rounded px-3 py-1 ${feat.override ? 'bg-yellow-900/15 border-yellow-700/40' : 'bg-primary/10 border-primary/20'}`}>
              <span className="font-cinzel text-xs text-primary font-semibold">
                <Tooltip content={<FeatTooltipContent feat={feat} />} wide={true}>
                  <span>{feat.name}</span>
                </Tooltip>
              </span>
              {feat.weaponId && <span className="text-xs text-muted-foreground ml-1">({feat.weaponId})</span>}
              {feat.override && (
                <span className="ml-1 text-xs text-yellow-400" title={feat.overrideReason || 'Override — no reason given'}>⚠ Override{feat.overrideReason ? `: ${feat.overrideReason}` : ''}</span>
              )}
            </div>
          ))}
          {(char.feats || []).length === 0 && <p className="text-xs text-muted-foreground">None</p>}
        </div>
      </SectionCard>

      {/* Equipment */}
      <SectionCard title="Equipment">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-crimson">
          <div>
            <p className="text-primary font-cinzel text-xs font-semibold mb-1">Weapons</p>
            {(char.equipment?.weapons || []).map((w, i) => (
              <div key={i} className="text-foreground">{w.name}{w.damage ? ` — ${w.damage}` : ''}{w.critRange ? ` (${w.critRange})` : ''}</div>
            ))}
          </div>
          <div>
            <p className="text-primary font-cinzel text-xs font-semibold mb-1">Armor</p>
            {char.equipment?.armor && (
              <div className="text-foreground">{char.equipment.armor.name} — AC+{char.equipment.armor.acBonus}</div>
            )}
            {char.equipment?.shield && (
              <div className="text-foreground">{char.equipment.shield.name} — AC+{char.equipment.shield.acBonus}</div>
            )}
          </div>
          <div>
            <p className="text-primary font-cinzel text-xs font-semibold mb-1">Gear</p>
            {(char.equipment?.gear || []).map((g, i) => (
              <div key={i} className="text-foreground">{g.name} x{g.qty || g.quantity || 1}</div>
            ))}
          </div>
        </div>
        <div className="mt-2 text-xs font-crimson text-muted-foreground">
          {(() => {
            const c = char.equipment?.currency || { pp:0, gp:0, sp:0, cp:0 };
            return `Money: ${c.pp}pp ${c.gp}gp ${c.sp}sp ${c.cp}cp`;
          })()}
        </div>
      </SectionCard>

      {/* Notes */}
      <SectionCard title="Notes">
        <p className="text-sm font-crimson text-foreground whitespace-pre-wrap">{char.notes || 'No notes.'}</p>
      </SectionCard>
    </div>
  );
}