const W = 900;
const H = 600;

const GRID_SIZE        = 40;
const PLAYER_RADIUS    = 14;
const PLAYER_SPEED     = 180;
const PLAYER_MAX_HP    = 100;
const PROJECTILE_SPEED = 420;
const PROJECTILE_W     = 18;
const PROJECTILE_H     = 6;
const FIRE_COOLDOWN    = 1.0;
const XP_GEM_RADIUS    = 7;
const XP_PICKUP_RANGE  = 30;
const ENEMY_BASE_HP    = 10;
const ENEMY_BASE_SPEED = 70;
const ENEMY_SIZE       = 20;
const ENEMY_DAMAGE     = 8;
const MAX_ENEMIES      = 600;
const SPAWN_MARGIN     = 80;
const XP_PER_GEM       = 10;
const XP_LEVEL_BASE    = 60;
const XP_LEVEL_GROWTH  = 1.25;
const MAX_DT           = 0.05;
const PLAYER_IFRAMES    = 0.40;
const GEM_CULL_DIST_SQ  = 4_700_000;
const ORBITAL_RADIUS    = 80;
const ORBITAL_DPS       = 15;
const MINIBOSS_INTERVAL  = 90;    // seconds between mini-boss spawns
const BOSS_INTERVAL      = 300;   // seconds between main boss spawns
const MINIBOSS_ALERT_DUR = 1.5;   // seconds mini-boss alert lingers
const ENEMY_CULL_DIST    = 1200;  // world-units; far enemies are culled to keep array lean

const PALETTE = {
  bg:         '#1a1a1a',
  grid:       '#2a2a2a',
  player:     '#00FFFF',
  playerGlow: 'rgba(0,255,255,0.25)',
  enemy:      '#FF4444',
  enemyDark:  '#CC2222',
  projectile: '#FFD700',
  xpGem:      '#00FF00',
  xpGemGlow:  'rgba(0,255,0,0.3)',
  hpBar:      '#FF3333',
  hpBarBg:    '#440000',
  xpBar:      '#4488FF',
  xpBarBg:    '#112244',
  ui:         'rgba(0,0,0,0.75)',
  uiBorder:   '#444444',
  white:      '#FFFFFF',
  shadow:     '#000000',
  overlay:    'rgba(0,0,0,0.82)',
};

const STATE = { MENU: 0, PLAYING: 1, LEVEL_UP: 2, PAUSED: 3, GAME_OVER: 4 };
