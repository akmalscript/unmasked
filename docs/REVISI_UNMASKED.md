# UNMASKED — NEED & AI Question Revision Specification

> **Status:** Revision Specification
> **Focus:** NEED Stage, AI-generated questions, contextual flow, and user-facing copy
> **Purpose:** Memperbaiki kualitas pertanyaan AI agar lebih mudah dipahami, lebih personal, lebih natural, dan tetap sesuai prinsip UNMASKED.

---

# 1. Tujuan Revisi

Tahap NEED sudah menggunakan AI untuk menghasilkan pertanyaan berdasarkan konteks pengguna. Namun kualitas pengalaman masih perlu ditingkatkan.

Masalah utama saat ini:

1. Pertanyaan AI terkadang terlalu panjang.
2. Pertanyaan terasa terlalu "dalam" atau abstrak.
3. User membutuhkan waktu untuk membaca ulang agar memahami maksud pertanyaan.
4. Beberapa copy UI menggunakan bahasa yang terlalu konseptual.
5. Context dari MASK belum benar-benar digunakan secara penuh saat menghasilkan pertanyaan NEED.
6. Context dari user correction belum menjadi sumber utama secara konsisten.
7. Internal taxonomy seperti `control`, `rest`, dan lainnya masih terlihat oleh user.
8. Hasil NEED masih menggunakan bahasa yang terlalu authoritative seperti "terdeteksi" atau "paling meminta dipenuhi".
9. AI masih diarahkan untuk menghasilkan "pertanyaan mendalam", padahal kebutuhan utama adalah pertanyaan yang jelas.
10. Pertanyaan belum memiliki aturan kualitas yang cukup ketat.

Target revisi:

> **Make the question easier to understand, while keeping the reflection meaningful.**

Prinsip utama:

```text
CLARITY > DEPTH
NATURAL > POETIC
CONTEXTUAL > GENERIC
ONE FOCUS > MULTIPLE IDEAS
USER DECIDES > AI DECIDES
```

---

# 2. Prinsip Baru Pertanyaan AI

Pertanyaan NEED harus mengikuti aturan berikut.

## 2.1 Bahasa sehari-hari

Gunakan bahasa Indonesia yang natural dan familiar bagi mahasiswa.

Hindari:

> "Bagaimana dinamika tuntutan yang sedang kamu hadapi memengaruhi kapasitasmu?"

Gunakan:

> "Bagian mana dari semua tuntutan ini yang paling berat buatmu?"

---

## 2.2 Satu pertanyaan = satu fokus

Jangan memasukkan dua atau tiga hal sekaligus dalam satu pertanyaan.

Buruk:

> "Apa yang paling membuatmu kewalahan, bagaimana pengaruhnya ke dirimu, dan bantuan seperti apa yang kamu butuhkan?"

Lebih baik:

> "Apa yang paling membuatmu kewalahan saat ini?"

Kemudian, jika memang diperlukan:

> "Bantuan seperti apa yang paling akan meringankanmu?"

---

## 2.3 Maksimal sekitar 15–18 kata

Pertanyaan sebaiknya dapat dibaca dalam sekali pandang.

Target:

```text
10–16 kata
```

Batas maksimal:

```text
18–20 kata
```

Jika pertanyaan dapat dibuat lebih pendek tanpa kehilangan makna, gunakan versi yang lebih pendek.

---

## 2.4 Jangan menggunakan bahasa terlalu abstrak

Hindari istilah seperti:

* dinamika;
* kapasitas;
* regulasi;
* kebutuhan terdalam;
* ruang batin;
* mekanisme;
* kondisi internal;
* keberlangsungan diri;
* emotional capacity;
* psychological pattern.

Gunakan kata yang lebih konkret.

Contoh:

> "Bagian mana yang paling sulit kamu hadapi?"

lebih baik daripada:

> "Bagaimana tekanan tersebut memengaruhi kapasitas emosionalmu?"

---

# 3. Pertanyaan Tidak Harus Terdengar "Dalam"

Prompt AI saat ini menggunakan wording seperti:

> "pertanyaan refleksi kontekstual mendalam"

Wording tersebut sebaiknya dihapus.

AI dapat menganggap "mendalam" berarti membuat kalimat yang semakin kompleks.

Ganti menjadi:

> **"Pertanyaan reflektif yang sederhana, jelas, dan relevan dengan cerita pengguna."**

