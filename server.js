/*
 * Server Petualangan Batik Jetis (online, banyak pemain).
 * - Guru membuat kelas di /guru.html dan mendapat kode 6 digit + link + QR.
 * - Siswa bergabung dengan kode atau link dan mengerjakan Subbab 1, 2, 3 secara berurutan.
 * - Subbab 1 langsung terbuka. Subbab 2 dan 3 dikunci dan hanya bisa dibuka guru
 *   dari dasbor, berlaku untuk semua siswa yang memakai kode kelas tersebut.
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
const UMUR_KELAS = (Number(process.env.UMUR_KELAS_HARI) || 120) * HARI; // satu semester
const UMUR_LATIHAN = 7 * HARI;
const VERSI = 2;
const NP = K.JUMLAH_PERTEMUAN;
const SEMUA_ID = []; for (let n = 1; n <= NP; n++) SEMUA_ID.push(...K.idsLevel(n));

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
  let lama = 0;
  for (const k of raw) {
    if (k.versi !== VERSI) { lama++; continue; } // data dari versi 4 misi tidak cocok dengan soal baru
    Object.values(k.pemain).forEach((p) => { p.online = 0; });
    kelas.set(k.pin, k);
  }
  console.log(`Memuat ${kelas.size} kelas dari ${FILE}` + (lama ? ` (${lama} kelas versi lama dilewati)` : ''));
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
    const aktif = Math.max(k.dibuat, k.aktif || 0);
    if ((k.mode === 'latihan' && now - aktif > UMUR_LATIHAN) || now - aktif > UMUR_KELAS) kelas.delete(pin);
  }
  simpan();
}
setInterval(bersihkan, 60 * 60 * 1000).unref();
bersihkan();

/* ---------------- bantuan ---------------- */
const acakHex = (n) => crypto.randomBytes(n).toString('hex');
function pinBaru() { let p; do { p = String(crypto.randomInt(100000, 1000000)); } while (kelas.has(p)); return p; }
function bersihNama(s) { return String(s || '').replace(/[<>"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); }
const HURUF = K.HURUF;

function nilaiLevel(p) {
  const o = {};
  for (let n = 1; n <= NP; n++) if (p.level[n] && p.level[n].selesai) o[n] = p.level[n].nilai;
  return o;
}
function progresPemain(p) {
  const o = {};
  for (let n = 1; n <= NP; n++) o[n] = SK.progres(p, K.idsLevel(n));
  return o;
}
function ringkas(p) {
  const nilai = nilaiLevel(p);
  return {
    id: p.id, nama: p.nama, g: p.g, skor: p.skor, benar: p.benar, dijawab: p.dijawab, akurasi: SK.akurasi(p), waktu: p.waktu,
    nilai, progres: progresPemain(p), misi: Object.keys(nilai).length, online: p.online > 0, tamat: !!p.selesaiSemua,
  };
}
function papan(k) { return SK.urutkan(Object.values(k.pemain)).map((p, i) => Object.assign(ringkas(p), { rank: i + 1 })); }
function peringkat(k, p) { const u = SK.urutkan(Object.values(k.pemain)); return { peringkat: u.indexOf(p) + 1, jumlah: u.length }; }
function statSoal(k) {
  const ps = Object.values(k.pemain);
  return SEMUA_ID.map((id) => {
    const inf = K.INDEKS[id]; let dijawab = 0, benar = 0; const sebaran = [0, 0, 0, 0];
    ps.forEach((p) => { const s = p.soal[id]; if (s && s.dijawab) { dijawab++; if (s.benar) benar++; if (s.j >= 0 && s.j < 4) sebaran[s.j]++; } });
    return { id, no: inf.no, level: inf.level, ranah: inf.ranah, kategori: inf.kategori, judul: inf.judul, kunci: HURUF[inf.kunci],
      dijawab, benar, persen: dijawab ? Math.round((benar / dijawab) * 100) : null, sebaran };
  });
}
function statPertemuan(k) {
  const ps = Object.values(k.pemain); const o = {};
  for (let n = 1; n <= NP; n++) {
    const sel = ps.filter((p) => p.level[n] && p.level[n].selesai);
    const ids = K.idsLevel(n);
    o[n] = { selesai: sel.length, mengerjakan: ps.filter((p) => !(p.level[n] && p.level[n].selesai) && SK.progres(p, ids) > 0).length,
      rata: sel.length ? Math.round(sel.reduce((a, p) => a + p.level[n].nilai, 0) / sel.length) : null };
  }
  return o;
}
function stateHost(k) {
  return { pin: k.pin, nama: k.nama, status: k.status, buka: k.buka, dibuat: k.dibuat, dimulai: k.dimulai, diakhiri: k.diakhiri,
    jumlahPertemuan: NP, soalPerPertemuan: K.idsLevel(1).length, totalSoal: SEMUA_ID.length,
    papan: papan(k), soal: statSoal(k), pertemuan: statPertemuan(k) };
}
function infoSesi(k, p) {
  return { pin: k.pin, mode: k.mode, kelasNama: k.nama, status: k.status, buka: k.buka, totalSoal: SEMUA_ID.length,
    pemain: { id: p.id, nama: p.nama, g: p.g, skor: p.skor, level: p.level, progres: progresPemain(p) }, papan: papan(k) };
}
/** Apakah subbab n boleh dikerjakan pemain p? Mengembalikan pesan bila tidak. */
function alasanTerkunci(k, p, n) {
  if (!(n >= 1 && n <= NP)) return 'Subbab tidak dikenal.';
  if (k.mode === 'kelas' && n > k.buka) return `${K.LOC[n]} masih dikunci. Tunggu gurumu membukanya.`;
  if (n > 1 && !(p.level[n - 1] && p.level[n - 1].selesai)) return `Selesaikan ${K.LOC[n - 1]} dulu.`;
  return '';
}

const antrean = new Map();
function siarkan(k) {
  k.aktif = Date.now();
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
app.get('/api/konten-umum', (req, res) => res.json(Object.assign(K.umum(), { POIN_BENAR: SK.POIN_BENAR })));
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
  const kepala = ['Peringkat', 'Nama'];
  for (let n = 1; n <= NP; n++) kepala.push('Nilai Subbab ' + n);
  kepala.push('Skor total', 'Benar', 'Dijawab', 'Dari', 'Waktu menjawab (menit)');
  SEMUA_ID.forEach((id) => kepala.push('S' + K.INDEKS[id].no));
  SEMUA_ID.forEach((id) => kepala.push('J' + K.INDEKS[id].no));
  const baris = [kepala.map(q).join(',')];
  const kunciBaris = ['', 'KUNCI'];
  for (let n = 1; n <= NP; n++) kunciBaris.push('');
  kunciBaris.push('', '', '', '', '');
  SEMUA_ID.forEach(() => kunciBaris.push(''));
  SEMUA_ID.forEach((id) => kunciBaris.push(HURUF[K.INDEKS[id].kunci]));
  SK.urutkan(Object.values(k.pemain)).forEach((p, i) => {
    const r = [i + 1, p.nama];
    for (let n = 1; n <= NP; n++) r.push(p.level[n] && p.level[n].selesai ? p.level[n].nilai : '');
    r.push(p.skor, p.benar, p.dijawab, SEMUA_ID.length, (p.waktu / 60000).toFixed(1).replace('.', ','));
    SEMUA_ID.forEach((id) => { const s = p.soal[id]; r.push(s && s.dijawab ? (s.benar ? 1 : 0) : ''); });
    SEMUA_ID.forEach((id) => { const s = p.soal[id]; r.push(s && s.dijawab ? HURUF[s.j] : ''); });
    baris.push(r.map(q).join(','));
  });
  baris.push(kunciBaris.map(q).join(','));
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
    const pin = pinBaru();
    const k = { versi: VERSI, pin, nama, mode: 'kelas', hostKey: acakHex(16), buka: 1, status: 'lobby', dibuat: Date.now(), aktif: Date.now(), dimulai: 0, diakhiri: 0, pemain: {}, diblokir: [] };
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
    if (k.status !== 'main') {
      k.status = 'main'; if (!k.dimulai) k.dimulai = Date.now(); k.diakhiri = 0;
      io.to('k:' + k.pin).emit('status', k.status); siarkan(k);
    }
    cb({ ok: true });
  });
  socket.on('hostAkhiri', (d, cb) => {
    cb = fn(cb); const k = milikHost(d); if (!k) return cb({ ok: false });
    if (k.status !== 'selesai') { k.status = 'selesai'; k.diakhiri = Date.now(); io.to('k:' + k.pin).emit('status', k.status); siarkan(k); }
    cb({ ok: true });
  });
  /** Guru membuka atau mengunci subbab. d.buka = subbab terakhir yang terbuka (1-3). */
  socket.on('hostKunci', (d, cb) => {
    cb = fn(cb); const k = milikHost(d); if (!k) return cb({ ok: false });
    const b = parseInt(d.buka, 10);
    if (!(b >= 1 && b <= NP)) return cb({ ok: false, err: 'Subbab tidak valid.' });
    if (k.buka !== b) {
      const naik = b > k.buka; k.buka = b;
      io.to('k:' + k.pin).emit('kunci', { buka: b, naik });
      siarkan(k);
    }
    cb({ ok: true, buka: k.buka });
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
    cb = fn(cb); d = d || {};
    const nama = bersihNama(d.nama); if (!nama) return cb({ ok: false, err: 'Tulis namamu dulu, ya.' });
    const pin = pinBaru();
    const k = { versi: VERSI, pin, nama: 'Latihan', mode: 'latihan', hostKey: null, buka: NP, status: 'main', dibuat: Date.now(), aktif: Date.now(), dimulai: Date.now(), diakhiri: 0, pemain: {}, diblokir: [] };
    const p = SK.pemainBaru(acakHex(6), acakHex(16), nama, d.g === 'l' ? 'l' : 'p', Date.now());
    k.pemain[p.id] = p; kelas.set(pin, k);
    pasang(k, p);
    cb({ ok: true, token: p.token, sesi: infoSesi(k, p) });
  });

  /*
   * Bergabung ke kelas.
   *  - token cocok      -> melanjutkan sesi lama di perangkat yang sama.
   *  - nama sudah ada   -> ditanya dulu: "Apakah ini kamu?" (d.lanjut = lanjutkan, d.baru = pemain baru).
   *    Ini supaya siswa yang ganti perangkat / browser di subbab berikutnya tetap bisa melanjutkan.
   */
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
      if (k.status === 'selesai') return cb({ ok: false, err: 'Permainan di kelas ini sudah ditutup oleh guru.' });
      const nama = bersihNama(d.nama); if (!nama) return cb({ ok: false, err: 'Tulis namamu dulu, ya.' });
      const sama = Object.values(k.pemain).find((x) => x.nama.toLowerCase() === nama.toLowerCase());
      if (sama && !d.baru) {
        if (!d.lanjut) {
          const nilai = nilaiLevel(sama);
          return cb({ ok: false, kode: 'namaAda', nama: sama.nama, online: sama.online > 0, misi: Object.keys(nilai).length, skor: sama.skor });
        }
        if (sama.online > 0) return cb({ ok: false, err: `Nama "${sama.nama}" sedang dipakai di perangkat lain. Tutup dulu di perangkat itu, atau pakai nama lain.` });
        p = sama;
        p.token = acakHex(16); // token lama tidak berlaku lagi
      } else {
        if (Object.keys(k.pemain).length >= MAKS_PEMAIN) return cb({ ok: false, err: 'Kelas sudah penuh.' });
        let n2 = nama, i = 2;
        const dipakai = () => Object.values(k.pemain).some((x) => x.nama.toLowerCase() === n2.toLowerCase());
        while (dipakai()) { n2 = nama.slice(0, 13) + ' ' + i; i++; }
        p = SK.pemainBaru(acakHex(6), acakHex(16), n2, d.g === 'l' ? 'l' : 'p', Date.now());
        k.pemain[p.id] = p;
      }
    }
    pasang(k, p);
    cb({ ok: true, token: p.token, sesi: infoSesi(k, p) });
  });

  socket.on('ambilLevel', (d, cb) => {
    cb = fn(cb); const { k, p } = sesiSaya();
    if (!p) return cb({ ok: false, err: 'Sesi tidak ditemukan. Muat ulang halaman.' });
    const n = parseInt(d && d.n, 10);
    if (k.status !== 'main') return cb({ ok: false, status: k.status, err: k.status === 'lobby' ? 'Tunggu guru memulai permainan.' : 'Permainan sudah ditutup oleh guru.' });
    const alasan = alasanTerkunci(k, p, n);
    if (alasan) return cb({ ok: false, kunci: true, buka: k.buka, err: alasan });
    if (p.level[n] && p.level[n].selesai) {
      if (k.mode === 'kelas') return cb({ ok: false, err: `${K.LOC[n]} sudah kamu selesaikan.` });
      SK.ulangLevel(p, n, K.idsLevel(n)); // latihan: boleh diulang
      siarkan(k);
    }
    const dijawab = {};
    K.idsLevel(n).forEach((id) => { const s = p.soal[id]; if (s && s.dijawab) dijawab[id] = { j: s.j, benar: s.benar }; });
    cb({ ok: true, beats: K.levelKlien(n), dijawab, skor: p.skor });
  });

  socket.on('mulaiSoal', (d) => {
    const { k, p } = sesiSaya(); if (!p || k.status !== 'main') return;
    const info = d && K.INDEKS[d.id]; if (!info || alasanTerkunci(k, p, info.level)) return;
    SK.mulai(p, info.id, Date.now());
  });

  socket.on('jawab', (d, cb) => {
    cb = fn(cb); const { k, p } = sesiSaya();
    if (!p) return cb({ ok: false, err: 'Sesi tidak ditemukan. Muat ulang halaman.' });
    if (k.status !== 'main') return cb({ ok: false, status: k.status, err: 'Permainan sudah ditutup oleh guru.' });
    const info = d && K.INDEKS[d.id];
    if (!info) return cb({ ok: false, err: 'Soal tidak dikenal.' });
    const alasan = alasanTerkunci(k, p, info.level);
    if (alasan) return cb({ ok: false, kunci: true, err: alasan });
    const h = K.periksa(info.id, d.jawaban);
    if (h.err) return cb({ ok: false, err: h.err });
    const r = SK.catat(p, info, d.jawaban, h.benar, Date.now());
    if (r.sudah) {
      // Soal ini sudah pernah dijawab (mis. dobel klik / sambungan ulang): kembalikan hasil yang tersimpan.
      return cb(Object.assign({ ok: true, sudah: true, benar: r.benar, j: r.j, kunci: h.kunci, pembahasan: h.pembahasan, poin: r.poin, skor: p.skor }, peringkat(k, p)));
    }
    siarkan(k);
    cb(Object.assign({ ok: true, j: d.jawaban }, h, r, { skor: p.skor }, peringkat(k, p)));
  });

  socket.on('selesaiLevel', (d, cb) => {
    cb = fn(cb); const { k, p } = sesiSaya();
    if (!p) return cb({ ok: false, err: 'Sesi tidak ditemukan.' });
    const n = parseInt(d && d.n, 10);
    if (!(n >= 1 && n <= NP)) return cb({ ok: false, err: 'Subbab tidak valid.' });
    const r = SK.selesaiLevel(p, n, K.idsLevel(n), Date.now());
    if (!r.ok) return cb(r);
    const tamat = n === NP;
    if (tamat && !p.selesaiSemua) p.selesaiSemua = Date.now();
    siarkan(k);
    cb(Object.assign(r, { skor: p.skor, tamat, buka: k.buka, mode: k.mode }, peringkat(k, p)));
  });

  socket.on('papan', (d, cb) => { cb = fn(cb); const { k } = sesiSaya(); cb(k ? { ok: true, papan: papan(k), status: k.status, buka: k.buka } : { ok: false }); });
  socket.on('keluar', () => lepas());
  socket.on('disconnect', () => lepas());
});

server.listen(PORT, () => {
  console.log(`Petualangan Batik Jetis berjalan di http://localhost:${PORT}`);
  console.log(`Dasbor guru: http://localhost:${PORT}/guru.html`);
});
