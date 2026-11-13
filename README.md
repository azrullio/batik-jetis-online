# Petualangan Batik Jetis (versi online)

Game edukasi IPA SMP kelas VII bertema Batik Jetis Sidoarjo. Siswa bermain bersama dengan **kode kelas 6 angka**, **link**, atau **QR**, seperti Quizizz. Materinya dibagi menjadi **3 pertemuan** berisi 10 soal pilihan ganda dari instrumen latihan soal gamifikasi:

| Pertemuan | Materi | Ranah |
|---|---|---|
| 1 | Wujud Zat & Model Partikel | C1–C2 (LOTS) |
| 2 | Perubahan Wujud Zat | C3–C4 |
| 3 | Perubahan Fisika dan Kimia | C5–C6 (HOTS) |

Pertemuan 1 langsung terbuka. **Pertemuan 2 dan 3 dikunci** dan hanya bisa dibuka guru dari dasbor, berlaku untuk semua siswa yang memakai kode kelas itu. Setiap jawaban dinilai server dan masuk ke **papan peringkat**.

## Isi proyek

```
server.js              Server: kelas, kode, skor, papan peringkat (Express + Socket.IO)
shared/konten.js       Cerita, soal, dan KUNCI JAWABAN (hanya dibaca server)
shared/skor.js         Aturan nilai (benar = 10 poin, satu kali menjawab)
public/index.html      Halaman pemain (siswa)
public/guru.html       Dasbor guru
public/js/gambar.js    Semua gambar & animasi (SVG), termasuk gapura Kampoeng Batik Jetis
public/js/game.js      Mesin cerita, peta, soal, papan peringkat pemain
public/js/net.js       Penghubung pemain ke server
public/js/guru.js      Logika dasbor guru
public/js/lokal.js     Mode offline untuk pratinjau
tools/uji-bot.js       Uji banyak pemain bersamaan dengan bot
tools/build-preview.js Membuat dist/pratinjau.html (satu pemain, tanpa server)
```

## Menjalankan di komputer sendiri

Butuh **Node.js 18 atau lebih baru** (unduh di nodejs.org).

```bash
npm install
npm start
```

- Halaman siswa: `http://localhost:3000`
- Dasbor guru: `http://localhost:3000/guru.html`

Supaya siswa di jaringan Wi-Fi yang sama bisa ikut, buka alamat IP komputer guru, misalnya `http://192.168.1.10:3000`.

## Cara bermain di kelas

1. Guru membuka **dasbor guru**, mengisi nama kelas, lalu menekan **Buat kelas**.
2. Kode 6 angka dan QR muncul besar di layar. Tampilkan di proyektor.
3. Siswa membuka halaman pemain, memasukkan kode, menulis nama, dan memilih avatar. Mereka menunggu di lobi.
4. Guru menekan **Mulai**. Siswa melihat prolog, masuk lewat gapura, lalu mengerjakan **Pertemuan 1**.
5. Setelah 10 soal selesai, siswa langsung melihat **nilainya** (0–100), bintang, dan rekap soal yang benar/salah. Pertemuan 2 tampil terkunci.
6. Di pelajaran berikutnya, guru menekan **Buka Pertemuan 2** di panel *Kunci pertemuan*. Siswa yang sedang online langsung mendapat pemberitahuan, dan peta mereka ikut terbuka. Lakukan hal yang sama untuk Pertemuan 3. Tombol **Kunci lagi** menutupnya kembali.
7. Siswa masuk lagi dengan **kode dan nama yang sama**. Bila memakai perangkat lain, game bertanya "Apakah itu kamu?" supaya siswa bisa melanjutkan nilainya, atau memakai nama baru bila ternyata siswa lain bernama sama.
8. Dasbor menampilkan papan peringkat langsung (nilai P1, P2, P3, skor total), **Soal tersulit**, dan **Analisis butir soal** lengkap dengan sebaran pilihan A–D.
9. Tekan **Unduh hasil (CSV)** untuk membuka nilai di Excel. **Tutup kelas** menghentikan semua jawaban, dan **Buka kelas lagi** membukanya kembali.

Dasbor kelas hanya bisa dibuka dari perangkat yang membuatnya. Untuk membukanya dari perangkat lain (misalnya laptop sekolah minggu depan), tekan **Salin link dasbor** dan simpan link itu baik-baik. Siapa pun yang memegang link tersebut bisa mengatur kelas.

## Aturan nilai

- Setiap soal hanya bisa dijawab **satu kali**. Siswa memilih jawaban lalu menekan **Kunci jawaban**, kemudian melihat jawaban yang benar dan pembahasannya.
- Jawaban benar bernilai **10 poin** (bobot 1 per soal pada instrumen). Satu pertemuan berisi 10 soal, jadi **nilai pertemuan 0–100** dan **skor total maksimal 300**.
- Bintang: nilai 85 ke atas ★★★, 60 ke atas ★★, di bawahnya ★.
- Bila skor sama, siswa yang total waktu menjawabnya lebih singkat berada di atas. Waktu per soal dibatasi 5 menit supaya tab yang ditinggal tidak merusak urutan.
- Siswa boleh keluar di tengah pertemuan. Saat kembali, soal yang sudah dikunci dilewati dan siswa melanjutkan dari soal berikutnya.
- Mode **Latihan sendiri** tidak memakai kunci guru: pertemuan terbuka berurutan dan boleh diulang.

Angka-angka ini ada di `shared/skor.js`.

## Isi file CSV

Satu baris per siswa: peringkat, nama, **Nilai P1, Nilai P2, Nilai P3**, skor total, jumlah benar, jumlah dijawab, waktu menjawab, lalu kolom **S1–S30** (1 = benar, 0 = salah) dan **J1–J30** (huruf jawaban siswa). Baris terakhir berisi kunci jawaban. Kolom S dan J bisa langsung dipakai untuk analisis butir soal (tingkat kesukaran, daya beda, efektivitas pengecoh).

