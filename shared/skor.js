/*
 * Sistem nilai Petualangan Batik Jetis (sesuai instrumen: bobot 1 per soal).
 *  - Setiap soal hanya bisa dijawab SEKALI.
 *  - Jawaban benar = 10 poin, salah = 0. Satu subbab berisi 10 soal, jadi nilai subbab 0–100.
 *  - Skor total = jumlah nilai semua subbab (maksimal 300).
 *  - Jika skor sama, yang menjawab lebih cepat (total waktu lebih kecil) berada di atas.
 * Dipakai oleh server (versi online) dan oleh mode latihan offline.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SKOR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const POIN_BENAR = 10;
  const WAKTU_MAKS = 5 * 60 * 1000; // waktu satu soal dibatasi 5 menit agar tab yang ditinggal tidak merusak urutan

  function pemainBaru(id, token, nama, g, now) {
    return { id, token, nama, g, skor: 0, benar: 0, dijawab: 0, waktu: 0, soal: {}, level: {}, gabung: now, terakhir: now, selesaiSemua: 0, online: 0 };
  }

  function catatanSoal(p, id) {
    return p.soal[id] || (p.soal[id] = { mulai: 0, j: -1, benar: false, ms: 0, poin: 0, dijawab: false });
  }

  /** Dipanggil saat soal mulai tampil di layar pemain. */
  function mulai(p, id, now) {
    const s = catatanSoal(p, id);
    if (!s.dijawab && !s.mulai) s.mulai = now;
  }

  /** Mencatat jawaban. Soal yang sudah dijawab tidak bisa dijawab ulang. */
  function catat(p, info, j, benar, now) {
    const s = catatanSoal(p, info.id);
    if (s.dijawab) return { sudah: true, poin: s.poin, benar: s.benar, j: s.j };
    const ms = s.mulai ? Math.min(WAKTU_MAKS, Math.max(0, now - s.mulai)) : WAKTU_MAKS;
    const poin = benar ? POIN_BENAR : 0;
    Object.assign(s, { j, benar: !!benar, ms, poin, dijawab: true });
    p.skor += poin; p.dijawab++; p.waktu += ms; p.terakhir = now;
    if (benar) p.benar++;
    return { poin, ms };
  }

  /** Menutup satu pertemuan: semua soal harus sudah dijawab. Nilai 0–100. */
  function selesaiLevel(p, n, ids, now) {
    if (!ids.length || ids.some((id) => !(p.soal[id] && p.soal[id].dijawab))) return { ok: false, err: 'Masih ada soal yang belum dijawab.' };
    const benar = ids.filter((id) => p.soal[id].benar).length;
    const nilai = Math.round((benar / ids.length) * 100);
    const bintang = nilai >= 85 ? 3 : nilai >= 60 ? 2 : 1;
    const waktu = ids.reduce((a, id) => a + p.soal[id].ms, 0);
    if (!(p.level[n] && p.level[n].selesai)) p.level[n] = { selesai: true, nilai, benar, soal: ids.length, bintang, waktu, kapan: now || Date.now() };
    return Object.assign({ ok: true }, p.level[n]);
  }

  /** Mode latihan: menghapus jawaban satu subbab supaya bisa diulang. */
  function ulangLevel(p, n, ids) {
    ids.forEach((id) => {
      const s = p.soal[id]; if (!s) return;
      if (s.dijawab) { p.skor -= s.poin; p.dijawab--; p.waktu -= s.ms; if (s.benar) p.benar--; }
      delete p.soal[id];
    });
    delete p.level[n];
    p.selesaiSemua = 0;
  }

  /** Berapa soal sudah dijawab di satu subbab. */
  function progres(p, ids) { return ids.filter((id) => p.soal[id] && p.soal[id].dijawab).length; }

  /** Urutan papan peringkat: skor, lalu waktu total lebih cepat, lalu siapa yang lebih dulu mencapainya. */
  function urutkan(arr) {
    return arr.slice().sort((a, b) =>
      (b.skor - a.skor) || ((a.waktu || 0) - (b.waktu || 0)) || ((a.terakhir || 0) - (b.terakhir || 0)) || String(a.nama).localeCompare(String(b.nama)));
  }

  function akurasi(p) { return p.dijawab ? Math.round((p.benar / p.dijawab) * 100) : 0; }

  return { POIN_BENAR, WAKTU_MAKS, pemainBaru, mulai, catat, selesaiLevel, ulangLevel, progres, urutkan, akurasi };
});
