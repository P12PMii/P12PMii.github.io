function autoFire() {
  const p = game.player;

  let nearest = null, nearestDist = Infinity;
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.wx - p.wx, e.wy - p.wy);
    if (d < nearestDist) { nearestDist = d; nearest = e; }
  }

  let baseAngle = 0;
  if (nearest) baseAngle = Math.atan2(nearest.wy - p.wy, nearest.wx - p.wx);

  const shots  = p.multiShot || 1;
  const spread = shots > 1 ? 0.22 : 0;
  const offset = -(shots - 1) / 2 * spread;

  for (let i = 0; i < shots; i++) {
    const angle = baseAngle + offset + i * spread;
    const vx = Math.cos(angle) * PROJECTILE_SPEED;
    const vy = Math.sin(angle) * PROJECTILE_SPEED;
    game.projectiles.push(makeProjectile(p.wx, p.wy, vx, vy, p.projectileDamage, p.piercing));
  }
}

function killEnemy(e) {
  if (!e.alive) return;
  e.alive = false;
  game.player.killCount++;

  // Splitter spawns 2 weakened normals on death
  if (e.type === 'splitter' && !e.hasSplit) {
    e.hasSplit = true;
    for (const offset of [-18, 18]) {
      const child    = makeEnemy(e.wx + offset, e.wy, game.gameTime);
      child.hp       = Math.max(1, Math.round(child.maxHP * 0.4));
      child.maxHP    = child.hp;
      child.size     = 14;
      game.enemies.push(child);
    }
  }

  const maxGems  = e.isBoss ? 15 : e.isMiniBoss ? 8 : 6;
  const gemCount = Math.min(Math.ceil(e.maxHP / ENEMY_BASE_HP), maxGems);
  for (let i = 0; i < gemCount; i++) {
    const angle = (i / gemCount) * Math.PI * 2;
    const dist  = gemCount > 1 ? 10 : 0;
    game.xpGems.push(makeXpGem(
      e.wx + Math.cos(angle) * dist,
      e.wy + Math.sin(angle) * dist,
    ));
  }
}

function addDamageNumber(wx, wy, dmg) {
  game.damageNumbers.push({ wx, wy: wy - 20, val: Math.round(dmg), age: 0 });
}
