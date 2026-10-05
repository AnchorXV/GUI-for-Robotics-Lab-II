# PRD: AutoStack Operator Dashboard (Front-end Tahap 1, Revisi 2)

Dokumen ini adalah instruksi kerja untuk OpenCode. Baca seluruhnya sebelum menulis kode. Jika ada hal yang belum tercakup, ikuti bagian 13.

Perubahan revisi 2 (dibanding revisi 1): skor dan kontrol berlaku untuk satu tim, selector robot dihapus, data yang tidak punya sumber dihapus, teks ROS2 diganti dengan ESP32-CAM, dan waktu memakai zona lokal WIB.

Perubahan revisi 3: warna target diundi per match dan dipilih operator, bonus koleksi lengkap diganti bonus tiga kubus satu warna target, jam dan timestamp memakai Intl dengan zona tetap.

## 1. Ringkasan

Dashboard web statis untuk operator tim pada kompetisi AutoStack Challenge (RKS304, Universitas Airlangga). Satu tim mengoperasikan satu robot. Dashboard dijalankan di localhost di laptop. Tahap ini memakai data mock. Robot nyata, firmware, dan bridge belum tersedia, sehingga sumber data harus bisa diganti tanpa mengubah UI.

## 2. Tujuan dan non-tujuan

Tujuan:
- Antarmuka lengkap yang bisa diuji secara visual dengan data mock.
- Aturan kompetisi (timer, batas kubus, skor, penalti) berjalan sesuai buku aturan.
- Pemisahan UI, state, sumber data, dan aturan.

Non-tujuan:
- Koneksi WebSocket, UDP, atau TCP ke robot.
- Stream video nyata. Canvas hanya placeholder.
- Deteksi warna atau kubus dari video.
- Dukungan tablet dan HP. Fokus pada laptop.
- Framework, bundler, atau dependency runtime.
- Selector robot atau mode multi-robot.

## 3. Pengguna

Operator tim di depan laptop saat kompetisi. Pada Fase A operator boleh melihat arena tetapi tidak boleh menyentuh kendali. Pada Fase B operator membelakangi arena dan hanya melihat feed kamera. Tombol harus besar dan terbaca dari jarak beberapa meter.

Pengembang tim membutuhkan kontrak data yang jelas agar sumber live bisa ditambahkan nanti.

## 4. Aturan teknis wajib

Stack:
- HTML5, CSS3, JavaScript ES Module (vanilla). Tanpa React, Vue, jQuery, atau bundler.
- Tanpa framework CSS. Variabel warna di `:root`.
- Browser: Chrome dan Edge versi terbaru di laptop.
- Seluruh UI berbahasa Inggris. Istilah teknis (UDP, TCP, latency, RSSI) dipakai apa adanya.

Struktur folder: ikuti persis daftar di bawah. Jangan menambah, menghapus, atau mengganti nama file atau folder. Jika sebuah modul perlu dipecah, tulis TODO di file yang sudah ada.

```
autostack-gui/
├── index.html
├── README.md
├── PRD.md
├── .gitignore
├── css/
│   ├── base.css
│   ├── layout.css
│   └── components.css
├── js/
│   ├── main.js
│   ├── config.js
│   ├── state.js
│   ├── ui/
│   │   ├── telemetry.js
│   │   ├── controls.js
│   │   ├── timer.js
│   │   ├── score.js
│   │   └── log.js
│   ├── data/
│   │   ├── source.js
│   │   ├── mock.js
│   │   └── live.js
│   └── rules/
│       └── scoring.js
├── assets/
│   ├── img/
│   └── mock/
│       └── telemetry.json
└── tests/
    └── scoring.test.js
```

Catatan: `main.js` harus dipecah ke modul `ui/`. Setiap modul UI mengekspor `init()` dan `render(state)`, dan dipanggil dari `main.js`.

Folder `stitch/` (jika ada) hanya dibaca sebagai referensi visual dan tidak ditulis.

## 5. Layout dan komponen

Layout desktop, lebar minimum 1280 px, dirancang untuk 1366×768 dan 1920×1080. Tidak ada scroll vertikal pada 1920×1080 untuk konten utama.

```
+-----------------------------------------------------------------------+
| HEADER: brand, team name, phase selector, WiFi, time (WIB), mode      |
+---------------------------------+-------------------------------------+
| VIDEO (ESP32-CAM placeholder)   | TELEMETRY                           |
| + blind zone bar                |                                     |
+---------------------------------+-------------------------------------+
| CONTROLS                        | TIMER, SCORE, COUNTERS, VIOLATION   |
+---------------------------------+-------------------------------------+
| EVENT LOG                                                             |
+-----------------------------------------------------------------------+
```

