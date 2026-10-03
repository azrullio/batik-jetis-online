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
let U = null; // konten umum (LOC, MISI, PROLOG, ...)
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
    case 'choice': await doChoice(b, my); break;
    case 'quiz': await doQuiz(b, my); break;
    case 'pick': await doPick(b, my); break;
    case 'order': await doOrder(b, my); break;
  }
}

/* ---------- poin, timer, koneksi ---------- */
let tTimer = null;
function mulaiTimer(id, tipe) {
  API.mulaiSoal(id);
  const ms = (U.BATAS && U.BATAS[tipe]) || 30000;
  const t = $('#timer'), bar = $('#timerBar'), lbl = $('#timerLbl');
  t.hidden = false; lbl.hidden = false; bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth;
  bar.style.transition = `transform ${ms}ms linear`; bar.style.transform = 'scaleX(0)';
  clearTimeout(tTimer); tTimer = setTimeout(hentikanTimer, ms);
}
function hentikanTimer() { clearTimeout(tTimer); $('#timer').hidden = true; $('#timerLbl').hidden = true; }
function tampilPlus(r) {
  if (!r || !(r.poin > 0)) return;
  const d = document.createElement('div'); d.className = 'plus';
  const rinci = [r.cepat ? `bonus cepat +${r.cepat}` : '', r.beruntun ? `beruntun +${r.beruntun}` : ''].filter(Boolean).join(', ');
  d.innerHTML = `<b>+${angka(r.poin)}</b>${rinci ? `<span>${rinci}</span>` : ''}`;
  $('#stage').appendChild(d); setTimeout(() => d.remove(), 1900);
}
function setSkor(skor, peringkat, jumlah) {
  if (G.aku) G.aku.skor = skor;
  if (peringkat) { G.peringkat = peringkat; G.jumlah = jumlah; }
  const hp = $('#hudPoin'); hp.hidden = false; hp.textContent = `${angka(skor)} poin`;
  $('#mapPoin').textContent = `${angka(skor)} poin`;
  updRank();
}
function updRank() {
  const r = $('#mapRank');
  if (!kelasMode()) { r.hidden = true; return; }
  const i = G.papan.findIndex((p) => G.aku && p.id === G.aku.id);
  if (i >= 0) { G.peringkat = i + 1; G.jumlah = G.papan.length; }
  r.hidden = !G.peringkat; r.textContent = `Peringkat ${G.peringkat}/${G.jumlah}`;
}
function catatHasil(r) { if (lv) { lv.done++; updProg(); } setSkor(r.skor, r.peringkat, r.jumlah); tampilPlus(r); }
function updProg() { const p = $('#hudProg'); if (!lv) { p.hidden = true; return; } p.hidden = false; p.textContent = `Tantangan ${Math.min(lv.done + 1, lv.total)}/${lv.total}`; }

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
        toast(r.err || 'Terjadi kesalahan.'); return null;
      }
      return r;
    } catch (e) { await kartuKoneksi(); }
  }
}

/* ---------- pilihan & soal ---------- */
function openOptions(title, opts, dis) {
  const box = $('#choice');
  box.innerHTML = `<h3>${esc(fmt(title))}</h3>` + opts.map((o, i) => `<button class="opt" data-i="${i}" ${dis && dis.has(i) ? 'disabled' : ''}>${o.icon ? `<span class="ic">${ic(o.icon)}</span>` : ''}<span>${esc(o.text)}</span></button>`).join('');
  box.hidden = false; const first = box.querySelector('.opt:not([disabled])'); if (first) first.focus({ preventScroll: true });
  return new Promise((res) => { box.querySelectorAll('.opt').forEach((btn) => btn.addEventListener('click', (e) => { e.stopPropagation(); if (btn.disabled) return; box.querySelectorAll('.opt').forEach((x) => { x.disabled = true; }); sfx('klik'); res(+btn.dataset.i); })); });
}
function closeOptions() { const b = $('#choice'); b.hidden = true; b.innerHTML = ''; }

