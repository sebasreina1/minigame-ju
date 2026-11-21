// Original cartridge-style title diorama, rendered at the game's native resolution.
(() => {
  const canvas = document.getElementById('title-scene');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  function block(x,y,w,h,color) { ctx.fillStyle=color; ctx.fillRect(x,y,w,h); }
  block(0,0,640,176,'#141c36');
  for(let i=0;i<25;i++) block((i*83+18)%640,(i*29)%94,2,2,i%3?'#7186a5':'#ffe4a0');
  // Stepped moon, clouds and distant hills.
  block(514,12,24,24,'#ffda83'); block(508,18,36,12,'#ffda83'); block(508,12,18,15,'#141c36');
  for(const [x,y] of [[35,39],[226,18],[429,51]]) {
    block(x,y+5,60,10,'#33415f'); block(x+10,y,34,5,'#33415f');
  }
  for(const [x,h] of [[0,36],[80,58],[180,28],[282,46],[530,40]]) {
    block(x,140-h,90,h,'#293e50'); block(x+12,128-h,66,12,'#293e50');
    block(x+25,116-h,40,12,'#293e50');
  }
})();
