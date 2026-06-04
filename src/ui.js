// Returns active build synergy label, or null
function getActiveSynergy(p) {
  const pk = p.upgradePicks;
  if ((pk.dmg || 0) >= 2 && (pk.fire || 0) >= 2 && (pk.multi || 0) >= 1)
    return { name: 'MACHINE GUN', color: '#FF8800' };
  if (p.piercing && (pk.multi || 0) >= 1 && (pk.fire || 0) >= 1)
    return { name: 'LASER STORM', color: '#00FFAA' };
  if ((pk.armour || 0) >= 1 && (pk.hp || 0) >= 2)
    return { name: 'IRON FORTRESS', color: '#4488FF' };
  if ((pk.xp || 0) >= 2 && (pk.spd || 0) >= 1)
    return { name: 'SPEEDRUNNER', color: '#FFD700' };
  if ((pk.orbital || 0) >= 2 && (pk.armour || 0) >= 1)
    return { name: 'GUARDIAN',    color: '#00EEFF' };
  return null;
}

function drawHUD() {
  const p = game.player;

  // XP bar (top)
  const xpBw = W - 20, xpBh = 16;
  const xpBx = 10,     xpBy = 10;
  ctx.fillStyle = PALETTE.xpBarBg;
  ctx.fillRect(xpBx, xpBy, xpBw, xpBh);
  ctx.fillStyle = PALETTE.xpBar;
  ctx.fillRect(xpBx, xpBy, xpBw * (p.xp / p.xpThreshold), xpBh);
  ctx.strokeStyle = '#335588';
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(xpBx, xpBy, xpBw, xpBh);
  ctx.font         = '7px "Press Start 2P", monospace';
  ctx.fillStyle    = '#FFFFFF';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`LV ${p.level}  XP ${p.xp}/${p.xpThreshold}`, W / 2, xpBy + xpBh / 2);

  // Timer + kills panel (top-right)
  const mins    = Math.floor(game.gameTime / 60);
  const secs    = Math.floor(game.gameTime % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  ctx.fillStyle = PALETTE.ui;
  roundRect(ctx, W - 170, 34, 160, 46, 6);
  ctx.fill();
  ctx.strokeStyle = PALETTE.uiBorder;
  ctx.lineWidth   = 1;
  roundRect(ctx, W - 170, 34, 160, 46, 6);
  ctx.stroke();

  ctx.font         = '8px "Press Start 2P", monospace';
  ctx.fillStyle    = '#AAAAAA';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('TIME', W - 14, 40);
  ctx.font      = '14px "Press Start 2P", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(timeStr, W - 14, 52);
  ctx.font      = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#FF8888';
  ctx.fillText(`☠ ${p.killCount}`, W - 14, 70);

  // HP bar (bottom-left)
  const hbW = 200, hbH = 14;
  const hbX = 10,  hbY = H - 30;
  ctx.fillStyle = PALETTE.ui;
  ctx.fillRect(hbX - 2, hbY - 2, hbW + 4, hbH + 4);
  ctx.fillStyle = PALETTE.hpBarBg;
  ctx.fillRect(hbX, hbY, hbW, hbH);
  ctx.fillStyle = PALETTE.hpBar;
  ctx.fillRect(hbX, hbY, hbW * (p.hp / p.maxHP), hbH);
  ctx.strokeStyle = '#660000';
  ctx.lineWidth   = 1;
  ctx.strokeRect(hbX, hbY, hbW, hbH);
  ctx.font         = '7px "Press Start 2P", monospace';
  ctx.fillStyle    = '#FFFFFF';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`HP  ${Math.ceil(p.hp)}/${p.maxHP}`, hbX + hbW / 2, hbY + hbH / 2);

  // Mini-boss count badge (top-left, below XP bar)
  const miniBossCount = game.enemies.filter(e => e.isMiniBoss && e.alive).length;
  if (miniBossCount > 0) {
    ctx.font         = '6px "Press Start 2P", monospace';
    ctx.fillStyle    = '#FF6655';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`▲ MINI ×${miniBossCount}`, 10, 34);
  }

  // Boss HP bar — main boss only (mini-boss HP shown above their own sprites)
  const boss = game.enemies.find(e => e.isBoss && !e.isMiniBoss && e.alive);
  if (boss) {
    const bbW = 280, bbH = 14;
    const bbX = W / 2 - bbW / 2, bbY = 34;
    const bossCol = boss.bossPhase === 'telegraph' ? '#FFEE00'
                  : boss.bossPhase === 'dash'       ? '#FFFFFF'
                  : '#CC00CC';
    ctx.fillStyle = '#330033';
    ctx.fillRect(bbX, bbY, bbW, bbH);
    ctx.fillStyle = bossCol;
    ctx.fillRect(bbX, bbY, bbW * (boss.hp / boss.maxHP), bbH);
    ctx.strokeStyle = '#880088';
    ctx.lineWidth   = 1;
    ctx.strokeRect(bbX, bbY, bbW, bbH);
    ctx.font         = '6px "Press Start 2P", monospace';
    ctx.fillStyle    = '#FF88FF';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`BOSS  ${Math.ceil(boss.hp)} / ${boss.maxHP}`, W / 2, bbY + bbH / 2);
  }

  // Build synergy badge — bottom-right
  const synergy = getActiveSynergy(p);
  if (synergy) {
    ctx.font         = '7px "Press Start 2P", monospace';
    ctx.fillStyle    = synergy.color;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`★ ${synergy.name}`, W - 10, H - 10);
  }
}

