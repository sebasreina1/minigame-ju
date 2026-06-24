/* ═══════════════════════════════════════════════════════════════════
   hud.js  —  HEADS-UP DISPLAY (hearts, hints)
   ───────────────────────────────────────────────────────────────────
   Updates the HTML heart display above the canvas.
   Called from main.js whenever player HP changes.
   ═══════════════════════════════════════════════════════════════════ */

const HUD = (() => {
  const hpBar = document.getElementById('hp-bar');
  const hud   = document.getElementById('hud');

  /**
   * Show the HUD (called when game starts).
   */
  function show() {
    hud.classList.remove('hidden');
  }

  /**
   * Rebuild the hearts display.
   * Full hearts = red ♥, empty = dark ♡
   * @param {number} hp    - Current hearts
   * @param {number} maxHP - Maximum hearts
   */
  function updateHP(hp, maxHP) {
    hpBar.innerHTML = '';

    for (let i = 0; i < maxHP; i++) {
      const span = document.createElement('span');
      span.className = 'heart ' + (i < hp ? 'heart-full' : 'heart-empty');
      span.textContent = i < hp ? '♥' : '♡';
      hpBar.appendChild(span);
    }
  }

  /* ─── Public API ─── */
  return { show, updateHP };
})();
