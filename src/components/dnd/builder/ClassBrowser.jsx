import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLASS_DATABASE, CLASS_SOURCES } from '../../../lib/classDatabase';
import { SKILL_LIST, checkAllPrereqs } from '../../../lib/characterEngine';
import { ChevronRight, Plus, Minus } from 'lucide-react';

const SKILL_NAME_MAP = Object.fromEntries(SKILL_LIST.map(s => [s.id, s.name]));

// 11 PHB core classes — pinned at top of Base Classes
const PHB_CORE = [
  { helpId:'cHelpBbn', name:'Barbarian', source:"Player's Handbook", hd:12, skillsPerLevel:4, bab:'Good', fort:'Good', ref:'Poor', will:'Poor', spellcasting:null, alignmentReq:'Non-Lawful', classSkills:['kClimb','kHandleAnm','kIntim','kJump','kListen','kRide','kSurvival','kSwim'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpBrd', name:'Bard', source:"Player's Handbook", hd:6, skillsPerLevel:6, bab:'Medium', fort:'Poor', ref:'Good', will:'Good', spellcasting:'spontaneous (6th)', alignmentReq:'Non-Lawful', classSkills:['kAppraise','kBluff','kConcent','kDecScript','kDiplomacy','kDisguise','kEscape','kGatherInf','kHide','kIntim','kJump','kKnowArcan','kListen','kMoveSil','kPerfSing','kSenseMot','kSleight','kSpellcr','kSwim','kTumble','kUseMagic'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpClr', name:'Cleric', source:"Player's Handbook", hd:8, skillsPerLevel:2, bab:'Medium', fort:'Good', ref:'Poor', will:'Good', spellcasting:'divine (9th)', alignmentReq:null, classSkills:['kConcent','kDiplomacy','kHeal','kKnowArcan','kKnowHist','kKnowRel','kKnowPlane','kSpellcr'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpDrd', name:'Druid', source:"Player's Handbook", hd:8, skillsPerLevel:4, bab:'Medium', fort:'Good', ref:'Poor', will:'Good', spellcasting:'divine (9th)', alignmentReq:'Neutral', classSkills:['kConcent','kDiplomacy','kHandleAnm','kHeal','kKnowNat','kListen','kRide','kSpellcr','kSpot','kSurvival','kSwim'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpFtr', name:'Fighter', source:"Player's Handbook", hd:10, skillsPerLevel:2, bab:'Good', fort:'Good', ref:'Poor', will:'Poor', spellcasting:null, alignmentReq:null, classSkills:['kClimb','kHandleAnm','kIntim','kJump','kRide','kSwim'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpMnk', name:'Monk', source:"Player's Handbook", hd:8, skillsPerLevel:4, bab:'Medium', fort:'Good', ref:'Good', will:'Good', spellcasting:null, alignmentReq:'Lawful', classSkills:['kBalance','kClimb','kConcent','kDiplomacy','kEscape','kHide','kJump','kKnowRel','kListen','kMoveSil','kSenseMot','kSpot','kSwim','kTumble'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpPal', name:'Paladin', source:"Player's Handbook", hd:10, skillsPerLevel:2, bab:'Good', fort:'Good', ref:'Poor', will:'Poor', spellcasting:'divine (4th)', alignmentReq:'Lawful Good', classSkills:['kConcent','kDiplomacy','kHandleAnm','kHeal','kKnowNoble','kKnowRel','kRide','kSenseMot'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpRgr', name:'Ranger', source:"Player's Handbook", hd:8, skillsPerLevel:6, bab:'Good', fort:'Good', ref:'Good', will:'Poor', spellcasting:'divine (4th)', alignmentReq:null, classSkills:['kClimb','kConcent','kHandleAnm','kHeal','kHide','kJump','kKnowDun','kKnowGeog','kKnowNat','kListen','kMoveSil','kRide','kSearch','kSpot','kSurvival','kSwim','kUseRope'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpRog', name:'Rogue', source:"Player's Handbook", hd:6, skillsPerLevel:8, bab:'Medium', fort:'Poor', ref:'Good', will:'Poor', spellcasting:null, alignmentReq:null, classSkills:['kAppraise','kBalance','kBluff','kClimb','kDecScript','kDiplomacy','kDisable','kDisguise','kEscape','kForgery','kGatherInf','kHide','kIntim','kJump','kKnowLocal','kListen','kMoveSil','kOpenLock','kSearch','kSenseMot','kSleight','kSpot','kSwim','kTumble','kUseMagic','kUseRope'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpSor', name:'Sorcerer', source:"Player's Handbook", hd:4, skillsPerLevel:2, bab:'Poor', fort:'Poor', ref:'Poor', will:'Good', spellcasting:'arcane (9th)', alignmentReq:null, classSkills:['kBluff','kConcent','kKnowArcan','kSpellcr'], prereqs:[], classType:'Normal', isPHB:true },
  { helpId:'cHelpWiz', name:'Wizard', source:"Player's Handbook", hd:4, skillsPerLevel:2, bab:'Poor', fort:'Poor', ref:'Poor', will:'Good', spellcasting:'arcane (9th)', alignmentReq:null, classSkills:['kConcent','kDecScript','kKnowArcan','kSpellcr'], prereqs:[], classType:'Normal', isPHB:true },
];

const BAB_COLOR = { Good: 'text-green-400', Medium: 'text-yellow-400', Poor: 'text-red-400' };
const SAVE_COLOR = { Good: 'text-green-400', Poor: 'text-red-400' };

function PrereqIndicator({ result }) {
  if (result.meetsAll) return <span className="text-green-400 text-xs font-bold">✓</span>;
  if (result.unknown.length > 0 && result.failed.length === 0) return <span className="text-yellow-400 text-xs font-bold">⚠</span>;
  return <span className="text-red-400 text-xs font-bold">✗</span>;
}

function ClassDetail({ cls, character, onAdd, onRemove }) {
  const existing = character.classes.find(c => c.helpId === cls.helpId || c.name === cls.name);
  const currentLevels = existing?.levels || 0;
  const prereqResult = cls.prereqs?.length > 0 ? checkAllPrereqs(cls.prereqs, character) : null;
  const blocked = prereqResult && !prereqResult.meetsAll && prereqResult.failed.length > 0;

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-primary">{cls.name}</h2>
          <p className="text-xs text-muted-foreground font-crimson">{cls.source}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-crimson ${
          cls.classType === 'Prestige' ? 'bg-purple-900/30 text-purple-300' :
          cls.isPHB ? 'bg-blue-900/30 text-blue-300' : 'bg-secondary text-muted-foreground'
        }`}>
          {cls.classType === 'Prestige' ? 'Prestige' : cls.isPHB ? 'Core PHB' : 'Base'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs font-crimson">
        {[
          ['HD', `d${cls.hd}`],
          ['BAB', cls.bab],
          ['Fort', cls.fort],
          ['Ref', cls.ref],
          ['Will', cls.will],
          ['Skills/Lv', cls.skillsPerLevel ?? '—'],
        ].map(([label, val]) => (
          <div key={label} className="bg-secondary/40 rounded p-2 text-center">
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className={`font-semibold ${
              label === 'BAB' ? BAB_COLOR[val] || '' :
              (label === 'Fort' || label === 'Ref' || label === 'Will') ? SAVE_COLOR[val] || '' : ''
            }`}>{val}</div>
          </div>
        ))}
      </div>

      {cls.spellcasting && (
        <div className="text-xs font-crimson">
          <span className="text-muted-foreground">Spellcasting: </span>
          <span className="text-primary">{cls.spellcasting}</span>
        </div>
      )}
      {cls.alignmentReq && (
        <div className="text-xs font-crimson">
          <span className="text-muted-foreground">Alignment: </span>
          <span>{cls.alignmentReq}</span>
        </div>
      )}

      {/* Class Skills */}
      {cls.classSkills?.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-crimson">Class Skills</p>
          <div className="flex flex-wrap gap-1">
            {cls.classSkills.map(sk => (
              <span key={sk} className="text-xs bg-secondary/50 rounded px-1.5 py-0.5 font-crimson text-foreground/80">
                {SKILL_NAME_MAP[sk] || sk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {cls.prereqs?.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-crimson">Prerequisites</p>
          <div className="space-y-1">
            {cls.prereqs.map((p, i) => {
              const r = prereqResult?.all[i];
              return (
                <div key={i} className="flex items-start gap-2 text-xs font-crimson">
                  <span className="mt-0.5 shrink-0">
                    {r?.passed === true ? '✓' : r?.passed === false ? '✗' : '⚠'}
                  </span>
                  <span className={r?.passed === true ? 'text-green-400/80' : r?.passed === false ? 'text-red-400/80' : 'text-yellow-400/80'}>
                    {p.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Level controls */}
      <div className="pt-2 border-t border-border space-y-2">
        {currentLevels > 0 && (
          <p className="text-xs text-muted-foreground font-crimson text-center">
            Currently: {cls.name} {currentLevels}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => onAdd(cls)}
            disabled={false}
            className={`flex-1 font-cinzel ${blocked ? 'opacity-60' : ''}`}
            title={blocked ? `Unmet prereqs: ${prereqResult.failed.join(', ')}` : ''}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Level
            {blocked && ' (override)'}
          </Button>
          {currentLevels > 0 && (
            <Button onClick={() => onRemove(cls)} variant="outline" className="font-cinzel border-red-900/50 text-red-400 hover:bg-red-900/20">
              <Minus className="w-3 h-3 mr-1" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClassBrowser({ character, updateCharacter }) {
  const [typeFilter, setTypeFilter] = useState('Base');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const allSources = useMemo(() => {
    const srcs = [...new Set(CLASS_DATABASE.map(c => c.source))].sort();
    return srcs;
  }, []);

  // Combine PHB + CLASS_DATABASE
  const allClasses = useMemo(() => {
    const filtered = CLASS_DATABASE.filter(c => !PHB_CORE.find(p => p.helpId === c.helpId));
    return filtered;
  }, []);

  const displayClasses = useMemo(() => {
    let list = typeFilter === 'Prestige'
      ? allClasses.filter(c => c.classType === 'Prestige')
      : typeFilter === 'Base'
      ? allClasses.filter(c => c.classType !== 'Prestige')
      : allClasses;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.source?.toLowerCase().includes(q));
    }
    if (sourceFilter !== 'all') list = list.filter(c => c.source === sourceFilter);

    if (typeFilter === 'Prestige' || typeFilter === 'All') {
      // Sort prestige: available first, then unknown, then unavailable
      list = [...list].sort((a, b) => {
        const getScore = cls => {
          if (!cls.prereqs?.length) return 0;
          const r = checkAllPrereqs(cls.prereqs, character);
          if (r.meetsAll) return 0;
          if (r.failed.length === 0) return 1; // unknown only
          return 2; // failed
        };
        const sa = getScore(a), sb = getScore(b);
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name);
      });
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [allClasses, typeFilter, search, sourceFilter, character]);

  const showPHB = typeFilter === 'Base' || typeFilter === 'All';
  const phbFiltered = useMemo(() => {
    if (!showPHB) return [];
    let list = [...PHB_CORE];
    if (search.trim()) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [showPHB, search]);

  const handleAdd = (cls) => {
    updateCharacter(prev => {
      const classes = [...(prev.classes || [])];
      const idx = classes.findIndex(c => c.helpId === cls.helpId || c.name === cls.name);
      const totalLevel = classes.reduce((s, c) => s + (c.levels || 0), 0);
      if (totalLevel >= 20) return prev;
      if (idx >= 0) {
        classes[idx] = { ...classes[idx], levels: (classes[idx].levels || 0) + 1 };
      } else {
        classes.push({ ...cls, levels: 1 });
      }
      return { ...prev, classes };
    });
  };

  const handleRemove = (cls) => {
    updateCharacter(prev => {
      let classes = [...(prev.classes || [])];
      const idx = classes.findIndex(c => c.helpId === cls.helpId || c.name === cls.name);
      if (idx < 0) return prev;
      const lvs = (classes[idx].levels || 0) - 1;
      if (lvs <= 0) classes.splice(idx, 1);
      else classes[idx] = { ...classes[idx], levels: lvs };
      return { ...prev, classes };
    });
  };

  const getRowIndicator = (cls) => {
    if (!cls.prereqs?.length) return null;
    const r = checkAllPrereqs(cls.prereqs, character);
    if (r.meetsAll) return <span className="text-green-400 text-xs">✓</span>;
    if (r.failed.length === 0) return <span className="text-yellow-400 text-xs">⚠</span>;
    return <span className="text-red-400 text-xs">✗</span>;
  };

  const ClassRow = ({ cls, pinned }) => {
    const existing = character.classes?.find(c => c.helpId === cls.helpId || c.name === cls.name);
    return (
      <button
        onClick={() => setSelected(cls)}
        className={`w-full text-left px-3 py-2 rounded hover:bg-secondary/70 transition-all flex items-center gap-2 ${
          selected?.helpId === cls.helpId ? 'bg-primary/10 border border-primary/30' : ''
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-crimson text-sm font-semibold text-foreground truncate">{cls.name}</span>
            {existing && <span className="text-xs text-primary font-cinzel shrink-0">Lv{existing.levels}</span>}
          </div>
          <div className="text-xs text-muted-foreground font-crimson truncate">{cls.source} • d{cls.hd} • {cls.bab} BAB</div>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          {getRowIndicator(cls)}
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </div>
      </button>
    );
  };

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Left panel */}
      <div className="w-64 shrink-0 flex flex-col gap-2">
        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border text-xs font-cinzel">
          {['Base', 'Prestige', 'All'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-1 py-1.5 ${typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search classes…"
          className="h-8 text-xs bg-secondary/50 font-crimson"
        />
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-8 text-xs bg-secondary/50 font-crimson"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">All Sources</SelectItem>
            {allSources.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Class list */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {showPHB && phbFiltered.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground font-cinzel px-1 py-1 uppercase tracking-wide">Core (PHB)</p>
              {phbFiltered.map(cls => <ClassRow key={cls.helpId} cls={cls} pinned />)}
              {displayClasses.length > 0 && (
                <p className="text-xs text-muted-foreground font-cinzel px-1 py-1 uppercase tracking-wide mt-2">Other Classes</p>
              )}
            </>
          )}
          {displayClasses.map(cls => <ClassRow key={cls.helpId} cls={cls} />)}
          {displayClasses.length === 0 && phbFiltered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8 font-crimson">No classes match your filters.</p>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-secondary/20 rounded-lg border border-border overflow-hidden">
        {selected ? (
          <ClassDetail cls={selected} character={character} onAdd={handleAdd} onRemove={handleRemove} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-crimson text-sm">
            Select a class to view details
          </div>
        )}
      </div>
    </div>
  );
}