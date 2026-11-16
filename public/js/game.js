/* Mesin cerita & antarmuka pemain Petualangan Batik Jetis. Membutuhkan window.GB (gambar) dan window.API (net.js / lokal.js). */
(function () {
"use strict";
const $ = (s) => document.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const { IC, ic, anak, ACT, BG, FX, kepala, KULIT, RAMBUT, gapuraMini } = window.GB;
const API = window.API;
const ONLINE = API.mode === 'online';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const angka = (n) => Number(n || 0).toLocaleString('id-ID');

window.GB.pasangDefs();

/* =================== PENGATURAN (per perangkat) =================== */
const SETKEY = 'bj.set';
const bacaJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const tulisJ = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const SET = Object.assign({ music: 55, sfx: 80, speed: 'normal' }, bacaJ(SETKEY) || {});

/* =================== STATUS PERMAINAN =================== */
let U = null; // konten umum (LOC, TOPIK, INDIKATOR, PROLOG, ...)
const G = { sesi: null, aku: null, papan: [], kartu: null };
const kelasMode = () => G.sesi && G.sesi.mode === 'kelas';

/* =================== AUDIO (gamelan sederhana) =================== */
let AC = null, mG = null, sG = null, musicOn = false;
const SL = [0, 240, 480, 720, 960].map((c) => 293.66 * Math.pow(2, c / 1200));
const MEL = [0, -1, 2, 1, 3, -1, 2, 4, 3, 1, -1, 2, 1, 0, -1, -1];
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); mG = AC.createGain(); sG = AC.createGain(); mG.connect(AC.destination); sG.connect(AC.destination); applyVol(); startMusic(); } catch (e) { AC = null; }
}
function applyVol() { if (!AC) return; mG.gain.value = SET.music / 100 * 0.9; sG.gain.value = SET.sfx / 100; }
function bell(f, t, dur, out, vol) {
  const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), g2 = AC.createGain();
  o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2.76; g2.gain.value = 0.22;
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}
function gong(t) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(76, t); o.frequency.exponentialRampToValueAtTime(72, t + 3); o.connect(g); g.connect(mG); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6); o.start(t); o.stop(t + 3.7); }
function startMusic() {
  if (musicOn || !AC) return; musicOn = true; let step = 0, next = AC.currentTime + 0.15; const beat = 0.46;
  setInterval(() => { if (!AC || AC.state !== 'running') return; while (next < AC.currentTime + 0.35) { const n = MEL[step % 16]; if (n >= 0) bell(SL[n] * 2, next, 1.3, mG, 0.11); if (step % 4 === 0) bell(SL[(step / 4) % 5], next, 1.8, mG, 0.07); if (step % 16 === 0) gong(next); step++; next += beat; } }, 100);
}
function sfx(k) {
  if (!AC) return; const t = AC.currentTime;
  if (k === 'klik') bell(880, t, 0.14, sG, 0.18);
  else if (k === 'benar') { bell(660, t, 0.5, sG, 0.3); bell(990, t + 0.12, 0.7, sG, 0.3); }
  else if (k === 'salah') { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(110, t + 0.3); o.connect(g); g.connect(sG); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); o.start(t); o.stop(t + 0.4); }
  else if (k === 'bintang') { [0, 1, 2, 3, 4].forEach((n, i) => bell(SL[n] * 2, t + i * 0.09, 0.6, sG, 0.22)); }
  else if (k === 'langkah') bell(440, t, 0.08, sG, 0.07);
}
document.addEventListener('visibilitychange', () => { if (!AC) return; document.hidden ? AC.suspend() : AC.resume(); });

/* =================== MESIN ADEGAN =================== */
let runId = 0, curBg = '', curFx = '', lv = null, dlgResolve = null, typeT = null;
const aP = $('#aPlayer'), aL = $('#aL'), aR = $('#aR');
const nama = () => (G.aku && G.aku.nama) || 'Pembatik Muda';
const gender = () => (G.aku && G.aku.g) || 'p';
const fmt = (t) => (t || '').replace(/\{nama\}/g, nama());
function show(id) { ['scrTitle', 'scrScene', 'scrMap'].forEach((s) => { $('#' + s).hidden = (s !== id); }); }
function matikanSMIL(el) { if (RM) el.querySelectorAll('animate').forEach((a) => a.remove()); }

function setBg(key, fx = '') {
  curBg = key; curFx = fx; const wrap = $('#bgWrap'); const old = [...wrap.children];
  const d = document.createElement('div'); d.className = 'bgl ' + (fx || ''); d.style.opacity = '0';
  d.innerHTML = BG[key]() + (FX[fx] ? FX[fx]() : ''); matikanSMIL(d); wrap.appendChild(d);
  requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = '1'; }));
  setTimeout(() => old.forEach((o) => o.remove()), 560);
}
function setPose(p) { aP.dataset.pose = p; aP.innerHTML = anak(gender(), p); }
function setActor(slot, who, cls) {
  const el = slot === 'R' ? aR : aL; el.dataset.who = who; el.dataset.cls = cls || '';
  el.className = 'actor ' + (cls || (slot === 'R' ? 'slotR' : 'slotL')) + (who === 'sekar' ? ' float' : '') + (who === 'kilat' ? ' kilat-in' : '');
  el.innerHTML = ACT[who]();
}
function hideActor(slot) { const el = slot === 'R' ? aR : aL; el.classList.add('off'); el.dataset.who = ''; }
function resetActors() { [aL, aR].forEach((e) => { e.className = 'actor off'; e.innerHTML = ''; e.dataset.who = ''; }); aP.classList.add('off'); }
function snap() { return { bg: curBg, fx: curFx, R: aR.dataset.who, Rc: aR.dataset.cls, L: aL.dataset.who, Lc: aL.dataset.cls, pose: aP.dataset.pose }; }
function restore(s) { if (s.bg !== curBg || s.fx !== curFx) setBg(s.bg, s.fx); s.R ? setActor('R', s.R, s.Rc) : hideActor('R'); s.L ? setActor('L', s.L, s.Lc) : hideActor('L'); setPose(s.pose || 'back'); }

async function walkIn(bg) {
  if (!aP.classList.contains('off') && curBg) { aP.classList.add('walking'); aP.style.left = '112%'; await sleep(RM ? 50 : 900); }
  setBg(bg); setPose('back');
  aP.style.transition = 'none'; aP.style.left = '-30%'; aP.classList.remove('off'); void aP.offsetWidth; aP.style.transition = '';
  aP.classList.add('walking'); aP.style.left = '5%';
  for (let i = 0; i < 4; i++) { sfx('langkah'); await sleep(RM ? 10 : 230); }
  aP.classList.remove('walking');
}

function typeText(who, text, wait) {
  const dlg = $('#dlg'), nm = $('#dlgName'), tx = $('#dlgText'), more = $('#dlgMore');
  dlg.hidden = false; nm.hidden = !who; nm.textContent = who || ''; nm.className = 'dlg-name' + (who === 'Si Kilat' ? ' kilat' : '');
  tx.textContent = ''; more.hidden = true; clearInterval(typeT);
  const sp = { lambat: 38, normal: 22, cepat: 9 }[SET.speed] || 22; let i = 0, done = false;
  const finish = () => { clearInterval(typeT); tx.textContent = text; done = true; more.hidden = !wait; };
  if (RM) finish(); else typeT = setInterval(() => { i += 1; tx.textContent = text.slice(0, i); if (i >= text.length) finish(); }, sp);
  if (!wait) { dlgResolve = () => { if (!done) finish(); return false; }; return Promise.resolve(); }
  return new Promise((res) => { dlgResolve = () => { if (!done) { finish(); return false; } res(); return true; }; });
}
const say = (who, text) => typeText(who, fmt(text), true);
function advance() {
  if (dlgResolve && $('#modal').hidden && $('#choice').hidden) { const r = dlgResolve; if (r()) { dlgResolve = null; sfx('klik'); } }
  else if (dlgResolve && !$('#choice').hidden) dlgResolve();
}

async function runBeats(list, my) { for (const b of list) { if (my !== runId) return; await runBeat(b, my); } }
async function runBeat(b, my) {
  switch (b.t) {
    case 'bg': setBg(b.bg, b.fx); await sleep(RM ? 50 : 420); break;
    case 'walkin': await walkIn(b.bg); break;
    case 'show': setActor(b.slot, b.who, b.cls); await sleep(RM ? 50 : 500); break;
    case 'hide': hideActor(b.slot); await sleep(RM ? 20 : 380); break;
    case 'say': await say(b.who, b.text); break;
    case 'soal': await doSoal(b, my); break;
  }
}