Prinsip:

```text
Depth should come from the user's answer,
not from a complicated question.
```

---

# 4. Pertanyaan Harus Berangkat dari Informasi Pengguna

Pertanyaan tidak boleh sekadar menanyakan kebutuhan secara umum.

Buruk:

> "Apakah kamu membutuhkan lebih banyak istirahat?"

Lebih baik:

> "Dari semua yang sedang kamu kerjakan, kapan kamu paling sulit memberi waktu untuk berhenti?"

Pertanyaan kedua menggunakan konteks aktivitas pengguna.

---

# 5. Pertanyaan Harus Menjawab Satu Hal yang Belum Diketahui

AI harus bertanya:

> **"Apa yang masih perlu kita pahami dari kemungkinan kebutuhan ini?"**

Bukan:

> "Bagaimana saya bisa bertanya sesuatu yang terdengar reflektif?"

Contoh:

User terlihat kewalahan dan AI menduga `CONTROL`.

Jangan:

> "Seberapa penting rasa kendali dalam kehidupanmu saat ini?"

Gunakan:

> "Bagian mana dari situasi ini yang paling ingin kamu kendalikan lagi?"

Pertanyaan tersebut membantu membedakan apakah `CONTROL` benar-benar relevan.

---

# 6. Context Flow yang Harus Diperbaiki

Flow yang ditargetkan:

```text
MASK
+
LOAD
+
USER CORRECTIONS
↓
POSSIBLE NEEDS
↓
AI QUESTIONS
↓
USER ANSWERS
↓
NEED SYNTHESIS
↓
USER CONFIRMATION
```

Ini harus menjadi alur aktual, bukan hanya konsep dokumentasi.

---

# 7. MASK Context Harus Masuk ke NEED

Saat ini fungsi `buildNeedPreparePrompt()` sudah memiliki parameter:

```text
maskConfirmed
```

tetapi context tersebut belum digunakan secara penuh.

Selain itu `NeedSheetSection` belum mengirim informasi MASK yang telah dikonfirmasi.

Perubahan:

```text
NeedSheetSection
        ↓
send:
- public self
- actual feeling
- mask reflection
- mask confirmation/correction
- load themes
- load summary
- load confirmation/correction
```

Dengan demikian AI dapat mengetahui:

```text
HOW USER LOOKS
+
HOW USER FEELS
+
WHAT USER CARRIES
```

sebelum menentukan kemungkinan kebutuhan.

---

# 8. User Correction Harus Memiliki Prioritas Tinggi

Urutan prioritas context:

```text
1. User's explicit input
2. User's correction
3. User's confirmation
4. Confirmed previous insight
5. Raw AI inference
```

Jika AI sebelumnya mengatakan:

> "Mungkin kamu membutuhkan lebih banyak kontrol."

tetapi user mengatakan:

> "Sebenarnya yang paling saya butuhkan adalah ada orang yang bisa membantu."

maka stage berikutnya harus lebih mempertimbangkan:

> SUPPORT

bukan mempertahankan:

> CONTROL.

---

# 9. Candidate Need Tidak Harus Terlihat sebagai Taxonomy

Saat ini UI menampilkan:

> `Arah: control`

dan pada hasil:

> `Kategori Taksonomi: control`

Ini adalah vocabulary internal sistem.

Taxonomy seharusnya tetap berada di backend/data model.

User cukup melihat:

> **Rasa Kendali**

bukan:

> control

atau:

> Kategori Taksonomi: control

Perubahan:

```text
INTERNAL:
control

USER:
Rasa Kendali
```

Taxonomy tidak perlu ditampilkan kecuali memang memiliki tujuan UX yang jelas.

---

# 10. Copy NEED — Revisi Judul Utama

## Current

> "apa yang sebenarnya kamu butuhkan?"

## Recommended

> **"apa yang paling kamu butuhkan sekarang?"**

Alasan:

* lebih langsung;
* lebih mudah dipahami;
* tidak terdengar seperti pertanyaan filosofis;
* tetap sesuai dengan tujuan NEED.

Alternatif:

> "dari semua yang kamu hadapi, apa yang paling kamu butuhkan sekarang?"

Gunakan versi pendek sebagai default.

---

# 11. Copy NEED — Revisi Deskripsi

## Current

