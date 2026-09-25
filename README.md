# 🎭 UNMASKED — Beyond "I'm Fine"
> **Aplikasi Jurnal Refleksi Diri Berbasis AI untuk Mahasiswa**  
> *"Ruang aman untuk memahami apa yang sebenarnya kamu rasakan dan butuhkan di balik kata 'baik-baik saja'."*

---

## 🌟 Tentang UNMASKED

Banyak mahasiswa merasa dituntut untuk selalu terlihat produktif, kuat, dan baik-baik saja (*Public Self*), padahal di dalam diri mereka sedang kelelahan, cemas, atau kewalahan (*Actual Feeling*).

**UNMASKED** adalah platform jurnal reflektif interaktif yang dirancang dengan estetika **Tactile Neobrutalism** (terinspirasi dari kertas catatan tempel, washi tape, dan coretan tangan) yang memandu pengguna melalui **alur 4 tahap terstruktur** yang dibantu oleh AI sebagai cermin pemantul yang empatik:

```
[ CHECK-IN & MASK ] ──► [ LOAD: BRAIN DUMP ] ──► [ NEED: REFLEKSI ] ──► [ ACTION ] ──► [ SUMMARY ]
Tampilan luar vs batin     Urai beban & kategori       Sintesis kebutuhan     1 aksi kecil      Rangkuman sesi
```

---

## 🚀 Alur Perjalanan Pengguna (5 Tahapan)

1. **Stage 1 — MASK (Citra Luar vs Ruang Batin)**:
   - Pengguna memilih bagaimana orang lain melihat dirinya (*Public Self* / persona).
   - Pengguna mengakui perasaan sebenarnya yang tersembunyi (*Actual Feeling*).
   - AI menelaah kontras dua lapisan diri tanpa menghakimi.
   - Pengguna mengonfirmasi atau mengoreksi hasil telaah melalui *Confirmation Card*.

2. **Stage 2 — LOAD (Curahan Pikiran & Penguraian Beban)**:
   - Lembar *Brain Dump* bebas sensor untuk mencurahkan semua yang memenuhi pikiran.
   - Fitur *Sticky Note* interaktif dengan klasifikasi tindakan:
     - 🟠 **Aksi** (*Bisa diubah/diselesaikan*)
     - 🔵 **Bagi** (*Bisa dibagi/butuh bantuan teman*)
     - 🟣 **Lepas** (*Di luar kendali/perlu diikhlaskan*)
   - AI menguraikan benang kusut cerita menjadi tema, emosi dominan, dan pola berulang.

3. **Stage 3 — NEED (Eksplorasi & Sintesis Kebutuhan)**:
   - Berangkat dari konteks MASK + LOAD + Koreksi pengguna.
   - AI menyusun 2–3 pertanyaan pendek reflektif (10–18 kata, bahasa santai, tanpa jargon psikologis rumit).
   - Berdasarkan jawaban pengguna, AI menyintesis kebutuhan utama yang paling relevan (*Rasa Kendali, Istirahat, Bantuan Nyata, Koneksi, Pelepasan Emosi, Rasa Aman*).

4. **Stage 4 — ACTION (Satu Langkah Kecil yang Masuk Akal)**:
   - Merumuskan 3 rekomendasi tindakan mikro (5–15 menit) yang realistis dan ramah kapasitas energi pengguna.
   - Pengguna memilih 1 tindakan utama untuk diselesaikan malam ini tanpa rasa bersalah.

5. **Stage 5 — SUMMARY (Rangkuman & Refleksi Perjalanan)**:
   - Kartu rangkuman utuh 4 dimensi refleksi diri.
   - Unduh rangkuman ke format teks (`.txt`) atau simpan bookmark sesi lokal.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router + Turbopack)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan palet kustom (*paper-base, paper-warm, marker-orange, sticker-pink, ink-charcoal*)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand) dengan middleware `persist` (localStorage) dan sinkronisasi hidrasi (`useStoreHydrated`)
