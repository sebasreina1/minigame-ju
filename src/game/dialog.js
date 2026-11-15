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

  const form = document.getElementById('riddle-form');
  const answer = document.getElementById('riddle-answer');
  const feedback = document.getElementById('riddle-feedback');
  let riddle = null;
  let onSolved = null;
  let wrongAttempts = 0;

  let _onClose = null;   // callback to run when player presses Continue

  /**
   * Show the dialog box.
   * @param {string}   titleText  - Bold heading (e.g. "Letter #1 — The Beginning")
   * @param {string}   bodyText   - Main content; \n becomes a real line break via white-space:pre-line
   * @param {Function} [onClose]  - Optional callback called when player closes the dialog
   */
  function show(titleText, bodyText, onClose) {
    riddle = null;
    onSolved = null;
    form.classList.add('hidden');
    btn.classList.remove('hidden');
    title.textContent = titleText;
    text.textContent  = bodyText;   // CSS white-space:pre-line handles \n
    _onClose = onClose || null;

    box.classList.remove('hidden');
    btn.focus();
  }

  /**
   * Close the dialog programmatically (also called by the button).
   */
  function close() {
    if (riddle) return; // A riddle cannot be dismissed to bypass its answer.
    box.classList.add('hidden');
    document.body.focus();
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

  function askRiddle(puzzle, onCorrect) {
    show('Solve the chest riddle', puzzle.question);
    riddle = puzzle;
    wrongAttempts = 0;
    onSolved = onCorrect;
    answer.value = '';
    feedback.textContent = '';
    btn.classList.add('hidden');
    form.classList.remove('hidden');
    answer.focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!riddle) return;
    const value = answer.value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '').trim();
    if (!riddle.answers.includes(value)) {
      wrongAttempts++;
      const hints = riddle.hints || [];
      const hint = hints[Math.min(wrongAttempts - 2, hints.length - 1)];
      feedback.textContent = 'Not quite. Try another answer — there is no penalty.' + (hint ? ' Hint: ' + hint : '');
      answer.focus();
      return;
    }
    const solved = onSolved;
    riddle = null;
    onSolved = null;
    close();
    solved();
  });

  // Wire up the "Continue" button
  btn.addEventListener('click', close);

  /* ─── Public API ─── */
  return { show, askRiddle, close, isOpen };
})();
