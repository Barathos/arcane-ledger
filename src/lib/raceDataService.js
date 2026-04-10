// D&D 3.5 SRD Race Database Service
// This data is from a finalized game system (D&D 3.5e, ~2007) and never changes.
// Once fetched, it is cached permanently in localStorage.

const CACHE_KEY = 'dnd35_race_database';
const PROGRESS_KEY = 'dnd35_race_db_progress'; // tracks which sources have been fetched

// Primary sources
const SRD_RACE_PAGES = {
  "Player's Handbook":            "https://srd.dndtools.org/srd/races/racesCore.html",
  "Monster Manual":               "https://srd.dndtools.org/srd/races/monstersAsRaces.html",
  "Unearthed Arcana":             "https://srd.dndtools.org/srd/races/racesEnvironment.html",
  "Races of Faerûn":              "https://srd.dndtools.org/srd/races/racesRof.html",
  "Underdark":                    "https://srd.dndtools.org/srd/races/racesUnd.html",
  "Dragons of Faerûn":            "https://srd.dndtools.org/srd/races/racesDof.html",
  "Eberron Campaign Setting":     "https://srd.dndtools.org/srd/races/racesEberron.html",
  "Magic of Eberron":             "https://srd.dndtools.org/srd/races/racesMoe.html",
  "Races of Destiny":             "https://srd.dndtools.org/srd/races/racesRod.html",
  "Races of Stone":               "https://srd.dndtools.org/srd/races/racesRos.html",
  "Races of the Wild":            "https://srd.dndtools.org/srd/races/racesRotw.html",
  "Races of the Dragon":          "https://srd.dndtools.org/srd/races/racesRotd.html",
  "Expanded Psionics Handbook":   "https://srd.dndtools.org/srd/races/racesPsionic.html",
  "Planar Handbook":              "https://srd.dndtools.org/srd/races/racesPlanar.html",
  "Frostburn":                    "https://srd.dndtools.org/srd/races/racesFrost.html",
  "Sandstorm":                    "https://srd.dndtools.org/srd/races/racesSand.html",
  "Stormwrack":                   "https://srd.dndtools.org/srd/races/racesStorm.html",
  "Oriental Adventures":          "https://srd.dndtools.org/srd/races/racesOa.html",
  "Shining South":                "https://srd.dndtools.org/srd/races/racesSsouth.html",
  "Magic of Incarnum":            "https://srd.dndtools.org/srd/races/racesMoi.html",
  "Dragon Magic":                 "https://srd.dndtools.org/srd/races/racesDrm.html",
  "Dragonlance Campaign Setting": "https://srd.dndtools.org/srd/races/racesDlance.html",
  "Races of Ansalon":             "https://srd.dndtools.org/srd/races/racesRoa.html",
  "Book of Exalted Deeds":        "https://srd.dndtools.org/srd/races/racesBoed.html",
  "Book of Vile Darkness":        "https://srd.dndtools.org/srd/races/racesBovd.html",
  "Dragon Magazine":              "https://srd.dndtools.org/srd/races/racesDramag.html",
};

const SRD_RACE_PAGES_SECONDARY = [
  "https://srd.dndtools.org/srd/races/racesRofaerun.html",
  "https://srd.dndtools.org/srd/races/racesUa.html",
  "https://srd.dndtools.org/srd/races/racesCRuin.html",
  "https://srd.dndtools.org/srd/races/racesCompPsi.html",
  "https://srd.dndtools.org/srd/races/racesDracon.html",
  "https://srd.dndtools.org/srd/races/racesDc.html",
  "https://srd.dndtools.org/srd/races/racesDouD.html",
  "https://srd.dndtools.org/srd/races/racesEdp.html",
  "https://srd.dndtools.org/srd/races/racesFc2.html",
  "https://srd.dndtools.org/srd/races/racesPgtf.html",
  "https://srd.dndtools.org/srd/races/racesSos.html",
  "https://srd.dndtools.org/srd/races/racesSox.html",
  "https://srd.dndtools.org/srd/races/racesSk.html",
  "https://srd.dndtools.org/srd/races/racesTom.html",
  "https://srd.dndtools.org/srd/races/racesUe.html",
  "https://srd.dndtools.org/srd/races/racesMm3.html",
  "https://srd.dndtools.org/srd/races/racesMm4.html",
  "https://srd.dndtools.org/srd/races/racesMm5.html",
  "https://srd.dndtools.org/srd/races/racesBoe.html",
  "https://srd.dndtools.org/srd/races/racesSecSar.html",
  "https://srd.dndtools.org/srd/races/racesSecXen.html",
  "https://srd.dndtools.org/srd/races/racesSerKing.html",
];

export const ALL_SOURCE_KEYS = [
  ...Object.keys(SRD_RACE_PAGES),
  ...SRD_RACE_PAGES_SECONDARY.map(u => u.split('/').pop().replace('.html', '')),
];
export const TOTAL_SOURCES = ALL_SOURCE_KEYS.length;