async function doChoice(b, my) {
  let first = true;
  while (my === runId) {
    setPose('front');
    typeText('Sekar', fmt(b.prompt), false);
    if (first) mulaiTimer(b.id, 'choice');
    const i = await openOptions(b.q, b.opts); if (my !== runId) return;
    const r = await kirim(() => API.jawab(b.id, i), my); if (my !== runId) return;
    closeOptions();
    if (!r) continue;
    if (first) { hentikanTimer(); first = false; }
    if (r.benar) { sfx('benar'); catatHasil(r); setPose('back'); await runBeats(r.reaksi || [], my); return; }
    sfx('salah'); const s = snap(); setPose('back');
    await runBeats(r.reaksi || [], my); if (my !== runId) return;
    restore(s); await sleep(300);
    await say('Sekar', 'Jalan pintas memang menggoda. Ayo kita pilih lagi dengan lebih bijak.');
  }
}
async function doQuiz(b, my) {
  let first = true; const dis = new Set();
  while (my === runId) {
    typeText('Sekar', fmt(b.q), false);
    if (first) mulaiTimer(b.id, 'quiz');
    const i = await openOptions('Pilih jawabanmu', b.opts, dis); if (my !== runId) return;
    const r = await kirim(() => API.jawab(b.id, i), my); if (my !== runId) return;
    if (!r) { closeOptions(); continue; }
    if (first) { hentikanTimer(); first = false; }
    if (r.benar) { closeOptions(); sfx('benar'); catatHasil(r); await say('Sekar', r.pesan); return; }
    sfx('salah'); const btn = $('#choice').querySelector(`[data-i="${i}"]`); if (btn) btn.classList.add('shake');
    dis.add(i); await sleep(450); closeOptions();
    await say('Sekar', r.pesan || 'Belum tepat. Coba pikirkan lagi.');
  }
}
function card(html, w) { const c = $('#card'); c.style.setProperty('--w', (w || 560) + 'px'); c.innerHTML = html; $('#modal').hidden = false; return c; }
function closeCard() { $('#modal').hidden = true; $('#card').innerHTML = ''; G.kartu = null; }