> "Bukan survei kaku. Pertanyaan di bawah ini dirancang khusus dari ceritamu agar kita bisa memetakan kebutuhanmu."

Masalah:

* "memetakan kebutuhanmu" terdengar seperti sistem sedang menilai user;
* menjelaskan sistem terlalu banyak;
* belum menjelaskan apa yang harus dilakukan user.

## Recommended

> **"Kami akan memberikan beberapa pertanyaan singkat berdasarkan ceritamu. Jawab saja sesuai yang paling terasa benar."**

Versi ini lebih natural dan actionable.

---

# 12. Copy NEED — Revisi Label

## Current

> "eksplorasi kebutuhan personal"

## Recommended

> **"mencari tahu yang paling kamu butuhkan"**

Alternatif:

> "sedikit melihat apa yang sedang kamu butuhkan"

Tujuan:

Mengurangi bahasa produk yang terlalu abstrak.

---

# 13. Loading State NEED

## Current

> "Menelaah kebutuhan terdalam berdasarkan ceritamu..."

Masalah:

* terlalu dramatis;
* "kebutuhan terdalam" memberi kesan AI akan mengetahui sesuatu yang tersembunyi;
* tidak sesuai dengan prinsip user control.

## Recommended

> **"Sedang menyusun beberapa pertanyaan dari ceritamu..."**

Alternatif:

> "Sedang mencari pertanyaan yang paling relevan untukmu..."

---

# 14. Candidate Teaser

## Current

> "Area yang mungkin sedang meminta perhatianmu:"

Masalah:

* abstrak;
* "meminta perhatianmu" bersifat puitis;
* tidak menjelaskan apakah itu diagnosis atau sekadar kemungkinan.

## Recommended

> **"Dari ceritamu, beberapa hal ini mungkin sedang kamu butuhkan:"**

Ini jauh lebih jelas dan tetap tentatif.

---

# 15. Label Pertanyaan

## Current

> "Pertanyaan Refleksi 01"

Tidak salah, tetapi terasa seperti form survei.

Recommended:

> **"Coba pikirkan ini"**

atau tetap:

> "Pertanyaan untukmu"

Contoh:

```text
PERTANYAAN UNTUKMU
"Bagian mana dari situasi ini yang paling sulit kamu kendalikan?"
```

Lebih conversational.

---

# 16. Hilangkan "Arah: targetNeed"

## Current

```text
Arah: control
```

Hapus dari UI.

Data:

```text
targetNeed
```

tetap disimpan untuk kebutuhan AI dan synthesis.

User tidak perlu melihat classification internal.

---

# 17. Revisi Placeholder Jawaban

## Current

> "Tuliskan jawaban atau apa yang terlintas di kepalamu..."

Masalah:

* agak panjang;
* "apa yang terlintas di kepala" terdengar vague.

## Recommended

> **"Jawab dengan kata, kalimat, atau cerita singkat..."**

Alternatif:

> "Tidak perlu jawaban panjang. Tulis saja yang paling terasa benar."

---

# 18. Revisi Helper Text Setelah Pertanyaan

## Current

> "Setelah selesai menjawab, klik tombol 'Lihat Hasil Kebutuhan' di bawah untuk melihat sintesis AI."

Masalah:

Terlalu instruksional dan terasa seperti tutorial sistem.

## Recommended

> **"Tidak perlu mencari jawaban yang paling benar. Tulis saja yang paling sesuai dengan keadaanmu sekarang."**

Ini lebih sesuai dengan emotional tone UNMASKED.

---

# 19. Tombol NEED

## Current

> "Lihat Hasil Kebutuhan"

Masih cukup baik, tetapi dapat dibuat lebih personal.

Recommended:

> **"Lihat yang Mungkin Aku Butuhkan"**

atau versi yang lebih sederhana:

> **"Lihat Hasil Refleksi"**

Untuk UX yang paling natural:

> **"Lanjut ke Hasil Refleksi"**

---

# 20. Question Generation Rules Baru

Tambahkan aturan berikut ke `buildNeedPreparePrompt()`:

