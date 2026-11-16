/* Mode offline (pratinjau satu pemain): antarmuka sama dengan net.js, tapi pemeriksaan & skor berjalan di browser.
   Subbab terbuka berurutan (tanpa guru) dan boleh diulang. */
(function () {
  'use strict';
  const K = window.KONTEN, SK = window.SKOR;
  const KEY = 'bj.lokal2';
  const NP = K.JUMLAH_PERTEMUAN;
  let st = null;
  const muat = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const simpan = () => { try { st ? localStorage.setItem(KEY, JSON.stringify(st)) : localStorage.removeItem(KEY); } catch (e) {} };
  const total = () => { let t = 0; for (let n = 1; n <= NP; n++) t += K.idsLevel(n).length; return t; };
  const nilai = () => { const o = {}; for (let n = 1; n <= NP; n++) if (st.level[n] && st.level[n].selesai) o[n] = st.level[n].nilai; return o; };
  const progres = () => { const o = {}; for (let n = 1; n <= NP; n++) o[n] = SK.progres(st, K.idsLevel(n)); return o; };
  const papan = () => (st ? [{ id: st.id, nama: st.nama, g: st.g, skor: st.skor, benar: st.benar, dijawab: st.dijawab, akurasi: SK.akurasi(st), nilai: nilai(), misi: Object.keys(nilai()).length, online: true, rank: 1 }] : []);
  const sesi = () => ({ pin: 'latihan', mode: 'latihan', kelasNama: 'Latihan', status: 'main', buka: NP, totalSoal: total(),
    pemain: { id: st.id, nama: st.nama, g: st.g, skor: st.skor, level: st.level, progres: progres() }, papan: papan() });

  window.API = {
    mode: 'lokal',
    init() {},
    tersimpan() { st = st || muat(); return st ? { pin: 'latihan', token: 'lokal' } : null; },
    async gabung(d) { st = st || muat(); if (st && d.token) return { ok: true, token: 'lokal', sesi: sesi() }; return { ok: false, err: 'Mode kelas dengan kode hanya tersedia di versi server.' }; },
    async latihan(d) { st = SK.pemainBaru('aku', 'lokal', String(d.nama).slice(0, 16), d.g === 'l' ? 'l' : 'p', Date.now()); simpan(); return { ok: true, token: 'lokal', sesi: sesi() }; },
    async ambilLevel(n) {
      if (n > 1 && !(st.level[n - 1] && st.level[n - 1].selesai)) return { ok: false, kunci: true, err: `Selesaikan ${K.LOC[n - 1]} dulu.` };
      if (st.level[n] && st.level[n].selesai) { SK.ulangLevel(st, n, K.idsLevel(n)); simpan(); }
      const dijawab = {};
      K.idsLevel(n).forEach((id) => { const s = st.soal[id]; if (s && s.dijawab) dijawab[id] = { j: s.j, benar: s.benar }; });
      return { ok: true, beats: K.levelKlien(n), dijawab, skor: st.skor };
    },
    mulaiSoal(id) { if (st) SK.mulai(st, id, Date.now()); },
    async jawab(id, j) {
      const info = K.INDEKS[id]; const h = K.periksa(id, j); if (h.err) return { ok: false, err: h.err };
      const r = SK.catat(st, info, j, h.benar, Date.now()); simpan();
      if (r.sudah) return Object.assign({ ok: true, sudah: true }, h, { benar: r.benar, j: r.j, poin: r.poin, skor: st.skor, peringkat: 1, jumlah: 1 });
      return Object.assign({ ok: true, j }, h, r, { skor: st.skor, peringkat: 1, jumlah: 1 });
    },
    async selesaiLevel(n) {
      const r = SK.selesaiLevel(st, n, K.idsLevel(n), Date.now());
      if (r.ok && n === NP) st.selesaiSemua = Date.now();
      simpan();
      return Object.assign(r, { skor: st.skor, peringkat: 1, jumlah: 1, tamat: n === NP, buka: NP, mode: 'latihan' });
    },
    async ambilPapan() { return { ok: true, papan: papan(), buka: NP }; },
    keluar() { st = null; simpan(); },
    async kontenUmum() { return Object.assign(K.umum(), { POIN_BENAR: SK.POIN_BENAR }); },
  };
})();
