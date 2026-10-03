# Scroll vs Codex (Past Tech lesson, Task 7 prop)

3D illustration: a papyrus scroll the students must drag open to reach "DO YOU THINK THIS IS EASY?", versus a parchment codex that opens with one click to "HEY, HOW DOES THIS FEEL?" (CAPVT III). A timer compares the two. Disclaimer screen before loading. Delivered as one self-contained HTML file for the bucket + LMS iframe.

Files (in this folder of the Project):
- app.js — all the scene code (scroll, codex, textures, texts, timers). Edit THIS for revisions.
- shell.html — page wrapper: disclaimer text, buttons, HUD, colours.
- build.py — pastes three.js r170 + app.js into shell.html -> scroll-vs-codex.html (instructions for fetching the library are at the top).

Where to change common things (app.js):
- Scroll message: the `lines = ['DO YOU', 'THINK THIS', 'IS EASY?']` line. Scroll length: `NCOL` (number of columns, now 22).
- Codex message: `message: ['HEY,', 'HOW', 'DOES THIS', 'FEEL?']`; chapter heading `'CAPVT III'`.
- Filler texts: `GREEK` (Iliad 1) and `LATIN` (Martial 1.1–1.2) constants.
- Heavy for an old PC? set `renderer.shadowMap.enabled = false`.

Lessons learned: loading three.js via a blob/dynamic import fails in some hosts ("Failed to fetch dynamically imported module: blob-…"); the build therefore inlines it as a plain script.
