/* ═══════════════════════════════════════════════════════════════════
   input.js  —  KEYBOARD INPUT
   ───────────────────────────────────────────────────────────────────
   Tracks which keys are currently held down.
   main.js reads Input.isDown() every frame to move the player.

   To add a new key binding:
     • Add the key string to the lists below in isMove* or isAttack
   ═══════════════════════════════════════════════════════════════════ */

const Input = (() => {
  // Set of currently held keys (key string → true)
  const held = new Set();

  // Listen on the window so the canvas doesn't need focus
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName) || e.target.isContentEditable || Dialog.isOpen()) return;
    held.add(e.key);
    // Prevent arrow keys from scrolling the page
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    held.delete(e.key);
  });

  window.addEventListener('blur', () => held.clear());
  document.addEventListener('focusin', () => held.clear());

  window.addEventListener('pointermove', event => {
    if (event.target !== Renderer.canvas || Dialog.isOpen()) return;
    const canvas = Renderer.canvas;
    const bounds = canvas.getBoundingClientRect();
    const rect = { left: bounds.left + canvas.clientLeft, top: bounds.top + canvas.clientTop, width: canvas.clientWidth, height: canvas.clientHeight };
    const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    if (!scale) return;
    const x = (event.clientX - rect.left - (rect.width - canvas.width * scale) / 2) / scale;
    const y = (event.clientY - rect.top - (rect.height - canvas.height * scale) / 2) / scale;
    if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) return;
    Entities.player.aimTarget = { x, y };
  });
  /* ─── Query helpers ─── */

  /** True if any "move up" key is held */
  function isMoveUp()    { return held.has('ArrowUp')    || held.has('w') || held.has('W'); }

  /** True if any "move down" key is held */
  function isMoveDown()  { return held.has('ArrowDown')  || held.has('s') || held.has('S'); }

  /** True if any "move left" key is held */
  function isMoveLeft()  { return held.has('ArrowLeft')  || held.has('a') || held.has('A'); }

  /** True if any "move right" key is held */
  function isMoveRight() { return held.has('ArrowRight') || held.has('d') || held.has('D'); }

  /** True if any "attack" key is held (Space or Z) */
  function isAttack()    { return held.has(' ') || held.has('z') || held.has('Z'); }

  /* ─── Public API ─── */
  return {
    isMoveUp,
    isMoveDown,
    isMoveLeft,
    isMoveRight,
    isAttack,
  };
})();
