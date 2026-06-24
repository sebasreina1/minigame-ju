/* ═══════════════════════════════════════════════════════════════════
   map.js  —  MAP DATA & COLLISION
   ───────────────────────────────────────────────────────────────────
   Reads CONFIG.MAP to know what tile is at each position.
   isSolid() is the single collision function used by the player,
   boss AI, and anything else that needs to check walkability.
   ═══════════════════════════════════════════════════════════════════ */

const GameMap = (() => {

  /* Tile type constants — must match values in CONFIG.MAP */
  const TILE = {
    GRASS: 0,
    WALL:  1,
    PATH:  2,
    WATER: 3,
    TREE:  4,
  };

  /**
   * Returns the tile type number at grid position (tx, ty).
   * Returns WALL for out-of-bounds positions.
   */
  function getTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= CONFIG.COLS || ty >= CONFIG.ROWS) {
      return TILE.WALL;   // treat edges as walls
    }
    return CONFIG.MAP[ty][tx];
  }

  /**
   * Returns true if a tile blocks movement.
   * Walls, water, and trees are solid.
   * Paths and grass are walkable.
   */
  function isTileSolid(tx, ty) {
    const t = getTile(tx, ty);
    return t === TILE.WALL || t === TILE.WATER || t === TILE.TREE;
  }

  /**
   * Full collision check for moving to tile (tx, ty).
   * Also checks whether a chest object is blocking the tile.
   * chests: the array from entities.js
   */
  function isSolid(tx, ty, chests) {
    if (isTileSolid(tx, ty)) return true;

    // Check closed letter chests (they act as solid obstacles)
    for (const ch of chests) {
      if (ch.x === tx && ch.y === ty && ch.type === 'letter' && !ch.opened) {
        return true;
      }
    }

    return false;
  }

  /**
   * Draw all map tiles for one frame.
   * Called from renderer.js before anything else.
   */
  function drawMap(ctx) {
    const T = CONFIG.TILE_SIZE;

    for (let ty = 0; ty < CONFIG.ROWS; ty++) {
      for (let tx = 0; tx < CONFIG.COLS; tx++) {
        const tile      = getTile(tx, ty);
        const px        = tx * T;
        const py        = ty * T;
        const alternate = (tx + ty) % 2 === 0;   // checkerboard shading

        switch (tile) {
          case TILE.GRASS: Sprites.drawGrass(ctx, px, py, alternate); break;
          case TILE.WALL:  Sprites.drawWall (ctx, px, py);            break;
          case TILE.PATH:  Sprites.drawPath (ctx, px, py, alternate); break;
          case TILE.WATER: Sprites.drawWater(ctx, px, py);            break;
          case TILE.TREE:  Sprites.drawTree (ctx, px, py, alternate); break;
        }
      }
    }
  }

  /* ─── Public API ─── */
  return {
    TILE,
    getTile,
    isSolid,
    drawMap,
  };
})();
