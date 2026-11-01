// Sensus et Affectus: behaviour.
// CARDS comes from content.js. IMAGES ({ la: { src, w, h, band } }) is pasted
// in by build.py; without it the page falls back to images/<la>.png.
(() => {
  'use strict';

  const PREVIEW = new URLSearchParams(location.search).has('preview');
  const HOLD_MS = 700;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
  const IMG = (typeof IMAGES !== 'undefined') ? IMAGES : {};

  const grid = document.getElementById('grid');
  const trayList = document.getElementById('tray-list');
  const trayEmpty = document.getElementById('tray-empty');
  const copyBtn = document.getElementById('copy');

  const kept = [];          // [{ card, bi, word }] in the order they were kept
  let openCard = null;
  let busy = false;

  // ---------- helpers ----------
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // straight quotes -> typographic ones
  const typo = s => esc(s)
    .replace(/(^|[\s(“])&quot;/g, '$1“').replace(/&quot;/g, '”')
    .replace(/'/g, '’');
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const anim = (node, frames, ms, easing) => {
    if (REDUCED.matches || !node.animate) return Promise.resolve();
    return node.animate(frames, { duration: ms, easing, fill: 'none' }).finished.catch(() => {});
  };

  function faceMarkup(c) {
    const im = IMG[c.la] || {};
    const src = im.src || ('images/' + c.la + '.png');
    const ratio = (im.w && im.h) ? `${im.w} / ${im.h}` : '4 / 5';
    const band = im.band || 0.2;
    return `<span class="art" style="aspect-ratio:${ratio};--band:${band}">
      <img src="${src}" alt="" draggable="false">
      <span class="band"><span class="la">${c.la.toUpperCase()}</span><span class="ru" lang="ru">${c.ru}</span></span>
    </span>`;
  }

  // ---------- matching ----------
  const ENDINGS = ['s', 'es', 'ly', 'ness', 'ment'];
  function matchesWord(tok, w) {
    if (tok === w) return true;
    for (const e of ENDINGS) if (tok === w + e) return true;
    if (w.endsWith('le') && tok === w.slice(0, -2) + 'ly') return true;   // admirable -> admirably
    if (w.endsWith('y') && tok === w.slice(0, -1) + 'ies') return true;   // anxiety -> anxieties
    return false;
  }
  function tokens(text) {
    return text.split(/[\s,;/]+/)
      .map(t => t.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''))
      .filter(Boolean);
  }

  // ---------- build cards ----------
  const cards = CARDS.map((c, i) => {
    const card = { ...c, i, typed: '', dunno: false, revealed: false, keptSet: new Set() };

    const root = el('article', 'card');
    root.dataset.la = c.la;

    const face = el('button', 'face', faceMarkup(c));
    face.type = 'button';
    face.setAttribute('aria-label', `${c.la.toUpperCase()}, ${c.ru}`);
    face.setAttribute('aria-expanded', 'false');

    const back = el('div', 'back');
    back.setAttribute('role', 'region');
    back.setAttribute('aria-label', c.la.toUpperCase());
    back.innerHTML = `
      <div class="aside" aria-hidden="true">${faceMarkup(c)}</div>
      <div class="main">
        <div class="ask">
          <p class="q">Do you know an English word from this root?</p>
          <div class="ask-row">
            <input class="guess" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                   aria-label="Your English word" placeholder="your word">
            <button type="button" class="dunno" aria-pressed="false">Don’t know</button>
          </div>
          <button type="button" class="hold" aria-disabled="true">
            <span class="lbl">Hold to reveal</span><span class="fill" aria-hidden="true">Hold to reveal</span>
          </button>
        </div>
        <div class="answer" hidden></div>
      </div>`;

    root.append(face, back);
    grid.append(root);

    Object.assign(card, {
      root, face, back,
      ask: back.querySelector('.ask'),
      answer: back.querySelector('.answer'),
      input: back.querySelector('.guess'),
      dunnoBtn: back.querySelector('.dunno'),
      hold: back.querySelector('.hold'),
    });

    face.addEventListener('click', () => toggle(card));
    back.addEventListener('click', e => {
      if (e.target.closest('button, input, a, .tray')) return;
      const sel = getSelection();
      if (sel && !sel.isCollapsed && back.contains(sel.anchorNode)) return;
      toggle(card);
    });

    card.input.addEventListener('input', () => { card.typed = card.input.value; updateHold(card); });
    card.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); if (canReveal(card)) card.hold.focus(); }
    });
    card.dunnoBtn.addEventListener('click', () => {
      card.dunno = !card.dunno;
      card.dunnoBtn.setAttribute('aria-pressed', String(card.dunno));
      updateHold(card);
    });
    setupHold(card);
    return card;
  });

  // ---------- reveal gating & long press ----------
  const canReveal = c => c.dunno || c.typed.trim().length > 0;
  function updateHold(c) { c.hold.setAttribute('aria-disabled', String(!canReveal(c))); }

  function setupHold(c) {
    const btn = c.hold, fill = btn.querySelector('.fill');
    let t0 = 0, raf = 0, active = false;

    const set = p => fill.style.setProperty('--p', p);
    function frame(now) {
      const p = Math.min(1, (now - t0) / HOLD_MS);
      set(p);
      if (p >= 1) { active = false; btn.classList.remove('holding'); reveal(c); return; }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (active || !canReveal(c) || c.revealed) return;
      active = true;
      btn.classList.remove('cancel');
      btn.classList.add('holding');
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function cancel() {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      btn.classList.remove('holding');
      btn.classList.add('cancel');
      set(0);
    }

    btn.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      if (!canReveal(c)) { nudge(c); return; }
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
      btn.focus({ preventScroll: true });
      start();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => btn.addEventListener(t, cancel));
    btn.addEventListener('contextmenu', e => e.preventDefault());
    btn.addEventListener('keydown', e => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (e.repeat) return;
      if (!canReveal(c)) { nudge(c); return; }
      start();
    });
    btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') cancel(); });
    btn.addEventListener('blur', cancel);
  }

  function nudge(c) {
    c.ask.classList.remove('nudge');
    void c.ask.offsetWidth;
    c.ask.classList.add('nudge');
  }

  // ---------- revealed content ----------
  function reveal(c) {
    c.revealed = true;
    renderAnswer(c);
    c.ask.hidden = true;
    c.answer.hidden = false;
    c.root.classList.add('revealed');
    const first = c.answer.querySelector('.keep');
    if (first && !PREVIEW) first.focus({ preventScroll: true });
  }

  function renderAnswer(c) {
    const toks = PREVIEW ? [] : tokens(c.typed);
    const hits = new Set();
    const unmatched = [];
    for (const t of toks) {
      const lt = t.toLowerCase();
      let found = false;
      c.blocks.forEach((b, bi) => {
        if (!b.w) return;
        if ([b.w, ...(b.also || [])].some(w => matchesWord(lt, w))) { hits.add(bi); found = true; }
      });
      if (!found && !unmatched.some(u => u.toLowerCase() === lt)) unmatched.push(t);
    }

    const a = c.answer;
    a.innerHTML = '';
    if (unmatched.length) {
      a.append(el('p', 'yours-line',
        `${unmatched.length > 1 ? 'Your words' : 'Your word'}: <span class="yw">${unmatched.map(esc).join(', ')}</span>`));
    }
    const list = el('div', 'entries');
    c.blocks.forEach((b, bi) => {
      if (b.note) { list.append(el('p', 'note', typo(b.note))); return; }
      const word = b.w || b.keep;
      const e = el('div', 'entry' + (hits.has(bi) ? ' hit' : '') + (b.w ? '' : ' plain'));
      const head = el('div', 'ehead');
      if (b.w) head.append(el('b', 'w', hits.has(bi) ? `<mark>${esc(b.w)}</mark>` : esc(b.w)));
      const k = el('button', 'keep', '<span class="k-on">kept</span><span class="k-off">keep</span>');
      k.type = 'button';
      k.setAttribute('aria-pressed', String(c.keptSet.has(bi)));
      k.setAttribute('aria-label', `keep “${word}”`);
      k.addEventListener('click', () => toggleKeep(c, bi, word));
      head.append(k);
      e.append(head);
      e.append(el('p', 'd', typo(b.d)));
      if (b.col || b.prep) {
        const cp = el('div', 'cp');
        if (b.col) cp.append(el('p', 'cp-line', `<span class="cp-lab">Collocations</span> ${typo(b.col)}`));
        if (b.prep) cp.append(el('p', 'cp-line', `<span class="cp-lab">Prepositions</span> ${typo(b.prep)}`));
        e.append(cp);
      }
      e.append(el('p', 'reg', `<span>${esc(b.reg)}</span>`));
      e.append(el('p', 'ex', '“' + typo(b.ex) + '”'));
      list.append(e);
    });
    a.append(list);
  }

  // ---------- my words ----------
  function toggleKeep(c, bi, word) {
    const idx = kept.findIndex(k => k.card === c && k.bi === bi);
    if (idx >= 0) { kept.splice(idx, 1); c.keptSet.delete(bi); }
    else { kept.push({ card: c, bi, word }); c.keptSet.add(bi); }
    syncKeepButtons(c);
    renderTray();
  }
  function syncKeepButtons(c) {
    c.answer.querySelectorAll('.keep').forEach((b, n) => {
      // keep buttons appear in block order, skipping notes
      const bi = c.blocks.map((x, i) => x.note ? -1 : i).filter(i => i >= 0)[n];
      b.setAttribute('aria-pressed', String(c.keptSet.has(bi)));
    });
  }
  function renderTray() {
    trayList.innerHTML = '';
    trayEmpty.hidden = kept.length > 0;
    copyBtn.disabled = kept.length === 0;
    for (const k of kept) {
      const li = el('li', 'chip', `<span class="cw">${esc(k.word)}</span><span class="cl">${k.card.la}</span>`);
      const x = el('button', 'cx', '×');
      x.type = 'button';
      x.setAttribute('aria-label', `remove “${k.word}”`);
      x.addEventListener('click', () => toggleKeep(k.card, k.bi, k.word));
      li.append(x);
      trayList.append(li);
    }
  }
  copyBtn.addEventListener('click', async () => {
    const text = kept.map(k => `${k.word} (${k.card.la})`).join('\n');
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (_) {
      const ta = el('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.append(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (__) {}
      ta.remove();
    }
    copyBtn.classList.toggle('done', ok);
    copyBtn.querySelector('span').textContent = ok ? 'Copied' : 'Copy';
    setTimeout(() => { copyBtn.classList.remove('done'); copyBtn.querySelector('span').textContent = 'Copy'; }, 1600);
  });
  renderTray();

  // ---------- open / close ----------
  const cols = () => getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;

  // The open card spans the whole grid at the top of its own row; a ghost keeps its slot.
  function place(c) {
    const kids = [...grid.children].filter(n => n !== c.root);
    const pos = kids.indexOf(c.ghost);
    const start = pos - (pos % cols());
    grid.insertBefore(c.root, kids[start]);
  }

  function makeGhost(c) {
    const g = el('button', 'ghost', faceMarkup(c));
    g.type = 'button';
    g.setAttribute('aria-label', `${c.la.toUpperCase()}, close`);
    g.addEventListener('click', () => toggle(c));
    return g;
  }

  function scrollToShow(node) {
    const r = node.getBoundingClientRect();
    const pad = 12, vh = innerHeight;
    let dy = 0;
    if (r.height + 2 * pad > vh || r.top < pad) dy = r.top - pad;
    else if (r.bottom > vh - pad) dy = r.bottom - vh + pad;
    if (Math.abs(dy) > 1) scrollBy({ top: dy, behavior: REDUCED.matches ? 'auto' : 'smooth' });
  }

  const P = 'perspective(2400px) ';
  async function open(c) {
    await anim(c.face, [{ transform: P + 'rotateY(0deg)' }, { transform: P + 'rotateY(90deg)' }], 170, 'ease-in');
    c.ghost = makeGhost(c);
    c.root.replaceWith(c.ghost);
    grid.append(c.root);
    place(c);
    c.root.classList.add('open');
    c.face.setAttribute('aria-expanded', 'true');
    if (PREVIEW && !c.revealed) reveal(c);
    openCard = c;
    scrollToShow(c.root);
    await anim(c.back, [{ transform: P + 'rotateY(-90deg)', opacity: 0.4 }, { transform: P + 'rotateY(0deg)', opacity: 1 }], 260, 'cubic-bezier(.2,.7,.3,1)');
    if (!c.revealed && matchMedia('(pointer: fine)').matches) c.input.focus({ preventScroll: true });
  }

  async function close(c, quick) {
    await anim(c.back, [{ transform: P + 'rotateY(0deg)', opacity: 1 }, { transform: P + 'rotateY(90deg)', opacity: 0.4 }], quick ? 120 : 170, 'ease-in');
    c.root.classList.remove('open');
    c.face.setAttribute('aria-expanded', 'false');
    c.ghost.replaceWith(c.root);
    c.ghost = null;
    openCard = null;
    if (!quick) {
      scrollToShow(c.root);
      await anim(c.face, [{ transform: P + 'rotateY(-90deg)' }, { transform: P + 'rotateY(0deg)' }], 240, 'cubic-bezier(.2,.7,.3,1)');
      c.face.focus({ preventScroll: true });
    }
  }

  async function toggle(c) {
    if (busy) return;
    busy = true;
    try {
      if (openCard === c) await close(c);
      else {
        if (openCard) await close(openCard, true);
        await open(c);
      }
    } finally { busy = false; }
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && openCard) toggle(openCard);
  });
  matchMedia('(max-width: 719px)').addEventListener('change', () => { if (openCard) place(openCard); });
})();
