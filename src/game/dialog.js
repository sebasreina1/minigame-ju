/* ═══════════════════════════════════════════════════════════════════
   dialog.js  —  MESSAGE / LETTER POPUP
   ───────────────────────────────────────────────────────────────────
   Controls the dialog box that appears when the player opens a chest
   or triggers a story event.

   Usage:
     Dialog.show('Title', 'Body text here\nSecond line', onCloseCallback)
     Dialog.isOpen()   → true while a dialog is visible
   ═══════════════════════════════════════════════════════════════════ */

const Dialog = (() => {
  // DOM references (elements are in index.html)
  const box   = document.getElementById('dialog-box');
  const title = document.getElementById('dialog-title');
  const text  = document.getElementById('dialog-text');
  const btn   = document.getElementById('dialog-close');

  let _onClose = null;   // callback to run when player presses Continue

  /**
   * Show the dialog box.
   * @param {string}   titleText  - Bold heading (e.g. "Letter #1 — The Beginning")
   * @param {string}   bodyText   - Main content; \n becomes a real line break via white-space:pre-line
   * @param {Function} [onClose]  - Optional callback called when player closes the dialog
   */
  function show(titleText, bodyText, onClose) {
    title.textContent = titleText;
    text.textContent  = bodyText;   // CSS white-space:pre-line handles \n
    _onClose = onClose || null;

    box.classList.remove('hidden');
  }

  /**
   * Close the dialog programmatically (also called by the button).
   */
  function close() {
    box.classList.add('hidden');
    const cb = _onClose;
    _onClose = null;
    if (cb) cb();
  }

  /**
   * Returns true while the dialog is visible.
   * Used by main.js to pause gameplay.
   */
  function isOpen() {
    return !box.classList.contains('hidden');
  }

  // Wire up the "Continue" button
  btn.addEventListener('click', close);

  /* ─── Public API ─── */
  return { show, close, isOpen };
})();
