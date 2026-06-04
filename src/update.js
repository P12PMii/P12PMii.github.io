// Boss AI — 3-phase cycle: slow chase → telegraph → dash charge
function updateBoss(boss, p, dt) {
  boss.phaseTimer += dt;

  if (boss.bossPhase === 'chase') {
    const dx = p.wx - boss.wx, dy = p.wy - boss.wy;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      boss.wx += (dx / dist) * boss.speed * dt;
      boss.wy += (dy / dist) * boss.speed * dt;
    }
    if (boss.phaseTimer >= 3.0) {
      boss.bossPhase  = 'telegraph';
      boss.phaseTimer = 0;
      boss.dashTarget = { wx: p.wx, wy: p.wy };
    }
  } else if (boss.bossPhase === 'telegraph') {
    // Stationary — warn player with colour change
    if (boss.phaseTimer >= 0.7) {
      boss.bossPhase  = 'dash';
      boss.phaseTimer = 0;
    }
  } else {
    // Dash toward locked position
    const dx   = boss.dashTarget.wx - boss.wx;
    const dy   = boss.dashTarget.wy - boss.wy;
    const dist = Math.hypot(dx, dy);
    if (dist > 6) {
      boss.wx += (dx / dist) * boss.dashSpeed * dt;
      boss.wy += (dy / dist) * boss.dashSpeed * dt;
    }
    if (boss.phaseTimer >= 0.5 || dist <= 6) {
      boss.bossPhase  = 'chase';
      boss.phaseTimer = 0;
      boss.dashTarget = null;
    }
  }
}

