# ADVENTURE QUEST — Developer Guide


---

## How to run

1. Open **VS Code**
2. Install the **Live Server** extension (right-click `index.html` → *Open with Live Server*)
3. Or just double-click `index.html` in your file explorer — it works without a server

No npm, no build step, no dependencies. Pure HTML + CSS + JS.

---

## File map

```
proposal-game/
│
├── index.html                  ← Page structure. Add/remove HTML sections here.
│
├── css/
│   ├── reset.css               ← CSS variables (colors, fonts). Edit to retheme.
│   ├── screens.css             ← Start screen + end (proposal) screen styles.
│   ├── hud.css                 ← Hearts display + controls hint.
│   └── dialog.css              ← Letter/story popup box.
│
└── src/
    ├── config/
    │   └── gameConfig.js       ← ⭐ MAIN SETTINGS FILE. Edit almost everything here.
    │
    └── game/
        ├── main.js             ← Game loop, player/boss logic, collision handling.
        ├── renderer.js         ← Draws each frame (controls layer order).
        ├── sprites.js          ← All pixel art drawing functions.
        ├── map.js              ← Map tile data + collision detection.
        ├── entities.js         ← Player, boss, chest, particle state objects.
        ├── input.js            ← Keyboard input (add new keys here).
        ├── dialog.js           ← Message/letter popup logic.
        ├── hud.js              ← Heart display updates.
        └── screens.js          ← Start and end screen logic + button handlers.
```

---

## Most common edits

### Change the letters
Open `src/config/gameConfig.js` → find `LETTERS` array.
Each entry has a `title` and `text`. Edit freely — `\n` creates a new line.

### Change the proposal question / YES message
Same file → `SCREENS.end` object.
Edit `message`, `yesMessage`, `yesTitle`, etc.

### Move chest locations
Same file → `CHESTS` array. Change `x` and `y` values (tile coordinates).
- `x` = column (0 = left edge, 19 = right edge)
- `y` = row (0 = top edge, 14 = bottom edge)

### Change the map layout
Same file → `MAP` array. Each number is a tile type:
- `0` = grass
- `1` = wall (solid)
- `2` = stone path
- `3` = water (solid, decorative)
- `4` = tree (solid, decorative)

### Make the boss harder / easier
Same file → `BOSS` object:
- `maxHP` — how many hits to kill the boss
- `moveEveryNFrames` — lower = faster boss (try 30 for hard, 90 for easy)
- `attackRange` — tile distance at which the sword can hit the boss

### Make the player faster / slower
Same file → `PLAYER.moveEveryNFrames` (lower = faster, try 6–15)

### Change pixel art colors
Same file → `COLORS` object. All colors use standard CSS hex values.

### Change start screen text
Same file → `SCREENS.start` object.

---

## How to redraw a sprite

All drawing happens in `src/game/sprites.js`.
Each function receives `ctx` (the canvas context), `px`/`py` (pixel position), and optional state.

Example — change the player's hair color:
```js
// In sprites.js, inside drawPlayer()
ctx.fillStyle = C.playerHair;    // C.playerHair is defined in CONFIG.COLORS
```

Just update `playerHair` in `gameConfig.js → COLORS` and you're done.

To add a whole new sprite:
1. Write a `drawMyThing(ctx, px, py, ...)` function in `sprites.js`
2. Call it from `renderer.js` in the right layer (map → chests → boss → player → particles)

---

## Controls (in game)

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Space / Z | Attack |

To add a new key binding, edit `src/game/input.js`.

---

## Adding more letters

1. Add an entry to `CONFIG.LETTERS` in `gameConfig.js`
2. Add a matching chest to `CONFIG.CHESTS` with `type: "letter"` and the correct `letterIdx`
3. Place it somewhere on the `MAP` (make sure the tile is walkable — `0` or `2`)
4. Update `CONFIG.BOSS` → the boss unlocks after **all** letters are found
   (the check in `main.js` compares `state.lettersFound >= CONFIG.LETTERS.length`)

---

## Tips

- Open the browser **DevTools console** (F12) to see any JS errors
- Each file has a comment block at the top explaining what it does
- Every section is marked with `// ──` comments so you can Ctrl+F to find things fast
- All text content lives in `gameConfig.js → SCREENS` so you never need to dig through logic files just to change a word