function doPick(b, my) {
  $('#dlg').hidden = true;
  return new Promise((res) => {
    let first = true; const sel = new Set(); let sibuk = false;
    const c = card(`<span class="ttl">${esc(b.title)}</span><p>${esc(b.q)}</p><div class="grid ${b.cols === 3 ? 'g3' : ''}">${b.items.map(([k, l], i) => `<button class="item" data-i="${i}" aria-pressed="false">${ic(k)}<span>${esc(l)}</span></button>`).join('')}</div><div class="fb" id="fb" aria-live="polite"></div><div class="row"><button class="btn" id="cek">Periksa</button></div>`, b.cols === 3 ? 520 : 720);
    mulaiTimer(b.id, 'pick');
    c.querySelectorAll('.item').forEach((el) => el.addEventListener('click', () => { const i = +el.dataset.i; el.classList.remove('bad'); sel.has(i) ? sel.delete(i) : sel.add(i); el.setAttribute('aria-pressed', sel.has(i)); sfx('klik'); }));
    c.querySelector('#cek').addEventListener('click', async () => {
      if (my !== runId || sibuk) return; const fb = c.querySelector('#fb');
      if (!sel.size) { fb.className = 'fb no'; fb.textContent = 'Pilih dulu minimal satu, ya.'; return; }
      sibuk = true; const r = await kirim(() => API.jawab(b.id, [...sel]), my); sibuk = false; if (my !== runId || !r) return;
      if (first) { hentikanTimer(); first = false; }
      if (r.benar) { sfx('benar'); fb.className = 'fb ok'; fb.textContent = 'Semua benar!'; catatHasil(r); await sleep(700); closeCard(); await say('Sekar', r.pesan); res(); return; }
      sfx('salah'); (r.salah || []).forEach((i) => { const el = c.querySelector(`[data-i="${i}"]`); if (el) el.classList.add('bad'); });
      const msg = []; if (r.salah && r.salah.length) msg.push(`${r.salah.length} pilihan tidak dipakai`); if (r.kurang > 0) msg.push(`masih kurang ${r.kurang}`);
      fb.className = 'fb no'; fb.textContent = 'Belum tepat: ' + msg.join(', ') + '.';
    });
  });
}
function doOrder(b, my) {
  $('#dlg').hidden = true;
  return new Promise((res) => {
    let first = true, sibuk = false; const n = b.steps.length; const placed = [];
    const teks = (id) => (b.steps.find((s) => s.id === id) || {}).text || '';
    const c = card(`<span class="ttl">${esc(b.title)}</span><p>${esc(b.q)}</p><div class="order"><div class="col"><h4>Langkah</h4><div class="col" id="pool"></div></div><div class="col"><h4>Urutanmu</h4><div class="col" id="slots"></div></div></div><div class="fb" id="fb" aria-live="polite"></div><div class="row"><button class="btn alt" id="ulang">Ulangi</button><button class="btn" id="cek">Periksa</button></div>`, 760);
    mulaiTimer(b.id, 'order');
    const draw = () => {
      c.querySelector('#pool').innerHTML = b.steps.map((s) => `<button class="chip" data-id="${s.id}" ${placed.includes(s.id) ? 'disabled' : ''}>${esc(s.text)}</button>`).join('');
      c.querySelector('#slots').innerHTML = Array.from({ length: n }, (_, k) => `<button class="slot" data-k="${k}"><b>${k + 1}</b><span>${placed[k] !== undefined ? esc(teks(placed[k])) : ''}</span></button>`).join('');
      c.querySelectorAll('.chip').forEach((el) => el.addEventListener('click', () => { if (el.disabled) return; placed.push(el.dataset.id); sfx('klik'); draw(); }));
      c.querySelectorAll('.slot').forEach((el) => el.addEventListener('click', () => { const k = +el.dataset.k; if (placed[k] === undefined) return; placed.splice(k, 1); draw(); }));
    }; draw();
    c.querySelector('#ulang').addEventListener('click', () => { placed.length = 0; c.querySelector('#fb').textContent = ''; draw(); });
    c.querySelector('#cek').addEventListener('click', async () => {
      if (my !== runId || sibuk) return; const fb = c.querySelector('#fb');
      if (placed.length < n) { fb.className = 'fb no'; fb.textContent = 'Isi semua urutan dulu, ya.'; return; }
      sibuk = true; const r = await kirim(() => API.jawab(b.id, placed.slice()), my); sibuk = false; if (my !== runId || !r) return;
      if (first) { hentikanTimer(); first = false; }
      let ok = 0; c.querySelectorAll('.slot').forEach((el, k) => { const good = r.posisi && r.posisi[k]; el.classList.add(good ? 'ok' : 'bad'); if (good) ok++; });
      if (r.benar) { sfx('benar'); fb.className = 'fb ok'; fb.textContent = 'Urutannya benar!'; catatHasil(r); await sleep(900); closeCard(); await say('Sekar', r.pesan); res(); return; }
      sfx('salah'); fb.className = 'fb no'; fb.textContent = `${ok} dari ${n} sudah di tempat yang benar. Ketuk langkah yang salah untuk mengeluarkannya.`;
      setTimeout(() => c.querySelectorAll('.slot').forEach((el) => el.classList.remove('bad', 'ok')), 1400);
    });
  });
}

/* =================== ALUR UTAMA =================== */
function prepScene(mode, loc) {
  show('scrScene'); $('#scrScene').dataset.mode = mode; closeOptions(); closeCard(); hentikanTimer();
  $('#dlg').hidden = true; dlgResolve = null; resetActors(); $('#bgWrap').innerHTML = ''; curBg = ''; curFx = '';
  $('#hudLoc').innerHTML = loc ? `<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="#E0463A"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>${esc(loc)}` : '';
  $('#btnSkip').hidden = mode !== 'prolog';
  const hp = $('#hudPoin'); hp.hidden = mode !== 'level'; hp.textContent = `${angka(G.aku ? G.aku.skor : 0)} poin`;
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
  const beats = r.beats; const my = ++runId;
  lv = { n, done: 0, total: beats.filter((b) => ['quiz', 'choice', 'pick', 'order'].includes(b.t)).length };
  prepScene('level', U.LOC[n]); await runBeats(beats, my); if (my !== runId) return; finishLevel(n, my);
}
const starSVG = (on) => `<svg viewBox="0 0 24 24" class="${on ? 'on' : ''}"><path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="${on ? '#F2B632' : '#E3D2AE'}" stroke="${on ? '#B9861C' : '#C9B58E'}" stroke-width="1.2"/></svg>`;
async function finishLevel(n, my) {
  const r = await kirim(() => API.selesaiLevel(n), my); if (!r || my !== runId) return;
  G.aku.level[n] = { selesai: true, bintang: r.bintang, poin: r.poin }; G.at = n; setSkor(r.skor, r.peringkat, r.jumlah); sfx('bintang');
  const akhir = n >= G.sesi.sampaiLevel;
  const next = !akhir ? `<button class="btn" id="nx">Lanjut ke ${esc(U.LOC[n + 1])}</button>` : `<button class="btn" id="nx">Lihat hasil akhir</button>`;
  const info = `<div class="saya"><div><b>+${angka(r.poin)}</b><span>poin misi ini</span></div><div><b>${angka(r.skor)}</b><span>total poin</span></div>${kelasMode() ? `<div><b>#${r.peringkat}</b><span>dari ${r.jumlah} pemain</span></div>` : ''}</div>`;
  const c = card(`<span class="ttl">Misi selesai</span><h3 class="big">${esc(U.LOC[n])}</h3><div class="stars">${[1, 2, 3].map((i) => starSVG(i <= r.bintang)).join('')}</div>${info}<ul class="learn">${U.PELAJARAN[n].map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="row"><button class="btn alt" id="kp">Ke peta</button>${next}</div>`, 560);
  c.querySelector('#kp').onclick = () => { closeCard(); openMap(); };
  c.querySelector('#nx').onclick = () => { closeCard(); if (!akhir) openMap(n + 1); else { openMap(); hasilAkhir(false); } };
}

