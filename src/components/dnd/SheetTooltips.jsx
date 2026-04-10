import { useState, useRef } from 'react';
import {
  getDerivedStats, getAbilityScores, getAbilityMods, getClassStats,
  SIZE_ATTACK_MOD, SIZE_AC_MOD, SIZE_CMB_MOD,
} from '../../lib/characterEngine';
import { getFeatDatabase } from '../../lib/featDatabase';

// ─── Core Tooltip ────────────────────────────────────────────────────────────

export function Tooltip({ children, content, wide = false }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, above: false });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipW = wide ? 320 : 220;
    const tooltipH = 180; // estimate
    const above = rect.bottom + tooltipH + 6 > window.innerHeight;
    setPos({
      x: Math.min(rect.left, window.innerWidth - tooltipW - 16),
      y: above ? rect.top - tooltipH - 6 : rect.bottom + 6,
      above,
    });
    setVisible(true);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      style={{ cursor: 'help', borderBottom: '1px dotted rgba(255,200,50,0.4)' }}
    >
      {children}
      {visible && (
        <div style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          background: '#1a1208',
          border: '1px solid #8b6914',
          borderRadius: '4px',
          padding: '8px 12px',
          maxWidth: wide ? '320px' : '220px',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#e8d5a0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          {content}
        </div>
      )}
    </span>
  );
}

// ─── Stat Breakdown Display ───────────────────────────────────────────────────

