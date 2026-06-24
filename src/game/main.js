/* ═══════════════════════════════════════════════════════════════════
   main.js  —  GAME LOOP & CORE LOGIC
   ───────────────────────────────────────────────────────────────────
   This is the "brain" of the game.
   It runs requestAnimationFrame every frame and:
     1. Reads input
     2. Updates entity state (player movement, boss AI, cooldowns)
     3. Checks collisions and interactions
     4. Triggers dialogs / screens
     5. Calls renderer.drawFrame()

   "Game state" is tracked by the `state` object below.
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Game state flags ─── */
const state = {
  running:        false,  // true after START is pressed
  lettersFound:   0,      // increments each time a letter chest is opened
  bossDefeated:   false,  // true after boss reaches 0 HP
  moveTimer:      0,      // frames since last player step (throttles movement speed)
};

/* ─────────────────────────────────────────────────
   INITIALIZATION
   Called once when the player presses START.
──────────────────────────────────────────────────── */
function initGame() {
  state.running = true;

  // Show HUD
  HUD.show();
  HUD.updateHP(Entities.player.hp, Entities.player.maxHP);

  // Start the game loop
  requestAnimationFrame(gameLoop);

  // Show the intro / how-to-play dialog after a short delay
  setTimeout(() => {
    const s = CONFIG.SCREENS.intro;
    Dialog.show(s.title, s.text);
  }, 400);
}

/* ─────────────────────────────────────────────────
   MAIN GAME LOOP
   Runs ~60 fps via requestAnimationFrame.
──────────────────────────────────────────────────── */
function gameLoop() {
  if (!state.running) return;

  // Only update logic when no dialog is blocking
  if (!Dialog.isOpen()) {
    updatePlayer();
    updateBoss();
  }

  // Always update particles (they fade even during dialogs)
  Entities.updateParticles();

  // Draw everything
  Renderer.drawFrame(Entities);

  requestAnimationFrame(gameLoop);
}

/* ─────────────────────────────────────────────────
   PLAYER UPDATE
   Called every frame when dialog is closed.
──────────────────────────────────────────────────── */
function updatePlayer() {
  const p   = Entities.player;
  const cfg = CONFIG.PLAYER;

  // Count down hit-flash and sword timers
  if (p.hitFlash > 0) p.hitFlash--;
  if (p.sword    > 0) p.sword--;

  // Throttle movement — only move every N frames
  state.moveTimer++;
  if (state.moveTimer >= cfg.moveEveryNFrames) {
    state.moveTimer = 0;
    handlePlayerMovement();
  }

  // Attack — player can swing sword any frame (sword timer prevents instant re-swing)
  if (Input.isAttack() && p.sword === 0) {
    p.sword = cfg.swordDuration;
    tryAttackBoss();
  }
}

/**
 * Read directional input and move player one tile if walkable.
 * Also checks for chest interaction after each step.
 */
function handlePlayerMovement() {
  const p  = Entities.player;
  let nx = p.x, ny = p.y;

  if      (Input.isMoveUp())    { ny--; p.dir = 'up';    }
  else if (Input.isMoveDown())  { ny++; p.dir = 'down';  }
  else if (Input.isMoveLeft())  { nx--; p.dir = 'left';  }
  else if (Input.isMoveRight()) { nx++; p.dir = 'right'; }

  // Only move if the destination is walkable
  if ((nx !== p.x || ny !== p.y) && !GameMap.isSolid(nx, ny, Entities.chests)) {
    p.x = nx;
    p.y = ny;
    checkChestInteraction();   // check if player stepped onto / next to a chest
  }
}

/* ─────────────────────────────────────────────────
   CHEST INTERACTION
   Check if the player is adjacent to (or on) any chest.
──────────────────────────────────────────────────── */
function checkChestInteraction() {
  const p = Entities.player;

  // Tiles adjacent to the player (including the player's own tile)
  const nearby = [
    { x: p.x,     y: p.y - 1 },
    { x: p.x,     y: p.y + 1 },
    { x: p.x - 1, y: p.y     },
    { x: p.x + 1, y: p.y     },
    { x: p.x,     y: p.y     },   // player's own tile
  ];

  for (const ch of Entities.chests) {
    if (!nearby.some(pos => pos.x === ch.x && pos.y === ch.y)) continue;

    // ── Letter chest ──
    if (ch.type === 'letter' && !ch.opened) {
      openLetterChest(ch);
      return;
    }

    // ── Boss-area chest (triggers boss, now just acts as a gate) ──
    if (ch.type === 'boss' && !ch.opened) {
      if (ch.locked) {
        const cfg = CONFIG.SCREENS.bossLocked;
        Dialog.show(cfg.title, cfg.text);
      }
      return;
    }

    // ── Final (proposal) chest ──
    if (ch.type === 'final' && !ch.opened) {
      if (ch.locked) {
        if (!state.bossDefeated) {
          const cfg = CONFIG.SCREENS.finalLocked;
          Dialog.show(cfg.title, cfg.text);
        } else {
          ch.locked = false;
          ch.opened = true;
          Screens.showEndScreen();
        }
      }
      return;
    }
  }
}

