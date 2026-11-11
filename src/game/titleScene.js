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
  // Small castle with battlements, brickwork and a heart flag.
  block(401,62,66,78,'#665f7d');
  for(const x of [388,450]) {
    block(x,48,30,92,'#8a7f98');
    for(let k=0;k<3;k++) block(x+k*12,40,6,10,'#b7a4b0');
    block(x+10,68,8,17,'#242d48');
  }
  for(let y=86;y<138;y+=14) for(let x=404;x<468;x+=20) block(x+(y%28?0:8),y,12,2,'#a999aa');
  block(424,112,18,28,'#242d48'); block(428,106,10,6,'#242d48');
  block(434,13,3,46,'#e8c58c'); block(437,16,24,16,'#d96887');
  block(443,20,4,4,'#fff0ce'); block(451,20,4,4,'#fff0ce'); block(447,24,4,4,'#fff0ce');
  for(let x=0;x<640;x+=32) { Sprites.drawWall(ctx,x,144); block(x,140,32,4,'#b7cb82'); }
  for(const x of [16,80,540,590]) Sprites.drawTree(ctx,x,112,false);
  Sprites.drawPlayer(ctx,134,108,'right',1,false);
  Sprites.drawKeepsake(ctx,199,104,0,false,0);
  Sprites.drawKeepsake(ctx,252,104,3,false,30);
  Sprites.drawBoss(ctx,340,110,0,false);
})();
