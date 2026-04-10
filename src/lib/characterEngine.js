// ============================================================
// D&D 3.5 Character Engine — Complete layered calculation system
// Single source of truth. Never store derived values.
// ============================================================

import { getFeatDatabase, getFeatById } from './featDatabase';

// ─── PART 1: Default Character State ─────────────────────────────────────────

export function getDefaultCharacter() {
  return {
    name: '', playerName: '', campaign: '', deity: '',
    alignment: 'True Neutral',
    age: '', gender: '', height: '', weight: '', eyes: '', hair: '', skin: '',
    notes: '', xp: 0,

    // Race — full race object from RACE_DATABASE once selected
    race: null,

    // Classes — array for multiclassing support
    // Each: { helpId, name, levels, hd, bab, fort, ref, will, skillsPerLevel,
    //         classSkills[], spellcasting, spellLevelsMax, classType }
    classes: [],

    // Base ability scores (before any modifiers)
    baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },

    // +1 increases from leveling (1 per 4 levels)
    abilityIncreases: [], // [{atLevel:4, stat:'str'}, ...]

    // HP — one roll per character level
    hp: {
      rolls: [], // [{level:1, classHD:8, value:8}, ...]
      tempHP: 0,
      nonlethalDamage: 0,
      currentDamage: 0,
    },

    // Skills
    skillRanks: {},  // { kTumble:5, kHide:3, ... }
    skillMisc: {},   // misc bonuses per skill

    // Feats
    feats: [], // [{id, name, takenAtLevel, weaponId}]

    // Domains (Cleric only)
    domains: [],

    // Spells per class
    spells: {}, // { classHelpId: { prepared:[], known:[] } }

    // Equipment
    equipment: {
      weapons: [],  // [{name,damage,critRange,damageType,range,attackBonus,weight,qty,notes}]
      armor: null,  // {name,acBonus,maxDex,acp,spellFail,type,weight}
      shield: null, // {name,acBonus,acp,spellFail,weight}
      gear: [],     // [{name,weight,qty,value}]
      currency: { pp: 0, gp: 0, sp: 0, cp: 0 },
    },

    // Misc modifiers
    miscMods: {
      str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0,
      ac: 0, naturalArmor: 0, deflection: 0, initiative: 0,
      fort: 0, ref: 0, will: 0,
      meleeAttack: 0, rangedAttack: 0, speed: 0,
    },

    // Play mode state
    conditions: [],
    combatants: [],
    currentTurn: 0,
    roundNumber: 1,
    diceHistory: [],
    spellSlotsUsed: {},
  };
}

// ─── PART 2: Ability Score Engine ────────────────────────────────────────────

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export function getTotalLevel(char) {
  return (char.classes || []).reduce((sum, c) => sum + (c.levels || 0), 0);
}

export function getAbilityScores(char) {
  const base = char.baseAbilities;
  const racial = char.race?.abilityMods || { str:0, dex:0, con:0, int:0, wis:0, cha:0 };
  const totalLevel = getTotalLevel(char);
  const misc = char.miscMods || {};

  const increases = { str:0, dex:0, con:0, int:0, wis:0, cha:0 };
  (char.abilityIncreases || []).forEach(inc => {
    if (inc.atLevel <= totalLevel && increases[inc.stat] !== undefined) {
      increases[inc.stat]++;
    }
  });

  const result = {};
  for (const s of ABILITY_KEYS) {
    result[s] = (base[s] || 10) + (racial[s] || 0) + increases[s] + (misc[s] || 0);
  }
  return result;
}

export function getAbilityMod(score) {
  return Math.floor((score - 10) / 2);
}

export function getAbilityMods(char) {
  const scores = getAbilityScores(char);
  const mods = {};
  for (const s of ABILITY_KEYS) mods[s] = getAbilityMod(scores[s]);
  return mods;
}

export function getAvailableAbilityIncreases(char) {
  const total = getTotalLevel(char);
  const available = Math.floor(total / 4);
  const used = (char.abilityIncreases || []).filter(i => i.atLevel <= total).length;
  return available - used;
}

// ─── PART 3: Class & Level Engine ────────────────────────────────────────────

