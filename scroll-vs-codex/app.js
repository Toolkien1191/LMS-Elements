// Scroll vs Codex — app code. THREE is provided by the loader.
export function start(THREE, mount, ui) {
  // ---------- helpers ----------
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));

  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  mount.appendChild(renderer.domElement);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14100d);
  scene.fog = new THREE.Fog(0x14100d, 13, 26);

  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.5, 80);

  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x2b1e14, 0.85));
  const key = new THREE.DirectionalLight(0xffe0b0, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xc8d6ff, 0.35);
  scene.add(fill, fill.target);

  function tex(c, { srgb = true, repeat = null } = {}) {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  }

  // ---------- table ----------
  (function table() {
    const c = canvas(1024, 1024), g = c.getContext('2d'), r = rng(7);
    g.fillStyle = '#4b301c'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 420; i++) {
      const y0 = r() * 1024, amp = 2 + r() * 10, f = (1 + Math.floor(r() * 3)) * Math.PI * 2 / 1024, ph = r() * 6.28;
      g.strokeStyle = r() < 0.6 ? `rgba(30,16,8,${0.08 + r() * 0.18})` : `rgba(140,95,55,${0.05 + r() * 0.12})`;
      g.lineWidth = 0.6 + r() * 2.5;
      g.beginPath();
      for (let x = -10; x <= 1034; x += 16) {
        const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3 + ph) * amp * 0.3;
        x < 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 20),
      new THREE.MeshStandardMaterial({ map: tex(c, { repeat: [7, 2.4] }), roughness: 0.72, metalness: 0 })
    );
    m.rotation.x = -Math.PI / 2; m.position.set(7, 0, 0); m.receiveShadow = true;
    scene.add(m);
  })();

  // ---------- text sources ----------
  const GREEK = ('ΜΗΝΙΝΑΕΙΔΕΘΕΑΠΗΛΗΙΑΔΕΩΑΧΙΛΗΟΣΟΥΛΟΜΕΝΗΝΗΜΥΡΙΑΧΑΙΟΙΣΑΛΓΕΕΘΗΚΕΠΟΛΛΑΣΔΙΦΘΙΜΟΥΣΨΥΧΑΣΑΙΔΙΠΡΟΙΑΨΕΝ' +
    'ΗΡΩΩΝΑΥΤΟΥΣΔΕΕΛΩΡΙΑΤΕΥΧΕΚΥΝΕΣΣΙΝΟΙΩΝΟΙΣΙΤΕΠΑΣΙΔΙΟΣΔΕΤΕΛΕΙΕΤΟΒΟΥΛΗΕΞΟΥΔΗΤΑΠΡΩΤΑΔΙΑΣΤΗΤΗΝΕΡΙΣΑΝΤΕ' +
    'ΑΤΡΕΙΔΗΣΤΕΑΝΑΞΑΝΔΡΩΝΚΑΙΔΙΟΣΑΧΙΛΛΕΥΣΤΙΣΤΑΡΣΦΩΕΘΕΩΝΕΡΙΔΙΞΥΝΕΗΚΕΜΑΧΕΣΘΑΙΛΗΤΟΥΣΚΑΙΔΙΟΣΥΙΟΣΟΓΑΡ' +
    'ΒΑΣΙΛΗΙΧΟΛΩΘΕΙΣΝΟΥΣΟΝΑΝΑΣΤΡΑΤΟΝΩΡΣΕΚΑΚΗΝΟΛΕΚΟΝΤΟΔΕΛΑΟΙΟΥΝΕΚΑΤΟΝΧΡΥΣΗΝΗΤΙΜΑΣΑΡΗΤΗΡΑ' +
    'ΑΤΡΕΙΔΗΣΟΓΑΡΗΛΘΕΘΟΑΣΕΠΙΝΗΑΣΑΧΑΙΩΝΛΥΣΟΜΕΝΟΣΤΕΘΥΓΑΤΡΑΦΕΡΩΝΤΑΠΕΡΕΙΣΙΑΠΟΙΝΑ');
  const LATIN = ('HICESTQVEMLEGISILLEQVEMREQVIRISTOTONOTVSINORBEMARTIALISARGVTISEPIGRAMMATONLIBELLIS' +
    'CVILECTORSTVDIOSEQVODDEDISTIVIVENTIDECVSATQVESENTIENTIRARIPOSTCINERESHABENTPOETAE' +
    'QVITECVMCVPISESSEMEOSVBICVMQVELIBELLOSETCOMITESLONGAEQVAERISHABEREVIAEHOSEMEQVOSARTAT' +
    'BREVIBVSMEMBRANATABELLISSCRINIADAMAGNISMEMANVSVNACAPITNETAMENIGNORESVBISIMVENALIS' +
    'ETERRESVRBEVAGVSTOTAMEDVCECERTVSERISLIBERTVMDOCTILVCENSISQVAERESECVNDVMLIMINAPOST' +
    'PACISPALLADIVMQVEFORVM');
  function stream(src, offset) { let i = offset % src.length; return () => { const ch = src[i]; i = (i + 1) % src.length; return ch; }; }

  // Draws a column of hand-set capitals: jitter, ink that fades between dips.
  function writeColumn(g, r, next, x0, y0, colW, nLines, lineH, size, ink) {
    g.font = `${size}px Georgia, 'Times New Roman', serif`;
    g.textBaseline = 'alphabetic';
    let dip = 0;
    for (let l = 0; l < nLines; l++) {
      let x = x0; const y = y0 + l * lineH;
      while (true) {
        const ch = next();
        const w = g.measureText(ch).width * 0.96;
        if (x + w > x0 + colW) break;
        dip = (dip + 1) % (34 + ((r() * 14) | 0));
        const a = 0.95 - dip * 0.012 + r() * 0.05;
        g.save();
        g.translate(x + r() * 0.8, y + (r() - 0.5) * 1.4);
        g.rotate((r() - 0.5) * 0.04);
        g.fillStyle = `rgba(${ink},${a.toFixed(3)})`;
        g.fillText(ch, 0, 0);
        g.restore();
        x += w + size * 0.04;
      }
    }
  }

  // ---------- papyrus ----------
  function papyrusTile(w, h, seed, vertical) {
    const c = canvas(w, h), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = '#d4b77f'; g.fillRect(0, 0, w, h);
    const strokes = (count, alongX, lo, hi) => {
      for (let i = 0; i < count; i++) {
        const light = r() < 0.5;
        g.strokeStyle = light ? `rgba(245,225,175,${lo + r() * hi})` : `rgba(120,85,40,${lo + r() * hi})`;
        g.lineWidth = 0.7 + r() * 2.6;
        const len = 60 + r() * 420;
        if (alongX) {
          const y = r() * h, x = r() * w;
          for (const dx of [0, -w]) { g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx + len, y + (r() - 0.5) * 3); g.stroke(); }
        } else {
          const x = r() * w, y = r() * h;
          for (const dy of [0, -h]) { g.beginPath(); g.moveTo(x, y + dy); g.lineTo(x + (r() - 0.5) * 3, y + dy + len); g.stroke(); }
        }
      }
    };
    strokes(vertical ? 900 : 700, !vertical, 0.02, 0.05);   // under-layer
    strokes(vertical ? 900 : 5200, vertical ? false : true, 0.04, 0.14); // top layer
    for (let i = 0; i < 2500; i++) {
      g.fillStyle = `rgba(90,60,25,${0.05 + r() * 0.12})`;
      g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 1.5);
    }
    return c;
  }

  const PPU = 320;                 // pixels per world unit on the sheet
  const SH = 2.6;                  // scroll height (world)
  const WV = 6.6;                  // visible window width (world)
  const COLW = 1.25, PITCH = 1.62, NCOL = 22;
  const START_MARGIN = 0.9, END_MARGIN = 1.6;
  const L = START_MARGIN + NCOL * PITCH + END_MARGIN;
  const SRC_W = Math.round(L * PPU), SRC_H = Math.round(SH * PPU);
  let msgRange = [0, 0];

  function buildPapyrusSource() {
    const c = canvas(SRC_W, SRC_H), g = c.getContext('2d'), r = rng(11);
    const tile = papyrusTile(1024, SRC_H, 3, false);
    for (let x = 0; x < SRC_W; x += 1024) g.drawImage(tile, x, 0);
    // tonal variation and stains
    for (let i = 0; i < 90; i++) {
      const x = r() * SRC_W, y = r() * SRC_H, rad = 60 + r() * 380;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.6;
      gr.addColorStop(0, dark ? `rgba(110,70,30,${0.04 + r() * 0.08})` : `rgba(250,230,185,${0.05 + r() * 0.08})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // kollemata (sheet joins)
    for (let x = 0.5 * PPU; x < SRC_W; x += (2.1 + r() * 0.5) * PPU) {
      g.fillStyle = 'rgba(120,80,35,0.07)'; g.fillRect(x, 0, 26, SRC_H);
      g.fillStyle = 'rgba(90,55,20,0.22)'; g.fillRect(x, 0, 2, SRC_H);
      g.fillStyle = 'rgba(250,235,195,0.25)'; g.fillRect(x + 26, 0, 1.5, SRC_H);
    }
    // darkened long edges
    const eg = g.createLinearGradient(0, 0, 0, SRC_H);
    eg.addColorStop(0, 'rgba(95,60,25,0.45)'); eg.addColorStop(0.06, 'rgba(95,60,25,0)');
    eg.addColorStop(0.94, 'rgba(95,60,25,0)'); eg.addColorStop(1, 'rgba(95,60,25,0.5)');
    g.fillStyle = eg; g.fillRect(0, 0, SRC_W, SRC_H);

    // columns of Greek
    const ink = '38,24,14';
    const top = 0.33 * PPU, lineH = 25.5, nLines = 26, size = 19;
    const colPx = COLW * PPU;
    const next = stream(GREEK, 0);
    for (let i = 0; i < NCOL; i++) {
      const x0 = (START_MARGIN + i * PITCH) * PPU + (r() - 0.5) * 8;
      const slant = (r() - 0.5) * 6;
      if (i < NCOL - 1) {
        g.save(); g.translate(slant, 0);
        writeColumn(g, r, next, x0, top + lineH, colPx, nLines, lineH, size, ink);
        g.restore();
      } else {
        writeColumn(g, r, next, x0, top + lineH, colPx, 7, lineH, size, ink);
        // paragraphos + the hidden message
        g.fillStyle = `rgba(${ink},0.85)`; g.fillRect(x0 - 4, top + lineH * 8.1, 46, 2.2);
        g.font = `600 ${50}px Georgia, 'Times New Roman', serif`;
        const lines = ['DO YOU', 'THINK THIS', 'IS EASY?'];
        lines.forEach((t, k) => {
          let x = x0; const y = top + lineH * 10.8 + k * 66;
          for (const ch of t) {
            g.fillStyle = `rgba(${ink},${(0.88 + r() * 0.1).toFixed(2)})`;
            g.save(); g.translate(x, y + (r() - 0.5) * 2); g.rotate((r() - 0.5) * 0.05); g.fillText(ch, 0, 0); g.restore();
            x += g.measureText(ch).width + 3;
          }
        });
        // coronis-like end flourish
        g.strokeStyle = `rgba(${ink},0.8)`; g.lineWidth = 2.4;
        const cy = top + lineH * 10.8 + 3 * 66 + 6;
        g.beginPath(); g.moveTo(x0, cy); g.bezierCurveTo(x0 + 30, cy - 26, x0 + 60, cy + 26, x0 + 110, cy - 4); g.stroke();
        g.beginPath(); g.moveTo(x0, cy + 14); g.lineTo(x0 + 180, cy + 14); g.stroke();
        msgRange = [(x0 / PPU) - 0.05, x0 / PPU + COLW];
      }
    }
    // ragged top/bottom edges and a few losses
    g.globalCompositeOperation = 'destination-out';
    for (const edge of [0, 1]) {
      g.beginPath();
      const base = edge ? SRC_H : 0, dir = edge ? -1 : 1;
      g.moveTo(0, base);
      for (let x = 0; x <= SRC_W; x += 14) g.lineTo(x, base + dir * (2 + Math.abs(Math.sin(x * 0.013)) * 3 + r() * 5));
      g.lineTo(SRC_W, base - dir * 5); g.lineTo(0, base - dir * 5); g.closePath(); g.fill();
    }
    for (let i = 0; i < 26; i++) {
      const x = r() * SRC_W, edge = r() < 0.5, y = edge ? 0 : SRC_H;
      g.beginPath(); g.ellipse(x, y, 10 + r() * 50, 6 + r() * 18, 0, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 6; i++) { // small holes
      const x = (1 + r() * (L - 3)) * PPU, y = (0.2 + r() * 0.6) * SRC_H;
      g.beginPath(); g.ellipse(x, y, 4 + r() * 10, 3 + r() * 7, r() * 3, 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    return c;
  }

  // ---------- scroll object ----------
  const scrollGroup = new THREE.Group(); scene.add(scrollGroup);
  const source = buildPapyrusSource();
  const win = canvas(Math.round(WV * PPU), SRC_H), wg = win.getContext('2d');
  const winTex = tex(win);
  const sheetGeo = new THREE.PlaneGeometry(WV, SH, 80, 14);
  sheetGeo.rotateX(-Math.PI / 2);
  { const p = sheetGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i);
    p.setY(i, 0.004 + 0.008 * (Math.sin(x * 2.3 + z * 1.7) * 0.5 + 0.5) + 0.004 * Math.sin(z * 5 + x)); } sheetGeo.computeVertexNormals(); }
  const sheet = new THREE.Mesh(sheetGeo, new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.92, alphaTest: 0.5, side: THREE.DoubleSide }));
  sheet.receiveShadow = true; sheet.castShadow = true;
  scrollGroup.add(sheet);

  // roll textures
  const sideTex = tex(papyrusTile(512, 512, 21, true), { repeat: [2, 1] });
  function capTexture(withRod) {
    const c = canvas(512, 512), g = c.getContext('2d'), r = rng(withRod ? 5 : 9);
    g.fillStyle = '#b8955c'; g.fillRect(0, 0, 512, 512);
    const turns = 30, a = withRod ? 46 : 14, b = (250 - a) / (turns * Math.PI * 2);
    g.lineWidth = 1.6;
    for (let th = 0; th < turns * Math.PI * 2; th += 0.04) {
      const rr = a + b * th, rr2 = a + b * (th + 0.04);
      g.strokeStyle = `rgba(80,52,22,${0.35 + r() * 0.4})`;
      g.beginPath(); g.moveTo(256 + rr * Math.cos(th), 256 + rr * Math.sin(th));
      g.lineTo(256 + rr2 * Math.cos(th + 0.04), 256 + rr2 * Math.sin(th + 0.04)); g.stroke();
    }
    if (withRod) { g.fillStyle = '#3a2413'; g.beginPath(); g.arc(256, 256, a - 4, 0, 7); g.fill(); }
    else { g.fillStyle = '#5a3b1c'; g.beginPath(); g.arc(256, 256, a, 0, 7); g.fill(); }
    return tex(c);
  }
  const rollGeo = new THREE.CylinderGeometry(1, 1, 1, 72, 1);
  function makeRoll(withRod) {
    const holder = new THREE.Group(); holder.rotation.x = Math.PI / 2; // local y -> world z
    const cap = new THREE.MeshStandardMaterial({ map: capTexture(withRod), roughness: 0.9 });
    const mesh = new THREE.Mesh(rollGeo, [new THREE.MeshStandardMaterial({ map: sideTex, color: 0xb8a482, roughness: 0.95 }), cap, cap]);
    mesh.castShadow = true; mesh.receiveShadow = true;
    holder.add(mesh);
    if (withRod) {
      const wood = new THREE.MeshStandardMaterial({ color: 0x3b2414, roughness: 0.55 });
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, SH + 0.34, 24), wood);
      rod.castShadow = true;
      holder.add(rod);
      for (const s of [-1, 1]) {
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), wood);
        knob.scale.set(1, 1.3, 1); knob.position.y = s * (SH / 2 + 0.2); knob.castShadow = true;
        holder.add(knob);
      }
    }
    scrollGroup.add(holder);
    return { holder, mesh };
  }
  const leftRoll = makeRoll(false), rightRoll = makeRoll(true);
  const R0L = 0.06, R0R = 0.07, THICK = 0.017;
  const radius = (len, r0) => Math.sqrt(r0 * r0 + THICK * Math.max(0, len) / Math.PI);
  const S_MAX = L - WV;
  const scrollState = { s: 0, t0: null, found: null };

  function layoutScroll() {
    const s = scrollState.s;
    const rL = radius(s, R0L), rR = radius(L - s - WV, R0R);
    leftRoll.mesh.scale.set(rL, SH, rL);
    rightRoll.mesh.scale.set(rR, SH, rR);
    leftRoll.holder.position.set(-WV / 2, rL, 0);
    rightRoll.holder.position.set(WV / 2, rR, 0);
    wg.clearRect(0, 0, win.width, win.height);
    wg.drawImage(source, Math.round(s * PPU), 0, win.width, win.height, 0, 0, win.width, win.height);
    winTex.needsUpdate = true;
    return { rL, rR };
  }
  function moveScroll(ds) {
    if (!ds) return;
    const before = scrollState.s;
    scrollState.s = Math.max(0, Math.min(S_MAX, before + ds));
    const d = scrollState.s - before; if (!d) return;
    if (scrollState.t0 === null) scrollState.t0 = performance.now();
    const { rL, rR } = layoutScroll();
    leftRoll.mesh.rotation.y -= d / rL;
    rightRoll.mesh.rotation.y -= d / rR;
    // message fully visible between the rolls?
    const vis0 = scrollState.s + rL + 0.05, vis1 = scrollState.s + WV - rR - 0.05;
    if (!scrollState.found && msgRange[0] >= vis0 && msgRange[1] <= vis1) {
      scrollState.found = performance.now() - scrollState.t0;
      ui.flash('scroll');
    }
    dirty = true;
  }
  layoutScroll();

  // ---------- parchment + leather ----------
  const PW = 2.2, PHt = 3.0, BW = 2.3, BH = 3.14, BT = 0.07, T = 0.36, YS = BT + T / 2;

  function parchment(seed, { heading = null, message = null, leftPage = false, textOffset = 0 } = {}) {
    const w = 1024, h = Math.round(1024 * PHt / PW), c = canvas(w, h), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = '#ebdcb9'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      const x = r() * w, y = r() * h, rad = 30 + r() * 260, gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, r() < 0.55 ? `rgba(170,130,80,${0.03 + r() * 0.06})` : `rgba(255,248,225,${0.05 + r() * 0.08})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(110,80,45,${0.05 + r() * 0.1})`; g.beginPath(); g.arc(r() * w, r() * h, 0.6 + r() * 1.3, 0, 7); g.fill(); }
    // edge soil (outer edges darker than gutter)
    const outer = leftPage ? 0 : w;
    const eg = g.createLinearGradient(outer, 0, leftPage ? 170 : w - 170, 0);
    eg.addColorStop(0, 'rgba(120,85,45,0.35)'); eg.addColorStop(1, 'rgba(120,85,45,0)');
    g.fillStyle = eg; g.fillRect(0, 0, w, h);
    for (const [y0, y1] of [[0, 110], [h, h - 120]]) {
      const vg = g.createLinearGradient(0, y0, 0, y1); vg.addColorStop(0, 'rgba(120,85,45,0.3)'); vg.addColorStop(1, 'rgba(120,85,45,0)');
      g.fillStyle = vg; g.fillRect(0, Math.min(y0, y1), w, 120);
    }
    const gutter = leftPage ? w : 0;
    const gg = g.createLinearGradient(gutter, 0, leftPage ? w - 90 : 90, 0);
    gg.addColorStop(0, 'rgba(70,45,20,0.35)'); gg.addColorStop(1, 'rgba(70,45,20,0)');
    g.fillStyle = gg; g.fillRect(0, 0, w, h);

    // layout: two columns
    const inner = 115, outerM = 150, top = 150, colGap = 56, nLines = 30, lineH = 34, size = 25;
    const colW = (w - inner - outerM - colGap) / 2;
    const left0 = leftPage ? outerM : inner;
    const cols = [left0, left0 + colW + colGap];
    // drypoint ruling + prickings
    g.strokeStyle = 'rgba(120,90,55,0.13)'; g.lineWidth = 1;
    for (let l = 0; l <= nLines; l++) { const y = top + l * lineH + 6; g.beginPath(); g.moveTo(cols[0] - 8, y); g.lineTo(cols[1] + colW + 8, y); g.stroke(); }
    for (const x of [cols[0] - 8, cols[0] + colW + 8, cols[1] - 8, cols[1] + colW + 8]) { g.beginPath(); g.moveTo(x, top - 20); g.lineTo(x, top + nLines * lineH + 20); g.stroke(); }
    const px = leftPage ? 40 : w - 40;
    g.fillStyle = 'rgba(90,60,30,0.35)';
    for (let l = 0; l <= nLines; l++) { g.beginPath(); g.arc(px, top + l * lineH + 6, 1.4, 0, 7); g.fill(); }

    const ink = '52,32,18', red = '150,38,24';
    const next = stream(LATIN, textOffset);
    let startLine = 0;
    if (heading) {
      g.font = `600 ${size + 4}px Georgia, serif`; g.fillStyle = `rgba(${red},0.92)`;
      g.fillText(heading, cols[0], top + lineH);
      startLine = 2;
    }
    if (message) {
      // rubricated message: large red initial in a gold frame, then big red capitals
      const big = 50, gap = 64, y0 = top + lineH * (startLine + 1) + 26;
      g.font = `700 ${big * 2.1}px Georgia, serif`; g.fillStyle = `rgba(${red},0.95)`;
      g.fillText(message[0][0], cols[0] + 4, y0 + gap - 2);
      g.strokeStyle = 'rgba(190,150,60,0.85)'; g.lineWidth = 4;
      g.strokeRect(cols[0] - 8, y0 - big - 6, big * 2.1, gap + big + 14);
      g.font = `600 ${big}px Georgia, serif`;
      message.forEach((t, k) => {
        const txt = k === 0 ? t.slice(1) : t;
        let x = cols[0] + (k < 2 ? big * 2.1 + 4 : 0); const y = y0 + k * gap;
        for (const ch of txt) { g.fillStyle = `rgba(${red},${(0.86 + r() * 0.12).toFixed(2)})`; g.fillText(ch, x, y + (r() - 0.5) * 1.5); x += g.measureText(ch).width + 2; }
      });
      const used = startLine + Math.ceil((message.length * gap + 40) / lineH) + 1;
      writeColumn(g, r, next, cols[0], top + lineH * (used + 1), colW, nLines - used, lineH, size, ink);
    } else {
      writeColumn(g, r, next, cols[0], top + lineH * (startLine + 1), colW, nLines - startLine, lineH, size, ink);
    }
    writeColumn(g, r, next, cols[1], top + lineH, colW, nLines, lineH, size, ink);
    // running quire mark / folio number
    g.font = `22px Georgia, serif`; g.fillStyle = `rgba(${ink},0.6)`;
    g.fillText(heading ? 'ΚΓ' : '·', leftPage ? 60 : w - 90, h - 70);
    return c;
  }

  function leather(bump) {
    const w = 1024, h = Math.round(1024 * BH / BW), c = canvas(w, h), g = c.getContext('2d'), r = rng(bump ? 41 : 42);
    const r2 = rng(99); // same geometry for colour and bump
    g.fillStyle = bump ? '#808080' : '#4a2a18'; g.fillRect(0, 0, w, h);
    if (!bump) {
      for (let i = 0; i < 260; i++) {
        const x = r() * w, y = r() * h, rad = 20 + r() * 200, gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, r() < 0.5 ? `rgba(20,8,2,${0.05 + r() * 0.12})` : `rgba(140,85,50,${0.04 + r() * 0.1})`);
        gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      // rubbed edges
      for (const [x0, y0, x1, y1] of [[0, 0, 60, 0], [w, 0, w - 60, 0], [0, 0, 0, 60], [0, h, 0, h - 60]]) {
        const eg = g.createLinearGradient(x0, y0, x1, y1); eg.addColorStop(0, 'rgba(150,100,60,0.45)'); eg.addColorStop(1, 'rgba(150,100,60,0)');
        g.fillStyle = eg; g.fillRect(0, 0, w, h);
      }
    }
    for (let i = 0; i < 9000; i++) { // grain
      g.fillStyle = bump ? `rgba(${r() < 0.5 ? '40,40,40' : '200,200,200'},0.25)` : `rgba(${r() < 0.5 ? '15,6,2' : '120,75,45'},0.18)`;
      g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
    // blind tooling: impressed lines = dark in colour, dark (low) in bump
    const line = (x0, y0, x1, y1) => {
      g.lineWidth = 5; g.strokeStyle = bump ? '#303030' : 'rgba(18,8,3,0.75)';
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      if (!bump) { g.lineWidth = 1.5; g.strokeStyle = 'rgba(160,110,70,0.35)'; g.beginPath(); g.moveTo(x0 + 2, y0 + 2); g.lineTo(x1 + 2, y1 + 2); g.stroke(); }
    };
    const rect = (m) => { line(m, m, w - m, m); line(w - m, m, w - m, h - m); line(w - m, h - m, m, h - m); line(m, h - m, m, m); };
    rect(50); rect(66); rect(150); rect(166);
    const ix0 = 166, iy0 = 166, ix1 = w - 166, iy1 = h - 166;
    line(50, 50, ix0, iy0); line(w - 50, 50, ix1, iy0); line(50, h - 50, ix0, iy1); line(w - 50, h - 50, ix1, iy1);
    // lattice of diagonals in the central panel
    g.save(); g.beginPath(); g.rect(ix0, iy0, ix1 - ix0, iy1 - iy0); g.clip();
    const step = 115;
    for (let k = -h; k < w + h; k += step) { line(ix0 + k, iy0, ix0 + k + (iy1 - iy0), iy1); line(ix0 + k, iy1, ix0 + k + (iy1 - iy0), iy0); }
    g.restore();
    // small stamped rosettes along the frame
    const stamp = (x, y) => {
      for (let a = 0; a < 6; a++) { g.fillStyle = bump ? '#383838' : 'rgba(18,8,3,0.7)'; g.beginPath(); g.arc(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 4, 0, 7); g.fill(); }
    };
    for (let x = 108; x < w - 90; x += 58) { stamp(x, 108); stamp(x, h - 108); }
    for (let y = 166; y < h - 120; y += 58) { stamp(108, y); stamp(w - 108, y); }
    void r2;
    return c;
  }

  function pageEdges() {
    const c = canvas(256, 128), g = c.getContext('2d'), r = rng(77);
    g.fillStyle = '#e4d4ae'; g.fillRect(0, 0, 256, 128);
    for (let y = 0; y < 128; y += 2 + r() * 2) { g.fillStyle = `rgba(130,95,55,${0.15 + r() * 0.3})`; g.fillRect(0, y, 256, 0.8 + r()); }
    return tex(c, { repeat: [1, 1] });
  }

  // ---------- codex object ----------
  const codex = new THREE.Group(); scene.add(codex);
  const book = new THREE.Group(); codex.add(book);
  const leatherCol = new THREE.MeshStandardMaterial({ color: 0x3f2415, roughness: 0.62 });
  const coverMat = new THREE.MeshStandardMaterial({ map: tex(leather(false)), bumpMap: tex(leather(true), { srgb: false }), bumpScale: 4, roughness: 0.6 });
  const edgeMat = new THREE.MeshStandardMaterial({ map: pageEdges(), roughness: 0.9 });
  const pageMat = (c, flip) => {
    const t = tex(c);
    if (flip === 'rot') { t.center.set(0.5, 0.5); t.rotation = Math.PI; }
    if (flip === 'mirror') { t.center.set(0.5, 0.5); t.repeat.set(-1, 1); }
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.88 });
  };

  const backBoard = new THREE.Mesh(new THREE.BoxGeometry(BW, BT, BH), leatherCol);
  backBoard.position.set(BW / 2, BT / 2, 0); backBoard.castShadow = backBoard.receiveShadow = true; book.add(backBoard);

  const messagePage = parchment(301, { heading: 'CAPVT III', message: ['HEY,', 'HOW', 'DOES THIS', 'FEEL?'], textOffset: 40 });
  const halfGeo = new THREE.BoxGeometry(PW, T / 2, PHt);
  const lower = new THREE.Mesh(halfGeo, [edgeMat, edgeMat, pageMat(messagePage), edgeMat, edgeMat, edgeMat]);
  lower.position.set(PW / 2 + 0.02, BT + T / 4, 0); lower.castShadow = lower.receiveShadow = true; book.add(lower);

  const hinge = new THREE.Group(); hinge.position.set(0, YS, 0); book.add(hinge);
  const leftPage = parchment(202, { leftPage: true, textOffset: 300 });
  const upper = new THREE.Mesh(halfGeo, [edgeMat, edgeMat, edgeMat, pageMat(leftPage, 'rot'), edgeMat, edgeMat]);
  upper.position.set(PW / 2 + 0.02, T / 4, 0); upper.castShadow = upper.receiveShadow = true; hinge.add(upper);
  const frontBoard = new THREE.Mesh(new THREE.BoxGeometry(BW, BT, BH), [leatherCol, leatherCol, coverMat, leatherCol, leatherCol, leatherCol]);
  frontBoard.position.set(BW / 2, T / 2 + BT / 2, 0); frontBoard.castShadow = frontBoard.receiveShadow = true; hinge.add(frontBoard);
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08a45, roughness: 0.35, metalness: 0.45 });
  const bossGeo = new THREE.SphereGeometry(0.075, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [bx, bz] of [[0.35, -1.2], [BW - 0.35, -1.2], [0.35, 1.2], [BW - 0.35, 1.2], [BW / 2, 0]]) {
    const b = new THREE.Mesh(bossGeo, brass); b.scale.y = 0.6; b.position.set(bx, T / 2 + BT, bz); b.castShadow = true; hinge.add(b);
  }

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, BH), leatherCol);
  const spineFull = BT * 2 + T;
  spine.geometry.translate(0, 0.5, 0); spine.position.set(-0.04, 0, 0); spine.scale.y = spineFull; spine.castShadow = true; book.add(spine);

  // two loose leaves to leaf through before landing on chapter III
  const leafGeo = new THREE.PlaneGeometry(PW, PHt); leafGeo.rotateX(-Math.PI / 2); leafGeo.translate(PW / 2 + 0.02, 0, 0);
  const leaves = [];
  [[401, 402, -0.001], [403, 404, -0.003]].forEach(([fs, bs, ly], i) => {
    const pivot = new THREE.Group(); pivot.position.set(0, YS + 0.005, 0); book.add(pivot);
    const front = new THREE.Mesh(leafGeo, pageMat(parchment(fs, { textOffset: 90 * (i + 2) })));
    const back = new THREE.Mesh(leafGeo, pageMat(parchment(bs, { leftPage: true, textOffset: 130 * (i + 3) }), 'mirror'));
    back.material.side = THREE.BackSide;
    front.position.y = back.position.y = ly;
    front.castShadow = true;
    pivot.add(front, back); leaves.push(pivot);
  });

  const codexState = { p: 0, target: 0, t0: null, found: null };
  function layoutCodex() {
    const p = codexState.p;
    const a = ease(seg(p, 0, 0.55));
    hinge.rotation.z = Math.PI * a;
    spine.scale.y = spineFull + (YS - spineFull) * a;
    book.position.x = -BW / 2 * (1 - a);
    leaves[0].rotation.z = Math.PI * ease(seg(p, 0.45, 0.78));
    leaves[1].rotation.z = Math.PI * ease(seg(p, 0.64, 1));
    leaves.forEach(l => { l.visible = p > 0.3; });
    // lift leaves slightly in the middle of their turn so they don't clip
    leaves.forEach((l, i) => { const t = seg(p, i ? 0.64 : 0.45, i ? 1 : 0.78); l.position.y = YS + 0.005 + Math.sin(t * Math.PI) * 0.02; });
  }
  layoutCodex();

  // ---------- stations & camera ----------
  const CODEX_X = 13;
  codex.position.set(CODEX_X, 0, 0.05);
  codex.rotation.y = 0;
  const stations = {
    scroll: { target: new THREE.Vector3(0, 0, 0.25), pos: new THREE.Vector3(0, 6.9, 6.1) },
    codex: { target: new THREE.Vector3(CODEX_X, 0.2, 0.15), pos: new THREE.Vector3(CODEX_X, 6.4, 5.6) },
  };
  let view = 'scroll';
  const camFrom = { pos: new THREE.Vector3(), target: new THREE.Vector3() }, camNow = { pos: stations.scroll.pos.clone(), target: stations.scroll.target.clone() };
  let camT = 1;
  function frameDistance() { // pull back on narrow screens so the object fits
    const aspect = camera.aspect, need = view === 'scroll' ? 8.4 : 5.4;
    const hFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspect);
    const natural = 2 * Math.tan(hFov / 2) * 9.1;
    return Math.max(1, need / natural);
  }
  function setView(v) {
    if (v === view && camT >= 1) return;
    view = v; camFrom.pos.copy(camNow.pos); camFrom.target.copy(camNow.target); camT = 0; dirty = true;
  }

  function placeCamera() {
    const st = stations[view], k = frameDistance();
    const dest = st.target.clone().add(st.pos.clone().sub(st.target).multiplyScalar(k));
    if (camT < 1) {
      const e = ease(camT);
      camNow.pos.lerpVectors(camFrom.pos, dest, e); camNow.target.lerpVectors(camFrom.target, st.target, e);
      camNow.pos.y += Math.sin(e * Math.PI) * 1.2;
    } else { camNow.pos.copy(dest); camNow.target.copy(st.target); }
    camera.position.copy(camNow.pos); camera.lookAt(camNow.target);
    key.target.position.copy(camNow.target); key.position.copy(camNow.target).add(new THREE.Vector3(-4.5, 9, 4));
    fill.target.position.copy(camNow.target); fill.position.copy(camNow.target).add(new THREE.Vector3(6, 4, 3));
  }

  // ---------- input ----------
  const el = renderer.domElement;
  el.style.touchAction = 'none';
  let drag = null;
  el.addEventListener('pointerdown', e => {
    if (view === 'scroll') { drag = { x: e.clientX }; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; }
    else { toggleCodex(); }
  });
  el.addEventListener('pointermove', e => {
    if (!drag) { el.style.cursor = view === 'scroll' ? 'grab' : 'pointer'; return; }
    const dx = e.clientX - drag.x; drag.x = e.clientX;
    const unitsPerPx = (WV * 1.05) / el.clientWidth;
    moveScroll(-dx * unitsPerPx);
  });
  const endDrag = () => { drag = null; el.style.cursor = view === 'scroll' ? 'grab' : 'pointer'; };
  el.addEventListener('pointerup', endDrag); el.addEventListener('pointercancel', endDrag);
  el.addEventListener('wheel', e => { if (view !== 'scroll') return; e.preventDefault(); moveScroll((e.deltaY + e.deltaX) * 0.0035); }, { passive: false });
  window.addEventListener('keydown', e => {
    if (view === 'scroll' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { moveScroll(e.key === 'ArrowRight' ? 0.18 : -0.18); e.preventDefault(); }
    if (view === 'codex' && (e.key === ' ' || e.key === 'Enter')) { toggleCodex(); e.preventDefault(); }
  });

  function toggleCodex() {
    if (codexState.target === 0) { codexState.target = 1; if (codexState.t0 === null) codexState.t0 = performance.now(); }
    else codexState.target = 0;
    dirty = true;
  }

  function reset() {
    scrollState.s = 0; scrollState.t0 = null; scrollState.found = null;
    leftRoll.mesh.rotation.y = rightRoll.mesh.rotation.y = 0; layoutScroll();
    codexState.p = 0; codexState.target = 0; codexState.t0 = null; codexState.found = null; layoutCodex();
    dirty = true;
  }

  // ---------- loop ----------
  let dirty = true, last = performance.now();
  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true;
  }
  window.addEventListener('resize', resize); resize();

  const fmt = ms => { const s = Math.max(0, ms / 1000); return s < 10 ? s.toFixed(1) + ' s' : Math.round(s) + ' s'; };
  function report() {
    const now = performance.now();
    const sTime = scrollState.found ?? (scrollState.t0 !== null ? now - scrollState.t0 : null);
    const cTime = codexState.found ?? (codexState.t0 !== null ? now - codexState.t0 : null);
    ui.update({
      view,
      progress: scrollState.s / S_MAX,
      scrollTime: sTime === null ? '—' : fmt(sTime), scrollFound: !!scrollState.found,
      codexTime: cTime === null ? '—' : fmt(cTime), codexFound: !!codexState.found,
      codexOpen: codexState.target === 1,
    });
  }

  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000); last = now;
    let active = false;
    if (camT < 1) { camT = Math.min(1, camT + dt / 1.3); active = true; }
    if (codexState.p !== codexState.target) {
      const dir = Math.sign(codexState.target - codexState.p);
      codexState.p = clamp01(codexState.p + dir * dt / 1.7);
      if ((dir > 0 && codexState.p > codexState.target) || (dir < 0 && codexState.p < codexState.target)) codexState.p = codexState.target;
      if (codexState.p === 1 && !codexState.found && codexState.t0 !== null) { codexState.found = now - codexState.t0; ui.flash('codex'); }
      layoutCodex(); active = true;
    }
    const timing = (scrollState.t0 !== null && !scrollState.found) || (codexState.t0 !== null && !codexState.found);
    if (active || dirty) { placeCamera(); renderer.render(scene, camera); dirty = false; }
    if (active || timing || dirty) report();
    requestAnimationFrame(frame);
  }
  placeCamera(); report();
  requestAnimationFrame(frame);

  return { setView: v => { setView(v); report(); }, reset: () => { reset(); report(); }, toggleCodex };
}
