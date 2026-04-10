// ============================================================
// D&D 3.5 Character Engine — Single source of truth
// All calculations derive from the character state object.
// Never store derived values — always compute them.
// ============================================================

// ─── STEP 1: Default Character State ────────────────────────────────────────

export function getDefaultCharacter() {
  return {
    // Identity
    name: '', playerName: '', campaign: '',
    alignment: 'True Neutral',
    deity: '', size: 'Medium', age: '', gender: '',
    height: '', weight: '', eyes: '', hair: '', skin: '',

    // Race — full race object from RACE_DATABASE once selected
    race: null,

    // Classes — array supports multiclassing
    // each: { id, name, source, levels, hd, bab, fort, ref, will,
    //         skillsPerLevel, classSkills[], spellcasting, classType }
    classes: [],

    // Base ability scores (before any modifiers)
    baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },

    // Level-up ability increases (+1 every 4 levels, user assigns)
    abilityIncreases: [], // [{atLevel:4, stat:'str'}, ...]

    // HP
    hp: { rolls: [], tempHP: 0, nonlethalDamage: 0, currentDamage: 0 },
    // rolls: [{level:1, value:10, classHD:10}, ...]

    // Skills
    skillRanks: {},  // { kTumble: 5, kHide: 3, ... }
    skillMisc: {},   // misc modifiers per skill

    // Feats
    feats: [], // [{ id, name, source, takenAtLevel, categories[], weaponId? }]

    // Domains (clerics)
    domains: [],

    // Spells per class
    spells: {}, // { classId: { known: [], prepared: [] } }

    // Equipment
    equipment: {
      weapons: [], armor: [], shield: null, gear: [],
      currency: { gp: 0, sp: 0, cp: 0 },
    },

    // Misc modifiers (magic items, conditions, etc.)
    miscModifiers: {
      ac: 0, initiative: 0, naturalArmor: 0, deflection: 0,
      fort: 0, ref: 0, will: 0,
      str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0,
    },

    notes: '',
    xp: 0,

    // Play mode
    conditions: [],
    combatants: [],
    currentTurn: 0,
    roundNumber: 1,
    diceHistory: [],
    spellSlotsUsed: {},
  };
}

// ─── STEP 2: Ability Score Engine ────────────────────────────────────────────

export function getTotalLevel(character) {
  return character.classes.reduce((sum, c) => sum + (c.levels || 0), 0);
}

export function getAbilityScores(character) {
  const base = character.baseAbilities;
  const racial = character.race?.abilityMods || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const totalLevel = getTotalLevel(character);

  const increases = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  (character.abilityIncreases || []).forEach(inc => {
    if (inc.atLevel <= totalLevel && increases[inc.stat] !== undefined) {
      increases[inc.stat]++;
    }
  });

  const misc = character.miscModifiers || {};
  const final = {};
  for (const stat of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
    final[stat] = base[stat] + (racial[stat] || 0) + increases[stat] + (misc[stat] || 0);
  }
  return final;
}

export function getAbilityMod(score) {
  return Math.floor((score - 10) / 2);
}

export function getAbilityMods(character) {
  const scores = getAbilityScores(character);
  const mods = {};
  for (const [stat, score] of Object.entries(scores)) {
    mods[stat] = getAbilityMod(score);
  }
  return mods;
}

export function getAvailableAbilityIncreases(character) {
  const totalLevel = getTotalLevel(character);
  // 1 increase at levels 4, 8, 12, 16, 20
  const totalAvailable = Math.floor(totalLevel / 4);
  const assigned = (character.abilityIncreases || []).filter(inc => inc.atLevel <= totalLevel).length;
  return totalAvailable - assigned;
}

// ─── STEP 3: Class & Level Engine ────────────────────────────────────────────

