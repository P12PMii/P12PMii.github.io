// ── Event handlers ────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    if (game.state === STATE.PLAYING) pauseGame();
    else if (game.state === STATE.PAUSED) resumeGame();
    return;
  }

  if (game.state === STATE.LEVEL_UP) {
    if (e.code === 'Digit1' && game.pendingUpgrades[0]) selectUpgrade(game.pendingUpgrades[0]);
    if (e.code === 'Digit2' && game.pendingUpgrades[1]) selectUpgrade(game.pendingUpgrades[1]);
    if (e.code === 'Digit3' && game.pendingUpgrades[2]) selectUpgrade(game.pendingUpgrades[2]);
    return;
  }

  if (e.code === 'Space' || e.code === 'Enter') {
    if (game.state === STATE.MENU)      startGame();
    if (game.state === STATE.GAME_OVER) restartGame();
  }
});

canvas.addEventListener('click', e => {
  const r  = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;

  if (game.state === STATE.MENU) {
    const bx = W / 2 - 110, by = H / 2 + 130;
    if (mx >= bx && mx <= bx + 220 && my >= by && my <= by + 50) startGame();
    return;
  }

  if (game.state === STATE.LEVEL_UP) {
    const cardW  = 180, cardH = 200, gap = 24;
    const startX = (W - (3 * cardW + 2 * gap)) / 2;
    const startY = H / 2 - cardH / 2;
    for (let i = 0; i < game.pendingUpgrades.length; i++) {
      const cx = startX + i * (cardW + gap);
      if (mx >= cx && mx <= cx + cardW && my >= startY && my <= startY + cardH) {
        selectUpgrade(game.pendingUpgrades[i]);
        return;
      }
    }
    return;
  }

  if (game.state === STATE.GAME_OVER) {
    const bx = W / 2 - 100, by = H / 2 + 90;
    if (mx >= bx && mx <= bx + 200 && my >= by && my <= by + 50) restartGame();
  }
});

// ── Draw ─────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  if (game.state === STATE.MENU)      { drawMenu();     return; }
  if (game.state === STATE.GAME_OVER) { drawGameOver(); return; }

  drawGrid();
  drawXpGems();
  drawProjectiles();
  drawEnemies();
  drawPlayer();
  drawDamageNumbers();
  drawHUD();

  if (game.bossAlert     > 0) drawBossAlert();
  if (game.miniBossAlert > 0) drawMiniBossAlert();
  if (game.state === STATE.LEVEL_UP) drawLevelUpOverlay();
  if (game.state === STATE.PAUSED)   drawPauseOverlay();
}

// ── Main loop ─────────────────────────────────────────────────
let lastTime = null;

function loop(timestamp) {
  if (lastTime === null) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
