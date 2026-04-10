// D&D 3.5 Core Data

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
export const ABILITY_NAMES = {
  STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution',
  INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma'
};

export const SIZES = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];
export const SIZE_MODS = { Fine: 8, Diminutive: 4, Tiny: 2, Small: 1, Medium: 0, Large: -1, Huge: -2, Gargantuan: -4, Colossal: -8 };

export const RACES = {
  Human: {
    abilityMods: {}, size: 'Medium', speed: 30,
    traits: ['Bonus Feat at 1st level', 'Extra skill points (4 at 1st level, 1 per level after)', 'Favored Class: Any'],
    favoredClass: 'Any', bonusSkillPoints: true, bonusFeat: true
  },
  Dwarf: {
    abilityMods: { CON: 2, CHA: -2 }, size: 'Medium', speed: 20,
    traits: ['Darkvision 60ft', 'Stonecunning (+2 Search for unusual stonework)', '+2 saves vs poison', '+2 saves vs spells/spell-like', '+1 attack vs orcs/goblinoids', '+4 dodge AC vs giants', '+2 Appraise (stone/metal)', '+2 Craft (stone/metal)', 'Stability (+4 vs bull rush/trip)', 'Weapon Familiarity: Dwarven waraxe/urgrosh'],
    favoredClass: 'Fighter'
  },
  Elf: {
    abilityMods: { DEX: 2, CON: -2 }, size: 'Medium', speed: 30,
    traits: ['Low-light Vision', 'Immunity to sleep effects', '+2 saves vs enchantment', 'Weapon Proficiency: longsword, rapier, longbow, shortbow', '+2 Listen, Search, Spot', 'Auto-detect secret doors within 5ft'],
    favoredClass: 'Wizard'
  },
  Gnome: {
    abilityMods: { CON: 2, STR: -2 }, size: 'Small', speed: 20,
    traits: ['Low-light Vision', '+2 saves vs illusions', '+1 DC to illusion spells cast', '+1 attack vs kobolds/goblinoids', '+4 dodge AC vs giants', '+2 Listen', '+2 Craft (alchemy)', 'Spell-like: speak with animals 1/day', 'Weapon Familiarity: gnome hooked hammer'],
    favoredClass: 'Bard'
  },
  'Half-Elf': {
    abilityMods: {}, size: 'Medium', speed: 30,
    traits: ['Low-light Vision', 'Immunity to sleep effects', '+2 saves vs enchantment', '+1 Listen, Search, Spot', '+2 Diplomacy, Gather Information', 'Elven Blood (counts as elf)'],
    favoredClass: 'Any'
  },
  'Half-Orc': {
    abilityMods: { STR: 2, INT: -2, CHA: -2 }, size: 'Medium', speed: 30,
    traits: ['Darkvision 60ft', 'Orc Blood (counts as orc)'],
    favoredClass: 'Barbarian'
  },
  Halfling: {
    abilityMods: { DEX: 2, STR: -2 }, size: 'Small', speed: 20,
    traits: ['+1 all saving throws', '+2 morale bonus vs fear (stacks)', '+1 attack with thrown weapons/slings', '+2 Climb, Jump, Listen, Move Silently'],
    favoredClass: 'Rogue'
  }
};

// BAB Progressions per level (1-20)
const GOOD_BAB = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const AVG_BAB = [0,1,2,3,3,4,5,6,6,7,8,9,9,10,11,12,12,13,14,15];
const POOR_BAB = [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10];

// Save progressions
const GOOD_SAVE = [2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12];
const POOR_SAVE = [0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6];

