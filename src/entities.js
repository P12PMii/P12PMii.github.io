// +5% HP per player level, capped at ×1.8 — subtle difficulty curve tied to player power
function levelHpMult() {
  return typeof game !== 'undefined' && game.player
    ? Math.min(1 + (game.player.level - 1) * 0.05, 1.8)
    : 1;
}

function makePlayer() {
  return {
    wx: 0, wy: 0,
    hp: PLAYER_MAX_HP,
    maxHP: PLAYER_MAX_HP,
    speed: PLAYER_SPEED,
    xp: 0,
    level: 1,
    killCount: 0,
    fireCooldown: FIRE_COOLDOWN,
    fireTimer: 0,
    projectileDamage: 12,
    xpRange: XP_PICKUP_RANGE,
    piercing: false,
    multiShot: 1,
    armor: 0,
    get xpThreshold() {
      return Math.floor(XP_LEVEL_BASE * Math.pow(XP_LEVEL_GROWTH, this.level - 1));
    },
    dmgFlash:     0,
    iframes:      0,
    orbitalRings: 0,
    upgradePicks: {},
  };
}

function makeEnemy(wx, wy, elapsedSec) {
  const scale   = 1 + Math.floor(elapsedSec / 180) * 0.5;
  const spdMult = 1 + Math.floor(elapsedSec / 180) * 0.1;
  return {
    wx, wy,
    hp:     Math.round(ENEMY_BASE_HP * scale * levelHpMult()),
    maxHP:  Math.round(ENEMY_BASE_HP * scale * levelHpMult()),
    speed:  ENEMY_BASE_SPEED * spdMult,
    damage: ENEMY_DAMAGE,
    alive:  true,
    size:   ENEMY_SIZE,
    type:   'normal',
  };
}

// Fast & fragile — punishes players who stand still
function makeRunner(wx, wy, elapsedSec) {
  const scale   = 1 + Math.floor(elapsedSec / 180) * 0.5;
  const spdMult = 1 + Math.floor(elapsedSec / 180) * 0.1;
  return {
    wx, wy,
    hp:     Math.round(ENEMY_BASE_HP * 0.6 * scale * levelHpMult()),
    maxHP:  Math.round(ENEMY_BASE_HP * 0.6 * scale * levelHpMult()),
    speed:  ENEMY_BASE_SPEED * 2.2 * spdMult,
    damage: ENEMY_DAMAGE * 0.7,
    alive:  true,
    size:   14,
    type:   'runner',
  };
}

// Slow & tanky — punishes players who ignore it
function makeBruiser(wx, wy, elapsedSec) {
  const scale   = 1 + Math.floor(elapsedSec / 180) * 0.5;
  const spdMult = 1 + Math.floor(elapsedSec / 180) * 0.1;
  return {
    wx, wy,
    hp:     Math.round(ENEMY_BASE_HP * 4 * scale * levelHpMult()),
    maxHP:  Math.round(ENEMY_BASE_HP * 4 * scale * levelHpMult()),
    speed:  ENEMY_BASE_SPEED * 0.45 * spdMult,
    damage: ENEMY_DAMAGE * 2,
    alive:  true,
    size:   30,
    type:   'bruiser',
  };
}

// Mini-boss: slow approach → telegraph → dash charge
function makeBoss(wx, wy, elapsedSec) {
  const hp = Math.round(game.player.projectileDamage * 40);
  return {
    wx, wy,
    hp,
    maxHP: hp,
    speed:      45,
    damage:     ENEMY_DAMAGE * 3,
    alive:      true,
    size:       42,
    type:       'boss',
    isBoss:     true,
    bossPhase:  'chase',      // 'chase' | 'telegraph' | 'dash'
    phaseTimer: 0,
    dashTarget: null,
    dashSpeed:  520,
  };
}

// Zigzag movement — hard to dodge, introduces pattern-reading early
function makeWeaver(wx, wy, elapsedSec) {
  const scale   = 1 + Math.floor(elapsedSec / 180) * 0.5;
  const spdMult = 1 + Math.floor(elapsedSec / 180) * 0.1;
  return {
    wx, wy,
    hp:           Math.round(ENEMY_BASE_HP * 0.8 * scale * levelHpMult()),
    maxHP:        Math.round(ENEMY_BASE_HP * 0.8 * scale * levelHpMult()),
    speed:        ENEMY_BASE_SPEED * 1.3 * spdMult,
    damage:       ENEMY_DAMAGE,
    alive:        true,
    size:         16,
    type:         'weaver',
    _weaverPhase: Math.random() * Math.PI * 2,
  };
}

// Splits into 2 small normals on death — punishes ignoring it
function makeSplitter(wx, wy, elapsedSec) {
  const scale   = 1 + Math.floor(elapsedSec / 180) * 0.5;
  const spdMult = 1 + Math.floor(elapsedSec / 180) * 0.1;
  return {
    wx, wy,
    hp:       Math.round(ENEMY_BASE_HP * 1.8 * scale * levelHpMult()),
    maxHP:    Math.round(ENEMY_BASE_HP * 1.8 * scale * levelHpMult()),
    speed:    ENEMY_BASE_SPEED * 0.8 * spdMult,
    damage:   ENEMY_DAMAGE,
    alive:    true,
    size:     24,
    type:     'splitter',
    hasSplit: false,
  };
}

// Smaller boss — same 3-phase AI, weaker stats, can stack
function makeMiniBoss(wx, wy, elapsedSec) {
  const hp = Math.round(game.player.projectileDamage * 25);
  return {
    wx, wy,
    hp,
    maxHP: hp,
    speed:      58,
    damage:     ENEMY_DAMAGE * 2,
    alive:      true,
    size:       32,
    type:       'miniboss',
    isMiniBoss: true,
    bossPhase:  'chase',
    phaseTimer: 0,
    dashTarget: null,
    dashSpeed:  380,
  };
}

function makeProjectile(wx, wy, vx, vy, damage, piercing) {
  return { wx, wy, vx, vy, damage, piercing, alive: true, age: 0 };
}

function makeXpGem(wx, wy) {
  return { wx, wy, alive: true };
}