export const RACE_SOURCE_CATALOG = {
  // PLAYER'S HANDBOOK
  "Human": "Player's Handbook",
  "Dwarf": "Player's Handbook",
  "Elf": "Player's Handbook",
  "Gnome": "Player's Handbook",
  "Half-Elf": "Player's Handbook",
  "Half-Orc": "Player's Handbook",
  "Halfling": "Player's Handbook",
  // DUNGEON MASTER'S GUIDE
  "Gold Dwarf": "Dungeon Master's Guide",
  "Half-Human Elf": "Dungeon Master's Guide",
  // MONSTER MANUAL
  "Hound Archon": "Monster Manual",
  "Azer": "Monster Manual",
  "Bugbear": "Monster Manual",
  "Centaur": "Monster Manual",
  "Doppelganger": "Monster Manual",
  "Deep Dwarf": "Monster Manual",
  "Duergar": "Monster Manual",
  "Mountain Dwarf": "Monster Manual",
  "Aquatic Elf": "Monster Manual",
  "Drow": "Monster Manual",
  "Gray Elf": "Monster Manual",
  "Wild Elf": "Monster Manual",
  "Wood Elf": "Monster Manual",
  "Gargoyle": "Monster Manual",
  "Jann": "Monster Manual",
  "Hill Giant": "Monster Manual",
  "Stone Giant": "Monster Manual",
  "Githyanki": "Monster Manual",
  "Githzerai": "Monster Manual",
  "Gnoll": "Monster Manual",
  "Forest Gnome": "Monster Manual",
  "Svirfneblin": "Monster Manual",
  "Goblin": "Monster Manual",
  "Grimlock": "Monster Manual",
  "Deep Halfling": "Monster Manual",
  "Tallfellow": "Monster Manual",
  "Hobgoblin": "Monster Manual",
  "Kobold": "Monster Manual",
  "Lizardfolk": "Monster Manual",
  "Lycanthrope": "Monster Manual",
  "Mind Flayer": "Monster Manual",
  "Minotaur": "Monster Manual",
  "Ogre": "Monster Manual",
  "Ogre Mage": "Monster Manual",
  "Orc": "Monster Manual",
  "Aasimar": "Monster Manual",
  "Tiefling": "Monster Manual",
  "Rakshasa": "Monster Manual",
  "Satyr": "Monster Manual",
  "Pixie": "Monster Manual",
  "Troglodyte": "Monster Manual",
  "Troll": "Monster Manual",
  "Yuan-Ti Pureblood": "Monster Manual",
  // BOOK OF EXALTED DEEDS
  "Exalted Bariaur": "Book of Exalted Deeds",
  // BOOK OF VILE DARKNESS
  "Vasharan": "Book of Vile Darkness",
  "Jerren": "Book of Vile Darkness",
  // CHAMPIONS OF RUIN
  "Draegloth": "Champions of Ruin",
  "Extaminaar": "Champions of Ruin",
  "Krinth": "Champions of Ruin",
  // COMPLETE PSIONICS
  "Synad": "Complete Psionics",
  // DRACONOMICON
  "Dragonkin": "Draconomicon",
  // DRAGON COMPENDIUM
  "Diaboli": "Dragon Compendium",
  "Diopsid": "Dragon Compendium",
  "Dvati": "Dragon Compendium",
  "Lupin": "Dragon Compendium",
  "Tibbit": "Dragon Compendium",
  // DRAGON MAGIC
  "Silverbrow Human": "Dragon Magic",
  "Deepwyrm Drow": "Dragon Magic",
  "Half-Deepwyrm Drow": "Dragon Magic",
  "Fireblood Dwarf": "Dragon Magic",
  "Forestlord Elf": "Dragon Magic",
  "Forestlord Half-Elf": "Dragon Magic",
  "Stonehunter Gnome": "Dragon Magic",
  "Glimmerskin Halfling": "Dragon Magic",
  "Viletooth Lizardfolk": "Dragon Magic",
  "Sunscorch Hobgoblin": "Dragon Magic",
  "Frostblood Orc": "Dragon Magic",
  "Frostblood Half-Orc": "Dragon Magic",
  // DRAGONLANCE
  "Kagonesti": "Dragonlance Campaign Setting",
  "Qualinesti": "Dragonlance Campaign Setting",
  "Silvanesti": "Dragonlance Campaign Setting",
  "Sea Elf (Dragonlance)": "Dragonlance Campaign Setting",
  "Kender": "Dragonlance Campaign Setting",
  "Afflicted Kender": "Dragonlance Campaign Setting",
  "Gully Dwarf": "Dragonlance Campaign Setting",
  "Baaz Draconian": "Dragonlance Campaign Setting",
  "Kapak Draconian": "Dragonlance Campaign Setting",
  "Irda": "Dragonlance Campaign Setting",
  "Half-Ogre": "Dragonlance Campaign Setting",
  "Krynnish Minotaur": "Dragonlance Campaign Setting",
  // DRAGONS OF FAERÛN
  "Draconic Hobgoblin": "Dragons of Faerûn",
  "Half-Blue Dragon Hobgoblin": "Dragons of Faerûn",
  "Half-Black Dragon Human": "Dragons of Faerûn",
  "Zar'ithra'rin": "Dragons of Faerûn",
  "Zekylyn": "Dragons of Faerûn",
  // DROW OF THE UNDERDARK
  "Vril": "Drow of the Underdark",
  // EBERRON
  "Changeling": "Eberron Campaign Setting",
  "Kalashtar": "Eberron Campaign Setting",
  "Shifter": "Eberron Campaign Setting",
  "Warforged": "Eberron Campaign Setting",
  "Inspired": "Eberron Campaign Setting",
  // EXPANDED PSIONICS
  "Dromite": "Expanded Psionics Handbook",
  "Elan": "Expanded Psionics Handbook",
  "Half-Giant": "Expanded Psionics Handbook",
  "Maenad": "Expanded Psionics Handbook",
  "Thri-Kreen": "Expanded Psionics Handbook",
  "Xeph": "Expanded Psionics Handbook",
  "Blue (Goblin)": "Expanded Psionics Handbook",
  "Unbodied": "Expanded Psionics Handbook",
  // EXPEDITION TO THE DEMONWEB PITS
  "Cambion": "Expedition to the Demonweb Pits",
  // FIENDISH CODEX II
  "Hellbred": "Fiendish Codex II",
  // FROSTBURN
  "Glacier Dwarf": "Frostburn",
  "Snow Elf": "Frostburn",
  "Ice Gnome": "Frostburn",
  "Tundra Halfling": "Frostburn",
  "Neanderthal": "Frostburn",
  "Uldra": "Frostburn",
  "Domovoi": "Frostburn",
  "Frost Folk": "Frostburn",
  "Snow Goblin": "Frostburn",
  // MAGIC OF EBERRON
  "Daelkyr Half-Blood": "Magic of Eberron",
  "Psiforged": "Magic of Eberron",
  // MAGIC OF INCARNUM
  "Azurin": "Magic of Incarnum",
  "Duskling": "Magic of Incarnum",
  "Rilkan": "Magic of Incarnum",
  "Skarn": "Magic of Incarnum",
  // MONSTER MANUAL 3
  "Armand": "Monster Manual 3",
  "Dracotaur": "Monster Manual 3",
  "Sand Giant": "Monster Manual 3",
  "Flind": "Monster Manual 3",
  "Goatfolk": "Monster Manual 3",
  "Forestkith Goblin": "Monster Manual 3",
  "Harssaf": "Monster Manual 3",
  "Kenku": "Monster Manual 3",
  "Blackscale Lizardfolk": "Monster Manual 3",
  "Poison Dusk Lizardfolk": "Monster Manual 3",
  "Lumi": "Monster Manual 3",
  "Nycters": "Monster Manual 3",
  "Skullcrusher Ogre": "Monster Manual 3",
  "Quaraphon": "Monster Manual 3",
  "Naztharune Rakshasa": "Monster Manual 3",
  "Crystalline Troll": "Monster Manual 3",
  "Warforged Charger": "Monster Manual 3",
  "Warforged Scout": "Monster Manual 3",
  "Witchknife": "Monster Manual 3",
  // MONSTER MANUAL 4
  "Varag": "Monster Manual 4",
  "Windrazor": "Monster Manual 4",
  "Windscythe": "Monster Manual 4",
  // MONSTER MANUAL 5
  "Jaebrin": "Monster Manual 5",
  // ORIENTAL ADVENTURES
  "Hengeyokai": "Oriental Adventures",
  "Korobokuru": "Oriental Adventures",
  "Nezumi": "Oriental Adventures",
  "Spirit Folk": "Oriental Adventures",
  "Vanara": "Oriental Adventures",
  // PLANAR HANDBOOK
  "Bariaur": "Planar Handbook",
  "Buomman": "Planar Handbook",
  "Mephling": "Planar Handbook",
  "Neraphim": "Planar Handbook",
  "Shadowswyfts": "Planar Handbook",
  "Spiker": "Planar Handbook",
  "Wildren": "Planar Handbook",
  "Frost Dwarf": "Planar Handbook",
  "Fire Gnome": "Planar Handbook",
  // PLAYER'S GUIDE TO FAERÛN
  "Lesser Gray Dwarf": "Player's Guide to Faerûn",
  "Lesser Drow": "Player's Guide to Faerûn",
  "Lesser Planetouched": "Player's Guide to Faerûn",
  "Lesser Deep Gnome": "Player's Guide to Faerûn",
  // RACES OF ANSALON
  "Ithin'Carthian": "Races of Ansalon",
  "Thoradorian Minotaur": "Races of Ansalon",
  "Wendle Centaur": "Races of Ansalon",
  "Kyrie": "Races of Ansalon",
  "Phaethon": "Races of Ansalon",
  "Thanoi": "Races of Ansalon",
  "Ursoi": "Races of Ansalon",
  "Half-Kender": "Races of Ansalon",
  "Tinker Gnome": "Races of Ansalon",
  // RACES OF DESTINY
  "Illumian": "Races of Destiny",
  "Mongrelfolk": "Races of Destiny",
  "Sea Kin": "Races of Destiny",
  "Sharakim": "Races of Destiny",
  "Skulk": "Races of Destiny",
  "Underfolk": "Races of Destiny",
  // RACES OF FAERÛN
  "Arctic Dwarf": "Races of Faerûn",
  "Shield Dwarf": "Races of Faerûn",
  "Urdunnir": "Races of Faerûn",
  "Wild Dwarf": "Races of Faerûn",
  "Avariel": "Races of Faerûn",
  "Moon Elf": "Races of Faerûn",
  "Sun Elf": "Races of Faerûn",
  "Half-Drow": "Races of Faerûn",
  "Ghostwise Halfling": "Races of Faerûn",
  "Lightfoot Halfling": "Races of Faerûn",
  "Strongheart Halfling": "Races of Faerûn",
  "Air Genasi": "Races of Faerûn",
  "Earth Genasi": "Races of Faerûn",
  "Fire Genasi": "Races of Faerûn",
  "Water Genasi": "Races of Faerûn",
  "Fey'ri": "Races of Faerûn",
  "Tanarukk": "Races of Faerûn",
  "Gray Orc": "Races of Faerûn",
  "Mountain Orc": "Races of Faerûn",
  "Shade": "Races of Faerûn",
  "Wemic": "Races of Faerûn",
  "Kir-Lanan": "Races of Faerûn",
  "Aarakocra": "Races of Faerûn",
  "Dekanter Goblin": "Races of Faerûn",
  // RACES OF STONE
  "Goliath": "Races of Stone",
  "Chaos Gnome": "Races of Stone",
  "Dream Dwarf": "Races of Stone",
  "Feral Gargun": "Races of Stone",
  "Stonechild": "Races of Stone",
  "Whisper Gnome": "Races of Stone",
  // RACES OF THE DRAGON
  "Dragonborn of Bahamut": "Races of the Dragon",
  "Spellscale": "Races of the Dragon",
  // RACES OF THE WILD
  "Raptoran": "Races of the Wild",
  "Catfolk": "Races of the Wild",
  "Killoren": "Races of the Wild",
  // SANDSTORM
  "Asherat": "Sandstorm",
  "Bhuka": "Sandstorm",
  "Badlands Dwarf": "Sandstorm",
  "Painted Elf": "Sandstorm",
  "Scablands Half-Orc": "Sandstorm",
  "Crucian": "Sandstorm",
  // SECRETS OF SARLONA
  "Eneko": "Secrets of Sarlona",
  // SECRETS OF XEN'DRIK
  "Jungle Giant": "Secrets of Xen'drik",
  // SERPENT KINGDOMS
  "Bladeback": "Serpent Kingdoms",
  "Finhead": "Serpent Kingdoms",
  "Flyer (Saurial)": "Serpent Kingdoms",
  "Hornhead": "Serpent Kingdoms",
  // SHINING SOUTH
  "Loxo": "Shining South",
  "Cyclops": "Shining South",
  "Tasloi": "Shining South",
  // STORMWRACK
  "Aventi": "Stormwrack",
  "Darfellan": "Stormwrack",
  "Hadozee": "Stormwrack",
  "Seacliff Dwarf": "Stormwrack",
  "Wavecrest Gnome": "Stormwrack",
  "Aquatic Half-Elf": "Stormwrack",
  "Shoal Halfling": "Stormwrack",
  // TOME OF MAGIC
  "Karsite": "Tome of Magic",
  // UNAPPROACHABLE EAST
  "Star Elf": "Unapproachable East",
  "Hagspawn": "Unapproachable East",
  "Taer": "Unapproachable East",
  "Volodni": "Unapproachable East",
  // UNDERDARK
  "Chitine": "Underdark",
  "Deep Imaskari": "Underdark",
  "Gloaming": "Underdark",
  "Kuo-Toa": "Underdark",
  "Slyth": "Underdark",
  // UNEARTHED ARCANA
  "Aquatic Dwarf": "Unearthed Arcana",
  "Aquatic Elf": "Unearthed Arcana",
  "Aquatic Gnome": "Unearthed Arcana",
  "Aquatic Goblin": "Unearthed Arcana",
  "Aquatic Half-Orc": "Unearthed Arcana",
  "Aquatic Halfling": "Unearthed Arcana",
  "Aquatic Human": "Unearthed Arcana",
  "Aquatic Kobold": "Unearthed Arcana",
  "Aquatic Orc": "Unearthed Arcana",
  "Arctic Elf": "Unearthed Arcana",
  "Arctic Gnome": "Unearthed Arcana",
  "Arctic Goblin": "Unearthed Arcana",
  "Arctic Half-Elf": "Unearthed Arcana",
  "Arctic Half-Orc": "Unearthed Arcana",
  "Arctic Halfling": "Unearthed Arcana",
  "Arctic Kobold": "Unearthed Arcana",
  "Arctic Orc": "Unearthed Arcana",
  "Desert Dwarf": "Unearthed Arcana",
  "Desert Elf": "Unearthed Arcana",
  "Desert Gnome": "Unearthed Arcana",
  "Desert Goblin": "Unearthed Arcana",
  "Desert Half-Elf": "Unearthed Arcana",
  "Desert Half-Orc": "Unearthed Arcana",
  "Desert Halfling": "Unearthed Arcana",
  "Desert Kobold": "Unearthed Arcana",
  "Desert Orc": "Unearthed Arcana",
  "Jungle Dwarf": "Unearthed Arcana",
  "Jungle Elf": "Unearthed Arcana",
  "Jungle Gnome": "Unearthed Arcana",
  "Jungle Goblin": "Unearthed Arcana",
  "Jungle Half-Elf": "Unearthed Arcana",
  "Jungle Half-Orc": "Unearthed Arcana",
  "Jungle Halfling": "Unearthed Arcana",
  "Jungle Kobold": "Unearthed Arcana",
  "Jungle Orc": "Unearthed Arcana",
  "Air Gnome": "Unearthed Arcana",
  "Air Goblin": "Unearthed Arcana",
  "Earth Dwarf": "Unearthed Arcana",
  "Earth Kobold": "Unearthed Arcana",
  "Fire Elf": "Unearthed Arcana",
  "Fire Half-Elf": "Unearthed Arcana",
  "Fire Hobgoblin": "Unearthed Arcana",
  "Water Half-Orc": "Unearthed Arcana",
  "Water Halfling": "Unearthed Arcana",
  "Water Orc": "Unearthed Arcana",
  // DRAGON MAGAZINE
  "Axani": "Dragon Magazine #297",
  "Cansin": "Dragon Magazine #297",
  "Dust Para-Genasi": "Dragon Magazine #297",
  "Ice Para-Genasi": "Dragon Magazine #297",
  "Magma Para-Genasi": "Dragon Magazine #297",
  "Ooze Para-Genasi": "Dragon Magazine #297",
  "Smoke Para-Genasi": "Dragon Magazine #297",
  "Steam Para-Genasi": "Dragon Magazine #297",
  "Mortif": "Dragon Magazine #313",
  "Ghost Elf": "Dragon Magazine #313",
  "Bozak Draconian": "Dragon Magazine #315",
  "Tortle": "Dragon Magazine #315",
  "Adu'ja": "Dragon Magazine #317",
  "Gruwaar": "Dragon Magazine #317",
  "Golmoid": "Dragon Magazine #317",
  "T'kel": "Dragon Magazine #317",
  "Glimmerfolk": "Dragon Magazine #321",
  "Menta Cyclopean": "Dragon Magazine #323",
  "Grippli": "Dragon Magazine #324",
  "Saurian Shifter": "Dragon Magazine #328",
  "Umbragen": "Dragon Magazine #330",
  "Giff": "Dragon Magazine #339",
  "Insectare": "Dragon Magazine #339",
  "Scro": "Dragon Magazine #339",
  "Phanaton": "Dragon Magazine #339",
  "Xvart": "Dragon Magazine #339",
  "Norker": "Dragon Magazine #343",
  "Azerblood": "Dragon Magazine #350",
  "Celadrin": "Dragon Magazine #350",
  "D'hin": "Dragon Magazine #350",
  "Worghest": "Dragon Magazine #350",
  "Cactacae": "Dragon Magazine #352",
  "Khepri": "Dragon Magazine #352",
  "Remade": "Dragon Magazine #352",
  "Vodyanoi": "Dragon Magazine #352",
  "Garuda": "Dragon Magazine #352",
  "Exiled Modron": "Dragon Magazine #354",
  "Duthka'gith": "Dungeon Magazine #100",
};

