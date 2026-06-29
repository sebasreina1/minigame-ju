/* ═══════════════════════════════════════════════════════════════════
   gameConfig.js  —  THE MAIN SETTINGS FILE
   ───────────────────────────────────────────────────────────────────
   This is your single source of truth.
   Edit almost EVERYTHING here:
     • Canvas / tile size
     • Player stats (HP, speed)
     • Letters content
     • Screen texts (start, end, proposal question)
     • Map layout
     • Boss stats
     • Colors for pixel art
   ═══════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ─────────────────────────────────────────────
     CANVAS & TILE SETTINGS
     TILE_SIZE: pixel size of each map square (32 = default)
     COLS x ROWS: how many tiles wide/tall the map is
  ──────────────────────────────────────────────── */
  TILE_SIZE: 32,
  COLS: 20,
  ROWS: 15,

  /* ─────────────────────────────────────────────
     PLAYER SETTINGS
  ──────────────────────────────────────────────── */
  PLAYER: {
    startX: 2,          // Starting tile column
    startY: 2,          // Starting tile row
    maxHP: 6,           // Total hearts (each = 1 hit)
    respawnHP: 3,       // Hearts restored on death
    moveEveryNFrames: 10,  // Lower = faster movement (min ~6)
    swordDuration: 12,  // How many frames the sword swing shows
  },

  /* ─────────────────────────────────────────────
     BOSS SETTINGS
  ──────────────────────────────────────────────── */
  BOSS: {
    startX: 10,         // Tile column where boss spawns
    startY: 5,          // Tile row where boss spawns
    maxHP: 5,           // Hits to kill boss
    moveEveryNFrames: 60,  // How often boss takes a step (lower = faster)
    hitFlashDuration: 10,  // Frames boss flashes white when hit
    playerHitCooldown: 40, // Frames of invincibility after boss hits player
    attackRange: 2,     // Tile radius in which player's sword can hit boss
  },

  /* ─────────────────────────────────────────────
     LETTERS
     Add as many as you want.
     Each needs a matching chest in CHESTS below.
     letterIdx: index into this array (0, 1, 2…)
  ──────────────────────────────────────────────── */
  LETTERS: [
    {
      title: "Letter #1 — The Beginning",
      text:
`Dear Juliette,

If you're reading this, it means our little adventurer found the first chest! Before I say anything else... I just want you to know that the day I met you, something shifted.

Keep going. There's more to find. 💛`,
    },
    {
      title: "Letter #2 — The Feeling",
      text:
`Dear Juliette,

You know that feeling when a song comes on and it just fits perfectly? That's what being around you feels like. Easy. Right.

I keep finding reasons to smile when I think about you. And honestly, that's a little dangerous. 😄

— Sebastian`,
    },
    {
      title: "Letter #3 — The Truth",
      text:
`Dear Juliette,

I've been trying to find the right words, but here's the truth: I don't want to overthink this.

I just know I want more of these moments. More laughing, more talking, more of whatever this is between us.

One more chest to go... 🗝️`,
    },
    {
      title: "Letter #3 — The Beginning",
      text:
`Dear Juliette,

If you're reading this, it means our little adventurer found the first chest! Before I say anything else... I just want you to know that the day I met you, something shifted.

Keep going. There's more to find. 💛`,
    },
  ],

  /* ─────────────────────────────────────────────
     CHESTS
     Place chests anywhere on the map.
     Types:
       "letter"  → opens a letter (uses letterIdx)
       "boss"    → triggers the boss fight (locked until all letters found)
       "final"   → shows the proposal (locked until boss defeated)
  ──────────────────────────────────────────────── */
  CHESTS: [
    { x: 3,  y: 3,  type: "letter", letterIdx: 0 },
    { x: 14, y: 7,  type: "letter", letterIdx: 1 },
    { x: 16, y: 10, type: "letter", letterIdx: 2 },
    { x: 10, y: 5,  type: "boss"  },   // boss spawn marker (no chest drawn here)
    { x: 10, y: 2,  type: "final" },   // the golden final chest
    { x: 10, y: 2,  type: "letter", letterIdx: 3 },

  ],

  /* ─────────────────────────────────────────────
     MAP DATA
     Numbers = tile types:
       0 = grass
       1 = wall (solid, can't walk through)
       2 = path (stone walkway)
       3 = water (solid, decorative)
       4 = tree (solid, decorative)

     Must match ROWS x COLS dimensions above.
     Edit freely — just keep the outer border as 1s.
  ──────────────────────────────────────────────── */
  MAP: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
    [1,0,0,2,2,2,2,2,0,0,0,0,2,2,2,2,0,0,0,1],
    [1,0,2,2,0,0,0,2,0,4,0,0,2,0,0,2,0,0,0,1],
    [1,0,2,0,0,0,0,2,2,2,2,2,2,0,0,2,0,4,0,1],
    [1,4,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
    [1,0,2,0,0,4,0,0,0,0,0,0,0,4,0,2,0,0,0,1],
    [1,0,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,0,0,1],
    [1,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,1],
    [1,0,4,0,0,0,0,0,2,2,2,2,0,0,0,4,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,1],
    [1,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,2,0,0,1],
    [1,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,2,4,0,1],
    [1,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  /* ─────────────────────────────────────────────
     PIXEL ART COLORS
     Edit these hex values to recolor all drawn sprites.
     Organized by category so you can find things fast.
  ──────────────────────────────────────────────── */
  COLORS: {
    /* Map tiles */
    grass:        '#5a8a3a',
    grassAlt:     '#4a7a2a',
    path:         '#c8a85a',
    pathAlt:      '#b8984a',
    wall:         '#6a5a4a',
    wallShadow:   '#5a4a3a',
    water:        '#3a6aaa',
    waterShine:   '#4a7abb',
    treeTrunk:    '#6a4a2a',
    treeLeaves:   '#2a6a2a',
    treeTop:      '#3a8a3a',

    /* Chest */
    chestLid:     '#c8a030',
    chestBody:    '#a07820',
    chestOpen:    '#8a5a10',
    chestLock:    '#c0c0c0',
    chestLocked:  '#888888',   // grey tint for locked chests

    /* Boss (France flag colors) */
    bossBlue:     '#0055A4',
    bossWhite:    '#FFFFFF',
    bossRed:      '#EF4135',
    bossOutline:  '#000000',
    bossEye:      '#000000',
    bossMouth:    '#000000',

    /* Player */
    playerSkin:   '#f5d090',
    playerHair:   '#e8c840',   // blonde
    playerCloth:  '#4a80d0',   // top
    playerPants:  '#3060a0',

    /* French flag the player holds */
    flagBlue:     '#0055A4',
    flagWhite:    '#FFFFFF',
    flagRed:      '#EF4135',
    flagPole:     '#6a4a2a',

    /* Sword */
    swordBlade:   '#c0c0c0',
    swordGuard:   '#b8860b',

    /* Particle effects */
    particleGold: '#f0d050',
    particleRed:  '#ef4135',
    particleBlue: '#0055A4',

    /* Boss HP bar */
    hpBarFull:    '#e33333',
    hpBarEmpty:   '#440000',
    hpBarBorder:  '#ffffff',
  },

  /* ─────────────────────────────────────────────
     SCREEN TEXT
     Edit all UI copy here without touching JS logic.
  ──────────────────────────────────────────────── */
  SCREENS: {
    start: {
      title:    '✦ QUEST FOR JULIETTE ✦',
      subtitle: 'Arrow keys or WASD to move · Space / Z to attack',
      hint:     'Find all letters · Defeat the boss · Answer the question',
      button:   'START',
    },
    intro: {
      title: 'How to play',
      text:
`Arrow keys / WASD → Move
Space / Z → Attack

Find all 3 letter chests,
then defeat the French boss!

Your answer awaits at the end. 💛`,
    },
    bossLocked: {
      title: 'Locked!',
      text:  'The chest glows... but something blocks it.\nFind all 3 letters first!',
    },
    finalLocked: {
      title: 'Locked!',
      text:  'A powerful lock! Defeat the boss first!',
    },
    bossDefeated: {
      title: 'Boss Defeated! 🏆',
      text:
`The Guardian of France has fallen!

A golden chest appeared to the north...
Your final answer awaits!`,
    },
    playerDied: {
      title: 'You fell!',
      text:
`You were defeated by the Guardian...
But a fairy revived you!

(Respawned with 3 hearts)`,
    },
    end: {
      title:   '💛 Final Question 💛',
      message:
`Dear Juliette,

You've made it to the end of the quest.
You defeated a whole boss for this.

So... will you be my girlfriend? 🥺`,
      yesLabel: 'Yes! 💛',
      noLabel:  'No... 😢',
      yesTitle:  '🎉 She Said YES! 🎉',
      yesMessage:
`I knew it! 💛

Adventure unlocked:
Being your boyfriend.

— Sebastian 🥰`,
    },
  },
};
