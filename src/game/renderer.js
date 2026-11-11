/* ═══════════════════════════════════════════════════════════════════
   renderer.js  —  FRAME DRAWING
   ───────────────────────────────────────────────────────────────────
   Sets up the canvas and provides the single drawFrame() function
   that is called every frame by main.js.

   Drawing order (painter's algorithm — back to front):
     1. Map tiles
     2. Chests
     3. Boss
     4. Boss HP bar
     5. Player
     6. Particles (on top of everything)
   ═══════════════════════════════════════════════════════════════════ */

const Renderer = (() => {
  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');

  /* ─── Canvas setup ─── */
  const W = CONFIG.TILE_SIZE * CONFIG.COLS;
  const H = CONFIG.TILE_SIZE * CONFIG.ROWS;

  canvas.width  = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;
  canvas.style.width  = 'min(94vw, 960px, calc((100dvh - 180px) * 4 / 3))';
  canvas.style.height = 'auto';
  canvas.style.maxWidth  = '100vw';
  canvas.style.maxHeight = '100vh';
  canvas.style.objectFit = 'contain';

  /**
   * Draw one complete frame.
   * @param {object} entities - { player, boss, chests, particles } from entities.js
   */
  let tick = 0;
  function drawFrame(entities) {
    const { player, boss, chests, particles } = entities;
    const T = CONFIG.TILE_SIZE;
    tick++;

    // Clear canvas
    ctx.clearRect(0, 0, W, H);

    // ── Layer 1: Map tiles ──
    GameMap.drawMap(ctx);

    // ── Layer 2: Chests ──
    for (const ch of chests) {
      const px = ch.x * T;
      const py = ch.y * T;

      if (ch.type === 'letter') {
        Sprites.drawKeepsake(ctx, px, py, ch.letterIdx, ch.opened, tick);
      } else if (ch.type === 'final') {
        Sprites.drawKeepsake(ctx, px, py, 4, ch.locked, tick);
      }
      // 'boss' type chest has no visual — the boss sprite fills that space
    }

    // ── Layer 3: Boss ──
    if (boss.alive) {
      const px        = boss.x * T;
      const py        = boss.y * T;
      const bobOffset = Math.round(Math.sin(boss.animTick * 0.08)) * 2;   // gentle float
      const flash     = boss.hitFlash > 0;

      Sprites.drawBoss(ctx, px, py, bobOffset, flash);
      Sprites.drawBossHPBar(ctx, px, py, boss.hp, boss.maxHP, bobOffset);
    }

    // ── Layer 4: Player ──
    {
      const px    = player.x * T;
      const py    = player.y * T;
      // Blink every 3 frames while hit flash is active
      const alpha = (player.hitFlash > 0 && Math.floor(player.hitFlash / 3) % 2 === 0)
                    ? 0.3 : 1;

      Sprites.drawPlayer(ctx, px, py, player.dir, alpha, player.sword > 0);
    }

    // ── Layer 5: Particles (drawn on top of everything) ──
    for (const p of particles) {
      Sprites.drawParticle(ctx, p);
    }
  }

  /* ─── Public API ─── */
  return {
    canvas,
    ctx,
    drawFrame,
  };
})();