```text
ATURAN PERTANYAAN:

1. Buat 2–3 pertanyaan saja.
2. Setiap pertanyaan hanya memiliki satu fokus.
3. Gunakan Bahasa Indonesia sehari-hari.
4. Usahakan maksimal 15–18 kata per pertanyaan.
5. Pertanyaan harus mudah dipahami dalam sekali baca.
6. Gunakan konteks yang benar-benar diberikan pengguna.
7. Jangan menggunakan jargon psikologi.
8. Jangan membuat pertanyaan terlalu puitis atau abstrak.
9. Jangan mengasumsikan bahwa kandidat kebutuhan pasti benar.
10. Jangan memaksa pengguna memilih kebutuhan tertentu.
11. Jangan menggunakan pertanyaan yang mengarah pada jawaban tertentu.
12. Jangan mengulang pertanyaan dengan maksud yang sama.
13. Setiap pertanyaan harus membantu memahami sesuatu yang belum diketahui.
14. Prioritaskan kejelasan dibanding kedalaman.
15. Pertanyaan harus terdengar seperti seseorang yang benar-benar mendengarkan cerita pengguna.
```

---

# 21. Tambahkan Negative Examples ke Prompt

AI akan lebih konsisten jika diberikan contoh.

## Jangan

```text
"Bagaimana dinamika berbagai tuntutan yang sedang kamu hadapi
memengaruhi kapasitasmu untuk memberikan ruang bagi kebutuhan diri?"
```

## Gunakan

```text
"Bagian mana dari semua tuntutan ini yang paling sulit kamu kendalikan?"
```

---

## Jangan

```text
"Bagaimana kebutuhan akan koneksi sosial muncul dalam pengalamanmu saat ini?"
```

## Gunakan

```text
"Ada seseorang yang sebenarnya ingin kamu ajak bicara soal ini?"
```

---

## Jangan

```text
"Bagaimana kamu memahami hambatan internal yang membuatmu sulit memberikan
ruang untuk beristirahat secara utuh?"
```

## Gunakan

```text
"Apa yang biasanya membuatmu sulit benar-benar berhenti sejenak?"
```

---

# 22. Question Patterns yang Direkomendasikan

AI tidak harus menggunakan pattern ini setiap saat, tetapi dapat menggunakannya sebagai vocabulary.

### CONTROL

```text
"Bagian mana dari situasi ini yang paling sulit kamu kendalikan?"

"Apa yang paling ingin kamu atur kembali sekarang?"
```

### REST

```text
"Apa yang paling membuatmu sulit berhenti sejenak?"

"Kalau bisa meringankan satu hal hari ini, apa yang ingin kamu hentikan dulu?"
```

### CONNECTION

```text
"Ada seseorang yang sebenarnya ingin kamu ajak bicara soal ini?"

"Hal apa yang paling ingin kamu ceritakan kepada seseorang?"
```

### EXPRESSION

```text
"Apa yang sebenarnya ingin kamu keluarkan tapi belum sempat kamu ceritakan?"

"Ada sesuatu yang selama ini kamu tahan sendiri?"
```

### SUPPORT

```text
"Bantuan seperti apa yang paling akan meringankanmu sekarang?"

"Bagian mana yang sebenarnya ingin kamu bagi dengan orang lain?"
```

### SAFETY

Gunakan pertanyaan yang sederhana dan tidak menghakimi.

```text
"Apa yang bisa membuatmu merasa lebih aman atau lebih tenang sekarang?"

"Adakah tempat atau seseorang yang membuatmu merasa cukup aman untuk bercerita?"
```

Catatan:

`SAFETY` sebagai need taxonomy tidak menggantikan safety detection atau crisis handling.

---

# 23. Hindari Pertanyaan yang Saling Mengulang

Contoh buruk:

```text
Q1:
"Apa yang paling membuatmu kewalahan?"

Q2:
"Hal apa yang paling membuatmu merasa terbebani?"

Q3:
"Apa bagian yang paling berat untukmu?"
```

Ketiganya sebenarnya menanyakan hal yang sama.

Lebih baik:

```text
Q1:
"Apa yang paling membuatmu kewalahan?"

Q2:
"Bagian mana yang paling sulit kamu kendalikan?"

Q3:
"Bantuan seperti apa yang paling akan meringankanmu?"
```

Ketiga pertanyaan memiliki tujuan berbeda:

```text
Current burden
+
Control
+
Support
```

---

# 24. Jangan Selalu Bertanya "Mengapa"

Kata "mengapa" sering membuat user harus melakukan introspeksi lebih berat.

Prioritaskan:

