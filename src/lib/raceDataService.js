// D&D 3.5 SRD Race Database Service

const SRD_RACE_PAGES = {
  core: "https://srd.dndtools.org/srd/races/racesCore.html",
  psionic: "https://srd.dndtools.org/srd/races/racesPsionic.html",
  racesOfTheWild: "https://srd.dndtools.org/srd/races/racesRotw.html",
  eberron: "https://srd.dndtools.org/srd/races/racesEberron.html",
  underdark: "https://srd.dndtools.org/srd/races/racesUnd.html",
  racesOfDestiny: "https://srd.dndtools.org/srd/races/racesRod.html",
  racesOfFaerun: "https://srd.dndtools.org/srd/races/racesRof.html",
  racesOfStone: "https://srd.dndtools.org/srd/races/racesRos.html",
  racesOfTheDragon: "https://srd.dndtools.org/srd/races/racesRotd.html",
  dragonMagic: "https://srd.dndtools.org/srd/races/racesDrm.html",
  dragonMagazine: "https://srd.dndtools.org/srd/races/racesDramag.html",
  stormwrack: "https://srd.dndtools.org/srd/races/racesStorm.html",
  sandstorm: "https://srd.dndtools.org/srd/races/racesSand.html",
  frostburn: "https://srd.dndtools.org/srd/races/racesFrost.html",
  orientalAdventures: "https://srd.dndtools.org/srd/races/racesOa.html",
  savageSpecies: "https://srd.dndtools.org/srd/races/racesSsouth.html",
  planarHandbook: "https://srd.dndtools.org/srd/races/racesPlanar.html",
  magicOfIncarnate: "https://srd.dndtools.org/srd/races/racesMoi.html",
  monstersAsRaces: "https://srd.dndtools.org/srd/races/monstersAsRaces.html",
  eberronMore: "https://srd.dndtools.org/srd/races/racesMoe.html",
  dragonlance: "https://srd.dndtools.org/srd/races/racesDlance.html",
};

const SOURCE_LABELS = {
  core: "Core Rulebook",
  psionic: "Expanded Psionics",
  racesOfTheWild: "Races of the Wild",
  eberron: "Eberron",
  underdark: "Underdark",
  racesOfDestiny: "Races of Destiny",
  racesOfFaerun: "Races of Faerûn",
  racesOfStone: "Races of Stone",
  racesOfTheDragon: "Races of the Dragon",
  dragonMagic: "Dragon Magic",
  dragonMagazine: "Dragon Magazine",
  stormwrack: "Stormwrack",
  sandstorm: "Sandstorm",
  frostburn: "Frostburn",
  orientalAdventures: "Oriental Adventures",
  savageSpecies: "Savage Species",
  planarHandbook: "Planar Handbook",
  magicOfIncarnate: "Magic of Incarnum",
  monstersAsRaces: "Monsters as Races",
  eberronMore: "More Eberron",
  dragonlance: "Dragonlance",
};

const CACHE_KEY = 'dnd35_race_database';
const CACHE_TS_KEY = 'dnd35_race_db_timestamp';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function fetchRacePage(url) {
  // Try primary proxy
  try {
    const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if (r.ok) return await r.text();
  } catch {}
  // Fallback proxy
  const r2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  if (r2.ok) {
    const d = await r2.json();
    return d.contents;
  }
  throw new Error(`Failed to fetch ${url}`);
}

function parseAbilityMods(text) {
  const mods = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const abilityMap = {
    'strength': 'str', 'dexterity': 'dex', 'constitution': 'con',
    'intelligence': 'int', 'wisdom': 'wis', 'charisma': 'cha'
  };
  const pattern = /([+-]?\d+)\s+(?:bonus to\s+|penalty to\s+|racial bonus to\s+)?(?:inherent bonus to\s+)?(strength|dexterity|constitution|intelligence|wisdom|charisma)/gi;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const ab = abilityMap[m[2].toLowerCase()];
    if (ab) mods[ab] = parseInt(m[1]);
  }
  // Also handle "–2 Charisma" style
  const pattern2 = /([\+\-\u2013\u2014]?\d+)\s+(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/g;
  while ((m = pattern2.exec(text)) !== null) {
    const ab = abilityMap[m[2].toLowerCase()];
    if (ab) {
      const val = parseInt(m[1].replace(/[\u2013\u2014]/g, '-'));
      if (!isNaN(val)) mods[ab] = val;
    }
  }
  return mods;
}