// Source category groups for UI
export const SOURCE_GROUPS = [
  {
    label: "Core Books",
    sources: ["Player's Handbook", "Dungeon Master's Guide", "Monster Manual", "Monster Manual 3", "Monster Manual 4", "Monster Manual 5", "Unearthed Arcana"],
  },
  {
    label: "Forgotten Realms",
    sources: ["Races of Faerûn", "Underdark", "Dragons of Faerûn", "Player's Guide to Faerûn", "Unapproachable East", "Champions of Ruin", "Drow of the Underdark", "Serpent Kingdoms"],
  },
  {
    label: "Eberron",
    sources: ["Eberron Campaign Setting", "Magic of Eberron", "Secrets of Sarlona", "Secrets of Xen'drik"],
  },
  {
    label: "Races Series",
    sources: ["Races of Destiny", "Races of Stone", "Races of the Wild", "Races of the Dragon", "Races of Ansalon"],
  },
  {
    label: "Psionics",
    sources: ["Expanded Psionics Handbook", "Complete Psionics"],
  },
  {
    label: "Planar / Alignment",
    sources: ["Planar Handbook", "Book of Exalted Deeds", "Book of Vile Darkness", "Expedition to the Demonweb Pits", "Fiendish Codex II"],
  },
  {
    label: "Environment",
    sources: ["Frostburn", "Sandstorm", "Stormwrack"],
  },
  {
    label: "Magic & Other",
    sources: ["Magic of Incarnum", "Dragon Magic", "Draconomicon", "Tome of Magic", "Dragon Compendium"],
  },
  {
    label: "Regional",
    sources: ["Oriental Adventures", "Shining South"],
  },
  {
    label: "Dragonlance",
    sources: ["Dragonlance Campaign Setting", "Races of Ansalon"],
  },
  {
    label: "Dragon / Dungeon Magazine",
    sources: [
      "Dragon Magazine #297","Dragon Magazine #313","Dragon Magazine #315","Dragon Magazine #317",
      "Dragon Magazine #321","Dragon Magazine #323","Dragon Magazine #324","Dragon Magazine #328",
      "Dragon Magazine #330","Dragon Magazine #339","Dragon Magazine #343","Dragon Magazine #350",
      "Dragon Magazine #352","Dragon Magazine #354","Dungeon Magazine #100",
    ],
  },
];

