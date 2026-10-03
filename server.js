/*
 * Server Petualangan Batik Jetis (online, banyak pemain).
 * - Guru membuat kelas di /guru.html dan mendapat kode 6 digit + link + QR.
 * - Siswa bergabung dengan kode atau link, bermain sendiri-sendiri (gaya Quizizz).
 * - Semua jawaban diperiksa dan dinilai di server, lalu papan peringkat dikirim langsung.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const K = require('./shared/konten');
const SK = require('./shared/skor');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'kelas.json');
const MAKS_PEMAIN = Number(process.env.MAKS_PEMAIN) || 200;
const HARI = 24 * 60 * 60 * 1000;

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));

const server = http.createServer(app);
const io = new Server(server, { pingInterval: 20000, pingTimeout: 25000, maxHttpBufferSize: 1e5 });

/* ---------------- penyimpanan ---------------- */
const kelas = new Map();
try {
  const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  for (const k of raw) { Object.values(k.pemain).forEach((p) => { p.online = 0; }); kelas.set(k.pin, k); }
  console.log(`Memuat ${kelas.size} kelas dari ${FILE}`);
} catch (e) { /* belum ada data */ }

let tSimpan = null;
function simpan() {
  clearTimeout(tSimpan);
  tSimpan = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify([...kelas.values()]));
      fs.renameSync(tmp, FILE);
    } catch (e) { console.error('Gagal menyimpan data:', e.message); }
  }, 1000);
}
function bersihkan() {
  const now = Date.now();
  for (const [pin, k] of kelas) {
    const umur = now - k.dibuat;
    if ((k.mode === 'latihan' && umur > HARI) || umur > 14 * HARI) kelas.delete(pin);
  }
  simpan();
}
setInterval(bersihkan, 60 * 60 * 1000).unref();
bersihkan();

