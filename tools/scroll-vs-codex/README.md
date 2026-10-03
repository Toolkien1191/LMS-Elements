# Scroll vs Codex (Past Tech lesson, Task 7 prop)

3D illustration for an English communication class. Students get the same task twice: **find Book IV** of Virgil's *Aeneid*.

- **The scroll** (papyrus, Latin text of Aeneid I–III): they drag it open until the red heading "LIBER IV" appears at the very end. The scroll can't be pulled faster than a set speed, so this always takes more than ~12 seconds.
- **The codex** (parchment, also Virgil): three clicks. (1) It opens straight onto "LIBER IV" and the codex timer stops. (2) Pages riffle forward to "GEORGICA" and "BVCOLICA". (3) It closes and lifts upright, as if held in one hand. Then Martial's line "me manus una capit / one hand holds me" appears, followed by both times side by side.

Short messages written in red inside the objects carry the six advantages. Three are spaced along the scroll (the first comes into view about 4 seconds into dragging) and one sits right after LIBER IV. The codex has one on the LIBER IV page and two on the GEORGICA/BVCOLICA spread. Students write the advantages down afterwards.

A disclaimer screen shows first. The page is delivered as one self-contained HTML file for the bucket and LMS iframe, with no outside requests at runtime.

Files (in this folder):
- app.js: all the scene code (scroll, codex, textures, texts, timers, bubble timing). Edit THIS for revisions.
- shell.html: page wrapper (disclaimer text, "Find Book IV." line, quotation, final screen, buttons, colours).
- build.py: pastes three.js r170 and app.js into shell.html, producing scroll-vs-codex.html. Instructions for fetching the library are at the top of build.py.

## Where to change common things

All of these are in **app.js** unless marked shell.html.

Red message wording (the `TEXTS` block at the very top of app.js):
- `scroll`: the three scroll messages as `[column number, text]`. Now column 9 "Easy, isn't it?", 14 "Both hands busy rolling, btw.", 18 "One side only. Writing on the back? Nah. Can't be done." Each column is roughly 0.6 s of dragging at full speed, and column 9 comes into view after about 4 s. Columns 23 and 24 are taken by LIBER IV and the end message, so use numbers up to 22.
- `scrollEnd`: the message written right after the LIBER IV passage ("Done reading? Now roll it all back…").
- `codexStep1`: on the LIBER IV page (seen after click 1).
- `codexStep2`, `codexStep3`: on the left (GEORGICA) and right (BVCOLICA) pages, seen after click 2. The third one tells students to close the book.
- Message size: `MSG_SIZE` for the scroll (now 56), and the `80` in the `writeMessage(...)` line inside `parchment()` for the codex.

The three codex steps:
- Click 1 (open on LIBER IV): the page is made by `bookFourMat = pageMat(parchment(301, { title: 'LIBER IV', … folio: 'LXXXII' }))`. Opening speed: `OPEN_S` (seconds).
- Click 2 (riffle): headings of the pages flicked past are in `RIFFLE = ['LIBER VI', 'LIBER IX', 'LIBER XII']`. The final spread is `title: 'GEORGICA'` (left page, in `riffleBacks`) and `bucolicaMat … title: 'BVCOLICA'` (right page). Speed: `RIFFLE_S`.
- Click 3 (close and lift): speed `CLOSE_S`. How high, how far forward and how upright it ends: the last three lines of `layoutCodex()` (`1.75` height, `0.6` towards the viewer, `1.18` tilt). The quotation text is in shell.html (`id="quote"`).
- Space or Enter does the same as a click. Clicks during an animation are ignored, so a double-click can't skip a step.

Scroll:
- The Book IV passage at the end: the `'LIBER IV'` heading and the `AENEID4` text (also used on the codex's LIBER IV page).
- Filler texts: `AENEID` (Aeneid I–III), `AENEID4`, `GEORGICA`, `BVCOLICA` constants. Write them in capitals with V for U; spaces are removed automatically.
- Scroll length: `NCOL` (number of columns, now 25; the last two are LIBER IV and the end message). Speed limit: `MAX_SPEED` (now 2.6; lower = slower, longer search).

Layout and look:
- Where the scroll and codex sit on screen: `FRAMES` (size `s` and position `to`).
- Disclaimer wording and the "Find Book IV." line: shell.html.

Heavy for an old PC? Set `renderer.shadowMap.enabled = false` in app.js.

Lessons learned: loading three.js via a blob/dynamic import fails in some hosts ("Failed to fetch dynamically imported module: blob-…"), so the build inlines it as a plain script.
