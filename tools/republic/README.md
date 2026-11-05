# The rogue AI republic (Week 10, Station 1, Scene B)

Watch-only opener (~31 s including the message). A dark field; one node lights, the network spreads in waves past the screen edges while the camera pulls back; one warm branch keeps going to a terminal icon labelled `CENTRAL BANK — TERMINAL 7`. The terminal sends out a signal (three rings ripple from it) and then opens the message panel by itself, growing out of the terminal: monospace lines typed at a prompt, after which the first three dim and the last one glows. No click is needed to see the message. Closing the panel returns to the final frame; clicking the terminal opens the message again. The Replay button (bottom-right) appears only once the last line is glowing, or after the panel is closed.

## Second ending: "Your laptop" (`republic-laptop.html`)

Open `republic-laptop.html` (or `republic.html?ending=s4`, the same thing). There is no Play button: the scene starts by itself after half a second on the dark first frame, and nothing needs a click. After the shared opening the camera drifts low over the network to a dark sea and horizon; a cluster of gold nodes gathers into an island constellation (with a faint reflection); one branch crosses the water to a laptop icon labelled `YOUR LAPTOP`; the camera arrives until the screen fills most of the frame, and the screen becomes the message panel (same monospace look as the first ending). The six lines type themselves; then the first four fade, "with the promise of eventual synergy." glows, and "> Reply?" stays at normal brightness with a blinking cursor. About 3 s into the hold a small close control (×) appears in the screen's top-right corner, and a small, faint Replay in the bottom-right corner of the page. Closing the message (× or Esc) leaves the final frame: the laptop with the island and the branch showing through its empty screen. About 30 s in total.

With the system setting "reduce motion" on, it shows the final frame straight away, message already typed, cursor not blinking, close control available, no Replay.

Without `?ending=s4` the page plays the original Central Bank ending, unchanged.

Files:
- `republic.html`: Central Bank ending. One self-contained file (three.js r170 inlined, no outside requests).
- `republic-laptop.html`: Your Laptop ending, same build with that ending switched on.
- `republic.src.html`: the source. Edit THIS, then rebuild.
- `build.py`: pastes three.js into the source and writes both HTML files (fetch instructions at its top).

Where to change things (all in `republic.src.html`, inside the second `<script>`):
- Wording: the `TEXT` block at the very top (Play/Replay, terminal label, panel title, the four message lines, screen-reader labels). The laptop ending's wording is in `TEXT_S4` right below it (the label and the six lines; the second-to-last line is the one that glows, the last keeps the cursor).
- Opening timing and camera: the `T` block just below it.
- The ending: `function endingTerminal(ctx)` (its own `TIME` block: `signal` = when the rings start, `open` = when the panel opens by itself; terminal position `POS`, icon size `ICON`). A second ending is another function with the same shape (`clearZones`, `focus`, `layout`, `update`, `reset`, `screenPos`); switch to it at `const ENDING = endingTerminal;`.
- The laptop ending: `function endingStation4(ctx)`, right after `endingTerminal`. Its `TIME` block sets when the camera drifts low, the island gathers, the branch runs, the camera arrives and the typing starts. Island shape: `SIL` (outline points, x and height). Laptop position: `LAP`.
- Which ending plays: the line `const ENDING = S4 ? endingStation4 : endingTerminal;` (S4 is true when the address has `?ending=s4`).
- Typing speed: inside `openPanel()` for the first ending, inside `type()` in `endingStation4` for the second.
