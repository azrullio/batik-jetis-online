/*
 * Konten cerita dan soal Petualangan Batik Jetis.
 * File ini memegang KUNCI JAWABAN, jadi di versi online hanya dibaca server.
 * Klien hanya menerima versi yang sudah disaring lewat levelKlien().
 *
 * Cara menambah/mengubah soal: edit array LEVEL di bawah. Setiap tantangan
 * (t: quiz | choice | pick | order) wajib punya id unik.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KONTEN = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LOC = ['', 'Rumah Canting', 'Dapur Malam', 'Halaman Warna', 'Galeri Motif'];
  const DIFF = ['', 'Mudah', 'Sedang', 'Sulit', 'Tantangan'];
  const MISI = ['',
    'Kenali alat dan bahan membatik tulis, lalu siapkan meja kerja pembatik.',
    'Pelajari cara malam bekerja, jaga api tetap aman, dan urutkan tahapan membatik.',
    'Warnai kain dengan ilmu IPA dan jaga sungai Kampung Jetis tetap bersih.',
    'Pahami makna motif khas Jetis dan ilmu alam yang ada di baliknya.'];
  const PELAJARAN = ['',
    ['Canting, malam, kain mori, wajan, kompor kecil, dan gawangan', 'Malam adalah perintang warna', 'Kain mori dibuat dari serat kapas (tumbuhan)'],
    ['Malam mencair saat dipanaskan dan membeku saat dingin', 'Malam mudah terbakar, cukup pakai api kecil', 'Urutan: pola, malam, warna, nglorod, kering'],
    ['Kuning + biru = hijau', 'Pewarna alami: kunyit, secang, daun tom, mahoni', 'Pewarna naptol adalah perubahan kimia', 'Limbah pewarna harus diolah dulu'],
    ['Motif khas Jetis: udang, bandeng, kembang bayem, beras utah', 'Tambak berisi air payau', 'Tebu membuat gula lewat fotosintesis', 'Malam mengapung karena massa jenisnya lebih kecil']];

  const HIDE = (slot) => ({ t: 'hide', slot });

  const LEVEL = {};
  LEVEL[1] = [
    { t: 'walkin', bg: 'rumah' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Ini rumah pembatik. Semua batik tulis dimulai dari meja kerja yang siap.' },
    { t: 'say', who: 'Sekar', text: 'Wah, mejanya berantakan! Bantu aku memilih alat dan bahan yang benar, ya.' },
    { t: 'pick', id: 'l1a', title: 'Siapkan meja kerja', q: 'Pilih semua alat dan bahan untuk membatik tulis.', cols: 5, items: [
      ['canting', 'Canting', 1], ['spidol', 'Spidol', 0], ['malam', 'Malam', 1], ['mori', 'Kain mori', 1], ['krayon', 'Krayon', 0],
      ['wajan', 'Wajan kecil', 1], ['lem', 'Lem', 0], ['kompor', 'Kompor kecil', 1], ['kuas', 'Kuas cat tembok', 0], ['gawangan', 'Gawangan', 1]],
      explain: 'Tepat! Malam dipanaskan di wajan di atas kompor kecil, lalu digoreskan ke kain mori memakai canting. Gawangan dipakai untuk membentangkan kain.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Hehe... ribet sekali. Pakai spidol saja! Gambar langsung di kain, lima menit selesai.' },
    { t: 'choice', id: 'l1b', prompt: '{nama}, cara mana yang akan kamu pilih?', q: 'Cara mana yang akan kamu pilih?', opts: [
      { text: 'Menggambar dengan canting dan malam', icon: 'canting', ok: 1, after: [
        { t: 'say', who: 'Si Kilat', text: 'Hmph! Lambat sekali caramu.' }, HIDE('L'),
        { t: 'say', who: 'Sekar', text: 'Pilihan bijak! Bagian kain yang tertutup malam tidak terkena pewarna. Karena itu malam disebut perintang warna.' }] },
      { text: 'Pakai spidol biar cepat', icon: 'spidol', conseq: [
        HIDE('R'), HIDE('L'), { t: 'bg', bg: 'rumah', fx: 'luntur' },
        { t: 'say', text: 'Gambarnya memang cepat jadi. Tapi saat kain dicelup ke pewarna dan dicuci, garis spidol luntur dan warnanya bercampur.' },
        { t: 'show', slot: 'R', who: 'sekar' },
        { t: 'say', who: 'Sekar', text: 'Malam tidak bisa bercampur dengan air. Pewarna batik larut dalam air, jadi tidak bisa menembus bagian kain yang tertutup malam. Tinta spidol tidak bisa begitu.' }] }] },
    { t: 'quiz', id: 'l1c', q: 'Kain mori terbuat dari serat kapas. Dari mana serat kapas berasal?', opts: [{ text: 'Buah tanaman kapas', ok: 1 }, { text: 'Bulu domba' }],
      hint: 'Belum tepat. Petunjuk: kapas tumbuh di ladang, bukan di peternakan.', explain: 'Serat kapas tumbuh di dalam buah tanaman kapas. Kain dari serat tumbuhan ini mudah menyerap pewarna batik.' },
    { t: 'say', who: 'Sekar', text: 'Meja kerja sudah siap. Selanjutnya kita ke Dapur Malam!' }
  ];
  LEVEL[2] = [
    { t: 'walkin', bg: 'dapur' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Di dapur ini malam dipanaskan. Malam batik dibuat dari campuran lilin, getah pohon pinus yang disebut gondorukem, dan lemak.' },
    { t: 'quiz', id: 'l2a', q: 'Malam yang padat dipanaskan sampai meleleh. Perubahan wujud apa yang terjadi?', opts: [{ text: 'Mencair', ok: 1 }, { text: 'Membeku' }, { text: 'Menguap' }],
      hint: 'Belum tepat. Petunjuk: wujud malam berubah dari padat menjadi...', explain: 'Panas mengubah malam padat menjadi cair. Nanti saat digoreskan ke kain, malam mendingin dan kembali padat. Itu namanya membeku.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Api kecil itu lambat! Besarkan saja apinya sampai malamnya berasap.' },
    { t: 'choice', id: 'l2b', prompt: '{nama}, bagaimana kamu memanaskan malam?', q: 'Bagaimana kamu memanaskan malam?', opts: [
      { text: 'Panaskan dengan api kecil secukupnya', icon: 'kompor', ok: 1, after: [
        { t: 'say', who: 'Si Kilat', text: 'Cih, kamu terlalu hati-hati.' }, HIDE('L'),
        { t: 'say', who: 'Sekar', text: 'Betul. Malam cukup dipanaskan sampai cair. Kalau terlalu panas, malam bisa berasap dan terbakar.' }] },
      { text: 'Besarkan api sampai berasap', icon: 'api', conseq: [
        HIDE('L'), { t: 'bg', bg: 'dapur', fx: 'asap' },
        { t: 'say', text: 'Malam terlalu panas dan mulai berasap. Asapnya membuat mata perih dan napas sesak. Malam bahkan bisa terbakar!' },
        { t: 'say', who: 'Sekar', text: 'Malam mengandung lilin dan getah yang mudah terbakar. Api kecil sudah cukup untuk melelehkannya.' }] },
      { text: 'Tidak usah dipanaskan, langsung pakai', icon: 'malam', conseq: [
        HIDE('L'), { t: 'bg', bg: 'dapur', fx: 'kosong' },
        { t: 'say', text: 'Malam yang masih padat tidak bisa keluar dari ujung canting. Kainnya tetap kosong.' },
        { t: 'say', who: 'Sekar', text: 'Malam harus cair dulu supaya bisa mengalir lewat cucuk canting, yaitu ujung kecil tempat malam keluar.' }] }] },
    { t: 'say', who: 'Sekar', text: 'Sekarang coba ingat tahapan membuat batik tulis dari awal sampai akhir.' },
    { t: 'order', id: 'l2c', title: 'Urutkan tahapan membatik', q: 'Ketuk langkah di kiri sesuai urutan yang benar.',
      steps: ['Menggambar pola dengan pensil', 'Menggoreskan malam dengan canting', 'Mencelup kain ke pewarna', 'Nglorod: merebus kain untuk melepas malam', 'Mengangin-anginkan kain sampai kering'],
      explain: 'Urutannya tepat! Pola dulu, lalu malam, lalu warna. Setelah itu malam dilepas dengan air panas, baru kain dikeringkan.' },
    { t: 'say', who: 'Sekar', text: 'Hebat! Tempat berikutnya Halaman Warna. Tantangannya lebih sulit, lho.' }
  ];
  LEVEL[3] = [
    { t: 'walkin', bg: 'halaman' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Batik Jetis terkenal dengan warnanya yang berani: merah, kuning, hijau, dan biru.' },
    { t: 'quiz', id: 'l3a', q: 'Kain dicelup ke pewarna kuning, lalu ke pewarna biru. Warna apa yang muncul di bagian yang terkena keduanya?', opts: [{ text: 'Ungu' }, { text: 'Hijau', ok: 1 }, { text: 'Oranye' }, { text: 'Merah muda' }],
      hint: 'Belum tepat. Petunjuk: warna daun muda.', explain: 'Kuning dan biru bercampur menjadi hijau. Pembatik mencelup kain berulang kali untuk mendapat warna campuran.' },
    { t: 'quiz', id: 'l3b', q: 'Pewarna alami bisa dibuat dari tumbuhan. Tumbuhan mana yang memberi warna kuning?', opts: [{ text: 'Kayu secang' }, { text: 'Daun tom' }, { text: 'Kunyit', ok: 1 }, { text: 'Kulit kayu mahoni' }],
      hint: 'Belum tepat. Petunjuk: tumbuhan ini juga dipakai sebagai bumbu dapur.', explain: 'Kunyit memberi warna kuning. Kayu secang memberi merah, daun tom memberi biru, dan kulit kayu mahoni memberi coklat.' },
    { t: 'quiz', id: 'l3c', q: 'Dengan pewarna naptol, kain dicelup ke larutan naptol, lalu ke larutan garam. Muncul warna baru yang tidak bisa dikembalikan. Ini perubahan apa?', opts: [{ text: 'Perubahan kimia', ok: 1 }, { text: 'Perubahan fisika' }, { text: 'Perubahan wujud' }, { text: 'Pelarutan biasa' }],
      hint: 'Belum tepat. Petunjuk: terbentuk zat baru yang tidak bisa kembali seperti semula.', explain: 'Kedua larutan bereaksi dan membentuk zat warna baru di dalam serat kain. Terbentuknya zat baru adalah ciri perubahan kimia.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Sisa air pewarna itu buang saja ke sungai. Gratis, cepat, tidak ada yang lihat!' },
    { t: 'choice', id: 'l3d', prompt: '{nama}, apa yang kamu lakukan dengan sisa pewarna?', q: 'Apa yang kamu lakukan dengan sisa pewarna?', opts: [
      { text: 'Buang langsung ke sungai', icon: 'sungai', conseq: [
        HIDE('L'), HIDE('R'), { t: 'bg', bg: 'sungai' },
        { t: 'say', text: 'Air sungai berubah warna dan berbau. Cahaya matahari sulit menembus air yang keruh.' },
        { t: 'say', text: 'Tumbuhan air tidak bisa berfotosintesis, oksigen di air berkurang, dan ikan-ikan mati.' },
        { t: 'show', slot: 'R', who: 'sekar' },
        { t: 'say', who: 'Sekar', text: 'Semua makhluk di sungai saling bergantung. Kalau airnya tercemar, seluruh ekosistemnya ikut rusak.' }] },
      { text: 'Olah dulu di tempat pengolahan limbah', icon: 'pabrik', ok: 1, after: [
        { t: 'say', who: 'Si Kilat', text: 'Repot! Tapi... ya sudahlah.' }, HIDE('L'),
        { t: 'say', who: 'Sekar', text: 'Tepat. Limbah pewarna harus diolah dulu sebelum dibuang, supaya sungai tetap bersih untuk ikan dan warga.' }] },
      { text: 'Timbun di tanah belakang rumah', icon: 'tanah', conseq: [
        HIDE('L'), { t: 'bg', bg: 'halaman', fx: 'sumur' },
        { t: 'say', text: 'Limbah meresap ke dalam tanah, lalu sampai ke air sumur warga.' },
        { t: 'say', who: 'Sekar', text: 'Air tanah juga bisa tercemar. Limbah tetap harus diolah, di mana pun dibuang.' }] }] },
    { t: 'say', who: 'Sekar', text: 'Tinggal satu tempat lagi: Galeri Motif. Ini tantangan paling sulit!' }
  ];
  LEVEL[4] = [
    { t: 'walkin', bg: 'galeri' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Di galeri ini tersimpan motif-motif Jetis. Setiap motif terinspirasi dari alam dan kehidupan warga Sidoarjo.' },
    { t: 'pick', id: 'l4a', title: 'Motif khas Jetis', q: 'Pilih semua motif khas Batik Jetis Sidoarjo.', cols: 3, items: [
      ['udang', 'Udang', 1], ['mega', 'Mega mendung', 0], ['kembang', 'Kembang bayem', 1], ['bandeng', 'Bandeng', 1], ['kawung', 'Kawung', 0], ['beras', 'Beras utah', 1]],
      explain: 'Betul! Udang dan bandeng dari tambak, kembang bayem dari sayur bayam di desa, dan beras utah melambangkan rezeki yang melimpah. Mega mendung berasal dari Cirebon, sedangkan kawung dari Yogyakarta dan Solo.' },
    { t: 'quiz', id: 'l4b', q: 'Motif bandeng dan udang terinspirasi tambak di Sidoarjo. Air tambak adalah campuran air laut dan air tawar. Air seperti ini disebut...', opts: [{ text: 'Air tawar' }, { text: 'Air laut' }, { text: 'Air payau', ok: 1 }, { text: 'Air mineral' }],
      hint: 'Belum tepat. Petunjuk: air ini ada di muara, tempat sungai bertemu laut.', explain: 'Air payau adalah campuran air tawar dan air laut. Bandeng dan udang bisa hidup di air payau, karena itu banyak tambak di pesisir Sidoarjo.' },
    { t: 'quiz', id: 'l4c', q: 'Motif kebun tebu mengingatkan bahwa Sidoarjo dulu terkenal sebagai penghasil gula. Bagaimana tanaman tebu membuat gula?', opts: [{ text: 'Menyerap gula dari dalam tanah' }, { text: 'Lewat fotosintesis dengan bantuan cahaya matahari', ok: 1 }, { text: 'Dari air hujan yang manis' }, { text: 'Dari pupuk yang ditaburkan' }],
      hint: 'Belum tepat. Petunjuk: prosesnya terjadi di daun dan butuh cahaya.', explain: 'Daun tebu memakai cahaya matahari, air, dan karbon dioksida untuk membuat gula. Gula itu lalu disimpan di batangnya.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Motif Jetis itu kuno! Tiru saja motif daerah lain yang sedang laris, lalu tempel label "batik Jetis".' },
    { t: 'choice', id: 'l4d', prompt: '{nama}, motif apa yang akan kamu buat?', q: 'Motif apa yang akan kamu buat?', opts: [
      { text: 'Meniru motif daerah lain yang laris', icon: 'mega', conseq: [
        HIDE('L'), HIDE('R'), { t: 'bg', bg: 'galeri', fx: 'pudar' },
        { t: 'say', text: 'Lama-lama tidak ada lagi yang membuat motif udang, bandeng, dan kembang bayem.' },
        { t: 'say', text: 'Orang tidak bisa lagi membedakan batik Jetis dari batik lain. Ciri khasnya hilang.' },
        { t: 'show', slot: 'R', who: 'sekar' },
        { t: 'say', who: 'Sekar', text: 'Dulu batik Jetis pernah disangka batik dari daerah lain. Jangan sampai motif aslinya ikut hilang.' }] },
      { text: 'Tetap membuat motif asli Jetis', icon: 'udang', ok: 1, after: [
        { t: 'say', who: 'Si Kilat', text: 'Hmph... kamu terlalu teliti untuk jalan pintas!' }, HIDE('L'),
        { t: 'say', who: 'Sekar', text: 'Motif adalah identitas sebuah daerah. Dengan membuatnya, kamu ikut melestarikan budaya Sidoarjo.' }] }] },
    { t: 'say', who: 'Sekar', text: 'Satu pertanyaan terakhir. Ini tentang nglorod, tahap melepas malam dari kain.' },
    { t: 'quiz', id: 'l4e', q: 'Saat nglorod, kain direbus dalam air mendidih. Malam meleleh, lepas dari kain, lalu mengapung. Kenapa malam mengapung?', opts: [{ text: 'Malam lebih berat daripada air' }, { text: 'Malam berubah menjadi gas' }, { text: 'Gelembung air mendorong malam ke atas' }, { text: 'Massa jenis malam lebih kecil daripada air', ok: 1 }],
      hint: 'Belum tepat. Petunjuk: untuk ukuran yang sama, malam lebih ringan daripada air.', explain: 'Benda yang massa jenisnya lebih kecil dari air akan mengapung. Malam yang mengapung bisa diambil dan dipakai lagi, jadi lebih hemat dan limbahnya berkurang.' },
    { t: 'say', who: 'Sekar', text: 'Kamu berhasil, {nama}! Semua ilmu membatik sudah terkumpul lagi.' }
  ];

  const PROLOG = [
    { t: 'bg', bg: 'joglo', fx: 'sepia' },
    { t: 'say', text: 'Tahun 1675. Seorang keturunan bangsawan Kediri, yang dikenal warga sebagai Mbah Mulyadi, mengajari warga Kampung Jetis membatik.' },
    { t: 'say', text: 'Dari tangan warga Jetis lahir motif-motif khas: beras utah, kembang bayem, dan kebun tebu.' },
    { t: 'bg', bg: 'pasar' },
    { t: 'say', text: 'Batik tulis Jetis disukai para pedagang di Pasar Jetis, terutama pedagang dari Madura. Warnanya berani: merah, kuning, hijau, dan biru.' },
    { t: 'bg', bg: 'halaman', fx: 'kusam' },
    { t: 'say', text: 'Tapi lama-lama banyak orang lupa. Motif asli Jetis jarang dibuat, bahkan sering disangka batik dari daerah lain.' },
    { t: 'say', text: 'Sekarang makin sedikit anak yang tahu cara membatik, apalagi ilmu alam yang ada di baliknya.' },
    { t: 'bg', bg: 'gapura', fx: 'fajar' },
    { t: 'show', slot: 'L', who: 'anakP', cls: 'duoL' }, { t: 'show', slot: 'R', who: 'anakL', cls: 'duoR' },
    { t: 'say', text: 'Tapi harapan belum hilang. Kampoeng Batik Jetis menunggu pembatik muda yang mau belajar dengan sabar dan teliti.' }
  ];
  const INTRO = [
    { t: 'walkin', bg: 'gapura' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Selamat datang di Kampoeng Batik Jetis, {nama}! Aku Sekar, burung merak penjaga motif Batik Jetis.' },
    { t: 'say', who: 'Sekar', text: 'Warna-warni motif Jetis mulai pudar karena banyak yang lupa cara membuatnya.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Hehehe... Untuk apa repot? Aku punya banyak jalan pintas.' },
    HIDE('L'),
    { t: 'say', who: 'Sekar', text: 'Itu Si Kilat. Dia suka membujuk orang memakai jalan pintas. Hati-hati dengan bujukannya, ya.' },
    { t: 'say', who: 'Sekar', text: 'Setiap jawaban benar memberimu poin. Makin cepat dan makin tepat, makin tinggi peringkatmu.' },
    { t: 'say', who: 'Sekar', text: 'Ayo, kita masuk ke kampung lewat gapura!' }
  ];

  const SCORED = ['quiz', 'choice', 'pick', 'order'];
  const salin = (o) => JSON.parse(JSON.stringify(o));

  function judulSoal(b) {
    const s = (b.t === 'pick' || b.t === 'order') ? b.title + ': ' + b.q : b.q;
    return s.length > 96 ? s.slice(0, 94) + '…' : s;
  }

  const INDEKS = {};
  Object.keys(LEVEL).forEach((n) => {
    LEVEL[n].forEach((b) => {
      if (SCORED.includes(b.t)) {
        if (INDEKS[b.id]) throw new Error('ID soal ganda: ' + b.id);
        INDEKS[b.id] = { id: b.id, level: +n, tipe: b.t, judul: judulSoal(b), beat: b };
      }
    });
  });

  function acak(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /** Versi level untuk klien: tanpa kunci jawaban, tanpa reaksi benar/salah. */
  function levelKlien(n) {
    const L = LEVEL[n];
    if (!L) return null;
    return L.map((b) => {
      switch (b.t) {
        case 'quiz': return { t: 'quiz', id: b.id, q: b.q, opts: b.opts.map((o) => ({ text: o.text })) };
        case 'choice': return { t: 'choice', id: b.id, prompt: b.prompt, q: b.q, opts: b.opts.map((o) => ({ text: o.text, icon: o.icon })) };
        case 'pick': return { t: 'pick', id: b.id, title: b.title, q: b.q, cols: b.cols, items: b.items.map((x) => [x[0], x[1]]) };
        case 'order': {
          const st = b.steps.map((s, i) => ({ id: 's' + i, text: s }));
          let sh; do { sh = acak(st); } while (sh.every((x, i) => x.id === 's' + i));
          return { t: 'order', id: b.id, title: b.title, q: b.q, steps: sh };
        }
        default: return salin(b);
      }
    });
  }

  function idsLevel(n) { return (LEVEL[n] || []).filter((b) => SCORED.includes(b.t)).map((b) => b.id); }

  /** Memeriksa jawaban. Hasilnya berisi umpan balik, tanpa menyentuh skor. */
  function periksa(id, j) {
    const info = INDEKS[id];
    if (!info) return { err: 'Soal tidak dikenal.' };
    const b = info.beat;
    if (b.t === 'quiz' || b.t === 'choice') {
      if (!Number.isInteger(j) || j < 0 || j >= b.opts.length) return { err: 'Jawaban tidak valid.' };
      const o = b.opts[j];
      if (b.t === 'quiz') return { benar: !!o.ok, pesan: o.ok ? 'Benar! ' + b.explain : (b.hint || 'Belum tepat. Coba pikirkan lagi.') };
      return { benar: !!o.ok, reaksi: salin(o.ok ? (o.after || []) : (o.conseq || [])) };
    }
    if (b.t === 'pick') {
      if (!Array.isArray(j) || !j.length || j.some((x) => !Number.isInteger(x) || x < 0 || x >= b.items.length)) return { err: 'Jawaban tidak valid.' };
      const sel = [...new Set(j)];
      const salah = sel.filter((i) => !b.items[i][2]);
      const perlu = b.items.filter((x) => x[2]).length;
      const dapat = sel.filter((i) => b.items[i][2]).length;
      const benar = !salah.length && dapat === perlu;
      return { benar, salah, kurang: perlu - dapat, pesan: benar ? b.explain : null };
    }
    if (b.t === 'order') {
      const n = b.steps.length;
      if (!Array.isArray(j) || j.length !== n || j.some((x) => typeof x !== 'string')) return { err: 'Jawaban tidak valid.' };
      const posisi = j.map((x, k) => x === 's' + k);
      const benar = posisi.every(Boolean);
      return { benar, posisi, pesan: benar ? b.explain : null };
    }
    return { err: 'Soal tidak dikenal.' };
  }

  function umum() {
    const JUMLAH = {}; [1, 2, 3, 4].forEach((n) => { JUMLAH[n] = idsLevel(n).length; });
    return salin({ LOC, DIFF, MISI, PELAJARAN, PROLOG, INTRO, JUMLAH });
  }

  return { LOC, DIFF, MISI, PELAJARAN, LEVEL, PROLOG, INTRO, INDEKS, SCORED, levelKlien, idsLevel, periksa, umum };
});
