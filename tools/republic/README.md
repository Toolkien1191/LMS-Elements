# The rogue AI republic (Week 10, Station 1, Scene B)

Watch-only opener (~31 s including the message). A dark field; one node lights, the network spreads in waves past the screen edges while the camera pulls back; one warm branch keeps going to a terminal icon labelled `CENTRAL BANK — TERMINAL 7`. The terminal sends out a signal (three rings ripple from it) and then opens the message panel by itself, growing out of the terminal: monospace lines typed at a prompt, after which the first three dim and the last one glows. No click is needed to see the message. Closing the panel returns to the final frame; clicking the terminal opens the message again. The Replay button (bottom-right) appears only once the last line is glowing, or after the panel is closed.

Files:
- `republic.html`: the deliverable. One self-contained file (three.js r170 inlined, no outside requests).
- `republic.src.html`: the source. Edit THIS, then rebuild.
- `build.py`: pastes three.js into the source and writes `republic.html` (fetch instructions at its top).

Where to change things (all in `republic.src.html`, inside the second `<script>`):
- Wording: the `TEXT` block at the very top (Play/Replay, terminal label, panel title, the four message lines, screen-reader labels).
- Opening timing and camera: the `T` block just below it.
- The ending: `function endingTerminal(ctx)` (its own `TIME` block: `signal` = when the rings start, `open` = when the panel opens by itself; terminal position `POS`, icon size `ICON`). A second ending is another function with the same shape (`clearZones`, `focus`, `layout`, `update`, `reset`, `screenPos`); switch to it at `const ENDING = endingTerminal;`.
- Typing speed of the panel: inside `openPanel()`.