function parseSpeed(text) {
  const m = text.match(/base land speed is (\d+) feet/i) || text.match(/land speed of (\d+) feet/i) || text.match(/speed[:\s]+(\d+) ft/i);
  return m ? parseInt(m[1]) : 30;
}

function parseSize(text) {
  const sizes = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];
  for (const s of sizes) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(text)) return s;
  }
  return 'Medium';
}

function parseLA(text) {
  const m = text.match(/[Ll]evel [Aa]djustment[:\s]+\+?(\d+)/);
  if (m) return parseInt(m[1]);
  const m2 = text.match(/LA[:\s]+\+?(\d+)/);
  return m2 ? parseInt(m2[1]) : 0;
}

function parseDarkvision(text) {
  const m = text.match(/[Dd]arkvision\s+(?:out to\s+)?(\d+)\s*feet/i);
  return m ? parseInt(m[1]) : 0;
}

function parseNaturalArmor(text) {
  const m = text.match(/\+(\d+)\s+natural armor/i);
  return m ? parseInt(m[1]) : 0;
}

function parseFavoredClass(text) {
  const m = text.match(/[Ff]avored [Cc]lass[:\s]+([A-Za-z\s]+?)[\.\n;]/);
  return m ? m[1].trim() : 'Any';
}

function parseSR(text) {
  const m = text.match(/[Ss]pell [Rr]esistance[:\s]+([\d\+\-a-z\s]+?)[\.\n]/);
  return m ? m[1].trim() : null;
}

function parseRacialHD(text) {
  const m = text.match(/(\d+)\s+(d\d+)\s+(?:racial\s+)?[Hh]it\s+[Dd]ice/i);
  if (!m) return { racialHD: 0, racialHDType: null };
  return { racialHD: parseInt(m[1]), racialHDType: m[2] };
}

export function parseRacesFromHTML(html, sourceKey, sourceUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const races = [];
  const source = SOURCE_LABELS[sourceKey] || sourceKey;

  // Find race sections by heading elements
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5');

  headings.forEach((heading, idx) => {
    const text = heading.textContent.trim();
    // Race headings are usually uppercase or title case with "RACIAL TRAITS" section nearby
    if (!text || text.length > 60 || text.length < 2) return;
    // Skip obvious non-race headings
    if (/table|contents|introduction|overview|chapter|appendix|index|note/i.test(text)) return;
    // Skip if it contains "RACIAL TRAITS" (that's the section heading, not race name)
    if (/racial traits/i.test(text)) return;

    // Look at content after this heading for racial traits
    let content = '';
    let el = heading.nextElementSibling;
    let depth = 0;
    while (el && depth < 30) {
      // Stop if we hit next same-level or higher heading
      if (/^h[1-3]$/i.test(el.tagName)) break;
      content += el.textContent + '\n';
      el = el.nextElementSibling;
      depth++;
    }

    if (!content || content.length < 50) return;
    // Must have racial traits mention
    if (!/racial traits/i.test(content) && !/ability\s+adj/i.test(content)) return;

    const raceName = toTitleCase(text.replace(/\s+/g, ' ').trim());
    if (!raceName || raceName.length < 2) return;

    // Extract traits as bullet points
    const traitMatches = [];
    const listItems = [];
    let el2 = heading.nextElementSibling;
    let d2 = 0;
    while (el2 && d2 < 30) {
      if (/^h[1-3]$/i.test(el2.tagName)) break;
      el2.querySelectorAll('li').forEach(li => listItems.push(li.textContent.trim()));
      el2 = el2.nextElementSibling;
      d2++;
    }
    listItems.forEach(t => { if (t && t.length > 5) traitMatches.push(t); });

    const abilityMods = parseAbilityMods(content);
    const speed = parseSpeed(content);
    const size = parseSize(content);
    const LA = parseLA(content);
    const darkvision = parseDarkvision(content);
    const naturalArmor = parseNaturalArmor(content);
    const favoredClass = parseFavoredClass(content);
    const SR = parseSR(content);
    const { racialHD, racialHDType } = parseRacialHD(content);
    const lowLightVision = /low-light vision/i.test(content);

    // Swim/fly speeds
    const swimM = content.match(/swim speed of (\d+)/i);
    const flyM = content.match(/fly speed of (\d+)/i);

    // Anchor from heading id or name
    const anchor = heading.id || heading.getAttribute('name') || '';
    const srdUrl = anchor ? `${sourceUrl}#${anchor}` : sourceUrl;

    races.push({
      name: raceName,
      source,
      sourceKey,
      size,
      speed,
      swimSpeed: swimM ? parseInt(swimM[1]) : null,
      flySpeed: flyM ? parseInt(flyM[1]) : null,
      abilityMods,
      LA,
      racialHD,
      racialHDType,
      racialBAB: 0,
      racialSaves: { fort: 0, ref: 0, will: 0 },
      naturalArmor,
      SR,
      darkvision,
      lowLightVision,
      traits: traitMatches.length > 0 ? traitMatches : [content.slice(0, 300).trim()],
      favoredClass,
      languages: { auto: [], bonus: [] },
      srdUrl,
    });
  });

  return races;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
}

