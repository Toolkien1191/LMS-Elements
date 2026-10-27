# Penrose (Week 10, Station 1, Scene A)

Watch-only opener, about 28 s. A person comes round from anaesthesia:
1. A dim, head-bowed silhouette with a slow, faint pulse inside the head.
2. The camera flies in through the head to one neuron (cell body, dendrites, one long axon); label `neuron`.
3. It follows the axon and goes inside: microtubules run lengthwise in a loose bundle, ringed like their protein units; label `microtubules`.
4. Each tube flickers on its own; the flickers fall into step until one shared pulse runs along the bundle (about 3.5 shared pulses).
5. The spike: the spark comes out of the shared pulse, runs along the bundle and blooms.
6. Throughout 3–5 a faint monitor trace runs along the bottom: ragged noise, then a steady rhythm, one sharp spike, then a calm rhythm.
7. The camera pulls back out to the person, now fully lit, who lifts their head. Hold, fade to dark.

Starts on a Play click, ends with a small Replay button. No timers or audio.

Files:
- `src.html`: the whole page (styles, markup, scene script). Edit THIS.
- `build.py`: pastes three.js r170 into `src.html` and writes `penrose.html` (one self-contained file, no outside requests). How to fetch the library is at the top of `build.py`.
- `penrose.html`: the built deliverable for the LMS iframe.

## Where to change things (all in src.html)

- **Wording**: the `WORDS` block at the top of the scene script (Play, Replay, and the two labels `neuron` and `microtubules`). This is the only on-screen text.
- **Timing**: the `T` block below it (fly-in, label times, when the flickers fall into step, pulse length, which pulse brings the spike). The spike time `T.ENDING` is worked out from these.
- **Ending**: `endingWake()`, under the "ENDING" banner: everything from the spike on (spark run and bloom, pulling back out, waking, fade). Endings are listed in `ENDINGS` and picked by `const ENDING = 'wake'`. To add a second ending, write another function `(t, te)` that uses the same scene (`updateCell`, `updateHead`, `spark`, `tubeShared`, `wash`) and returns `{ scene, dark, flash, trace }`; add it to `ENDINGS` with its duration and switch `ENDING`.
- **The spark**: `makeSpark()` builds it on its own (white core, thin gold ring, four-point star with short diagonal rays, comet tail), so the same spark can be dropped into another scene.
- **Monitor trace**: `traceValue()` (the shape of the line) and `drawTrace()` (its look). `TRACE_SPAN` is how many seconds fit across the screen.
- **Head bow**: `BOW` (unconscious, chin down) and `LIFTED` (awake), in radians.
- **Colours**: `CYAN` (silhouette, neurons, tubes) and `GOLD` (spark light).
- **Microtubules**: number of tracks in the `tracks.length < 18` line; ring spacing is the `15.` in `vS * 15.` in the tube shader.

Glow is done with additive sprites and rim shading, not post-processing, to stay light on phones. Pixel ratio is capped at 2.
