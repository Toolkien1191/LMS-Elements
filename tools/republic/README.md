# The rogue AI republic (Week 10, Station 1, Scene B)

Watch-only opener (~23 s, then a click-to-open message). A dark field; one node lights, the network spreads in waves past the screen edges while the camera pulls back; one warm branch keeps going to a terminal icon labelled `CENTRAL BANK — TERMINAL 7`. The terminal pulses; clicking it opens a monospace panel that types the four message lines, then dims the first three and makes the last one glow. Closing the panel returns to the final frame. Replay button bottom-right.

Files:
- `republic.html`: the deliverable. One self-contained file (three.js r170 inlined, no outside requests).
- `republic.src.html`: the source. Edit THIS, then rebuild.
- `build.py`: pastes three.js into the source and writes `republic.html` (fetch instructions at its top).

Where to change things (all in `republic.src.html`, inside the second `<script>`):
- Wording: the `TEXT` block at the very top (Play/Replay, terminal label, panel title, the four message lines, screen-reader labels).
- Opening timing and camera: the `T` block just below it.
- The ending: `function endingTerminal(ctx)` (its own `TIME` block, terminal position `POS`, icon size `ICON`). A second ending is another function with the same shape (`clearZones`, `focus`, `layout`, `update`, `reset`); switch to it at `const ENDING = endingTerminal;`.
- Typing speed of the panel: inside `openPanel()`.