// ─── Fetch helpers ───────────────────────────────────────────────────────────

export async function fetchRacePage(url) {
  try {
    const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if (r.ok) return await r.text();
  } catch {}
  try {
    const r2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (r2.ok) { const d = await r2.json(); return d.contents; }
  } catch {}
  return null;
}

// ─── Parse helpers ───────────────────────────────────────────────────────────

function parseAbilityMods(text) {
  const mods = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const abilityMap = {
    'strength': 'str', 'dexterity': 'dex', 'constitution': 'con',
    'intelligence': 'int', 'wisdom': 'wis', 'charisma': 'cha'
  };
  const pattern = /([+\-\u2013\u2014]?\d+)\s+(?:bonus to\s+|penalty to\s+|racial bonus to\s+)?(?:inherent bonus to\s+)?(strength|dexterity|constitution|intelligence|wisdom|charisma)/gi;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const ab = abilityMap[m[2].toLowerCase()];
    if (ab) mods[ab] = parseInt(m[1].replace(/[\u2013\u2014]/g, '-'));
  }
  return mods;
}

function parseSpeed(text) {
  const m = text.match(/base land speed is (\d+) feet/i) || text.match(/land speed of (\d+) feet/i) || text.match(/speed[:\s]+(\d+) ft/i);
  return m ? parseInt(m[1]) : 30;
}

