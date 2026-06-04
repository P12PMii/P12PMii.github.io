const ALL_UPGRADES = [
  { id: 'dmg',    name: 'FIREPOWER',  icon: '💥', desc: 'Projectile\ndamage +50%',   maxPicks: 4,
    apply: p => { p.projectileDamage = Math.round(p.projectileDamage * 1.5); } },
  { id: 'spd',    name: 'SWIFT',      icon: '⚡', desc: 'Move speed\n+25%',           maxPicks: 3,
    apply: p => { p.speed = Math.min(p.speed * 1.25, PLAYER_SPEED * 2); } },
  { id: 'fire',   name: 'RAPID FIRE', icon: '🔫', desc: 'Fire rate\n+40%',            maxPicks: 3,
    apply: p => { p.fireCooldown = Math.max(p.fireCooldown * 0.6, 0.06); } },
  { id: 'hp',     name: 'IRON WILL',  icon: '❤️', desc: 'Max HP +30\n& full heal',   maxPicks: 4,
    apply: p => { p.maxHP += 30; p.hp = p.maxHP; } },
  { id: 'pierce', name: 'PIERCE',     icon: '🏹', desc: 'Projectiles\npenetrate',     maxPicks: 1,
    apply: p => { p.piercing = true; } },
  { id: 'multi',  name: 'SPREAD',     icon: '✨', desc: '+2 shots\n(max 5)',           maxPicks: 2,
    apply: p => { p.multiShot = Math.min((p.multiShot || 1) + 2, 5); } },
  { id: 'xp',     name: 'MAGNET',     icon: '🧲', desc: 'XP pickup\nrange x2',       maxPicks: 2,
    apply: p => { p.xpRange *= 2; } },
  { id: 'armour',  name: 'ARMOR',      icon: '🛡️', desc: 'Take 30%\nless damage',
    apply: p => { p.armor = Math.min((p.armor || 0) + 0.30, 0.75); } },
  { id: 'orbital', name: 'ORBITAL',   icon: '💫', desc: 'Ring: 15 DPS\n+range per LV', maxPicks: 3,
    apply: p => { p.orbitalRings = (p.orbitalRings || 0) + 1; } },
];

function pickUpgrades(count) {
  const p     = game.player;
  const picks = p.upgradePicks;

  // Remove upgrades that have hit their cap
  const eligible = ALL_UPGRADES.filter(u => !u.maxPicks || (picks[u.id] || 0) < u.maxPicks);

  // Situational weight: low HP → defensive options appear more
  const lowHP = p.hp / p.maxHP < 0.4;
  const weighted = [];
  for (const u of eligible) {
    const isDefensive = u.id === 'hp' || u.id === 'armour';
    const weight = lowHP && isDefensive ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(u);
  }

  // Shuffle, then deduplicate by id
  weighted.sort(() => Math.random() - 0.5);
  const seen   = new Set();
  const result = [];
  for (const u of weighted) {
    if (!seen.has(u.id)) {
      seen.add(u.id);
      result.push(u);
    }
    if (result.length >= count) break;
  }
  return result;
}
