# Scroll vs Codex (Past Tech lesson, Task 7 prop)

3D illustration for an English communication class. Students get the same task twice: **find Book IV** of Virgil's *Aeneid*.

- **The scroll** (papyrus, Latin text of Aeneid I–III): they drag it open until the red heading "LIBER IV" appears at the very end. The scroll can't be pulled faster than a set speed, so this always takes more than ~12 seconds.
- **The codex** (parchment, also Virgil): three clicks. (1) It opens straight onto "LIBER IV" and the codex timer stops. (2) Pages riffle forward to "GEORGICA" and "BVCOLICA". (3) It closes and lifts upright, as if held in one hand. Then Martial's line "me manus una capit / one hand holds me" appears, followed by both times side by side.

Chat bubbles in the upper corners carry the six advantages: scroll messages on the left (grey), codex replies on the right (parchment colour). Students write the advantages down afterwards.

A disclaimer screen shows first. The page is delivered as one self-contained HTML file for the bucket and LMS iframe, with no outside requests at runtime.

Files (in this folder):
- app.js: all the scene code (scroll, codex, textures, texts, timers, bubble timing). Edit THIS for revisions.
- shell.html: page wrapper (disclaimer text, "Find Book IV." line, bubble styling, quotation, final screen, buttons, colours).
- build.py: pastes three.js r170 and app.js into shell.html, producing scroll-vs-codex.html. Instructions for fetching the library are at the top of build.py.

## Where to change common things

All of these are in **app.js** unless marked shell.html.

Chat-bubble wording (the `TEXTS` block at the very top of app.js):
- `scrollTimed`: the three scroll bubbles and when they appear, as `[seconds after the first drag, text]`. Now 5 s "Easy, isn't it?", 7 s "Both hands busy rolling, btw.", 9 s "One side only. Writing on the back? Nah. Can't be done." Any bubble not shown yet is skipped if Book IV is found first.
- `scrollFound`: the bubble shown when LIBER IV is fully visible ("Done reading? Now roll it all back…").
- `codexStep1`, `codexStep2`, `codexStep3`: the codex bubbles for clicks 1, 2 and 3.

The three codex steps:
- Click 1 (open on LIBER IV): the page is made by `bookFourMat = pageMat(parchment(301, { title: 'LIBER IV', … folio: 'LXXXII' }))`. Opening speed: `OPEN_S` (seconds).
- Click 2 (riffle): headings of the pages flicked past are in `RIFFLE = ['LIBER VI', 'LIBER IX', 'LIBER XII']`. The final spread is `title: 'GEORGICA'` (left page, in `riffleBacks`) and `bucolicaMat … title: 'BVCOLICA'` (right page). Speed: `RIFFLE_S`.
- Click 3 (close and lift): speed `CLOSE_S`. How high, how far forward and how upright it ends: the last three lines of `layoutCodex()` (`1.75` height, `0.6` towards the viewer, `1.18` tilt). The quotation text is in shell.html (`id="quote"`).
- Space or Enter does the same as a click. Clicks during an animation are ignored, so a double-click can't skip a step.

Scroll:
- The Book IV passage at the end: the `'LIBER IV'` heading and the `AENEID4` text (also used on the codex's LIBER IV page).
- Filler texts: `AENEID` (Aeneid I–III), `AENEID4`, `GEORGICA`, `BVCOLICA` constants. Write them in capitals with V for U; spaces are removed automatically.
- Scroll length: `NCOL` (number of columns, now 24). Speed limit: `MAX_SPEED` (now 2.6; lower = slower, longer search).

Layout and look:
- Where the scroll and codex sit on screen, kept clear of the bubbles: `FRAMES` (size `s` and position `to`).
- Bubble colours and sizes: the `--scroll-bubble`, `--codex-bubble` colours and the `.bubble` rule in shell.html.
- Disclaimer wording and the "Find Book IV." line: shell.html.

Heavy for an old PC? Set `renderer.shadowMap.enabled = false` in app.js.

Lessons learned: loading three.js via a blob/dynamic import fails in some hosts ("Failed to fetch dynamically imported module: blob-…"), so the build inlines it as a plain script.