/**
 * Open a letter chest: mark it opened, spawn particles, show the letter.
 */
function openLetterChest(chest) {
  chest.opened = true;
  state.lettersFound++;

  const C = CONFIG.COLORS;
  Entities.spawnParticles(chest.x, chest.y, C.particleGold);

  const letter = CONFIG.LETTERS[chest.letterIdx];

  Dialog.show(letter.title, letter.text, () => {
    // After the last letter is read, unlock the boss chest
    if (state.lettersFound >= CONFIG.LETTERS.length) {
      const bossCh = Entities.chests.find(c => c.type === 'boss');
      if (bossCh) bossCh.locked = false;
    }
  });
}

/* ─────────────────────────────────────────────────
   BOSS UPDATE
   AI moves toward player periodically.
   Damages player on contact.
──────────────────────────────────────────────────── */
function updateBoss() {
  const b   = Entities.boss;
  const p   = Entities.player;
  const cfg = CONFIG.BOSS;

  if (!b.alive) return;

  // Increment animation tick (used for bobbing in renderer)
  b.animTick++;

  // Count down hit flash
  if (b.hitFlash > 0) b.hitFlash--;

  // ── Boss movement AI ──
  b.moveTimer++;
  if (b.moveTimer >= cfg.moveEveryNFrames) {
    b.moveTimer = 0;
    moveBossTowardPlayer();
  }

  // ── Boss damages player on contact ──
  const touchRange = 1;
  const dx = Math.abs(p.x - b.x);
  const dy = Math.abs(p.y - b.y);

  if (dx <= touchRange && dy <= touchRange && p.hitFlash === 0) {
    p.hp = Math.max(0, p.hp - 1);
    p.hitFlash = cfg.playerHitCooldown;
    HUD.updateHP(p.hp, p.maxHP);

    if (p.hp <= 0) {
      respawnPlayer();
    }
  }
}

/**
 * Move the boss one step toward the player (simple chase AI).
 * 70% chance to move in the dominant axis, 30% chance for the other.
 */
function moveBossTowardPlayer() {
  const b  = Entities.boss;
  const p  = Entities.player;

  const dx = p.x - b.x;
  const dy = p.y - b.y;

  // Pick axis to move on (prioritise the larger distance)
  let nx = b.x, ny = b.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    nx += Math.sign(dx);
  } else {
    ny += Math.sign(dy);
  }

  // Only move if new position is a valid tile inside the map boundary
  if (nx >= 1 && nx < CONFIG.COLS - 1 && ny >= 1 && ny < CONFIG.ROWS - 1
      && !GameMap.isTileSolid(nx, ny)) {
    b.x = nx;
    b.y = ny;
  }
}

/* ─────────────────────────────────────────────────
   PLAYER ATTACK
   Called when player presses Space/Z.
──────────────────────────────────────────────────── */
function tryAttackBoss() {
  const b   = Entities.boss;
  const p   = Entities.player;
  const cfg = CONFIG.BOSS;
  const C   = CONFIG.COLORS;

  if (!b.alive) return;

  const dx = Math.abs(p.x - b.x);
  const dy = Math.abs(p.y - b.y);

  if (dx <= cfg.attackRange && dy <= cfg.attackRange) {
    b.hp--;
    b.hitFlash = cfg.hitFlashDuration;
    Entities.spawnParticles(b.x, b.y, C.particleRed);

    if (b.hp <= 0) {
      killBoss();
    }
  }
}

/**
 * Boss death: spawn celebration particles, show victory dialog,
 * unlock the final chest.
 */
function killBoss() {
  const b = Entities.boss;
  const C = CONFIG.COLORS;

  b.alive = false;
  state.bossDefeated = true;

  // Burst of tricolor particles
  Entities.spawnParticles(b.x,     b.y, C.particleGold, 16);
  Entities.spawnParticles(b.x + 1, b.y, C.particleBlue,  8);
  Entities.spawnParticles(b.x - 1, b.y, C.particleRed,   8);

  // Unlock the final chest
  const finalCh = Entities.chests.find(c => c.type === 'final');
  if (finalCh) finalCh.locked = false;

  const s = CONFIG.SCREENS.bossDefeated;
  Dialog.show(s.title, s.text);
}

/* ─────────────────────────────────────────────────
   PLAYER DEATH / RESPAWN
──────────────────────────────────────────────────── */
function respawnPlayer() {
  const p   = Entities.player;
  const cfg = CONFIG.PLAYER;

  p.hp = cfg.respawnHP;
  p.x  = cfg.startX;
  p.y  = cfg.startY;
  HUD.updateHP(p.hp, p.maxHP);

  const s = CONFIG.SCREENS.playerDied;
  Dialog.show(s.title, s.text);
}

/* ─────────────────────────────────────────────────
   BOOT
   Wire up the start screen then wait for the player.
──────────────────────────────────────────────────── */
Screens.initStartScreen(initGame);