```text
apa
bagian mana
siapa
kapan
hal apa
bantuan seperti apa
apa yang paling...
```

Gunakan "mengapa" hanya jika konteks benar-benar membutuhkan alasan.

---

# 25. Need Synthesis Juga Harus Diubah

Saat ini prompt menggunakan konsep:

> "kebutuhan utama yang paling mendesak"

Ini terlalu authoritative.

AI sebaiknya tidak menyatakan:

> "Ini kebutuhanmu yang paling mendesak."

Gunakan:

> **"Dari jawabanmu, kebutuhan yang tampaknya paling relevan saat ini adalah..."**

Dengan demikian hasil AI tetap tentatif.

---

# 26. Revisi Copy Need Result

## Current

> "PENILAIAN KEBUTUHAN DIRIMU"

Recommended:

> **"YANG MUNGKIN KAMU BUTUHKAN"**

---

## Current

> "area kebutuhanmu saat ini"

Recommended:

> **"hal yang mungkin paling kamu butuhkan sekarang"**

---

## Current

> "Berdasarkan apa yang kamu ceritakan dan jawab, inilah ruang kebutuhan yang paling meminta dipenuhi."

Recommended:

> **"Dari semua yang kamu ceritakan dan jawab, ini yang tampaknya paling relevan untuk diperhatikan sekarang."**

---

# 27. Revisi Label Primary Need

## Current

> "Kebutuhan Prioritas Terdeteksi"

Masalah:

"Terdeteksi" terdengar seperti diagnosis.

## Recommended

> **"Yang Paling Terlihat dari Ceritamu"**

Alternatif:

> "Yang Tampaknya Paling Relevan"

Saya lebih merekomendasikan:

> **"Yang Tampaknya Paling Relevan"**

---

# 28. Revisi "Fokus Utama"

## Current

> "Fokus Utama"

Bisa dipertahankan, tetapi lebih natural:

> **"Kemungkinan Utama"**

atau:

> **"Yang Paling Relevan"**

Gunakan:

> **"Yang Paling Relevan"**

---

# 29. Hapus "Kategori Taksonomi"

## Current

```text
Kategori Taksonomi: control
```

Hapus sepenuhnya dari user interface.

Internal schema tetap:

```json
{
  "key": "control"
}
```

Tetapi UI hanya menampilkan:

> **Rasa Kendali**

---

# 30. Revisi "Penjelasan Reflektif"

## Current

> "Penjelasan Reflektif"

Recommended:

> **"Kenapa ini mungkin relevan"**

Ini lebih mudah dipahami user.

---

# 31. Revisi Secondary Needs

## Current

> "Kebutuhan Pendukung Lainnya"

Dapat dipertahankan, tetapi lebih natural:

> **"Mungkin juga berkaitan"**

Contoh:

```text
YANG PALING RELEVAN
Rasa Kendali

MUNGKIN JUGA BERKAITAN
Istirahat
Dukungan
```

---

# 32. Revisi Closing Copy NEED

## Current

> "Mengakui kebutuhan ini bukan tanda kelemahan, melainkan tanda bahwa kamu peduli pada keberlangsungan dirimu."

Terlalu formal dan sedikit terdengar seperti motivational quote generik.

Recommended:

> **"Menyadari apa yang kamu butuhkan bukan berarti kamu lemah. Itu hanya berarti kamu mulai mendengarkan dirimu sendiri."**

---

# 33. Revisi User Confirmation

## Current

> "Apakah kebutuhan ini terasa paling relevan bagimu saat ini?"

Lebih natural:

> **"Apakah ini terasa cocok dengan keadaanmu sekarang?"**

Subtitle:

> **"Kalau belum pas, beri tahu bagian mana yang meleset. Kamu yang paling tahu apa yang kamu butuhkan."**

Ini lebih sesuai dengan:

```text
AI suggests.
User decides.
```

---

# 34. Need Synthesis harus menggunakan confirmed context

Synthesis saat ini menerima:

```text
candidates
questions
answers
loadSummary
```

Target baru:

```text
confirmed MASK
+
confirmed LOAD
+
candidates
+
questions
+
answers
+
user correction
```

Ini membuat synthesis lebih konsisten dengan perjalanan refleksi.

---

# 35. ACTION Harus Menerima Confirmed MASK

Saat ini ACTION terlalu bergantung pada:

```text
LOAD
+
NEED
```