export function StatBreakdown({ rows, total, label, isScore }) {
  return (
    <div>
      <div style={{ fontWeight: 'bold', color: '#f0c040', marginBottom: '4px', fontSize: '13px' }}>
        {label}
      </div>
      {(rows || []).map((row, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ color: '#c8b070' }}>{row.label}</span>
          <span style={{
            color: row.value > 0 ? '#90ee90' : row.value < 0 ? '#ff8080' : '#e8d5a0',
            fontWeight: 'bold',
          }}>
            {isScore ? row.value : (row.value >= 0 ? '+' : '')}{row.value}
          </span>
        </div>
      ))}
      {rows?.length > 0 && (
        <div style={{
          borderTop: '1px solid #8b6914', marginTop: '4px', paddingTop: '4px',
          display: 'flex', justifyContent: 'space-between', fontWeight: 'bold',
        }}>
          <span>Total</span>
          <span style={{ color: '#f0c040' }}>
            {isScore ? total : (total >= 0 ? '+' : '')}{total}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Feat Description Tooltip Content ────────────────────────────────────────

export function FeatTooltipContent({ feat }) {
  const db = getFeatDatabase();
  const dbFeat = db.find(f => f.id === feat.id);
  if (!dbFeat?.description) {
    return <span style={{ color: '#888' }}>No description available</span>;
  }
  const rendered = dbFeat.description
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  return (
    <div style={{ maxWidth: '300px' }}>
      <div style={{ fontWeight: 'bold', color: '#f0c040', marginBottom: '6px', fontSize: '13px' }}>
        {dbFeat.name}
      </div>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{dbFeat.source}</div>
      <div
        style={{ fontSize: '12px', lineHeight: '1.6' }}
        dangerouslySetInnerHTML={{ __html: `<p>${rendered}</p>` }}
      />
      {dbFeat.prereqs?.length > 0 && (
        <div style={{
          marginTop: '8px', borderTop: '1px solid #8b6914', paddingTop: '6px',
          fontSize: '11px', color: '#a08040',
        }}>
          <strong>Requires:</strong> {dbFeat.prereqs.map(p => p.message).join(' • ')}
        </div>
      )}
    </div>
  );
}

// ─── Stat Breakdown Calculator ────────────────────────────────────────────────

export function getStatBreakdown(char, statName) {
  const stats  = getDerivedStats(char);
  const scores = getAbilityScores(char);
  const mods   = getAbilityMods(char);
  const misc   = char.miscMods || {};
  const race   = char.race;
  const cls    = getClassStats(char);

  switch (statName) {
    case 'str': case 'dex': case 'con': case 'int': case 'wis': case 'cha': {
      const rows = [];
      rows.push({ label: 'Base score', value: char.baseAbilities[statName] || 10 });
      const racialMod = race?.abilityMods?.[statName] || 0;
      if (racialMod) rows.push({ label: `Racial (${race.name})`, value: racialMod });
      const increases = (char.abilityIncreases || []).filter(i => i.stat === statName && i.atLevel <= stats.totalLevel);
      if (increases.length) rows.push({ label: `Level increases (×${increases.length})`, value: increases.length });
      const miscMod = misc[statName] || 0;
      if (miscMod) rows.push({ label: 'Misc/Magic', value: miscMod });
      return { rows, total: scores[statName], label: statName.toUpperCase() + ' Score', isScore: true };
    }

    case 'strMod': case 'dexMod': case 'conMod': case 'intMod': case 'wisMod': case 'chaMod': {
      const s = statName.replace('Mod', '');
      return {
        rows: [{ label: `${s.toUpperCase()} score (${scores[s]})`, value: mods[s] }],
        total: mods[s],
        label: s.toUpperCase() + ' Modifier',
      };
    }

    case 'melee': {
      const rows = [{ label: 'Base Attack Bonus', value: cls.totalBAB }];
      if (mods.str !== 0) rows.push({ label: `STR modifier (${scores.str})`, value: mods.str });
      const sizeMod = SIZE_ATTACK_MOD[stats.size] || 0;
      if (sizeMod) rows.push({ label: `Size (${stats.size})`, value: sizeMod });
      if (misc.meleeAttack) rows.push({ label: 'Misc/Magic', value: misc.meleeAttack });
      return { rows, total: stats.meleeAtk, label: 'Melee Attack Bonus' };
    }

    case 'ranged': {
      const rows = [{ label: 'Base Attack Bonus', value: cls.totalBAB }];
      if (mods.dex !== 0) rows.push({ label: `DEX modifier (${scores.dex})`, value: mods.dex });
      const sizeMod = SIZE_ATTACK_MOD[stats.size] || 0;
      if (sizeMod) rows.push({ label: `Size (${stats.size})`, value: sizeMod });
      if (misc.rangedAttack) rows.push({ label: 'Misc/Magic', value: misc.rangedAttack });
      return { rows, total: stats.rangedAtk, label: 'Ranged Attack Bonus' };
    }

    case 'ac': {
      const rows = [{ label: 'Base', value: 10 }];
      const armor = char.equipment?.armor;
      if (armor?.acBonus) rows.push({ label: `Armor (${armor.name})`, value: armor.acBonus });
      const shield = char.equipment?.shield;
      if (shield?.acBonus) rows.push({ label: `Shield (${shield.name})`, value: shield.acBonus });
      if (mods.dex !== 0) {
        const maxDex = armor?.maxDex ?? 99;
        const applied = Math.min(mods.dex, maxDex);
        rows.push({ label: `DEX modifier (${scores.dex})${mods.dex > maxDex ? ' [capped]' : ''}`, value: applied });
      }
      const sizeMod = SIZE_AC_MOD[stats.size] || 0;
      if (sizeMod) rows.push({ label: `Size (${stats.size})`, value: sizeMod });
      const natArmor = (race?.naturalArmor || 0) + (misc.naturalArmor || 0);
      if (natArmor) rows.push({ label: 'Natural Armor', value: natArmor });
      if (misc.deflection) rows.push({ label: 'Deflection', value: misc.deflection });
      if (misc.ac) rows.push({ label: 'Misc', value: misc.ac });
      return { rows, total: stats.ac, label: 'Armor Class' };
    }

    case 'touchAC': {
      const rows = [{ label: 'Base', value: 10 }];
      if (mods.dex !== 0) rows.push({ label: `DEX modifier (${scores.dex})`, value: mods.dex });
      const sizeMod = SIZE_AC_MOD[stats.size] || 0;
      if (sizeMod) rows.push({ label: `Size (${stats.size})`, value: sizeMod });
      if (misc.deflection) rows.push({ label: 'Deflection', value: misc.deflection });
      return { rows, total: stats.touchAC, label: 'Touch AC' };
    }

    case 'flatFootAC': {
      const rows = [{ label: 'Base', value: 10 }];
      const armor = char.equipment?.armor;
      if (armor?.acBonus) rows.push({ label: `Armor (${armor.name})`, value: armor.acBonus });
      const shield = char.equipment?.shield;
      if (shield?.acBonus) rows.push({ label: `Shield (${shield.name})`, value: shield.acBonus });
      const sizeMod = SIZE_AC_MOD[stats.size] || 0;
      if (sizeMod) rows.push({ label: `Size (${stats.size})`, value: sizeMod });
      const natArmor = (race?.naturalArmor || 0) + (misc.naturalArmor || 0);
      if (natArmor) rows.push({ label: 'Natural Armor', value: natArmor });
      if (misc.deflection) rows.push({ label: 'Deflection', value: misc.deflection });
      return { rows, total: stats.flatFootAC, label: 'Flat-Footed AC' };
    }

    case 'initiative': {
      const rows = [{ label: `DEX modifier (${scores.dex})`, value: mods.dex }];
      if (misc.initiative) rows.push({ label: 'Misc/Feat bonus', value: misc.initiative });
      return { rows, total: stats.initiative, label: 'Initiative' };
    }

    case 'fort': {
      const rows = [{ label: 'Base save (class)', value: stats.baseFort }];
      if (mods.con !== 0) rows.push({ label: `CON modifier (${scores.con})`, value: mods.con });
      if (misc.fort) rows.push({ label: 'Misc/Magic', value: misc.fort });
      return { rows, total: stats.fort, label: 'Fortitude Save' };
    }

    case 'ref': {
      const rows = [{ label: 'Base save (class)', value: stats.baseRef }];
      if (mods.dex !== 0) rows.push({ label: `DEX modifier (${scores.dex})`, value: mods.dex });
      if (misc.ref) rows.push({ label: 'Misc/Magic', value: misc.ref });
      return { rows, total: stats.ref, label: 'Reflex Save' };
    }

    case 'will': {
      const rows = [{ label: 'Base save (class)', value: stats.baseWill }];
      if (mods.wis !== 0) rows.push({ label: `WIS modifier (${scores.wis})`, value: mods.wis });
      if (misc.will) rows.push({ label: 'Misc/Magic', value: misc.will });
      return { rows, total: stats.will, label: 'Will Save' };
    }

    case 'cmb': {
      const rows = [{ label: 'Base Attack Bonus', value: cls.totalBAB }];
      if (mods.str !== 0) rows.push({ label: `STR modifier (${scores.str})`, value: mods.str });
      const sizeMod = SIZE_CMB_MOD[stats.size] || 0;
      if (sizeMod) rows.push({ label: `Size (${stats.size})`, value: sizeMod });
      return { rows, total: stats.cmb, label: 'CMB (Grapple/Trip/etc.)' };
    }

    case 'hp': {
      const rolls = char.hp?.rolls || [];
      const rows = rolls.map(r => ({ label: `Level ${r.level} (d${r.classHD})`, value: r.value }));
      const conPer = mods.con;
      if (conPer !== 0 && rolls.length > 0) {
        rows.push({ label: `CON modifier ×${rolls.length} levels`, value: conPer * rolls.length });
      }
      return { rows, total: stats.maxHP, label: 'Max Hit Points', isScore: true };
    }

    case 'speed': {
      const rows = [{ label: `Base (${race?.name || 'race'})`, value: race?.speed || 30 }];
      const armor = char.equipment?.armor;
      if (armor?.type === 'heavy' && (race?.speed || 30) === 30) {
        rows.push({ label: 'Heavy armor penalty', value: -10 });
      }
      if (misc.speed) rows.push({ label: 'Misc', value: misc.speed });
      return { rows, total: stats.speed, label: 'Base Speed', isScore: true };
    }

    default:
      return null;
  }
}