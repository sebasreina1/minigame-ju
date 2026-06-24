/* ═══════════════════════════════════════════════════════════════════
   entities.js  —  GAME OBJECTS (Player, Boss, Chests, Particles)
   ───────────────────────────────────────────────────────────────────
   Defines the mutable state objects for every entity in the game.
   Logic that CHANGES these objects lives in main.js (game loop).
   Drawing these objects happens in renderer.js.
   ═══════════════════════════════════════════════════════════════════ */

const Entities = (() => {

  /* ─────────────────────────────────────────────
     PLAYER
     All runtime state. Initial values come from CONFIG.PLAYER.
  ──────────────────────────────────────────────── */
  const player = {
    x:         CONFIG.PLAYER.startX,   // current tile column
    y:         CONFIG.PLAYER.startY,   // current tile row
    dir:       'down',                 // 'up' | 'down' | 'left' | 'right'
    hp:        CONFIG.PLAYER.maxHP,
    maxHP:     CONFIG.PLAYER.maxHP,
    hitFlash:  0,                      // countdown: player blinks when > 0
    sword:     0,                      // countdown: sword swing visible when > 0
  };

  /* ─────────────────────────────────────────────
     BOSS
     Spawns at position from CONFIG.BOSS.
  ──────────────────────────────────────────────── */
  const boss = {
    x:         CONFIG.BOSS.startX,
    y:         CONFIG.BOSS.startY,
    hp:        CONFIG.BOSS.maxHP,
    maxHP:     CONFIG.BOSS.maxHP,
    alive:     true,
    animTick:  0,           // increments every frame for bobbing animation
    moveTimer: 0,           // counts up; boss moves when it hits CONFIG.BOSS.moveEveryNFrames
    hitFlash:  0,           // countdown: boss flashes white when recently hit
  };

  /* ─────────────────────────────────────────────
     CHESTS
     Deep-cloned from CONFIG.CHESTS so original config stays clean.
     Each chest gets extra runtime fields added below.
  ──────────────────────────────────────────────── */
  const chests = CONFIG.CHESTS.map(cfg => ({
    ...cfg,                  // copies x, y, type, letterIdx from config
    opened: false,           // has the player opened this chest?
    locked: cfg.type === 'boss' || cfg.type === 'final',  // boss/final start locked
  }));

  /* ─────────────────────────────────────────────
     PARTICLES
     Each particle is a temporary visual effect square.
     They are created in main.js and drawn in renderer.js.
  ──────────────────────────────────────────────── */
  const particles = [];   // active particles

  /**
   * Spawn a burst of colored particles centered on tile (tx, ty).
   * color: any CSS color string
   * count: how many particles to spawn (default 12)
   */
  function spawnParticles(tx, ty, color, count = 12) {
    const T  = CONFIG.TILE_SIZE;
    const cx = tx * T + T / 2;
    const cy = ty * T + T / 2;

    for (let i = 0; i < count; i++) {
      particles.push({
        x:       cx,
        y:       cy,
        vx:      (Math.random() - 0.5) * 5,   // random horizontal velocity
        vy:      (Math.random() - 0.5) * 5,   // random vertical velocity
        color,
        size:    Math.random() * 6 + 2,        // random size 2–8px
        life:    30,                           // frames until gone
        maxLife: 30,
      });
    }
  }

  /**
   * Advance all particles by one frame.
   * Removes dead particles (life <= 0) from the array.
   */
  function updateParticles() {
    for (const p of particles) {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= 1;
    }
    // Remove dead particles in-place
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
  }

  /* ─── Public API ─── */
  return {
    player,
    boss,
    chests,
    particles,
    spawnParticles,
    updateParticles,
  };
})();
