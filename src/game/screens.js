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

    // ── YES button ──
    const yesBtn = document.createElement('button');
    yesBtn.id          = 'yes-btn';
    yesBtn.textContent = S.end.yesLabel;
    yesBtn.addEventListener('click', () => {
      endTitle.textContent   = S.end.yesTitle;
      endMessage.textContent = S.end.yesMessage;
      endButtons.innerHTML   = '';    // remove buttons after answering
    });

    // ── NO button ──
    // Every click moves it to a random position so it can't be pressed
    const noBtn = document.createElement('button');
    noCount = 0;
    noBtn.id          = 'no-btn';
    noBtn.textContent = S.end.noLabel;
    noBtn.addEventListener('click', () => {
      noCount++;
      noBtn.style.left = (Math.random() * 260) + 'px';
      noBtn.style.top  = (Math.random() * 80)  + 'px';
      
      if (noCount === 3) {
          endMessage.textContent = "It won't be as easy as you thought...";
      } else if (noCount === 5) {
          endMessage.textContent = "Bruh, come on 💀";
      } else if (noCount === 8) {
          endMessage.textContent = "this has to be a joke lmao";
      }
      else if (noCount === 14) {
          endMessage.textContent = "😭😭😭😭😭😭";
      }
    });

    endButtons.appendChild(yesBtn);
    endButtons.appendChild(noBtn);

    endScreen.classList.remove('hidden');
  }

  /* ─── Public API ─── */
  return {
    initStartScreen,
    showEndScreen,
  };
})();