const BAB_TABLE = {
  Good:   [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  Medium: [0,1,2,3,3,4,5,6,6,7,8,9,9,10,11,12,12,13,14,15],
  Poor:   [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10],
};

const SAVE_TABLE = {
  Good: [2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12],
  Poor: [0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6],
};

export function getClassStats(character) {
  let totalBAB = 0;
  let totalFort = 0, totalRef = 0, totalWill = 0;
  let totalSkillPoints = 0;
  const classSkills = new Set();
  const allClassFeatures = [];
  let totalLevel = 0;

  const intMod = getAbilityMod(getAbilityScores(character).int);
  // Human check
  const isHuman = character.race?.id === 'rHuman2' || character.race?.name === 'Human';

  character.classes.forEach((cls, clsIndex) => {
    const levels = cls.levels || 0;
    if (levels < 1) return;
    const isFirstClass = clsIndex === 0;
    totalLevel += levels;

    // BAB: sum per-level deltas (correct for multiclass)
    const babArr = BAB_TABLE[cls.bab] || BAB_TABLE['Poor'];
    for (let l = 0; l < levels; l++) {
      const curr = babArr[l] ?? 0;
      const prev = l > 0 ? babArr[l - 1] ?? 0 : 0;
      totalBAB += curr - prev;
    }

    // Saves: use table value at class level (RAW multiclass stacking)
    totalFort += SAVE_TABLE[cls.fort]?.[levels - 1] ?? 0;
    totalRef  += SAVE_TABLE[cls.ref]?.[levels - 1] ?? 0;
    totalWill += SAVE_TABLE[cls.will]?.[levels - 1] ?? 0;

    // Skill points
    const spPerLevel = Math.max(1, (cls.skillsPerLevel || 2) + intMod);
    const humanBonus = isHuman ? levels : 0;
    // First class level gets ×4, subsequent get ×1
    const firstLevelBonus = isFirstClass ? spPerLevel * 3 : 0; // +3 gives total ×4
    totalSkillPoints += spPerLevel * levels + firstLevelBonus + humanBonus;

    // Class skills union
    (cls.classSkills || []).forEach(sk => classSkills.add(sk));

    // Class features
    (cls.features || []).forEach(f => {
      if (f.level <= levels) allClassFeatures.push({ ...f, fromClass: cls.name });
    });
  });

  // Iterative attacks (every 5 BAB above first)
  const attacks = [];
  if (totalBAB > 0) {
    attacks.push(totalBAB);
    let next = totalBAB - 5;
    while (next > 0) { attacks.push(next); next -= 5; }
  }

  return {
    totalLevel,
    totalBAB,
    attacks,
    baseFort: totalFort,
    baseRef: totalRef,
    baseWill: totalWill,
    totalSkillPoints,
    classSkills: [...classSkills],
    classFeatures: allClassFeatures,
  };
}

// ─── Size modifiers ───────────────────────────────────────────────────────────

const SIZE_AC_ATTACK_MODS = {
  Fine: 8, Diminutive: 4, Tiny: 2, Small: 1,
  Medium: 0, Large: -1, Huge: -2, Gargantuan: -4, Colossal: -8,
};

const SIZE_CMB_MODS = {
  Fine: -8, Diminutive: -4, Tiny: -2, Small: -1,
  Medium: 0, Large: 1, Huge: 2, Gargantuan: 4, Colossal: 8,
};

const SIZE_HIDE_BONUS = {
  Fine: 16, Diminutive: 12, Tiny: 8, Small: 4,
  Medium: 0, Large: -4, Huge: -8, Gargantuan: -12, Colossal: -16,
};

export function getSizeModifier(size) {
  return SIZE_AC_ATTACK_MODS[size] ?? 0;
}

export function getSizeCMBMod(size) {
  return SIZE_CMB_MODS[size] ?? 0;
}

export function getHideSizeBonus(size) {
  return SIZE_HIDE_BONUS[size] ?? 0;
}

// ─── Equipment helpers ────────────────────────────────────────────────────────

function getArmorBonus(character) {
  const armor = character.equipment?.armor?.[0];
  return armor?.acBonus || 0;
}

function getShieldBonus(character) {
  const shield = character.equipment?.shield;
  return shield?.acBonus || 0;
}

function getArmorSpeedPenalty(character) {
  const armor = character.equipment?.armor?.[0];
  if (!armor) return 0;
  // Heavy armor: speed reduced to 20 (from 30) or 15 (from 20)
  if (armor.type === 'heavy') return 10;
  return 0;
}

// ─── HP Calculator ───────────────────────────────────────────────────────────

export function calculateMaxHP(character) {
  const mods = getAbilityMods(character);
  const conMod = mods.con;
  const rolls = character.hp?.rolls || [];
  if (rolls.length === 0) return Math.max(1, conMod);

  let total = 0;
  rolls.forEach((roll, i) => {
    const value = Math.max(1, (roll.value ?? roll.classHD ?? 1));
    total += value + conMod;
  });
  return Math.max(1, total);
}

// ─── STEP 4: Derived Stats Engine ────────────────────────────────────────────

export function getDerivedStats(character) {
  const abilities = getAbilityScores(character);
  const mods = getAbilityMods(character);
  const cls = getClassStats(character);
  const race = character.race;
  const misc = character.miscModifiers || {};
  const size = race?.size || character.size || 'Medium';

  // HP
  const maxHP = calculateMaxHP(character);
  const currentHP = maxHP - (character.hp?.currentDamage || 0) + (character.hp?.tempHP || 0);

  // Initiative
  const initiative = mods.dex + (misc.initiative || 0);

  // AC
  const armorBonus = getArmorBonus(character);
  const shieldBonus = getShieldBonus(character);
  const sizeACMod = getSizeModifier(size);
  const naturalArmor = (race?.naturalArmor || 0) + (misc.naturalArmor || 0);

  const ac = 10 + armorBonus + shieldBonus + mods.dex + sizeACMod + naturalArmor + (misc.deflection || 0) + (misc.ac || 0);
  const touchAC = 10 + mods.dex + sizeACMod + (misc.deflection || 0);
  const flatFootedAC = 10 + armorBonus + shieldBonus + sizeACMod + naturalArmor + (misc.deflection || 0);

  // Saves
  const fort = cls.baseFort + mods.con + (misc.fort || 0);
  const ref  = cls.baseRef  + mods.dex + (misc.ref  || 0);
  const will = cls.baseWill + mods.wis + (misc.will || 0);

  // Attacks
  const sizeMod = getSizeModifier(size);
  const meleeAttack  = cls.totalBAB + mods.str + sizeMod;
  const rangedAttack = cls.totalBAB + mods.dex + sizeMod;
  const cmb = cls.totalBAB + mods.str + getSizeCMBMod(size);

  // Speed
  const baseSpeed = race?.speed || 30;
  const speed = Math.max(5, baseSpeed - getArmorSpeedPenalty(character));

  // Skill rank caps
  const maxClassSkillRanks = cls.totalLevel + 3;
  const maxCrossClassRanks = Math.floor(maxClassSkillRanks / 2);

  return {
    // HP
    maxHP, currentHP,
    // Initiative
    initiative,
    // AC
    ac, touchAC, flatFootedAC,
    // Saves
    fort, ref, will,
    baseFort: cls.baseFort, baseRef: cls.baseRef, baseWill: cls.baseWill,
    // Attack
    meleeAttack, rangedAttack, cmb,
    attacks: cls.attacks,
    // Movement
    speed,
    // Totals
    totalLevel: cls.totalLevel,
    totalBAB: cls.totalBAB,
    // Skills
    maxClassSkillRanks, maxCrossClassRanks,
    classSkills: cls.classSkills,
    classFeatures: cls.classFeatures,
    // Raw scores for display
    abilityScores: abilities,
    abilityMods: mods,
  };
}

// ─── STEP 5: Skill Engine ────────────────────────────────────────────────────

export const SKILL_LIST = [
  { id: 'kAppraise',   name: 'Appraise',                ability: 'int', trained: false },
  { id: 'kBalance',    name: 'Balance',                 ability: 'dex', trained: false },
  { id: 'kBluff',      name: 'Bluff',                   ability: 'cha', trained: false },
  { id: 'kClimb',      name: 'Climb',                   ability: 'str', trained: false },
  { id: 'kConcent',    name: 'Concentration',           ability: 'con', trained: false },
  { id: 'kCraft',      name: 'Craft',                   ability: 'int', trained: false },
  { id: 'kDeciphScr',  name: 'Decipher Script',         ability: 'int', trained: true  },
  { id: 'kDiplomacy',  name: 'Diplomacy',               ability: 'cha', trained: false },
  { id: 'kDisDevice',  name: 'Disable Device',          ability: 'int', trained: true  },
  { id: 'kDisguise',   name: 'Disguise',                ability: 'cha', trained: false },
  { id: 'kEscArtist',  name: 'Escape Artist',           ability: 'dex', trained: false },
  { id: 'kForgery',    name: 'Forgery',                 ability: 'int', trained: false },
  { id: 'kGathInfo',   name: 'Gather Information',      ability: 'cha', trained: false },
  { id: 'kHandAnimal', name: 'Handle Animal',           ability: 'cha', trained: true  },
  { id: 'kHeal',       name: 'Heal',                    ability: 'wis', trained: false },
  { id: 'kHide',       name: 'Hide',                    ability: 'dex', trained: false },
  { id: 'kIntim',      name: 'Intimidate',              ability: 'cha', trained: false },
  { id: 'kJump',       name: 'Jump',                    ability: 'str', trained: false },
  { id: 'kKnowArcan',  name: 'Knowledge (Arcana)',      ability: 'int', trained: true  },
  { id: 'kKnowDun',    name: 'Knowledge (Dungeoneering)', ability: 'int', trained: true },
  { id: 'kKnowGeog',   name: 'Knowledge (Geography)',   ability: 'int', trained: true  },
  { id: 'kKnowHist',   name: 'Knowledge (History)',     ability: 'int', trained: true  },
  { id: 'kKnowLocal',  name: 'Knowledge (Local)',       ability: 'int', trained: true  },
  { id: 'kKnowNat',    name: 'Knowledge (Nature)',      ability: 'int', trained: true  },
  { id: 'kKnowNoble',  name: 'Knowledge (Nobility)',    ability: 'int', trained: true  },
  { id: 'kKnowRel',    name: 'Knowledge (Religion)',    ability: 'int', trained: true  },
  { id: 'kKnowPlane',  name: 'Knowledge (Planes)',      ability: 'int', trained: true  },
  { id: 'kListen',     name: 'Listen',                  ability: 'wis', trained: false },
  { id: 'kMoveSil',    name: 'Move Silently',           ability: 'dex', trained: false },
  { id: 'kOpenLock',   name: 'Open Lock',               ability: 'dex', trained: true  },
  { id: 'kPerfDance',  name: 'Perform (Dance)',         ability: 'cha', trained: false },
  { id: 'kPerfOrat',   name: 'Perform (Oratory)',       ability: 'cha', trained: false },
  { id: 'kPerfSing',   name: 'Perform (Sing)',          ability: 'cha', trained: false },
  { id: 'kPerfStrng',  name: 'Perform (String)',        ability: 'cha', trained: false },
  { id: 'kPerfWind',   name: 'Perform (Wind)',          ability: 'cha', trained: false },
  { id: 'kProfession', name: 'Profession',              ability: 'wis', trained: true  },
  { id: 'kRide',       name: 'Ride',                    ability: 'dex', trained: false },
  { id: 'kSearch',     name: 'Search',                  ability: 'int', trained: false },
  { id: 'kSenseMot',   name: 'Sense Motive',            ability: 'wis', trained: false },
  { id: 'kSleight',    name: 'Sleight of Hand',         ability: 'dex', trained: true  },
  { id: 'kSpellcr',    name: 'Spellcraft',              ability: 'int', trained: true  },
  { id: 'kSpot',       name: 'Spot',                    ability: 'wis', trained: false },
  { id: 'kSurvival',   name: 'Survival',                ability: 'wis', trained: false },
  { id: 'kSwim',       name: 'Swim',                    ability: 'str', trained: false },
  { id: 'kTumble',     name: 'Tumble',                  ability: 'dex', trained: true  },
  { id: 'kUseMagDev',  name: 'Use Magic Device',        ability: 'cha', trained: true  },
  { id: 'kUseRope',    name: 'Use Rope',                ability: 'dex', trained: false },
];

export function getSkillTotals(character) {
  const stats = getDerivedStats(character);
  const mods = stats.abilityMods;

  return SKILL_LIST.map(skill => {
    const isClassSkill = stats.classSkills.includes(skill.id);
    const ranks = character.skillRanks[skill.id] || 0;
    const maxRanks = isClassSkill ? stats.maxClassSkillRanks : stats.maxCrossClassRanks;
    const abilityMod = mods[skill.ability] ?? 0;
    const miscMod = character.skillMisc[skill.id] || 0;
    const sizeMod = skill.id === 'kHide' ? getHideSizeBonus(character.race?.size || 'Medium') : 0;

    return {
      ...skill,
      isClassSkill,
      ranks,
      maxRanks,
      abilityMod,
      miscMod,
      total: ranks + abilityMod + miscMod + sizeMod,
      overMax: ranks > maxRanks,
      pointCost: isClassSkill ? 1 : 2,
    };
  });
}

export function getSkillPointsSpent(character) {
  return getSkillTotals(character).reduce((sum, sk) => sum + sk.ranks * sk.pointCost, 0);
}

export function getSkillPointsAvailable(character) {
  return getClassStats(character).totalSkillPoints;
}

// ─── STEP 6: Class Features Engine ───────────────────────────────────────────

export const CORE_CLASS_FEATURES = {
  Barbarian: [
    { level: 1,  id: 'cBbnRage',     name: 'Rage',                tag: 'Hero.Rage' },
    { level: 1,  id: 'cBbnFast',     name: 'Fast Movement' },
    { level: 2,  id: 'xUncanny',     name: 'Uncanny Dodge' },
    { level: 3,  id: 'xTrapSense',   name: 'Trap Sense',          value: (l) => Math.floor(l / 3) },
    { level: 5,  id: 'xUncanny2',    name: 'Improved Uncanny Dodge' },
    { level: 7,  id: 'cBbnRage2',    name: 'Rage (2/day)' },
    { level: 11, id: 'cBbnRage3',    name: 'Rage (3/day)' },
    { level: 11, id: 'cBbnGrRage',   name: 'Greater Rage' },
    { level: 14, id: 'cBbnIndomit',  name: 'Indomitable Will' },
    { level: 15, id: 'cBbnRage4',    name: 'Rage (4/day)' },
    { level: 17, id: 'cBbnTireless', name: 'Tireless Rage' },
    { level: 19, id: 'cBbnRage5',    name: 'Rage (5/day)' },
    { level: 20, id: 'cBbnMighRage', name: 'Mighty Rage' },
  ],
  Rogue: [
    { level: 1,  id: 'xSneakAtt',  name: 'Sneak Attack',          value: (l) => Math.ceil(l / 2), tag: 'Sneak Attack' },
    { level: 1,  id: 'cRogTrap',   name: 'Trapfinding' },
    { level: 2,  id: 'cRogEvas',   name: 'Evasion' },
    { level: 3,  id: 'xTrapSense', name: 'Trap Sense',            value: (l) => Math.floor(l / 3) },
    { level: 4,  id: 'xUncanny',   name: 'Uncanny Dodge' },
    { level: 8,  id: 'xUncanny2',  name: 'Improved Uncanny Dodge' },
    { level: 10, id: 'cRogSpec',   name: 'Special Ability' },
  ],
  Druid: [
    { level: 1,  id: 'cDrdWild1',   name: 'Wild Shape (Small)',       tag: 'Hero.WildShape' },
    { level: 1,  id: 'cAnimClass',  name: 'Animal Companion',         tag: 'CompAvail.cAnimComp' },
    { level: 1,  id: 'cDrdWoodS',   name: 'Woodland Stride' },
    { level: 2,  id: 'cDrdWoodS2',  name: 'Woodland Stride (Improved)' },
    { level: 3,  id: 'cDrdTrackS',  name: 'Trackless Step' },
    { level: 4,  id: 'cDrdWild2',   name: 'Wild Shape (Medium)' },
    { level: 5,  id: 'cDrdResNa',   name: "Resist Nature's Lure" },
    { level: 6,  id: 'cDrdWild3',   name: 'Wild Shape (3/day)' },
    { level: 8,  id: 'cDrdWild4',   name: 'Wild Shape (Large)' },
    { level: 9,  id: 'cDrdWild5',   name: 'Venom Immunity' },
    { level: 10, id: 'cDrdWildPl',  name: 'Wild Shape (Plant)' },
    { level: 12, id: 'cDrdWild6',   name: 'Wild Shape (Huge)' },
    { level: 16, id: 'cDrdWildE',   name: 'Wild Shape (Elemental)' },
    { level: 18, id: 'cDrdWildL',   name: 'Wild Shape (Large Elemental)' },
    { level: 20, id: 'cDrdTimls',   name: 'Timeless Body' },
  ],
  Paladin: [
    { level: 1,  id: 'xSmiteEvil',  name: 'Smite Evil',             tag: 'User.SmiteEvil' },
    { level: 1,  id: 'cPalDivGrc',  name: 'Divine Grace',           tag: 'User.DivineGrc' },
    { level: 1,  id: 'cPalLayHnd',  name: 'Lay on Hands' },
    { level: 1,  id: 'cPalAuraCr',  name: 'Aura of Courage' },
    { level: 1,  id: 'cPalDivHlth', name: 'Divine Health' },
    { level: 2,  id: 'cPalTurnUn',  name: 'Turn Undead',            tag: 'Hero.TurnUndead' },
    { level: 3,  id: 'cPalAuraGd',  name: 'Aura of Good' },
    { level: 3,  id: 'cPalDivMnt',  name: 'Divine Mount' },
    { level: 4,  id: 'cPalSpell',   name: 'Spells (1st level)' },
    { level: 5,  id: 'cPalMClass',  name: 'Special Mount',          tag: 'CompAvail.cPalMount' },
    { level: 6,  id: 'cPalRemDis',  name: 'Remove Disease (1/week)' },
    { level: 8,  id: 'xSmiteEvil2', name: 'Smite Evil (2/day)' },
  ],
  Ranger: [
    { level: 1,  id: 'cRgrEnemy1',  name: 'Favored Enemy',          tag: 'Hero.FavEnemy' },
    { level: 1,  id: 'cRgrTrack',   name: 'Track' },
    { level: 1,  id: 'cRgrWild',    name: 'Wild Empathy' },
    { level: 2,  id: 'cRgrCombSt',  name: 'Combat Style' },
    { level: 3,  id: 'cRgrEndure',  name: 'Endurance' },
    { level: 4,  id: 'cAnimClass',  name: 'Animal Companion',       tag: 'CompAvail.cAnimComp' },
    { level: 4,  id: 'cRgrSpell',   name: 'Spells (1st level)' },
    { level: 6,  id: 'cRgrEnemy2',  name: 'Favored Enemy (2nd)' },
    { level: 7,  id: 'cRgrWoodS',   name: 'Woodland Stride' },
    { level: 8,  id: 'cRgrSwift',   name: 'Swift Tracker' },
    { level: 9,  id: 'cRgrEvas',    name: 'Evasion' },
    { level: 11, id: 'cRgrEnemy3',  name: 'Favored Enemy (3rd)' },
    { level: 13, id: 'cRgrCombMst', name: 'Combat Style Mastery' },
    { level: 16, id: 'cRgrEnemy4',  name: 'Favored Enemy (4th)' },
    { level: 17, id: 'cRgrHidPlnt', name: 'Hide in Plain Sight' },
    { level: 21, id: 'cRgrEnemy5',  name: 'Favored Enemy (5th)' },
  ],
  Cleric: [
    { level: 1, id: 'cClrUndead', name: 'Turn Undead',         tag: 'Hero.TurnUndead' },
    { level: 1, id: 'cClrSpont',  name: 'Spontaneous Casting' },
  ],
  Monk: [
    { level: 1,  id: 'cMnkFlurr',   name: 'Flurry of Blows' },
    { level: 1,  id: 'cMnkUnarmed', name: 'Unarmed Strike',  value: (l) => [0,6,6,6,8,8,8,10,10,10,12,12,12,12,12,16,16,16,16,20,20][Math.min(l,20)] },
    { level: 1,  id: 'cMnkAC',      name: 'AC Bonus' },
    { level: 2,  id: 'cMnkEvas',    name: 'Evasion' },
    { level: 3,  id: 'cMnkKiMag',   name: 'Ki Strike (Magic)' },
    { level: 4,  id: 'cMnkSlFall',  name: 'Slow Fall' },
    { level: 5,  id: 'cMnkPuStrik', name: 'Purity of Body' },
    { level: 7,  id: 'cMnkWStride', name: 'Wholeness of Body' },
    { level: 9,  id: 'cMnkImpEvas', name: 'Improved Evasion' },
    { level: 11, id: 'cMnkKiLaw',   name: 'Ki Strike (Lawful)' },
    { level: 13, id: 'cMnkTonguS',  name: 'Tongue of Sun and Moon' },
    { level: 15, id: 'cMnkKiAdmt',  name: 'Ki Strike (Adamantine)' },
    { level: 16, id: 'cMnkQdstep',  name: 'Quivering Palm' },
    { level: 17, id: 'cMnkTimlBdy', name: 'Timeless Body' },
    { level: 19, id: 'cMnkEmptBdy', name: 'Empty Body' },
    { level: 20, id: 'cMnkPerfSl',  name: 'Perfect Self' },
  ],
  Wizard: [
    { level: 1,  id: 'fScribeS',    name: 'Scribe Scroll (bonus)' },
    { level: 1,  id: 'cArcFClass',  name: 'Familiar',  tag: 'CompAvail.cArcFamil' },
    { level: 5,  id: 'cWizBonus5',  name: 'Bonus Feat' },
    { level: 10, id: 'cWizBonus10', name: 'Bonus Feat' },
    { level: 15, id: 'cWizBonus15', name: 'Bonus Feat' },
    { level: 20, id: 'cWizBonus20', name: 'Bonus Feat' },
  ],
  Sorcerer: [
    { level: 1, id: 'cArcFClass', name: 'Familiar', tag: 'CompAvail.cArcFamil' },
  ],
  Bard: [
    { level: 1,  id: 'hBrdMusic',   name: 'Bardic Music',       tag: 'Hero.BardMusic' },
    { level: 1,  id: 'cBrdKnow2',   name: 'Bardic Knowledge',   tag: 'User.Lore' },
    { level: 1,  id: 'cBrdMInsC',   name: 'Inspire Courage' },
    { level: 3,  id: 'cBrdMInsComp',name: 'Inspire Competence' },
    { level: 6,  id: 'cBrdMSugg',   name: 'Suggestion' },
    { level: 9,  id: 'cBrdMInsGr',  name: 'Inspire Greatness' },
    { level: 12, id: 'cBrdMSongFr', name: 'Song of Freedom' },
    { level: 15, id: 'cBrdMInsHr',  name: 'Inspire Heroics' },
    { level: 18, id: 'cBrdMMassSug',name: 'Mass Suggestion' },
  ],
  Fighter: [],
};

export function getActiveClassFeatures(character) {
  const features = [];
  character.classes.forEach(cls => {
    const featureTable = CORE_CLASS_FEATURES[cls.name] || [];
    featureTable.forEach(feature => {
      if (feature.level <= (cls.levels || 0)) {
        const value = feature.value ? feature.value(cls.levels) : null;
        features.push({
          ...feature,
          value,
          fromClass: cls.name,
          classLevel: cls.levels,
        });
      }
    });
  });
  return features;
}

// ─── STEP 7: Full Character State Builder ────────────────────────────────────

export function buildCharacterState(character) {
  const abilityScores = getAbilityScores(character);
  const abilityMods = getAbilityMods(character);
  const classStats = getClassStats(character);
  const derived = getDerivedStats(character);
  const skillTotals = getSkillTotals(character);
  const activeFeatures = getActiveClassFeatures(character);

  return {
    character,
    abilityScores,
    abilityMods,
    classStats,
    derived,
    skillTotals,
    activeFeatures,
    availableAbilityIncreases: getAvailableAbilityIncreases(character),
    skillPointsSpent: getSkillPointsSpent(character),
    skillPointsAvailable: getSkillPointsAvailable(character),
  };
}

// ─── localStorage persistence ─────────────────────────────────────────────────

const STORAGE_KEY = 'dnd35_character_v2';
const CHAR_LIST_KEY = 'dnd35_character_list_v2';

export function saveCharacterToStorage(character) {
  try {
    const name = character.name || 'Unnamed';
    localStorage.setItem(STORAGE_KEY + '_active', name);
    const all = loadAllCharactersFromStorage();
    all[name] = character;
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
    const name = localStorage.getItem(STORAGE_KEY + '_active');
    if (!name) return null;
    const all = loadAllCharactersFromStorage();
    return all[name] || null;
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
      try {
        const imported = JSON.parse(e.target.result);
        resolve({ ...getDefaultCharacter(), ...imported });
      } catch { reject(new Error('Invalid JSON')); }
    };
    reader.readAsText(file);
  });
}