## Mengubah soal

Semua soal ada di array `SOAL` di `shared/konten.js`. Setiap soal berisi:

- `no`, `p` (pertemuan 1–3), `ranah` (C1–C6), `kategori` (LOTS/HOTS)
- `isi`: stimulus. Bisa berupa teks, `{ ol: [...] }` daftar bernomor, `{ ul: [...] }` daftar biasa, atau `{ gambar: 'partikel' | 'grafik' }`
- `tanya`, `opsi` (4 pilihan A–D), `kunci` (`'A'`–`'D'`), dan `pembahasan`

Gambar model partikel (soal 10) dan grafik suhu malam (soal 16) digambar ulang sebagai SVG di `public/js/gambar.js` (objek `FIG`). Kunci jawaban tidak pernah dikirim ke browser siswa sebelum siswa mengunci jawabannya.

## Meng-online-kan (supaya bisa diakses dari mana saja)

Server ini butuh hosting yang menjalankan **Node.js** dan mendukung **WebSocket**. Hosting statis (GitHub Pages, Netlify biasa) tidak cukup.

### Pilihan A: Render.com (mudah, ada paket gratis)
1. Unggah folder ini ke repositori GitHub.
2. Di Render, pilih **New → Web Service**, sambungkan repositorinya.
3. Build command: `npm install`, start command: `npm start`. File `render.yaml` sudah disiapkan.
4. Setelah selesai, Render memberi alamat seperti `https://batik-jetis.onrender.com`. Bagikan alamat itu ke siswa.

Catatan paket gratis: server bisa "tertidur" bila lama tidak dipakai, jadi buka dasbor guru beberapa menit sebelum kelas dimulai. Penyimpanan file di paket gratis juga bisa terhapus saat server dimulai ulang. Karena satu kelas sekarang dipakai selama beberapa minggu (Pertemuan 1 sampai 3), **pakai hosting dengan disk permanen** (lihat Pilihan B) dan **unduh CSV setiap selesai satu pertemuan** sebagai cadangan.

### Pilihan B: Railway, Fly.io, atau VPS
- Jalankan `npm install` lalu `npm start` (atau gunakan `Dockerfile`).
- Atur variabel `DATA_DIR` ke folder yang permanen (misalnya volume/disk) supaya data kelas tetap tersimpan.

### Variabel lingkungan
| Nama | Fungsi | Bawaan |
|---|---|---|
| `PORT` | Port server | `3000` |
| `DATA_DIR` | Folder penyimpanan data kelas | `./data` |
| `MAKS_PEMAIN` | Batas siswa per kelas | `200` |
| `UMUR_KELAS_HARI` | Kelas dihapus setelah sekian hari tanpa aktivitas | `120` |

Data kelas disimpan di `DATA_DIR/kelas.json`. Kelas otomatis dihapus setelah 120 hari tanpa aktivitas (satu semester), sesi latihan setelah 7 hari. Data dari versi lama (4 misi) tidak dimuat lagi karena soalnya sudah berganti.

## Menguji dengan banyak pemain

Jalankan server, lalu di terminal lain:

```bash
npm run uji -- 30 http://localhost:3000
```

Perintah ini membuat kelas dan memasukkan 30 siswa bot. Bot mengerjakan Pertemuan 1, memastikan Pertemuan 2 tertolak selama masih dikunci, lalu guru (bot) membuka Pertemuan 2 dan 3. Di akhir, papan peringkat, statistik pertemuan, dan CSV diperiksa. Tambahkan `BIARKAN=1` di depan perintah agar kelasnya tidak ditutup, sehingga bisa dilihat di dasbor guru.

## Pratinjau tanpa server

```bash
npm run preview
```

Hasilnya `dist/pratinjau.html`, bisa dibuka langsung di browser untuk mencoba cerita dan soal satu pemain (tanpa kunci guru). Versi ini memuat kunci jawaban di dalam file, jadi gunakan hanya untuk mencoba, bukan untuk penilaian.

## Teknologi

- **Node.js + Express**: server web dan unduhan CSV/QR
- **Socket.IO**: koneksi langsung untuk lobi, skor, papan peringkat, dan buka/kunci pertemuan
- **qrcode**: membuat QR kode kelas
- **HTML, CSS, JavaScript murni + SVG**: game tanpa engine berat, jadi ringan di Chromebook dan HP sekolah. Animasi gapura memakai SVG (filter riak kain, awan, burung, kilau papan).

## Animasi masuk lewat gapura

Setelah intro (dan setiap kali siswa menekan **Lanjutkan**), tokoh berjalan masuk ke kampung lewat gapura:

1. Kamera mundur memperlihatkan gapura utuh sampai ke jalan.
2. Tokoh berjalan menjauh dengan ayunan tangan dan kaki, makin kecil karena perspektif, lalu melintas di bawah lengkungan. Setelah melintas, tokoh tertutup tiang dan palang gapura.
3. Sekar terbang mendahului, lalu kamera maju menembus gapura dan layar memudar ke peta.

Cara kerjanya ada di `lewatGapura()` (`public/js/game.js`) dan `gapuraBagian()` / `gapuraLapisan()` (`public/js/gambar.js`). Dunia gapura dibagi 4 lapisan kedalaman: langit, kampung di balik gapura, bidang gapura, dan jalan depan. Posisi dan ukuran tokoh dihitung dari kedalamannya, dan kamera maju dengan efek parallax. Animasi bisa dilewati dengan mengetuk layar dan otomatis dimatikan bila perangkat meminta gerakan dikurangi (*reduced motion*).