function update(dt) {
  if (game.state !== STATE.PLAYING) return;
  dt = Math.min(dt, MAX_DT);

  const p = game.player;
  game.gameTime += dt;

  // 30-minute death entity — repeats every 30 min; does NOT reset gameTime so scaling is preserved
  if (game.gameTime >= game._deathEntityNext) {
    game._deathEntityNext += 1800;
    game.enemies.push({
      wx: p.wx, wy: p.wy,
      hp: 999999, maxHP: 999999,
      speed: PLAYER_SPEED * 3,
      damage: p.maxHP * 60,
      alive: true, size: 36, isDeathEntity: true,
    });
  }

  // Move player
  const mv = Input.vector;
  p.wx += mv.x * p.speed * dt;
  p.wy += mv.y * p.speed * dt;

  if (p.dmgFlash > 0) p.dmgFlash -= dt;
  if (p.iframes  > 0) p.iframes  -= dt;
  if (game.bossAlert     > 0) game.bossAlert     -= dt;
  if (game.miniBossAlert > 0) game.miniBossAlert -= dt;

  // Fire timer
  p.fireTimer += dt;
  if (p.fireTimer >= p.fireCooldown) {
    p.fireTimer = 0;
    autoFire();
  }

  // Survival XP bonus — reward staying alive (+30 XP/min)
  const aliveMinutes = Math.floor(game.gameTime / 60);
  if (aliveMinutes > game._lastXpBonus) {
    game._lastXpBonus = aliveMinutes;
    p.xp += 30;
    if (p.xp >= p.xpThreshold) { triggerLevelUp(); return; }
  }

  // Spawn events — normal spawns pause during main boss; mini-boss spawns freely
  const bossAlive = game.enemies.some(e => e.isBoss && !e.isMiniBoss && e.alive);
  game.spawnTimer += dt;

  // Mini-boss every MINIBOSS_INTERVAL seconds
  const miniBossSlot = Math.floor(game.gameTime / MINIBOSS_INTERVAL);
  if (miniBossSlot > game._lastMiniBoss) {
    game._lastMiniBoss = miniBossSlot;
    game.miniBossAlert = MINIBOSS_ALERT_DUR;
    spawnMiniBoss();
  }

  // Main boss every BOSS_INTERVAL seconds
  const bossSlot = Math.floor(game.gameTime / BOSS_INTERVAL);
  if (bossSlot > game._lastBoss) {
    game._lastBoss = bossSlot;
    game.bossAlert = 3.0;
    spawnBoss();
  }

  const swarmMinutes = Math.floor(game.gameTime / 300);
  if (game._lastSwarm < swarmMinutes) {
    game._lastSwarm = swarmMinutes;
    if (game.gameTime > 5 && !bossAlive) spawnSwarm();
  }

  if (!bossAlive && game.spawnTimer >= game.spawnInterval) {
    game.spawnTimer = 0;
    const count = getSpawnCount(game.gameTime);
    for (let i = 0; i < count; i++) spawnEnemy();
    game.spawnInterval = Math.max(0.15, 1.2 - game.gameTime / 600);
  }

  // Move enemies — boss/miniboss use 3-phase AI; weavers sinusoidal
  for (const e of game.enemies) {
    if (!e.alive) continue;
    if (e.isBoss || e.isMiniBoss) { updateBoss(e, p, dt); continue; }
    const dx = p.wx - e.wx, dy = p.wy - e.wy;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      if (e.type === 'weaver') {
        e._weaverPhase = (e._weaverPhase || 0) + dt * 4.5;
        const px = -dy / dist, py = dx / dist;   // perpendicular unit vector
        e.wx += ((dx / dist) + px * Math.sin(e._weaverPhase) * 0.7) * e.speed * dt;
        e.wy += ((dy / dist) + py * Math.sin(e._weaverPhase) * 0.7) * e.speed * dt;
      } else {
        e.wx += (dx / dist) * e.speed * dt;
        e.wy += (dy / dist) * e.speed * dt;
      }
    }
  }

  // Move projectiles + cull off-screen
  for (const proj of game.projectiles) {
    if (!proj.alive) continue;
    proj.wx  += proj.vx * dt;
    proj.wy  += proj.vy * dt;
    proj.age += dt;
    if (Math.abs(proj.wx - p.wx) > W || Math.abs(proj.wy - p.wy) > H) {
      proj.alive = false;
    }
  }

  // Collision: projectile vs enemy
  for (const proj of game.projectiles) {
    if (!proj.alive) continue;
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const hw = PROJECTILE_W / 2, hh = PROJECTILE_H / 2;
      const es = e.size / 2;
      if (Math.abs(proj.wx - e.wx) < hw + es && Math.abs(proj.wy - e.wy) < hh + es) {
        e.hp -= proj.damage;
        addDamageNumber(e.wx, e.wy, proj.damage);
        if (!proj.piercing) proj.alive = false;
        if (e.hp <= 0) killEnemy(e);
      }
    }
  }

  // Collision: enemy vs player — circle (player) vs rect (enemy), with i-frames
  // DPS equivalence: damage * PLAYER_IFRAMES per hit / PLAYER_IFRAMES cooldown = same DPS as before
  // but removes AABB corner false-positives and spreads multi-enemy hits to one per iframes window
  for (const e of game.enemies) {
    if (!e.alive || p.iframes > 0) continue;
    const hs    = e.size / 2;
    const nearX = Math.max(e.wx - hs, Math.min(p.wx, e.wx + hs));
    const nearY = Math.max(e.wy - hs, Math.min(p.wy, e.wy + hs));
    if (Math.hypot(p.wx - nearX, p.wy - nearY) < PLAYER_RADIUS) {
      const dmg  = e.damage * PLAYER_IFRAMES * (1 - (p.armor || 0));
      p.hp       = Math.max(0, p.hp - dmg);
      p.dmgFlash = 0.15;
      p.iframes  = PLAYER_IFRAMES;
      if (p.hp <= 0) { triggerGameOver(); return; }
    }
  }

  // Orbital ring — AoE damage to enemies within radius
  if (p.orbitalRings > 0) {
    const orbRadius = ORBITAL_RADIUS + (p.orbitalRings - 1) * 24;
    for (const e of game.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.wx - p.wx, e.wy - p.wy) < orbRadius + e.size / 2) {
        e.hp -= ORBITAL_DPS * p.orbitalRings * dt;
        if (Math.random() < dt * 3) addDamageNumber(e.wx, e.wy, Math.round(ORBITAL_DPS * p.orbitalRings));
        if (e.hp <= 0) killEnemy(e);
      }
    }
  }

  // Collect XP gems
  for (const gem of game.xpGems) {
    if (!gem.alive) continue;
    if (Math.hypot(p.wx - gem.wx, p.wy - gem.wy) < p.xpRange + XP_GEM_RADIUS) {
      gem.alive = false;
      p.xp += XP_PER_GEM;
      if (p.xp >= p.xpThreshold) { triggerLevelUp(); return; }
    }
  }

  // Damage numbers float upward
  for (const dn of game.damageNumbers) {
    dn.wy -= 40 * dt;
    dn.age += dt;
  }

  // Prune dead / expired entities
  game.enemies       = game.enemies.filter(e => e.alive &&
    (e.isBoss || e.isMiniBoss || e.isDeathEntity ||
     Math.hypot(e.wx - p.wx, e.wy - p.wy) < ENEMY_CULL_DIST));
  game.projectiles   = game.projectiles.filter(proj => proj.alive);
  game.xpGems        = game.xpGems.filter(g => g.alive &&
    (g.wx - p.wx) ** 2 + (g.wy - p.wy) ** 2 < GEM_CULL_DIST_SQ);
  game.damageNumbers = game.damageNumbers.filter(d => d.age < 0.9);
}