export const CLASSES = {
  Fighter: {
    hd: 10, bab: GOOD_BAB, fort: GOOD_SAVE, ref: POOR_SAVE, will: POOR_SAVE,
    skillPoints: 2, caster: false,
    classSkills: ['Climb','Craft','Handle Animal','Intimidate','Jump','Ride','Swim'],
    features: {
      1: ['Bonus Combat Feat'], 2: ['Bonus Combat Feat'], 4: ['Bonus Combat Feat'],
      6: ['Bonus Combat Feat'], 8: ['Bonus Combat Feat'], 10: ['Bonus Combat Feat'],
      12: ['Bonus Combat Feat'], 14: ['Bonus Combat Feat'], 16: ['Bonus Combat Feat'],
      18: ['Bonus Combat Feat'], 20: ['Bonus Combat Feat']
    },
    bonusFeats: [1,2,4,6,8,10,12,14,16,18,20]
  },
  Wizard: {
    hd: 4, bab: POOR_BAB, fort: POOR_SAVE, ref: POOR_SAVE, will: GOOD_SAVE,
    skillPoints: 2, caster: true, casterType: 'prepared', castingAbility: 'INT',
    classSkills: ['Concentration','Craft','Decipher Script','Knowledge Arcana','Knowledge Dungeoneering','Knowledge Geography','Knowledge History','Knowledge Local','Knowledge Nature','Knowledge Nobility','Knowledge Religion','Knowledge Planes','Profession','Spellcraft'],
    features: {
      1: ['Summon Familiar', 'Scribe Scroll (Bonus Feat)'],
      5: ['Bonus Metamagic/Item Creation Feat'],
      10: ['Bonus Metamagic/Item Creation Feat'],
      15: ['Bonus Metamagic/Item Creation Feat'],
      20: ['Bonus Metamagic/Item Creation Feat']
    },
    spellsPerDay: {
      1:[3,1],2:[4,2],3:[4,2,1],4:[4,3,2],5:[4,3,2,1],6:[4,3,3,2],7:[4,4,3,2,1],8:[4,4,3,3,2],9:[4,4,4,3,2,1],10:[4,4,4,3,3,2],
      11:[4,4,4,4,3,2,1],12:[4,4,4,4,3,3,2],13:[4,4,4,4,4,3,2,1],14:[4,4,4,4,4,3,3,2],15:[4,4,4,4,4,4,3,2,1],16:[4,4,4,4,4,4,3,3,2],
      17:[4,4,4,4,4,4,4,3,2,1],18:[4,4,4,4,4,4,4,3,3,2],19:[4,4,4,4,4,4,4,4,3,3],20:[4,4,4,4,4,4,4,4,4,4]
    }
  },
  Cleric: {
    hd: 8, bab: AVG_BAB, fort: GOOD_SAVE, ref: POOR_SAVE, will: GOOD_SAVE,
    skillPoints: 2, caster: true, casterType: 'prepared', castingAbility: 'WIS',
    classSkills: ['Concentration','Craft','Diplomacy','Heal','Knowledge Arcana','Knowledge History','Knowledge Religion','Knowledge Planes','Profession','Spellcraft'],
    features: {
      1: ['Turn/Rebuke Undead', 'Domain Powers (2 domains)']
    },
    spellsPerDay: {
      1:[3,1],2:[4,2],3:[4,2,1],4:[5,3,2],5:[5,3,2,1],6:[5,3,3,2],7:[6,4,3,2,1],8:[6,4,3,3,2],9:[6,4,4,3,2,1],10:[6,4,4,3,3,2],
      11:[6,5,4,4,3,2,1],12:[6,5,4,4,3,3,2],13:[6,5,5,4,4,3,2,1],14:[6,5,5,4,4,3,3,2],15:[6,5,5,5,4,4,3,2,1],16:[6,5,5,5,4,4,3,3,2],
      17:[6,5,5,5,5,4,4,3,2,1],18:[6,5,5,5,5,4,4,3,3,2],19:[6,5,5,5,5,5,4,4,3,3],20:[6,5,5,5,5,5,4,4,4,4]
    }
  },
  Rogue: {
    hd: 6, bab: AVG_BAB, fort: POOR_SAVE, ref: GOOD_SAVE, will: POOR_SAVE,
    skillPoints: 8, caster: false,
    classSkills: ['Appraise','Balance','Bluff','Climb','Craft','Decipher Script','Diplomacy','Disable Device','Disguise','Escape Artist','Forgery','Gather Information','Hide','Intimidate','Jump','Knowledge Local','Listen','Move Silently','Open Lock','Perform','Profession','Search','Sense Motive','Sleight of Hand','Spot','Swim','Tumble','Use Magic Device','Use Rope'],
    features: {
      1: ['Sneak Attack +1d6','Trapfinding'],2: ['Evasion'],3: ['Sneak Attack +2d6','Trap Sense +1'],
      4: ['Uncanny Dodge'],5: ['Sneak Attack +3d6'],6: ['Trap Sense +2'],7: ['Sneak Attack +4d6'],
      8: ['Improved Uncanny Dodge'],9: ['Sneak Attack +5d6','Trap Sense +3'],
      10: ['Special Ability'],11: ['Sneak Attack +6d6'],12: ['Trap Sense +4'],
      13: ['Sneak Attack +7d6','Special Ability'],14: [],15: ['Sneak Attack +8d6','Trap Sense +5'],
      16: ['Special Ability'],17: ['Sneak Attack +9d6'],18: ['Trap Sense +6'],
      19: ['Sneak Attack +10d6','Special Ability'],20: []
    }
  },
  Ranger: {
    hd: 8, bab: GOOD_BAB, fort: GOOD_SAVE, ref: GOOD_SAVE, will: POOR_SAVE,
    skillPoints: 6, caster: true, casterType: 'prepared', castingAbility: 'WIS',
    classSkills: ['Climb','Concentration','Craft','Handle Animal','Heal','Hide','Jump','Knowledge Dungeoneering','Knowledge Geography','Knowledge Nature','Listen','Move Silently','Profession','Ride','Search','Spot','Survival','Swim','Use Rope'],
    features: {
      1: ['1st Favored Enemy','Track','Wild Empathy'],2: ['Combat Style'],
      3: ['Endurance'],4: ['Animal Companion'],5: ['2nd Favored Enemy'],
      6: ['Improved Combat Style'],7: ['Woodland Stride'],8: ['Swift Tracker'],
      9: ['Evasion'],10: ['3rd Favored Enemy'],11: ['Combat Style Mastery'],
      13: ['Camouflage'],15: ['4th Favored Enemy'],17: ['Hide in Plain Sight'],
      20: ['5th Favored Enemy']
    },
    spellsPerDay: {
      4:[0,0],5:[0,0],6:[0,1],7:[0,1],8:[0,1],9:[0,1],10:[0,1],
      11:[0,1,0],12:[0,1,1],13:[0,1,1],14:[0,1,1,0],15:[0,1,1,1],
      16:[0,1,1,1],17:[0,2,1,1,0],18:[0,2,1,1,1],19:[0,2,2,1,1],20:[0,2,2,2,1]
    }
  },
  Paladin: {
    hd: 10, bab: GOOD_BAB, fort: GOOD_SAVE, ref: POOR_SAVE, will: POOR_SAVE,
    skillPoints: 2, caster: true, casterType: 'prepared', castingAbility: 'WIS',
    classSkills: ['Concentration','Craft','Diplomacy','Handle Animal','Heal','Knowledge Nobility','Knowledge Religion','Profession','Ride','Sense Motive'],
    features: {
      1: ['Aura of Good','Detect Evil','Smite Evil 1/day'],2: ['Divine Grace','Lay on Hands'],
      3: ['Aura of Courage','Divine Health'],4: ['Turn Undead'],5: ['Smite Evil 2/day','Special Mount'],
      6: ['Remove Disease 1/week'],9: ['Remove Disease 2/week'],10: ['Smite Evil 3/day'],
      12: ['Remove Disease 3/week'],15: ['Remove Disease 4/week','Smite Evil 4/day'],
      18: ['Remove Disease 5/week'],20: ['Smite Evil 5/day']
    },
    spellsPerDay: {
      4:[0,0],5:[0,0],6:[0,1],7:[0,1],8:[0,1],9:[0,1],10:[0,1],
      11:[0,1,0],12:[0,1,1],13:[0,1,1],14:[0,1,1,0],15:[0,1,1,1],
      16:[0,1,1,1],17:[0,2,1,1,0],18:[0,2,1,1,1],19:[0,2,2,1,1],20:[0,2,2,2,1]
    }
  },
  Barbarian: {
    hd: 12, bab: GOOD_BAB, fort: GOOD_SAVE, ref: POOR_SAVE, will: POOR_SAVE,
    skillPoints: 4, caster: false,
    classSkills: ['Climb','Craft','Handle Animal','Intimidate','Jump','Listen','Ride','Survival','Swim'],
    features: {
      1: ['Fast Movement','Illiteracy','Rage 1/day'],2: ['Uncanny Dodge'],
      3: ['Trap Sense +1'],4: ['Rage 2/day'],5: ['Improved Uncanny Dodge'],
      6: ['Trap Sense +2'],7: ['Damage Reduction 1/—'],8: ['Rage 3/day'],
      9: ['Trap Sense +3'],10: ['Damage Reduction 2/—'],11: ['Greater Rage'],
      12: ['Rage 4/day','Trap Sense +4'],13: ['Damage Reduction 3/—'],
      14: ['Indomitable Will'],15: ['Trap Sense +5'],16: ['Damage Reduction 4/—','Rage 5/day'],
      17: ['Tireless Rage'],18: ['Trap Sense +6'],19: ['Damage Reduction 5/—'],
      20: ['Mighty Rage','Rage 6/day']
    }
  },
  Bard: {
    hd: 6, bab: AVG_BAB, fort: POOR_SAVE, ref: GOOD_SAVE, will: GOOD_SAVE,
    skillPoints: 6, caster: true, casterType: 'known', castingAbility: 'CHA',
    classSkills: ['Appraise','Balance','Bluff','Climb','Concentration','Craft','Decipher Script','Diplomacy','Disguise','Escape Artist','Gather Information','Hide','Jump','Knowledge Arcana','Knowledge Dungeoneering','Knowledge Geography','Knowledge History','Knowledge Local','Knowledge Nature','Knowledge Nobility','Knowledge Religion','Knowledge Planes','Listen','Move Silently','Perform','Profession','Sense Motive','Sleight of Hand','Speak Language','Spellcraft','Swim','Tumble','Use Magic Device'],
    features: {
      1: ['Bardic Music','Bardic Knowledge','Countersong','Fascinate','Inspire Courage +1'],
      3: ['Inspire Competence'],6: ['Suggestion'],8: ['Inspire Courage +2'],
      9: ['Inspire Greatness'],12: ['Song of Freedom'],14: ['Inspire Courage +3'],
      15: ['Inspire Heroics'],18: ['Mass Suggestion'],20: ['Inspire Courage +4']
    },
    spellsPerDay: {
      1:[2],2:[3,0],3:[3,1],4:[3,2,0],5:[3,3,1],6:[3,3,2],7:[3,3,2,0],8:[3,3,3,1],
      9:[3,3,3,2],10:[3,3,3,2,0],11:[3,3,3,3,1],12:[3,3,3,3,2],13:[3,3,3,3,2,0],
      14:[4,3,3,3,3,1],15:[4,4,3,3,3,2],16:[4,4,4,3,3,2,0],17:[4,4,4,4,3,3,1],
      18:[4,4,4,4,4,3,2],19:[4,4,4,4,4,4,3],20:[4,4,4,4,4,4,4]
    },
    spellsKnown: {
      1:[4],2:[5,2],3:[6,3],4:[6,3,2],5:[6,4,3],6:[6,4,3],7:[6,4,4,2],8:[6,4,4,3],
      9:[6,4,4,3],10:[6,4,4,4,2],11:[6,4,4,4,3],12:[6,4,4,4,3],13:[6,4,4,4,4,2],
      14:[6,4,4,4,4,3],15:[6,4,4,4,4,3],16:[6,5,4,4,4,4,2],17:[6,5,5,4,4,4,3],
      18:[6,5,5,5,4,4,3],19:[6,5,5,5,5,4,4],20:[6,5,5,5,5,5,4]
    }
  },
  Druid: {
    hd: 8, bab: AVG_BAB, fort: GOOD_SAVE, ref: POOR_SAVE, will: GOOD_SAVE,
    skillPoints: 4, caster: true, casterType: 'prepared', castingAbility: 'WIS',
    classSkills: ['Concentration','Craft','Diplomacy','Handle Animal','Heal','Knowledge Nature','Listen','Profession','Ride','Spellcraft','Spot','Survival','Swim'],
    features: {
      1: ['Animal Companion','Nature Sense','Wild Empathy'],2: ['Woodland Stride'],
      3: ['Trackless Step'],4: ['Resist Nature\'s Lure'],5: ['Wild Shape 1/day'],
      6: ['Wild Shape 2/day'],7: ['Wild Shape 3/day'],8: ['Wild Shape (Large)'],
      9: ['Venom Immunity'],10: ['Wild Shape 4/day'],11: ['Wild Shape (Tiny)'],
      12: ['Wild Shape (Plant)'],13: ['A Thousand Faces'],15: ['Timeless Body','Wild Shape 5/day'],
      16: ['Wild Shape (Huge)'],18: ['Wild Shape 6/day']
    },
    spellsPerDay: {
      1:[3,1],2:[4,2],3:[4,2,1],4:[5,3,2],5:[5,3,2,1],6:[5,3,3,2],7:[6,4,3,2,1],8:[6,4,3,3,2],9:[6,4,4,3,2,1],10:[6,4,4,3,3,2],
      11:[6,5,4,4,3,2,1],12:[6,5,4,4,3,3,2],13:[6,5,5,4,4,3,2,1],14:[6,5,5,4,4,3,3,2],15:[6,5,5,5,4,4,3,2,1],16:[6,5,5,5,4,4,3,3,2],
      17:[6,5,5,5,5,4,4,3,2,1],18:[6,5,5,5,5,4,4,3,3,2],19:[6,5,5,5,5,5,4,4,3,3],20:[6,5,5,5,5,5,4,4,4,4]
    }
  },
  Monk: {
    hd: 8, bab: AVG_BAB, fort: GOOD_SAVE, ref: GOOD_SAVE, will: GOOD_SAVE,
    skillPoints: 4, caster: false,
    classSkills: ['Balance','Climb','Concentration','Craft','Diplomacy','Escape Artist','Hide','Jump','Knowledge Arcana','Knowledge Religion','Listen','Move Silently','Perform','Profession','Sense Motive','Spot','Swim','Tumble'],
    features: {
      1: ['Bonus Feat','Flurry of Blows','Unarmed Strike'],2: ['Bonus Feat','Evasion'],
      3: ['Still Mind','Speed +10ft'],4: ['Ki Strike (Magic)','Slow Fall 20ft'],
      5: ['Purity of Body'],6: ['Bonus Feat','Speed +20ft','Slow Fall 30ft'],
      7: ['Wholeness of Body'],8: ['Slow Fall 40ft'],9: ['Improved Evasion','Speed +30ft'],
      10: ['Ki Strike (Lawful)','Slow Fall 50ft'],11: ['Diamond Body','Greater Flurry'],
      12: ['Abundant Step','Speed +40ft','Slow Fall 60ft'],13: ['Diamond Soul'],
      14: ['Slow Fall 70ft'],15: ['Quivering Palm','Speed +50ft'],
      16: ['Ki Strike (Adamantine)','Slow Fall 80ft'],17: ['Timeless Body','Tongue of Sun and Moon'],
      18: ['Speed +60ft','Slow Fall 90ft'],19: ['Empty Body'],20: ['Perfect Self','Slow Fall Any']
    }
  },
  Sorcerer: {
    hd: 4, bab: POOR_BAB, fort: POOR_SAVE, ref: POOR_SAVE, will: GOOD_SAVE,
    skillPoints: 2, caster: true, casterType: 'known', castingAbility: 'CHA',
    classSkills: ['Bluff','Concentration','Craft','Knowledge Arcana','Profession','Spellcraft'],
    features: {
      1: ['Summon Familiar']
    },
    spellsPerDay: {
      1:[5,3],2:[6,4],3:[6,5],4:[6,6,3],5:[6,6,4],6:[6,6,5,3],7:[6,6,6,4],8:[6,6,6,5,3],
      9:[6,6,6,6,4],10:[6,6,6,6,5,3],11:[6,6,6,6,6,4],12:[6,6,6,6,6,5,3],
      13:[6,6,6,6,6,6,4],14:[6,6,6,6,6,6,5,3],15:[6,6,6,6,6,6,6,4],
      16:[6,6,6,6,6,6,6,5,3],17:[6,6,6,6,6,6,6,6,4],18:[6,6,6,6,6,6,6,6,5,3],
      19:[6,6,6,6,6,6,6,6,6,4],20:[6,6,6,6,6,6,6,6,6,6]
    },
    spellsKnown: {
      1:[4,2],2:[5,2],3:[5,3],4:[6,3,1],5:[6,4,2],6:[7,4,2,1],7:[7,5,3,2],8:[8,5,3,2,1],
      9:[8,5,4,3,2],10:[9,5,4,3,2,1],11:[9,5,5,4,3,2],12:[9,5,5,4,3,2,1],
      13:[9,5,5,4,4,3,2],14:[9,5,5,4,4,3,2,1],15:[9,5,5,4,4,4,3,2],
      16:[9,5,5,4,4,4,3,2,1],17:[9,5,5,4,4,4,3,3,2],18:[9,5,5,4,4,4,3,3,2,1],
      19:[9,5,5,4,4,4,3,3,3,2],20:[9,5,5,4,4,4,3,3,3,3]
    }
  }
};

