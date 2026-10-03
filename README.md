# Petualangan Batik Jetis (versi online)

Game edukasi Batik Jetis Sidoarjo dan IPA untuk sekolah dasar. Siswa bermain bersama dengan **kode kelas 6 angka**, **link**, atau **QR**, seperti Quizizz. Setiap jawaban langsung dinilai server dan masuk ke **papan peringkat** dari skor tertinggi sampai terendah.

## Isi proyek

```
server.js              Server: kelas, kode, skor, papan peringkat (Express + Socket.IO)
shared/konten.js       Cerita, soal, dan KUNCI JAWABAN (hanya dibaca server)
shared/skor.js         Aturan poin ala Quizizz
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

1. Guru membuka **dasbor guru**, mengisi nama kelas, memilih misi yang dimainkan, lalu menekan **Buat kelas**.
2. Kode 6 angka dan QR muncul besar di layar. Tampilkan di proyektor.
3. Siswa membuka halaman pemain, memasukkan kode, menulis nama, dan memilih avatar. Mereka menunggu di lobi.
4. Guru menekan **Mulai permainan**. Semua siswa mulai dari prolog, lalu bermain dengan kecepatan masing-masing.
5. Dasbor menampilkan papan peringkat langsung: podium 3 besar, skor, persentase benar di percobaan pertama, progres, misi selesai, dan status online. Tiga skor terendah ditandai **Perlu dibantu**.
6. Panel **Soal tersulit** mengurutkan soal dari yang paling sering salah, untuk bahan pembahasan.
7. Guru menekan **Akhiri permainan**. Siswa langsung melihat hasil akhir dan peringkatnya. Tekan **Unduh hasil (CSV)** untuk membuka nilai di Excel.

Siswa yang memuat ulang halaman atau terputus internetnya akan otomatis kembali ke kelasnya. Poinnya tidak hilang.

## Aturan poin

| | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Benar di percobaan pertama | 600 | 700 | 800 | 900 |
| Benar di percobaan kedua | 300 | 350 | 400 | 450 |
| Benar di percobaan ketiga dst. | 120 | 140 | 160 | 180 |

- **Bonus kecepatan** sampai +300, hanya untuk benar di percobaan pertama. Batas waktunya 30 detik untuk pilihan ganda dan 60 detik untuk memilih benda atau mengurutkan. Batang "Bonus kecepatan" di layar menunjukkan sisa waktunya.
- **Bonus beruntun** +100 per jawaban benar pertama berturut-turut, maksimal +300.
- Setiap soal hanya dinilai sekali. Bila skor sama, peringkat ditentukan oleh jumlah benar pertama, lalu siapa yang lebih dulu mencapainya.

Angka-angka ini bisa diubah di `shared/skor.js`.

## Mengubah atau menambah soal

Buka `shared/konten.js`. Setiap tantangan punya `id` unik dan salah satu jenis berikut:

- `quiz`: pilihan ganda (`opts`, tandai jawaban benar dengan `ok: 1`, ada `hint` dan `explain`)
- `choice`: pilihan cerita melawan Si Kilat (`after` untuk jawaban benar, `conseq` untuk adegan akibat jawaban salah)
- `pick`: pilih semua benda yang benar (`items: [ikon, label, 1/0]`)
- `order`: urutkan langkah (`steps` ditulis dalam urutan benar; server mengacaknya)

Kunci jawaban tidak pernah dikirim ke browser siswa. Browser hanya menerima soal dan umpan balik setelah menjawab.

## Meng-online-kan (supaya bisa diakses dari mana saja)

Server ini butuh hosting yang menjalankan **Node.js** dan mendukung **WebSocket**. Hosting statis (GitHub Pages, Netlify biasa) tidak cukup.

### Pilihan A: Render.com (mudah, ada paket gratis)
1. Unggah folder ini ke repositori GitHub.
2. Di Render, pilih **New → Web Service**, sambungkan repositorinya.
3. Build command: `npm install`, start command: `npm start`. File `render.yaml` sudah disiapkan.
4. Setelah selesai, Render memberi alamat seperti `https://batik-jetis.onrender.com`. Bagikan alamat itu ke siswa.

Catatan paket gratis: server bisa "tertidur" bila lama tidak dipakai, jadi buka dasbor guru beberapa menit sebelum kelas dimulai. Penyimpanan file di paket gratis juga bisa terhapus saat server dimulai ulang, jadi **unduh CSV setelah kelas selesai**.

### Pilihan B: Railway, Fly.io, atau VPS
- Jalankan `npm install` lalu `npm start` (atau gunakan `Dockerfile`).
- Atur variabel `DATA_DIR` ke folder yang permanen (misalnya volume/disk) supaya data kelas tetap tersimpan.

### Variabel lingkungan
| Nama | Fungsi | Bawaan |
|---|---|---|
| `PORT` | Port server | `3000` |
| `DATA_DIR` | Folder penyimpanan data kelas | `./data` |
| `MAKS_PEMAIN` | Batas siswa per kelas | `200` |

Data kelas disimpan di `DATA_DIR/kelas.json`. Kelas otomatis dihapus setelah 14 hari, sesi latihan setelah 1 hari.

## Menguji dengan banyak pemain

Jalankan server, lalu di terminal lain:

```bash
npm run uji -- 30 http://localhost:3000
```

Perintah ini membuat kelas, memasukkan 30 siswa bot yang menjawab bersamaan, lalu menampilkan papan peringkat. Tambahkan `BIARKAN=1` di depan perintah agar kelasnya tidak diakhiri, sehingga bisa dilihat di dasbor guru.

## Pratinjau tanpa server

```bash
npm run preview
```

Hasilnya `dist/pratinjau.html`, bisa dibuka langsung di browser untuk mencoba cerita satu pemain. Versi ini memuat kunci jawaban di dalam file, jadi gunakan hanya untuk mencoba, bukan untuk penilaian.

## Teknologi

- **Node.js + Express**: server web dan unduhan CSV/QR
- **Socket.IO**: koneksi langsung untuk lobi, skor, dan papan peringkat
- **qrcode**: membuat QR kode kelas
- **HTML, CSS, JavaScript murni + SVG**: game tanpa engine berat, jadi ringan di Chromebook dan HP sekolah. Animasi gapura memakai SVG (filter riak kain, awan, burung, kilau papan).

## Animasi masuk lewat gapura

Setelah intro (dan setiap kali siswa menekan **Lanjutkan**), tokoh berjalan masuk ke kampung lewat gapura:

1. Kamera mundur memperlihatkan gapura utuh sampai ke jalan.
2. Tokoh berjalan menjauh dengan ayunan tangan dan kaki, makin kecil karena perspektif, lalu melintas di bawah lengkungan. Setelah melintas, tokoh tertutup tiang dan palang gapura.
3. Sekar terbang mendahului, lalu kamera maju menembus gapura dan layar memudar ke peta.

Cara kerjanya ada di `lewatGapura()` (`public/js/game.js`) dan `gapuraBagian()` / `gapuraLapisan()` (`public/js/gambar.js`). Dunia gapura dibagi 4 lapisan kedalaman: langit, kampung di balik gapura, bidang gapura, dan jalan depan. Posisi dan ukuran tokoh dihitung dari kedalamannya, dan kamera maju dengan efek parallax. Animasi bisa dilewati dengan mengetuk layar dan otomatis dimatikan bila perangkat meminta gerakan dikurangi (*reduced motion*).
