import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Save, Download, Upload, Plus, Trash2, Sword, ScrollText, Dices } from 'lucide-react';
import {
  getDefaultCharacter, saveCharacterToStorage, loadAllCharactersFromStorage,
  loadActiveCharacterFromStorage, deleteCharacterFromStorage, exportCharacter, importCharacter
} from '../lib/characterEngine';
import CharacterBuilder from '../components/dnd/CharacterBuilder';
import CharacterSheet from '../components/dnd/CharacterSheet';
import PlayMode from '../components/dnd/PlayMode';

export default function DnDApp() {
  const [character, setCharacter] = useState(() => loadActiveCharacterFromStorage() || getDefaultCharacter());
  const [savedChars, setSavedChars] = useState(() => loadAllCharactersFromStorage());
  const [activeTab, setActiveTab] = useState('builder');
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [newCharName, setNewCharName] = useState('');

  // Auto-save on every change
  useEffect(() => {
    saveCharacterToStorage(character);
    setSavedChars(loadAllCharactersFromStorage());
  }, [character]);

  const updateCharacter = useCallback((updates) => {
    setCharacter(prev => {
      if (typeof updates === 'function') return updates(prev);
      return { ...prev, ...updates };
    });
  }, []);

  const handleSave = () => {
    saveCharacterToStorage(character);
    setSavedChars(loadAllCharactersFromStorage());
  };

  const handleLoad = (name) => {
    const chars = loadAllCharactersFromStorage();
    if (chars[name]) {
      setCharacter({ ...getDefaultCharacter(), ...chars[name] });
      setShowLoadDialog(false);
    }
  };

  const handleDelete = (name) => {
    deleteCharacterFromStorage(name);
    setSavedChars(loadAllCharactersFromStorage());
  };

  const handleNew = () => {
    setCharacter({ ...getDefaultCharacter(), name: newCharName || '' });
    setNewCharName('');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imported = await importCharacterJSON(file);
      setCharacter(imported);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sword className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold text-primary tracking-wide">D&D 3.5 Forge</h1>
              <p className="text-xs text-muted-foreground font-crimson">
                {character.name || 'New Character'} — {character.classes.map(c => `${c.name} ${c.levels || c.level || 1}`).join(' / ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button size="sm" variant="outline" onClick={handleSave} className="border-primary/30 text-primary hover:bg-primary/10">
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                  <ScrollText className="w-4 h-4 mr-1" /> Load
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-cinzel text-primary">Saved Characters</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.keys(savedChars).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">No saved characters yet</p>
                  )}
                  {Object.keys(savedChars).map(name => (
                    <div key={name} className="flex items-center justify-between p-2 rounded bg-secondary/50 hover:bg-secondary">
                      <button onClick={() => handleLoad(name)} className="text-left flex-1 text-foreground font-crimson">
                        {name}
                      </button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(name)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => exportCharacter(character)} className="border-primary/30 text-primary hover:bg-primary/10">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <label className="cursor-pointer">
              <Button size="sm" variant="outline" asChild className="border-primary/30 text-primary hover:bg-primary/10">
                <span><Upload className="w-4 h-4 mr-1" /> Import</span>
              </Button>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <Button size="sm" variant="outline" onClick={handleNew} className="border-primary/30 text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border p-1 w-full sm:w-auto">
            <TabsTrigger value="builder" className="font-cinzel data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Sword className="w-4 h-4" /> Builder
            </TabsTrigger>
            <TabsTrigger value="sheet" className="font-cinzel data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <ScrollText className="w-4 h-4" /> Sheet
            </TabsTrigger>
            <TabsTrigger value="play" className="font-cinzel data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Dices className="w-4 h-4" /> Play
            </TabsTrigger>
          </TabsList>
          <TabsContent value="builder">
            <CharacterBuilder character={character} updateCharacter={updateCharacter} />
          </TabsContent>
          <TabsContent value="sheet">
            <CharacterSheet character={character} />
          </TabsContent>
          <TabsContent value="play">
            <PlayMode character={character} updateCharacter={updateCharacter} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}