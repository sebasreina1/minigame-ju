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
const state = {
  running:      false,
  lettersFound: 0,
  bossDefeated: false,
  moveTimer:    0,
};

function initGame() {
  state.running = true;
  HUD.show();
  HUD.updateHP(Entities.player.hp, Entities.player.maxHP);
  requestAnimationFrame(gameLoop);
  setTimeout(() => {
    const s = CONFIG.SCREENS.intro;
    Dialog.show(s.title, s.text);
  }, 400);
}

function gameLoop() {
  if (!state.running) return;
  if (!Dialog.isOpen()) {
    updatePlayer();
    updateBoss();
  }
  Entities.updateParticles();
  Renderer.drawFrame(Entities);
  requestAnimationFrame(gameLoop);
}

function updatePlayer() {
  const p   = Entities.player;
  const cfg = CONFIG.PLAYER;
  if (p.hitFlash > 0) p.hitFlash--;
  if (p.sword    > 0) p.sword--;
  state.moveTimer++;
  if (state.moveTimer >= cfg.moveEveryNFrames) {
    state.moveTimer = 0;
    handlePlayerMovement();
  }
  if (Input.isAttack() && p.sword === 0) {
    p.sword = cfg.swordDuration;
    tryAttackBoss();
  }
}

function handlePlayerMovement() {
  const p  = Entities.player;
  let nx = p.x, ny = p.y;
  if      (Input.isMoveUp())    { ny--; p.dir = 'up';    }
  else if (Input.isMoveDown())  { ny++; p.dir = 'down';  }
  else if (Input.isMoveLeft())  { nx--; p.dir = 'left';  }
  else if (Input.isMoveRight()) { nx++; p.dir = 'right'; }
  if ((nx !== p.x || ny !== p.y) && !GameMap.isSolid(nx, ny, Entities.chests)) {
    p.x = nx;
    p.y = ny;
    checkChestInteraction();
  }
}

function checkChestInteraction() {
  const p = Entities.player;
  const nearby = [
    { x: p.x,     y: p.y - 1 },
    { x: p.x,     y: p.y + 1 },
    { x: p.x - 1, y: p.y     },
    { x: p.x + 1, y: p.y     },
    { x: p.x,     y: p.y     },
  ];
  
  for (const ch of Entities.chests) {
    if (!nearby.some(pos => pos.x === ch.x && pos.y === ch.y)) continue;
    if (ch.type === 'letter' && !ch.opened) {
      if (ch.order === state.lettersFound + 1) {
          openLetterChest(ch);
        } else {
          Dialog.show(
            'Not yet!',
            'This chest wants to wait its turn...\nFind the earlier letters first.'
          );
        }
      return;
    }
    if (ch.type === 'boss' && ch.locked) {
      Dialog.show(CONFIG.SCREENS.bossLocked.title, CONFIG.SCREENS.bossLocked.text);
      return;
    }
    if (ch.type === 'final' && !ch.opened) {
      if (!state.bossDefeated) {
        Dialog.show(CONFIG.SCREENS.finalLocked.title, CONFIG.SCREENS.finalLocked.text);
      } else {
        ch.locked = false;
        ch.opened = true;
        Screens.showEndScreen();
      }
      return;
    }
  }
}

function openLetterChest(chest) {
  chest.opened = true;
  state.lettersFound++;
  Entities.spawnParticles(chest.x, chest.y, CONFIG.COLORS.particleGold);
  const letter = CONFIG.LETTERS[chest.letterIdx];
  Dialog.show(letter.title, letter.text, () => {
    if (state.lettersFound >= CONFIG.LETTERS.length) {
      const bossCh = Entities.chests.find(c => c.type === 'boss');
      if (bossCh) bossCh.locked = false;
    }
  });
}

function updateBoss() {
  const b   = Entities.boss;
  const p   = Entities.player;
  const cfg = CONFIG.BOSS;
  if (!b.alive) return;
  b.animTick++;
  if (b.hitFlash > 0) b.hitFlash--;
  b.moveTimer++;
  if (b.moveTimer >= cfg.moveEveryNFrames) {
    b.moveTimer = 0;
    moveBossTowardPlayer();
  }
  const dx = Math.abs(p.x - b.x);
  const dy = Math.abs(p.y - b.y);
  if (dx <= 1 && dy <= 1 && p.hitFlash === 0) {
    p.hp = Math.max(0, p.hp - 1);
    p.hitFlash = cfg.playerHitCooldown;
    HUD.updateHP(p.hp, p.maxHP);
    if (p.hp <= 0) respawnPlayer();
  }
}

function moveBossTowardPlayer() {
  const b  = Entities.boss;
  const p  = Entities.player;
  const dx = p.x - b.x;
  const dy = p.y - b.y;
  let nx = b.x, ny = b.y;
  if (Math.abs(dx) >= Math.abs(dy)) nx += Math.sign(dx);
  else                               ny += Math.sign(dy);
  if (nx >= 1 && nx < CONFIG.COLS - 1 && ny >= 1 && ny < CONFIG.ROWS - 1) {
    b.x = nx;
    b.y = ny;
  }
}

function tryAttackBoss() {
  const b   = Entities.boss;
  const p   = Entities.player;
  const cfg = CONFIG.BOSS;
  if (!b.alive) return;
  const dx = Math.abs(p.x - b.x);
  const dy = Math.abs(p.y - b.y);
  if (dx <= cfg.attackRange && dy <= cfg.attackRange) {
    b.hp--;
    b.hitFlash = cfg.hitFlashDuration;
    Entities.spawnParticles(b.x, b.y, CONFIG.COLORS.particleRed);
    if (b.hp <= 0) killBoss();
  }
}

function killBoss() {
  const b = Entities.boss;

  // Mark boss as dead FIRST
  b.alive = false;
  state.bossDefeated = true;

  // Unlock the final chest
  const finalCh = Entities.chests.find(c => c.type === 'final');
  if (finalCh) finalCh.locked = false;

  // Celebration particles
  Entities.spawnParticles(b.x,     b.y, CONFIG.COLORS.particleGold, 16);
  Entities.spawnParticles(b.x + 1, b.y, CONFIG.COLORS.particleBlue,  8);
  Entities.spawnParticles(b.x - 1, b.y, CONFIG.COLORS.particleRed,   8);

  // Show victory message — when closed, check if player is already near the final chest
  const s = CONFIG.SCREENS.bossDefeated;
  Dialog.show(s.title, s.text, () => {
    checkChestInteraction();
  });
}

function respawnPlayer() {
  const p   = Entities.player;
  const cfg = CONFIG.PLAYER;
  p.hp = cfg.respawnHP;
  p.x  = cfg.startX;
  p.y  = cfg.startY;
  HUD.updateHP(p.hp, p.maxHP);
  Dialog.show(CONFIG.SCREENS.playerDied.title, CONFIG.SCREENS.playerDied.text);
}

// Boot
Screens.initStartScreen(initGame);