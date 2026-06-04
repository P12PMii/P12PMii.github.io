function worldToScreen(wx, wy) {
  const p = game.player;
  return { x: wx - p.wx + W / 2, y: wy - p.wy + H / 2 };
}

function drawGrid() {
  const p  = game.player;
  const ox = ((p.wx % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
  const oy = ((p.wy % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  for (let x = -ox; x < W + GRID_SIZE; x += GRID_SIZE) {
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
  }
  for (let y = -oy; y < H + GRID_SIZE; y += GRID_SIZE) {
    ctx.moveTo(0, y); ctx.lineTo(W, y);
  }
  ctx.stroke();
}

function drawXpGems() {
  for (const gem of game.xpGems) {
    if (!gem.alive) continue;
    const { x, y } = worldToScreen(gem.wx, gem.wy);
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;

    ctx.fillStyle = PALETTE.xpGemGlow;
    ctx.beginPath();
    ctx.arc(x, y, XP_GEM_RADIUS + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.xpGem;
    ctx.beginPath();
    ctx.moveTo(x,                  y - XP_GEM_RADIUS);
    ctx.lineTo(x + XP_GEM_RADIUS,  y);
    ctx.lineTo(x,                  y + XP_GEM_RADIUS);
    ctx.lineTo(x - XP_GEM_RADIUS,  y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawProjectiles() {
  for (const proj of game.projectiles) {
    if (!proj.alive) continue;
    const { x, y } = worldToScreen(proj.wx, proj.wy);
    if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;

    const angle = Math.atan2(proj.vy, proj.vx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(-PROJECTILE_W, 0, PROJECTILE_W, 0);
    grad.addColorStop(0,   'rgba(255,215,0,0)');
    grad.addColorStop(0.5, 'rgba(255,215,0,0.6)');
    grad.addColorStop(1,   PALETTE.projectile);
    ctx.fillStyle = grad;

    roundRect(ctx, -PROJECTILE_W / 2, -PROJECTILE_H / 2, PROJECTILE_W, PROJECTILE_H, 3);
    ctx.fill();
    ctx.restore();
  }
}

function drawBoss(e, x, y) {
  const hs    = e.size / 2;
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
  const isMini = !!e.isMiniBoss;

  // Phase colours differ between main boss (magenta) and mini-boss (crimson)
  const chaseCol = isMini ? '#CC2200' : '#CC00CC';
  const telegCol = isMini ? '#FF8800' : '#FFEE00';
  const dashCol  = isMini ? '#FFDD88' : '#FFFFFF';
  const bodyCol  = e.bossPhase === 'telegraph' ? telegCol
                 : e.bossPhase === 'dash'       ? dashCol
                 : chaseCol;

  // Glow
  const glowR   = isMini ? hs + 8 : hs + 14;
  const glowRGB = isMini ? '180,0,0' : '255,0,255';
  ctx.fillStyle = `rgba(${glowRGB},${(0.08 + pulse * 0.07).toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Shadow + body
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - hs + 3, y - hs + 3, e.size, e.size);
  ctx.fillStyle = bodyCol;
  ctx.fillRect(x - hs, y - hs, e.size, e.size);

  // Detail: X mark for mini-boss, cross for main boss
  const detailCol = e.bossPhase === 'chase' ? (isMini ? '#FF6644' : '#FF44FF') : 'rgba(255,255,255,0.6)';
  if (isMini) {
    ctx.strokeStyle = detailCol;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(x - hs + 6, y - hs + 6); ctx.lineTo(x + hs - 6, y + hs - 6);
    ctx.moveTo(x + hs - 6, y - hs + 6); ctx.lineTo(x - hs + 6, y + hs - 6);
    ctx.stroke();
  } else {
    ctx.fillStyle = detailCol;
    ctx.fillRect(x - 2,      y - hs + 5, 4,           e.size - 10);
    ctx.fillRect(x - hs + 5, y - 2,      e.size - 10, 4);
  }

  // HP bar above sprite
  const bw = isMini ? e.size + 8  : e.size + 20;
  const bh = isMini ? 4           : 5;
  const bx = x - bw / 2;
  const by = y - hs - (isMini ? 9 : 12);
  ctx.fillStyle = isMini ? '#220000' : '#330033';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = bodyCol;
  ctx.fillRect(bx, by, bw * (e.hp / e.maxHP), bh);

  ctx.font         = '6px "Press Start 2P", monospace';
  ctx.fillStyle    = isMini ? '#FF8888' : '#FF88FF';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isMini ? 'MINI' : 'BOSS', x, y - hs - (isMini ? 17 : 21));
}

function drawEnemies() {
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const { x, y } = worldToScreen(e.wx, e.wy);
    if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;

    if (e.isBoss || e.isMiniBoss) { drawBoss(e, x, y); continue; }

    const hs = e.size / 2;

    if (e.type === 'runner') {
      // Orange diamond (rotated 45°) — signals "fast, dodge me"
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-hs + 2, -hs + 2, e.size, e.size);
      ctx.fillStyle = '#FF8800';
      ctx.fillRect(-hs, -hs, e.size, e.size);
      ctx.fillStyle = '#CC5500';
      ctx.fillRect(-hs + 2, -hs + 2, 4, 4);
      ctx.restore();

    } else if (e.type === 'bruiser') {
      // Large purple square — signals "tank, spend ammo wisely"
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x - hs + 3, y - hs + 3, e.size, e.size);
      ctx.fillStyle = '#880088';
      ctx.fillRect(x - hs, y - hs, e.size, e.size);
      ctx.fillStyle = '#AA55AA';
      ctx.fillRect(x - hs + 2, y - hs + 2, 8, 8);
      // Always show HP bar
      const bw = e.size, bh = 4;
      const bx = x - hs, by = y - hs - 8;
      ctx.fillStyle = '#220022';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#CC44CC';
      ctx.fillRect(bx, by, bw * (e.hp / e.maxHP), bh);

    } else if (e.type === 'weaver') {
      // Lime spinning diamond — "hard to predict"
      const spin = Date.now() / 400;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4 + spin * 0.8);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-hs + 2, -hs + 2, e.size, e.size);
      ctx.fillStyle = '#AAFF00';
      ctx.fillRect(-hs, -hs, e.size, e.size);
      ctx.fillStyle = '#77CC00';
      ctx.fillRect(-hs + 2, -hs + 2, 4, 4);
      ctx.restore();
      // HP bar drawn after restore so it stays axis-aligned (not rotated)
      {
        const bw = e.size, bh = 3;
        const bx = x - hs, by = y - hs - 6;
        ctx.fillStyle = '#003300';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#88FF00';
        ctx.fillRect(bx, by, bw * (e.hp / e.maxHP), bh);
      }

    } else if (e.type === 'splitter') {
      // Blue square with split-children indicator
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x - hs + 3, y - hs + 3, e.size, e.size);
      ctx.fillStyle = '#0055EE';
      ctx.fillRect(x - hs, y - hs, e.size, e.size);
      ctx.fillStyle = '#44AAFF';
      ctx.fillRect(x - hs + 2, y - hs + 2, 7, 7);
      // Two small squares hint that it will split
      ctx.fillStyle = 'rgba(100,180,255,0.65)';
      ctx.fillRect(x - 8, y - 3, 5, 5);
      ctx.fillRect(x + 3,  y - 3, 5, 5);
      if (e.hp < e.maxHP) {
        const bw = e.size, bh = 3;
        const bx = x - hs, by = y - hs - 6;
        ctx.fillStyle = '#001133';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#3399FF';
        ctx.fillRect(bx, by, bw * (e.hp / e.maxHP), bh);
      }

    } else if (e.isDeathEntity) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x - hs + 2, y - hs + 2, e.size, e.size);
      ctx.fillStyle = '#FF00FF';
      ctx.fillRect(x - hs, y - hs, e.size, e.size);
      ctx.fillStyle = '#FF88FF';
      ctx.fillRect(x - hs + 2, y - hs + 2, 6, 6);

    } else {
      // Normal enemy
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x - hs + 2, y - hs + 2, e.size, e.size);
      ctx.fillStyle = PALETTE.enemy;
      ctx.fillRect(x - hs, y - hs, e.size, e.size);
      ctx.fillStyle = PALETTE.enemyDark;
      ctx.fillRect(x - hs + 2, y - hs + 2, 6, 6);
      if (e.hp < e.maxHP) {
        const bw = e.size, bh = 3;
        const bx = x - hs, by = y - hs - 6;
        ctx.fillStyle = '#330000';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(bx, by, bw * (e.hp / e.maxHP), bh);
      }
    }
  }
}

function drawPlayer() {
  const p  = game.player;
  const cx = W / 2, cy = H / 2;

  // Orbital ring drawn first (behind player)
  if (p.orbitalRings > 0) {
    const t         = Date.now() / 1000;
    const pulse     = 0.5 + 0.5 * Math.sin(t * 3);
    const orbRadius = ORBITAL_RADIUS + (p.orbitalRings - 1) * 24;
    ctx.strokeStyle = `rgba(0,255,200,${(0.25 + pulse * 0.25).toFixed(2)})`;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const count = p.orbitalRings * 3;
    for (let i = 0; i < count; i++) {
      const angle = t * 2.5 + (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * orbRadius;
      const py = cy + Math.sin(angle) * orbRadius;
      ctx.fillStyle = `rgba(0,255,180,${(0.6 + pulse * 0.4).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Blink semi-transparent while i-frames are active (12 Hz alternation)
  const iBlinkOn = p.iframes > 0 && Math.floor(p.iframes / 0.08) % 2 === 1;
  ctx.globalAlpha = iBlinkOn ? 0.25 : 1;

  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, PLAYER_RADIUS * 2.5);
  grd.addColorStop(0, PALETTE.playerGlow);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, PLAYER_RADIUS * 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = p.dmgFlash > 0 ? '#FF8888' : PALETTE.player;
  ctx.beginPath();
  ctx.arc(cx, cy, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = p.dmgFlash > 0 ? '#FFBBBB' : '#AAFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, PLAYER_RADIUS * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;  // HP bar always fully opaque

  const bw = 48, bh = 5;
  const bx = cx - bw / 2, by = cy + PLAYER_RADIUS + 6;
  ctx.fillStyle = PALETTE.hpBarBg;
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = PALETTE.hpBar;
  ctx.fillRect(bx, by, bw * (p.hp / p.maxHP), bh);
  ctx.strokeStyle = '#666';
  ctx.lineWidth   = 0.5;
  ctx.strokeRect(bx, by, bw, bh);
}

function drawDamageNumbers() {
  for (const dn of game.damageNumbers) {
    const { x, y } = worldToScreen(dn.wx, dn.wy);
    ctx.globalAlpha = 1 - dn.age / 0.9;
    ctx.font        = '700 11px monospace';
    ctx.fillStyle   = '#FFD700';
    ctx.textAlign   = 'center';
    ctx.fillText(dn.val, x, y);
  }
  ctx.globalAlpha = 1;
}