function drawLevelUpOverlay() {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, 0, W, H);

  ctx.font         = '18px "Press Start 2P", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  shadowText(ctx, `LEVEL UP!  LV ${game.player.level + 1}`, W / 2, H / 2 - 130, '#FFD700', '#000', 3);

  ctx.font      = '8px "Press Start 2P", monospace';
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('CHOOSE AN UPGRADE', W / 2, H / 2 - 105);

  const cardW  = 180, cardH = 200, gap = 24;
  const totalW = 3 * cardW + 2 * gap;
  const startX = (W - totalW) / 2;
  const startY = H / 2 - cardH / 2;

  game.pendingUpgrades.forEach((upg, i) => {
    const cx = startX + i * (cardW + gap);
    const cy = startY;

    ctx.fillStyle = '#111C2E';
    roundRect(ctx, cx, cy, cardW, cardH, 10);
    ctx.fill();
    ctx.strokeStyle = '#3366AA';
    ctx.lineWidth   = 2;
    roundRect(ctx, cx, cy, cardW, cardH, 10);
    ctx.stroke();

    ctx.font         = '36px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(upg.icon, cx + cardW / 2, cy + 50);

    // Pick level indicator (between icon and name)
    const pickCount = game.player.upgradePicks[upg.id] || 0;
    if (pickCount > 0) {
      ctx.font      = '6px "Press Start 2P", monospace';
      ctx.fillStyle = '#7799CC';
      ctx.fillText(`LV ${pickCount + 1}`, cx + cardW / 2, cy + 74);
    }

    ctx.font      = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(upg.name, cx + cardW / 2, cy + 95);

    ctx.font      = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#CCCCCC';
    upg.desc.split('\n').forEach((line, li) => {
      ctx.fillText(line, cx + cardW / 2, cy + 120 + li * 18);
    });

    // Cap progress bar for upgrades with maxPicks
    if (upg.maxPicks) {
      const squares = Array.from({ length: upg.maxPicks }, (_, j) => j < pickCount ? '■' : '□').join('');
      ctx.font      = '8px monospace';
      ctx.fillStyle = pickCount >= upg.maxPicks - 1 ? '#FF9944' : '#445577';
      ctx.fillText(squares, cx + cardW / 2, cy + 160);
    }

    ctx.font      = '6px "Press Start 2P", monospace';
    ctx.fillStyle = '#666666';
    ctx.fillText(`[${i + 1}]  CLICK TO SELECT`, cx + cardW / 2, cy + cardH - 18);
  });

  ctx.font      = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#555555';
  ctx.fillText('PRESS 1 / 2 / 3 OR CLICK', W / 2, H / 2 + cardH / 2 + 22);
}

function drawMiniBossAlert() {
  ctx.globalAlpha  = Math.min(1, game.miniBossAlert);
  ctx.font         = '11px "Press Start 2P", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  shadowText(ctx, '▲  MINI-BOSS !', W / 2, H / 2 - 38, '#FF6644', '#000000', 4);
  ctx.globalAlpha  = 1;
}

function drawBossAlert() {
  ctx.globalAlpha  = Math.min(1, game.bossAlert);
  ctx.font         = '18px "Press Start 2P", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  shadowText(ctx, '! BOSS INCOMING !', W / 2, H / 2 - 60, '#FF00FF', '#000000', 6);
  ctx.globalAlpha  = 1;
}

function drawPauseOverlay() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.font         = '22px "Press Start 2P", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  shadowText(ctx, 'PAUSED', W / 2, H / 2 - 20, '#FFFFFF', '#000', 3);
  ctx.font      = '8px "Press Start 2P", monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText('PRESS ESC TO RESUME', W / 2, H / 2 + 20);
}

