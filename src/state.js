function buildInitialState() {
  return {
    state: STATE.MENU,
    player: makePlayer(),
    enemies: [],
    projectiles: [],
    xpGems: [],
    damageNumbers: [],
    gameTime: 0,
    spawnTimer: 0,
    spawnInterval: 1.2,
    pendingUpgrades: [],
    _lastSwarm: 0,
    _lastXpBonus: 0,
    _lastMiniBoss: 0,
    _lastBoss: 0,
    bossAlert: 0,
    miniBossAlert: 0,
    _deathEntityNext: 1800,
  };
}

let game = buildInitialState();

function startGame() {
  game = buildInitialState();
  game.state = STATE.PLAYING;
}

function restartGame() {
  startGame();
}

function pauseGame() {
  game.state = STATE.PAUSED;
}

function resumeGame() {
  game.state = STATE.PLAYING;
}

function triggerLevelUp() {
  game.pendingUpgrades = pickUpgrades(3);
  if (game.pendingUpgrades.length === 0) {
    // All upgrade pools exhausted — auto-advance without showing overlay
    game.player.xp = 0;
    game.player.level++;
    return;
  }
  game.state = STATE.LEVEL_UP;
}

function selectUpgrade(upgrade) {
  upgrade.apply(game.player);
  game.player.upgradePicks[upgrade.id] = (game.player.upgradePicks[upgrade.id] || 0) + 1;
  game.player.xp = 0;
  game.player.level++;
  game.state = STATE.PLAYING;
}

function triggerGameOver() {
  game.state = STATE.GAME_OVER;
}