export async function loadAllRaces(onProgress) {
  const entries = Object.entries(SRD_RACE_PAGES);
  const db = { ...FALLBACK_RACES };
  let completed = 0;

  for (const [key, url] of entries) {
    try {
      const html = await fetchRacePage(url);
      const races = parseRacesFromHTML(html, key, url);
      races.forEach(r => { db[r.name] = r; });
    } catch (e) {
      console.warn(`Failed to load ${key}:`, e.message);
    }
    completed++;
    if (onProgress) onProgress(completed, entries.length);
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify(db));
  localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
  return db;
}

export function getCachedRaceDatabase() {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  const data = localStorage.getItem(CACHE_KEY);
  if (!data || !ts) return null;
  if (Date.now() - parseInt(ts) > CACHE_TTL) return null;
  try { return JSON.parse(data); } catch { return null; }
}

export function clearRaceCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TS_KEY);
}

export function getCacheTimestamp() {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  return ts ? new Date(parseInt(ts)) : null;
}

export async function getRaceDatabase(onProgress) {
  const cached = getCachedRaceDatabase();
  if (cached) return cached;
  return loadAllRaces(onProgress);
}

export function formatAbilityMods(abilityMods) {
  if (!abilityMods) return '';
  const parts = [];
  const map = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
  Object.entries(abilityMods).forEach(([k, v]) => {
    if (v !== 0) parts.push(`${v > 0 ? '+' : ''}${v} ${map[k]}`);
  });
  return parts.join(', ');
}

