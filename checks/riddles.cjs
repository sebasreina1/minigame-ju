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
    focus() { sandbox.document.activeElement = this; documentEvents.focusin?.(); },
    querySelector() { return sandbox.document.getElementById('riddle-submit'); },
  };
}
const sandbox = {
  console, Math, Set,
  Renderer: { drawFrame() {} },
  document: {
    body: element(),
    querySelectorAll() { return []; },
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
    addEventListener(event, callback) { documentEvents[event] = callback; },
  },
  window: { addEventListener(event, callback) { windowEvents[event] = callback; } },
  HUD: { updateHP() {}, show() {} }, Screens: { initStartScreen() {}, showEndScreen() {} },
};
vm.createContext(sandbox);
for (const file of ['src/config/gameConfig.js', 'src/game/dialog.js', 'src/game/entities.js', 'src/game/map.js', 'src/game/input.js', 'src/game/main.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}
function run(code) { return vm.runInContext(code, sandbox); }
function submit(answer) {
  nodes.get('riddle-answer').value = answer;
  nodes.get('riddle-form').listeners.submit({ preventDefault() {} });
}
assert.equal(run('Entities.player.hasCrown'), false, 'the quest starts without a crown');
assert.equal(run('Entities.boss.alive'), false, 'guardian sleeps until the riddles are solved');
run('Entities.player.hp = 1');
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
const submitButton = nodes.get('riddle-form').querySelector('button');
documentEvents.keydown?.({ key: 'Tab', shiftKey: true, preventDefault() {} });
assert.equal(sandbox.document.activeElement, submitButton, 'Shift+Tab wraps to submit inside the riddle');
documentEvents.keydown?.({ key: 'Tab', shiftKey: false, preventDefault() {} });
assert.equal(sandbox.document.activeElement, nodes.get('riddle-answer'), 'Tab wraps back to the answer');
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
assert.equal(run('Entities.boss.alive'), true, 'four solved riddles awaken the guardian');
assert.equal(run('Entities.player.hp'), run('Entities.player.maxHP'), 'combat starts with restored health');
run('Entities.boss.x = 4; Entities.boss.y = 1; Entities.player.x = 6; Entities.player.y = 1; moveBossTowardPlayer()');
assert.equal(run('Entities.boss.x'), 4, 'guardian cannot step into a tree that blocks arrows');
for (let step = 0; step < 6; step++) {
  run('moveBossTowardPlayer()');
  assert.equal(run('GameMap.isSolid(Entities.boss.x, Entities.boss.y, Entities.chests)'), false);
}
assert.equal(run('Entities.boss.x === Entities.player.x && Entities.boss.y === Entities.player.y'), true, 'guardian routes around the tree instead of getting stuck');
assert.equal(run("Entities.chests.find(c => c.type === 'boss').locked"), false);
run('state.bossDefeated = true');
approachChest('final');
assert.equal(run('Entities.player.hasCrown'), false, 'the final riddle must be solved before awarding the crown');
submit('a hat');
assert.equal(run("Entities.chests.find(chest => chest.type === 'final').opened"), false, 'wrong final answer keeps the chest closed');
submit('the crown');
assert.equal(run("Entities.chests.find(chest => chest.type === 'final').opened"), true, 'solving the final riddle unlocks the ending');
assert.equal(run('Entities.player.hasCrown'), true, 'the final chest awards the crown');
windowEvents.keydown(key('ArrowLeft'));
assert.equal(run('Input.isMoveLeft()'), true);
windowEvents.blur();
assert.equal(run('Input.isMoveLeft()'), false);
console.log('PASS: answer gating, retries, normalization, duplicate submits, all four chests, boss unlock, and keyboard isolation.');
