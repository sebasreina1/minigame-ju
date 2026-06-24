/* ═══════════════════════════════════════════════════════════════════
   sprites.js  —  ALL PIXEL ART DRAWING FUNCTIONS
   ───────────────────────────────────────────────────────────────────
   Each function draws one "sprite" (character / object) onto the canvas.
   All sizes use CONFIG.TILE_SIZE so everything scales together.
   Colors come from CONFIG.COLORS — edit there to repaint anything.

   To add a new sprite:
     1. Add a drawMyThing(ctx, px, py) function below
     2. Call it from renderer.js in the right layer
   ═══════════════════════════════════════════════════════════════════ */

const Sprites = (() => {
  const C  = CONFIG.COLORS;   // shorthand
  const T  = CONFIG.TILE_SIZE;

  /* ─────────────────────────────────────────────
     MAP TILE SPRITES
     Called once per tile per frame in renderer.js
  ──────────────────────────────────────────────── */

  /** Grass tile — alternates two shades for a checkerboard effect */
  function drawGrass(ctx, px, py, alternate) {
    ctx.fillStyle = alternate ? C.grassAlt : C.grass;
    ctx.fillRect(px, py, T, T);
  }

  /** Stone path tile */
  function drawPath(ctx, px, py, alternate) {
    ctx.fillStyle = alternate ? C.pathAlt : C.path;
    ctx.fillRect(px, py, T, T);
  }

  /** Wall tile — solid block with a dark bottom edge */
  function drawWall(ctx, px, py) {
    ctx.fillStyle = C.wall;
    ctx.fillRect(px, py, T, T);
    // Shadow band at the bottom
    ctx.fillStyle = C.wallShadow;
    ctx.fillRect(px, py + T - 6, T, 6);
  }

  /** Water tile — solid blue with two horizontal shine lines */
  function drawWater(ctx, px, py) {
    ctx.fillStyle = C.water;
    ctx.fillRect(px, py, T, T);
    ctx.fillStyle = C.waterShine;
    ctx.fillRect(px + 4,  py + 6,  T - 8,  4);
    ctx.fillRect(px + 8,  py + 18, T - 12, 3);
  }

  /**
   * Tree tile — painted on top of grass.
   * Trunk at bottom, two layers of leaves for depth.
   */
  function drawTree(ctx, px, py, alternate) {
    // Grass base
    ctx.fillStyle = alternate ? C.grassAlt : C.grass;
    ctx.fillRect(px, py, T, T);
    // Trunk
    ctx.fillStyle = C.treeTrunk;
    ctx.fillRect(px + 12, py + 18, 8, 12);
    // Lower leaves
    ctx.fillStyle = C.treeLeaves;
    ctx.fillRect(px + 4, py + 4, 24, 20);
    // Upper / brighter leaves
    ctx.fillStyle = C.treeTop;
    ctx.fillRect(px + 8, py + 2, 16, 14);
  }

  /* ─────────────────────────────────────────────
     CHEST SPRITES
  ──────────────────────────────────────────────── */

  /**
   * Regular letter chest.
   * Draws differently depending on opened/closed state.
   */
  function drawLetterChest(ctx, px, py, opened) {
    if (opened) {
      // Open chest — dark interior visible
      ctx.fillStyle = C.chestOpen;
      ctx.fillRect(px + 4, py + 10, T - 8, T - 14);
      ctx.fillStyle = C.chestLid;
      ctx.fillRect(px + 4, py + 8, T - 8, 8);
      // Dark interior opening
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 6, py + 10, T - 12, 6);
    } else {
      // Closed chest
      ctx.fillStyle = C.chestBody;
      ctx.fillRect(px + 4, py + 10, T - 8, T - 14);
      ctx.fillStyle = C.chestLid;
      ctx.fillRect(px + 4, py + 8, T - 8, 10);
      // Lock
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 13, py + 13, 6, 4);
      ctx.fillStyle = C.chestLock;
      ctx.fillRect(px + 14, py + 14, 4, 3);
    }
  }

  /**
   * Final (golden proposal) chest.
   * Grey and locked until boss is defeated, then gold.
   */
  function drawFinalChest(ctx, px, py, locked) {
    if (locked) {
      // Greyed out — not yet accessible
      ctx.fillStyle = '#888888';
      ctx.fillRect(px + 4, py + 8, T - 8, T - 12);
      ctx.fillStyle = '#666666';
      ctx.fillRect(px + 4, py + 6, T - 8, 6);
      // Padlock symbol
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(px + 12, py + 14, 8, 6);
      ctx.fillStyle = C.chestLid;
      ctx.fillRect(px + 14, py + 16, 4, 4);
    } else {
      // Unlocked — bright gold
      ctx.fillStyle = C.chestBody;
      ctx.fillRect(px + 4, py + 10, T - 8, T - 14);
      ctx.fillStyle = '#ffe040';     // brighter gold for the special chest
      ctx.fillRect(px + 4, py + 8, T - 8, 10);
      // Sparkle effect (simple cross)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + T / 2 - 1, py + 2, 2, 6);
      ctx.fillRect(px + T / 2 - 3, py + 4, 6, 2);
    }
  }

  /* ─────────────────────────────────────────────
     BOSS SPRITE
     The France-flag guardian.
     px/py is the top-left of the boss's tile.
     bobOffset: a sine-wave float for floating animation.
     flashWhite: true when recently hit → paint solid white.
  ──────────────────────────────────────────────── */
  function drawBoss(ctx, px, py, bobOffset, flashWhite) {
    // Boss body dimensions — 2 tiles wide, 2 tiles tall, centered
    const bw = T * 2 - 8;
    const bh = T * 2 - 8;
    const bx = px - T / 2 + 4;
    const by = py - T / 2 + 4 + bobOffset;

    // France tricolor body
    const sectionW = bw / 3;
    ctx.fillStyle = flashWhite ? '#fff' : C.bossBlue;
    ctx.fillRect(bx,               by, sectionW, bh);
    ctx.fillStyle = flashWhite ? '#fff' : C.bossWhite;
    ctx.fillRect(bx + sectionW,    by, sectionW, bh);
    ctx.fillStyle = flashWhite ? '#fff' : C.bossRed;
    ctx.fillRect(bx + sectionW * 2, by, sectionW, bh);

    // Border
    ctx.strokeStyle = C.bossOutline;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    // Angry eyebrows
    ctx.fillStyle = C.bossEye;
    ctx.fillRect(bx + 6,       by + 6, 10, 3);
    ctx.fillRect(bx + bw - 16, by + 6, 10, 3);

    // Eyes
    ctx.fillRect(bx + 8,       by + 10, 6, 7);
    ctx.fillRect(bx + bw - 14, by + 10, 6, 7);

    // Mouth
    ctx.fillStyle = C.bossMouth;
    ctx.fillRect(bx + 10, by + bh - 14, bw - 20, 4);
  }

  /**
   * HP bar drawn above the boss.
   * Separate from drawBoss so it can be above everything else.
   */
  function drawBossHPBar(ctx, px, py, hp, maxHP, bobOffset) {
    const barW = T * 2;
    const barX = px - T / 2;
    const barY = py - T / 2 - 10 + bobOffset;

    // Background (empty bar)
    ctx.fillStyle = C.hpBarEmpty;
    ctx.fillRect(barX, barY, barW, 7);

    // Filled portion
    ctx.fillStyle = C.hpBarFull;
    ctx.fillRect(barX, barY, barW * (hp / maxHP), 7);

    // Border
    ctx.strokeStyle = C.hpBarBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, 7);
  }

  /* ─────────────────────────────────────────────
     PLAYER SPRITE
     dir: 'up' | 'down' | 'left' | 'right'
     alpha: 0–1 (used for hit flash blinking)
     swordActive: true when player just attacked
  ──────────────────────────────────────────────── */
  function drawPlayer(ctx, px, py, dir, alpha, swordActive) {
    ctx.globalAlpha = alpha;

    // Body / top
    ctx.fillStyle = C.playerCloth;
    ctx.fillRect(px + 9, py + 14, 14, 14);

    // Head / skin
    ctx.fillStyle = C.playerSkin;
    ctx.fillRect(px + 10, py + 6, 12, 12);

    // Hair (longer sides for a feminine look)
    ctx.fillStyle = C.playerHair;
    ctx.fillRect(px + 9,  py + 4,  14, 7);   // top
    ctx.fillRect(px + 7,  py + 6,  4,  10);  // left side
    ctx.fillRect(px + 21, py + 6,  4,  10);  // right side

    // Eyes
    ctx.fillStyle = '#333333';
    ctx.fillRect(px + 12, py + 11, 3, 3);
    ctx.fillRect(px + 17, py + 11, 3, 3);

    // Legs
    ctx.fillStyle = C.playerPants;
    ctx.fillRect(px + 10, py + 26, 5, 6);
    ctx.fillRect(px + 17, py + 26, 5, 6);

    // ── Tiny French flag in hand ──
    // Flag appears on opposite side from where player is facing
    const flagX = (dir === 'left') ? px - 6 : px + T - 2;
    const flagY  = py + 10;
    ctx.fillStyle = C.flagPole;
    ctx.fillRect(flagX, flagY, 2, 14);
    ctx.fillStyle = C.flagBlue;
    ctx.fillRect(flagX + 2, flagY, 4, 8);
    ctx.fillStyle = C.flagWhite;
    ctx.fillRect(flagX + 6, flagY, 4, 8);
    ctx.fillStyle = C.flagRed;
    ctx.fillRect(flagX + 10, flagY, 4, 8);

    // ── Sword swing (only visible when attacking) ──
    if (swordActive) {
      ctx.fillStyle = C.swordBlade;
      if      (dir === 'right') ctx.fillRect(px + T - 2, py + 6,  5,  20);
      else if (dir === 'left')  ctx.fillRect(px - 10,    py + 6,  5,  20);
      else if (dir === 'down')  ctx.fillRect(px + T - 4, py + 10, 18,  5);
      else if (dir === 'up')    ctx.fillRect(px - 14,    py + 10, 18,  5);
    }

    ctx.globalAlpha = 1;  // always reset alpha
  }

  /* ─────────────────────────────────────────────
     PARTICLE
     Each particle is just a colored square.
     life/maxLife controls fade-out via globalAlpha.
  ──────────────────────────────────────────────── */
  function drawParticle(ctx, p) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle   = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
  }

  /* ─── Public API ─── */
  return {
    drawGrass,
    drawPath,
    drawWall,
    drawWater,
    drawTree,
    drawLetterChest,
    drawFinalChest,
    drawBoss,
    drawBossHPBar,
    drawPlayer,
    drawParticle,
  };
})();
