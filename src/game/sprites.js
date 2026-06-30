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
     BOSS SPRITE — Spider
     px/py is the top-left of the boss's tile.
     bobOffset: a sine-wave float for floating animation.
     flashWhite: true when recently hit → paint solid white.

     Layout:
       - 8 legs (4 per side), drawn as angled rectangles
       - Round body (abdomen) — large oval-ish shape made of stacked rects
       - Smaller head section in front
       - Red "hourglass" marking on the abdomen (like a black widow)
       - Multiple small eyes
  ──────────────────────────────────────────────── */
  function drawBoss(ctx, px, py, bobOffset, flashWhite) {
    const bw = T * 2 - 8;             // overall width
    const bh = T * 2 - 8;             // overall height
    const bx = px - T / 2 + 4;        // left edge
    const by = py - T / 2 + 4 + bobOffset;  // top edge (with float animation)

    const bodyColor = flashWhite ? '#ffffff' : C.bossBlue;   // spider body color
    const legColor  = flashWhite ? '#ffffff' : '#1a1a1a';    // legs are near-black

    // ── Legs (4 per side, angled lines made of thin rects) ──
    // Each leg is drawn as two short segments to fake a "bent" leg look
    ctx.fillStyle = legColor;
    for (let i = 0; i < 4; i++) {
      const legY = by + 8 + i * 9;
      // Left legs — angle outward to the left
      ctx.fillRect(bx - 14, legY, 14, 3);
      ctx.fillRect(bx - 18, legY - 4, 6, 3);
      // Right legs — angle outward to the right
      ctx.fillRect(bx + bw,      legY, 14, 3);
      ctx.fillRect(bx + bw + 12, legY - 4, 6, 3);
    }

    // ── Body (abdomen) — round-ish shape using stacked rows of varying width ──
    ctx.fillStyle = bodyColor;
    ctx.fillRect(bx + 6,  by,      bw - 12, 6);    // top (narrow)
    ctx.fillRect(bx + 2,  by + 6,  bw - 4,  bh - 16); // middle (wide)
    ctx.fillRect(bx + 6,  by + bh - 10, bw - 12, 10);  // bottom (narrow)

    // Body outline
    // Body outline — traces the tapered shape instead of one big rectangle
    ctx.strokeStyle = C.bossOutline;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 6, by,           bw - 12, 6);          // top section outline
    ctx.strokeRect(bx + 2, by + 6,       bw - 4,  bh - 16);     // middle section outline
    ctx.strokeRect(bx + 6, by + bh - 10, bw - 12, 10);          // bottom section outline

    // ── Red hourglass marking on the abdomen ──
    ctx.fillStyle = flashWhite ? '#ffffff' : C.bossRed;
    const midX = bx + bw / 2;
    const midY = by + bh / 2;
    ctx.fillRect(midX - 1, midY - 10, 2, 6);    // top triangle (simplified as a line)
    ctx.fillRect(midX - 4, midY - 4,  8, 3);    // hourglass pinch point
    ctx.fillRect(midX - 1, midY + 4,  2, 6);    // bottom triangle

    // ── Eyes (several small dots near the top, spiders have many eyes) ──
    ctx.fillStyle = C.bossEye;
    ctx.fillRect(bx + bw / 2 - 8, by + 4, 3, 3);
    ctx.fillRect(bx + bw / 2 - 3, by + 2, 4, 4);   // slightly bigger center eyes
    ctx.fillRect(bx + bw / 2 + 2, by + 2, 4, 4);
    ctx.fillRect(bx + bw / 2 + 7, by + 4, 3, 3);
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


  function drawPlayer(ctx, px, py, dir, alpha, swordActive) {
    ctx.globalAlpha = alpha;

    // ── Hair (blonde) — drawn first so head sits on top ──
    ctx.fillStyle = C.playerHair;
    ctx.fillRect(px + 8,  py + 3,  16, 7);   // top of head hair
    ctx.fillRect(px + 6,  py + 5,  4,  14);  // left side — longer princess hair
    ctx.fillRect(px + 22, py + 5,  4,  14);  // right side — longer princess hair

    // ── Head / skin ──
    ctx.fillStyle = C.playerSkin;
    ctx.fillRect(px + 10, py + 9, 12, 11);

    // ── Crown (small gold points on top of head) ──
    ctx.fillStyle = '#f0d050';
    ctx.fillRect(px + 11, py + 1, 2, 3);   // left point
    ctx.fillRect(px + 15, py + 0, 2, 4);   // center point (tallest)
    ctx.fillRect(px + 19, py + 1, 2, 3);   // right point
    ctx.fillRect(px + 10, py + 4, 12, 2);  // crown base band

    // ── Eyes ──
    ctx.fillStyle = '#333333';
    ctx.fillRect(px + 12, py + 11, 3, 3);
    ctx.fillRect(px + 17, py + 11, 3, 3);

    // ── Dress — pink, flares out wider at the bottom like a gown ──
    // Upper bodice (narrow, fitted)
    ctx.fillStyle = C.playerCloth;          // playerCloth is now pink (see CONFIG.COLORS)
    ctx.fillRect(px + 9,  py + 17, 14, 8);
    // Skirt — flares wider as it goes down (3 stacked rows, each wider)
    ctx.fillRect(px + 7,  py + 25, 18, 4);
    ctx.fillRect(px + 5,  py + 29, 22, 4);
    // Dress trim / sparkle line near the hem
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 5,  py + 31, 22, 1);

    // ── Tiny feet peeking out from under the dress ──
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 10, py + 33, 4, 2);
    ctx.fillRect(px + 18, py + 33, 4, 2);



    // ── Sword swing (only visible when attacking) ──
    // ── Sword swing — always swings left to right, with a pointed tip ──
    // ── Sword swing — only visible when facing left/right, with a pointed tip ──
// ── Gun — only visible when facing left/right ──
    if (swordActive) {
      ctx.fillStyle = '#555555';   // gun barrel/body — dark grey

      if (dir === 'right') {
        // Barrel
        ctx.fillRect(px + T - 2, py + 14, 14, 4);
        // Grip (angled down from the back of the barrel)
        ctx.fillRect(px + T + 2, py + 17, 4, 7);
        // Trigger guard accent
        ctx.fillStyle = '#333333';
        ctx.fillRect(px + T + 1, py + 17, 2, 2);

      } else if (dir === 'up') {
        // Barrel
        ctx.fillRect(px + T - 2, py + 14, 14, 4);
        // Grip (angled down from the back of the barrel)
        ctx.fillRect(px + T + 2, py + 17, 4, 7);
        // Trigger guard accent
        ctx.fillStyle = '#333333';
        ctx.fillRect(px + T + 1, py + 17, 2, 2);

      } else if (dir === 'down') {
        // Barrel
        ctx.fillRect(px - 12, py + 14, 14, 4);
        // Grip
        ctx.fillRect(px - 6, py + 17, 4, 7);
        // Trigger guard accent
        ctx.fillStyle = '#333333';
        ctx.fillRect(px - 3, py + 17, 2, 2);
      } else if (dir === 'left') {
        // Barrel
        ctx.fillRect(px - 12, py + 14, 14, 4);
        // Grip
        ctx.fillRect(px - 6, py + 17, 4, 7);
        // Trigger guard accent
        ctx.fillStyle = '#333333';
        ctx.fillRect(px - 3, py + 17, 2, 2);
      }
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
