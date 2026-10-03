/*
 * Uji beban sederhana: membuat satu kelas dan menjalankan banyak "siswa bot" bersamaan.
 * Pakai:  node tools/uji-bot.js [jumlahBot] [urlServer]
 * Contoh: node tools/uji-bot.js 30 http://localhost:3000
 * Bot menjawab dengan tingkat ketepatan berbeda-beda supaya papan peringkat terisi bervariasi.
 * Opsi env BIARKAN=1 membuat kelas tetap berjalan (tidak diakhiri) agar bisa dilihat di dasbor.
 */
'use strict';
const { io } = require('socket.io-client');
const K = require('../shared/konten');

const JUMLAH = Number(process.argv[2]) || 12;
const URL = process.argv[3] || 'http://localhost:3000';
const NAMA = ['Aisyah', 'Bima', 'Citra', 'Dimas', 'Elok', 'Fajar', 'Gita', 'Hasan', 'Intan', 'Joko', 'Kirana', 'Lutfi', 'Maya', 'Nanda', 'Oki', 'Putri', 'Rafi', 'Salsa', 'Tegar', 'Umi', 'Vina', 'Wulan', 'Yoga', 'Zahra'];
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const sambung = () => new Promise((res) => { const s = io(URL, { transports: ['websocket'], forceNew: true }); s.on('connect', () => res(s)); });
const kirim = (s, ev, d) => new Promise((res, rej) => s.timeout(10000).emit(ev, d, (e, r) => (e ? rej(e) : res(r))));

function jawabanBenar(b) {
  const asli = K.INDEKS[b.id].beat;
  if (b.t === 'quiz' || b.t === 'choice') return asli.opts.findIndex((o) => o.ok);
  if (b.t === 'pick') return asli.items.map((x, i) => (x[2] ? i : -1)).filter((i) => i >= 0);
  if (b.t === 'order') return asli.steps.map((_, i) => 's' + i);
}
function jawabanSalah(b) {
  const asli = K.INDEKS[b.id].beat;
  if (b.t === 'quiz' || b.t === 'choice') return asli.opts.findIndex((o) => !o.ok);
  if (b.t === 'pick') return [asli.items.findIndex((x) => !x[2])];
  if (b.t === 'order') { const a = asli.steps.map((_, i) => 's' + i); [a[0], a[1]] = [a[1], a[0]]; return a; }
}

async function siswa(i, pin, ketepatan) {
  const s = await sambung();
  const r = await kirim(s, 'gabung', { pin, nama: NAMA[i % NAMA.length] + (i >= NAMA.length ? ' ' + Math.floor(i / NAMA.length) : ''), g: i % 2 ? 'l' : 'p' });
  if (!r.ok) throw new Error(r.err);
  return { s, nama: r.sesi.pemain.nama, ketepatan };
}
async function main(bot, sampai) {
  for (let n = 1; n <= sampai; n++) {
    const L = await kirim(bot.s, 'ambilLevel', { n });
    if (!L.ok) { console.log(bot.nama, 'gagal ambil level', L.err); return; }
    for (const b of L.beats) {
      if (!K.SCORED.includes(b.t)) continue;
      bot.s.emit('mulaiSoal', { id: b.id });
      await tidur(300 + Math.random() * 1500);
      for (;;) {
        const benar = Math.random() < bot.ketepatan;
        const r = await kirim(bot.s, 'jawab', { id: b.id, jawaban: benar ? jawabanBenar(b) : jawabanSalah(b) });
        if (!r.ok) { console.log(bot.nama, r.err); return; }
        if (r.benar) break;
        await tidur(200 + Math.random() * 500);
      }
    }
    const sl = await kirim(bot.s, 'selesaiLevel', { n });
    if (!sl.ok) { console.log(bot.nama, 'selesaiLevel gagal', sl.err); return; }
  }
}

(async () => {
  const guru = await sambung();
  const k = await kirim(guru, 'buatKelas', { nama: 'Kelas Uji', sampaiLevel: 4 });
  await kirim(guru, 'hostMasuk', { pin: k.pin, hostKey: k.hostKey });
  console.log(`Kelas dibuat. Kode: ${k.pin}`);
  console.log(`Dasbor: ${URL}/guru.html  (kunci guru: ${k.hostKey})`);
  const bots = await Promise.all(Array.from({ length: JUMLAH }, (_, i) => siswa(i, k.pin, 0.35 + (i / Math.max(1, JUMLAH - 1)) * 0.6)));
  console.log(`${bots.length} siswa bergabung. Memulai permainan...`);
  await kirim(guru, 'hostMulai', { pin: k.pin, hostKey: k.hostKey });
  const t0 = Date.now();
  await Promise.all(bots.map((b, i) => main(b, i % 3 === 0 ? 2 : 4)));
  console.log(`Semua bot selesai menjawab dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik.`);
  const st = await kirim(guru, 'hostMasuk', { pin: k.pin, hostKey: k.hostKey });
  console.log('\nPapan peringkat:');
  st.kelas.papan.forEach((p) => console.log(`${String(p.rank).padStart(3)}. ${p.nama.padEnd(14)} ${String(p.skor).padStart(6)} poin  ketepatan ${p.akurasi}%  tantangan ${p.selesaiSoal}/${st.kelas.totalSoal}`));
  const urut = st.kelas.papan.every((p, i, a) => i === 0 || a[i - 1].skor >= p.skor);
  console.log(`\nUrutan skor menurun: ${urut ? 'YA' : 'TIDAK'}`);
  if (!process.env.BIARKAN) await kirim(guru, 'hostAkhiri', { pin: k.pin, hostKey: k.hostKey });
  console.log(JSON.stringify({ pin: k.pin, hostKey: k.hostKey }));
  bots.forEach((b) => b.s.close()); guru.close();
})().catch((e) => { console.error('Uji gagal:', e); process.exit(1); });