export const SKILLS = [
  { name: 'Appraise', ability: 'INT', untrained: true },
  { name: 'Balance', ability: 'DEX', untrained: true, acp: true },
  { name: 'Bluff', ability: 'CHA', untrained: true },
  { name: 'Climb', ability: 'STR', untrained: true, acp: true },
  { name: 'Concentration', ability: 'CON', untrained: true },
  { name: 'Craft', ability: 'INT', untrained: true },
  { name: 'Decipher Script', ability: 'INT', untrained: false },
  { name: 'Diplomacy', ability: 'CHA', untrained: true },
  { name: 'Disable Device', ability: 'INT', untrained: false },
  { name: 'Disguise', ability: 'CHA', untrained: true },
  { name: 'Escape Artist', ability: 'DEX', untrained: true, acp: true },
  { name: 'Forgery', ability: 'INT', untrained: true },
  { name: 'Gather Information', ability: 'CHA', untrained: true },
  { name: 'Handle Animal', ability: 'CHA', untrained: false },
  { name: 'Heal', ability: 'WIS', untrained: true },
  { name: 'Hide', ability: 'DEX', untrained: true, acp: true },
  { name: 'Intimidate', ability: 'CHA', untrained: true },
  { name: 'Jump', ability: 'STR', untrained: true, acp: true },
  { name: 'Knowledge Arcana', ability: 'INT', untrained: false },
  { name: 'Knowledge Dungeoneering', ability: 'INT', untrained: false },
  { name: 'Knowledge Geography', ability: 'INT', untrained: false },
  { name: 'Knowledge History', ability: 'INT', untrained: false },
  { name: 'Knowledge Local', ability: 'INT', untrained: false },
  { name: 'Knowledge Nature', ability: 'INT', untrained: false },
  { name: 'Knowledge Nobility', ability: 'INT', untrained: false },
  { name: 'Knowledge Religion', ability: 'INT', untrained: false },
  { name: 'Knowledge Planes', ability: 'INT', untrained: false },
  { name: 'Listen', ability: 'WIS', untrained: true },
  { name: 'Move Silently', ability: 'DEX', untrained: true, acp: true },
  { name: 'Open Lock', ability: 'DEX', untrained: false },
  { name: 'Perform', ability: 'CHA', untrained: true },
  { name: 'Profession', ability: 'WIS', untrained: false },
  { name: 'Ride', ability: 'DEX', untrained: true },
  { name: 'Search', ability: 'INT', untrained: true },
  { name: 'Sense Motive', ability: 'WIS', untrained: true },
  { name: 'Sleight of Hand', ability: 'DEX', untrained: false, acp: true },
  { name: 'Speak Language', ability: null, untrained: false },
  { name: 'Spellcraft', ability: 'INT', untrained: false },
  { name: 'Spot', ability: 'WIS', untrained: true },
  { name: 'Survival', ability: 'WIS', untrained: true },
  { name: 'Swim', ability: 'STR', untrained: true, acp: true },
  { name: 'Tumble', ability: 'DEX', untrained: false, acp: true },
  { name: 'Use Magic Device', ability: 'CHA', untrained: false },
  { name: 'Use Rope', ability: 'DEX', untrained: true }
];

