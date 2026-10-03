/* Penghubung game ke server (Socket.IO). Antarmuka yang sama dipakai js/lokal.js untuk mode offline. */
(function () {
  'use strict';
  const KEY = 'bj.sesi';
  let socket = null, sesi = null, H = {};
  const baca = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const tulis = (v) => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch (e) {} };

  function kirim(ev, data, ms) {
    return new Promise((res, rej) => {
      socket.timeout(ms || 8000).emit(ev, data, (err, r) => { if (err) rej(new Error('timeout')); else res(r); });
    });
  }
  function ingat(r) { if (r && r.ok) { sesi = { pin: r.sesi.pin, token: r.token }; tulis(sesi); } return r; }

  const API = {
    mode: 'online',
    init(h) {
      H = h || {};
      socket = io({ transports: ['websocket', 'polling'] });
      socket.on('papan', (l) => H.onPapan && H.onPapan(l));
      socket.on('status', (s) => H.onStatus && H.onStatus(s));
      socket.on('dikeluarkan', () => { sesi = null; tulis(null); H.onDikeluarkan && H.onDikeluarkan(); });
      socket.on('connect', async () => {
        H.onKoneksi && H.onKoneksi(true);
        if (sesi) {
          try { const r = await kirim('gabung', { pin: sesi.pin, token: sesi.token }); if (r && r.ok) H.onSambung && H.onSambung(r.sesi); } catch (e) {}
        }
      });
      socket.on('disconnect', () => H.onKoneksi && H.onKoneksi(false));
    },
    tersimpan() { return baca(); },
    async gabung(d) { return ingat(await kirim('gabung', d)); },
    async latihan(d) { return ingat(await kirim('buatLatihan', d)); },
    ambilLevel(n) { return kirim('ambilLevel', { n }); },
    mulaiSoal(id) { socket.emit('mulaiSoal', { id }); },
    jawab(id, jawaban) { return kirim('jawab', { id, jawaban }); },
    selesaiLevel(n) { return kirim('selesaiLevel', { n }); },
    ambilPapan() { return kirim('papan', {}); },
    keluar() { sesi = null; tulis(null); socket.emit('keluar'); },
    kontenUmum() { return fetch('/api/konten-umum').then((r) => r.json()); },
  };
  window.API = API;
})();
