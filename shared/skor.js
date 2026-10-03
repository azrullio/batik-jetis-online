/*
 * Sistem skor ala Quizizz.
 *  - Poin dasar naik per level (makin sulit, makin besar).
 *  - Bonus kecepatan hanya untuk jawaban benar di percobaan pertama.
 *  - Bonus beruntun untuk jawaban benar pertama yang berturut-turut.
 *  - Benar di percobaan kedua: 50% poin dasar, ketiga dan seterusnya: 20%.
 * Dipakai oleh server (versi online) dan oleh mode latihan offline.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SKOR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DASAR = { 1: 600, 2: 700, 3: 800, 4: 900 };
  const BATAS = { quiz: 30000, choice: 30000, pick: 60000, order: 60000 }; // ms untuk bonus kecepatan
  const BONUS_CEPAT = 300;
  const BONUS_BERUNTUN = 100;
  const BONUS_BERUNTUN_MAKS = 300;

  function pemainBaru(id, token, nama, g, now) {
    return { id, token, nama, g, skor: 0, beruntun: 0, benarPertama: 0, soalSelesai: 0, soal: {}, level: {}, gabung: now, terakhir: now, selesaiSemua: 0, online: 0 };
  }

  function catatanSoal(p, id) {
    return p.soal[id] || (p.soal[id] = { percobaan: 0, mulai: 0, selesai: false, poin: 0 });
  }

  /** Dipanggil saat soal mulai tampil di layar pemain. */
  function mulai(p, id, now) {
    const s = catatanSoal(p, id);
    if (!s.selesai && !s.percobaan && !s.mulai) s.mulai = now;
  }

  /** Mencatat satu jawaban. Setiap soal hanya dinilai sekali (saat pertama kali benar). */
  function catat(p, info, benar, now) {
    const s = catatanSoal(p, info.id);
    if (s.selesai) return { poin: 0, sudah: true, percobaan: s.percobaan };
    s.percobaan++;
    p.terakhir = now;
    if (!benar) { p.beruntun = 0; return { poin: 0, percobaan: s.percobaan }; }

    const pertama = s.percobaan === 1;
    p.beruntun = pertama ? (p.beruntun || 0) + 1 : 0;
    const penuh = DASAR[info.level] || 600;
    const dasar = pertama ? penuh : Math.round(penuh * (s.percobaan === 2 ? 0.5 : 0.2));
    const batas = BATAS[info.tipe] || 30000;
    const ms = s.mulai ? Math.max(0, now - s.mulai) : batas;
    const cepat = pertama ? Math.round(BONUS_CEPAT * Math.max(0, 1 - ms / batas)) : 0;
    const beruntun = pertama ? Math.min(BONUS_BERUNTUN_MAKS, Math.max(0, (p.beruntun - 1) * BONUS_BERUNTUN)) : 0;
    const poin = dasar + cepat + beruntun;

    s.selesai = true; s.poin = poin;
    p.skor += poin; p.soalSelesai++;
    if (pertama) p.benarPertama++;
    return { poin, dasar, cepat, beruntun, percobaan: s.percobaan, deret: p.beruntun };
  }

  /** Menutup satu level: semua tantangan harus sudah benar. */
  function selesaiLevel(p, n, ids) {
    if (!ids.length || ids.some((id) => !(p.soal[id] && p.soal[id].selesai))) return { ok: false, err: 'Masih ada tantangan yang belum selesai.' };
    const nilai = ids.map((id) => { const a = p.soal[id].percobaan; return a === 1 ? 3 : a === 2 ? 2 : 1; });
    const rasio = nilai.reduce((a, b) => a + b, 0) / (3 * ids.length);
    const bintang = rasio >= 0.9 ? 3 : rasio >= 0.6 ? 2 : 1;
    const poin = ids.reduce((a, id) => a + p.soal[id].poin, 0);
    p.level[n] = { selesai: true, bintang, poin };
    return { ok: true, bintang, poin };
  }

  /** Urutan papan peringkat: skor, lalu jumlah benar pertama, lalu siapa yang lebih dulu mencapainya. */
  function urutkan(arr) {
    return arr.slice().sort((a, b) =>
      (b.skor - a.skor) || (b.benarPertama - a.benarPertama) || ((a.terakhir || 0) - (b.terakhir || 0)) || String(a.nama).localeCompare(String(b.nama)));
  }

  function akurasi(p) { return p.soalSelesai ? Math.round((p.benarPertama / p.soalSelesai) * 100) : 0; }

  return { DASAR, BATAS, BONUS_CEPAT, pemainBaru, mulai, catat, selesaiLevel, urutkan, akurasi };
});