export const COMMON_FEATS = [
  'Power Attack','Cleave','Great Cleave','Weapon Focus','Weapon Specialization',
  'Dodge','Mobility','Spring Attack','Whirlwind Attack','Combat Expertise',
  'Improved Trip','Improved Disarm','Two-Weapon Fighting','Improved Two-Weapon Fighting',
  'Rapid Shot','Manyshot','Point Blank Shot','Precise Shot','Far Shot','Shot on the Run',
  'Toughness','Iron Will','Lightning Reflexes','Great Fortitude','Alertness',
  'Combat Reflexes','Endurance','Diehard','Run','Skill Focus','Spell Focus',
  'Greater Spell Focus','Spell Penetration','Greater Spell Penetration',
  'Brew Potion','Craft Wand','Scribe Scroll','Improved Initiative','Blind-Fight'
];

export const CONDITIONS = [
  { name: 'Blinded', effect: '-2 AC, lose DEX to AC, -4 STR/DEX skills, opponents +2 attack, 50% miss chance' },
  { name: 'Confused', effect: 'Randomly: attack self/ally/enemy, do nothing, or flee' },
  { name: 'Cowering', effect: '-2 AC, lose DEX to AC, no actions' },
  { name: 'Dazed', effect: 'No actions, no AC penalty' },
  { name: 'Dazzled', effect: '-1 attack, Search, Spot' },
  { name: 'Deafened', effect: '-4 Initiative, auto-fail Listen, 20% spell failure (verbal)' },
  { name: 'Dying', effect: 'Unconscious at -1 to -9 HP, lose 1 HP/round' },
  { name: 'Energy Drained', effect: '-1 per negative level to attacks, saves, skills, effective level' },
  { name: 'Entangled', effect: '-2 attack, -4 DEX, cannot move if anchored, concentration DC 15+spell level' },
  { name: 'Exhausted', effect: '-6 STR/DEX, move at half speed, rest 1 hour → Fatigued' },
  { name: 'Fatigued', effect: '-2 STR/DEX, cannot run/charge, rest 8 hours to remove' },
  { name: 'Flat-Footed', effect: 'Lose DEX bonus to AC (if any)' },
  { name: 'Frightened', effect: '-2 attacks/saves/skills, must flee source' },
  { name: 'Grappled', effect: 'Cannot move, -4 DEX, -2 attacks (except grapple), no AoO, concentration DC 20+spell level' },
  { name: 'Helpless', effect: 'Effective DEX 0 (-5 mod), melee attack +4, can be coup de grâce\'d' },
  { name: 'Incorporeal', effect: 'Only harmed by other incorporeal, magic weapons (+1 or better 50%), force/ghost touch full damage' },
  { name: 'Invisible', effect: '+2 attack, ignore target DEX to AC' },
  { name: 'Nauseated', effect: 'Cannot attack, cast spells, or concentrate; move action only' },
  { name: 'Panicked', effect: '-2 saves/skills, drop items, flee, cower if cornered' },
  { name: 'Paralyzed', effect: 'Cannot move or act, effective STR/DEX 0, helpless' },
  { name: 'Petrified', effect: 'Turned to stone, considered unconscious' },
  { name: 'Pinned', effect: 'Held immobile, lose DEX to AC (except vs grappler)' },
  { name: 'Prone', effect: '-4 melee attack, +4 ranged attack against you, -4 ranged attacks by you, +4 melee attacks against you' },
  { name: 'Shaken', effect: '-2 attacks, saves, skills, ability checks' },
  { name: 'Sickened', effect: '-2 attacks, damage, saves, skills, ability checks' },
  { name: 'Staggered', effect: 'Only single move or standard action (not both), no full-round' },
  { name: 'Stunned', effect: 'Cannot act, -2 AC, lose DEX to AC' },
  { name: 'Turned', effect: 'Must flee from turner for 10 rounds' },
  { name: 'Unconscious', effect: 'Cannot act, helpless' }
];

