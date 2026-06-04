function getSpawnCount(t) {
  // starts at 2, +1 per 2 minutes, hard-capped at 10
  return Math.min(2 + Math.floor(t / 120), 10);
}

// Weighted enemy type by elapsed time — weaver/splitter present from start
function getEnemyType(t) {
  const r = Math.random();
  if (t < 180) return r < 0.55 ? 'normal' : r < 0.80 ? 'weaver' : 'splitter';
  if (t < 360) return r < 0.40 ? 'normal' : r < 0.60 ? 'weaver' : r < 0.72 ? 'splitter' : 'runner';
  if (t < 600) return r < 0.30 ? 'normal' : r < 0.48 ? 'weaver' : r < 0.58 ? 'splitter' : r < 0.78 ? 'runner' : 'bruiser';
  return r < 0.22 ? 'normal' : r < 0.38 ? 'weaver' : r < 0.48 ? 'splitter' : r < 0.68 ? 'runner' : 'bruiser';
}

function spawnEnemyAt(wx, wy, type) {
  if (game.enemies.length >= MAX_ENEMIES) return;
  const t = type || getEnemyType(game.gameTime);
  let e;
  if      (t === 'runner')   e = makeRunner(wx, wy, game.gameTime);
  else if (t === 'bruiser')  e = makeBruiser(wx, wy, game.gameTime);
  else if (t === 'weaver')   e = makeWeaver(wx, wy, game.gameTime);
  else if (t === 'splitter') e = makeSplitter(wx, wy, game.gameTime);
  else                       e = makeEnemy(wx, wy, game.gameTime);
  game.enemies.push(e);
}

function spawnEnemy() {
  if (game.enemies.length >= MAX_ENEMIES) return;
  const p      = game.player;
  const margin = SPAWN_MARGIN + Math.random() * 60;
  const side   = Math.floor(Math.random() * 4);
  const hw     = W / 2 + margin;
  const hh     = H / 2 + margin;
  let sx, sy;
  switch (side) {
    case 0: sx = p.wx + (Math.random() * 2 - 1) * hw; sy = p.wy - hh; break;
    case 1: sx = p.wx + hw;  sy = p.wy + (Math.random() * 2 - 1) * hh; break;
    case 2: sx = p.wx + (Math.random() * 2 - 1) * hw; sy = p.wy + hh; break;
    default:sx = p.wx - hw;  sy = p.wy + (Math.random() * 2 - 1) * hh; break;
  }
  spawnEnemyAt(sx, sy);
}

function spawnSwarm() {
  const p      = game.player;
  const wave   = Math.floor(game.gameTime / 300);
  const count  = 20 + wave * 5;
  const radius = Math.hypot(W, H) / 2 + SPAWN_MARGIN;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    spawnEnemyAt(p.wx + Math.cos(angle) * radius, p.wy + Math.sin(angle) * radius);
  }
}

function spawnMiniBoss() {
  const p      = game.player;
  const margin = SPAWN_MARGIN + 80;
  const side   = Math.floor(Math.random() * 4);
  let sx, sy;
  switch (side) {
    case 0: sx = p.wx;                   sy = p.wy - H / 2 - margin; break;
    case 1: sx = p.wx + W / 2 + margin;  sy = p.wy;                  break;
    case 2: sx = p.wx;                   sy = p.wy + H / 2 + margin; break;
    default:sx = p.wx - W / 2 - margin;  sy = p.wy;                  break;
  }
  game.enemies.push(makeMiniBoss(sx, sy, game.gameTime));
}

function spawnBoss() {
  const p      = game.player;
  const margin = SPAWN_MARGIN + 120;
  const side   = Math.floor(Math.random() * 4);
  let sx, sy;
  switch (side) {
    case 0: sx = p.wx;        sy = p.wy - H / 2 - margin; break;
    case 1: sx = p.wx + W / 2 + margin; sy = p.wy;        break;
    case 2: sx = p.wx;        sy = p.wy + H / 2 + margin; break;
    default:sx = p.wx - W / 2 - margin; sy = p.wy;        break;
  }
  game.enemies.push(makeBoss(sx, sy, game.gameTime));
}