function drawMenu() {
  const t = Date.now() / 1000;

  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#1e1e1e';
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  for (let x = 0; x < W; x += GRID_SIZE) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 0; y < H; y += GRID_SIZE) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();

  for (let i = 0; i < 18; i++) {
    const seed  = (i * 137.5) % 360;
    const angle = (seed / 360) * Math.PI * 2 + t * 0.15;
    const dist  = 150 + (seed % 80) + Math.sin(t * 0.7 + i) * 20;
    const ex    = W / 2 + Math.cos(angle) * dist;
    const ey    = H / 2 + Math.sin(angle) * dist + 20;
    const sz    = 8 + (i % 4) * 3;
    ctx.globalAlpha = 0.35 + Math.sin(t + i * 0.8) * 0.15;
    ctx.fillStyle   = PALETTE.enemy;
    ctx.fillRect(ex - sz / 2, ey - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1;

  const pcx    = W / 2, pcy = H / 2 + 20;
  const pulseR = PLAYER_RADIUS + 2 + Math.sin(t * 3) * 3;
  ctx.fillStyle = 'rgba(0,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(pcx, pcy, pulseR + 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(pcx, pcy, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '22px "Press Start 2P", monospace';
  shadowText(ctx, 'p12pmii', W / 2, H / 2 - 145, '#00FFFF', '#000000', 4);
  ctx.font = '22px "Press Start 2P", monospace';
  shadowText(ctx, 'SURVIVE', W / 2, H / 2 - 110, '#FFFFFF', '#000000', 4);
  ctx.font      = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText('SURVIVE AS LONG AS YOU CAN', W / 2, H / 2 - 80);

  const bx = W / 2 - 110, by = H / 2 + 130;
  ctx.fillStyle = '#003355';
  roundRect(ctx, bx, by, 220, 50, 8);
  ctx.fill();
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth   = 2;
  roundRect(ctx, bx, by, 220, 50, 8);
  ctx.stroke();
  ctx.font      = '13px "Press Start 2P", monospace';
  ctx.fillStyle = '#00FFFF';
  ctx.fillText('▶  START', W / 2, by + 25);

  ctx.font      = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#555555';
  ctx.fillText('WASD TO MOVE  ·  ESC TO PAUSE', W / 2, H / 2 + 200);
}

function drawGameOver() {
  ctx.fillStyle = '#0a0000';
  ctx.fillRect(0, 0, W, H);

  const grd = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.75);
  grd.addColorStop(0, 'transparent');
  grd.addColorStop(1, 'rgba(120,0,0,0.7)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '28px "Press Start 2P", monospace';
  shadowText(ctx, 'GAME OVER', W / 2, H / 2 - 110, '#FF3333', '#000', 4);

  const p    = game.player;
  const mins = Math.floor(game.gameTime / 60);
  const secs = Math.floor(game.gameTime % 60);

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  roundRect(ctx, W / 2 - 170, H / 2 - 70, 340, 140, 10);
  ctx.fill();
  ctx.strokeStyle = '#441111';
  ctx.lineWidth   = 1.5;
  roundRect(ctx, W / 2 - 170, H / 2 - 70, 340, 140, 10);
  ctx.stroke();

  ctx.font      = '9px "Press Start 2P", monospace';
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('TIME SURVIVED', W / 2, H / 2 - 42);
  ctx.font      = '18px "Press Start 2P", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`, W / 2, H / 2 - 16);

  ctx.font      = '9px "Press Start 2P", monospace';
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('ENEMIES KILLED', W / 2, H / 2 + 20);
  ctx.font      = '18px "Press Start 2P", monospace';
  ctx.fillStyle = '#FF8888';
  ctx.fillText(p.killCount, W / 2, H / 2 + 46);

  const bx = W / 2 - 100, by = H / 2 + 90;
  ctx.fillStyle = '#1a0000';
  roundRect(ctx, bx, by, 200, 50, 8);
  ctx.fill();
  ctx.strokeStyle = '#FF3333';
  ctx.lineWidth   = 2;
  roundRect(ctx, bx, by, 200, 50, 8);
  ctx.stroke();
  ctx.font      = '10px "Press Start 2P", monospace';
  ctx.fillStyle = '#FF3333';
  ctx.fillText('↺  RESTART', W / 2, by + 25);

  ctx.font      = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#444444';
  ctx.fillText('PRESS ENTER OR CLICK', W / 2, by + 70);
}