export const POINT_BUY_COSTS = { 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:6, 15:8, 16:10, 17:13, 18:16 };

export function calcMod(score) {
  return Math.floor((score - 10) / 2);
}

export function getDefaultCharacter() {
  return {
    name: '', playerName: '', campaign: '', alignment: 'True Neutral',
    deity: '', size: 'Medium', age: '', gender: '', height: '', weight: '',
    eyes: '', hair: '', skin: '',
    race: 'Human',
    classes: [{ name: 'Fighter', level: 1 }],
    baseAbilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    levelUpAbilities: {},
    hpRolls: {},
    skillRanks: {},
    skillMisc: {},
    feats: [],
    spellsKnown: {},
    equipment: { weapons: [], armor: [], gear: [] },
    money: { cp: 0, sp: 0, gp: 0, pp: 0 },
    combatMisc: {
      armorBonus: 0, shieldBonus: 0, naturalArmor: 0, deflection: 0, miscAC: 0,
      miscInit: 0, miscMeleeAttack: 0, miscRangedAttack: 0, miscGrapple: 0,
      miscFort: 0, miscRef: 0, miscWill: 0
    },
    notes: '',
    // Play mode state
    currentHP: null,
    nonlethalDamage: 0,
    tempHP: 0,
    conditions: [],
    spellSlotsUsed: {},
    combatants: [],
    currentTurn: 0,
    roundNumber: 1,
    diceHistory: []
  };
}

