/*
 * Konten cerita dan soal Petualangan Batik Jetis.
 * Sumber soal: Instrumen Latihan Soal Gamifikasi (revisi 6 Nov) — IPA SMP kelas VII,
 * 30 soal pilihan ganda dalam 3 subbab, bobot 1 per soal.
 *
 * File ini memegang KUNCI JAWABAN, jadi di versi online hanya dibaca server.
 * Klien hanya menerima versi yang sudah disaring lewat levelKlien().
 *
 * Cara mengubah soal: edit array SOAL di bawah.
 *   isi      : bagian cerita/stimulus. Berisi teks, {ol:[...]} daftar bernomor, {ul:[...]} daftar biasa,
 *              atau {gambar:'partikel'|'grafik'}.
 *   tanya    : kalimat pertanyaan.
 *   opsi     : 4 pilihan (A-D), urutan sesuai instrumen.
 *   kunci    : 'A' | 'B' | 'C' | 'D'
 *   pembahasan: ditampilkan setelah siswa menjawab.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KONTEN = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const JUMLAH_PERTEMUAN = 3;
  const NILAI_PER_SOAL = 10; // bobot 1 per soal -> 10 soal = nilai 100 per subbab
  const LOC = ['', 'Subbab 1', 'Subbab 2', 'Subbab 3'];
  const TOPIK = ['', 'Wujud Zat & Model Partikel', 'Perubahan Wujud Zat', 'Perubahan Fisika dan Kimia'];
  const TEMPAT = ['', 'Rumah Canting', 'Dapur Malam', 'Halaman Warna'];
  const RANAH = ['', 'C1–C2', 'C3–C4', 'C5–C6'];
  const INDIKATOR = ['',
    ['Mengidentifikasi wujud zat padat, cair, dan gas pada bahan pembuatan Batik Jetis Sidoarjo. (C1)',
     'Memahami karakteristik serta susunan dan gerak partikel zat padat, cair, dan gas. (C2)',
     'Menghubungkan susunan dan gerak partikel dengan karakteristik masing-masing wujud zat. (C2)'],
    ['Menerapkan konsep perubahan wujud zat dalam fenomena pembuatan Batik Jetis Sidoarjo. (C3)',
     'Menganalisis grafik perubahan suhu untuk menentukan titik lebur suatu zat. (C4)',
     'Menganalisis keterkaitan perubahan wujud zat dengan tahapan proses pembuatan Batik Jetis Sidoarjo. (C4)'],
    ['Mengevaluasi ketepatan pengelompokan perubahan fisika dan kimia berdasarkan ciri-ciri perubahan serta terbentuknya zat baru. (C5)',
     'Merancang pengelompokan fenomena perubahan fisika dan kimia berdasarkan hasil pengamatan pada proses pembuatan Batik Jetis Sidoarjo. (C6)']];

  /* ===================== 30 SOAL ===================== */
  const SOAL = [
    /* ---------- Subbab 1: Wujud Zat & Model Partikel ---------- */
    { no: 1, p: 1, ranah: 'C1', kategori: 'LOTS',
      isi: ['Pada proses pewarnaan batik di Jetis Sidoarjo, pengrajin menggunakan bahan-bahan berikut:',
        { ol: ['Kain mori', 'Larutan pewarna', 'Air', 'Lilin batik (malam) yang sudah mengeras', 'Kayu penjepit kain'] }],
      tanya: 'Bahan yang berwujud cair ditunjukkan oleh nomor ....',
      opsi: ['1 dan 2', '2 dan 3', '3 dan 4', '4 dan 5'], kunci: 'B',
      pembahasan: 'Larutan pewarna (2) dan air (3) berwujud cair. Kain mori, malam yang sudah mengeras, dan kayu penjepit berwujud padat.' },
    { no: 2, p: 1, ranah: 'C1', kategori: 'LOTS',
      isi: ['Pada proses pembuatan batik di Kampoeng Batik Jetis Sidoarjo, pengrajin menggunakan larutan pewarna untuk mewarnai kain. Saat proses pelorodan, air dipanaskan hingga mendidih dan menghasilkan uap air.'],
      tanya: 'Wujud zat yang tepat untuk larutan pewarna dan uap air ditunjukkan oleh pasangan ....',
      opsi: ['Larutan pewarna: cair; uap air: gas', 'Larutan pewarna: gas; uap air: cair', 'Larutan pewarna: padat; uap air: gas', 'Larutan pewarna: cair; uap air: padat'], kunci: 'A',
      pembahasan: 'Larutan pewarna berwujud cair. Uap air terbentuk dari air yang mendidih, sehingga berwujud gas.' },
    { no: 3, p: 1, ranah: 'C1', kategori: 'LOTS',
      isi: ['Di Kampung Batik Jetis Sidoarjo, pengrajin menggunakan malam (lilin batik) padat sebelum dipanaskan. Ketika kompor dinyalakan, malam tersebut berubah wujud.'],
      tanya: 'Wujud awal malam sebelum dipanaskan dan wujud malam setelah mencair berturut-turut adalah...',
      opsi: ['Cair dan gas', 'Padat dan cair', 'Padat dan gas', 'Cair dan padat'], kunci: 'B',
      pembahasan: 'Sebelum dipanaskan, malam berwujud padat. Setelah mencair, malam berwujud cair.' },
    { no: 4, p: 1, ranah: 'C1', kategori: 'LOTS',
      isi: [],
      tanya: 'Uap air yang mengepul dari wajan peleburan lilin batik saat pengrajin memanaskan malam merupakan contoh dari zat berwujud...',
      opsi: ['Padat', 'Cair', 'Gas', 'Plasma'], kunci: 'C',
      pembahasan: 'Uap air adalah air yang sudah berubah menjadi gas karena dipanaskan.' },
    { no: 5, p: 1, ranah: 'C2', kategori: 'LOTS',
      isi: [],
      tanya: 'Ketika aroma lilin batik yang dipanaskan tercium oleh hidung kita yang berada agak jauh dari kompor, hal ini membuktikan bahwa partikel zat gas memiliki ciri...',
      opsi: ['Diam di tempat secara teratur', 'Bergerak terbatas di posisi masing-masing', 'Gaya tarik-menariknya sangat kuat', 'Bergerak sangat bebas dan jarak antarpartikelnya sangat berjauhan'], kunci: 'D',
      pembahasan: 'Partikel gas bergerak sangat bebas dan saling berjauhan, sehingga aroma malam dapat menyebar sampai ke hidung kita.' },
    { no: 6, p: 1, ranah: 'C2', kategori: 'LOTS',
      isi: [],
      tanya: 'Saat larutan pewarna batik tumpah di lantai, larutan tersebut menyebar dan bentuknya mendatar mengikuti lantai. Hal ini terjadi karena partikel zat cair...',
      opsi: ['Memiliki ikatan yang sangat kaku', 'Jaraknya agak renggang sehingga partikelnya dapat bergeser berpindah tempat', 'Tidak memiliki gaya tarik-menarik sama sekali', 'Tersusun sangat rapat membentuk pola tertentu'], kunci: 'B',
      pembahasan: 'Partikel zat cair agak renggang dan dapat bergeser, sehingga cairan dapat mengalir dan bentuknya mengikuti tempatnya.' },
    { no: 7, p: 1, ranah: 'C2', kategori: 'LOTS',
      isi: ['Kain mori yang digunakan untuk membatik di Jetis Sidoarjo tidak berubah bentuk dan volumenya meskipun dipindahkan dari meja ke rak.'],
      tanya: 'Penjelasan yang tepat berdasarkan susunan dan gerak partikel kain mori adalah ....',
      opsi: ['Partikelnya sangat renggang sehingga dapat bergerak bebas ke segala arah', 'Partikelnya tersusun rapat dan teratur sehingga hanya bergetar di tempatnya', 'Partikelnya tersusun agak renggang sehingga dapat bergeser dan berpindah', 'Partikelnya tidak teratur sehingga mudah bergerak dan memenuhi ruangan'], kunci: 'B',
      pembahasan: 'Kain mori adalah zat padat. Partikelnya rapat, teratur, dan hanya bergetar di tempat, sehingga bentuk dan volumenya tetap.' },
    { no: 8, p: 1, ranah: 'C2', kategori: 'LOTS',
      isi: ['Perhatikan pernyataan berikut!', { ol: ['Kain mori di Kampoeng Batik Jetis Sidoarjo memiliki bentuk dan volume tetap.', 'Larutan pewarna memiliki volume tetap, tetapi bentuknya berubah mengikuti wadah.'] }],
      tanya: 'Hubungan yang tepat antara susunan dan gerak partikel dengan karakteristik kedua zat tersebut adalah ...',
      opsi: ['Partikel kain mori rapat dan hanya bergetar sehingga bentuknya tetap; partikel larutan pewarna agak renggang dan dapat bergeser sehingga bentuknya berubah',
        'Partikel kain mori agak renggang dan dapat bergeser sehingga bentuknya tetap; partikel larutan pewarna rapat dan hanya bergetar sehingga bentuknya berubah',
        'Partikel kain mori sangat renggang dan bebas bergerak sehingga volumenya tetap; partikel larutan pewarna rapat sehingga bentuknya berubah',
        'Partikel kain mori dan larutan pewarna sama-sama rapat dan hanya bergetar sehingga bentuknya mudah berubah'], kunci: 'A',
      pembahasan: 'Partikel zat padat rapat dan hanya bergetar, jadi bentuknya tetap. Partikel zat cair agak renggang dan dapat bergeser, jadi bentuknya mengikuti wadah.' },
    { no: 9, p: 1, ranah: 'C2', kategori: 'LOTS',
      // Catatan: di dokumen instrumen kuncinya tertulis B, tetapi opsi B ("partikelnya bergerak bebas berpindah tempat")
      // tidak sesuai konsep zat padat. Yang sesuai adalah opsi A. Mohon dikonfirmasi ke guru/validator.
      isi: [],
      tanya: 'Malam batik yang membeku setelah dingin memiliki bentuk yang tetap. Hubungan yang tepat antara wujud malam membeku dengan susunan partikelnya adalah...',
      opsi: ['Bentuknya tetap karena partikelnya tersusun sangat teratur dan rapat', 'Bentuknya tetap karena partikelnya bergerak bebas berpindah tempat', 'Bentuknya berubah karena gaya tarik antarpartikel sangat lemah', 'Bentuknya tetap karena jarak antarpartikelnya sangat renggang'], kunci: 'A',
      pembahasan: 'Malam yang membeku adalah zat padat. Partikelnya tersusun sangat rapat dan teratur, sehingga bentuknya tetap.' },
    { no: 10, p: 1, ranah: 'C2', kategori: 'LOTS',
      isi: ['Perhatikan gambar susunan dan gerak partikel zat berikut!', { gambar: 'partikel' }],
      tanya: 'Berdasarkan gambar tersebut, pasangan yang tepat antara zat dan wujudnya adalah ...',
      opsi: ['Zat X = padat, Zat Y = cair, Zat Z = gas', 'Zat X = cair, Zat Y = padat, Zat Z = gas', 'Zat X = gas, Zat Y = cair, Zat Z = padat', 'Zat X = padat, Zat Y = gas, Zat Z = cair'], kunci: 'A',
      pembahasan: 'Zat X rapat dan hanya bergetar (padat), Zat Y berdekatan dan dapat bergeser (cair), Zat Z berjauhan dan bergerak bebas (gas).' },

    /* ---------- Subbab 2: Perubahan Wujud Zat ---------- */
    { no: 11, p: 2, ranah: 'C3', kategori: 'LOTS',
      isi: ['Bu Sari adalah pengrajin batik tulis di Kampoeng Batik Jetis Sidoarjo. Pagi itu ia menyiapkan malam untuk mencanting motif bunga pada kain mori. Malam ia letakkan dalam wajan kecil di atas kompor. Setelah 5 menit, malam di bagian dasar wajan sudah mencair, tetapi bagian atasnya masih padat. Ia mengambil canting dan mencelupkannya ke wajan. Ketika digoreskan ke kain, malam yang menempel di ujung canting cepat mengeras dan tidak bisa mengalir.'],
      tanya: 'Agar malam dapat digunakan untuk mencanting dengan lancar, tindakan yang paling tepat dilakukan Bu Sari adalah ....',
      opsi: ['Mematikan kompor agar malam yang mencair tidak menguap', 'Melanjutkan pemanasan sampai seluruh malam mencair dan menjaga api tetap kecil agar malam tidak membeku di canting', 'Memindahkan wajan ke tempat yang sejuk agar malam yang padat ikut mencair', 'Menambahkan potongan malam padat ke dalam wajan agar suhu malam turun'], kunci: 'B',
      pembahasan: 'Malam baru bisa mengalir lancar kalau seluruhnya sudah cair dan tetap hangat. Api kecil menjaga malam tidak cepat membeku di ujung canting.' },
    { no: 12, p: 2, ranah: 'C3', kategori: 'LOTS',
      isi: ['Ara mendapat kesempatan untuk mencoba mencanting. Langkah pertama yang ia lakukan adalah mengambil bongkahan malam padat, lalu memasukkannya ke dalam wajan kecil di atas kompor. Beberapa menit kemudian, malam tersebut berubah menjadi cairan yang siap dialirkan melalui mata canting.'],
      tanya: 'Konsep perubahan wujud dan perpindahan energi yang terjadi pada malam di wajan Ara adalah...',
      opsi: ['Mencair, karena malam menyerap energi kalor dari api kompor.', 'Membeku, karena malam melepas energi kalor ke udara sekitar.', 'Menguap, karena malam menyerap energi kalor dari wajan tembaga.', 'Menyublim, karena malam melepas energi kalor ke lingkungan sekitar.'], kunci: 'A',
      pembahasan: 'Malam padat menyerap kalor dari api kompor sehingga berubah menjadi cair. Peristiwa ini disebut mencair.' },
    { no: 13, p: 2, ranah: 'C3', kategori: 'LOTS',
      isi: ['Aisha mulai menorehkan cairan malam panas menggunakan canting mengikuti pola batik di atas kain mori. Ajaibnya, begitu cairan malam tersebut menyentuh kain mori yang berada di suhu ruangan, cairan malam itu langsung mengeras dalam hitungan detik sehingga mengunci motif batik.'],
      tanya: 'Fenomena mengerasnya malam panas pada kain mori tersebut menerapkan konsep perubahan wujud...',
      opsi: ['Mengkristal, akibat malam menyerap kalor dari serat kain mori.', 'Membeku, akibat malam melepas energi kalor ke lingkungan yang suhunya lebih rendah.', 'Mencair, akibat malam menyerap energi kalor yang ada di permukaan kain.', 'Menguap, akibat malam melepaskan kalor yang didapat dari kompor canting.'], kunci: 'B',
      pembahasan: 'Malam panas melepas kalor ke kain dan udara yang lebih dingin, lalu berubah dari cair menjadi padat. Peristiwa ini disebut membeku.' },
    { no: 14, p: 2, ranah: 'C3', kategori: 'LOTS',
      isi: ['Pada musim hujan, Bu Lestari kesulitan mengeringkan kain batik pesanan pelanggan. Udara terasa lembap, langit mendung, dan kain yang dijemur seharian di teras masih basah. Ia ingin kain cepat kering sebelum batas waktu pengiriman.'],
      tanya: 'Tindakan yang paling tepat berdasarkan konsep menguap adalah ....',
      opsi: ['Merendam kain dalam air dingin agar air pada kain membeku', 'Melipat kain rapat-rapat dan menyimpannya di ruang tertutup', 'Membentangkan kain di dalam ruangan yang hangat dan berventilasi, atau menggunakan kipas angin, agar air pada kain lebih cepat menguap', 'Menyiram kain dengan sedikit air agar kain lebih cepat kering'], kunci: 'C',
      pembahasan: 'Air menguap lebih cepat bila udaranya hangat, ada aliran udara, dan kain dibentangkan sehingga permukaannya luas.' },
    { no: 15, p: 2, ranah: 'C4', kategori: 'HOTS',
      isi: ['Rey melakukan eksperimen kecil di laboratorium sekolah menggunakan sampel malam dari Jetis. Ia memanaskan malam tersebut dan mencatat suhunya setiap menit, lalu menuangkannya ke dalam grafik. Pada menit ke-3 hingga menit ke-7, grafik menunjukkan garis lurus mendatar (suhu konstan bertahan di angka 62°C) meskipun api pemanas terus menyala.'],
      tanya: 'Berdasarkan analisis grafik tersebut, peristiwa apa yang sebenarnya terjadi pada malam di suhu 62°C?',
      opsi: ['Malam sedang mengalami proses pendidihan massal menjadi gas seluruhnya.', 'Malam sedang berada pada titik leburnya untuk bertransisi dari fase padat menjadi cair.', 'Malam sudah selesai berubah wujud menjadi padatan yang lebih keras.', 'Kalor dari pemanas sudah tidak berfungsi lagi dan diserap oleh wadah eksperimen.'], kunci: 'B',
      pembahasan: 'Suhu yang tetap meskipun terus dipanaskan menunjukkan kalor sedang dipakai untuk mengubah wujud. Pada 62°C malam berada di titik leburnya.' },
    { no: 16, p: 2, ranah: 'C4', kategori: 'HOTS',
      isi: ['Seorang pengrajin Batik Jetis Sidoarjo memanaskan malam sebelum digunakan untuk mencanting. Hasil pengukuran suhu malam selama proses pemanasan ditunjukkan pada grafik berikut.', { gambar: 'grafik' }, 'Ket:',
        { ul: ['Menit 0–2: suhu meningkat dari 30°C menjadi 55°C.', 'Menit 2–4: suhu meningkat dari 55°C menjadi 70°C.', 'Menit 4–8: suhu tetap pada 70°C.', 'Menit 8–10: suhu kembali meningkat dari 70°C menjadi 85°C.'] }],
      tanya: 'Berdasarkan grafik, titik lebur malam dan argumen yang tepat adalah ....',
      opsi: ['70 °C, karena suhu tetap meskipun malam terus dipanaskan sehingga kalor digunakan untuk mengubah wujud malam dari padat menjadi cair', '55 °C, karena pada suhu tersebut kenaikan suhu malam paling cepat', '85 °C, karena suhu tertinggi menunjukkan malam sudah mencair seluruhnya', '30 °C, karena pada suhu awal malam sudah mulai menyerap kalor'], kunci: 'A',
      pembahasan: 'Pada menit 4–8 suhu bertahan di 70 °C walaupun terus dipanaskan. Kalor dipakai untuk mencairkan malam, jadi titik leburnya 70 °C.' },
    { no: 17, p: 2, ranah: 'C4', kategori: 'HOTS',
      isi: ['Dalam proses pembuatan Batik Jetis Sidoarjo, pengrajin memanaskan malam hingga mencair agar dapat digunakan untuk mencanting kain. Setelah digunakan, malam yang menempel pada kain akan mengeras ketika suhunya turun. Pada hari berikutnya, pengrajin memanaskan kembali sisa malam yang telah mengeras untuk digunakan dalam proses membatik.',
        'Berdasarkan fenomena tersebut, seorang siswa berpendapat bahwa malam yang telah mengeras akan membutuhkan kalor lebih sedikit untuk mencair dibandingkan malam yang baru dipadatkan, meskipun keduanya memiliki jenis bahan, massa, dan suhu awal yang sama.'],
      tanya: 'Analisislah pendapat siswa tersebut berdasarkan hubungan antara kondisi awal malam dan kalor yang dibutuhkan untuk mencairkannya. Pernyataan yang paling tepat adalah ....',
      opsi: ['Benar, karena malam yang pernah mencair akan lebih mudah mencair kembali.', 'Benar, karena proses pembekuan membuat malam menyimpan kalor yang dapat digunakan saat dipanaskan kembali.', 'Salah, karena kebutuhan kalor untuk mencairkan malam dengan kondisi yang sama tidak ditentukan oleh apakah malam tersebut pernah digunakan atau belum.', 'Salah, karena malam yang telah mengeras tidak dapat mencair kembali meskipun dipanaskan.'], kunci: 'C',
      pembahasan: 'Kalor yang dibutuhkan bergantung pada jenis bahan, massa, dan suhu awal. Kalau ketiganya sama, malam bekas dan malam baru membutuhkan kalor yang sama.' },
    { no: 18, p: 2, ranah: 'C4', kategori: 'HOTS',
      // Catatan: di dokumen instrumen kolom kunci, subbab, ranah, bobot, dan kategori soal ini kosong.
      // Kunci A dipakai karena hanya opsi A yang sesuai konsep; ranah/kategori mengikuti kelompok indikatornya.
      isi: ['Kain batik yang sudah diwarnai kini siap memasuki tahap nglorod (pelorodan). Pengrajin memasukkan kain tersebut ke dalam bak besar berisi air yang sedang mendidih bergolak. Beberapa saat kemudian, lilin-lilin yang menempel di kain terlepas dan mengapung di permukaan air.'],
      tanya: 'Analisislah mengapa air mendidih pada tahap nglorod ini sangat krusial untuk menghilangkan malam dari kain!',
      opsi: ['Karena air mendidih menyalurkan kalor yang cukup untuk mencapai titik lebur malam, sehingga malam mencair dan terlepas dari serat kain.', 'Karena air mendidih menurunkan suhu malam secara drastis sehingga malam membeku dan retak.', 'Karena air mendidih memicu reaksi penyubliman malam dari padat langsung menghilang menjadi gas.', 'Karena air mendidih merusak struktur kain mori sehingga ikatan malam terpaksa terlepas.'], kunci: 'A',
      pembahasan: 'Air mendidih memberi kalor sampai malam mencapai titik leburnya. Malam mencair, lepas dari serat kain, lalu mengapung di permukaan air.' },
    { no: 19, p: 2, ranah: 'C4', kategori: 'HOTS',
      isi: ['Di dapur produksi, seorang pengrajin terburu-buru pergi dan lupa mengecilkan api kompor wajan malam. Wajan tersebut ditinggalkan dalam kondisi panas tinggi selama berjam-jam. Ketika kembali, pengrajin terkejut melihat volume malam cair di wajan berkurang drastis dan ruangan dipenuhi asap pekat yang menyengat.'],
      tanya: 'Keterkaitan perubahan wujud yang tepat untuk menganalisis fenomena di atas adalah...',
      opsi: ['Malam mengalami pembekuan mendadak di dasar wajan akibat panas yang berlebihan.', 'Malam mengalami penyubliman secara langsung dari fase padat ke gas tanpa melewati fase cair.', 'Malam yang telah cair terus menyerap kalor melampaui titik didihnya sehingga mengalami penguapan yang masif.', 'Malam mengalami pengembunan dari uap sekitar menjadi cairan malam yang baru di dinding wajan.'], kunci: 'C',
      pembahasan: 'Malam cair yang terus dipanaskan terus menyerap kalor hingga menguap. Karena itu volumenya berkurang dan ruangan dipenuhi asap.' },
    { no: 20, p: 2, ranah: 'C4', kategori: 'HOTS',
      isi: ['Seorang pengrajin Batik Jetis Sidoarjo melakukan dua kegiatan berikut.',
        { ul: ['Kegiatan I: Pengrajin memanaskan malam padat di atas kompor hingga mencair agar dapat digunakan untuk mencanting.', 'Kegiatan II: Setelah proses pencantingan selesai, malam yang menempel pada kain dibiarkan mendingin hingga mengeras kembali.'] },
        'Seorang siswa berpendapat bahwa pada kegiatan I dan II, malam sama-sama mengalami perubahan wujud, sehingga kalor selalu berpindah dari lingkungan ke malam.'],
      tanya: 'Berdasarkan kedua kegiatan tersebut, analisis yang tepat untuk memperbaiki pendapat siswa adalah ....',
      opsi: ['Pada kegiatan I, malam menerima kalor, sedangkan pada kegiatan II, malam melepaskan kalor ke lingkungan.', 'Pada kegiatan I, malam melepaskan kalor, sedangkan pada kegiatan II, malam menerima kalor dari lingkungan.', 'Pada kegiatan I dan II, malam selalu menerima kalor karena mengalami perubahan wujud.', 'Pada kegiatan I dan II, malam selalu melepaskan kalor karena perubahan wujud terjadi akibat perubahan suhu.'], kunci: 'A',
      pembahasan: 'Saat mencair (kegiatan I) malam menerima kalor. Saat mengeras (kegiatan II) malam melepaskan kalor ke lingkungan. Arah perpindahan kalornya berbeda.' },

    /* ---------- Subbab 3: Perubahan Fisika dan Kimia ---------- */
    { no: 21, p: 3, ranah: 'C5', kategori: 'HOTS',
      isi: ['Di ruang pewarnaan Batik Jetis, Adi melihat kain mori dicelupkan ke dalam larutan Napthol yang tidak berwarna (jernih). Setelah itu, kain diangkat dan dimasukkan ke dalam wadah berisi larutan Garam Diazonium. Seketika itu juga, muncul warna merah tua yang pekat dan melekat permanen pada kain.'],
      tanya: 'Berikan evaluasi Anda mengenai pengelompokan perubahan zat yang terjadi pada proses pewarnaan kain tersebut!',
      opsi: ['Perubahan fisika, karena pencelupan hanya mengubah tampilan warna luar kain dan bisa dihapus dengan air biasa.', 'Perubahan fisika, karena larutan pewarna dan garam diazonium wujud fisiknya tetap sama-sama cair.', 'Perubahan kimia, karena terjadi reaksi antara kedua larutan yang menghasilkan senyawa pigmen warna baru yang sifatnya permanen.', 'Perubahan kimia, karena larutan pewarna mengalami penguapan akibat suhu ruangan yang panas.'], kunci: 'C',
      pembahasan: 'Kedua larutan bereaksi dan membentuk pigmen warna baru yang permanen. Terbentuknya zat baru adalah ciri perubahan kimia.' },
    { no: 22, p: 3, ranah: 'C5', kategori: 'HOTS',
      isi: ['Dalam proses pembuatan Batik Jetis Sidoarjo, malam dipanaskan hingga mencair sebelum digunakan untuk mencanting. Setelah menempel pada kain, malam kembali mengeras ketika suhunya turun. Dua siswa memberikan penilaian terhadap perubahan tersebut.',
        { ul: ['Siswa A menyatakan bahwa mencair dan mengerasnya malam termasuk perubahan fisika karena hanya terjadi perubahan wujud tanpa menghasilkan zat baru.', 'Siswa B menyatakan bahwa mengerasnya malam termasuk perubahan kimia karena malam mengalami perubahan dari cair menjadi padat.'] }],
      tanya: 'Berdasarkan ciri-ciri perubahan fisika dan kimia, evaluasi yang paling tepat terhadap kedua pendapat tersebut adalah ....',
      opsi: ['Pendapat siswa A benar, sedangkan pendapat siswa B salah karena perubahan wujud malam tidak menghasilkan zat baru.', 'Pendapat siswa A salah, sedangkan pendapat siswa B benar karena perubahan wujud menunjukkan terbentuknya zat baru.', 'Kedua pendapat benar karena mencair merupakan perubahan fisika, sedangkan mengeras merupakan perubahan kimia.', 'Kedua pendapat salah karena mencair dan mengerasnya malam selalu menghasilkan zat baru.'], kunci: 'A',
      pembahasan: 'Mencair dan mengeras hanya mengubah wujud malam tanpa menghasilkan zat baru, jadi keduanya perubahan fisika. Pendapat siswa A benar.' },
    { no: 23, p: 3, ranah: 'C5', kategori: 'HOTS',
      isi: ['Beberapa rumah produksi di Jetis masih menggunakan kayu bakar untuk memasak air pelorodan. Adi mengamati kayu yang dibakar di dalam tungku perlahan habis dan berubah menjadi tumpukan abu putih serta arang hitam, dibarengi dengan munculnya asap tebal dari cerobong tungku.'],
      tanya: 'Manakah bukti indikator berikut yang paling valid untuk mengevaluasi bahwa proses pembakaran kayu pada tungku tersebut merupakan perubahan kimia?',
      opsi: ['Terjadinya perubahan bentuk dari balok kayu yang besar menjadi serpihan abu yang berukuran kecil.', 'Air di dalam dandang logam yang diletakkan di atas tungku pembakaran menjadi mendidih dengan sangat cepat.', 'Terbentuknya zat baru yang sifatnya berbeda dari kayu asal, yaitu berupa abu/arang dan gas hasil pembakaran.', 'Energi panas (kalor) dari dalam tungku menyebar secara radiasi ke seluruh area lantai rumah produksi.'], kunci: 'C',
      pembahasan: 'Bukti terkuat perubahan kimia adalah terbentuknya zat baru. Pembakaran kayu menghasilkan abu, arang, dan gas yang sifatnya berbeda dari kayu.' },
    { no: 24, p: 3, ranah: 'C5', kategori: 'HOTS',
      isi: ['Pengrajin Batik Jetis Sidoarjo memanaskan malam padat hingga mencair agar dapat digunakan untuk mencanting. Setelah selesai digunakan, malam dibiarkan dingin hingga mengeras kembali.',
        'Rina berpendapat, “Perubahan malam padat menjadi cair dan kembali menjadi padat termasuk perubahan kimia karena malam mengalami perubahan bentuk dan kondisi.”'],
      tanya: 'Berdasarkan konsep perubahan fisika dan kimia, evaluasi yang paling tepat terhadap pendapat Rina adalah ....',
      opsi: ['Pendapat Rina benar, karena setiap perubahan bentuk zat menunjukkan terbentuknya zat baru.', 'Pendapat Rina benar, karena malam yang dipanaskan dan didinginkan memiliki wujud yang berbeda sehingga sifat kimianya berubah.', 'Pendapat Rina salah, karena perubahan wujud malam tidak menghasilkan zat baru dan dapat dibalik melalui pemanasan atau pendinginan.', 'Pendapat Rina salah, karena malam yang telah mengeras tidak dapat kembali mencair sehingga perubahan tersebut bersifat permanen.'], kunci: 'C',
      pembahasan: 'Perubahan wujud malam tidak menghasilkan zat baru dan bisa dibalik dengan memanaskan atau mendinginkan. Jadi itu perubahan fisika, bukan kimia.' },
    { no: 25, p: 3, ranah: 'C5', kategori: 'HOTS',
      isi: ['Sebelum mulai membatik, pengrajin memotong kain mori menjadi beberapa bagian sesuai ukuran yang dibutuhkan. Setelah dipotong, kain memiliki ukuran dan bentuk yang berbeda dari sebelumnya, tetapi bahan penyusunnya tetap sama.',
        'Salsa berpendapat, “Pemotongan kain mori termasuk perubahan kimia karena kain tidak lagi memiliki bentuk dan ukuran seperti semula.”'],
      tanya: 'Evaluasi yang paling tepat terhadap pendapat Salsa adalah ....',
      opsi: ['Benar, karena perubahan ukuran menunjukkan bahwa zat penyusun kain telah berubah menjadi zat baru.', 'Benar, karena kain yang sudah dipotong tidak dapat kembali menjadi kain utuh seperti semula.', 'Salah, karena pemotongan hanya mengubah bentuk dan ukuran kain tanpa menghasilkan zat baru sehingga termasuk perubahan fisika.', 'Salah, karena semua perubahan yang terjadi pada bahan padat selalu termasuk perubahan kimia.'], kunci: 'C',
      pembahasan: 'Memotong kain hanya mengubah bentuk dan ukurannya. Bahan penyusunnya tetap sama dan tidak ada zat baru, jadi termasuk perubahan fisika.' },
    { no: 26, p: 3, ranah: 'C6', kategori: 'HOTS',
      isi: ['Sebagai asisten peneliti etnosains, Zakiy ditugaskan merancang format tabel pengamatan cepat untuk pengrajin pemula di Jetis. Pengrajin tersebut bingung membedakan perubahan saat memasak. Zakiy merancang instruksi: “Jika perubahan hanya berupa perubahan wujud atau ukuran tanpa membentuk sifat zat baru”, masukkan ke Kolom A. “Jika perubahan ditandai dengan timbulnya gas hasil pembakaran atau perubahan zat yang tidak bisa kembali”, masukkan ke Kolom B.'],
      tanya: 'Jika pengrajin mengamati "Minyak tanah menguap saat tangki kompor hangat" dan "minyak tanah terbakar menghasilkan nyala api pada sumbu", di manakah pengrajin harus menuliskan data tersebut berdasarkan rancangan Zakiy?',
      opsi: ['Minyak tanah menguap di Kolom B; Minyak tanah terbakar di Kolom A.', 'Kedua fenomena tersebut harus dimasukkan ke dalam Kolom A karena bahannya sama.', 'Minyak tanah menguap di Kolom A; Minyak tanah terbakar di Kolom B.', 'Kedua fenomena tersebut harus dimasukkan ke dalam Kolom B karena melibatkan energi panas.'], kunci: 'C',
      pembahasan: 'Menguap hanya perubahan wujud tanpa zat baru (Kolom A, fisika). Terbakar menghasilkan gas hasil pembakaran dan tidak bisa kembali (Kolom B, kimia).' },
    { no: 27, p: 3, ranah: 'C6', kategori: 'HOTS',
      isi: ['Di kelas IPA, Sindy ditantang untuk merancang sebuah peta konsep interaktif mengenai "Siklus Kain Mori pada Batik Jetis". Peta konsep tersebut harus memisahkan perubahan zat selama proses pembatikan. Anda memiliki dua kartu fenomena:',
        { ul: ['Kartu A: Kain mori yang kaku direndam dalam air agar lemas (mori mengalami hidrasi fisik tanpa mengubah serat).', 'Kartu B: Kain mori yang diputihkan menggunakan larutan kaporit (terjadi pemutusan pigmen warna serat kain secara kimia).'] }],
      tanya: 'Bagaimana rancangan penempatan Kartu A dan Kartu B yang paling valid di dalam peta konsep Sindy?',
      opsi: ['Kartu A diletakkan pada cabang Perubahan Kimia; Kartu B diletakkan pada cabang Perubahan Fisika.', 'Kedua kartu harus diletakkan pada cabang Perubahan Kimia karena sama-sama menggunakan zat cair.', 'Kedua kartu harus diletakkan pada cabang Perubahan Fisika karena bentuk kain tidak hancur menjadi abu.', 'Kartu A diletakkan pada cabang Perubahan Fisika; Kartu B diletakkan pada cabang Perubahan Kimia.'], kunci: 'D',
      pembahasan: 'Merendam kain tidak mengubah seratnya, jadi perubahan fisika. Pemutihan dengan kaporit memutus pigmen secara kimia, jadi perubahan kimia.' },
    { no: 28, p: 3, ranah: 'C6', kategori: 'HOTS',
      isi: ['Seorang siswa melakukan pengamatan terhadap beberapa tahapan pembuatan Batik Jetis Sidoarjo dan memperoleh hasil berikut.',
        { ol: ['Malam padat dipanaskan hingga mencair.', 'Kain mori dipotong sesuai ukuran yang dibutuhkan.', 'Air pada kain batik menguap saat proses penjemuran.', 'Sisa malam dibakar hingga menghasilkan asap dan residu.'] },
        'Siswa tersebut diminta menyusun rancangan pengelompokan fenomena perubahan fisika dan kimia berdasarkan hasil pengamatan.'],
      tanya: 'Rancangan yang paling tepat adalah ....',
      opsi: ['Mengelompokkan kegiatan 1 dan 4 sebagai perubahan fisika serta kegiatan 2 dan 3 sebagai perubahan kimia.', 'Mengelompokkan kegiatan 1, 2, dan 3 sebagai perubahan fisika serta kegiatan 4 sebagai perubahan kimia karena pembakaran menghasilkan zat baru.', 'Mengelompokkan kegiatan 1 dan 2 sebagai perubahan kimia serta kegiatan 3 dan 4 sebagai perubahan fisika.', 'Mengelompokkan kegiatan 1, 3, dan 4 sebagai perubahan kimia serta kegiatan 2 sebagai perubahan fisika.'], kunci: 'B',
      pembahasan: 'Mencair, dipotong, dan menguap tidak menghasilkan zat baru (fisika). Pembakaran malam menghasilkan asap dan residu sebagai zat baru (kimia).' },
    { no: 29, p: 3, ranah: 'C6', kategori: 'HOTS',
      isi: ['Dalam kegiatan pembelajaran IPA berbasis etnosains, siswa diminta menyusun rancangan pengelompokan perubahan fisika dan kimia berdasarkan hasil pengamatan proses pembuatan Batik Jetis Sidoarjo. Rancangan tersebut harus menggunakan ciri perubahan dan terbentuk atau tidaknya zat baru sebagai dasar pengelompokan.',
        'Beberapa rancangan yang diajukan siswa adalah sebagai berikut.',
        { ul: ['Rancangan I: Mengelompokkan malam yang mencair, malam yang mengeras, dan kain mori yang dipotong sebagai perubahan fisika karena tidak menghasilkan zat baru. Sementara itu, pembakaran malam dikelompokkan sebagai perubahan kimia karena menghasilkan zat baru.',
          'Rancangan II: Mengelompokkan malam yang mencair dan mengeras sebagai perubahan kimia karena terjadi perubahan wujud.',
          'Rancangan III: Mengelompokkan kain mori yang dipotong sebagai perubahan kimia karena bentuk dan ukurannya berubah.',
          'Rancangan IV: Mengelompokkan semua fenomena yang melibatkan pemanasan sebagai perubahan kimia karena menggunakan energi panas.'] }],
      tanya: 'Berdasarkan konsep perubahan fisika dan kimia, rancangan yang paling tepat untuk digunakan dalam kegiatan pengelompokan tersebut adalah ....',
      opsi: ['Rancangan I', 'Rancangan II', 'Rancangan III', 'Rancangan IV'], kunci: 'A',
      pembahasan: 'Hanya Rancangan I yang memakai dasar yang benar, yaitu ada atau tidaknya zat baru. Perubahan wujud, bentuk, atau pemanasan saja tidak menghasilkan zat baru.' },
    { no: 30, p: 3, ranah: 'C6', kategori: 'HOTS',
      isi: ['Sendy ditugaskan merancang sebuah proyek daur ulang untuk memanfaatkan kembali malam lorodan (lilin sisa hasil perebusan kain) yang mengapung di permukaan air limbah agar bisa digunakan kembali untuk mencanting di kemudian hari.'],
      tanya: 'Berdasarkan prinsip perubahan wujud zat fisika, rancangan metode seperti apa yang Sendy buat untuk memadatkan kembali lilin cair yang bercampur air tersebut agar siap dicetak menjadi bongkahan malam bersih?',
      opsi: ['Merancang pemanasan ekstrem dengan suhu di atas 200°C agar air dan lilin menguap bersamaan menuju wadah baru.', 'Merancang pemisahan mekanis lalu menurunkan suhu (pendinginan) agar lilin cair melepaskan kalor dan membeku terpisah dari air.', 'Merancang pencampuran larutan asam pekat agar terjadi reaksi pengendapan senyawa lilin secara kimiawi di dasar wadah.', 'Merancang pembakaran massa lilin sisa tersebut di dalam oven tertutup agar menghasilkan abu lilin yang siap dipadatkan.'], kunci: 'B',
      pembahasan: 'Lilin dipisahkan dari air, lalu didinginkan. Lilin cair melepas kalor dan membeku menjadi padatan yang bisa dicetak dan dipakai lagi.' },
  ];

  /* ===================== CERITA ===================== */
  const HIDE = (slot) => ({ t: 'hide', slot });
  const soalP = (p, dari, sampai) => SOAL.filter((s) => s.p === p && s.no >= dari && s.no <= sampai).map((s) => ({ t: 'soal', id: 's' + s.no }));

  const LEVEL = {};
  LEVEL[1] = [
    { t: 'walkin', bg: 'rumah' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Selamat datang di Subbab 1: Wujud Zat dan Model Partikel!' },
    { t: 'say', who: 'Sekar', text: 'Di rumah pembatik ini ada kain mori, malam, larutan pewarna, dan air. Semuanya zat, tapi wujudnya berbeda-beda.' },
    { t: 'say', who: 'Sekar', text: 'Ada 10 soal. Setiap soal hanya bisa dijawab sekali, dan jawaban benar bernilai 10. Baca dengan teliti, ya!' },
    ...soalP(1, 1, 5),
    { t: 'say', who: 'Sekar', text: 'Separuh jalan! Sekarang kita lihat lebih dekat partikel penyusun zat.' },
    ...soalP(1, 6, 10),
    { t: 'say', who: 'Sekar', text: 'Subbab 1 selesai, {nama}! Ayo lihat skormu.' },
  ];
  LEVEL[2] = [
    { t: 'walkin', bg: 'dapur' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Selamat datang di Subbab 2: Perubahan Wujud Zat!' },
    { t: 'say', who: 'Sekar', text: 'Di dapur malam ini, malam dipanaskan sampai mencair lalu membeku lagi di kain. Air pun bisa menguap.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Hehe, perubahan wujud itu gampang. Tebak saja jawabannya!' },
    HIDE('L'),
    { t: 'say', who: 'Sekar', text: 'Jangan dengarkan Si Kilat. Perhatikan apakah zat menyerap kalor atau melepas kalor.' },
    ...soalP(2, 11, 15),
    { t: 'say', who: 'Sekar', text: 'Bagus! Sekarang soal-soalnya butuh analisis lebih dalam.' },
    ...soalP(2, 16, 20),
    { t: 'say', who: 'Sekar', text: 'Subbab 2 selesai, {nama}! Ayo lihat skormu.' },
  ];
  LEVEL[3] = [
    { t: 'walkin', bg: 'halaman' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Selamat datang di Subbab 3: Perubahan Fisika dan Kimia!' },
    { t: 'say', who: 'Sekar', text: 'Pertanyaan kuncinya satu: apakah terbentuk zat baru? Kalau tidak, itu perubahan fisika. Kalau ya, itu perubahan kimia.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Semua yang dipanaskan pasti perubahan kimia! Percaya deh.' },
    HIDE('L'),
    { t: 'say', who: 'Sekar', text: 'Itu jebakan Si Kilat. Dipanaskan belum tentu menghasilkan zat baru.' },
    ...soalP(3, 21, 25),
    { t: 'say', who: 'Sekar', text: 'Separuh jalan! Sekarang giliranmu merancang pengelompokan.' },
    ...soalP(3, 26, 30),
    { t: 'say', who: 'Sekar', text: 'Kamu sudah menyelesaikan ketiga subbab, {nama}! Ilmu membatik dan IPA-mu makin lengkap.' },
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
    { t: 'say', text: 'Tapi harapan belum hilang. Kampoeng Batik Jetis menunggu pembatik muda yang mau belajar dengan sabar dan teliti.' },
  ];
  const INTRO = [
    { t: 'walkin', bg: 'gapura' },
    { t: 'show', slot: 'R', who: 'sekar' },
    { t: 'say', who: 'Sekar', text: 'Selamat datang di Kampoeng Batik Jetis, {nama}! Aku Sekar, burung merak penjaga motif Batik Jetis.' },
    { t: 'say', who: 'Sekar', text: 'Membatik itu penuh ilmu IPA: wujud zat, perubahan wujud, sampai perubahan fisika dan kimia.' },
    { t: 'show', slot: 'L', who: 'kilat' },
    { t: 'say', who: 'Si Kilat', text: 'Hehehe... Untuk apa repot belajar? Aku punya banyak jalan pintas.' },
    HIDE('L'),
    { t: 'say', who: 'Sekar', text: 'Itu Si Kilat. Dia suka membujuk orang menebak asal-asalan. Hati-hati dengan bujukannya, ya.' },
    { t: 'say', who: 'Sekar', text: 'Ada tiga subbab, masing-masing 10 soal. Setiap jawaban benar bernilai 10.' },
    { t: 'say', who: 'Sekar', text: 'Subbab 1 bisa langsung dikerjakan. Subbab berikutnya terbuka setelah subbab sebelumnya selesai, dan di kelas, gurumu yang membukanya. Ayo, kita masuk lewat gapura!' },
  ];

  /* ===================== FUNGSI ===================== */
  const HURUF = ['A', 'B', 'C', 'D'];
  const salin = (o) => JSON.parse(JSON.stringify(o));
  const INDEKS = {};
  SOAL.forEach((s) => {
    const id = 's' + s.no;
    if (INDEKS[id]) throw new Error('Nomor soal ganda: ' + s.no);
    const k = HURUF.indexOf(s.kunci);
    if (k < 0 || s.opsi.length !== 4) throw new Error('Kunci/opsi soal ' + s.no + ' tidak valid');
    const judul = s.tanya.length > 110 ? s.tanya.slice(0, 108) + '…' : s.tanya;
    INDEKS[id] = { id, no: s.no, level: s.p, tipe: 'soal', ranah: s.ranah, kategori: s.kategori, judul, kunci: k, soal: s };
  });
  const SCORED = ['soal'];

  function soalKlien(s) {
    return { t: 'soal', id: 's' + s.no, no: s.no, ranah: s.ranah, isi: salin(s.isi), tanya: s.tanya, opsi: s.opsi.slice() };
  }
  /** Versi subbab untuk klien: tanpa kunci jawaban dan pembahasan. */
  function levelKlien(n) {
    const L = LEVEL[n];
    if (!L) return null;
    let urut = 0;
    return L.map((b) => {
      if (b.t !== 'soal') return salin(b);
      urut++;
      return Object.assign(soalKlien(INDEKS[b.id].soal), { urut });
    });
  }
  function idsLevel(n) { return (LEVEL[n] || []).filter((b) => b.t === 'soal').map((b) => b.id); }

  /** Memeriksa jawaban (indeks 0-3). Mengembalikan benar/salah, kunci, dan pembahasan. */
  function periksa(id, j) {
    const info = INDEKS[id];
    if (!info) return { err: 'Soal tidak dikenal.' };
    if (!Number.isInteger(j) || j < 0 || j > 3) return { err: 'Jawaban tidak valid.' };
    return { benar: j === info.kunci, kunci: info.kunci, pembahasan: info.soal.pembahasan };
  }

  function umum() {
    const JUMLAH = {}; for (let n = 1; n <= JUMLAH_PERTEMUAN; n++) JUMLAH[n] = idsLevel(n).length;
    return salin({ LOC, TOPIK, TEMPAT, RANAH, INDIKATOR, PROLOG, INTRO, JUMLAH, JUMLAH_PERTEMUAN, NILAI_PER_SOAL });
  }

  return { JUMLAH_PERTEMUAN, NILAI_PER_SOAL, HURUF, LOC, TOPIK, TEMPAT, RANAH, INDIKATOR, SOAL, LEVEL, PROLOG, INTRO, INDEKS, SCORED, levelKlien, idsLevel, periksa, umum };
});
