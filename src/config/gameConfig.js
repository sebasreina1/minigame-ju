
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
    moveEveryNFrames: 40,  // How often boss takes a step (lower = faster)
    hitFlashDuration: 10,  // Frames boss flashes white when hit
    playerHitCooldown: 40, // Frames of invincibility after boss hits player
    attackRange: 4,     // Tile radius in which player's sword can hit boss
  },

  /* ─────────────────────────────────────────────
     LETTERS
     Add as many as you want.
     Each needs a matching chest in CHESTS below.
     letterIdx: index into this array (0, 1, 2…)
  ──────────────────────────────────────────────── */
  LETTERS: [
    { title: '01 / A rose for you', text: 'A tiny rose, a very big feeling.\nSome things bloom a little brighter with you around.' },
    { title: '02 / Our little dance', text: 'One song. Two people. A whole world fading away.\nHere is to all the dances still ahead of us.' },
    { title: '03 / Somewhere together', text: 'A picnic beneath the trees. No rush, no grand plans.\nJust a little time together.' },
    { title: '04 / Under the same stars', text: 'Even from far away, we share the same sky.\nAll four keepsakes are yours. The guardian is awake!' },
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
  { x: 4,  y: 11, type: "letter", letterIdx: 0, order: 1 },
  { x: 14, y: 7,  type: "letter", letterIdx: 1, order: 2 },
  { x: 16, y: 10, type: "letter", letterIdx: 2, order: 3 },
  { x: 17,  y: 2,  type: "letter", letterIdx: 3, order: 4 },

  { x: 10, y: 5,  type: "boss"  },
  { x: 10, y: 2,  type: "final" },
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
    grass:        '#42665c',
    grassAlt:     '#3c6055',
    path:         '#bb9c7b',
    pathAlt:      '#ad8e70',
    wall:         '#58516b',
    wallShadow:   '#423d56',
    water:        '#465b89',
    waterShine:   '#708bb2',
    treeTrunk:    '#6a4a2a',
    treeLeaves:   '#294e4f',
    treeTop:      '#3b7063',

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

    /* Player — Princess */
    playerSkin:   '#f5d090',
    playerHair:   '#edc616',   // blonde
    playerCloth:  '#ff8fc7',   // dress (pink)
    playerPants:  '#3060a0',   // unused now but kept for compatibility


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
      title:    'A LITTLE QUEST\nFOR YOU',
      subtitle: 'Arrow keys or WASD to move · Space / Z to attack',
      hint:     'Four keepsakes. One little adventure. Something from the heart.',
      button:   'START ADVENTURE',
    },
    intro: {
      title: 'How to play',
      text:
`Arrow keys / WASD → Move
Space / Z → Attack

Collect all 4 keepsakes, in any order,
then defeat the boss!

Your answer awaits at the end.`,
    },
    bossLocked: {
      title: 'Locked!',
      text:  'The guardian is still dreaming.\nFind all 4 keepsakes first!',
    },
    finalLocked: {
      title: 'Locked!',
      text:  'The wishing heart is sleeping. Defeat the guardian first!',
    },
    bossDefeated: {
      title: 'GUARDIAN DEFEATED!',
      text:
`The Guardian has fallen!

A wishing heart is glowing to the north...
Your final answer awaits!`,
    },
    playerDied: {
      title: 'You Died!',
      text:
`You were defeated by the Guardian...
But a fairy revived you!`,
    },
    end: {
      title:   'PLAYER TWO?',
      message:
`For you,\n\nA rose, a dance, a quiet afternoon, and a sky full of stars.\nLittle things I would love to share with you.\n\nWill you be my player two?`,
      yesLabel: 'OUI! <3',
      noLabel:  'A little more time',
      yesTitle:  'ADVENTURE UNLOCKED!',
      yesMessage:
`My favourite adventure starts here.

Achievement unlocked:
Player two, found.

With love, Sebastian`,
    },
  },
};
