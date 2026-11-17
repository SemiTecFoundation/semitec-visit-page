# SemiTec Foundation — expo presentation

A self-running, video-like presentation for exhibitions, about 6½ minutes per loop. It has 27 scenes: the purpose, the gap and the laboratory initiative; the AMD AUP-ZU3, with a guided board tour (12 parts) and a zoom from the package down to LUTs, flip-flops, DSP48E2 and RAMB36; the hands-on flow and toolchain (Vivado, Vitis, PYNQ/Jupyter); PS↔PL with a notebook; live dashboards (sensors, signal analysis, vision); sensors and measurement; project ideas; lab photos; materials; projects; hackathons and conferences (format, event cycle, challenge ideas, conferences); engineer meetings and guest lectures (meeting series, example topics, guest lectures, talk to project); the roadmap; and the call to join. It is plain HTML/CSS/JavaScript, with no build step. Open `index.html` in Chrome, Edge or Firefox.

## Controls

| Action | Keys / mouse |
|---|---|
| Pause / play | **Space**, **K**, a click anywhere, or the ▶︎/❚❚ button |
| Next / previous scene | **→ ↓ PageDown Enter** / **← ↑ PageUp Backspace**, mouse **scroll**, or a swipe |
| First / last scene | **Home** / **End** |
| Jump to a scene | Click its segment in the progress bar |
| English ↔ Armenian | **L** or the ՀԱՅ/EN button |
| Fullscreen | **F** or the ⛶ button |

While playing, the deck auto-advances and loops. Navigating while it is paused shows each scene in its finished state, like a slide deck. A paused deck resumes by itself after 60 s without input, so the expo screen never stays frozen. The controls fade out when the mouse is idle.

URL options: `?lang=hy`, `?scene=5`, `?paused=1`, `?chapter=labs|library|projects|hackathons|meetings` (play one chapter), `?embed=1` (website mode: starts paused behind a play button). They can be combined, e.g. `index.html?lang=hy&scene=5`.

## Editing

- **Text** in both languages lives in `js/content.js` as `[English, Armenian]` pairs. The Armenian is a draft for review.
- **Timing**: each `<section class="scene" data-duration="…">` in `index.html` sets how long the scene plays, in ms. Element delays are the `--d` values.
- **Settings** (default language, looping, auto-resume time, controls fade): `EXPO_CONFIG` at the top of `js/content.js`.
- The design is a fixed 1920×1080 stage, scaled to fit any screen.

## Lab photos

The "Inside the lab" scene plays only when photos are listed. To add them:

1. Put the photos in `assets/gallery/` (JPG, ideally landscape and at least 1920 px wide).
2. List them in `GALLERY` at the bottom of `js/content.js`:
   ```js
   const GALLERY = [
     { src: 'assets/gallery/lab-1.jpg', caption: ['Students testing a design on the AUP-ZU3', 'Ուսանողները փորձարկում են նախագիծը AUP-ZU3-ի վրա'] },
     { src: 'assets/gallery/lab-2.jpg' }
   ];
   ```
Each photo shows for about 4.5 s with a slow zoom. Captions are optional.

## Files

```
index.html        scenes
css/expo.css      layout, colours (foundation website palette) and animations
js/content.js     texts (EN/HY) and settings
js/expo.js        player: autoplay, pause, keyboard/scroll/touch, language
js/scenes.js      board drawing copies, board tour, FPGA zoom, live dashboards
js/backdrop.js    animated circuit-trace background
assets/           SemiTec Academy screenshots (training.png, lab.png)
```

Fonts load from Google Fonts when online. Offline, system fonts are used and the deck still works.

Board facts come from the feature list on the AUP-ZU3 board overview (https://xilinx.github.io/AUP-ZU3/overview.html). The board drawing follows the real component layout. The FPGA zoom is a simplified illustration. Its numbers (8 LUTs and 16 flip-flops per CLB, CARRY8, a clock region of 60 CLBs, 24 DSP and 12 BRAM, 360 DSP48E2, 216 RAMB36) come from AMD UG574, UG899 and the Zynq UltraScale+ product table. Dashboard values are example data.

## About chapter (`?chapter=about`)
Fourteen scenes that play only from the website's About section (`data-solo="about"`), so the full
presentation stays as it was: people, the path, the mission in five parts, the vision in three parts,
the Aragats symbol and a closing line. Texts are the `ab*` keys in `js/content.js`; in a text, `*word`
highlights a word. The symbol animation is `js/aragats.js`, shared with the website's 2D view
(section 02), and the globe is drawn in `js/about.js`.