/* ---------- poin & koneksi ---------- */
function tampilPlus(r) {
  if (!r || !(r.poin > 0)) return;
  const d = document.createElement('div'); d.className = 'plus';
  d.innerHTML = `<b>+${angka(r.poin)}</b><span>jawaban benar</span>`;
  $('#stage').appendChild(d); setTimeout(() => d.remove(), 1900);
}
function setSkor(skor, peringkat, jumlah) {
  if (G.aku) G.aku.skor = skor;
  if (peringkat) { G.peringkat = peringkat; G.jumlah = jumlah; }
  const hp = $('#hudPoin'); hp.hidden = false; hp.textContent = `Skor ${angka(skor)}`;
  $('#mapPoin').textContent = `Skor ${angka(skor)}`;
  updRank();
}
function updRank() {
  const r = $('#mapRank');
  if (!kelasMode()) { r.hidden = true; return; }
  const i = G.papan.findIndex((p) => G.aku && p.id === G.aku.id);
  if (i >= 0) { G.peringkat = i + 1; G.jumlah = G.papan.length; }
  r.hidden = !G.peringkat; r.textContent = `Peringkat ${G.peringkat}/${G.jumlah}`;
}
function catatHasil(id, r) {
  if (lv && !(id in lv.hasil)) { lv.hasil[id] = !!r.benar; lv.done++; if (G.aku.progres) G.aku.progres[lv.n] = lv.done; updProg(); }
  setSkor(r.skor, r.peringkat, r.jumlah);
}
function updProg() { const p = $('#hudProg'); if (!lv) { p.hidden = true; return; } p.hidden = false; p.textContent = `Soal ${Math.min(lv.done + 1, lv.total)}/${lv.total}`; }

function kartuKoneksi() {
  return new Promise((res) => {
    const ov = document.createElement('div'); ov.className = 'modal-layer'; ov.style.zIndex = '12';
    ov.innerHTML = `<div class="card" style="--w:420px"><span class="ttl">Koneksi terputus</span><p>Jawabanmu belum terkirim ke server. Periksa internet, lalu coba lagi.</p><div class="row"><button class="btn">Coba lagi</button></div></div>`;
    $('#stage').appendChild(ov);
    ov.querySelector('button').onclick = () => { ov.remove(); res(true); };
  });
}
/** Mengirim ke server; kalau gagal, minta pemain mencoba lagi. Mengembalikan null bila ditolak server. */
async function kirim(fn, my) {
  for (;;) {
    if (my !== undefined && my !== runId) return null;
    try {
      const r = await fn();
      if (r && r.ok === false) {
        if (r.status === 'selesai') { selesaiDariGuru(); return null; }
        if (r.status === 'lobby') { lobbyCard(); return null; }
        if (r.kunci) { if (r.buka && G.sesi) G.sesi.buka = r.buka; openMap(); }
        toast(r.err || 'Terjadi kesalahan.'); return null;
      }
      return r;
    } catch (e) { await kartuKoneksi(); }
  }
}

/* ---------- kartu soal pilihan ganda ---------- */
function closeOptions() { const b = $('#choice'); b.hidden = true; b.innerHTML = ''; }
function card(html, w) { const c = $('#card'); c.className = 'card'; c.style.setProperty('--w', (w || 560) + 'px'); c.innerHTML = html; $('#modal').hidden = false; return c; }
function closeCard() { $('#modal').hidden = true; const c = $('#card'); c.innerHTML = ''; c.className = 'card'; G.kartu = null; }

function isiSoalHTML(isi) {
  return (isi || []).map((x) => {
    if (typeof x === 'string') return `<p>${esc(x)}</p>`;
    if (x.ol) return `<ol>${x.ol.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>`;
    if (x.ul) return `<ul>${x.ul.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    if (x.gambar && GB.FIG[x.gambar]) return `<figure class="fig">${GB.FIG[x.gambar]()}</figure>`;
    return '';
  }).join('');
}
const HURUF = ['A', 'B', 'C', 'D'];
function titikProgres(aktif) {
  if (!lv) return '';
  return `<span class="jejak" aria-hidden="true">${lv.ids.map((id) => `<i class="${id in lv.hasil ? (lv.hasil[id] ? 'ok' : 'no') : id === aktif ? 'kini' : ''}"></i>`).join('')}</span>`;
}
/** Satu soal = satu kesempatan menjawab. Pilih opsi, lalu tekan "Kunci jawaban". */
function doSoal(b, my) {
  $('#dlg').hidden = true; dlgResolve = null;
  return new Promise((res) => {
    const adaIsi = b.isi && b.isi.length;
    const c = card(`<div class="soal-kepala"><span class="no">Soal ${b.urut} dari ${lv ? lv.total : 10}</span>${titikProgres(b.id)}<span class="tag">${esc(b.ranah)}</span></div>
      <div class="soal-badan ${adaIsi ? 'dua' : ''}">
        ${adaIsi ? `<div class="stimulus">${isiSoalHTML(b.isi)}</div>` : ''}
        <div class="jawab">
          <p class="tanya">${esc(b.tanya)}</p>
          <div class="opsi" role="radiogroup" aria-label="Pilihan jawaban">${b.opsi.map((o, i) => `<button class="op" role="radio" aria-checked="false" data-i="${i}"><b>${HURUF[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>
          <div class="hasil" id="hasil" aria-live="polite" hidden></div>
          <div class="row"><button class="btn" id="kunciJ" disabled>Kunci jawaban</button></div>
          <p class="catatan" id="catatan">Setiap soal hanya bisa dijawab satu kali.</p>
        </div>
      </div>`, adaIsi ? 1060 : 760);
    c.classList.add('soal-card');
    c.scrollTop = 0; const st = c.querySelector('.stimulus'); if (st) st.scrollTop = 0;
    API.mulaiSoal(b.id);
    let pilih = -1, sibuk = false, beres = false;
    const ops = [...c.querySelectorAll('.op')], tombol = c.querySelector('#kunciJ');
    const tandai = (i) => { pilih = i; ops.forEach((o, k) => o.setAttribute('aria-checked', String(k === i))); tombol.disabled = false; };
    ops.forEach((o) => o.addEventListener('click', (e) => { e.stopPropagation(); if (sibuk || beres) return; sfx('klik'); tandai(+o.dataset.i); }));
    c.addEventListener('keydown', (e) => {
      if (beres || sibuk || e.target.closest('input')) return;
      const k = HURUF.indexOf(String(e.key).toUpperCase()); if (k >= 0 && k < ops.length) { e.preventDefault(); tandai(k); ops[k].focus(); }
    });
    tombol.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (beres) { closeCard(); res(); return; }
      if (sibuk || pilih < 0) return;
      sibuk = true; tombol.disabled = true; ops.forEach((o) => { o.disabled = true; });
      const r = await kirim(() => API.jawab(b.id, pilih), my); sibuk = false;
      if (my !== runId) { res(); return; }
      if (!r) { tombol.disabled = false; ops.forEach((o) => { o.disabled = false; }); return; }
      beres = true;
      const dipilih = r.sudah && Number.isInteger(r.j) ? r.j : pilih;
      if (dipilih !== pilih) tandai(dipilih);
      ops.forEach((o, k) => { o.disabled = true; if (k === r.kunci) o.classList.add('benar'); else if (k === dipilih) o.classList.add('salah'); });
      const h = c.querySelector('#hasil'); h.hidden = false; h.className = 'hasil ' + (r.benar ? 'ok' : 'no');
      h.innerHTML = `<b>${r.benar ? `Benar! +${angka(r.poin || 10)} poin` : `Belum tepat. Jawaban yang benar: ${HURUF[r.kunci]}.`}</b>${r.pembahasan ? `<span>${esc(r.pembahasan)}</span>` : ''}`;
      c.querySelector('#catatan').hidden = true;
      sfx(r.benar ? 'benar' : 'salah'); catatHasil(b.id, r);
      const t = c.querySelector(".jejak"); if (t) t.outerHTML = titikProgres('');
      tombol.textContent = lv && lv.done >= lv.total ? 'Lihat nilai' : 'Soal berikutnya'; tombol.disabled = false;
      h.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); tombol.focus({ preventScroll: true });
    });
  });
}

