# Sensus et Affectus

A grid of 16 cards about Latin words for feelings and their English heirs (B2–C1, Russian-speaking students). It is delivered as one self-contained HTML file with the images, fonts and code inside and no outside requests.

- Click a card: it opens across the full width of the grid. Students type a word (or press "Don't know"), then hold "Hold to reveal" for about 0.7 s. Holding Space or Enter on the button also works.
- A typed word that matches a listed word (case-insensitive, also with -s, -es, -ly, -ness, -ment) is highlighted. Anything else is shown neutrally as "Your word: …".
- "keep" adds a word to **My words** at the bottom; "Copy" copies the list.
- `?preview` at the end of the URL: one click shows the content straight away.

## Files
- `content.js`: all card texts. Edit THIS for wording changes.
- `app.js`: behaviour (opening, long press, matching, My words).
- `shell.html`: page and styles. Opening it directly in a browser works for quick checks (it loads `images/*.png`, the fonts and the scripts from this folder).
- `fonts/`: Cinzel (Latin capitals) and PT Serif (Latin + Cyrillic, with a true italic), SIL OFL.
- `build.py`: produces `sensus-et-affectus.html` (the deliverable, committed alongside).

## Build
Put the 16 images (`amor.png` … `zelotypia.png`; .webp or .jpg also work) in `images/`, then:

```bash
pip install pillow
python3 build.py
```

Each image is scaled to 800 px wide, saved as WebP (quality 82) and embedded as base64. The height of the cream band at the bottom of each image is measured automatically, so the Latin word and the Russian translation sit inside it (falls back to the bottom fifth).