/* =================== PETA =================== */
const PTS = [[120, 470], [300, 380], [470, 250], [650, 360], [800, 200]];
const SEG = ['', 'M120 470Q200 470 300 380', 'M300 380Q360 250 470 250', 'M470 250Q580 250 650 360', 'M650 360Q760 360 800 200'];
function bangunan(n) {
  const rumah = (roof) => `<rect x="-38" y="-30" width="76" height="46" fill="#E4B37A" stroke="#8E5A36" stroke-width="3"/><path d="M-48 -28L0 -62L48 -28Z" fill="${roof}" stroke="#6E2616" stroke-width="3"/><rect x="-10" y="-8" width="20" height="24" fill="#6B4228"/><rect x="-30" y="-20" width="14" height="12" fill="#BFE3F0" stroke="#6B4228" stroke-width="2"/><rect x="16" y="-20" width="14" height="12" fill="#BFE3F0" stroke="#6B4228" stroke-width="2"/>`;
  if (n === 1) return rumah('#B8321F') + `<rect x="-26" y="-4" width="12" height="18" fill="url(#pMerah)"/>`;
  if (n === 2) return `<rect x="20" y="-72" width="12" height="30" fill="#6B4228"/>` + rumah('#8E5A36') + `<g fill="#fff" opacity=".7"><circle class="steam" cx="26" cy="-82" r="7"/><circle class="steam d2" cx="30" cy="-92" r="9"/></g>`;
  if (n === 3) return `<path d="M-50 16V-44M50 16V-44" stroke="#6B4228" stroke-width="5"/><path d="M-50 -40Q0 -26 50 -40" stroke="#5A3E2B" stroke-width="2" fill="none"/><rect x="-42" y="-36" width="24" height="34" fill="url(#pMerah)"/><rect x="-12" y="-32" width="24" height="34" fill="url(#pKuning)"/><rect x="18" y="-36" width="24" height="34" fill="url(#pBiru)"/><ellipse cx="0" cy="12" rx="20" ry="6" fill="#B8321F" stroke="#6B4228" stroke-width="3"/>`;
  return `<rect x="-54" y="-34" width="108" height="50" fill="#F3E3C3" stroke="#8E5A36" stroke-width="3"/><path d="M-62 -32L0 -64L62 -32Z" fill="#3E8E4F" stroke="#235C31" stroke-width="3"/><g fill="#C9A06A"><rect x="-44" y="-30" width="8" height="46"/><rect x="-18" y="-30" width="8" height="46"/><rect x="10" y="-30" width="8" height="46"/><rect x="36" y="-30" width="8" height="46"/></g><rect x="-10" y="-50" width="20" height="14" fill="url(#pKuning)"/>`;
}
const levelSelesai = (n) => !!(G.aku && G.aku.level[n] && G.aku.level[n].selesai);
const dimainkan = (n) => n <= (G.sesi ? G.sesi.sampaiLevel : 4);
const terbuka = (n) => dimainkan(n) && (n === 1 || levelSelesai(n - 1));
function mapSVG() {
  let tebu = ''; for (let i = 0; i < 11; i++) tebu += `<rect x="${40 + i * 17}" y="150" width="9" height="${90 + (i % 3) * 10}" rx="4" fill="${i % 2 ? '#6FA25A' : '#7DB368'}"/>`;
  let tambak = ''; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) tambak += `<rect x="${470 + k * 70}" y="${438 + r * 48}" width="62" height="40" fill="url(#gWater)" stroke="#C9A06A" stroke-width="5"/>`;
  let trees = ''; [[60, 330], [210, 300], [380, 470], [560, 170], [720, 480], [890, 340], [900, 470], [620, 110], [330, 130], [400, 340]].forEach(([x, y], i) => { trees += GB.pohon(x, y, 0.45 + (i % 3) * 0.08, i % 2 ? '#5E8C55' : '#6E9E5E'); });
  let nodes = '';
  for (let n = 1; n <= 4; n++) {
    const [x, y] = PTS[n]; const lock = !terbuka(n), done = levelSelesai(n); const lab = U.LOC[n]; const w = lab.length * 9 + 28;
    nodes += `<g class="node ${lock ? 'locked' : ''}" data-l="${n}" tabindex="0" role="button" aria-label="${lab}${lock ? ' (terkunci)' : ''}" transform="translate(${x} ${y})">
    <g class="bld" transform="translate(0 -34)">${bangunan(n)}</g>
    <circle class="ring" r="15" fill="${done ? '#3E8E4F' : '#fff'}" stroke="${lock ? '#8A8A8A' : '#B8321F'}" stroke-width="4"/>
    ${lock ? '<path d="M-6 -1h12v9h-12z" fill="#6B6B6B"/><path d="M-4 -1v-4a4 4 0 0 1 8 0v4" stroke="#6B6B6B" stroke-width="2.4" fill="none"/>' : done ? '<path d="M-7 0l5 5 9-10" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : `<text y="6" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="800" font-size="17" fill="#B8321F">${n}</text>`}
    <rect x="${-w / 2}" y="22" width="${w}" height="26" rx="13" fill="rgba(42,26,16,.82)"/><text y="41" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="16" fill="#FFE7A8">${lab}</text>
    ${done ? `<g transform="translate(-27 54)">${[0, 1, 2].map((i) => `<path transform="translate(${i * 18} 0) scale(.75)" d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="${i < (G.aku.level[n].bintang || 0) ? '#F2B632' : '#E3D2AE'}" stroke="#8E5A36" stroke-width="1"/>`).join('')}</g>` : ''}
    ${!dimainkan(n) ? `<text y="72" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="13" fill="#2A1A10">Tidak dimainkan</text>` : ''}</g>`;
  }
  const g = gender();
  const tokHair = g === 'p' ? `<path d="M-11 -2Q-12 -16 0 -16Q12 -16 11 -2Q8 -9 0 -9Q-8 -9 -11 -2Z" fill="${RAMBUT}"/><ellipse cx="12" cy="0" rx="4" ry="8" fill="${RAMBUT}"/>` : `<path d="M-11 -2Q-12 -16 0 -16Q12 -16 11 -2Q8 -9 0 -9Q-8 -9 -11 -2Z" fill="${RAMBUT}"/><path d="M-11 -7Q0 -13 11 -7V-4Q0 -10 -11 -4Z" fill="#F2B632"/>`;
  const [tx, ty] = PTS[G.at || 0] || PTS[0];
  return `<svg id="mapSvg" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-label="Peta Kampoeng Batik Jetis">
  <rect width="960" height="540" fill="#A7CF84"/><path d="M0 60Q200 30 360 90T700 70T960 90V0H0Z" fill="#8DBE6E"/>
  <path d="M-10 70Q200 40 380 100T720 80T970 104" stroke="url(#gWater)" stroke-width="44" fill="none"/><path d="M60 64q20-6 40 0M420 96q20-6 40 0M780 84q20-6 40 0" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>
  <g>${tebu}</g><text x="130" y="276" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="15" fill="#2F5A2A">Kebun tebu</text>
  <g>${tambak}</g><text x="572" y="532" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="15" fill="#1E4E66">Tambak bandeng &amp; udang</text>
  ${trees}
  <path d="M120 470Q200 470 300 380Q360 250 470 250Q580 250 650 360Q760 360 800 200" stroke="#E6C58C" stroke-width="30" fill="none" stroke-linecap="round"/>
  <path d="M120 470Q200 470 300 380Q360 250 470 250Q580 250 650 360Q760 360 800 200" stroke="#F6E2B4" stroke-width="4" stroke-dasharray="10 12" fill="none"/>
  ${SEG.slice(1).map((d, i) => `<path id="seg${i + 1}" d="${d}" fill="none"/>`).join('')}
  ${gapuraMini()}
  ${nodes}
  <g id="token" transform="translate(${tx} ${ty})"><g class="tok" transform="translate(0 -8)"><ellipse cx="0" cy="12" rx="12" ry="4" fill="rgba(0,0,0,.25)"/><circle r="17" fill="#fff" stroke="#F2B632" stroke-width="4"/><circle r="11" fill="${KULIT}"/>${tokHair}<circle cx="-4" cy="1" r="1.6" fill="#2A1A10"/><circle cx="4" cy="1" r="1.6" fill="#2A1A10"/><path d="M-3 5Q0 8 3 5" stroke="#8E2A1A" stroke-width="1.5" fill="none"/></g></g>
  </svg>`;
}
let walkingMap = false;
function openMap(autoLevel) {
  runId++; lv = null; dlgResolve = null; hentikanTimer(); show('scrMap'); closeCard();
  if (G.at === undefined) { G.at = 0; for (let n = 1; n <= 4; n++) if (levelSelesai(n)) G.at = n; }
  $('#mapWrap').innerHTML = mapSVG();
  $('#mapName').innerHTML = `<svg viewBox="0 0 24 24" width="1.1em" height="1.1em"><circle cx="12" cy="8" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>${esc(nama())}${kelasMode() ? ` · ${esc(G.sesi.kelasNama)}` : ''}`;
  $('#mapPoin').textContent = `${angka(G.aku.skor)} poin`;
  $('#btnPapan').hidden = !kelasMode();
  updRank();
  $('#kainMini').innerHTML = kainSVG();
  document.querySelectorAll('.node').forEach((el) => {
    const go = () => nodeClick(+el.dataset.l); el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  if (autoLevel) setTimeout(() => nodeClick(autoLevel), 350);
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600); }
async function nodeClick(n) {
  if (walkingMap) return; initAudio();
  if (!dimainkan(n)) { sfx('salah'); toast('Misi ini tidak dimainkan di kelasmu.'); return; }
  if (!terbuka(n)) { sfx('salah'); toast(`Selesaikan ${U.LOC[n - 1]} dulu, ya.`); return; }
  sfx('klik'); walkingMap = true; await walkToken(n); walkingMap = false; missionCard(n);
}
function walkToken(to) {
  return new Promise(async (res) => {
    const tok = document.getElementById('token'); const from = G.at || 0; if (from === to || !tok) { G.at = to; res(); return; }
    const dir = to > from ? 1 : -1; tok.classList.add('walking');
    for (let i = from; i !== to; i += dir) {
      const seg = document.getElementById('seg' + (dir > 0 ? i + 1 : i)); const Lh = seg.getTotalLength(); const dur = RM ? 60 : Lh / 260 * 1000;
      await new Promise((r) => { const t0 = performance.now(); let lastStep = 0; const f = (now) => { const k = Math.min(1, (now - t0) / dur); const p = seg.getPointAtLength(dir > 0 ? k * Lh : (1 - k) * Lh); tok.setAttribute('transform', `translate(${p.x} ${p.y})`); if (now - lastStep > 260) { sfx('langkah'); lastStep = now; } k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
    }
    tok.classList.remove('walking'); G.at = to; res();
  });
}
function missionCard(n) {
  const done = levelSelesai(n); const kunci = done && kelasMode();
  const c = card(`<button class="round merah x" id="tutup" aria-label="Tutup"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg></button>
  <h3 class="big">${esc(U.LOC[n])}</h3><div class="chiprow"><span class="tag">Misi</span><span class="tag k">Level ${n}: ${U.DIFF[n]}</span><span class="tag">${U.JUMLAH[n]} tantangan</span></div>
  <p>${esc(U.MISI[n])}</p>${done ? `<div class="stars">${[1, 2, 3].map((i) => starSVG(i <= (G.aku.level[n].bintang || 0))).join('')}</div><p>Poin dari misi ini: <b>${angka(G.aku.level[n].poin)}</b></p>` : ''}
  <div class="row">${kunci ? '<button class="btn alt" id="mulai">Tutup</button>' : `<button class="btn kuning" id="mulai">${done ? 'Main lagi (latihan)' : 'Mulai'}</button>`}</div>`, 480);
  c.querySelector('#tutup').onclick = closeCard;
  c.querySelector('#mulai').onclick = () => { closeCard(); if (kunci) return; sfx('klik'); playLevel(n); };
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
  G.kartu = 'papan'; const L = G.papan;
  const c = card(`<button class="round merah x" id="tutup" aria-label="Tutup"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg></button>
   <span class="ttl">Papan peringkat</span><p>${esc(G.sesi.kelasNama)}: ${L.length} pemain. Diperbarui langsung setiap ada jawaban.</p>
   ${podium(L)}${barisPapan(L, true)}`, 520);
  c.querySelector('#tutup').onclick = closeCard;
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
  const judul = dariGuru ? 'Permainan selesai' : (kelas ? 'Kamu menyelesaikan semua misi!' : 'Latihan selesai');
  const isi = kelas
    ? `<div class="saya"><div><b>#${i + 1}</b><span>dari ${L.length} pemain</span></div><div><b>${angka(aku.skor)}</b><span>poin</span></div><div><b>${aku.akurasi}%</b><span>benar di percobaan pertama</span></div></div>${podium(L)}${barisPapan(L, true)}
       ${!dariGuru ? '<p style="margin-top:.6em">Papan ini terus berubah sampai guru mengakhiri permainan.</p>' : ''}`
    : `<div class="saya"><div><b>${angka(G.aku.skor)}</b><span>poin</span></div></div><div class="kain-big">${kainSVG()}</div>`;
  const c = card(`<span class="ttl">${judul}</span>${kelas ? `<h3 class="big">${esc(G.sesi.kelasNama)}</h3>` : `<h3 class="big">${esc(nama())}</h3>`}${isi}
    <div class="row">${!dariGuru ? '<button class="btn alt" id="kp">Ke peta</button>' : ''}<button class="btn merah" id="kel">Keluar</button></div>`, 560);
  const kp = c.querySelector('#kp'); if (kp) kp.onclick = closeCard;
  c.querySelector('#kel').onclick = () => { API.keluar(); G.sesi = null; G.aku = null; openTitle(); };
}
function selesaiDariGuru() {
  if (!G.sesi) return; G.sesi.status = 'selesai'; runId++; closeOptions(); hentikanTimer(); $('#dlg').hidden = true;
  if ($('#scrMap').hidden) openMap(); hasilAkhir(true);
}

/* =================== KAIN =================== */
function kainSVG() {
  const P = [[1, 'pKuning', 'kembang'], [2, 'pMerah', 'beras'], [3, 'pBiru', 'bandeng'], [4, 'pHijau', 'udang']];
  let s = '<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" rx="6" fill="#FFFDF6"/><rect x="0" y="0" width="200" height="10" fill="url(#pHijau)"/><rect x="0" y="130" width="200" height="10" fill="url(#pHijau)"/>';
  P.forEach(([n, p, m], i) => {
    const x = 8 + (i % 2) * 96, y = 16 + Math.floor(i / 2) * 58; const done = levelSelesai(n);
    s += done ? `<rect x="${x}" y="${y}" width="88" height="52" rx="4" fill="url(#${p})"/><circle cx="${x + 44}" cy="${y + 26}" r="21" fill="#FFF6E4" opacity=".92"/><g transform="translate(${x + 27} ${y + 9}) scale(.53)">${IC[m]}</g>`
      : `<rect x="${x}" y="${y}" width="88" height="52" rx="4" fill="url(#pPensil)" stroke="#CDBB98" stroke-dasharray="4 3"/><g transform="translate(${x + 27} ${y + 9}) scale(.53)" opacity=".25" filter="url(#fGrey)">${IC[m]}</g>`;
  });
  return s + '</svg>';
}
function kainCard() {
  const c = card(`<span class="ttl">Kain batikmu</span><p>Setiap misi yang selesai menambah satu motif di kainmu.</p><div class="kain-big">${kainSVG()}</div><div class="row"><button class="btn alt" id="tt">Tutup</button></div>`, 480);
  c.querySelector('#tt').onclick = closeCard;
}

/* =================== JUDUL, NAMA, PENGATURAN =================== */
function renderTitleBg() { const b = $('#titleBg'); if (!b.firstChild) { b.innerHTML = `<div class="bgl">${BG.gapura()}</div>`; matikanSMIL(b); } }
function kodeDariURL() { try { return (new URLSearchParams(location.search).get('kode') || '').replace(/\D/g, '').slice(0, 6); } catch (e) { return ''; } }
function openTitle(kodeAwal) {
  runId++; lv = null; dlgResolve = null; closeCard(); hentikanTimer(); show('scrTitle'); renderTitleBg();
  const panel = $('#titlePanel'); panel.hidden = false;
  const saved = API.tersimpan();
  if (!ONLINE) {
    panel.innerHTML = `<p class="lead">Jelajahi Kampoeng Batik Jetis dan kumpulkan poin dari setiap jawaban benar.</p>
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
  on('tBaru', () => konfirmasi('Mulai dari awal?', 'Poin dan misi yang sudah selesai di perangkat ini akan dihapus.', 'Hapus dan mulai', () => { API.keluar(); openTitle(); }));
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
   <div class="fb no" id="fb" aria-live="polite"></div><div class="row"><button class="btn" id="ok">${mode === 'kelas' ? 'Masuk kelas' : 'Mulai petualangan'}</button></div>`, 460);
  c.querySelector('#tutup').onclick = closeCard;
  c.querySelectorAll('.ava').forEach((b) => { b.onclick = () => { g = b.dataset.g; sfx('klik'); c.querySelectorAll('.ava').forEach((x) => x.setAttribute('aria-pressed', x === b)); }; });
  const inp = c.querySelector('#inpNama'); inp.focus();
  inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') c.querySelector('#ok').click(); });
  let sibuk = false;
  c.querySelector('#ok').onclick = async () => {
    if (sibuk) return; const fb = c.querySelector('#fb'); const v = inp.value.trim();
    if (!v) { fb.textContent = 'Tulis namamu dulu, ya.'; inp.focus(); return; }
    sibuk = true; fb.textContent = '';
    let r; try { r = mode === 'kelas' ? await API.gabung({ pin, nama: v, g }) : await API.latihan({ nama: v, g }); } catch (e) { r = { ok: false, err: 'Tidak bisa terhubung ke server. Periksa internet, lalu coba lagi.' }; }
    sibuk = false;
    if (!r.ok) { fb.textContent = r.err; return; }
    closeCard(); sfx('benar'); masuk(r.sesi);
  };
}
function masuk(sesi) {
  G.sesi = sesi; G.aku = sesi.pemain; G.papan = sesi.papan || []; G.at = undefined; initAudio();
  setSkor(G.aku.skor);
  if (ONLINE && sesi.mode === 'kelas') { try { history.replaceState(null, '', '?kode=' + sesi.pin); } catch (e) {} }
  if (sesi.status === 'lobby') { lobbyCard(); return; }
  if (sesi.status === 'selesai') { openMap(); hasilAkhir(true); return; }
  const adaProgres = Object.keys(G.aku.level || {}).length > 0;
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
    if (s === 'selesai') selesaiDariGuru();
  },
  onSambung(sesi) { if (!G.sesi) return; G.sesi.status = sesi.status; G.papan = sesi.papan || G.papan; updRank(); },
  onKoneksi(ok) { $('#koneksi').hidden = ok; },
  onDikeluarkan() {
    runId++; closeOptions(); hentikanTimer(); G.sesi = null; G.aku = null; openTitle('');
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
  const c = card(`<span class="ttl">Keluar dari misi?</span><p>Poin dari tantangan yang sudah kamu jawab tetap tersimpan. Kamu bisa melanjutkan misi ini dari peta.</p><div class="row"><button class="btn alt" id="tetap">Tetap main</button><button class="btn merah" id="keluar">Keluar ke peta</button></div>`, 440);
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
