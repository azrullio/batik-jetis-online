/* Dasbor guru: membuat kelas, membuka/mengunci pertemuan, memantau papan peringkat dan analisis soal secara langsung. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const app = $('#app');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const angka = (n) => Number(n || 0).toLocaleString('id-ID');
  const kepala = window.GB.kepala;
  const KEY = 'bj.guru';
  let U = { LOC: ['', 'Pertemuan 1', 'Pertemuan 2', 'Pertemuan 3'], TOPIK: ['', 'Wujud Zat & Model Partikel', 'Perubahan Wujud Zat', 'Perubahan Fisika dan Kimia'], JUMLAH_PERTEMUAN: 3, JUMLAH: { 1: 10, 2: 10, 3: 10 } };
  fetch('/api/konten-umum').then((r) => r.json()).then((u) => { U = u; if (state) render(); }).catch(() => {});
  const socket = io({ transports: ['websocket', 'polling'] });
  let aktif = null; // {pin, hostKey}
  let state = null;
  const tampil = { filter: 0, urut: 'no' }; // pilihan analisis soal

  const daftar = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const simpanDaftar = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 20))); } catch (e) {} };
  const ingatKelas = (k) => { const l = daftar().filter((x) => x.pin !== k.pin); l.unshift({ pin: k.pin, hostKey: k.hostKey, nama: k.nama || '' }); simpanDaftar(l); };
  function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 3200); }
  function kirim(ev, d) { return new Promise((res) => socket.timeout(8000).emit(ev, d, (err, r) => res(err ? { ok: false, err: 'Server tidak menjawab. Periksa koneksi.' } : r))); }
  const linkMain = (pin) => `${location.origin}/?kode=${pin}`;
  const linkDasbor = (k) => `${location.origin}${location.pathname}?kelas=${k.pin}&kunci=${k.hostKey}`;
  const salin = async (teks, pesan) => { try { await navigator.clipboard.writeText(teks); toast(pesan); } catch (e) { prompt('Salin link berikut:', teks); } };

  /* ---------------- layar awal ---------------- */
  function layarAwal() {
    aktif = null; state = null; document.body.classList.remove('proyektor');
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    const l = daftar();
    app.innerHTML = `
    <div class="mulai-grid">
      <section class="panel">
        <h1>Buat kelas baru</h1>
        <p class="muted" style="margin:.4em 0 1em">Satu kelas berisi 3 pertemuan, masing-masing 10 soal IPA. Pertemuan 1 langsung bisa dikerjakan. Pertemuan 2 dan 3 terkunci sampai Anda membukanya dari dasbor ini.</p>
        <form class="form" id="fBuat">
          <label class="f">Nama kelas<input class="t" id="nk" maxlength="16" placeholder="Contoh: VII A" required></label>
          <div class="row"><button class="btn besar" type="submit">Buat kelas</button></div>
        </form>
      </section>
      <section class="panel">
        <h2>Kelas saya</h2>
        ${l.length ? `<ul class="kelas-list" style="margin-top:12px">${l.map((k, i) => `<li><span><b>${esc(k.nama)}</b> <span class="muted" style="display:inline">kode ${k.pin}</span></span><span class="row"><button class="btn alt" data-buka="${i}">Buka</button><button class="link" data-hapus="${i}">Hapus dari daftar</button></span></li>`).join('')}</ul>`
          : '<p class="muted" style="margin-top:10px">Kelas yang Anda buat di perangkat ini akan muncul di sini. Untuk membuka dasbor dari perangkat lain, pakai tombol "Salin link dasbor" di dalam kelas.</p>'}
        <h2 style="margin-top:22px">Alur di kelas</h2>
        <ol class="cara" style="margin-top:10px">
          <li>Buat kelas, lalu tampilkan kode atau QR di layar kelas.</li>
          <li>Siswa memasukkan kode dan namanya, lalu Anda menekan Mulai.</li>
          <li>Siswa mengerjakan Pertemuan 1. Nilainya muncul begitu 10 soal selesai.</li>
          <li>Di pelajaran berikutnya, buka Pertemuan 2 (lalu Pertemuan 3) dari dasbor. Siswa masuk lagi dengan kode dan nama yang sama.</li>
          <li>Unduh hasil (CSV) untuk nilai per pertemuan dan jawaban setiap soal.</li>
        </ol>
      </section>
    </div>`;
    $('#fBuat').addEventListener('submit', async (e) => {
      e.preventDefault(); const nama = $('#nk').value.trim(); if (!nama) return;
      const r = await kirim('buatKelas', { nama });
      if (!r.ok) return toast(r.err || 'Gagal membuat kelas.');
      ingatKelas({ pin: r.pin, hostKey: r.hostKey, nama });
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
    ingatKelas({ pin: k.pin, hostKey: k.hostKey, nama: state.nama });
    try { history.replaceState(null, '', `?kelas=${k.pin}`); } catch (e) {}
    render();
  }
  socket.on('kelas', (s) => { if (aktif && s.pin === aktif.pin) { state = s; render(); } });
  socket.on('connect', () => { if (aktif) kirim('hostMasuk', aktif).then((r) => { if (r.ok) { state = r.kelas; render(); } }); });

  const STATUS = { lobby: ['lobby', 'Menunggu siswa bergabung'], main: ['main', 'Kelas berjalan'], selesai: ['selesai', 'Kelas ditutup'] };
  const gembok = (buka) => buka
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';

  function render() {
    if (!state) return;
    const s = state, P = s.papan, n = P.length, NP = s.jumlahPertemuan || 3;
    const online = P.filter((p) => p.online).length;
    const rata = n ? Math.round(P.reduce((a, p) => a + p.skor, 0) / n) : 0;
    const menjawab = P.filter((p) => p.dijawab > 0);
    const benarTot = menjawab.reduce((a, p) => a + p.benar, 0), dijawabTot = menjawab.reduce((a, p) => a + p.dijawab, 0);
    const rataAk = dijawabTot ? Math.round(benarTot / dijawabTot * 100) : 0;
    const tamat = P.filter((p) => p.tamat).length;
    const [cls, lbl] = STATUS[s.status];
    const ringkas = s.status !== 'lobby';
    const fokus = document.activeElement && document.activeElement.id;
    const gulir = window.scrollY;
    app.innerHTML = `
    <div class="kepala">
      <div><div class="row" style="margin-bottom:6px"><span class="chip ${cls}"><i></i>${lbl}</span><span class="chip">${NP} pertemuan, ${s.totalSoal} soal</span><span class="chip">Pertemuan terbuka: 1${s.buka > 1 ? '–' + s.buka : ''}</span></div><h1>${esc(s.nama)}</h1></div>
      <div class="row sembunyi-proyektor">
        ${s.status === 'lobby' ? `<button class="btn besar" id="bMulai" ${n ? '' : 'disabled'}>Mulai</button>` : ''}
        ${s.status === 'main' ? '<button class="btn merah" id="bAkhiri">Tutup kelas</button>' : ''}
        ${s.status === 'selesai' ? '<button class="btn" id="bBukaLagi">Buka kelas lagi</button>' : ''}
        <a class="btn alt" href="/api/kelas/${s.pin}/hasil.csv?kunci=${encodeURIComponent(aktif.hostKey)}">Unduh hasil (CSV)</a>
        <button class="btn alt" id="bProyektor">Mode proyektor</button>
        <button class="link" id="bLinkDasbor">Salin link dasbor</button>
        <button class="link" id="bKembali">Kelas lain</button>
      </div>
      <div class="row"><button class="btn alt" id="bProyektorKeluar" hidden>Keluar mode proyektor</button></div>
    </div>
    ${s.status !== 'selesai' ? `<section class="gabung ${ringkas ? 'ringkas' : ''}">
      <div><p>Buka <span class="url">${esc(location.host)}</span> lalu masukkan kode</p><div class="pin">${s.pin.replace(/(\d{3})(\d{3})/, '$1 $2')}</div>
      <p style="margin-top:8px">atau pindai QR. <button class="link" id="bSalin" style="color:var(--kunyit)">Salin link siswa</button></p></div>
      <img class="qr" src="/api/qr/${s.pin}.png" alt="QR untuk bergabung ke kelas ${esc(s.nama)}">
    </section>` : ''}
    <section class="panel">
      <h2>Kunci pertemuan</h2>
      <p class="ket">Siswa mengerjakan pertemuan secara berurutan. Pertemuan yang dikunci tidak bisa dibuka siswa mana pun yang memakai kode ${s.pin}. Buka saat pelajarannya tiba.</p>
      <div class="pt-grid">${Array.from({ length: NP }, (_, i) => kartuPertemuan(i + 1, s)).join('')}</div>
    </section>
    <section class="stats">
      <div class="stat"><b>${n}</b><span>siswa bergabung, ${online} sedang online</span></div>
      <div class="stat"><b>${angka(rata)}<small> / ${NP * 100}</small></b><span>rata-rata skor total</span></div>
      <div class="stat"><b>${rataAk}%</b><span>jawaban benar dari semua soal yang dijawab</span></div>
      <div class="stat"><b>${tamat}</b><span>menyelesaikan ketiga pertemuan</span></div>
    </section>
    <div class="isi">
      <section class="panel">
        <h2>Papan peringkat</h2>
        <p class="ket">Skor total = jumlah nilai semua pertemuan (setiap jawaban benar 10 poin). Skor sama diurutkan dari yang lebih cepat menjawab. Baris merah muda menandai 3 skor terendah.</p>
        ${n ? podium(P) + tabel(P, s) : `<div class="kosong">Belum ada siswa. Tampilkan kode di atas supaya siswa bisa bergabung.</div>`}
      </section>
      <section class="panel sembunyi-proyektor">
        <h2>Soal tersulit</h2>
        <p class="ket">Persentase siswa yang menjawab benar. Paling rendah di atas.</p>
        ${tersulit(s.soal)}
      </section>
    </div>
    <section class="panel sembunyi-proyektor">
      <div class="row" style="justify-content:space-between"><h2>Analisis butir soal</h2>
        <div class="row"><label class="f-kecil">Pertemuan <select class="t kecil" id="fP"><option value="0">Semua</option>${Array.from({ length: NP }, (_, i) => `<option value="${i + 1}" ${tampil.filter === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
        <label class="f-kecil">Urutkan <select class="t kecil" id="fU"><option value="no">Nomor soal</option><option value="sulit" ${tampil.urut === 'sulit' ? 'selected' : ''}>Tersulit dulu</option></select></label></div></div>
      <p class="ket">Sebaran pilihan A–D menunjukkan pengecoh yang paling banyak dipilih siswa. Kunci jawaban ditandai hijau.</p>
      ${analisis(s.soal)}
    </section>`;
    const on = (id, f) => { const e = document.getElementById(id); if (e) e.onclick = f; };
    on('bMulai', async () => { const r = await kirim('hostMulai', aktif); if (!r.ok) toast('Gagal memulai.'); });
    on('bAkhiri', async () => { if (!confirm('Tutup kelas sekarang? Siswa tidak bisa menjawab lagi dan langsung melihat hasil akhir. Anda bisa membuka kelas ini lagi nanti.')) return; const r = await kirim('hostAkhiri', aktif); if (!r.ok) toast('Gagal menutup kelas.'); });
    on('bBukaLagi', async () => { const r = await kirim('hostMulai', aktif); if (!r.ok) toast('Gagal membuka kelas.'); });
    on('bKembali', layarAwal);
    on('bSalin', () => salin(linkMain(s.pin), 'Link siswa disalin.'));
    on('bLinkDasbor', () => salin(linkDasbor(aktif), 'Link dasbor disalin. Simpan baik-baik: siapa pun yang memegang link ini bisa mengatur kelas.'));
    on('bProyektor', () => { document.body.classList.add('proyektor'); $('#bProyektorKeluar').hidden = false; });
    on('bProyektorKeluar', () => { document.body.classList.remove('proyektor'); render(); });
    if (document.body.classList.contains('proyektor')) $('#bProyektorKeluar').hidden = false;
    app.querySelectorAll('[data-kunci]').forEach((b) => b.onclick = () => aturKunci(+b.dataset.kunci, b.dataset.aksi));
    const fP = $('#fP'), fU = $('#fU');
    if (fP) fP.onchange = () => { tampil.filter = +fP.value; render(); };
    if (fU) fU.onchange = () => { tampil.urut = fU.value; render(); };
    app.querySelectorAll('[data-keluarkan]').forEach((b) => b.onclick = async () => {
      const p = P.find((x) => x.id === b.dataset.keluarkan); if (!p) return;
      if (!confirm(`Keluarkan ${p.nama} dari kelas? Skornya akan dihapus.`)) return;
      await kirim('hostKeluarkan', Object.assign({ id: p.id }, aktif));
    });
    if (fokus) { const el = document.getElementById(fokus); if (el) el.focus({ preventScroll: true }); }
    window.scrollTo(0, gulir);
  }

  function kartuPertemuan(n, s) {
    const buka = n <= s.buka, st = (s.pertemuan && s.pertemuan[n]) || { selesai: 0, mengerjakan: 0, rata: null };
    const jml = s.papan.length;
    let tombol = '<span class="pt-catatan">Selalu terbuka</span>';
    if (n > 1) tombol = buka
      ? `<button class="btn alt" data-kunci="${n}" data-aksi="kunci">Kunci lagi</button>`
      : `<button class="btn kuning" data-kunci="${n}" data-aksi="buka">Buka ${esc(U.LOC[n])}</button>`;
    return `<div class="pt ${buka ? 'buka' : 'tutup'}">
      <div class="pt-atas"><span class="pt-no">${esc(U.LOC[n])}</span><span class="pt-status">${gembok(buka)}${buka ? 'Terbuka' : 'Dikunci'}</span></div>
      <b class="pt-topik">${esc(U.TOPIK[n])}</b>
      <div class="pt-angka"><span><b>${st.selesai}</b>/${jml} selesai</span><span><b>${st.mengerjakan}</b> sedang mengerjakan</span><span>rata-rata <b>${st.rata === null ? '–' : st.rata}</b></span></div>
      <div class="pt-bar"><i style="width:${jml ? Math.round(st.selesai / jml * 100) : 0}%"></i></div>
      <div class="row">${tombol}</div></div>`;
  }
  async function aturKunci(n, aksi) {
    const s = state; let target;
    if (aksi === 'buka') {
      target = n;
      if (n - 1 > s.buka && !confirm(`Membuka ${U.LOC[n]} juga membuka ${U.LOC[n - 1]}. Lanjutkan?`)) return;
    } else {
      target = n - 1;
      const ikut = s.buka > n ? ` dan ${U.LOC[s.buka]}` : '';
      if (!confirm(`Kunci kembali ${U.LOC[n]}${ikut}? Siswa yang sedang mengerjakannya akan dikembalikan ke peta. Jawaban yang sudah dikunci tetap tersimpan.`)) return;
    }
    const r = await kirim('hostKunci', Object.assign({ buka: target }, aktif));
    if (!r.ok) toast(r.err || 'Gagal mengubah kunci.'); else toast(aksi === 'buka' ? `${U.LOC[n]} dibuka untuk semua siswa di kelas ini.` : `${U.LOC[n]} dikunci kembali.`);
  }
  function podium(P) {
    const t = [P[1], P[0], P[2]], cls = ['p2', 'p1', 'p3'], no = [2, 1, 3];
    return `<div class="podium">${t.map((p, i) => p ? `<div class="pod ${cls[i]}">${kepala(p.g)}<span class="nm">${esc(p.nama)}</span><span class="sk">${angka(p.skor)}</span><div class="blok">${no[i]}</div></div>` : '<div></div>').join('')}</div>`;
  }
  function selNilai(p, n, s) {
    if (p.nilai && p.nilai[n] !== undefined) { const v = p.nilai[n]; return `<span class="nilai ${v >= 85 ? 'a' : v >= 60 ? 'b' : 'c'}">${v}</span>`; }
    const pr = p.progres ? p.progres[n] : 0;
    if (pr > 0) return `<span class="sedang">${pr}/${(U.JUMLAH && U.JUMLAH[n]) || 10}</span>`;
    return n > s.buka ? '<span class="kunci-kecil" title="Dikunci">🔒</span>' : '<span class="muted">–</span>';
  }
  function tabel(P, s) {
    const n = P.length, NP = s.jumlahPertemuan || 3;
    return `<div class="tabel-wrap"><table><thead><tr><th>#</th><th>Siswa</th><th class="num">Skor</th>${Array.from({ length: NP }, (_, i) => `<th class="num">P${i + 1}</th>`).join('')}<th class="num">Benar</th><th>Status</th><th class="sembunyi-proyektor"></th></tr></thead><tbody>
    ${P.map((p, i) => {
      const bawah = n >= 6 && i >= n - 3;
      const st = p.tamat ? '<span class="dot tamat"><i></i>Selesai</span>' : p.online ? '<span class="dot on"><i></i>Online</span>' : '<span class="dot"><i></i>Offline</span>';
      return `<tr class="r${p.rank} ${bawah ? 'bawah' : ''}"><td><span class="rk">${p.rank}</span></td>
        <td><div class="siapa">${kepala(p.g)}<span class="nmw"><span class="nm">${esc(p.nama)}</span>${bawah ? '<span class="tag-bantu">Perlu dibantu</span>' : ''}</span></div></td>
        <td class="num"><span class="skor">${angka(p.skor)}</span></td>
        ${Array.from({ length: NP }, (_, k) => `<td class="num">${selNilai(p, k + 1, s)}</td>`).join('')}
        <td class="num">${p.dijawab ? `${p.benar}/${p.dijawab}` : '–'}</td><td>${st}</td>
        <td class="sembunyi-proyektor"><button class="link" data-keluarkan="${p.id}">Keluarkan</button></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  const warnaPct = (v) => (v < 50 ? 'var(--merah)' : v < 75 ? 'var(--kunyit)' : 'var(--daun)');
  function tersulit(S) {
    const dijawab = S.filter((x) => x.dijawab > 0);
    if (!dijawab.length) return '<div class="kosong">Statistik muncul setelah siswa mulai menjawab.</div>';
    const urut = dijawab.filter((x) => x.persen < 100).sort((a, b) => a.persen - b.persen || a.no - b.no).slice(0, 6);
    if (!urut.length) return '<div class="kosong">Semua soal yang sudah dijawab, dijawab benar oleh semua siswa.</div>';
    return `<ul class="soal-list">${urut.map((x) => `<li><span class="j"><span class="lvl">P${x.level} · No. ${x.no}</span> ${esc(x.judul)}</span><div class="b"><i style="width:${x.persen}%;background:${warnaPct(x.persen)}"></i></div><div class="m"><span>${x.persen}% benar</span><span>${x.benar} dari ${x.dijawab} siswa</span></div></li>`).join('')}</ul>`;
  }
  function analisis(S) {
    let L = S.filter((x) => !tampil.filter || x.level === tampil.filter);
    if (tampil.urut === 'sulit') L = L.slice().sort((a, b) => (a.persen === null) - (b.persen === null) || a.persen - b.persen || a.no - b.no);
    return `<div class="tabel-wrap"><table class="butir"><thead><tr><th class="num">No</th><th>Ranah</th><th>Soal</th><th>Benar</th>${['A', 'B', 'C', 'D'].map((h) => `<th class="num">${h}</th>`).join('')}</tr></thead><tbody>
    ${L.map((x) => {
      const maks = Math.max(1, ...x.sebaran);
      return `<tr><td class="num"><b>${x.no}</b></td><td><span class="lvl">${esc(x.ranah)} · ${esc(x.kategori)}</span></td><td class="judul">${esc(x.judul)}</td>
      <td class="pct">${x.persen === null ? '<span class="muted">belum dijawab</span>' : `<div class="prog"><div class="b"><i style="width:${x.persen}%;background:${warnaPct(x.persen)}"></i></div><span>${x.persen}%</span></div>`}</td>
      ${x.sebaran.map((c, k) => `<td class="num sebar ${['A', 'B', 'C', 'D'][k] === x.kunci ? 'kunci' : c === maks && c > 0 ? 'pengecoh' : ''}" title="${c} siswa memilih ${['A', 'B', 'C', 'D'][k]}">${c}</td>`).join('')}</tr>`;
    }).join('')}</tbody></table></div>`;
  }

  /* ---------------- mulai ---------------- */
  const prm = new URLSearchParams(location.search);
  const q = prm.get('kelas'), kunci = prm.get('kunci');
  if (q && kunci) { buka({ pin: q, hostKey: kunci }); }
  else {
    const ada = q && daftar().find((k) => k.pin === q);
    if (ada) buka(ada); else layarAwal();
  }
})();