Implementasi memakai CSS Grid dengan `grid-template-areas`. Panel memakai `min-width: 0`.

### 5.1 Header (`index.html`, `css/layout.css`)
- Brand: "AutoStack Operator".
- Team name: diambil dari `CONFIG.TEAM_NAME`. Aksen warna mengikuti `targetColor` match; sebelum target dipilih aksen netral.
- Phase selector: tombol Phase A dan Phase B. Mengganti fase menghentikan timer dan mengembalikannya ke 04:00. Skor tidak di-reset.
- WiFi indicator: "CH {channel} · {rssi} dBm", warna sesuai bagian 7.
- Waktu: jam lokal WIB, format HH:MM:SS, dengan label "WIB".
- Mode badge: "MOCK" atau "LIVE" sesuai `CONFIG.USE_MOCK`.
- Target picker di panel skor: tiga tombol Red, Green, Blue. Label "TARGET: {warna}" atau "TARGET: NOT SET" bila belum dipilih. Tombol deposit nonaktif sampai target dipilih.
- Tidak ada badge versi.

### 5.2 Video panel (`index.html`, `css/components.css`)
- Canvas 4:3 gelap dengan teks "NO SIGNAL (MOCK)" dan subteks "AWAITING ESP32-CAM STREAM (TCP)".
- Label "PRIMARY CAMERA FEED" dan tag "ROBOT" dengan warna tim.
- Blind zone bar di bagian bawah canvas. Aktif (warna kuning, teks "BLIND ZONE ACTIVE") saat `blindZone === true`. Tidak aktif (redup, teks "BLIND ZONE CLEAR") jika tidak.
- Tidak ada angka FPS atau resolusi.

### 5.3 Telemetry panel (`ui/telemetry.js`)
Baris label dan nilai:
- Odometry (x, y, θ): meter dan radian, dua desimal.
- Battery: tegangan V dua desimal. Kuning di bawah 11,0 V, merah di bawah 10,5 V. Tidak ada persentase.
- Latency: ms. Merah di atas 100 ms.
- Lift: `up` atau `down`, ditampilkan sebagai "UP" atau "DOWN".
- Gripper: `open` atau `closed`, ditampilkan sebagai "OPEN" atau "CLOSED".
- Stale: jika `timestamp` terakhir lebih dari 500 ms lalu, tampilkan badge "STALE" dan redupkan panel. Ini otomatis, tanpa tombol manual.

### 5.4 Controls panel (`ui/controls.js`)
- D-pad: Forward, Left, Stop, Right, Backward. Tidak ada angka jarak atau sudut pada tombol.
- Actuator: "Lift Up", "Lift Down", "Gripper Open", "Gripper Close". Tanpa angka mm atau cm.
- Mode toggle: Manual dan Autonomous. Autonomous hanya aktif di Phase A. Di Phase B tombol nonaktif dan diberi tooltip "Not available in Phase B".
- Di Phase B, jika `outOfBase === true`, D-pad dan Gripper nonaktif dan badge "OUT OF BASE: drive disabled" muncul di panel ini.
- Setiap klik memanggil `sendCommand(cmd)` dari `data/source.js`. Mock hanya mencatat ke log.
- Shortcut: W, A, S, D untuk D-pad. Space untuk Stop. Q dan E untuk Lift Up dan Lift Down. Hint di panel: "KEYBOARD: W A S D · SPACE STOP · Q E LIFT". Shortcut nonaktif saat fokus di input.
- Tinggi tombol minimal 44 px dan `:focus-visible` terlihat.

### 5.5 Timer panel (`ui/timer.js`)
- Countdown MM:SS dari 04:00 (240 detik).
- Tombol Start, Pause, Reset. Start nonaktif jika fase belum dipilih.
- 30 detik terakhir: teks merah dan berkedip pelan.
- Saat waktu habis: timer berhenti, event "PHASE END" masuk ke log, kontrol Phase dinonaktifkan.
- Waktu dihitung dari `Date.now()`, bukan akumulasi `setInterval`.

### 5.6 Score panel (`ui/score.js`)
Skor bersifat tingkat tim.
- Label besar: "TEAM SCORE", nilai dari `state.teamScore`, subteks "Phase A {n} · Phase B {n}".
- Counter "Carried: n / 3" (Phase A) dengan tiga tombol warna Red, Green, Blue. Setiap klik menambah 1 kubus warna itu (maksimal 3) dan mencatatnya di `carriedColors`. Tombol "Deposit" mengirim seluruh kubus sekaligus; `rules/scoring.js` membandingkan tiap warna dengan `targetColor` (+30 warna target, −20 lainnya). Benar atau salah ditentukan `targetColor`, bukan pilihan operator. Poin hanya dihitung oleh `rules/scoring.js`.
- Counter "Stack: n / 5" (Phase B) dengan tombol + dan −.
- Panel "Hold 10 s": progress bar dan teks "n / 10 s". Timer hold dimulai saat stack ≥ 2 dan reset jika stack berubah. Saat selesai, poin tumpukan ditambahkan sesuai bagian 6. Hold reset tidak mengurangi poin yang sudah diberikan.
- Tombol "Log Violation" membuka `<dialog>` native dengan pilihan penalti dari bagian 6.
- UI tidak boleh menghitung poin sendiri.