function parseSize(text) {
  for (const s of ['Fine','Diminutive','Tiny','Small','Medium','Large','Huge','Gargantuan','Colossal']) {
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
  const m = text.match(/[Ss]pell [Rr]esistance[:\s]+([\d+\-a-z\s]+?)[\.\n]/);
  return m ? m[1].trim() : null;
}

function parseRacialHD(text) {
  const m = text.match(/(\d+)\s+(d\d+)\s+(?:racial\s+)?[Hh]it\s+[Dd]ice/i);
  if (!m) return { racialHD: 0, racialHDType: null };
  return { racialHD: parseInt(m[1]), racialHDType: m[2] };
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
}

export function parseRacesFromHTML(html, sourceLabel, sourceUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const races = [];

  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5');
  headings.forEach(heading => {
    const text = heading.textContent.trim();
    if (!text || text.length > 60 || text.length < 2) return;
    if (/table|contents|introduction|overview|chapter|appendix|index|note|racial traits/i.test(text)) return;

    let content = '';
    let el = heading.nextElementSibling;
    let depth = 0;
    while (el && depth < 30) {
      if (/^h[1-3]$/i.test(el.tagName)) break;
      content += el.textContent + '\n';
      el = el.nextElementSibling;
      depth++;
    }

    if (!content || content.length < 50) return;
    if (!/racial traits/i.test(content) && !/ability\s+adj/i.test(content)) return;

    const raceName = toTitleCase(text.replace(/\s+/g, ' ').trim());
    if (!raceName || raceName.length < 2) return;

    const listItems = [];
    let el2 = heading.nextElementSibling;
    let d2 = 0;
    while (el2 && d2 < 30) {
      if (/^h[1-3]$/i.test(el2.tagName)) break;
      el2.querySelectorAll('li').forEach(li => {
        const t = li.textContent.trim();
        if (t && t.length > 5) listItems.push(t);
      });
      el2 = el2.nextElementSibling;
      d2++;
    }

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
    const swimM = content.match(/swim speed of (\d+)/i);
    const flyM = content.match(/fly speed of (\d+)/i);
    const anchor = heading.id || heading.getAttribute('name') || '';
    const srdUrl = anchor ? `${sourceUrl}#${anchor}` : sourceUrl;

    races.push({
      name: raceName,
      source: sourceLabel,
      size, speed,
      swimSpeed: swimM ? parseInt(swimM[1]) : null,
      flySpeed: flyM ? parseInt(flyM[1]) : null,
      abilityMods, LA, racialHD, racialHDType,
      racialBAB: 0,
      racialSaves: { fort: 0, ref: 0, will: 0 },
      naturalArmor, SR, darkvision, lowLightVision,
      traits: listItems.length > 0 ? listItems : [content.slice(0, 300).trim()],
      favoredClass,
      languages: { auto: [], bonus: [] },
      srdUrl,
      statsLoaded: true,
    });
  });

  return races;
}

// ─── Stub builder ────────────────────────────────────────────────────────────

export function buildCatalogStubs() {
  const db = {};
  Object.entries(FALLBACK_RACES).forEach(([name, data]) => {
    db[name] = { ...data, statsLoaded: true };
  });
  Object.entries(RACE_SOURCE_CATALOG).forEach(([name, source]) => {
    if (!db[name]) {
      const sourceUrl = SRD_RACE_PAGES[source] || null;
      db[name] = {
        name, source,
        size: null, speed: null, abilityMods: null,
        LA: null, racialHD: 0, racialHDType: null,
        racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
        naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
        traits: null, favoredClass: null,
        languages: { auto: [], bonus: [] },
        srdUrl: sourceUrl || null,
        statsLoaded: false,
      };
    }
  });
  return db;
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

function getCompletedSources() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function markSourceComplete(key) {
  const done = getCompletedSources();
  if (!done.includes(key)) {
    done.push(key);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(done));
  }
}

export function isFullyLoaded() {
  const done = getCompletedSources();
  return done.length >= TOTAL_SOURCES;
}

export function getLoadProgress() {
  return { done: getCompletedSources().length, total: TOTAL_SOURCES };
}

// ─── Main load function (with resume) ────────────────────────────────────────

export async function loadAllRacesWithResume(onProgress) {
  // Load current db (may be partial from a previous interrupted run)
  let db;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    db = raw ? JSON.parse(raw) : buildCatalogStubs();
  } catch {
    db = buildCatalogStubs();
  }
  if (Object.keys(db).length === 0) db = buildCatalogStubs();

  const completedSources = getCompletedSources();
  const primaryEntries = Object.entries(SRD_RACE_PAGES);
  const allSources = [
    ...primaryEntries.map(([label, url]) => ({ key: label, url, label })),
    ...SRD_RACE_PAGES_SECONDARY.map(url => {
      const key = url.split('/').pop().replace('.html', '');
      return { key, url, label: key };
    }),
  ];

  const total = allSources.length;
  let completed = completedSources.length;

  if (onProgress) onProgress(completed, total, { ...db });

  for (const { key, url, label } of allSources) {
    if (completedSources.includes(key)) continue; // already done — skip

    const html = await fetchRacePage(url);
    if (html) {
      const races = parseRacesFromHTML(html, label, url);
      races.forEach(r => { db[r.name] = r; });
    }

    markSourceComplete(key);
    completed++;

    // Persist partial db after each source so interrupted loads can resume
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(db)); } catch {}

    if (onProgress) onProgress(completed, total, { ...db });
  }

  return db;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function getRaceDatabase(onProgress) {
  // If we have ANY cached data, use it — this data never changes
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const db = JSON.parse(cached);
      if (Object.keys(db).length > 0) return db;
    }
  } catch {}

  // Only fetch if we have nothing at all
  return await loadAllRacesWithResume(onProgress);
}