Target:

```text
MASK
+
LOAD
+
CONFIRMED NEED
+
NEED CORRECTION
↓
ACTION
```

Contoh:

MASK:

```text
Bisa diandalkan
Selalu membantu
```

LOAD:

```text
Sulit menolak permintaan orang
```

NEED:

```text
Support
```

ACTION kemudian dapat menghasilkan:

> "Pilih satu hal yang biasanya kamu tangani sendiri dan kirim pesan untuk meminta bantuan."

Ini jauh lebih personal daripada hanya melihat `Support`.

---

# 36. Question Quality Validation

Sebelum AI output digunakan, sistem sebaiknya melakukan validation sederhana.

Minimum validation:

```text
question.length <= reasonable limit
question ends with ?
question is not empty
question has one targetNeed
question count = 2–3
```

Jika memungkinkan, tambahkan validation terhadap panjang kata.

Contoh:

```text
wordCount <= 20
```

Jika gagal:

```text
AI output rejected
↓
retry generation
```

---

# 37. Tambahkan Quality Instruction ke Global AI Prompt

Tambahkan:

```text
QUALITY OVER COMPLEXITY:

Jika sebuah kalimat dapat dibuat lebih sederhana
tanpa kehilangan makna, selalu pilih versi yang lebih sederhana.

AI harus mengutamakan:
- mudah dipahami,
- natural,
- konkret,
- singkat.

Jangan menggunakan bahasa yang terdengar akademis,
psikologis, atau terlalu puitis hanya untuk membuat jawaban terasa mendalam.
```

---

# 38. Jangan Membuat AI Terlalu Cepat Menentukan Need

Candidate generation tetap diperbolehkan.

Namun:

```text
candidate ≠ conclusion
```

AI hanya boleh mengatakan:

> "Ada kemungkinan Rasa Kendali sedang relevan."

Bukan:

> "Masalahmu adalah kurangnya rasa kendali."

---

# 39. Expected UX Setelah Revisi

Flow baru:

```text
MASK
"What people see"
+
"What I actually feel"
        ↓
LOAD
"What I'm carrying"
        ↓
NEED
"What might I need?"
        ↓
AI creates 2–3 simple questions
        ↓
USER ANSWERS
        ↓
AI:
"From your answers, this may be relevant..."
        ↓
USER CONFIRMS / CORRECTS
        ↓
ACTION
"One small thing you can do now"
```

Pertanyaan AI harus terasa seperti kelanjutan percakapan, bukan seperti survei.

---

# 40. Example — Before vs After

## BEFORE

```text
Apa yang sebenarnya kamu butuhkan?

Bagaimana dinamika tuntutan yang sedang kamu hadapi
memengaruhi kapasitasmu untuk memberikan ruang bagi
kebutuhan dirimu sendiri?
```

Masalah:

* panjang;
* abstrak;
* terlalu konseptual;
* sulit dipahami sekali baca.

---

## AFTER

```text
Apa yang paling kamu butuhkan sekarang?

Bagian mana dari semua tuntutan ini yang paling berat buatmu?

Kalau satu hal bisa dibuat lebih ringan hari ini,
apa yang ingin kamu ringankan?
```

Lebih:

* langsung;
* natural;
* mudah dijawab;
* tetap reflektif;
* relevan dengan konteks.

---

# 41. Example — Contextual Question

User:

> "Tugas kuliah banyak. Saya juga takut mengecewakan teman kelompok karena beberapa pekerjaan belum selesai."

Candidate:

```text
CONTROL
SUPPORT
```

Questions:

```text
"Bagian mana dari semua tugas ini yang paling sulit kamu kendalikan?"

"Kalau ada yang bisa membantumu sekarang, bantuan seperti apa yang paling kamu butuhkan?"
```

Bukan:

```text
"Bagaimana kebutuhanmu terhadap kontrol dan dukungan
memengaruhi dinamika interpersonal serta produktivitasmu?"
```

---

# 42. Example — Rest

User:

> "Saya sebenarnya capek, tapi setiap mau istirahat malah merasa bersalah karena masih banyak tugas."

Candidate:

```text
REST
CONTROL
```

Questions:

```text
"Apa yang biasanya membuatmu sulit benar-benar berhenti?"

"Kalau kamu boleh menunda satu hal hari ini, apa yang ingin kamu tunda?"
```

