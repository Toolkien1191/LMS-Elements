# Penrose (Week 10, Station 1, Scene A)

Watch-only opener, about 28 s. A glowing head-and-shoulders silhouette; the camera flies in through the forehead into one neuron; inside, microtubules drift, slow down and turn into line one by one; a golden spark runs along the aligned bundle, blooms, holds, and the screen fades to dark. Starts on a Play click, ends with a small Replay button. No text, timers or audio.

Files:
- `src.html`: the whole page (styles, markup, scene script). Edit THIS.
- `build.py`: pastes three.js r170 into `src.html` and writes `penrose.html` (one self-contained file, no outside requests). How to fetch the library is at the top of `build.py`.
- `penrose.html`: the built deliverable for the LMS iframe.

## Where to change things (all in src.html)

- **Wording**: the `WORDS` block at the top of the scene script (Play and Replay labels). This is the only on-screen text.
- **Timing**: the `T` block below it (when the fly-in starts, when the tubules slow, how fast they align, when the ending begins).
- **Ending**: `endingGlow()`, under the "ENDING" banner. Endings are listed in `ENDINGS` and picked by `const ENDING = 'glow'`. To add a second ending, write another function with the same signature `(t, te)` (it gets the same scene: `updateCell`, `spark`, `tubeMat`, `wash`) that returns how dark the screen should be (0 to 1), add it to `ENDINGS` with its duration, and switch `ENDING`.
- **The spark**: `makeSpark()` builds it on its own (white core, thin gold ring, four-point star with short diagonal rays, comet tail), so the same spark can be dropped into another scene.
- **Colours**: `CYAN` (silhouette, neurons, tubules) and `GOLD` (spark light).
- **Number of microtubules**: `N_TUBES` (36, in a 6 × 6 bundle; changing it also needs `SLOTS`).

Glow is done with additive sprites and rim shading, not post-processing, to stay light on phones. Pixel ratio is capped at 2.