export function getTotalLevel(character) {
  return character.classes.reduce((sum, c) => sum + c.level, 0);
}

export function getAbilityScore(character, ability) {
  const base = character.baseAbilities[ability] || 10;
  const raceMod = RACES[character.race]?.abilityMods[ability] || 0;
  const levelUps = Object.values(character.levelUpAbilities || {}).filter(a => a === ability).length;
  return base + raceMod + levelUps;
}

export function getAbilityMod(character, ability) {
  return calcMod(getAbilityScore(character, ability));
}

export function getBAB(character) {
  let total = 0;
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (classData) total += classData.bab[cls.level - 1] || 0;
  }
  return total;
}

export function getSaveBase(character, save) {
  let total = 0;
  const saveKey = save === 'Fort' ? 'fort' : save === 'Ref' ? 'ref' : 'will';
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (classData) total += classData[saveKey][cls.level - 1] || 0;
  }
  return total;
}

export function getMaxHP(character) {
  let total = 0;
  let levelCounter = 0;
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (!classData) continue;
    for (let i = 1; i <= cls.level; i++) {
      levelCounter++;
      const conMod = getAbilityMod(character, 'CON');
      if (levelCounter === 1) {
        total += classData.hd + conMod;
      } else {
        const rolled = character.hpRolls?.[levelCounter] ?? Math.ceil(classData.hd / 2);
        total += Math.max(1, rolled + conMod);
      }
    }
  }
  return Math.max(1, total);
}