export const BAB_TABLE = {
  Good:   [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  Medium: [0,1,2,3,3,4,5,6,6,7,8,9,9,10,11,12,12,13,14,15],
  Poor:   [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10],
};

export const SAVE_TABLE = {
  Good: [2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12],
  Poor: [0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6],
};

export const SIZE_ATTACK_MOD = { Fine:4, Diminutive:2, Tiny:2, Small:1, Medium:0, Large:-1, Huge:-2, Gargantuan:-4, Colossal:-8 };
export const SIZE_AC_MOD     = { Fine:8, Diminutive:4, Tiny:2, Small:1, Medium:0, Large:-1, Huge:-2, Gargantuan:-4, Colossal:-8 };
export const SIZE_HIDE_MOD   = { Fine:16, Diminutive:12, Tiny:8, Small:4, Medium:0, Large:-4, Huge:-8, Gargantuan:-12, Colossal:-16 };
export const SIZE_CMB_MOD    = { Fine:-8, Diminutive:-4, Tiny:-2, Small:-1, Medium:0, Large:1, Huge:2, Gargantuan:4, Colossal:8 };
export const SIZE_VALUE      = { Fine:-4, Diminutive:-3, Tiny:-2, Small:-1, Medium:0, Large:1, Huge:2, Gargantuan:3, Colossal:4 };

export function getClassStats(char) {
  const mods = getAbilityMods(char);
  const intMod = mods.int;
  const isHuman = char.race?.name === 'Human' || char.race?.id === 'rHuman2';

  let totalBAB = 0, totalFort = 0, totalRef = 0, totalWill = 0;
  let totalSkillPoints = 0;
  const classSkillSet = new Set();
  let isFirstClass = true;

  (char.classes || []).forEach(cls => {
    const lv = Math.max(0, Math.min(cls.levels || 0, 20));
    if (lv < 1) return;

    // BAB: sum per-level deltas
    const babArr = BAB_TABLE[cls.bab] || BAB_TABLE['Poor'];
    for (let i = 0; i < lv; i++) {
      const curr = babArr[i] ?? 0;
      const prev = i > 0 ? babArr[i-1] ?? 0 : 0;
      totalBAB += curr - prev;
    }

    // Saves: table value at class level (RAW multiclass stacking)
    totalFort += SAVE_TABLE[cls.fort]?.[lv-1] ?? 0;
    totalRef  += SAVE_TABLE[cls.ref ]?.[lv-1] ?? 0;
    totalWill += SAVE_TABLE[cls.will]?.[lv-1] ?? 0;

    // Skill points
    const spBase = Math.max(1, (cls.skillsPerLevel || 2) + intMod + (isHuman ? 1 : 0));
    totalSkillPoints += spBase * lv;
    if (isFirstClass) { totalSkillPoints += spBase * 3; isFirstClass = false; }

    (cls.classSkills || []).forEach(sk => classSkillSet.add(sk));
  });

  // Racial HD skill points
  const rHD = char.race?.racialHD || 0;
  if (rHD > 0) {
    totalSkillPoints += Math.max(1, 2 + intMod) * (rHD + 3);
  }

  // Iterative attacks
  const attacks = [];
  for (let atk = totalBAB; atk > 0; atk -= 5) attacks.push(atk);

  return {
    totalLevel: getTotalLevel(char),
    totalBAB, attacks,
    baseFort: totalFort, baseRef: totalRef, baseWill: totalWill,
    totalSkillPoints,
    classSkills: [...classSkillSet],
  };
}

// ─── PART 4: Derived Stats Engine ────────────────────────────────────────────

export function calculateMaxHP(char) {
  const mods = getAbilityMods(char);
  const rolls = char.hp?.rolls || [];
  if (rolls.length === 0) return Math.max(1, mods.con);
  return Math.max(1, rolls.reduce((sum, r) => sum + r.value, 0) + mods.con * rolls.length);
}

export function getHPStatus(current, max, con) {
  if (current <= -con) return 'Dead';
  if (current < 0)     return 'Unconscious';
  if (current === 0)   return 'Disabled';
  if (current < max * 0.25) return 'Bloodied';
  if (current < max * 0.5)  return 'Wounded';
  return 'Healthy';
}

export function calculateTotalWeight(char) {
  const wepWeight = (char.equipment?.weapons || []).reduce((s,w) => s+(w.weight||0)*(w.qty||1), 0);
  const armorWeight = (char.equipment?.armor?.weight || 0) + (char.equipment?.shield?.weight || 0);
  const gearWeight = (char.equipment?.gear || []).reduce((s,g) => s+(g.weight||0)*(g.qty||1), 0);
  return wepWeight + armorWeight + gearWeight;
}

export function getDerivedStats(char) {
  const scores = getAbilityScores(char);
  const mods   = getAbilityMods(char);
  const cls    = getClassStats(char);
  const race   = char.race;
  const misc   = char.miscMods || {};
  const size   = race?.size || char.size || 'Medium';

  // HP
  const maxHP = calculateMaxHP(char);
  const currentHP = maxHP - (char.hp?.currentDamage || 0);

  // Armor
  const armorBonus  = char.equipment?.armor?.acBonus  || 0;
  const shieldBonus = char.equipment?.shield?.acBonus || 0;

  // AC
  const ac = 10 + armorBonus + shieldBonus + mods.dex
           + (SIZE_AC_MOD[size]||0)
           + (race?.naturalArmor||0) + (misc.naturalArmor||0)
           + (misc.deflection||0) + (misc.ac||0);
  const touchAC    = 10 + mods.dex + (SIZE_AC_MOD[size]||0) + (misc.deflection||0);
  const flatFootAC = 10 + armorBonus + shieldBonus + (SIZE_AC_MOD[size]||0)
                   + (race?.naturalArmor||0) + (misc.naturalArmor||0) + (misc.deflection||0);

  // Saves
  const fort = cls.baseFort + mods.con + (misc.fort||0);
  const ref  = cls.baseRef  + mods.dex + (misc.ref ||0);
  const will = cls.baseWill + mods.wis + (misc.will||0);

  // Attacks
  const sizeMod  = SIZE_ATTACK_MOD[size] || 0;
  const meleeAtk = cls.totalBAB + mods.str + sizeMod + (misc.meleeAttack||0);
  const rangedAtk= cls.totalBAB + mods.dex + sizeMod + (misc.rangedAttack||0);
  const cmb      = cls.totalBAB + mods.str + (SIZE_CMB_MOD[size]||0);

  // Speed
  const baseSpeed    = race?.speed || 30;
  const heavyArmor   = char.equipment?.armor?.type === 'heavy';
  const armorPenalty = (heavyArmor && baseSpeed >= 30) ? 10 : 0;
  const speed        = baseSpeed - armorPenalty + (misc.speed||0);

  // Initiative
  const initiative = mods.dex + (misc.initiative||0);

  // Skill caps
  const maxClassRanks = cls.totalLevel + 3;
  const maxCrossRanks = Math.floor(maxClassRanks / 2);

  // Weight/encumbrance
  const totalWeight = calculateTotalWeight(char);
  const carryMed  = scores.str * 20;
  const carryHvy  = scores.str * 30;

  const spentSkillPoints = getSkillPointsSpent(char);

  return {
    scores, mods,
    maxHP, currentHP, tempHP: char.hp?.tempHP || 0,
    nonlethal: char.hp?.nonlethalDamage || 0,
    hpStatus: getHPStatus(currentHP, maxHP, scores.con),
    ac, touchAC, flatFootAC,
    fort, ref, will,
    baseFort: cls.baseFort, baseRef: cls.baseRef, baseWill: cls.baseWill,
    meleeAtk, rangedAtk, cmb, attacks: cls.attacks,
    totalBAB: cls.totalBAB,
    initiative, speed,
    totalLevel: cls.totalLevel,
    maxClassRanks, maxCrossRanks,
    classSkills: cls.classSkills,
    totalSkillPoints: cls.totalSkillPoints,
    spentSkillPoints,
    remainingSkillPoints: cls.totalSkillPoints - spentSkillPoints,
    totalWeight, carryMed, carryHvy,
    sizeValue: SIZE_VALUE[size] || 0,
    size,
  };
}

// ─── PART 5: Skill Engine ─────────────────────────────────────────────────────

export const SKILL_LIST = [
  { id:'kAppraise',   name:'Appraise',                 ability:'int', trained:false },
  { id:'kBalance',    name:'Balance',                   ability:'dex', trained:false },
  { id:'kBluff',      name:'Bluff',                     ability:'cha', trained:false },
  { id:'kClimb',      name:'Climb',                     ability:'str', trained:false },
  { id:'kConcent',    name:'Concentration',             ability:'con', trained:false },
  { id:'kDecScript',  name:'Decipher Script',           ability:'int', trained:true  },
  { id:'kDiplomacy',  name:'Diplomacy',                 ability:'cha', trained:false },
  { id:'kDisable',    name:'Disable Device',            ability:'int', trained:true  },
  { id:'kDisguise',   name:'Disguise',                  ability:'cha', trained:false },
  { id:'kEscape',     name:'Escape Artist',             ability:'dex', trained:false },
  { id:'kForgery',    name:'Forgery',                   ability:'int', trained:false },
  { id:'kGatherInf',  name:'Gather Information',        ability:'cha', trained:false },
  { id:'kHandleAnm',  name:'Handle Animal',             ability:'cha', trained:true  },
  { id:'kHeal',       name:'Heal',                      ability:'wis', trained:false },
  { id:'kHide',       name:'Hide',                      ability:'dex', trained:false },
  { id:'kIntim',      name:'Intimidate',                ability:'cha', trained:false },
  { id:'kJump',       name:'Jump',                      ability:'str', trained:false },
  { id:'kKnowArcEn',  name:'Knowledge (Arch/Eng)',      ability:'int', trained:true  },
  { id:'kKnowArcan',  name:'Knowledge (Arcana)',         ability:'int', trained:true  },
  { id:'kKnowDun',    name:'Knowledge (Dungeon)',        ability:'int', trained:true  },
  { id:'kKnowGeog',   name:'Knowledge (Geography)',     ability:'int', trained:true  },
  { id:'kKnowHist',   name:'Knowledge (History)',       ability:'int', trained:true  },
  { id:'kKnowLocal',  name:'Knowledge (Local)',          ability:'int', trained:true  },
  { id:'kKnowNat',    name:'Knowledge (Nature)',         ability:'int', trained:true  },
  { id:'kKnowNoble',  name:'Knowledge (Nobility)',       ability:'int', trained:true  },
  { id:'kKnowPlane',  name:'Knowledge (Planes)',         ability:'int', trained:true  },
  { id:'kKnowPsi',    name:'Knowledge (Psionics)',       ability:'int', trained:true  },
  { id:'kKnowRel',    name:'Knowledge (Religion)',       ability:'int', trained:true  },
  { id:'kListen',     name:'Listen',                     ability:'wis', trained:false },
  { id:'kMoveSil',    name:'Move Silently',              ability:'dex', trained:false },
  { id:'kOpenLock',   name:'Open Lock',                  ability:'dex', trained:true  },
  { id:'kPerfDance',  name:'Perform (Dance)',             ability:'cha', trained:false },
  { id:'kPerfSing',   name:'Perform (Sing)',              ability:'cha', trained:false },
  { id:'kPerfWind',   name:'Perform (Wind)',              ability:'cha', trained:false },
  { id:'kPerfAct',    name:'Perform (Act)',               ability:'cha', trained:false },
  { id:'kPerfOrat',   name:'Perform (Oratory)',           ability:'cha', trained:false },
  { id:'kPerfStrng',  name:'Perform (String)',            ability:'cha', trained:false },
  { id:'kProfSail',   name:'Profession (Sailor)',         ability:'wis', trained:true  },
  { id:'kProfSiege',  name:'Profession (Siege Eng.)',     ability:'wis', trained:true  },
  { id:'kPsicraft',   name:'Psicraft',                    ability:'int', trained:true  },
  { id:'kRide',       name:'Ride',                       ability:'dex', trained:false },
  { id:'kSearch',     name:'Search',                     ability:'int', trained:false },
  { id:'kSenseMot',   name:'Sense Motive',               ability:'wis', trained:false },
  { id:'kSleight',    name:'Sleight of Hand',            ability:'dex', trained:true  },
  { id:'kSpellcr',    name:'Spellcraft',                 ability:'int', trained:true  },
  { id:'kSpot',       name:'Spot',                       ability:'wis', trained:false },
  { id:'kSurvival',   name:'Survival',                   ability:'wis', trained:false },
  { id:'kSwim',       name:'Swim',                       ability:'str', trained:false },
  { id:'kTumble',     name:'Tumble',                     ability:'dex', trained:true  },
  { id:'kUseMagic',   name:'Use Magic Device',           ability:'cha', trained:true  },
  { id:'kUseRope',    name:'Use Rope',                   ability:'dex', trained:false },
];

export function getSkillTotals(char) {
  const stats = getDerivedStats(char);
  const mods  = stats.mods;

  return SKILL_LIST.map(skill => {
    const isClass  = stats.classSkills.includes(skill.id);
    const ranks    = (char.skillRanks || {})[skill.id] || 0;
    const maxRanks = isClass ? stats.maxClassRanks : stats.maxCrossRanks;
    const hideMod  = skill.id === 'kHide' ? (SIZE_HIDE_MOD[stats.size]||0) : 0;
    const misc     = (char.skillMisc || {})[skill.id] || 0;
    return {
      ...skill, isClass, ranks, maxRanks,
      abilityMod: mods[skill.ability] || 0,
      total: ranks + (mods[skill.ability]||0) + misc + hideMod,
      miscMod: misc,
      pointCost: isClass ? 1 : 2,
      overMax: ranks > maxRanks,
      cantUseUntrained: skill.trained && ranks === 0,
    };
  });
}

export function getSkillPointsSpent(char) {
  // Build class skill set to determine cost
  const classSkillSet = new Set();
  (char.classes || []).forEach(cls => (cls.classSkills || []).forEach(sk => classSkillSet.add(sk)));

  return SKILL_LIST.reduce((sum, skill) => {
    const ranks = (char.skillRanks || {})[skill.id] || 0;
    const isClass = classSkillSet.has(skill.id);
    return sum + ranks * (isClass ? 1 : 2);
  }, 0);
}

// ─── PART 6: Prerequisite Checker ────────────────────────────────────────────

export function buildCharacterState(char) {
  const stats  = getDerivedStats(char);
  const mods   = stats.mods;
  const skills = getSkillTotals(char);
  const skillMap = Object.fromEntries(skills.map(s => [s.id, s.ranks]));

  const classLevels = Object.fromEntries((char.classes || []).map(c => [c.name, c.levels || 0]));
  const hasClass = (name) => (classLevels[name] || 0) > 0;
  const classLevel = (name) => classLevels[name] || 0;

  const arcaneClasses = (char.classes || []).filter(c =>
    c.spellcasting === 'prepared_arcane' || c.spellcasting === 'spontaneous');
  const divineClasses = (char.classes || []).filter(c =>
    c.spellcasting === 'prepared_divine');
  const isArcane = arcaneClasses.length > 0;
  const isDivine = divineClasses.length > 0;
  const isSpontaneous = (char.classes || []).some(c => c.spellcasting === 'spontaneous');
  const maxArcaneLevel = arcaneClasses.reduce((max, c) => Math.max(max, c.spellLevelsMax||0), 0);
  const maxDivineLevel = divineClasses.reduce((max, c) => Math.max(max, c.spellLevelsMax||0), 0);

  const featIds = new Set((char.feats || []).map(f => f.id).filter(Boolean));
  const weaponFocuses = new Set(
    (char.feats || []).filter(f => f.id?.startsWith('fWepFoc') && f.weaponId).map(f => f.weaponId)
  );

  const featCategories = new Set();
  (char.feats || []).forEach(f => {
    const dbFeat = getFeatById(f.id);
    (dbFeat?.categories || []).forEach(c => featCategories.add(c));
  });

  const hasTurnUndead = hasClass('Cleric') || classLevel('Paladin') >= 2;
  const hasWildShape  = classLevel('Druid') >= 5;
  const hasRage       = hasClass('Barbarian');
  const sneakAttack   = Math.ceil((classLevel('Rogue') + classLevel('Assassin') + classLevel('Lurk')) / 2);
  const hasSmiteEvil  = classLevel('Paladin') >= 1;
  const hasSmite      = hasSmiteEvil || classLevel('Blackguard') >= 1;
  const hasFamiliar   = isArcane;
  const hasAnimalComp = hasClass('Druid') || classLevel('Ranger') >= 4;
  const hasSpecMount  = classLevel('Paladin') >= 5;
  const hasBardMusic  = hasClass('Bard');
  const hasFavEnemy   = hasClass('Ranger');
  const hasEvasion    = classLevel('Rogue') >= 2 || classLevel('Monk') >= 2 || classLevel('Ranger') >= 9 || classLevel('Ninja') >= 2;

  return {
    STR: stats.scores.str, DEX: stats.scores.dex, CON: stats.scores.con,
    INT: stats.scores.int, WIS: stats.scores.wis, CHA: stats.scores.cha,
    BAB: stats.totalBAB,
    fortBase: stats.baseFort, refBase: stats.baseRef, willBase: stats.baseWill,
    fort: stats.fort, ref: stats.ref, will: stats.will,
    totalLevel: stats.totalLevel,
    totalHD: stats.totalLevel + (char.race?.racialHD || 0),
    sizeValue: stats.sizeValue, size: stats.size,
    classLevels, classLevel, hasClass,
    skillRanks: skillMap,
    featIds, weaponFocuses, featCategories,
    isArcane, isDivine, isSpontaneous,
    maxArcaneLevel, maxDivineLevel,
    hasTurnUndead, hasWildShape, hasRage, sneakAttack,
    hasSmite, hasSmiteEvil, hasFamiliar, hasAnimalComp,
    hasSpecMount, hasBardMusic, hasFavEnemy, hasEvasion,
    alignment: char.alignment,
    isEvil:    char.alignment?.includes('Evil'),
    isGood:    char.alignment?.includes('Good'),
    isLawful:  char.alignment?.startsWith('Lawful'),
    isChaotic: char.alignment?.startsWith('Chaotic'),
    domains:   new Set(char.domains || []),
    raceId:    char.race?.id || '',
    raceName:  char.race?.name || '',
  };
}

export function checkPrerequisite(expr, cs) {
  if (!expr || !expr.trim()) return null;
  const e = expr.trim();

  const abilMap = { aSTR:'STR', aDEX:'DEX', aCON:'CON', aINT:'INT', aWIS:'WIS', aCHA:'CHA' };

  // Ability score: child[aSTR].field[aFinalVal].value >= N
  for (const [key, stat] of Object.entries(abilMap)) {
    const m = e.match(new RegExp(`child\\[${key}\\]\\.field\\[aFinalVal\\]\\.value\\s*>=\\s*(\\d+)`));
    if (m) return cs[stat] >= +m[1];
  }
  // Skill ranks: #skillranks[kX] >= N or childfound[kX].field[kUserRanks].value >= N
  const skM = e.match(/#skillranks\[(\w+)\]\s*>=\s*(\d+)/);
  if (skM) return (cs.skillRanks[skM[1]]||0) >= +skM[2];
  const skM2 = e.match(/childfound\[(\w+)\]\.field\[kUserRanks\]\.value\s*>=\s*(\d+)/);
  if (skM2) return (cs.skillRanks[skM2[1]]||0) >= +skM2[2];
  // Has feat: #hasfeat[fX] <> 0
  const fM = e.match(/#hasfeat\[(\w+)\]\s*<>\s*0/);
  if (fM) return cs.featIds.has(fM[1]);
  // BAB
  const babM = e.match(/tAtkBase\]\.value\s*>=\s*(\d+)/);
  if (babM) return cs.BAB >= +babM[1];
  // Class level count
  const clsM = e.match(/#levelcount\[(\w+)\]\s*>=\s*(\d+)/) ||
               e.match(/tagcount\[Classes\.(\w+)\]\s*>=\s*(\d+)/);
  if (clsM) return cs.classLevel(clsM[1]) >= +clsM[2];
  // Character level
  const lvM = e.match(/herofield\[tLevel\]\.value\s*>=\s*(\d+)/) ||
              e.match(/#totallevelcount\[\]\s*>=\s*(\d+)/);
  if (lvM) return cs.totalLevel >= +lvM[1];
  // Hit dice
  const hdM = e.match(/tHitDice\]\.value\s*>=\s*(\d+)/);
  if (hdM) return cs.totalHD >= +hdM[1];
  // Save base
  const svBM = e.match(/child\[v(Fort|Ref|Will)\]\.field\[vBase\]\.value\s*>=\s*(\d+)/);
  if (svBM) return cs[svBM[1].toLowerCase()+'Base'] >= +svBM[2];
  // Save total
  const svTM = e.match(/child\[v(Fort|Ref|Will)\]\.field\[vTotal\]\.value\s*>=\s*(\d+)/);
  if (svTM) return cs[svTM[1].toLowerCase()] >= +svTM[2];
  // Race tag
  const rcM = e.match(/tagis\[Race\.(\w+)\]/);
  if (rcM) {
    const tag = rcM[1].toLowerCase();
    return cs.raceId.toLowerCase().includes(tag) || cs.raceName.toLowerCase().includes(tag);
  }
  // Size
  const szM = e.match(/herofield\[tSize\]\.value\s*(>=|<=|>|<)\s*(-?\d+)/);
  if (szM) {
    const sv = cs.sizeValue, n = +szM[2], op = szM[1];
    if (op === '>=') return sv >= n;
    if (op === '<=') return sv <= n;
    if (op === '>')  return sv > n;
    if (op === '<')  return sv < n;
  }
  // Alignment
  if (e.includes('Alignment.Evil'))    return cs.isEvil;
  if (e.includes('Alignment.Good'))    return cs.isGood;
  if (e.includes('Alignment.Lawful'))  return cs.isLawful;
  if (e.includes('Alignment.Chaotic')) return cs.isChaotic;
  if (e.includes('LawEvil'))           return cs.isLawful && cs.isEvil;
  if (e.includes('ChaotEvil'))         return cs.isChaotic && cs.isEvil;
  if (e.includes('LawGood'))           return cs.isLawful && cs.isGood;
  // Caster level via tagcount
  if (e.includes('tagcount[Hero.Arcane]')) {
    const m = e.match(/tagcount\[Hero\.Arcane\]\s*>=\s*(\d+)\s*\+\s*1/);
    return m ? cs.maxArcaneLevel >= +m[1] : cs.isArcane;
  }
  if (e.includes('tagcount[Hero.Divine]')) {
    const m = e.match(/tagcount\[Hero\.Divine\]\s*>=\s*(\d+)\s*\+\s*1/);
    return m ? cs.maxDivineLevel >= +m[1] : cs.isDivine;
  }
  // herofield[tMaxCaster]
  const casterM = e.match(/herofield\[tMaxCaster\]\.value\s*>=\s*(\d+)/);
  if (casterM) return Math.max(cs.maxArcaneLevel, cs.maxDivineLevel) >= +casterM[1];
  // Special class features
  if (e.includes('Hero.TurnUndead'))    return cs.hasTurnUndead;
  if (e.includes('Hero.WildShape') || e.includes('WildShape')) return cs.hasWildShape;
  if (e.includes('cBbnRage') || e.includes('cAveRage')) return cs.hasRage;
  if (e.includes('User.SmiteEvil'))    return cs.hasSmiteEvil;
  if (e.includes('User.Smite'))        return cs.hasSmite;
  if (e.includes('Hero.FavEnemy') || e.includes('cRgrEnemy1')) return cs.hasFavEnemy;
  if (e.includes('hBrdMusic') || e.includes('Hero.BardMusic')) return cs.hasBardMusic;
  if (e.includes('CompAvail.cArcFamil') || e.includes('cArcFClass')) return cs.hasFamiliar;
  if (e.includes('CompAvail.cAnimComp') || e.includes('cAnimClass')) return cs.hasAnimalComp;
  if (e.includes('CompAvail.cPalMount') || e.includes('cPalMClass')) return cs.hasSpecMount;
  if (e.includes('Hero.SpontArc')) return cs.isSpontaneous;
  if (e.includes('Hero.Caster')) return cs.isArcane || cs.isDivine;
  // Sneak attack value
  const saM = e.match(/xSneakAtt\]\.field\[Value\]\.value\s*(>=|<>)\s*(\d+)/);
  if (saM) return saM[1] === '<>' ? cs.sneakAttack > 0 : cs.sneakAttack >= +saM[2];
  // Weapon Focus
  const wfM = e.match(/tagis\[WepFocus\.(\?|\w+)\]/);
  if (wfM) return wfM[1] === '?' ? cs.weaponFocuses.size > 0 : cs.weaponFocuses.has(wfM[1]);
  // Feat category count
  const catM = e.match(/tagcount\[fCategory\.(\w+)\]\s*(?:<>|>=)\s*(\d+)?/);
  if (catM) {
    const count = catM[2] ? +catM[2] : 1;
    let total = 0;
    for (const cat of cs.featCategories) {
      if (cat.toLowerCase() === catM[1].toLowerCase()) total++;
    }
    return total >= count;
  }
  // Domain
  const domM = e.match(/tagis\[Domain\.(\w+)\]/);
  if (domM) return cs.domains.has(domM[1]);
  // Class feature childfound
  const cfM = e.match(/childfound\[(\w+)\]\.tagis\[Helper\.ShowSpec\]/);
  if (cfM) {
    const featureMap = {
      cBbnRage:'hasRage', cAveRage:'hasRage', cDrdWild1:'hasWildShape',
      cClrUndead:'hasTurnUndead', cPalTurnUn:'hasTurnUndead',
      cRgrEnemy1:'hasFavEnemy', hBrdMusic:'hasBardMusic', cBrdMInsC:'hasBardMusic',
      cArcFClass:'hasFamiliar', cAnimClass:'hasAnimalComp',
      cPalMClass:'hasSpecMount', cMnkEvas:'hasEvasion', cRogEvas:'hasEvasion',
    };
    const flag = featureMap[cfM[1]];
    if (flag) {
      if (flag === 'sneakAttack') return cs.sneakAttack > 0;
      return Boolean(cs[flag]);
    }
    return null;
  }
  // Manifester level
  const manM = e.match(/tagcount\[Hero\.Manifester\]\s*>=\s*(\d+)/);
  if (manM) return (cs.classLevel('Psion') + cs.classLevel('Wilder') + cs.classLevel('Ardent')) >= +manM[1];
  // #hasfeat multiple sum: #hasfeat[A] + #hasfeat[B] <> 0
  const sumFeatM = e.match(/((?:#hasfeat\[\w+\]\s*\+\s*)*#hasfeat\[\w+\])\s*<>\s*0/);
  if (sumFeatM) {
    const allIds = [...e.matchAll(/#hasfeat\[(\w+)\]/g)].map(m => m[1]);
    return allIds.some(id => cs.featIds.has(id));
  }

  return null; // unrecognized — warn but don't block
}

export function checkAllPrereqs(prereqs, char) {
  if (!prereqs || prereqs.length === 0) return { meetsAll: true, failed: [], unknown: [], all: [] };
  const cs = buildCharacterState(char);
  const results = prereqs.map(p => {
    const passed = checkPrerequisite(p.expr, cs);
    return { message: p.message, passed, unknown: passed === null };
  });
  return {
    meetsAll: results.every(r => r.passed !== false),
    failed:   results.filter(r => r.passed === false).map(r => r.message),
    unknown:  results.filter(r => r.unknown).map(r => r.message),
    all:      results,
  };
}

// ─── PART 7: Full Character State Builder ────────────────────────────────────

export function buildFullCharacterState(char) {
  const derived = getDerivedStats(char);
  const skillTotals = getSkillTotals(char);

  return {
    character: char,
    derived,
    skillTotals,
    availableAbilityIncreases: getAvailableAbilityIncreases(char),
    spentSkillPoints: derived.spentSkillPoints,
    remainingSkillPoints: derived.remainingSkillPoints,
  };
}

// ─── Helper formatters ────────────────────────────────────────────────────────

export function formatModifier(n) { return (n >= 0 ? '+' : '') + n; }

export function getHumanReadableAttacks(attacks) {
  return (attacks || []).map(a => formatModifier(a)).join('/');
}

// ─── localStorage persistence ─────────────────────────────────────────────────

const CHAR_LIST_KEY = 'dnd35_characters_v3';

export function saveCharacterToStorage(character) {
  try {
    const all = loadAllCharactersFromStorage();
    const key = character.name || 'Unnamed';
    all[key] = character;
    localStorage.setItem(CHAR_LIST_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllCharactersFromStorage() {
  try {
    const raw = localStorage.getItem(CHAR_LIST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function loadActiveCharacterFromStorage() {
  try {
    const all = loadAllCharactersFromStorage();
    const keys = Object.keys(all);
    if (keys.length === 0) return null;
    // Return last saved
    return all[keys[keys.length - 1]];
  } catch { return null; }
}

export function deleteCharacterFromStorage(name) {
  try {
    const all = loadAllCharactersFromStorage();
    delete all[name];
    localStorage.setItem(CHAR_LIST_KEY, JSON.stringify(all));
  } catch {}
}

export function exportCharacter(character) {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name || 'character'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importCharacter(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { resolve({ ...getDefaultCharacter(), ...JSON.parse(e.target.result) }); }
      catch { reject(new Error('Invalid JSON')); }
    };
    reader.readAsText(file);
  });
}