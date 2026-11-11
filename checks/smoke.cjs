const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
process.chdir(path.join(__dirname, '..'));
const elements = new Map();
const context = new Proxy({}, { get:(target,key)=>target[key] ?? (()=>{}), set:(target,key,value)=>(target[key]=value,true) });
function element() {
  const classes = new Set(['hidden']);
  return { style:{}, dataset:{}, classList:{add:key=>classes.add(key),remove:key=>classes.delete(key),contains:key=>classes.has(key)}, addEventListener(){}, focus(){}, appendChild(){}, getContext:()=>context };
}
const sandbox = { console, Math, Set, document:{getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);},querySelectorAll:()=>[],addEventListener(){},createElement:element,body:element()}, window:{addEventListener(){}}, requestAnimationFrame(){},setTimeout(){} };
vm.createContext(sandbox);
const html = fs.readFileSync('index.html','utf8');
for(const [,file] of html.matchAll(/<script src="([^"]+)"/g)) vm.runInContext(fs.readFileSync(file,'utf8'), sandbox, {filename:file});
vm.runInContext(`
if(Entities.boss.alive) throw Error('Guardian activated early');
for(const chest of Entities.chests.filter(c=>c.type==='letter').reverse()) { openLetterChest(chest); Dialog.close(); }
if(state.lettersFound!==4 || !Entities.boss.alive) throw Error('Keepsake unlock failed');
for(const offset of [-2,0,2]) {
  Sprites.drawBoss(Renderer.ctx,320,160,offset,false);
  Sprites.drawBoss(Renderer.ctx,320,160,offset,true);
}
for(const direction of ['up','down','left','right']) Sprites.drawPlayer(Renderer.ctx,64,64,direction,1,true);
Renderer.drawFrame(Entities);
killBoss(); Dialog.close();
if(!state.bossDefeated || Entities.chests.find(c=>c.type==='final').locked) throw Error('Final unlock failed');
Entities.player.x=10; Entities.player.y=3; checkChestInteraction();
if(state.running || document.getElementById('end-screen').classList.contains('hidden')) throw Error('Ending failed');
`,sandbox);
assert(fs.statSync('assets/fonts/PressStart2P-Regular.ttf').size > 10000);
console.log('PASS: all scripts, title scene, boss poses, sword directions, render, keepsakes, guardian, and ending.');
