/* Dasbor guru: membuat kelas, menampilkan kode/QR, memantau papan peringkat secara langsung. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const app = $('#app');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const angka = (n) => Number(n || 0).toLocaleString('id-ID');
  const kepala = window.GB.kepala;
  const KEY = 'bj.guru';
  const LOC = ['', 'Rumah Canting', 'Dapur Malam', 'Halaman Warna', 'Galeri Motif'];
  const socket = io({ transports: ['websocket', 'polling'] });
  let aktif = null; // {pin, hostKey}
  let state = null;

  const daftar = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const simpanDaftar = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 20))); } catch (e) {} };
  function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600); }
  function kirim(ev, d) { return new Promise((res) => socket.timeout(8000).emit(ev, d, (err, r) => res(err ? { ok: false, err: 'Server tidak menjawab. Periksa koneksi.' } : r))); }
  const linkMain = (pin) => `${location.origin}/?kode=${pin}`;

  /* ---------------- layar awal ---------------- */
  function layarAwal() {
    aktif = null; state = null; document.body.classList.remove('proyektor');
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    const l = daftar();
    app.innerHTML = `
    <div class="mulai-grid">
      <section class="panel">
        <h1>Buat kelas baru</h1>
        <p class="muted" style="margin:.4em 0 1em">Siswa bergabung dengan kode 6 angka, link, atau memindai QR. Setiap jawaban langsung masuk ke papan peringkat.</p>
        <form class="form" id="fBuat">
          <label class="f">Nama kelas<input class="t" id="nk" maxlength="16" placeholder="Contoh: Kelas 5A" required></label>
          <label class="f">Misi yang dimainkan<select class="t" id="sl">
            <option value="4">Semua misi (Level 1 sampai 4, 15 tantangan)</option>
            <option value="3">Level 1 sampai 3 (10 tantangan)</option>
            <option value="2">Level 1 sampai 2 (6 tantangan)</option>
            <option value="1">Level 1 saja (3 tantangan)</option>
          </select></label>
          <div class="row"><button class="btn besar" type="submit">Buat kelas</button></div>
        </form>
      </section>
      <section class="panel">
        <h2>Kelas saya</h2>
        ${l.length ? `<ul class="kelas-list" style="margin-top:12px">${l.map((k, i) => `<li><span><b>${esc(k.nama)}</b> <span class="muted" style="display:inline">kode ${k.pin}</span></span><span class="row"><button class="btn alt" data-buka="${i}">Buka</button><button class="link" data-hapus="${i}">Hapus dari daftar</button></span></li>`).join('')}</ul>`
          : '<p class="muted" style="margin-top:10px">Kelas yang kamu buat di perangkat ini akan muncul di sini, jadi kamu bisa membuka dasbornya lagi.</p>'}
        <h2 style="margin-top:22px">Cara bermain di kelas</h2>
        <ol class="cara" style="margin-top:10px">
          <li>Buat kelas, lalu tampilkan kode atau QR di layar kelas.</li>
          <li>Siswa membuka halaman pemain dan memasukkan kode serta namanya.</li>
          <li>Tekan Mulai permainan. Siswa bermain dengan kecepatan masing-masing.</li>
          <li>Pantau papan peringkat. Tekan Akhiri permainan untuk menutup kelas, lalu unduh hasilnya.</li>
        </ol>
      </section>
    </div>`;
    $('#fBuat').addEventListener('submit', async (e) => {
      e.preventDefault(); const nama = $('#nk').value.trim(); if (!nama) return;
      const r = await kirim('buatKelas', { nama, sampaiLevel: +$('#sl').value });
      if (!r.ok) return toast(r.err || 'Gagal membuat kelas.');
      const l2 = daftar().filter((k) => k.pin !== r.pin); l2.unshift({ pin: r.pin, hostKey: r.hostKey, nama }); simpanDaftar(l2);
      buka({ pin: r.pin, hostKey: r.hostKey });
    });
    app.querySelectorAll('[data-buka]').forEach((b) => b.onclick = () => buka(l[+b.dataset.buka]));
    app.querySelectorAll('[data-hapus]').forEach((b) => b.onclick = () => { const l2 = daftar(); l2.splice(+b.dataset.hapus, 1); simpanDaftar(l2); layarAwal(); });
  }

  /* ---------------- dasbor kelas ---------------- */
  async function buka(k) {
    const r = await kirim('hostMasuk', { pin: k.pin, hostKey: k.hostKey });
    if (!r.ok) { toast(r.err); simpanDaftar(daftar().filter((x) => x.pin !== k.pin)); layarAwal(); return; }
    aktif = { pin: k.pin, hostKey: k.hostKey }; state = r.kelas;
    try { history.replaceState(null, '', `?kelas=${k.pin}`); } catch (e) {}
    render();
  }
  socket.on('kelas', (s) => { if (aktif && s.pin === aktif.pin) { state = s; render(); } });
  socket.on('connect', () => { if (aktif) kirim('hostMasuk', aktif).then((r) => { if (r.ok) { state = r.kelas; render(); } }); });

  const STATUS = { lobby: ['lobby', 'Menunggu siswa bergabung'], main: ['main', 'Permainan berlangsung'], selesai: ['selesai', 'Permainan selesai'] };
  function render() {
    if (!state) return;
    const s = state, P = s.papan, n = P.length;
    const online = P.filter((p) => p.online).length;
    const rata = n ? Math.round(P.reduce((a, p) => a + p.skor, 0) / n) : 0;
    const aktifJawab = P.filter((p) => p.selesaiSoal > 0);
    const rataAk = aktifJawab.length ? Math.round(aktifJawab.reduce((a, p) => a + p.akurasi, 0) / aktifJawab.length) : 0;
    const tamat = P.filter((p) => p.tamat).length;
    const [cls, lbl] = STATUS[s.status];
    const ringkas = s.status !== 'lobby';
    const fokus = document.activeElement && document.activeElement.id;
    app.innerHTML = `
    <div class="kepala">
      <div><div class="row" style="margin-bottom:6px"><span class="chip ${cls}"><i></i>${lbl}</span><span class="chip">Level 1 sampai ${s.sampaiLevel}, ${s.totalSoal} tantangan</span></div><h1>${esc(s.nama)}</h1></div>
      <div class="row sembunyi-proyektor">
        ${s.status === 'lobby' ? `<button class="btn besar" id="bMulai" ${n ? '' : 'disabled'}>Mulai permainan</button>` : ''}
        ${s.status === 'main' ? '<button class="btn merah" id="bAkhiri">Akhiri permainan</button>' : ''}
        <a class="btn alt" href="/api/kelas/${s.pin}/hasil.csv?kunci=${encodeURIComponent(aktif.hostKey)}">Unduh hasil (CSV)</a>
        <button class="btn alt" id="bProyektor">Mode proyektor</button>
        <button class="link" id="bKembali">Kelas lain</button>
      </div>
      <div class="row"><button class="btn alt" id="bProyektorKeluar" hidden>Keluar mode proyektor</button></div>
    </div>
    ${s.status !== 'selesai' ? `<section class="gabung ${ringkas ? 'ringkas' : ''}">
      <div><p>Buka <span class="url">${esc(location.host)}</span> lalu masukkan kode</p><div class="pin">${s.pin.replace(/(\d{3})(\d{3})/, '$1 $2')}</div>
      <p style="margin-top:8px">atau pindai QR. <button class="link" id="bSalin" style="color:var(--kunyit)">Salin link</button></p></div>
      <img class="qr" src="/api/qr/${s.pin}.png" alt="QR untuk bergabung ke kelas ${esc(s.nama)}">
    </section>` : ''}
    <section class="stats">
      <div class="stat"><b>${n}</b><span>pemain bergabung, ${online} sedang online</span></div>
      <div class="stat"><b>${angka(rata)}</b><span>rata-rata skor</span></div>
      <div class="stat"><b>${rataAk}%</b><span>rata-rata benar di percobaan pertama</span></div>
      <div class="stat"><b>${tamat}</b><span>menyelesaikan semua misi</span></div>
    </section>
    <div class="isi">
      <section class="panel">
        <h2>Papan peringkat</h2>
        <p class="ket">Diurutkan dari skor tertinggi ke terendah. Baris merah muda menandai 3 skor terendah, siswa yang mungkin perlu dibantu.</p>
        ${n ? podium(P) + tabel(P, s.totalSoal, s.sampaiLevel) : `<div class="kosong">Belum ada siswa. Tampilkan kode di atas supaya siswa bisa bergabung.</div>`}
      </section>
      <section class="panel sembunyi-proyektor">
        <h2>Soal tersulit</h2>
        <p class="ket">Persentase siswa yang menjawab benar di percobaan pertama. Paling rendah di atas.</p>
        ${soal(s.soal)}
      </section>
    </div>`;
    const on = (id, f) => { const e = document.getElementById(id); if (e) e.onclick = f; };
    on('bMulai', async () => { const r = await kirim('hostMulai', aktif); if (!r.ok) toast('Gagal memulai.'); });
    on('bAkhiri', async () => { if (!confirm('Akhiri permainan sekarang? Siswa tidak bisa menjawab lagi dan langsung melihat hasil akhir.')) return; const r = await kirim('hostAkhiri', aktif); if (!r.ok) toast('Gagal mengakhiri.'); });
    on('bKembali', layarAwal);
    on('bSalin', async () => { try { await navigator.clipboard.writeText(linkMain(s.pin)); toast('Link disalin.'); } catch (e) { toast(linkMain(s.pin)); } });
    on('bProyektor', () => { document.body.classList.add('proyektor'); $('#bProyektorKeluar').hidden = false; });
    on('bProyektorKeluar', () => { document.body.classList.remove('proyektor'); render(); });
    if (document.body.classList.contains('proyektor')) $('#bProyektorKeluar').hidden = false;
    app.querySelectorAll('[data-keluarkan]').forEach((b) => b.onclick = async () => {
      const p = P.find((x) => x.id === b.dataset.keluarkan); if (!p) return;
      if (!confirm(`Keluarkan ${p.nama} dari kelas? Skornya akan dihapus.`)) return;
      await kirim('hostKeluarkan', Object.assign({ id: p.id }, aktif));
    });
    if (fokus) { const el = document.getElementById(fokus); if (el) el.focus(); }
  }
  function podium(P) {
    const t = [P[1], P[0], P[2]], cls = ['p2', 'p1', 'p3'], no = [2, 1, 3];
    return `<div class="podium">${t.map((p, i) => p ? `<div class="pod ${cls[i]}">${kepala(p.g)}<span class="nm">${esc(p.nama)}</span><span class="sk">${angka(p.skor)}</span><div class="blok">${no[i]}</div></div>` : '<div></div>').join('')}</div>`;
  }
  function tabel(P, total, sampai) {
    const n = P.length;
    return `<div class="tabel-wrap"><table><thead><tr><th>#</th><th>Siswa</th><th class="num">Skor</th><th class="num">Benar pertama</th><th>Progres</th><th>Misi</th><th>Status</th><th class="sembunyi-proyektor"></th></tr></thead><tbody>
    ${P.map((p, i) => {
      const bawah = n >= 6 && i >= n - 3;
      const pr = total ? Math.round(p.selesaiSoal / total * 100) : 0;
      const st = p.tamat ? '<span class="dot tamat"><i></i>Selesai</span>' : p.online ? '<span class="dot on"><i></i>Online</span>' : '<span class="dot"><i></i>Offline</span>';
      const totB = [1, 2, 3, 4].reduce((a, l) => a + (p.bintang[l] || 0), 0);
      const bin = p.misi ? `${p.misi}/${sampai} <b>★${totB}</b>` : '';
      return `<tr class="r${p.rank} ${bawah ? 'bawah' : ''}"><td><span class="rk">${p.rank}</span></td>
        <td><div class="siapa">${kepala(p.g)}<span class="nmw"><span class="nm">${esc(p.nama)}</span>${bawah ? '<span class="tag-bantu">Perlu dibantu</span>' : ''}</span></div></td>
        <td class="num"><span class="skor">${angka(p.skor)}</span></td>
        <td class="num">${p.selesaiSoal ? p.akurasi + '%' : '–'}</td>
        <td><div class="prog"><div class="b"><i style="width:${pr}%"></i></div><span>${p.selesaiSoal}/${total}</span></div></td>
        <td class="bintang">${bin || '–'}</td><td>${st}</td>
        <td class="sembunyi-proyektor"><button class="link" data-keluarkan="${p.id}">Keluarkan</button></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  function soal(S) {
    const dijawab = S.filter((x) => x.dijawab > 0);
    if (!dijawab.length) return '<div class="kosong">Statistik muncul setelah siswa mulai menjawab.</div>';
    const urut = dijawab.map((x) => Object.assign({ pct: Math.round(x.benarPertama / x.dijawab * 100) }, x)).sort((a, b) => a.pct - b.pct);
    return `<ul class="soal-list">${urut.map((x) => {
      const warna = x.pct < 50 ? 'var(--merah)' : x.pct < 75 ? 'var(--kunyit)' : 'var(--daun)';
      return `<li><span class="j"><span class="lvl">${LOC[x.level]}</span> ${esc(x.judul)}</span><div class="b"><i style="width:${x.pct}%;background:${warna}"></i></div><div class="m"><span>${x.pct}% benar pertama</span><span>${x.dijawab} siswa, rata-rata ${String(x.rataPercobaan).replace('.', ',')} percobaan</span></div></li>`;
    }).join('')}</ul>`;
  }

  /* ---------------- mulai ---------------- */
  const q = new URLSearchParams(location.search).get('kelas');
  const ada = q && daftar().find((k) => k.pin === q);
  if (ada) buka(ada); else layarAwal();
})();