- **AI Engine**: Google Gemini API via [`@google/genai`](https://www.npmjs.com/package/@google/genai)
  - Strategi fallback multi-model otomatis: `gemini-3.1-flash-lite` ➔ `gemini-3.5-flash-lite` ➔ `gemini-3.8-flash` ➔ `gemini-flash-latest`.
- **Validation**: [Zod](https://zod.dev/) untuk validasi data contract dan JSON schema AI.

---

## ⚡ Panduan Instalasi & Menjalankan Project (Untuk Rekan Developer)

### 1. Prasyarat
- **Node.js**: Versi `18.18+` atau `20+` disarankan.
- **Package Manager**: **Gunakan strictly `npm`** (hindari yarn/pnpm/bun agar `package-lock.json` tetap konsisten).

### 2. Clone & Pasang Dependensi
```bash
# Masuk ke folder project
cd unmasked-new

# Install seluruh paket dependensi
npm install
```

### 3. Konfigurasi Environment Variable (`.env.local`)
Salin file template `.env.example` menjadi `.env.local`:

```bash
# Di Windows PowerShell:
Copy-Item .env.example .env.local

# Atau di Linux/macOS/Git Bash:
cp .env.example .env.local
```

Buka file `.env.local` dan masukkan API Key Gemini Anda:
```env
GEMINI_API_KEY=AIzaSyD...your_actual_gemini_api_key_here
```
> 💡 *Belum punya API key? Dapatkan secara gratis dalam hitungan detik di [Google AI Studio](https://aistudio.google.com/app/apikey).*

### 4. Menjalankan Server Lokal (Development)
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 5. Memeriksa Tipe Data (Type Check)
```bash
npm run type-check
```

---

## 📂 Struktur Direktori

```
unmasked-new/
├── docs/                             # Spesifikasi lengkap, revisi, & data contract
│   ├── REVISI_UNMASKED.md            # Panduan revisi terkini (NEED stage, AI guidelines)
│   ├── UNMASKED_DATA_CONTRACT.md     # Skema tipe data & session state
│   ├── UNMASKED_PROJECT_GUIDE.md     # Panduan arsitektur & flow utama
│   └── UNMASKED_SPEC                 # Spesifikasi fungsional
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/ai/                   # Endpoint Backend AI
│   │   │   ├── mask/route.ts         # POST /api/ai/mask
│   │   │   ├── load/route.ts         # POST /api/ai/load
│   │   │   ├── need/prepare/route.ts # POST /api/ai/need/prepare (Pertanyaan AI)
│   │   │   ├── need/synthesize/route.ts # POST /api/ai/need/synthesize
│   │   │   ├── action/route.ts       # POST /api/ai/action
│   │   │   └── summary/route.ts      # POST /api/ai/summary
│   │   ├── api/safety/check/route.ts # POST /api/safety/check (Crisis detection)
│   │   ├── checkin/page.tsx          # Langkah MASK: Checkin
│   │   ├── public-self/page.tsx      # Langkah MASK: Persona luar
│   │   ├── actual-feeling/page.tsx   # Langkah MASK: Perasaan jujur
│   │   ├── mask-result/page.tsx      # Telaah hasil MASK
│   │   ├── brain-dump/page.tsx       # Langkah LOAD: Lembar curahan & sticky notes
│   │   ├── story-reflection/page.tsx # Telaah hasil LOAD
│   │   ├── need-sheet/page.tsx       # Langkah NEED: Pertanyaan kontekstual AI
│   │   ├── need-result/page.tsx      # Telaah hasil NEED
│   │   ├── action-step/page.tsx      # Langkah ACTION: Pilihan 1 aksi kecil
│   │   ├── summary/page.tsx          # Langkah SUMMARY: Rangkuman & unduh
│   │   ├── layout.tsx                # Root layout & Google Fonts
│   │   └── page.tsx                  # Halaman Beranda (Landing)
│   ├── components/                   # Komponen Reusable
│   │   ├── Header.tsx                # Header dengan navigasi step & tombol krisis
│   │   ├── BottomDock.tsx            # Sticky bar bawah (navigasi alur)
│   │   ├── MindfulLoading.tsx        # Animasi loading menenangkan saat AI memproses
│   │   ├── UserConfirmationCard.tsx  # Kartu konfirmasi & koreksi pengguna
│   │   ├── CrisisModal.tsx           # Modal darurat hotline krisis Indonesia
│   │   └── sections/                 # View logic tiap tahapan
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts             # Inisialisasi GoogleGenAI & multi-model fallback
│   │   │   └── prompts.ts            # System guidelines & prompt builder
│   │   └── safety/
│   │       └── crisisKeywords.ts     # Deteksi risiko & kontak darurat
│   ├── schemas/
│   │   └── reflection.ts             # Zod validation schemas
│   ├── store/
│   │   └── useJournalStore.ts        # Zustand global store & persistensi localStorage
│   └── types/
│       └── session.ts                # TypeScript interfaces & types
├── .env.example                      # Template environment variable
├── .gitignore                        # Git ignore rules
└── package.json                      # Daftar paket & npm scripts
```

---

## 🔒 Prinsip AI & Etika (Responsible AI)

1. **Clarity > Depth**: Pertanyaan AI harus dapat dipahami dalam sekali baca. Tidak membuat kalimat yang puitis atau berbelit-belit hanya agar terkesan filosofis.
2. **Natural > Poetic**: Menggunakan Bahasa Indonesia sehari-hari yang akrab bagi mahasiswa.
3. **No Diagnosis**: UNMASKED **bukan** alat diagnosis klinis. AI tidak boleh melabeli pengguna dengan istilah medis (seperti *"depresi berat"*, *"anxiety disorder"*, dll).
4. **Tentative Tone**: Menggunakan bahasa tentatif yang ramah (*"tampaknya..."*, *"dari ceritamu, hal yang mungkin paling kamu butuhkan..."*).
5. **User Decides (Otoritas Pengguna)**: Pilihan dan koreksi pengguna selalu memiliki derajat prioritas tertinggi melampaui inferensi AI.
6. **Crisis Safety Layer**: Terdapat deteksi kata kunci krisis otomatis dan akses mudah ke kontak bantuan profesional Indonesia (*Halo Kemenkes 1500-567, Yayasan Pulih, Into The Light*).
7. **Privasi Penuh**: Semua data sesi disimpan di `localStorage` peramban pengguna.

---

## 📜 Tersedia Perintah Script (`npm run ...`)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan lokal (Turbopack) di port 3000 |
| `npm run build` | Membuat bundle produksi (production build) |
| `npm run start` | Menjalankan server mode produksi setelah di-build |
| `npm run type-check` | Menjalankan pemeriksaan TypeScript (`tsc --noEmit`) tanpa kompilasi file |
| `npm run lint` | Menjalankan linting ESLint |

---

*Dikembangkan dengan penuh kepedulian untuk kesehatan batin mahasiswa.*
