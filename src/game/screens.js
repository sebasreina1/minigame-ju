/* ═══════════════════════════════════════════════════════════════════
   screens.js  —  START SCREEN & END SCREEN (proposal)
   ───────────────────────────────────────────────────────────────────
   Populates DOM text from CONFIG.SCREENS and handles button clicks.
   The start screen wires up the Start button.
   The end screen wires up Yes / No buttons.
   ═══════════════════════════════════════════════════════════════════ */

const Screens = (() => {
  const S = CONFIG.SCREENS;   // shorthand

  /* ─── Start screen DOM ─── */
  const startScreen  = document.getElementById('start-screen');
  const startTitle   = document.getElementById('start-title');
  const startSubtitle= document.getElementById('start-subtitle');
  const startHint    = document.getElementById('start-hint');
  const startBtn     = document.getElementById('start-btn');

  /* ─── End screen DOM ─── */
  const endScreen    = document.getElementById('end-screen');
  const endTitle     = document.getElementById('end-title');
  const endMessage   = document.getElementById('end-message');
  const endButtons   = document.getElementById('end-buttons');

  /* ─── Populate start screen text from config ─── */
  startTitle.textContent    = S.start.title;
  startSubtitle.textContent = S.start.subtitle;
  startHint.textContent     = S.start.hint;
  startBtn.textContent      = S.start.button;

  /**
   * Hide the start screen and fire a callback (used by main.js to begin the loop).
   * @param {Function} onStart - Called when player presses START
   */
  function initStartScreen(onStart) {
    startBtn.addEventListener('click', () => {
      startScreen.classList.add('hidden');
      // Return focus to the document so keyboard events fire immediately
      document.body.focus();
      onStart();
    });
  }

  /**
   * Show the final proposal screen.
   * Builds Yes / No buttons dynamically so their handlers
   * can manipulate each other (No button runs away).
   */
  function showEndScreen() {
    endTitle.textContent   = S.end.title;
    endMessage.textContent = S.end.message;

    // Clear any previous buttons
    endButtons.innerHTML = '';

    const portrait = document.createElement('canvas');
    portrait.width = 64;
    portrait.height = 70;
    portrait.setAttribute('aria-label', 'Princess wearing her recovered crown');
    portrait.style.display = 'block';
    portrait.style.margin = '0 auto 16px';
    const ctx = portrait.getContext('2d');
    ctx.scale(2, 2);
    Sprites.drawPlayer(ctx, 0, 0, 'down', 1, false, Entities.player.hasCrown);
    endButtons.appendChild(portrait);
    const replayBtn = document.createElement('button');
    replayBtn.id = 'yes-btn';
    replayBtn.textContent = 'PLAY AGAIN';
    replayBtn.addEventListener('click', () => window.location.reload());
    endButtons.appendChild(replayBtn);

    endScreen.classList.remove('hidden');
    replayBtn.focus();
  }

  /* ─── Public API ─── */
  return {
    initStartScreen,
    showEndScreen,
  };
})();