Ini lebih dekat dengan kehidupan sehari-hari user.

---

# 43. Example — Connection

User:

> "Saya sering cerita ke teman kalau semuanya baik-baik saja, padahal sebenarnya saya ingin ada yang benar-benar mendengarkan."

Candidate:

```text
CONNECTION
EXPRESSION
```

Questions:

```text
"Apa yang sebenarnya ingin kamu ceritakan kepada seseorang?"

"Ada seseorang yang membuatmu merasa cukup nyaman untuk cerita jujur?"
```

---

# 44. Acceptance Criteria

Revisi NEED dianggap berhasil jika:

### Question clarity

* [ ] User dapat memahami pertanyaan dalam sekali baca.
* [ ] Pertanyaan tidak menggunakan jargon.
* [ ] Tidak ada pertanyaan yang terasa seperti esai.
* [ ] Maksimal sekitar 15–20 kata per pertanyaan.
* [ ] Satu pertanyaan hanya memiliki satu fokus.

### Context

* [ ] MASK confirmed context dikirim ke NEED.
* [ ] LOAD confirmed context dikirim ke NEED.
* [ ] User correction diprioritaskan.
* [ ] AI tidak hanya mengandalkan load summary.

### UX copy

* [ ] "kebutuhan terdalam" dihapus.
* [ ] "area yang meminta perhatianmu" diperjelas.
* [ ] "terdeteksi" dihapus dari NEED result.
* [ ] `targetNeed` / taxonomy key tidak ditampilkan ke user.
* [ ] Copy confirmation lebih natural.

### AI behavior

* [ ] AI tidak menggunakan bahasa terlalu abstrak.
* [ ] AI tidak memaksakan candidate need.
* [ ] AI menggunakan bahasa tentatif.
* [ ] AI tidak mengulang pertanyaan yang sama.
* [ ] AI membedakan candidate dengan confirmed need.
* [ ] User correction menjadi context untuk tahap berikutnya.

---

# 45. Prioritas Implementasi

## P0 — Wajib

```text
1. Rewrite buildNeedPreparePrompt()
2. Tambahkan Question Rules
3. Tambahkan bad/good examples
4. Kirim MASK confirmed context ke NEED
5. Perbaiki UI copy NEED
6. Hapus targetNeed dari UI
7. Perbaiki Need Synthesis menjadi tentatif
```

## P1 — Sangat disarankan

```text
8. Kirim confirmed MASK + LOAD + NEED ke ACTION
9. Validasi panjang dan jumlah pertanyaan
10. Pastikan user correction menjadi source of truth
11. Perbaiki copy Need Result
```

## P2 — Setelah core flow stabil

```text
12. Tambahkan retry jika pertanyaan AI tidak memenuhi quality rules
13. Evaluasi prompt dengan beberapa skenario user
14. Tambahkan test cases untuk question quality
15. Pisahkan internal taxonomy dari seluruh user-facing text
```

---

# 46. Golden Rule untuk NEED

Gunakan prinsip berikut sebagai aturan utama implementasi:

> **Jangan membuat pertanyaan yang terdengar dalam. Buat pertanyaan yang mudah dipahami dan benar-benar ingin dijawab pengguna.**

Atau dalam bentuk sistem:

```text
USER CONTEXT
      ↓
POSSIBLE NEED
      ↓
WHAT DON'T WE KNOW YET?
      ↓
ONE SIMPLE QUESTION
      ↓
USER ANSWER
      ↓
AI REFLECTION
      ↓
USER CONFIRMATION
```

---

# 47. Target Akhir

Setelah revisi, pengguna tidak boleh merasa:

> "Ini pertanyaannya maksudnya apa?"

Idealnya pengguna langsung merasa:

> "Oh, maksudnya ini."

Kemudian:

> "Kalau dipikir-pikir, jawabannya memang itu."

Itulah target kualitas pertanyaan NEED.

UNMASKED tidak membutuhkan pertanyaan AI yang terdengar paling pintar.

UNMASKED membutuhkan pertanyaan yang:

```text
mudah dipahami
+
relevan
+
personal
+
tidak menghakimi
+
membuka ruang refleksi
```

Dengan begitu, AI benar-benar berfungsi sebagai **cermin**, bukan sebagai orang yang merasa paling tahu apa yang sedang dialami pengguna.