/* =================== ALUR UTAMA =================== */
function prepScene(mode, loc) {
  show('scrScene'); $('#scrScene').dataset.mode = mode; closeOptions(); closeCard();
  $('#dlg').hidden = true; dlgResolve = null; resetActors(); $('#bgWrap').innerHTML = ''; curBg = ''; curFx = '';
  $('#hudLoc').innerHTML = loc ? `<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="#E0463A"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>${esc(loc)}` : '';
  $('#btnSkip').hidden = mode !== 'prolog';
  const hp = $('#hudPoin'); hp.hidden = mode !== 'level'; hp.textContent = `Skor ${angka(G.aku ? G.aku.skor : 0)}`;
  updProg();
}
const introKey = () => 'bj.intro.' + (G.sesi ? G.sesi.pin : '');
async function playProlog() { const my = ++runId; lv = null; prepScene('prolog', ''); await runBeats(U.PROLOG, my); if (my !== runId) return; playIntro(); }
async function playIntro() {
  const my = ++runId; lv = null; prepScene('intro', 'Kampoeng Batik Jetis, Sidoarjo');
  await runBeats(U.INTRO, my); if (my !== runId) return;
  tulisJ(introKey(), 1); G.at = 0;
  await lewatGapura(my); if (my !== runId) return;
  openMap();
}
/** Saat melanjutkan permainan: tokoh berdiri di depan gapura, lalu masuk lewat gapura. */
async function masukGapura() {
  const my = ++runId; lv = null; prepScene('intro', 'Kampoeng Batik Jetis, Sidoarjo');
  setBg('gapura'); setPose('back');
  aP.style.transition = 'none'; aP.style.left = '5%'; aP.classList.remove('off'); void aP.offsetWidth; aP.style.transition = '';
  setActor('R', 'sekar');
  await sleep(RM ? 0 : 800); if (my !== runId) return;
  await lewatGapura(my); if (my !== runId) return;
  openMap();
}

/* =================== SINEMATIK: MELEWATI GAPURA ===================
 * Dunia gapura dibagi 4 lapisan kedalaman (langit, kampung di balik gapura, bidang gapura, jalan depan).
 * Kamera: mundur memperlihatkan gapura utuh -> tokoh berjalan menjauh & melintas di bawah lengkungan
 * (setelah melintas, tokoh digambar di belakang lapisan gapura) -> kamera maju menembus gapura. */