/* ---------------- bantuan ---------------- */
const acakHex = (n) => crypto.randomBytes(n).toString('hex');
function pinBaru() { let p; do { p = String(crypto.randomInt(100000, 1000000)); } while (kelas.has(p)); return p; }
function bersihNama(s) { return String(s || '').replace(/[<>"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); }
function idsKelas(k) { const ids = []; for (let n = 1; n <= k.sampaiLevel; n++) ids.push(...K.idsLevel(n)); return ids; }

function ringkas(p) {
  const lv = [1, 2, 3, 4].filter((n) => p.level[n] && p.level[n].selesai);
  return {
    id: p.id, nama: p.nama, g: p.g, skor: p.skor, akurasi: SK.akurasi(p), selesaiSoal: p.soalSelesai,
    misi: lv.length, bintang: Object.fromEntries(lv.map((n) => [n, p.level[n].bintang])),
    online: p.online > 0, tamat: !!p.selesaiSemua,
  };
}
function papan(k) { return SK.urutkan(Object.values(k.pemain)).map((p, i) => Object.assign(ringkas(p), { rank: i + 1 })); }
function peringkat(k, p) { const u = SK.urutkan(Object.values(k.pemain)); return { peringkat: u.indexOf(p) + 1, jumlah: u.length }; }
function statSoal(k) {
  const ps = Object.values(k.pemain);
  return idsKelas(k).map((id) => {
    const inf = K.INDEKS[id]; let dijawab = 0, benarPertama = 0, percobaan = 0;
    ps.forEach((p) => { const s = p.soal[id]; if (s && s.selesai) { dijawab++; percobaan += s.percobaan; if (s.percobaan === 1) benarPertama++; } });
    return { id, level: inf.level, tipe: inf.tipe, judul: inf.judul, dijawab, benarPertama, rataPercobaan: dijawab ? +(percobaan / dijawab).toFixed(1) : 0 };
  });
}
function stateHost(k) {
  return { pin: k.pin, nama: k.nama, status: k.status, sampaiLevel: k.sampaiLevel, dibuat: k.dibuat, dimulai: k.dimulai, diakhiri: k.diakhiri,
    totalSoal: idsKelas(k).length, papan: papan(k), soal: statSoal(k) };
}
function infoSesi(k, p) {
  return { pin: k.pin, mode: k.mode, kelasNama: k.nama, status: k.status, sampaiLevel: k.sampaiLevel, totalSoal: idsKelas(k).length,
    pemain: { id: p.id, nama: p.nama, g: p.g, skor: p.skor, level: p.level }, papan: papan(k) };
}

const antrean = new Map();
function siarkan(k) {
  simpan();
  if (antrean.has(k.pin)) return;
  antrean.set(k.pin, setTimeout(() => {
    antrean.delete(k.pin);
    if (!kelas.has(k.pin)) return;
    io.to('k:' + k.pin).emit('papan', papan(k));
    io.to('h:' + k.pin).emit('kelas', stateHost(k));
  }, 300));
}

/* ---------------- REST ---------------- */
app.get('/healthz', (req, res) => res.json({ ok: true, kelas: kelas.size }));
app.get('/api/konten-umum', (req, res) => res.json(Object.assign(K.umum(), { BATAS: SK.BATAS, DASAR: SK.DASAR })));
app.get('/api/qr/:pin.png', async (req, res) => {
  const k = kelas.get(req.params.pin);
  if (!k) return res.status(404).end();
  const link = `${req.protocol}://${req.get('host')}/?kode=${k.pin}`;
  try {
    const buf = await QRCode.toBuffer(link, { width: 420, margin: 1, color: { dark: '#2A1A10', light: '#FFFFFF' } });
    res.type('png').set('Cache-Control', 'public, max-age=3600').send(buf);
  } catch (e) { res.status(500).end(); }
});
app.get('/api/kelas/:pin/hasil.csv', (req, res) => {
  const k = kelas.get(req.params.pin);
  if (!k || !k.hostKey || req.query.kunci !== k.hostKey) return res.status(403).send('Kunci guru salah atau kelas tidak ditemukan.');
  const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const total = idsKelas(k).length;
  const baris = [['Peringkat', 'Nama', 'Skor', 'Ketepatan (%)', 'Tantangan selesai', 'Dari', 'Misi selesai', 'Bintang L1', 'Bintang L2', 'Bintang L3', 'Bintang L4'].map(q).join(',')];
  papan(k).forEach((p) => baris.push([p.rank, p.nama, p.skor, p.akurasi, p.selesaiSoal, total, p.misi, p.bintang[1] || '', p.bintang[2] || '', p.bintang[3] || '', p.bintang[4] || ''].map(q).join(',')));
  res.set('Content-Disposition', `attachment; filename="hasil-${k.pin}.csv"`).type('text/csv; charset=utf-8').send('﻿' + baris.join('\r\n'));
});

/* ---------------- Socket.IO ---------------- */
io.on('connection', (socket) => {
  const fn = (cb) => (typeof cb === 'function' ? cb : () => {});
  const milikHost = (d) => {
    const k = d && kelas.get(String(d.pin));
    if (!k || k.mode !== 'kelas' || !d.hostKey || d.hostKey !== k.hostKey) return null;
    return k;
  };
  const sesiSaya = () => {
    const d = socket.data; if (!d.pin) return {};
    const k = kelas.get(d.pin); if (!k) return {};
    return { k, p: d.pid ? k.pemain[d.pid] : null };
  };
  function lepas() {
    const { k, p } = sesiSaya();
    if (k && p) { p.online = Math.max(0, (p.online || 0) - 1); siarkan(k); }
    if (socket.data.pin) socket.leave('k:' + socket.data.pin);
    if (socket.data.pid) socket.leave('p:' + socket.data.pid);
    socket.data.pin = null; socket.data.pid = null;
  }
  function pasang(k, p) {
    if (socket.data.pid === p.id && socket.data.pin === k.pin) return;
    if (socket.data.pid) lepas();
    socket.data.pin = k.pin; socket.data.pid = p.id;
    socket.join('k:' + k.pin); socket.join('p:' + p.id);
    p.online = (p.online || 0) + 1;
    siarkan(k);
  }

  /* ----- guru ----- */
  socket.on('buatKelas', (d, cb) => {
    cb = fn(cb);
    const nama = bersihNama(d && d.nama) || 'Kelas Batik Jetis';
    let s = parseInt(d && d.sampaiLevel, 10); if (!(s >= 1 && s <= 4)) s = 4;
    const pin = pinBaru();
    const k = { pin, nama, mode: 'kelas', hostKey: acakHex(16), sampaiLevel: s, status: 'lobby', dibuat: Date.now(), dimulai: 0, diakhiri: 0, pemain: {}, diblokir: [] };
    kelas.set(pin, k); simpan();
    cb({ ok: true, pin, hostKey: k.hostKey });
  });
  socket.on('hostMasuk', (d, cb) => {
    cb = fn(cb); const k = milikHost(d);
    if (!k) return cb({ ok: false, err: 'Kelas tidak ditemukan atau kunci guru salah.' });
    socket.join('h:' + k.pin);
    cb({ ok: true, kelas: stateHost(k) });
  });
  socket.on('hostMulai', (d, cb) => {
    cb = fn(cb); const k = milikHost(d); if (!k) return cb({ ok: false });
    if (k.status === 'lobby') { k.status = 'main'; k.dimulai = Date.now(); io.to('k:' + k.pin).emit('status', k.status); siarkan(k); }
    cb({ ok: true });
  });
  socket.on('hostAkhiri', (d, cb) => {
    cb = fn(cb); const k = milikHost(d); if (!k) return cb({ ok: false });
    if (k.status !== 'selesai') { k.status = 'selesai'; k.diakhiri = Date.now(); io.to('k:' + k.pin).emit('status', k.status); siarkan(k); }
    cb({ ok: true });
  });
  socket.on('hostKeluarkan', (d, cb) => {
    cb = fn(cb); const k = milikHost(d); if (!k) return cb({ ok: false });
    const p = k.pemain[d.id];
    if (p) {
      k.diblokir.push(p.token); delete k.pemain[p.id];
      io.to('p:' + p.id).emit('dikeluarkan');
      io.in('p:' + p.id).socketsLeave(['k:' + k.pin, 'p:' + p.id]);
      siarkan(k);
    }
    cb({ ok: true });
  });

  /* ----- pemain ----- */
  socket.on('buatLatihan', (d, cb) => {
    cb = fn(cb);
    const nama = bersihNama(d && d.nama); if (!nama) return cb({ ok: false, err: 'Tulis namamu dulu, ya.' });
    const pin = pinBaru();
    const k = { pin, nama: 'Latihan', mode: 'latihan', hostKey: null, sampaiLevel: 4, status: 'main', dibuat: Date.now(), dimulai: Date.now(), diakhiri: 0, pemain: {}, diblokir: [] };
    const p = SK.pemainBaru(acakHex(6), acakHex(16), nama, d.g === 'l' ? 'l' : 'p', Date.now());
    k.pemain[p.id] = p; kelas.set(pin, k);
    pasang(k, p);
    cb({ ok: true, token: p.token, sesi: infoSesi(k, p) });
  });

  socket.on('gabung', (d, cb) => {
    cb = fn(cb); d = d || {};
    const pin = String(d.pin || '').replace(/\D/g, '');
    const k = kelas.get(pin);
    if (!k) return cb({ ok: false, err: 'Kode permainan tidak ditemukan. Periksa lagi kodenya.' });
    let p = null;
    if (d.token) {
      p = Object.values(k.pemain).find((x) => x.token === d.token) || null;
      if (!p && k.diblokir.includes(d.token)) return cb({ ok: false, err: 'Kamu sudah dikeluarkan dari kelas ini oleh guru.' });
      if (!p && !d.nama) return cb({ ok: false, err: 'Sesi lamamu tidak ditemukan. Gabung lagi dengan namamu.' });
    }
    if (!p) {
      if (k.mode !== 'kelas') return cb({ ok: false, err: 'Kode permainan tidak ditemukan. Periksa lagi kodenya.' });
      if (k.status === 'selesai') return cb({ ok: false, err: 'Permainan di kelas ini sudah berakhir.' });
      const nama = bersihNama(d.nama); if (!nama) return cb({ ok: false, err: 'Tulis namamu dulu, ya.' });
      if (Object.keys(k.pemain).length >= MAKS_PEMAIN) return cb({ ok: false, err: 'Kelas sudah penuh.' });
      let n2 = nama, i = 2;
      const dipakai = () => Object.values(k.pemain).some((x) => x.nama.toLowerCase() === n2.toLowerCase());
      while (dipakai()) { n2 = nama.slice(0, 13) + ' ' + i; i++; }
      p = SK.pemainBaru(acakHex(6), acakHex(16), n2, d.g === 'l' ? 'l' : 'p', Date.now());
      k.pemain[p.id] = p;
    }
    pasang(k, p);
    cb({ ok: true, token: p.token, sesi: infoSesi(k, p) });
  });

  socket.on('ambilLevel', (d, cb) => {
    cb = fn(cb); const { k, p } = sesiSaya();
    if (!p) return cb({ ok: false, err: 'Sesi tidak ditemukan. Muat ulang halaman.' });
    const n = parseInt(d && d.n, 10);
    if (k.status !== 'main') return cb({ ok: false, status: k.status, err: k.status === 'lobby' ? 'Tunggu guru memulai permainan.' : 'Permainan sudah berakhir.' });
    if (!(n >= 1 && n <= k.sampaiLevel)) return cb({ ok: false, err: 'Level ini tidak dimainkan di kelas ini.' });
    if (n > 1 && !(p.level[n - 1] && p.level[n - 1].selesai)) return cb({ ok: false, err: `Selesaikan ${K.LOC[n - 1]} dulu.` });
    if (k.mode === 'kelas' && p.level[n] && p.level[n].selesai) return cb({ ok: false, err: 'Misi ini sudah kamu selesaikan.' });
    cb({ ok: true, beats: K.levelKlien(n) });
  });

  socket.on('mulaiSoal', (d) => {
    const { k, p } = sesiSaya(); if (!p || k.status !== 'main') return;
    const info = d && K.INDEKS[d.id]; if (!info || info.level > k.sampaiLevel) return;
    SK.mulai(p, info.id, Date.now());
  });

  socket.on('jawab', (d, cb) => {
    cb = fn(cb); const { k, p } = sesiSaya();
    if (!p) return cb({ ok: false, err: 'Sesi tidak ditemukan. Muat ulang halaman.' });
    if (k.status !== 'main') return cb({ ok: false, status: k.status, err: 'Permainan sudah berakhir.' });
    const info = d && K.INDEKS[d.id];
    if (!info || info.level > k.sampaiLevel) return cb({ ok: false, err: 'Soal tidak dikenal.' });
    if (info.level > 1 && !(p.level[info.level - 1] && p.level[info.level - 1].selesai)) return cb({ ok: false, err: 'Misi ini belum terbuka.' });
    const h = K.periksa(info.id, d.jawaban);
    if (h.err) return cb({ ok: false, err: h.err });
    const r = SK.catat(p, info, h.benar, Date.now());
    siarkan(k);
    cb(Object.assign({ ok: true }, h, r, { skor: p.skor }, peringkat(k, p)));
  });

  socket.on('selesaiLevel', (d, cb) => {
    cb = fn(cb); const { k, p } = sesiSaya();
    if (!p) return cb({ ok: false, err: 'Sesi tidak ditemukan.' });
    const n = parseInt(d && d.n, 10);
    if (!(n >= 1 && n <= k.sampaiLevel)) return cb({ ok: false, err: 'Level tidak valid.' });
    const r = SK.selesaiLevel(p, n, K.idsLevel(n));
    if (!r.ok) return cb(r);
    const tamat = n === k.sampaiLevel;
    if (tamat && !p.selesaiSemua) p.selesaiSemua = Date.now();
    siarkan(k);
    cb(Object.assign(r, { skor: p.skor, tamat }, peringkat(k, p)));
  });

  socket.on('papan', (d, cb) => { cb = fn(cb); const { k } = sesiSaya(); cb(k ? { ok: true, papan: papan(k), status: k.status } : { ok: false }); });
  socket.on('keluar', () => lepas());
  socket.on('disconnect', () => lepas());
});

server.listen(PORT, () => {
  console.log(`Petualangan Batik Jetis berjalan di http://localhost:${PORT}`);
  console.log(`Dasbor guru: http://localhost:${PORT}/guru.html`);
});
