# A Little Quest for You — remix

A separate 8-bit keepsake adventure based on Sebastian's minigame-ju.
The original GitHub repository has not been modified.

## Play

Open `index.html` in a browser. No installation or build needed.
Move with arrow keys / WASD, swing with Space / Z, and use Enter to close a dialog.
Touch screens have direction and swing buttons.

Collect the rose, music note, picnic basket, and star in any order.
The guardian then wakes up; defeating it unlocks the wishing heart in the north.

## Personalize

Edit `src/config/gameConfig.js`: `LETTERS` holds the four keepsake messages,
`SCREENS.end` holds the final question, and `COLORS` holds the pixel palette.
Keepsake art lives in `src/game/sprites.js`; the new presentation is in `css/remix.css`.

## Validation

JavaScript syntax and a simulated boot/render/playthrough were checked,
including collection in reverse order, guardian activation, and the final unlock.

## Console UI update

The entire interface uses the bundled Press Start 2P pixel font (license in
`assets/fonts/OFL.txt`). The title includes an original castle diorama, and the
Thorn King replaces the old spider sprite. All font and artwork assets work offline.
Run `node checks/smoke.cjs` for script, rendering, and quest progression smoke checks.
