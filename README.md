# AutoStack Challenge: Operator Dashboard

Dashboard web untuk mengoperasikan dan memantau robot AMR pada kompetisi AutoStack Challenge, mata kuliah Eksperimen Robotika II (RKS304), Program Studi Teknik Robotika dan Kecerdasan Buatan, Universitas Airlangga.

Saat ini repositori ini berisi antarmuka front-end saja. Robot dan firmware-nya masih dalam tahap pengembangan, sehingga seluruh data telemetri dibangkitkan secara simulasi (mock). Koneksi ke robot nyata disiapkan sebagai modul terpisah yang bisa ditukar tanpa mengubah UI.

## Fitur

- Satu tim, satu robot. Identitas tim dari `TEAM_NAME` di `js/config.js`; aksen warna mengikuti target undian.
- Panel video untuk feed ESP32-CAM (placeholder), termasuk indikator blind zone yang mengikuti data telemetri.
- Panel telemetri: odometri, tegangan baterai, latency, dan kondisi WiFi.
- Kontrol D-pad, lift, dan gripper. Pada tahap ini perintah hanya dicatat di log.
- Timer 4 menit per fase, target warna undian per match, counter kubus dibawa per warna (maks. 3), deposit batch dengan bonus tiga kubus satu warna, counter tumpukan (maks. 5), dan indikator penahanan 10 detik.
- Panel skor sesuai aturan AutoStack Challenge, dengan logika poin yang dipisah agar bisa diuji tanpa DOM.
- Pencatatan pelanggaran dan log event untuk kebutuhan laporan.

## Menjalankan secara lokal

Proyek memakai ES Module (`type="module"`), sehingga tidak bisa dibuka langsung lewat `file://`. Jalankan server lokal dari root repositori:

```bash
# Python 3
python -m http.server 8000

# atau Node.js
npx serve .
```

Buka `http://localhost:8000` di browser.

## Konfigurasi

Pengaturan utama ada di `js/config.js`:

| Variabel | Fungsi |
|---|---|
| `USE_MOCK` | `true` memakai data simulasi, `false` mencoba sumber data live. |
| `MOCK_INTERVAL_MS` | Interval pembangkitan data dummy (ms). |
| `TEAM_NAME` | Nama tim yang tampil di header. |
| `RULES` | Seluruh angka aturan kompetisi (durasi fase, kapasitas, tabel poin, penalti). |

Sumber data live belum diimplementasikan. Saat ini `js/data/live.js` hanya berupa placeholder yang melempar error jika dipanggil.

## Struktur direktori

```
autostack-gui/
├── index.html              # Entry point dashboard
├── README.md               # Cara menjalankan & konfigurasi
├── .gitignore
├── css/
│   ├── base.css            # Reset, variabel warna (merah/hijau/biru), tipografi
│   ├── layout.css          # Grid responsif
│   └── components.css      # Tombol, panel, timer, badge
├── js/
│   ├── main.js             # Bootstrap aplikasi
│   ├── config.js           # USE_MOCK, interval, batas aturan (max cubes, dll.)
│   ├── state.js            # Store state terpusat (pub/sub sederhana)
│   ├── ui/
│   │   ├── telemetry.js    # Render panel telemetri
│   │   ├── controls.js     # D-pad, lift, gripper, mode
│   │   ├── timer.js        # Countdown fase
│   │   ├── score.js        # Panel skor & aturan poin
│   │   └── log.js          # Log event
│   ├── data/
│   │   ├── source.js       # Antarmuka sumber data (interface)
│   │   ├── mock.js         # Generator data dummy
│   │   └── live.js         # Placeholder WebSocket/UDP bridge (nanti)
│   └── rules/
│       └── scoring.js      # Logika poin Fase A & B (murni, mudah diuji)
├── assets/
│   ├── img/                # Ikon, logo, ilustrasi
│   └── mock/
│       └── telemetry.json  # Sampel data
└── tests/
    └── scoring.test.js     # Unit test aturan skor
```

## Arsitektur data

Telemetri dari robot direncanakan mengalir melalui jalur berikut:

```
ESP32-CAM ──TCP (video)──► Laptop (bridge) ──WebSocket──► Dashboard
Dashboard ──WebSocket──► Laptop (bridge) ──UDP (perintah)──► ESP32 ──► Arduino
```

Perintah kendali dikirim lewat UDP tanpa retransmisi, sesuai batasan kanal pada materi. Video dikirim lewat TCP. Karena itu UI menganggap telemetri usang jika tidak diperbarui dalam 500 ms.

Format data telemetri contoh ada di `assets/mock/telemetry.json`. Ubah skema ini hanya dengan kesepakatan bersama anggota tim firmware dan bridge.

## Pengujian

```bash
node --test tests/
```

Pengujian mencakup logika skor Fase A dan Fase B. Logika tersebut tidak bergantung pada DOM sehingga bisa dijalankan di Node. Di Windows, jika bentuk direktori gagal, jalankan file-nya langsung: `node --test "tests/scoring.test.js"`.

## Catatan pengembangan

- Kontrol tombol masih berupa log. Saat bridge tersedia, `data-cmd` akan dikirim sebagai perintah UDP.
- Stream video belum disambungkan. Canvas saat ini hanya placeholder dengan teks status.
- Bar blind zone sudah mengikuti flag `blindZone` dari telemetri (mock membaliknya acak).