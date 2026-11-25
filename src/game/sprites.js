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
   * Large crown chest, centered above its interaction tile.
   * Grey until the quest unlocks it, then gold.
   */
  function drawFinalChest(ctx, px, py, locked) {
    ctx.save();
    ctx.translate(px + T / 2, py + T);
    ctx.scale(1.5, 1.5);
    px = -T / 2;
    py = -T;
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
      ctx.fillStyle = C.chestLock;
      ctx.fillRect(px + 7, py + 10, 3, T - 14);
      ctx.fillRect(px + T - 10, py + 10, 3, T - 14);
      ctx.fillRect(px + 13, py + 16, 6, 5);
      // Sparkle effect (simple cross)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + T / 2 - 1, py + 2, 2, 6);
      ctx.fillRect(px + T / 2 - 3, py + 4, 6, 2);
    }
    ctx.restore();
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
    const x = Math.round(px - 16), y = Math.round(py - 26 + bobOffset);
    const ink = '#171b32', dark = '#3c3159', leaf = '#397b61';
    const rect = (dx, dy, w, h, color) => {
      ctx.fillStyle = flashWhite ? '#fff1cf' : color;
      ctx.fillRect(x + dx * 2, y + dy * 2, w * 2, h * 2);
    };
    // Ground shadow, cape, and alternating heavy boots.
    ctx.fillStyle = '#243944'; ctx.fillRect(x + 2, py + 29, 62, 6);
    rect(5,12,22,18,ink); rect(7,14,18,15,'#8b3c64');
    rect(8,16,3,12,'#bf5675'); rect(22,16,3,12,'#582d51');
    const step = bobOffset > 0 ? 1 : 0;
    rect(6,28+step,9,4,ink); rect(18,29-step,9,4,ink);
    rect(7,28+step,6,2,'#698084'); rect(19,29-step,6,2,'#698084');
    // Spiked shoulders and armored chest.
    rect(1,13,8,6,ink); rect(24,13,8,6,ink);
    rect(2,11,2,4,'#fff0ba'); rect(28,11,2,4,'#fff0ba');
    rect(2,14,7,3,leaf); rect(25,14,6,3,leaf);
    rect(7,14,18,12,ink); rect(9,14,14,11,leaf);
    rect(10,15,4,8,'#64ae79'); rect(21,15,2,9,'#245749');
    rect(14,16,5,6,'#eab568'); rect(15,17,3,3,'#fff0ba');
    rect(9,24,14,2,'#eab568'); rect(15,24,3,2,ink);
    // Gauntlets.
    rect(2,19,6,7,ink); rect(25,19,6,7,ink);
    rect(3,20,4,4,'#a4b6a0'); rect(26,20,4,4,'#a4b6a0');
    // Horns, brow, glowing eyes, and a toothy grin.
    rect(6,5,20,11,ink); rect(8,6,16,9,dark);
    rect(4,3,3,7,'#eab568'); rect(3,1,2,4,'#fff0ba');
    rect(25,3,3,7,'#eab568'); rect(27,1,2,4,'#fff0ba');
    rect(9,8,6,2,'#a688b0'); rect(18,8,5,2,'#a688b0');
    rect(10,10,5,2,'#fff0ba'); rect(18,10,5,2,'#fff0ba');
    rect(13,10,2,2,'#ef765d'); rect(18,10,2,2,'#ef765d');
    rect(12,14,9,2,ink); rect(13,14,2,1,'#fff0ba'); rect(18,14,2,1,'#fff0ba');
    // Three-point crown.
    rect(10,2,13,4,ink); rect(11,1,2,4,'#eab568');
    rect(15,0,3,5,'#fff0ba'); rect(21,1,2,4,'#eab568');
    rect(11,4,12,2,'#eab568'); rect(16,4,2,2,'#e55d73');
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


  function drawPlayer(ctx, px, py, dir, alpha, swordActive, hasCrown = true, aimAngle) {
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
    if (hasCrown) {
      ctx.fillStyle = '#f0d050';
      ctx.fillRect(px + 11, py + 1, 2, 3);   // left point
      ctx.fillRect(px + 15, py + 0, 2, 4);   // center point (tallest)
      ctx.fillRect(px + 19, py + 1, 2, 3);   // right point
      ctx.fillRect(px + 10, py + 4, 12, 2);  // crown base band
    }

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

    // Puff sleeves, a pearl brooch, and shaded skirt folds.
    ctx.fillStyle = '#ffe8f3';
    ctx.fillRect(px + 6, py + 18, 5, 5);
    ctx.fillRect(px + 21, py + 18, 5, 5);
    ctx.fillRect(px + 15, py + 19, 2, 3);
    ctx.fillStyle = '#b64c90';
    ctx.fillRect(px + 10, py + 24, 12, 2);
    ctx.fillRect(px + 10, py + 27, 2, 4);
    ctx.fillRect(px + 20, py + 27, 2, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 13, py + 27, 2, 3);
    ctx.fillRect(px + 17, py + 27, 2, 3);
    // ── Tiny feet peeking out from under the dress ──
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 10, py + 33, 4, 2);
    ctx.fillRect(px + 18, py + 33, 4, 2);



    // Bow and drawn string rotate with the princess's facing direction.
    if (swordActive) {
      ctx.save();
      ctx.translate(px + T / 2, py + T / 2);
      ctx.rotate(aimAngle ?? ({ right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 })[dir]);
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(9, 0, 10, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = '#fff0ce';
      ctx.beginPath();
      ctx.moveTo(9, -10);
      ctx.lineTo(4, 0);
      ctx.lineTo(9, 10);
      ctx.stroke();
      ctx.restore();
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
