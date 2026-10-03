/* Mode offline (pratinjau satu pemain): antarmuka sama dengan net.js, tapi pemeriksaan & skor berjalan di browser. */
(function () {
  'use strict';
  const K = window.KONTEN, SK = window.SKOR;
  const KEY = 'bj.lokal';
  let st = null;
  const muat = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const simpan = () => { try { st ? localStorage.setItem(KEY, JSON.stringify(st)) : localStorage.removeItem(KEY); } catch (e) {} };
  const total = () => [1, 2, 3, 4].reduce((a, n) => a + K.idsLevel(n).length, 0);
  const papan = () => (st ? [{ id: st.id, nama: st.nama, g: st.g, skor: st.skor, akurasi: SK.akurasi(st), selesaiSoal: st.soalSelesai, rank: 1 }] : []);
  const sesi = () => ({ pin: 'latihan', mode: 'latihan', kelasNama: 'Latihan', status: 'main', sampaiLevel: 4, totalSoal: total(),
    pemain: { id: st.id, nama: st.nama, g: st.g, skor: st.skor, level: st.level }, papan: papan() });

  window.API = {
    mode: 'lokal',
    init() {},
    tersimpan() { st = st || muat(); return st ? { pin: 'latihan', token: 'lokal' } : null; },
    async gabung(d) { st = st || muat(); if (st && d.token) return { ok: true, token: 'lokal', sesi: sesi() }; return { ok: false, err: 'Mode kelas dengan kode hanya tersedia di versi server.' }; },
    async latihan(d) { st = SK.pemainBaru('aku', 'lokal', String(d.nama).slice(0, 16), d.g === 'l' ? 'l' : 'p', Date.now()); simpan(); return { ok: true, token: 'lokal', sesi: sesi() }; },
    async ambilLevel(n) { if (n > 1 && !(st.level[n - 1] && st.level[n - 1].selesai)) return { ok: false, err: 'Selesaikan misi sebelumnya dulu.' }; return { ok: true, beats: K.levelKlien(n) }; },
    mulaiSoal(id) { if (st) SK.mulai(st, id, Date.now()); },
    async jawab(id, j) {
      const info = K.INDEKS[id]; const h = K.periksa(id, j); if (h.err) return { ok: false, err: h.err };
      const r = SK.catat(st, info, h.benar, Date.now()); simpan();
      return Object.assign({ ok: true }, h, r, { skor: st.skor, peringkat: 1, jumlah: 1 });
    },
    async selesaiLevel(n) { const r = SK.selesaiLevel(st, n, K.idsLevel(n)); if (r.ok && n === 4) st.selesaiSemua = Date.now(); simpan(); return Object.assign(r, { skor: st.skor, peringkat: 1, jumlah: 1, tamat: n === 4 }); },
    async ambilPapan() { return { ok: true, papan: papan() }; },
    keluar() { st = null; simpan(); },
    async kontenUmum() { return Object.assign(K.umum(), { BATAS: SK.BATAS, DASAR: SK.DASAR }); },
  };
})();