function sfxGerbang() { if (!AC) return; const t = AC.currentTime; bell(SL[0], t, 2.4, sG, 0.24); bell(SL[2] * 2, t + 0.09, 1.7, sG, 0.15); bell(SL[4] * 2, t + 0.18, 1.5, sG, 0.11); }
function lewatGapura(my) {
  if (RM) return Promise.resolve();
  return new Promise((selesai) => {
    const sc = $('#scrScene'); const W = sc.clientWidth, H = sc.clientHeight;
    if (!W || !H) { selesai(); return; }
    const VP = GB.GAPURA.VP;
    const lerp = (a, b, u) => a + (b - a) * u;
    const klem = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
    const halus = (u) => { u = klem(u); return u * u * (3 - 2 * u); };
    const pelanCepat = (u) => { u = klem(u); return u * u * u; };

    // Kamera awal meniru latar diam (viewBox 960x540, slice, rata bawah); kamera kedua memperlihatkan gapura utuh.
    const s0 = Math.max(W / 960, H / 540);
    const cam0 = { cx: 480, cy: 540 - (H / s0) / 2, hv: H / s0 };
    let hv1 = 720; if (hv1 * W / H > 1560) hv1 = 1560 * H / W;
    const cam1 = { cx: 480, cy: 900 - hv1 / 2, hv: hv1 };

    // Posisi awal tokoh diambil dari layar supaya peralihan mulus.
    const rs = sc.getBoundingClientRect();
    const keDunia = (el, lebar, kakiY, cadangan) => {
      const svg = el && !el.classList.contains('off') && el.querySelector('svg');
      if (!svg) return cadangan;
      const r = svg.getBoundingClientRect(); if (!r.width) return cadangan;
      const k = r.width / lebar;
      const sx = r.left - rs.left + (lebar / 2) * k, sy = r.top - rs.top + kakiY * k;
      return { x: cam0.cx + (sx - W / 2) / s0, y: cam0.cy + (sy - H / 2) / s0, k: k / s0 };
    };
    const anakAwal = keDunia(aP, 200, 292, { x: 158, y: 574, k: 1.104 });
    const sekarAwal = keDunia(aR.dataset.who === 'sekar' ? aR : null, 240, 280, { x: 1060, y: 380, k: 0.6 });

    const box = document.createElement('div'); box.className = 'sinema';
    box.innerHTML = GB.gapuraLapisan().map((l) => `<div class="lapis" data-z="${l.z}" style="z-index:${l.zi}">${l.svg}</div>`).join('')
      + `<div class="aktor sekar terbang float">${ACT.sekar()}</div><div class="aktor anak">${anak(gender(), 'back')}</div><span class="lewati">Ketuk untuk melewati</span>`;
    sc.appendChild(box);
    const tirai = document.createElement('div'); tirai.className = 'tirai';
    tirai.innerHTML = `<span>Kampoeng Batik Jetis<small>Selamat datang, ${esc(nama())}!</small></span>`;
    $('#stage').appendChild(tirai);
    [aP, aL, aR].forEach((e) => e.classList.add('off')); closeOptions(); $('#dlg').hidden = true; $('#sceneHud').hidden = true;

    const lapis = [...box.querySelectorAll('.lapis')].map((el) => ({ el, z: +el.dataset.z }));
    const elAnak = box.querySelector('.aktor.anak'), elSekar = box.querySelector('.aktor.sekar');
    const vpLayar = (cam) => { const s = H / cam.hv; return [W / 2 + (VP[0] - cam.cx) * s, H / 2 + (VP[1] - cam.cy) * s, s]; };
    const faktor = (Z, d) => (Z === Infinity ? 1 : Z / Math.max(0.02, Z - d));
    const pasangLapis = (L, cam, d) => {
      const [vx, vy, s] = vpLayar(cam); const m = faktor(L.z, d);
      const X0 = W / 2 + (-320 - cam.cx) * s, Y0 = H / 2 + (0 - cam.cy) * s;
      L.el.style.transform = `translate(${vx + (X0 - vx) * m}px,${vy + (Y0 - vy) * m}px) scale(${s * m})`;
    };
    const pasangAktor = (el, cam, d, p, Z, lebar, kakiY) => {
      const [vx, vy, s] = vpLayar(cam); const m = faktor(Z, d);
      const px = vx + (W / 2 + (p.x - cam.cx) * s - vx) * m, py = vy + (H / 2 + (p.y - cam.cy) * s - vy) * m, k = p.k * s * m;
      el.style.transform = `translate(${px - (lebar / 2) * k}px,${py - kakiY * k}px) scale(${k})`;
    };
    // Lintasan berbasis kedalaman Z (Z=1 = bidang gapura). Tinggi tokoh 125 unit di bidang gapura.
    const OFF0 = (330 - VP[0]) * 0.5;
    const anakDi = (Z) => ({ x: VP[0] + OFF0 * klem((1 - Z) / 0.5) / Z, y: VP[1] + 106 / Z, k: 0.477 / Z });
    const sekarDi = (Z, t) => { const A = 172 + 14 * Math.sin(t / 240); return { x: VP[0] + 110 * klem((1.2 - Z) / 0.5) / Z, y: VP[1] + (106 - A) / Z, k: 0.39 / Z }; };

    let t0 = performance.now(), sudahLewat = false, langkahT = 0, habis = false;
    const bersih = () => { box.remove(); $('#sceneHud').hidden = false; };
    box.addEventListener('click', (e) => { e.stopPropagation(); const T = performance.now() - t0; if (T < 5000) t0 -= (5000 - T); });
    const frame = (now) => {
      if (habis) return;
      if (my !== runId) { habis = true; bersih(); tirai.remove(); selesai(); return; }
      const T = now - t0;
      const a = halus(T / 1500);
      const cam = { cx: lerp(cam0.cx, cam1.cx, a), cy: lerp(cam0.cy, cam1.cy, a), hv: lerp(cam0.hv, cam1.hv, a) };
      const d = 0.86 * pelanCepat((T - 3400) / 2100);
      lapis.forEach((L) => { pasangLapis(L, cam, d); if (L.z < 1) L.el.style.opacity = String(1 - klem((d - 0.2) / 0.25)); });

      const jalan = T >= 1500;
      const Zk = 0.5 + 1.45 * halus((T - 1500) / 3700);
      let pa;
      if (!jalan) { const g = anakDi(0.5); pa = { x: lerp(anakAwal.x, g.x, a), y: lerp(anakAwal.y, g.y, a), k: lerp(anakAwal.k, g.k, a) }; } else pa = anakDi(Zk);
      pasangAktor(elAnak, cam, d, pa, jalan ? Zk : 0.5, 200, 292);
      elAnak.style.zIndex = jalan && Zk >= 1 ? 3 : 7;
      const melangkah = T > 1150 && T < 5500;
      elAnak.classList.toggle('walking', melangkah);
      if (melangkah && now - langkahT > 300) { sfx('langkah'); langkahT = now; }
      if (!sudahLewat && jalan && Zk >= 1) { sudahLewat = true; sfxGerbang(); }

      const Zs = 0.7 + 1.9 * halus((T - 1500) / 3700);
      let ps;
      if (!jalan) { const g = sekarDi(0.7, T); ps = { x: lerp(sekarAwal.x, g.x, a), y: lerp(sekarAwal.y, g.y, a), k: lerp(sekarAwal.k, g.k, a) }; } else ps = sekarDi(Zs, T);
      pasangAktor(elSekar, cam, d, ps, jalan ? Zs : 0.7, 240, 280);
      elSekar.style.zIndex = jalan && Zs >= 1 ? 3 : 6;

      tirai.style.opacity = String(klem((T - 5100) / 800));
      if (T >= 6000) {
        habis = true; selesai();
        setTimeout(() => { bersih(); tirai.style.transition = 'opacity .6s ease'; tirai.style.opacity = '0'; setTimeout(() => tirai.remove(), 700); }, 80);
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
async function playLevel(n) {
  const r = await kirim(() => API.ambilLevel(n)); if (!r) return;
  const my = ++runId; const beats = r.beats; const dij = r.dijawab || {};
  if (levelSelesai(n)) { delete G.aku.level[n]; G.aku.progres && (G.aku.progres[n] = 0); } // latihan: mulai ulang
  if (r.skor !== undefined) setSkor(r.skor);
  const ids = beats.filter((b) => b.t === 'soal').map((b) => b.id);
  lv = { n, ids, total: ids.length, done: 0, hasil: {} };
  ids.forEach((id) => { if (dij[id]) { lv.hasil[id] = !!dij[id].benar; lv.done++; } });
  // Melanjutkan: lewati soal yang sudah dijawab dan cerita sebelum soal terakhir yang dijawab.
  let akhir = -1; beats.forEach((b, i) => { if (b.t === 'soal' && dij[b.id]) akhir = i; });
  let jalan = beats.filter((b, i) => !(b.t === 'soal' && dij[b.id]) && !(b.t === 'say' && i < akhir));
  if (lv.done > 0 && lv.done < lv.total) {
    const k = jalan.findIndex((b) => b.t === 'show');
    jalan.splice(k + 1, 0, { t: 'say', who: 'Sekar', text: `Selamat datang kembali, {nama}! Kamu sudah menjawab ${lv.done} soal. Ayo lanjutkan.` });
  }
  prepScene('level', `${U.LOC[n]} · ${U.TEMPAT[n]}`); await runBeats(jalan, my); if (my !== runId) return; finishLevel(n, my);
}
const starSVG = (on) => `<svg viewBox="0 0 24 24" class="${on ? 'on' : ''}"><path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="${on ? '#F2B632' : '#E3D2AE'}" stroke="${on ? '#B9861C' : '#C9B58E'}" stroke-width="1.2"/></svg>`;
async function finishLevel(n, my) {
  const r = await kirim(() => API.selesaiLevel(n), my); if (!r || my !== runId) return;
  G.aku.level[n] = { selesai: true, nilai: r.nilai, benar: r.benar, soal: r.soal, bintang: r.bintang };
  if (r.buka && G.sesi) G.sesi.buka = r.buka;
  G.at = n; setSkor(r.skor, r.peringkat, r.jumlah);
  sfx('bintang');
  G.nilaiTerakhir = { n, r, hasil: lv ? Object.assign({}, lv.hasil) : {}, ids: lv ? lv.ids.slice() : [] };
  lv = null; updProg();
  skorCard();
}
/** Kartu nilai setelah satu subbab selesai. Ditampilkan ulang bila guru membuka subbab berikutnya. */
function skorCard() {
  const T = G.nilaiTerakhir; if (!T) return; const { n, r } = T; G.kartu = 'skor'; $('#dlg').hidden = true; dlgResolve = null;
  const akhir = n >= U.JUMLAH_PERTEMUAN;
  const kunciGuru = !akhir && kelasMode() && n + 1 > (G.sesi.buka || 1);
  const pesan = r.nilai >= 85 ? 'Luar biasa!' : r.nilai >= 60 ? 'Bagus, terus belajar!' : 'Tetap semangat, pelajari lagi pembahasannya.';
  let lanjut;
  if (akhir) lanjut = `<button class="btn" id="nx">Lihat hasil akhir</button>`;
  else if (kunciGuru) lanjut = '';
  else lanjut = `<button class="btn" id="nx">Lanjut ke ${esc(U.LOC[n + 1])}</button>`;
  const c = card(`<span class="ttl">${esc(U.LOC[n])} selesai</span>
    <div class="nilai-besar"><b>${r.nilai}</b><span>nilai</span></div>
    <div class="stars">${[1, 2, 3].map((i) => starSVG(i <= r.bintang)).join('')}</div>
    <p><b>${pesan}</b> Kamu menjawab benar <b>${r.benar}</b> dari <b>${r.soal}</b> soal.</p>
    <div class="rekap" aria-label="Rekap jawaban">${T.ids.map((id, i) => `<span class="${T.hasil[id] ? 'ok' : 'no'}" title="Soal ${id.slice(1)}: ${T.hasil[id] ? 'benar' : 'salah'}">${id.slice(1)}<i>${T.hasil[id] ? '✓' : '✗'}</i></span>`).join('')}</div>
    <div class="saya"><div><b>${angka(r.skor)}</b><span>skor total</span></div>${kelasMode() ? `<div><b>#${G.peringkat || r.peringkat}</b><span>dari ${G.jumlah || r.jumlah} siswa</span></div>` : ''}</div>
    ${kunciGuru ? `<p class="info-kunci">${ikonGembok()}<span><b>${esc(U.LOC[n + 1])}</b> masih dikunci. Gurumu akan membukanya saat pelajaran berikutnya.</span></p>` : ''}
    <div class="row">${kelasMode() ? '<button class="btn alt" id="lp">Papan peringkat</button>' : ''}<button class="btn alt" id="kp">Ke peta</button>${lanjut}</div>`, 560);
  c.querySelector('#kp').onclick = () => { G.nilaiTerakhir = null; closeCard(); openMap(); };
  const lp = c.querySelector('#lp'); if (lp) lp.onclick = () => { papanCard(); };
  const nx = c.querySelector('#nx');
  if (nx) nx.onclick = () => { G.nilaiTerakhir = null; closeCard(); if (!akhir) openMap(n + 1); else { openMap(); hasilAkhir(false); } };
}
const ikonGembok = () => '<svg viewBox="0 0 24 24" class="gembok" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';

/* =================== PETA =================== */
const PTS = [[120, 470], [300, 380], [500, 250], [790, 250]];
const SEG = ['', 'M120 470Q200 470 300 380', 'M300 380Q370 250 500 250', 'M500 250Q650 345 790 250'];
function bangunan(n) {
  const rumah = (roof) => `<rect x="-38" y="-30" width="76" height="46" fill="#E4B37A" stroke="#8E5A36" stroke-width="3"/><path d="M-48 -28L0 -62L48 -28Z" fill="${roof}" stroke="#6E2616" stroke-width="3"/><rect x="-10" y="-8" width="20" height="24" fill="#6B4228"/><rect x="-30" y="-20" width="14" height="12" fill="#BFE3F0" stroke="#6B4228" stroke-width="2"/><rect x="16" y="-20" width="14" height="12" fill="#BFE3F0" stroke="#6B4228" stroke-width="2"/>`;
  if (n === 1) return rumah('#B8321F') + `<rect x="-26" y="-4" width="12" height="18" fill="url(#pMerah)"/>`;
  if (n === 2) return `<rect x="20" y="-72" width="12" height="30" fill="#6B4228"/>` + rumah('#8E5A36') + `<g fill="#fff" opacity=".7"><circle class="steam" cx="26" cy="-82" r="7"/><circle class="steam d2" cx="30" cy="-92" r="9"/></g>`;
  return `<path d="M-50 16V-44M50 16V-44" stroke="#6B4228" stroke-width="5"/><path d="M-50 -40Q0 -26 50 -40" stroke="#5A3E2B" stroke-width="2" fill="none"/><rect x="-42" y="-36" width="24" height="34" fill="url(#pMerah)"/><rect x="-12" y="-32" width="24" height="34" fill="url(#pKuning)"/><rect x="18" y="-36" width="24" height="34" fill="url(#pBiru)"/><ellipse cx="0" cy="12" rx="20" ry="6" fill="#B8321F" stroke="#6B4228" stroke-width="3"/>`;
}
const NP = () => (U && U.JUMLAH_PERTEMUAN) || 3;
const levelSelesai = (n) => !!(G.aku && G.aku.level[n] && G.aku.level[n].selesai);
const kunciGuru = (n) => kelasMode() && n > ((G.sesi && G.sesi.buka) || 1);
const terbuka = (n) => !kunciGuru(n) && (n === 1 || levelSelesai(n - 1));
const progres = (n) => (G.aku && G.aku.progres && G.aku.progres[n]) || 0;
function mapSVG() {
  let tebu = ''; for (let i = 0; i < 11; i++) tebu += `<rect x="${40 + i * 17}" y="150" width="9" height="${90 + (i % 3) * 10}" rx="4" fill="${i % 2 ? '#6FA25A' : '#7DB368'}"/>`;
  let tambak = ''; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) tambak += `<rect x="${470 + k * 70}" y="${438 + r * 48}" width="62" height="40" fill="url(#gWater)" stroke="#C9A06A" stroke-width="5"/>`;
  let trees = ''; [[60, 330], [210, 300], [380, 470], [640, 160], [720, 480], [900, 360], [900, 470], [380, 130], [420, 360], [650, 420]].forEach(([x, y], i) => { trees += GB.pohon(x, y, 0.45 + (i % 3) * 0.08, i % 2 ? '#5E8C55' : '#6E9E5E'); });
  let nodes = '';
  const F = `font-family="'Baloo 2',sans-serif" font-weight="800" text-anchor="middle"`;
  for (let n = 1; n <= NP(); n++) {
    const [x, y] = PTS[n]; const guru = kunciGuru(n), lock = !terbuka(n), done = levelSelesai(n); const lab = U.LOC[n]; const w = lab.length * 9 + 30;
    let bawah = '';
    if (done) bawah = `<g transform="translate(-27 54)">${[0, 1, 2].map((i) => `<path transform="translate(${i * 18} 0) scale(.75)" d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="${i < (G.aku.level[n].bintang || 0) ? '#F2B632' : '#E3D2AE'}" stroke="#8E5A36" stroke-width="1"/>`).join('')}</g><rect x="-36" y="74" width="72" height="22" rx="11" fill="#3E8E4F"/><text y="90" ${F} font-size="14" fill="#fff">Nilai ${G.aku.level[n].nilai}</text>`;
    else if (guru) bawah = `<rect x="-52" y="54" width="104" height="22" rx="11" fill="#6B6B6B"/><text y="70" ${F} font-size="13" fill="#fff">Dikunci guru</text>`;
    else if (!lock && progres(n) > 0) bawah = `<rect x="-40" y="54" width="80" height="22" rx="11" fill="#F2B632"/><text y="70" ${F} font-size="13" fill="#2A1A10">${progres(n)}/${U.JUMLAH[n]} soal</text>`;
    nodes += `<g class="node ${lock ? 'locked' : ''}" data-l="${n}" tabindex="0" role="button" aria-label="${lab}: ${esc(U.TOPIK[n])}${guru ? ' (dikunci guru)' : lock ? ' (terkunci)' : done ? ' (selesai)' : ''}" transform="translate(${x} ${y})">
    <g class="bld" transform="translate(0 -34)">${bangunan(n)}</g>
    <circle class="ring" r="15" fill="${done ? '#3E8E4F' : '#fff'}" stroke="${lock ? '#8A8A8A' : '#B8321F'}" stroke-width="4"/>
    ${lock ? '<path d="M-6 -1h12v9h-12z" fill="#6B6B6B"/><path d="M-4 -1v-4a4 4 0 0 1 8 0v4" stroke="#6B6B6B" stroke-width="2.4" fill="none"/>' : done ? '<path d="M-7 0l5 5 9-10" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : `<text y="6" ${F} font-size="17" fill="#B8321F">${n}</text>`}
    <rect x="${-w / 2}" y="22" width="${w}" height="26" rx="13" fill="rgba(42,26,16,.85)"/><text y="41" ${F} font-size="16" fill="#FFE7A8">${lab}</text>
    ${bawah}</g>`;
  }
  const g = gender();
  const tokHair = g === 'p' ? `<path d="M-11 -2Q-12 -16 0 -16Q12 -16 11 -2Q8 -9 0 -9Q-8 -9 -11 -2Z" fill="${RAMBUT}"/><ellipse cx="12" cy="0" rx="4" ry="8" fill="${RAMBUT}"/>` : `<path d="M-11 -2Q-12 -16 0 -16Q12 -16 11 -2Q8 -9 0 -9Q-8 -9 -11 -2Z" fill="${RAMBUT}"/><path d="M-11 -7Q0 -13 11 -7V-4Q0 -10 -11 -4Z" fill="#F2B632"/>`;
  const [tx, ty] = PTS[G.at || 0] || PTS[0];
  const jalur = SEG.slice(1).map((d, i) => (i ? d.replace(/^M[\d. ]+/, '') : d)).join('');
  return `<svg id="mapSvg" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-label="Peta Kampoeng Batik Jetis">
  <rect width="960" height="540" fill="#A7CF84"/><path d="M0 60Q200 30 360 90T700 70T960 90V0H0Z" fill="#8DBE6E"/>
  <path d="M-10 70Q200 40 380 100T720 80T970 104" stroke="url(#gWater)" stroke-width="44" fill="none"/><path d="M60 64q20-6 40 0M420 96q20-6 40 0M780 84q20-6 40 0" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>
  <g>${tebu}</g><text x="130" y="276" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="15" fill="#2F5A2A">Kebun tebu</text>
  <g>${tambak}</g><text x="572" y="532" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="15" fill="#1E4E66">Tambak bandeng &amp; udang</text>
  ${trees}
  <path d="${jalur}" stroke="#E6C58C" stroke-width="30" fill="none" stroke-linecap="round"/>
  <path d="${jalur}" stroke="#F6E2B4" stroke-width="4" stroke-dasharray="10 12" fill="none"/>
  ${SEG.slice(1).map((d, i) => `<path id="seg${i + 1}" d="${d}" fill="none"/>`).join('')}
  ${gapuraMini()}
  ${nodes}
  <g id="token" transform="translate(${tx} ${ty})"><g class="tok" transform="translate(0 -8)"><ellipse cx="0" cy="12" rx="12" ry="4" fill="rgba(0,0,0,.25)"/><circle r="17" fill="#fff" stroke="#F2B632" stroke-width="4"/><circle r="11" fill="${KULIT}"/>${tokHair}<circle cx="-4" cy="1" r="1.6" fill="#2A1A10"/><circle cx="4" cy="1" r="1.6" fill="#2A1A10"/><path d="M-3 5Q0 8 3 5" stroke="#8E2A1A" stroke-width="1.5" fill="none"/></g></g>
  </svg>`;
}
let walkingMap = false;
function openMap(autoLevel) {
  runId++; lv = null; dlgResolve = null; show('scrMap'); closeCard(); closeOptions();
  if (G.at === undefined) { G.at = 0; for (let n = 1; n <= NP(); n++) if (levelSelesai(n)) G.at = n; }
  gambarPeta();
  $('#mapName').innerHTML = `<svg viewBox="0 0 24 24" width="1.1em" height="1.1em"><circle cx="12" cy="8" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>${esc(nama())}${kelasMode() ? ` · ${esc(G.sesi.kelasNama)}` : ''}`;
  $('#mapPoin').textContent = `Skor ${angka(G.aku.skor)}`;
  $('#btnPapan').hidden = !kelasMode();
  updRank();
  if (autoLevel) setTimeout(() => nodeClick(autoLevel), 350);
}
/** Menggambar ulang peta (mis. saat guru membuka/mengunci subbab) tanpa memindahkan layar. */
function gambarPeta() {
  if (walkingMap) return;
  $('#mapWrap').innerHTML = mapSVG();
  $('#kainMini').innerHTML = kainSVG();
  document.querySelectorAll('.node').forEach((el) => {
    const go = () => nodeClick(+el.dataset.l); el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
}
function toast(msg, lama) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, lama || 2800); }
async function nodeClick(n) {
  if (walkingMap) return; initAudio();
  if (kunciGuru(n)) { sfx('salah'); toast(`${U.LOC[n]} masih dikunci. Tunggu gurumu membukanya.`); return; }
  if (!terbuka(n)) { sfx('salah'); toast(`Selesaikan ${U.LOC[n - 1]} dulu, ya.`); return; }
  sfx('klik'); walkingMap = true; await walkToken(n); walkingMap = false; missionCard(n);
}
function walkToken(to) {
  return new Promise(async (res) => {
    const tok = document.getElementById('token'); const from = G.at || 0; if (from === to || !tok) { G.at = to; res(); return; }
    const dir = to > from ? 1 : -1; tok.classList.add('walking');
    for (let i = from; i !== to; i += dir) {
      const seg = document.getElementById('seg' + (dir > 0 ? i + 1 : i)); if (!seg) break; const Lh = seg.getTotalLength(); const dur = RM ? 60 : Lh / 260 * 1000;
      await new Promise((r) => { const t0 = performance.now(); let lastStep = 0; const f = (now) => { const k = Math.min(1, (now - t0) / dur); const p = seg.getPointAtLength(dir > 0 ? k * Lh : (1 - k) * Lh); tok.setAttribute('transform', `translate(${p.x} ${p.y})`); if (now - lastStep > 260) { sfx('langkah'); lastStep = now; } k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
    }
    tok.classList.remove('walking'); G.at = to; res();
  });
}
function missionCard(n) {
  const done = levelSelesai(n); const tutupSaja = done && kelasMode(); const pr = progres(n);
  const tombol = tutupSaja ? '<button class="btn alt" id="mulai">Tutup</button>'
    : `<button class="btn kuning" id="mulai">${done ? 'Ulangi (latihan)' : pr > 0 ? `Lanjutkan (${pr}/${U.JUMLAH[n]} terjawab)` : 'Mulai'}</button>`;
  const c = card(`<button class="round merah x" id="tutup" aria-label="Tutup"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg></button>
  <h3 class="big">${esc(U.LOC[n])}</h3><p class="sub-big">${esc(U.TOPIK[n])}</p>
  <div class="chiprow"><span class="tag">${U.JUMLAH[n]} soal pilihan ganda</span><span class="tag k">${esc(U.RANAH[n])}</span><span class="tag">Benar = ${U.NILAI_PER_SOAL} poin</span></div>
  ${done ? `<div class="stars">${[1, 2, 3].map((i) => starSVG(i <= (G.aku.level[n].bintang || 0))).join('')}</div><p>Nilaimu: <b>${G.aku.level[n].nilai}</b> (${G.aku.level[n].benar} dari ${G.aku.level[n].soal} benar)${tutupSaja ? '. Subbab ini sudah selesai.' : ''}</p>`
    : `<p class="kecil-kiri">Kamu akan belajar:</p><ul class="learn">${(U.INDIKATOR[n] || []).map((x) => `<li>${esc(x.replace(/\s*\(C\d\)\s*$/, ''))}</li>`).join('')}</ul><p class="kecil">Setiap soal hanya bisa dijawab satu kali. Kamu boleh keluar dan melanjutkan nanti.</p>`}
  ${done && !tutupSaja ? '<p class="kecil">Mengulang akan menghapus jawaban latihan sebelumnya untuk subbab ini.</p>' : ''}
  <div class="row">${tombol}</div>`, 520);
  c.querySelector('#tutup').onclick = closeCard;
  c.querySelector('#mulai').onclick = () => { closeCard(); if (tutupSaja) return; sfx('klik'); playLevel(n); };
  c.querySelector('#mulai').focus({ preventScroll: true });
}

/* =================== PAPAN PERINGKAT =================== */
function barisPapan(list, batasBawah) {
  const n = list.length;
  return `<ol class="lb">${list.map((p, i) => `<li class="${G.aku && p.id === G.aku.id ? 'aku' : ''} ${batasBawah && n >= 6 && i >= n - 3 ? 'bawah' : ''}"><span class="rk">${p.rank || i + 1}</span>${kepala(p.g)}<span class="nm">${esc(p.nama)}${G.aku && p.id === G.aku.id ? ' (kamu)' : ''}</span><span class="sk">${angka(p.skor)}</span></li>`).join('')}</ol>`;
}
function podium(list) {
  const t = [list[1], list[0], list[2]]; const cls = ['p2', 'p1', 'p3']; const no = [2, 1, 3];
  return `<div class="podium">${t.map((p, i) => p ? `<div class="pod ${cls[i]}">${kepala(p.g)}<span class="nm">${esc(p.nama)}</span><span class="sk">${angka(p.skor)}</span><div class="blok">${no[i]}</div></div>` : '<div></div>').join('')}</div>`;
}
function papanCard() {
  const dariSkor = G.kartu === 'skor' || (G.kartu === 'papan' && papanCard.dariSkor);
  papanCard.dariSkor = dariSkor;
  G.kartu = 'papan'; const L = G.papan;
  const c = card(`<button class="round merah x" id="tutup" aria-label="Tutup"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg></button>
   <span class="ttl">Papan peringkat</span><p>${esc(G.sesi.kelasNama)}: ${L.length} pemain. Diperbarui langsung setiap ada jawaban.</p>
   ${podium(L)}${barisPapan(L, true)}`, 520);
  c.querySelector('#tutup').onclick = () => { closeCard(); if (dariSkor && G.nilaiTerakhir) skorCard(); };
}
function lobbyCard() {
  G.kartu = 'lobi'; show('scrTitle'); renderTitleBg(); $('#titlePanel').hidden = true;
  const L = G.papan;
  card(`<span class="ttl">${esc(G.sesi.kelasNama)}</span><p class="pin-tampil">${G.sesi.pin.replace(/(\d{3})(\d{3})/, '$1 $2')}</p>
    <p>Halo, <b>${esc(nama())}</b>! Kamu sudah masuk kelas. Tunggu guru menekan <b>Mulai</b>.</p>
    <div class="tunggu" aria-hidden="true"><i></i><i></i><i></i></div>
    <p style="margin-top:.6em"><b>${L.length}</b> pemain sudah bergabung</p>
    <div class="lobi-list">${L.map((p) => `<span class="${G.aku && p.id === G.aku.id ? 'aku' : ''}">${kepala(p.g)}${esc(p.nama)}</span>`).join('')}</div>`, 560);
}
function hasilAkhir(dariGuru) {
  G.kartu = 'akhir'; const L = G.papan; const i = L.findIndex((p) => G.aku && p.id === G.aku.id); const aku = L[i] || { skor: G.aku.skor, akurasi: 0 };
  const kelas = kelasMode();
  const judul = dariGuru ? 'Permainan ditutup guru' : (kelas ? 'Kamu menyelesaikan semua subbab!' : 'Latihan selesai');
  const perP = `<div class="saya">${[1, 2, 3].map((n) => `<div><b>${levelSelesai(n) ? G.aku.level[n].nilai : '–'}</b><span>${esc(U.LOC[n])}</span></div>`).join('')}</div>`;
  const isi = kelas
    ? `<div class="saya"><div><b>#${i + 1}</b><span>dari ${L.length} siswa</span></div><div><b>${angka(aku.skor)}</b><span>skor total</span></div><div><b>${aku.akurasi}%</b><span>jawaban benar</span></div></div>${perP}${podium(L)}${barisPapan(L, true)}
       ${!dariGuru ? '<p style="margin-top:.6em">Papan ini terus berubah sampai semua temanmu selesai.</p>' : ''}`
    : `<div class="saya"><div><b>${angka(G.aku.skor)}</b><span>skor total</span></div></div>${perP}<div class="kain-big">${kainSVG()}</div>`;
  const c = card(`<span class="ttl">${judul}</span>${kelas ? `<h3 class="big">${esc(G.sesi.kelasNama)}</h3>` : `<h3 class="big">${esc(nama())}</h3>`}${isi}
    <div class="row">${!dariGuru ? '<button class="btn alt" id="kp">Ke peta</button>' : ''}<button class="btn merah" id="kel">Keluar</button></div>`, 560);
  const kp = c.querySelector('#kp'); if (kp) kp.onclick = closeCard;
  c.querySelector('#kel').onclick = () => { API.keluar(); G.sesi = null; G.aku = null; openTitle(); };
}
function selesaiDariGuru() {
  if (!G.sesi) return; G.sesi.status = 'selesai'; runId++; closeOptions(); $('#dlg').hidden = true;
  if ($('#scrMap').hidden) openMap(); hasilAkhir(true);
}

/* =================== KAIN =================== */
function kainSVG() {
  const P = [[1, 'pKuning', 'kembang'], [2, 'pMerah', 'beras'], [3, 'pBiru', 'bandeng']];
  let s = '<svg viewBox="0 0 200 110" aria-hidden="true"><rect width="200" height="110" rx="6" fill="#FFFDF6"/><rect x="0" y="0" width="200" height="10" fill="url(#pHijau)"/><rect x="0" y="100" width="200" height="10" fill="url(#pHijau)"/>';
  P.forEach(([n, p, m], i) => {
    const x = 7 + i * 63, y = 17; const done = levelSelesai(n);
    s += done ? `<rect x="${x}" y="${y}" width="60" height="76" rx="4" fill="url(#${p})"/><circle cx="${x + 30}" cy="${y + 38}" r="21" fill="#FFF6E4" opacity=".92"/><g transform="translate(${x + 13} ${y + 21}) scale(.53)">${IC[m]}</g>`
      : `<rect x="${x}" y="${y}" width="60" height="76" rx="4" fill="url(#pPensil)" stroke="#CDBB98" stroke-dasharray="4 3"/><g transform="translate(${x + 13} ${y + 21}) scale(.53)" opacity=".25" filter="url(#fGrey)">${IC[m]}</g>`;
  });
  return s + '</svg>';
}
function kainCard() {
  const c = card(`<span class="ttl">Kain batikmu</span><p>Setiap subbab yang selesai menambah satu motif di kainmu.</p><div class="kain-big">${kainSVG()}</div><div class="row"><button class="btn alt" id="tt">Tutup</button></div>`, 480);
  c.querySelector('#tt').onclick = closeCard;
}

/* =================== JUDUL, NAMA, PENGATURAN =================== */
function renderTitleBg() { const b = $('#titleBg'); if (!b.firstChild) { b.innerHTML = `<div class="bgl">${BG.gapura()}</div>`; matikanSMIL(b); } }
function kodeDariURL() { try { return (new URLSearchParams(location.search).get('kode') || '').replace(/\D/g, '').slice(0, 6); } catch (e) { return ''; } }
function openTitle(kodeAwal) {
  runId++; lv = null; dlgResolve = null; closeCard(); show('scrTitle'); renderTitleBg();
  const panel = $('#titlePanel'); panel.hidden = false;
  const saved = API.tersimpan();
  if (!ONLINE) {
    panel.innerHTML = `<p class="lead">Jelajahi Kampoeng Batik Jetis dan kerjakan tiga subbab IPA tentang zat dan perubahannya.</p>
      <div class="links">${saved ? '<button class="btn kuning" id="tLanjut">Lanjutkan</button><button class="btn alt" id="tBaru">Mulai dari awal</button>' : '<button class="btn kuning" id="tLatihan">Mulai bermain</button>'}<button class="btn alt" id="tSet">Pengaturan</button></div>
      <p class="small">Ini pratinjau satu pemain. Kode kelas dan papan peringkat bersama berjalan di versi server.</p>`;
  } else {
    const kode = kodeAwal || kodeDariURL();
    panel.innerHTML = `<p class="lead">Masukkan kode dari gurumu untuk bermain bersama</p>
      <form class="join" id="fJoin" autocomplete="off"><input id="inKode" inputmode="numeric" pattern="[0-9 ]*" maxlength="7" placeholder="Kode 6 angka" aria-label="Kode permainan" value="${esc(kode)}"><button class="btn kuning" type="submit">Gabung</button></form>
      <div class="links">${saved ? '<button class="btn" id="tLanjut">Lanjutkan permainan</button>' : ''}<button class="btn alt" id="tLatihan">Latihan sendiri</button><button class="btn alt" id="tSet">Pengaturan</button></div>
      <p class="small">Guru? <a href="guru.html" target="_blank" rel="noopener">Buat kelas di dasbor guru</a>${saved ? ' · <button class="linkish" id="tLupa">Keluar dari sesi tersimpan</button>' : ''}</p>`;
    const f = $('#fJoin');
    f.addEventListener('submit', (e) => { e.preventDefault(); initAudio(); const v = $('#inKode').value.replace(/\D/g, ''); if (v.length !== 6) { toast('Kode permainan terdiri dari 6 angka.'); $('#inKode').focus(); return; } sfx('klik'); nameCard('kelas', v); });
  }
  const on = (id, f) => { const e = $('#' + id); if (e) e.onclick = () => { initAudio(); sfx('klik'); f(); }; };
  on('tLatihan', () => nameCard('latihan'));
  on('tSet', settingsCard);
  on('tLanjut', lanjutkan);
  on('tBaru', () => konfirmasi('Mulai dari awal?', 'Skor dan subbab yang sudah selesai di perangkat ini akan dihapus.', 'Hapus dan mulai', () => { API.keluar(); openTitle(); }));
  on('tLupa', () => { API.keluar(); openTitle(); });
}
async function lanjutkan() {
  const s = API.tersimpan(); if (!s) return openTitle();
  let r; try { r = await API.gabung({ pin: s.pin, token: s.token }); } catch (e) { toast('Tidak bisa terhubung ke server. Coba lagi.'); return; }
  if (!r.ok) { toast(r.err); API.keluar(); openTitle(); return; }
  masuk(r.sesi);
}
function konfirmasi(judul, teks, ya, f) {
  const c = card(`<span class="ttl">${esc(judul)}</span><p>${esc(teks)}</p><div class="row"><button class="btn alt" id="batal">Batal</button><button class="btn merah" id="ya">${esc(ya)}</button></div>`, 440);
  c.querySelector('#batal').onclick = closeCard; c.querySelector('#ya').onclick = () => { closeCard(); f(); };
}
function nameCard(mode, pin) {
  let g = 'p';
  const muka = (gg) => `<svg viewBox="36 22 128 128">${anak(gg, 'front').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
  const c = card(`<button class="round merah x" id="tutup" aria-label="Tutup"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg></button>
   ${mode === 'kelas' ? `<p style="margin:0">Kode kelas</p><p class="pin-tampil">${pin.replace(/(\d{3})(\d{3})/, '$1 $2')}</p>` : ''}
   <span class="ttl">Nama</span><input class="field" id="inpNama" maxlength="16" autocomplete="off" placeholder="Tulis namamu" aria-label="Nama">
   <span class="ttl" style="margin-top:.8em">Pilih avatarmu</span>
   <div class="avas"><button class="ava" data-g="p" aria-pressed="true">${muka('p')}Anak perempuan</button><button class="ava" data-g="l" aria-pressed="false">${muka('l')}Anak laki-laki</button></div>
   <div class="fb no" id="fb" aria-live="polite"></div><div class="nama-ada" id="namaAda" hidden></div><div class="row"><button class="btn" id="ok">${mode === 'kelas' ? 'Masuk kelas' : 'Mulai petualangan'}</button></div>`, 460);
  c.querySelector('#tutup').onclick = closeCard;
  c.querySelectorAll('.ava').forEach((b) => { b.onclick = () => { g = b.dataset.g; sfx('klik'); c.querySelectorAll('.ava').forEach((x) => x.setAttribute('aria-pressed', x === b)); }; });
  const inp = c.querySelector('#inpNama'); inp.focus();
  inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') c.querySelector('#ok').click(); });
  let sibuk = false;
  const kirimNama = async (tambahan) => {
    if (sibuk) return; const fb = c.querySelector('#fb'); const v = inp.value.trim();
    if (!v) { fb.textContent = 'Tulis namamu dulu, ya.'; inp.focus(); return; }
    sibuk = true; fb.textContent = '';
    let r; try { r = mode === 'kelas' ? await API.gabung(Object.assign({ pin, nama: v, g }, tambahan)) : await API.latihan({ nama: v, g }); } catch (e) { r = { ok: false, err: 'Tidak bisa terhubung ke server. Periksa internet, lalu coba lagi.' }; }
    sibuk = false;
    if (r.kode === 'namaAda') { tanyaNama(r); return; }
    if (!r.ok) { fb.textContent = r.err; return; }
    closeCard(); sfx('benar'); masuk(r.sesi);
  };
  /* Nama sudah ada di kelas: bisa jadi siswa yang sama di perangkat lain (lanjutkan), atau siswa lain dengan nama sama. */
  const tanyaNama = (r) => {
    const kotak = c.querySelector('#namaAda');
    kotak.hidden = false;
    kotak.innerHTML = `<p><b>Nama "${esc(r.nama)}" sudah ada di kelas ini</b>${r.misi ? ` (sudah menyelesaikan ${r.misi} subbab, skor ${angka(r.skor)})` : ''}. Apakah itu kamu?</p>
      <div class="row"><button class="btn" id="yaAku">Ya, itu aku. Lanjutkan</button><button class="btn alt" id="bukan">Bukan, aku siswa lain</button></div>`;
    c.querySelector('#ok').hidden = true;
    kotak.querySelector('#yaAku').onclick = () => kirimNama({ lanjut: true });
    kotak.querySelector('#bukan').onclick = () => kirimNama({ baru: true });
    kotak.querySelector('#yaAku').focus();
  };
  inp.addEventListener('input', () => { const k = c.querySelector('#namaAda'); if (!k.hidden) { k.hidden = true; c.querySelector('#ok').hidden = false; } });
  c.querySelector('#ok').onclick = () => kirimNama({});
}
function masuk(sesi) {
  G.sesi = sesi; G.aku = sesi.pemain; G.papan = sesi.papan || []; G.at = undefined; initAudio();
  setSkor(G.aku.skor);
  if (ONLINE && sesi.mode === 'kelas') { try { history.replaceState(null, '', '?kode=' + sesi.pin); } catch (e) {} }
  if (sesi.status === 'lobby') { lobbyCard(); return; }
  if (sesi.status === 'selesai') { openMap(); hasilAkhir(true); return; }
  const adaProgres = Object.keys(G.aku.level || {}).length > 0 || Object.values(G.aku.progres || {}).some((x) => x > 0);
  if (adaProgres || bacaJ(introKey())) masukGapura(); else playProlog();
}
function settingsCard() {
  const c = card(`<span class="ttl">Pengaturan</span>
   <div class="set"><label for="vm">Musik</label><input type="range" id="vm" min="0" max="100" value="${SET.music}">
   <label for="vs">Suara</label><input type="range" id="vs" min="0" max="100" value="${SET.sfx}">
   <label>Teks</label><div class="seg" id="sp">${[['lambat', 'Lambat'], ['normal', 'Normal'], ['cepat', 'Cepat']].map(([k, l]) => `<button data-k="${k}" aria-pressed="${SET.speed === k}">${l}</button>`).join('')}</div></div>
   <div class="row"><button class="btn" id="ok">Simpan</button></div>`, 440);
  c.querySelector('#vm').oninput = (e) => { SET.music = +e.target.value; applyVol(); };
  c.querySelector('#vs').oninput = (e) => { SET.sfx = +e.target.value; applyVol(); sfx('klik'); };
  c.querySelectorAll('#sp button').forEach((b) => { b.onclick = () => { SET.speed = b.dataset.k; c.querySelectorAll('#sp button').forEach((x) => x.setAttribute('aria-pressed', x === b)); }; });
  c.querySelector('#ok').onclick = () => { tulisJ(SETKEY, SET); closeCard(); };
}

/* =================== KABAR DARI SERVER =================== */
API.init({
  onPapan(l) {
    G.papan = l || []; updRank();
    if (G.kartu === 'papan') papanCard(); else if (G.kartu === 'lobi') lobbyCard(); else if (G.kartu === 'akhir') hasilAkhir(G.sesi && G.sesi.status === 'selesai');
  },
  onStatus(s) {
    if (!G.sesi) return; const lama = G.sesi.status; G.sesi.status = s;
    if (s === 'main' && lama === 'lobby') { closeCard(); sfx('bintang'); playProlog(); }
    if (s === 'main' && lama === 'selesai') { closeCard(); toast('Gurumu membuka kembali kelas ini.'); openMap(); }
    if (s === 'selesai') selesaiDariGuru();
  },
  onKunci(d) {
    if (!G.sesi || !d) return; G.sesi.buka = d.buka;
    if (d.naik) { sfx('bintang'); toast(`Gurumu membuka ${U.LOC[d.buka]}!`, 4000); }
    else toast(`Gurumu mengunci kembali ${U.LOC[d.buka + 1]}.`, 4000);
    if (!$('#scrMap').hidden) gambarPeta();
    if (G.kartu === 'skor') skorCard();
  },
  onSambung(sesi) {
    if (!G.sesi) return; const bukaLama = G.sesi.buka; G.sesi.status = sesi.status; G.sesi.buka = sesi.buka; G.papan = sesi.papan || G.papan; updRank();
    if (bukaLama !== sesi.buka && !$('#scrMap').hidden) gambarPeta();
  },
  onKoneksi(ok) { $('#koneksi').hidden = ok; },
  onDikeluarkan() {
    runId++; closeOptions(); G.sesi = null; G.aku = null; openTitle('');
    const c = card(`<span class="ttl">Kamu dikeluarkan</span><p>Guru mengeluarkanmu dari kelas ini. Tanyakan kepada gurumu kalau ini keliru.</p><div class="row"><button class="btn" id="ok">Mengerti</button></div>`, 420);
    c.querySelector('#ok').onclick = closeCard;
  },
});

/* =================== TOMBOL & INPUT =================== */
$('#scrScene').addEventListener('click', (e) => { if (e.target.closest('button,.card,.choice')) return; advance(); });
document.addEventListener('keydown', (e) => {
  if ($('#scrScene').hidden) return;
  if ((e.key === ' ' || e.key === 'Enter') && $('#modal').hidden && $('#choice').hidden && !e.target.closest('button,input')) { e.preventDefault(); advance(); }
});
$('#btnSkip').onclick = (e) => { e.stopPropagation(); sfx('klik'); playIntro(); };
$('#btnBack').onclick = (e) => {
  e.stopPropagation(); sfx('klik'); const mode = $('#scrScene').dataset.mode;
  if (mode !== 'level') { tulisJ(introKey(), 1); openMap(); return; }
  const c = card(`<span class="ttl">Keluar dari subbab?</span><p>Jawaban yang sudah kamu kunci tetap tersimpan. Kamu bisa melanjutkan subbab ini dari peta.</p><div class="row"><button class="btn alt" id="tetap">Tetap main</button><button class="btn merah" id="keluar">Keluar ke peta</button></div>`, 440);
  c.querySelector('#tetap').onclick = closeCard; c.querySelector('#keluar').onclick = () => { closeOptions(); $('#dlg').hidden = true; openMap(); };
};
$('#btnHome').onclick = () => { sfx('klik'); openTitle(); };
$('#btnSet').onclick = () => { sfx('klik'); settingsCard(); };
$('#btnPapan').onclick = () => { sfx('klik'); papanCard(); };
$('#kainCard').onclick = () => { sfx('klik'); kainCard(); };
$('#btnFull').onclick = () => { const st = $('#stage'); try { document.fullscreenElement ? document.exitFullscreen() : st.requestFullscreen && st.requestFullscreen().catch(() => toast('Layar penuh tidak tersedia di sini.')); } catch (e) { toast('Layar penuh tidak tersedia di sini.'); } };

/* =================== MULAI =================== */
(async function mulai() {
  renderTitleBg();
  try { U = await API.kontenUmum(); } catch (e) { toast('Gagal memuat permainan. Muat ulang halaman.'); return; }
  const kode = ONLINE ? kodeDariURL() : '';
  const s = API.tersimpan();
  if (ONLINE && s && kode && s.pin === kode) { openTitle(kode); lanjutkan(); return; }
  openTitle(kode);
  if (ONLINE && kode.length === 6) nameCard('kelas', kode);
})();
})();
