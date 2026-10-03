/*
 * Membuat satu file HTML mandiri (mode latihan offline, tanpa server) di dist/pratinjau.html.
 * Berguna untuk mencoba cerita & tampilan tanpa menjalankan server.
 * Catatan: versi ini memuat kunci jawaban di dalam file, jadi jangan dipakai untuk penilaian kelas.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const R = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const html = R('public/index.html');
const isi = html.slice(html.indexOf('<!--ISI-->') + 10, html.indexOf('<!--/ISI-->'));
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const js = (s) => `<script>\n${s.replace(/<\/script/gi, '<\\/script')}\n</script>`;

const out = [
  '<title>Petualangan Batik Jetis</title>',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  fonts,
  `<style>\n${R('public/css/game.css')}\n</style>`,
  isi.replace('Di HP, putar layar ke mode lanskap supaya lebih nyaman.', 'Di HP, putar layar ke mode lanskap supaya lebih nyaman. Ini pratinjau satu pemain; kode kelas dan papan peringkat bersama ada di versi server.'),
  js(R('public/js/gambar.js')),
  js(R('shared/konten.js')),
  js(R('shared/skor.js')),
  js(R('public/js/lokal.js')),
  js(R('public/js/game.js')),
].join('\n');

const dist = path.join(__dirname, '..', 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'pratinjau.html'), out);
console.log('Ditulis: dist/pratinjau.html (' + Math.round(out.length / 1024) + ' KB)');
