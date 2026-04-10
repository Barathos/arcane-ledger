import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAbilityScore, getEncumbrance, getTotalWeight } from '../../../lib/dndData';
import SectionCard from '../SectionCard';
import { Plus, Trash2, Package } from 'lucide-react';

function ItemForm({ fields, onAdd }) {
  const [values, setValues] = useState({});
  const handleAdd = () => {
    if (!values.name?.trim()) return;
    onAdd({ ...values, name: values.name.trim() });
    setValues({});
  };
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {fields.map(f => (
        <Input
          key={f.key}
          type={f.type || 'text'}
          value={values[f.key] || ''}
          onChange={e => setValues({ ...values, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
          placeholder={f.label}
          className={`bg-secondary/50 border-border font-crimson text-sm ${f.width || 'w-32'}`}
        />
      ))}
      <Button onClick={handleAdd} variant="outline" size="sm" className="border-primary/30 text-primary">
        <Plus className="w-3 h-3 mr-1" /> Add
      </Button>
    </div>
  );
}

function ItemList({ items, onRemove, columns }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground text-center py-2 font-crimson">No items</p>;
  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1 text-xs font-crimson">
          {columns.map(col => (
            <span key={col.key} className={`${col.width || 'flex-1'} text-foreground`}>
              {col.prefix}{item[col.key] || '—'}{col.suffix || ''}
            </span>
          ))}
          <Button size="sm" variant="ghost" onClick={() => onRemove(idx)} className="text-destructive h-5 w-5 p-0">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function EquipmentStep({ character, updateCharacter }) {
  const strScore = getAbilityScore(character, 'STR');
  const enc = getEncumbrance(strScore);
  const totalWeight = getTotalWeight(character);

  const addItem = (category, item) => {
    updateCharacter({
      equipment: { ...character.equipment, [category]: [...(character.equipment[category] || []), item] }
    });
  };
  const removeItem = (category, idx) => {
    updateCharacter({
      equipment: { ...character.equipment, [category]: character.equipment[category].filter((_, i) => i !== idx) }
    });
  };
  const setMoney = (type, value) => {
    updateCharacter({ money: { ...character.money, [type]: parseInt(value) || 0 } });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Weapons">
        <ItemForm
          fields={[
            { key: 'name', label: 'Name', width: 'w-36' },
            { key: 'damage', label: 'Damage', width: 'w-20' },
            { key: 'critRange', label: 'Crit', width: 'w-20' },
            { key: 'damageType', label: 'Type', width: 'w-20' },
            { key: 'range', label: 'Range', width: 'w-20' },
            { key: 'weight', label: 'Weight', type: 'number', width: 'w-16' },
            { key: 'notes', label: 'Notes', width: 'w-32' },
          ]}
          onAdd={item => addItem('weapons', { ...item, quantity: 1 })}
        />
        <ItemList
          items={character.equipment.weapons || []}
          onRemove={idx => removeItem('weapons', idx)}
          columns={[
            { key: 'name', width: 'w-36' },
            { key: 'damage', width: 'w-20' },
            { key: 'critRange', width: 'w-20' },
            { key: 'damageType', width: 'w-20' },
            { key: 'range', width: 'w-20' },
            { key: 'weight', width: 'w-16', suffix: ' lbs' },
            { key: 'notes', width: 'flex-1' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Armor & Shield">
        <ItemForm
          fields={[
            { key: 'name', label: 'Name', width: 'w-36' },
            { key: 'acBonus', label: 'AC Bonus', type: 'number', width: 'w-20' },
            { key: 'maxDex', label: 'Max DEX', type: 'number', width: 'w-20' },
            { key: 'acp', label: 'ACP', type: 'number', width: 'w-16' },
            { key: 'spellFailure', label: 'Spell Fail %', type: 'number', width: 'w-20' },
            { key: 'speed', label: 'Speed', width: 'w-16' },
            { key: 'weight', label: 'Weight', type: 'number', width: 'w-16' },
          ]}
          onAdd={item => addItem('armor', { ...item, quantity: 1 })}
        />
        <ItemList
          items={character.equipment.armor || []}
          onRemove={idx => removeItem('armor', idx)}
          columns={[
            { key: 'name', width: 'w-36' },
            { key: 'acBonus', width: 'w-20', prefix: 'AC+' },
            { key: 'maxDex', width: 'w-20', prefix: 'DEX≤' },
            { key: 'acp', width: 'w-16', prefix: 'ACP ' },
            { key: 'spellFailure', width: 'w-20', suffix: '%' },
            { key: 'weight', width: 'w-16', suffix: ' lbs' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Other Gear">
        <ItemForm
          fields={[
            { key: 'name', label: 'Name', width: 'w-40' },
            { key: 'quantity', label: 'Qty', type: 'number', width: 'w-16' },
            { key: 'weight', label: 'Weight', type: 'number', width: 'w-16' },
            { key: 'value', label: 'Value (gp)', width: 'w-20' },
          ]}
          onAdd={item => addItem('gear', item)}
        />
        <ItemList
          items={character.equipment.gear || []}
          onRemove={idx => removeItem('gear', idx)}
          columns={[
            { key: 'name', width: 'w-40' },
            { key: 'quantity', width: 'w-16', prefix: 'x' },
            { key: 'weight', width: 'w-16', suffix: ' lbs' },
            { key: 'value', width: 'w-20' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Encumbrance & Money">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-crimson text-sm text-muted-foreground">Total Weight:</span>
              <span className={`font-cinzel font-bold ${
                totalWeight > enc.heavy ? 'text-destructive' : totalWeight > enc.medium ? 'text-orange-400' : totalWeight > enc.light ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {totalWeight.toFixed(1)} lbs
              </span>
            </div>
            <div className="flex gap-3 text-xs font-crimson">
              <span className="text-green-400">Light: ≤{enc.light}</span>
              <span className="text-yellow-400">Med: ≤{enc.medium}</span>
              <span className="text-red-400">Heavy: ≤{enc.heavy}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-crimson mb-2">Money</p>
            <div className="grid grid-cols-4 gap-2">
              {['cp', 'sp', 'gp', 'pp'].map(type => (
                <div key={type}>
                  <label className="text-xs text-muted-foreground font-crimson uppercase">{type}</label>
                  <Input
                    type="number"
                    value={character.money[type] || 0}
                    onChange={e => setMoney(type, e.target.value)}
                    className="bg-secondary/50 border-border font-crimson text-sm h-8"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}