import { getDefaultCharacter } from './dndData';

const STORAGE_KEY = 'dnd35_characters';
const ACTIVE_KEY = 'dnd35_active_character';

export function loadAllCharacters() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveAllCharacters(characters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

export function loadActiveCharacterName() {
  return localStorage.getItem(ACTIVE_KEY) || null;
}

export function saveActiveCharacterName(name) {
  localStorage.setItem(ACTIVE_KEY, name);
}

export function loadCharacter(name) {
  const chars = loadAllCharacters();
  return chars[name] || null;
}

export function saveCharacter(name, character) {
  const chars = loadAllCharacters();
  chars[name] = character;
  saveAllCharacters(chars);
  saveActiveCharacterName(name);
}

export function deleteCharacter(name) {
  const chars = loadAllCharacters();
  delete chars[name];
  saveAllCharacters(chars);
}

export function exportCharacterJSON(character) {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name || 'character'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importCharacterJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      resolve({ ...getDefaultCharacter(), ...data });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}