// ─────────────────────────────────────────────
// FALLBACK HARDCODED RACE DATABASE
// ─────────────────────────────────────────────
export const FALLBACK_RACES = {
  "Human": {
    name: "Human", source: "Core Rulebook", sourceKey: "core", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Bonus feat at 1st level", "4 extra skill points at 1st level, +1 per level after", "Favored class: Any"],
    favoredClass: "Any", languages: { auto: ["Common"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Dwarf": {
    name: "Dwarf", source: "Core Rulebook", sourceKey: "core", size: "Medium", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Stonecunning (+2 Search checks for unusual stonework)", "+2 racial bonus on saves vs. poison", "+2 racial bonus on saves vs. spells and spell-like effects", "+1 attack bonus vs. orcs and goblinoids", "+4 dodge bonus to AC vs. giants", "Speed 20 ft even in medium/heavy armor", "+2 Appraise on stone/metal items", "+2 Craft involving stone/metal", "Stability: +4 vs. bull rush and trip when standing on ground", "Weapon Familiarity: dwarven waraxe, dwarven urgrosh"],
    favoredClass: "Fighter", languages: { auto: ["Common", "Dwarven"], bonus: ["Giant", "Gnome", "Goblin", "Orc", "Terran", "Undercommon"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Elf": {
    name: "Elf", source: "Core Rulebook", sourceKey: "core", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: -2, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision", "Immunity to magic sleep effects", "+2 racial saving throw bonus vs. enchantment spells/effects", "Weapon Proficiency: longsword, rapier, longbow, composite longbow, shortbow, composite shortbow", "+2 racial bonus on Listen, Search, and Spot checks", "Automatic Search check within 5 ft of secret doors"],
    favoredClass: "Wizard", languages: { auto: ["Common", "Elven"], bonus: ["Draconic", "Gnoll", "Gnome", "Goblin", "Orc", "Sylvan"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Gnome": {
    name: "Gnome", source: "Core Rulebook", sourceKey: "core", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 0, con: 2, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision", "+2 racial bonus on saves vs. illusions", "+1 to DC of illusion spells cast", "+1 attack bonus vs. kobolds and goblinoids", "+4 dodge bonus to AC vs. giants", "+2 racial bonus on Listen checks", "+2 racial bonus on Craft (alchemy) checks", "Speak with Animals (burrowing mammals) 1/day", "Weapon Familiarity: gnome hooked hammer"],
    favoredClass: "Bard", languages: { auto: ["Common", "Gnome"], bonus: ["Draconic", "Dwarven", "Elven", "Giant", "Goblin", "Orc"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Half-Elf": {
    name: "Half-Elf", source: "Core Rulebook", sourceKey: "core", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision", "Immunity to magic sleep effects", "+2 racial bonus on saves vs. enchantment", "+1 racial bonus on Listen, Search, and Spot checks", "+2 racial bonus on Diplomacy and Gather Information checks", "Elven Blood"],
    favoredClass: "Any", languages: { auto: ["Common", "Elven"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Half-Orc": {
    name: "Half-Orc", source: "Core Rulebook", sourceKey: "core", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 0, int: -2, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Orc Blood (counts as orc for effects relating to race)"],
    favoredClass: "Barbarian", languages: { auto: ["Common", "Orc"], bonus: ["Draconic", "Giant", "Goblin", "Abyssal"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Halfling": {
    name: "Halfling", source: "Core Rulebook", sourceKey: "core", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["+1 racial bonus on all saving throws", "+2 morale bonus on saving throws vs. fear (stacks)", "+1 attack bonus with thrown weapons and slings", "+2 racial bonus on Climb, Jump, Listen, and Move Silently checks"],
    favoredClass: "Rogue", languages: { auto: ["Common", "Halfling"], bonus: ["Dwarven", "Elven", "Gnome", "Goblin", "Orc"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Drow": {
    name: "Drow", source: "Underdark", sourceKey: "underdark", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 0, cha: 2 },
    LA: 2, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 120, lowLightVision: false,
    traits: ["Darkvision 120 ft", "+2 racial bonus on Will saves vs. spells and spell-like abilities", "Spell Resistance 11 + class level", "Spell-like abilities: Dancing Lights, Darkness, Faerie Fire 1/day", "+2 racial bonus on Listen, Search, and Spot checks", "Automatic Search for secret doors within 5 ft", "Proficient with rapier, hand crossbow, short sword", "Light Blindness: sunlight or daylight spell blinds for 1 round then dazzles", "LA +2"],
    favoredClass: "Wizard (male) / Cleric (female)", languages: { auto: ["Common", "Elven", "Undercommon"], bonus: ["Abyssal", "Draconic", "Drow Sign Language", "Gnome", "Goblin"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesUnd.html"
  },
  "Duergar": {
    name: "Duergar", source: "Underdark", sourceKey: "underdark", size: "Medium", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: -4 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 120, lowLightVision: false,
    traits: ["Darkvision 120 ft", "Immunity to paralysis, phantasms, and magical/alchemical poison", "+2 racial bonus on saves vs. spells and spell-like effects", "Stability: +4 vs. bull rush and trip", "Spell-like abilities: Enlarge Person and Invisibility 1/day (caster level = HD)", "+4 racial bonus on Move Silently checks", "+1 attack bonus vs. orcs and goblinoids", "+4 dodge bonus to AC vs. giants", "Light Sensitivity", "LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common", "Dwarven", "Undercommon"], bonus: ["Draconic", "Giant", "Goblin", "Orc", "Terran"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesUnd.html"
  },
  "Svirfneblin": {
    name: "Svirfneblin", source: "Underdark", sourceKey: "underdark", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 2, con: 0, int: 0, wis: 2, cha: -4 },
    LA: 3, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 120, lowLightVision: false,
    traits: ["Darkvision 120 ft", "Spell Resistance 11 + class level", "+2 racial bonus on saves vs. spells", "Spell-like abilities: Blindness/Deafness, Blur, Disguise Self 1/day", "+2 stonecunning", "+2 racial bonus on Craft (alchemy)", "+4 racial bonus on Hide checks underground", "LA +3"],
    favoredClass: "Rogue", languages: { auto: ["Common", "Gnome", "Undercommon"], bonus: ["Draconic", "Dwarven", "Elven", "Goblin", "Terran"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesUnd.html"
  },
  "Aasimar": {
    name: "Aasimar", source: "Planar Handbook", sourceKey: "planarHandbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 2, cha: 2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Daylight 1/day", "Resistance to acid 5, cold 5, electricity 5", "+2 racial bonus on Spot and Listen checks", "Native outsider (cannot be raised, reincarnated; can be resurrected)", "LA +1"],
    favoredClass: "Paladin", languages: { auto: ["Common", "Celestial"], bonus: ["Draconic", "Dwarven", "Elven", "Gnome", "Halfling", "Sylvan"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPlanar.html"
  },
  "Tiefling": {
    name: "Tiefling", source: "Planar Handbook", sourceKey: "planarHandbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Darkness 1/day", "Resistance to cold 5, electricity 5, fire 5", "+2 racial bonus on Bluff and Hide checks", "Native outsider", "LA +1"],
    favoredClass: "Rogue", languages: { auto: ["Common", "Infernal"], bonus: ["Draconic", "Dwarven", "Elven", "Gnome", "Goblin", "Halfling", "Orc"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPlanar.html"
  },
  "Air Genasi": {
    name: "Air Genasi", source: "Planar Handbook", sourceKey: "planarHandbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Levitate 1/day (caster level 5th)", "Breathe air indefinitely underwater", "Outsider traits", "LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common", "Auran"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPlanar.html"
  },
  "Earth Genasi": {
    name: "Earth Genasi", source: "Planar Handbook", sourceKey: "planarHandbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Pass Without Trace 1/day (caster level 5th)", "Outsider traits", "LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common", "Terran"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPlanar.html"
  },
  "Fire Genasi": {
    name: "Fire Genasi", source: "Planar Handbook", sourceKey: "planarHandbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 2, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Control Flame 1/day (caster level 5th)", "Fire resistance 5", "Outsider traits", "LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common", "Ignan"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPlanar.html"
  },
  "Water Genasi": {
    name: "Water Genasi", source: "Planar Handbook", sourceKey: "planarHandbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Create Water 1/day (caster level 5th)", "Breathe water (can breathe both air and water)", "Swim speed 30 ft", "Outsider traits", "LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common", "Aquan"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPlanar.html"
  },
  "Raptoran": {
    name: "Raptoran", source: "Races of the Wild", sourceKey: "racesOfTheWild", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: 40,
    abilityMods: { str: 0, dex: 2, con: 0, int: 0, wis: 2, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision", "Glide (30 ft) until 5th level, then fly 40 ft (average) at 5th level", "+4 racial bonus to Spot checks", "+2 racial bonus on Jump checks", "Foot Talons: 1d4 damage"],
    favoredClass: "Ranger", languages: { auto: ["Common", "Raptoran"], bonus: ["Auran", "Celestial", "Draconic", "Sylvan"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRotw.html"
  },
  "Catfolk": {
    name: "Catfolk", source: "Races of the Wild", sourceKey: "racesOfTheWild", size: "Medium", speed: 40,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 1, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision", "+2 natural armor", "+4 racial bonus on Balance and Jump checks", "+2 racial bonus on Spot checks", "Pounce (full attack on charge)", "Claws: 1d4 damage (as medium creature)"],
    favoredClass: "Ranger", languages: { auto: ["Common", "Catfolk"], bonus: ["Elven", "Gnoll", "Goblin", "Halfling", "Sylvan"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRotw.html"
  },
  "Warforged": {
    name: "Warforged", source: "Eberron", sourceKey: "eberron", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 2, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Composite Plating: +2 natural armor (does not stack with other armor worn except magic enhancement bonus)", "Living Construct subtype: immune to poison, disease, nausea, fatigue, exhaustion, fear, paralysis, sleep, sickened", "Does not breathe, eat, or sleep", "Healed by repair spells, harmed by damage spells", "Cannot be raised or resurrected", "+2 racial bonus on saves vs. ongoing effects"],
    favoredClass: "Fighter", languages: { auto: ["Common"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesEberron.html"
  },
  "Changeling": {
    name: "Changeling", source: "Eberron", sourceKey: "eberron", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Minor Change Shape (alter physical appearance at will)", "+2 racial bonus on Bluff, Disguise, and Sense Motive checks", "Humanoid (shapechanger) type"],
    favoredClass: "Rogue", languages: { auto: ["Common"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesEberron.html"
  },
  "Shifter": {
    name: "Shifter", source: "Eberron", sourceKey: "eberron", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: -2, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision", "Shifting: once/day as a swift action, manifest animalistic traits for a number of rounds equal to 3 + Con modifier", "Humanoid (shapechanger) type", "+2 racial bonus on Balance, Climb, Jump, and Swim checks"],
    favoredClass: "Ranger", languages: { auto: ["Common"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesEberron.html"
  },
  "Elan": {
    name: "Elan", source: "Expanded Psionics", sourceKey: "psionic", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Aberration type (not humanoid)", "Resistance (1 pp): +4 racial bonus on saving throws until start of next turn", "Resilience (2 pp): reduce damage from a single attack by 2", "Repletion (1 pp): sustain themselves without food or water for 24 hours", "Naturally psionic: 2 bonus power points at 1st level"],
    favoredClass: "Psion", languages: { auto: ["Common"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Dromite": {
    name: "Dromite", source: "Expanded Psionics", sourceKey: "psionic", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 0, con: 0, int: 0, wis: 0, cha: 2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 1, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft", "Naturally psionic: 1 bonus power point at 1st level", "Energy ray (Cha-based DC): 1d6 energy damage, 1/day", "Resistance to chosen energy type 5", "+1 natural armor bonus from chitin"],
    favoredClass: "Wilder", languages: { auto: ["Common"], bonus: ["Dwarven", "Gnome", "Goblin", "Halfling", "Terran"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Githyanki": {
    name: "Githyanki", source: "Expanded Psionics", sourceKey: "psionic", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 0, int: 2, wis: 0, cha: 0 },
    LA: 2, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Naturally psionic: 3 bonus power points at 1st level", "Spell-like abilities: Daze, Mage Hand, Blur (3/day), Dimension Door (3/day), Telekinesis (at will at 11th level)", "+2 racial bonus on saves vs. spells and spell-like effects", "Humanoid (extraplanar) type", "LA +2"],
    favoredClass: "Fighter", languages: { auto: ["Common", "Gith"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Githzerai": {
    name: "Githzerai", source: "Expanded Psionics", sourceKey: "psionic", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 2, cha: 0 },
    LA: 2, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Naturally psionic: 3 bonus power points at 1st level", "Spell-like abilities: Daze, Mage Hand, Blur (3/day), Dimension Door (3/day), Plane Shift (1/day at 15th level)", "Inertial armor: +4 armor bonus to AC (psionic)", "Humanoid (extraplanar) type", "LA +2"],
    favoredClass: "Monk", languages: { auto: ["Common", "Gith"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Half-Giant": {
    name: "Half-Giant", source: "Expanded Psionics", sourceKey: "psionic", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 2, int: 0, wis: 0, cha: 0 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Naturally psionic: 2 bonus power points at 1st level", "Naturally Strong (Ex): +2 Strength, stacks above", "Fire acclimated: +2 racial bonus on saves vs. fire", "Powerful Build: treated as one size larger for carrying capacity, fighting with oversized weapons, grapple", "LA +1"],
    favoredClass: "Psychic Warrior", languages: { auto: ["Common"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Maenad": {
    name: "Maenad", source: "Expanded Psionics", sourceKey: "psionic", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Naturally psionic: 2 bonus power points at 1st level", "Outburst (Ex): once per day, gain +2 Str and Con and –2 to AC for 4 rounds", "Sonic affinity: +1 racial bonus on Concentration checks related to sonic powers/spells"],
    favoredClass: "Wilder", languages: { auto: ["Common", "Maenad"], bonus: ["Aquan", "Draconic", "Dwarven", "Elven", "Goblin"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Xeph": {
    name: "Xeph", source: "Expanded Psionics", sourceKey: "psionic", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Naturally psionic: 1 bonus power point at 1st level", "Burst (Su): 3/day increase land speed by 10 ft for 3 rounds", "+1 racial bonus on saves vs. powers, spells, and spell-like effects"],
    favoredClass: "Soulknife", languages: { auto: ["Common", "Xeph"], bonus: ["Draconic", "Elven", "Gnoll", "Goblin", "Halfling", "Sylvan"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
};

export const ALL_SOURCES = Array.from(new Set(Object.values(FALLBACK_RACES).map(r => r.source))).sort();