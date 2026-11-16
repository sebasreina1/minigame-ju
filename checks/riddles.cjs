const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
process.chdir(path.join(__dirname, '..'));
const nodes = new Map(), windowEvents = {}, documentEvents = {};
function element() {
  const classes = new Set(['hidden']);
  return { value: '', textContent: '', style: {}, listeners: {},
    classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
    addEventListener(event, callback) { this.listeners[event] = callback; },
    focus() { documentEvents.focusin?.(); },
  };
}
const sandbox = {
  console, Math, Set,
  document: {
    body: element(),
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
    addEventListener(event, callback) { documentEvents[event] = callback; },
  },
  window: { addEventListener(event, callback) { windowEvents[event] = callback; } },
  HUD: { updateHP() {}, show() {} }, Screens: { initStartScreen() {}, showEndScreen() {} },
};
vm.createContext(sandbox);
for (const file of ['src/config/gameConfig.js', 'src/game/dialog.js', 'src/game/entities.js', 'src/game/input.js', 'src/game/main.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}
function run(code) { return vm.runInContext(code, sandbox); }
function submit(answer) {
  nodes.get('riddle-answer').value = answer;
  nodes.get('riddle-form').listeners.submit({ preventDefault() {} });
}
function approachChest(type, index = 0) {
  const chest = run(`Entities.chests.filter(chest => chest.type === '${type}')[${index}]`);
  run(`Entities.player.x = ${chest.x}; Entities.player.y = ${chest.y + 1}; checkChestInteraction();`);
}
run('state.bossDefeated = true');
approachChest('final');
assert.equal(run("Entities.chests.find(chest => chest.type === 'final').opened"), false, 'cannot skip riddles by defeating the boss early');
run('Dialog.close(); state.bossDefeated = false');
approachChest('letter', 1);
assert.match(nodes.get('dialog-title').textContent, /Not yet/);
assert.equal(run('state.lettersFound'), 0, 'out-of-order chests must not award progress');
run('Dialog.close()');
const key = (key, tagName = 'BODY') => ({ key, target: { tagName }, preventDefault() { this.prevented = true; } });
windowEvents.keydown(key('w'));
assert.equal(run('Input.isMoveUp()'), true);
approachChest('letter');
assert.equal(run('Input.isMoveUp()'), false, 'opening a dialog must release movement');
assert.equal(run('state.lettersFound'), 0, 'opening a puzzle must not award progress');
run('Dialog.close()');
assert.equal(run('Dialog.isOpen()'), true, 'cannot bypass the riddle with Continue');
submit('wrong');
assert.equal(run('state.lettersFound'), 0);
assert.equal(run("Entities.chests.find(c => c.type === 'letter').opened"), false);
assert.match(nodes.get('riddle-feedback').textContent, /Try another/);
assert.doesNotMatch(nodes.get('riddle-feedback').textContent, /Hint:/);
submit('wrong again');
assert.match(nodes.get('riddle-feedback').textContent, /musical instrument/);
submit('still wrong');
assert.match(nodes.get('riddle-feedback').textContent, /black and white keys/);
submit('another guess');
assert.match(nodes.get('riddle-feedback').textContent, /black and white keys/);
assert.equal(run('state.lettersFound'), 0, 'hints must not award progress');
for (const value of [' ', 'w', 'ArrowLeft']) {
  const event = key(value, 'INPUT');
  windowEvents.keydown(event);
  assert.equal(event.prevented, undefined, 'typing and cursor keys must remain native');
}
submit('  A   PIANO!  ');
assert.equal(run('state.lettersFound'), 1, 'normalization should accept a correct answer');
assert.equal(nodes.get('riddle-form').classList.contains('hidden'), true);
assert.equal(nodes.get('dialog-close').classList.contains('hidden'), false);
submit('piano');
assert.equal(run('state.lettersFound'), 1, 'duplicate submissions must not grant extra progress');
run('Dialog.close()');
run("openLetterChest(Entities.chests.find(c => c.type === 'letter'))");
assert.equal(run('Dialog.isOpen()'), false, 'opened chest stays opened');
// Complete the other chests through the actual dialog submit handler.
for (const [index, answer] of [[1, 'towel'], [2, 'a map'], [3, 'sponge']]) {
  approachChest('letter', index);
  assert.equal(nodes.get('riddle-feedback').textContent, '', 'hints reset for each chest');
  assert.equal(nodes.get('riddle-form').classList.contains('hidden'), false);
  submit(answer);
  run('Dialog.close()');
}
assert.equal(run('state.lettersFound'), 4);
assert.equal(run("Entities.chests.find(c => c.type === 'boss').locked"), false);
run('state.bossDefeated = true');
approachChest('final');
assert.equal(run("Entities.chests.find(chest => chest.type === 'final').opened"), true, 'all riddles plus boss victory unlock the ending');
windowEvents.keydown(key('ArrowLeft'));
assert.equal(run('Input.isMoveLeft()'), true);
windowEvents.blur();
assert.equal(run('Input.isMoveLeft()'), false);
console.log('PASS: answer gating, retries, normalization, duplicate submits, all four chests, boss unlock, and keyboard isolation.');