### 5.7 Log panel (`ui/log.js`)
- Format `[HH:MM:SS] message`, waktu lokal WIB.
- Maksimum 200 entri. Entri lama dibuang.
- Tipe: `info`, `command`, `score`, `penalty`, `warning`. Tipe menentukan warna border kiri.
- Tombol "Export log" mengunduh `.txt`.
- Tidak ada entri fiktif. Entri hanya berasal dari aksi operator, perubahan fase, perubahan skor, penalti, dan event sensor mock.

## 6. Aturan kompetisi (sumber: buku panduan)

Nilai di `config.js` dan `rules/scoring.js` harus sama persis dengan bagian ini.

Phase A (koleksi otonom), 4 menit:
- Maksimum 3 kubus dibawa sekaligus.
- Kubus warna target: +30. Kubus warna lain: −20.
- Bonus +50, sekali per match: satu deposit berisi tepat 3 kubus dengan warna yang sama dengan `targetColor`.

Phase B (stacking teleoperasi), 4 menit:
- Tumpukan maksimum 5 kubus.
- Poin dihitung dari tinggi tumpukan yang berdiri 10 detik: 2 = 20, 3 = 50, 4 = 100, 5 = 200.
- Robot tidak boleh keluar base.

Penalti (dicatat operator):
- Robot masuk base tim lain: −50
- Menahan robot lawan lebih dari 5 detik: −50
- Menabrak robot lawan dengan sengaja: −80
- Operator menoleh ke arena pada Phase B: peringatan pertama, lalu −50 pada pelanggaran berikutnya. Operator menoleh pertama kali hanya mencatat peringatan.
- Pandangan tambahan: diskualifikasi. Tampilkan banner merah lebar penuh "DISQUALIFIED", kunci semua kontrol, dan aktifkan hanya tombol "Reset Match".

Penalti dikurangkan dari `teamScore` sebagai angka negatif dan dicatat di log dengan tipe `penalty`.

## 7. Data contract

Format telemetri mengikuti `assets/mock/telemetry.json`:

```json
{
  "timestamp": 1730000000000,
  "phase": "A",
  "odometry": { "x": 0.0, "y": 0.0, "theta": 0.0 },
  "battery_v": 11.8,
  "wifi": { "channel": 6, "rssi": -58, "latency_ms": 42 },
  "servo": { "lift": "down", "gripper": "open" },
  "blindZone": false,
  "outOfBase": false,
  "cubes_carried": 0,
  "stack_height": 0
}
```

Catatan kontrak:
- Field `robot` dihapus. Identitas tim ada di `config.js`.
- Field `score` dihapus dari telemetri. Skor dihitung di sisi dashboard lewat `rules/scoring.js`, bukan dikirim oleh robot.
- `timestamp` dalam milidetik Unix.
- `wifi.channel` hanya 1, 6, atau 11.
- `servo.lift` bernilai `up` atau `down`. `servo.gripper` bernilai `open` atau `closed`.
- Semua modul UI membaca data lewat `state.js`. Tidak ada modul UI yang mengimpor `data/mock.js` langsung.

## 8. Sumber data

`data/source.js` mendefinisikan kontrak:

```js
// Setiap sumber data mengekspos:
// - start()            : mulai menerima/menghasilkan telemetri
// - stop()             : hentikan
// - sendCommand(cmd)   : kirim perintah kontrol (string)
// - onTelemetry(fn)    : daftarkan callback, dipanggil dengan objek telemetri
```

- `data/mock.js`: implementasi dengan `setInterval` 200 ms. Posisi bergerak sederhana, baterai turun perlahan, noise kecil pada latency dan tegangan. Field `blindZone` dan `outOfBase` berubah acak dengan probabilitas rendah.
- `sendCommand` pada mock hanya mencatat ke log bertipe `command`.
- `data/live.js`: stub. Setiap metode melempar `Error("Live source not implemented")`.
- `main.js` memilih sumber berdasarkan `CONFIG.USE_MOCK`.

## 9. Pengujian