export function getClassSkills(character) {
  const skills = new Set();
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (classData) classData.classSkills.forEach(s => skills.add(s));
  }
  return skills;
}

export function getTotalSkillPoints(character) {
  let total = 0;
  let isFirst = true;
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (!classData) continue;
    const intMod = getAbilityMod(character, 'INT');
    const base = Math.max(1, classData.skillPoints + intMod);
    for (let i = 0; i < cls.level; i++) {
      if (isFirst) {
        let firstLevelPoints = base * 4;
        if (character.race === 'Human') firstLevelPoints += 4;
        total += firstLevelPoints;
        isFirst = false;
      } else {
        let pts = base;
        if (character.race === 'Human') pts += 1;
        total += pts;
      }
    }
  }
  return total;
}

export function getSpentSkillPoints(character) {
  return Object.values(character.skillRanks || {}).reduce((sum, r) => sum + (r || 0), 0);
}

export function getClassFeatures(character) {
  const features = [];
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (!classData) continue;
    for (let lvl = 1; lvl <= cls.level; lvl++) {
      const f = classData.features[lvl];
      if (f) f.forEach(feat => features.push(`${cls.name} ${lvl}: ${feat}`));
    }
  }
  return features;
}

export function getSpellsPerDay(character) {
  const slots = {};
  for (const cls of character.classes) {
    const classData = CLASSES[cls.name];
    if (!classData?.caster || !classData.spellsPerDay) continue;
    const perDay = classData.spellsPerDay[cls.level];
    if (!perDay) continue;
    if (!slots[cls.name]) slots[cls.name] = {};
    perDay.forEach((count, idx) => {
      slots[cls.name][idx] = (slots[cls.name][idx] || 0) + count;
    });
  }
  return slots;
}

export function getEncumbrance(strScore) {
  return {
    light: strScore * 10,
    medium: strScore * 20,
    heavy: strScore * 30
  };
}

export function getTotalWeight(character) {
  let total = 0;
  ['weapons', 'armor', 'gear'].forEach(cat => {
    (character.equipment[cat] || []).forEach(item => {
      total += (item.weight || 0) * (item.quantity || 1);
    });
  });
  return total;
}

export function getAvailableFeats(character) {
  const totalLvl = getTotalLevel(character);
  let count = 1; // Level 1 feat
  if (totalLvl >= 3) count++;
  if (totalLvl >= 6) count++;
  if (totalLvl >= 9) count++;
  if (totalLvl >= 12) count++;
  if (totalLvl >= 15) count++;
  if (totalLvl >= 18) count++;
  // Human bonus feat
  if (character.race === 'Human') count++;
  // Fighter bonus feats
  for (const cls of character.classes) {
    if (cls.name === 'Fighter' && CLASSES.Fighter.bonusFeats) {
      count += CLASSES.Fighter.bonusFeats.filter(l => l <= cls.level).length;
    }
  }
  return count;
}