// ─── Debug: hard reset (escape hatch only) ───────────────────────────────────

export function hardResetRaceDatabase() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
}

// ─── Fallback hardcoded race data ────────────────────────────────────────────

export const FALLBACK_RACES = {
  "Human": {
    name: "Human", source: "Player's Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Bonus feat at 1st level", "4 extra skill points at 1st level, +1 per level after", "Favored class: Any"],
    favoredClass: "Any", languages: { auto: ["Common"], bonus: ["Any"] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Dwarf": {
    name: "Dwarf", source: "Player's Handbook", size: "Medium", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Stonecunning","Stability: +4 vs. bull rush/trip","Weapon Familiarity: dwarven waraxe/urgrosh","+2 saves vs. poison","+2 saves vs. spells","+1 attack vs. orcs/goblinoids","+4 dodge AC vs. giants"],
    favoredClass: "Fighter", languages: { auto: ["Common","Dwarven"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Elf": {
    name: "Elf", source: "Player's Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: -2, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision","Immunity to magic sleep effects","+2 saves vs. enchantment","Weapon Proficiency: longsword/rapier/longbow/shortbow","+2 Listen/Search/Spot","Auto Search for secret doors within 5 ft"],
    favoredClass: "Wizard", languages: { auto: ["Common","Elven"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Gnome": {
    name: "Gnome", source: "Player's Handbook", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 0, con: 2, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision","+2 saves vs. illusions","+1 DC to illusion spells","+1 attack vs. kobolds/goblinoids","+4 dodge AC vs. giants","+2 Listen/Craft (alchemy)","Speak with Animals 1/day"],
    favoredClass: "Bard", languages: { auto: ["Common","Gnome"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Half-Elf": {
    name: "Half-Elf", source: "Player's Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision","Immunity to sleep effects","+2 saves vs. enchantment","+1 Listen/Search/Spot","+2 Diplomacy/Gather Information","Elven Blood"],
    favoredClass: "Any", languages: { auto: ["Common","Elven"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Half-Orc": {
    name: "Half-Orc", source: "Player's Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 0, int: -2, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Orc Blood"],
    favoredClass: "Barbarian", languages: { auto: ["Common","Orc"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Halfling": {
    name: "Halfling", source: "Player's Handbook", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["+1 all saving throws","+2 morale bonus vs. fear","+1 attack with thrown weapons/slings","+2 Climb/Jump/Listen/Move Silently"],
    favoredClass: "Rogue", languages: { auto: ["Common","Halfling"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesCore.html"
  },
  "Drow": {
    name: "Drow", source: "Monster Manual", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 0, cha: 2 },
    LA: 2, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 120, lowLightVision: false,
    traits: ["Darkvision 120 ft","+2 Will saves vs. spells","SR 11 + class level","Spell-like: Dancing Lights/Darkness/Faerie Fire 1/day","+2 Listen/Search/Spot","Light Blindness","LA +2"],
    favoredClass: "Wizard (m) / Cleric (f)", languages: { auto: ["Common","Elven","Undercommon"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/monstersAsRaces.html"
  },
  "Duergar": {
    name: "Duergar", source: "Monster Manual", size: "Medium", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: -4 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 120, lowLightVision: false,
    traits: ["Darkvision 120 ft","Immunity to paralysis/phantasms/alchemical poison","+2 saves vs. spells","Stability","Enlarge Person/Invisibility 1/day","+4 Move Silently","Light Sensitivity","LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common","Dwarven","Undercommon"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/monstersAsRaces.html"
  },
  "Svirfneblin": {
    name: "Svirfneblin", source: "Monster Manual", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 2, con: 0, int: 0, wis: 2, cha: -4 },
    LA: 3, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 120, lowLightVision: false,
    traits: ["Darkvision 120 ft","SR 11 + class level","+2 saves vs. spells","Blindness/Deafness, Blur, Disguise Self 1/day","+4 Hide underground","LA +3"],
    favoredClass: "Rogue", languages: { auto: ["Common","Gnome","Undercommon"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/monstersAsRaces.html"
  },
  "Aasimar": {
    name: "Aasimar", source: "Monster Manual", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 2, cha: 2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Daylight 1/day","Resistance acid/cold/electricity 5","+2 Spot/Listen","LA +1"],
    favoredClass: "Paladin", languages: { auto: ["Common","Celestial"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/monstersAsRaces.html"
  },
  "Tiefling": {
    name: "Tiefling", source: "Monster Manual", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Darkness 1/day","Resistance cold/electricity/fire 5","+2 Bluff/Hide","LA +1"],
    favoredClass: "Rogue", languages: { auto: ["Common","Infernal"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/monstersAsRaces.html"
  },
  "Air Genasi": {
    name: "Air Genasi", source: "Races of Faerûn", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Levitate 1/day","Breathe air indefinitely","LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common","Auran"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRof.html"
  },
  "Earth Genasi": {
    name: "Earth Genasi", source: "Races of Faerûn", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Pass Without Trace 1/day","LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common","Terran"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRof.html"
  },
  "Fire Genasi": {
    name: "Fire Genasi", source: "Races of Faerûn", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 2, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Control Flame 1/day","Fire resistance 5","LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common","Ignan"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRof.html"
  },
  "Water Genasi": {
    name: "Water Genasi", source: "Races of Faerûn", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","Create Water 1/day","Swim speed 30 ft","Breathe water","LA +1"],
    favoredClass: "Fighter", languages: { auto: ["Common","Aquan"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRof.html"
  },
  "Raptoran": {
    name: "Raptoran", source: "Races of the Wild", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: 40,
    abilityMods: { str: 0, dex: 2, con: 0, int: 0, wis: 2, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision","Fly 40 ft (avg) at 5th level, glide before then","+4 Spot","+2 Jump","Foot Talons: 1d4"],
    favoredClass: "Ranger", languages: { auto: ["Common","Raptoran"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRotw.html"
  },
  "Catfolk": {
    name: "Catfolk", source: "Races of the Wild", size: "Medium", speed: 40,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 1, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision","+2 natural armor","+4 Balance/Jump","+2 Spot","Pounce","Claws: 1d4"],
    favoredClass: "Ranger", languages: { auto: ["Common","Catfolk"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesRotw.html"
  },
  "Warforged": {
    name: "Warforged", source: "Eberron Campaign Setting", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 2, int: 0, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 2, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["+2 natural armor from composite plating","Living Construct: immune to poison/disease/fatigue/fear/paralysis/sleep","Does not breathe/eat/sleep","Healed by repair spells"],
    favoredClass: "Fighter", languages: { auto: ["Common"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesEberron.html"
  },
  "Changeling": {
    name: "Changeling", source: "Eberron Campaign Setting", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Minor Change Shape at will","+2 Bluff/Disguise/Sense Motive","Humanoid (shapechanger)"],
    favoredClass: "Rogue", languages: { auto: ["Common"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesEberron.html"
  },
  "Shifter": {
    name: "Shifter", source: "Eberron Campaign Setting", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: -2, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: true,
    traits: ["Low-light vision","Shifting 1/day (swift): animalistic traits for 3+CON rounds","+2 Balance/Climb/Jump/Swim"],
    favoredClass: "Ranger", languages: { auto: ["Common"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesEberron.html"
  },
  "Elan": {
    name: "Elan", source: "Expanded Psionics Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: -2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["Aberration type","Resistance (1pp): +4 saves until next turn","Resilience (2pp): reduce damage by 2","Repletion (1pp): no food/water 24h","2 bonus power points"],
    favoredClass: "Psion", languages: { auto: ["Common"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Dromite": {
    name: "Dromite", source: "Expanded Psionics Handbook", size: "Small", speed: 20,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: -2, dex: 0, con: 0, int: 0, wis: 0, cha: 2 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 1, SR: null, darkvision: 60, lowLightVision: false,
    traits: ["Darkvision 60 ft","1 bonus power point","Energy ray 1/day: 1d6","Energy resistance 5","+1 natural armor"],
    favoredClass: "Wilder", languages: { auto: ["Common"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Githyanki": {
    name: "Githyanki", source: "Expanded Psionics Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 0, int: 2, wis: 0, cha: 0 },
    LA: 2, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["3 bonus power points","Daze/Mage Hand at will; Blur/Dimension Door 3/day","Telekinesis at will (11th+)","+2 saves vs. spells","LA +2"],
    favoredClass: "Fighter", languages: { auto: ["Common","Gith"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Githzerai": {
    name: "Githzerai", source: "Expanded Psionics Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 2, wis: 2, cha: 0 },
    LA: 2, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["3 bonus power points","Inertial armor: +4 AC","Daze/Mage Hand; Blur/Dimension Door 3/day","Plane Shift 1/day (15th+)","LA +2"],
    favoredClass: "Monk", languages: { auto: ["Common","Gith"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Half-Giant": {
    name: "Half-Giant", source: "Expanded Psionics Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 2, dex: 0, con: 2, int: 0, wis: 0, cha: 0 },
    LA: 1, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["2 bonus power points","Powerful Build: treated as Large for carry/weapons/grapple","+2 saves vs. fire","LA +1"],
    favoredClass: "Psychic Warrior", languages: { auto: ["Common"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Maenad": {
    name: "Maenad", source: "Expanded Psionics Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["2 bonus power points","Outburst 1/day: +2 STR/CON, -2 AC for 4 rounds","Sonic affinity: +1 Concentration for sonic"],
    favoredClass: "Wilder", languages: { auto: ["Common","Maenad"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
  "Xeph": {
    name: "Xeph", source: "Expanded Psionics Handbook", size: "Medium", speed: 30,
    swimSpeed: null, flySpeed: null,
    abilityMods: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    LA: 0, racialHD: 0, racialHDType: null, racialBAB: 0, racialSaves: { fort: 0, ref: 0, will: 0 },
    naturalArmor: 0, SR: null, darkvision: 0, lowLightVision: false,
    traits: ["1 bonus power point","Burst 3/day: +10 ft speed for 3 rounds","+1 saves vs. powers/spells/spell-like"],
    favoredClass: "Soulknife", languages: { auto: ["Common","Xeph"], bonus: [] },
    srdUrl: "https://srd.dndtools.org/srd/races/racesPsionic.html"
  },
};