Pengujian manual di browser dengan mock. Checklist:
- Timer dari 04:00 dan berhenti di 00:00.
- Ganti fase tidak me-reset skor.
- Carry tidak bisa melewati 3.
- Stack tidak bisa melewati 5. Hold reset jika stack berubah.
- Poin Phase B untuk 2, 3, 4, dan 5 kubus sesuai tabel.
- Skor tim bertambah dari Phase A dan Phase B.
- Autonomous nonaktif di Phase B.
- `outOfBase` menonaktifkan drive dan menampilkan badge.
- Diskualifikasi mengunci kontrol.
- Telemetri stale muncul otomatis jika data berhenti lebih dari 500 ms.
- Blind zone bar aktif sesuai `blindZone`.
- Waktu header menampilkan WIB.
- Export log menghasilkan `.txt`.
- Shortcut berfungsi dan tidak aktif saat mengetik di input.
- Tidak ada error di console.

`tests/scoring.test.js` (opsional) memakai `node:test`: `node --test tests/`.

## 10. Kualitas kode

- Setiap file diawali komentar singkat tentang tanggung jawabnya.
- Komentar hanya untuk alasan dan batasan.
- Nama dalam bahasa Inggris dan spesifik domain. Hindari `data`, `item`, `temp`, `handler`.
- `const` secara default.
- Tidak ada `console.log` tertinggal kecuali di `log.js`.
- DOM query hanya di `main.js` dan `ui/`, tidak di `rules/` atau `state.js`.
- Tidak ada inline `style` kecuali nilai dinamis.
- Semantik HTML: `header`, `main`, `section`, `button`, `dialog`, `label`.
- JavaScript: 2 spasi, titik koma, string dengan tanda kutip ganda.

## 11. Gaya visual

Dipakai di lapangan dengan cahaya terang. Prioritaskan kontras dan keterbacaan.
- Latar abu-abu terang (#F4F6F8), teks navy (#1B2A4A), panel putih, border #D9DEE5, radius 8 px.
- Warna robot: green #2A9D4B, blue #1F6FEB, red #D62828.
- Peringatan #E0A100. Bahaya #B42318.
- Font sistem sans-serif. Angka timer dan skor memakai `font-variant-numeric: tabular-nums`.
- Tidak ada gradien, bayangan tebal, emoji, atau kartu bersarang.
- Kontras teks minimal WCAG AA, termasuk label kecil dan teks di atas latar gelap.

## 12. Definisi selesai

1. `index.html` berjalan lewat `python -m http.server` tanpa error console.
2. Semua bagian di bagian 5 tampil dan berfungsi dengan mock.
3. Aturan bagian 6 diterapkan dan angka di UI sama dengan tabel.
4. Struktur folder sama dengan bagian 4.
5. Tidak ada teks Indonesia di UI.
6. Tidak ada `fetch` atau `WebSocket` selain stub.
7. Semua TODO memakai format `// TODO(opencode): <yang kurang> — <default yang dipilih>`.
8. Tidak ada elemen yang disebut di bagian 14 (daftar yang dihapus).

## 13. Menangani hal yang belum jelas

1. Pilih default yang paling masuk akal berdasarkan dokumen ini dan buku aturan.
2. Terapkan default.
3. Tulis TODO di lokasi kode yang relevan.

Jangan menambah fitur di luar dokumen ini. Jangan mengubah aturan di bagian 6, walaupun terasa tidak logis. Tulis TODO dan lanjutkan.

## 14. Daftar yang dihapus dari desain

Jangan diimplementasikan: bar preset state, tombol "Toggle Stale", badge versi, angka FPS dan resolusi, persentase baterai, angka jarak atau mm pada aktuator, "Ultrasonic sensor active", teks ROS2, selector robot, label "TEAM SCORE" yang berdampingan dengan selector robot, dan entri log yang tidak berasal dari aksi atau event nyata.

## 15. Urutan pengerjaan

1. Ubah `config.js` (TEAM_NAME, RULES) dan `mock/telemetry.json` ke skema bagian 7.
2. Lengkapi `rules/scoring.js` sesuai bagian 6.
3. Buat `state.js` dengan field `teamScore`, `phaseAScore`, `phaseBScore`, `phase`, `timeLeft`, `carried`, `stack`, `holdSeconds`, `outOfBase`, `blindZone`, `disqualified`, `events`, plus `targetColor`, `carriedColors`, dan `bonusGiven`.
4. Implementasikan `data/source.js`, `data/mock.js`, dan stub `data/live.js`.
5. Pecah `main.js` ke modul `ui/`, mulai dari telemetri dan timer.
6. Controls, score, dialog penalti, dan diskualifikasi.
7. Log dan export.
8. CSS sesuai bagian 11 dan layout bagian 5.
9. Checklist bagian 9.
10. Perbarui README.md bila cara menjalankan berubah.
