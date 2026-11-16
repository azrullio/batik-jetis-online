/*
 * Uji beban & alur: membuat satu kelas dan menjalankan banyak "siswa bot" bersamaan.
 * Pakai:  node tools/uji-bot.js [jumlahBot] [urlServer]
 * Contoh: node tools/uji-bot.js 30 http://localhost:3000
 * Alur yang diuji:
 *   1. Semua bot mengerjakan Subbab 1.
 *   2. Bot mencoba Subbab 2 -> harus ditolak karena masih dikunci guru.
 *   3. Guru membuka Subbab 2 -> bot menerima pemberitahuan 'kunci' lalu mengerjakannya.
 *   4. Guru membuka Subbab 3 -> sebagian bot mengerjakannya.
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
const salah = (k) => (k + 1 + Math.floor(Math.random() * 3)) % 4;
const cek = (kondisi, pesan) => { if (!kondisi) { console.error('GAGAL:', pesan); process.exitCode = 1; } };

async function siswa(i, pin, ketepatan) {
  const s = await sambung();
  const r = await kirim(s, 'gabung', { pin, nama: NAMA[i % NAMA.length] + (i >= NAMA.length ? ' ' + Math.floor(i / NAMA.length) : ''), g: i % 2 ? 'l' : 'p' });
  if (!r.ok) throw new Error(r.err);
  const bot = { s, nama: r.sesi.pemain.nama, ketepatan, kunci: [] };
  s.on('kunci', (d) => bot.kunci.push(d.buka));
  return bot;
}
async function mainkan(bot, n) {
  const L = await kirim(bot.s, 'ambilLevel', { n });
  if (!L.ok) return L;
  for (const b of L.beats) {
    if (b.t !== 'soal' || L.dijawab[b.id]) continue;
    bot.s.emit('mulaiSoal', { id: b.id });
    await tidur(200 + Math.random() * 800);
    const kunci = K.INDEKS[b.id].kunci;
    const benar = Math.random() < bot.ketepatan;
    const r = await kirim(bot.s, 'jawab', { id: b.id, jawaban: benar ? kunci : salah(kunci) });
    if (!r.ok) return r;
    cek(r.benar === benar && r.poin === (benar ? 10 : 0), `${bot.nama} poin soal ${b.id}`);
    const ulang = await kirim(bot.s, 'jawab', { id: b.id, jawaban: kunci });
    cek(ulang.sudah && ulang.poin === r.poin, `${bot.nama} soal ${b.id} bisa dijawab dua kali`);
  }
  return kirim(bot.s, 'selesaiLevel', { n });
}

(async () => {
  const guru = await sambung();
  const k = await kirim(guru, 'buatKelas', { nama: 'Kelas Uji' });
  const host = { pin: k.pin, hostKey: k.hostKey };
  await kirim(guru, 'hostMasuk', host);
  console.log(`Kelas dibuat. Kode: ${k.pin}`);
  console.log(`Dasbor: ${URL}/guru.html  (kunci guru: ${k.hostKey})`);
  const bots = await Promise.all(Array.from({ length: JUMLAH }, (_, i) => siswa(i, k.pin, 0.35 + (i / Math.max(1, JUMLAH - 1)) * 0.6)));
  console.log(`${bots.length} siswa bergabung.`);

  const lobi = await kirim(bots[0].s, 'ambilLevel', { n: 1 });
  cek(!lobi.ok && lobi.status === 'lobby', 'Subbab 1 harus menunggu guru memulai');
  await kirim(guru, 'hostMulai', host);
  const t0 = Date.now();

  const h1 = await Promise.all(bots.map((b) => mainkan(b, 1)));
  cek(h1.every((r) => r.ok && r.nilai >= 0 && r.nilai <= 100), 'Semua bot menyelesaikan Subbab 1');
  console.log(`Subbab 1 selesai. Nilai: ${h1.map((r) => r.nilai).join(', ')}`);

  const terkunci = await kirim(bots[0].s, 'ambilLevel', { n: 2 });
  cek(!terkunci.ok && terkunci.kunci, 'Subbab 2 harus terkunci sebelum dibuka guru');
  console.log(`Coba Subbab 2 sebelum dibuka: ${terkunci.err}`);
  const ulang1 = await kirim(bots[0].s, 'ambilLevel', { n: 1 });
  cek(!ulang1.ok, 'Subbab 1 tidak boleh diulang di mode kelas');

  await kirim(guru, 'hostKunci', Object.assign({ buka: 2 }, host));
  await tidur(300);
  cek(bots.every((b) => b.kunci.includes(2)), 'Semua bot menerima pemberitahuan Subbab 2 dibuka');
  const h2 = await Promise.all(bots.map((b) => mainkan(b, 2)));
  cek(h2.every((r) => r.ok), 'Semua bot menyelesaikan Subbab 2');

  await kirim(guru, 'hostKunci', Object.assign({ buka: 3 }, host));
  const h3 = await Promise.all(bots.map((b, i) => (i % 3 === 0 ? { ok: true, lewat: true } : mainkan(b, 3))));
  cek(h3.every((r) => r.ok), 'Bot menyelesaikan Subbab 3');
  console.log(`Semua bot selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik.`);

  const st = await kirim(guru, 'hostMasuk', host);
  console.log('\nPapan peringkat:');
  st.kelas.papan.forEach((p) => console.log(`${String(p.rank).padStart(3)}. ${p.nama.padEnd(14)} ${String(p.skor).padStart(4)} poin  P1 ${p.nilai[1] ?? '-'}  P2 ${p.nilai[2] ?? '-'}  P3 ${p.nilai[3] ?? '-'}`));
  const urut = st.kelas.papan.every((p, i, a) => i === 0 || a[i - 1].skor > p.skor || (a[i - 1].skor === p.skor && a[i - 1].waktu <= p.waktu));
  cek(urut, 'Urutan papan peringkat');
  cek(st.kelas.papan.every((p) => p.skor === Object.values(p.nilai).reduce((a, b) => a + b, 0)), 'Skor total = jumlah nilai subbab');
  console.log(`\nUrutan skor menurun: ${urut ? 'YA' : 'TIDAK'}`);
  console.log('Subbab:', JSON.stringify(st.kelas.pertemuan));
  const s1 = st.kelas.soal[0];
  console.log(`Soal 1: ${s1.benar}/${s1.dijawab} benar, sebaran A-D ${s1.sebaran.join('/')}, kunci ${s1.kunci}`);

  const csv = await fetch(`${URL}/api/kelas/${k.pin}/hasil.csv?kunci=${k.hostKey}`).then((r) => r.text());
  const baris = csv.trim().split('\r\n');
  cek(baris.length === bots.length + 2, 'CSV berisi semua siswa + baris kunci');
  console.log(`CSV: ${baris.length} baris, ${baris[0].split(',').length} kolom`);

  if (!process.env.BIARKAN) await kirim(guru, 'hostAkhiri', host);
  console.log(JSON.stringify(host));
  bots.forEach((b) => b.s.close()); guru.close();
  console.log(process.exitCode ? '\nADA PEMERIKSAAN YANG GAGAL' : '\nSemua pemeriksaan lolos.');
})().catch((e) => { console.error('Uji gagal:', e); process.exit(1); });
