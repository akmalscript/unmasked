# UNMASKED — Project Guide

> **UNMASKED: Beyond “I'm Fine.”**
>
> Dokumen ini adalah panduan utama pengembangan UNMASKED. Gunakan sebagai **source of truth** agar product, design, frontend, backend, AI, safety, dan QA bekerja menuju perilaku sistem yang sama.
>
> **Status:** Living Document  
> **Current implementation:** High-fidelity frontend prototype / hardcoded behavior  
> **Target:** Connected application dengan session state, AI, dynamic reflection, safety handling, dan cross-stage analysis.

---

## 1. Tujuan Dokumen

Dokumen ini menjelaskan:

- visi dan tujuan UNMASKED;
- masalah yang ingin dibantu;
- user journey;
- fungsi setiap stage;
- peran AI pada setiap stage;
- hubungan data antar-stage;
- prinsip safety dan responsible AI;
- pembagian frontend/backend/AI;
- MVP dan Definition of Done;
- aturan kolaborasi dan dokumentasi.

Dokumen ini bukan pengganti dokumentasi teknis detail. Detail API, schema, prompt, dan safety sebaiknya dipisahkan ke dokumen pendamping.

---

# 2. Product Overview

## 2.1 Nama

**UNMASKED: Beyond “I'm Fine.”**

## 2.2 Konsep

UNMASKED adalah platform refleksi mental well-being berbasis web yang membantu mahasiswa bergerak melalui perjalanan:

```text
MASK → LOAD → NEED → ACTION → SUMMARY
```

Tujuan utamanya bukan memberikan diagnosis, tetapi membantu pengguna mendapatkan pemahaman yang lebih jelas tentang kondisi dirinya saat itu.

Perjalanan inti:

```text
What I Show
    ↓
What I Feel
    ↓
What I Carry
    ↓
What I May Need
    ↓
What I Can Do Next
```

---

# 3. Problem yang Ingin Dibantu

Mahasiswa dapat terlihat produktif, kuat, aktif, baik-baik saja, atau mampu menangani banyak hal, sementara pengalaman internalnya dapat berbeda.

UNMASKED berangkat dari masalah sederhana:

> **Seseorang bisa tahu bahwa dirinya sedang tidak baik-baik saja, tetapi belum tentu memahami apa yang sedang terjadi, apa yang paling membebani, atau apa yang sebenarnya ia butuhkan.**

Karena itu UNMASKED tidak berhenti pada input jurnal. Sistem harus membantu user bergerak dari:

```text
Feeling → Understanding → Need → Action
```

---

# 4. Tujuan Produk

## Tujuan utama

Membantu pengguna memperoleh **self-understanding yang lebih terstruktur** melalui refleksi yang dipandu dan dibantu AI.

## Tujuan sekunder

UNMASKED diharapkan:

- membuat pengguna merasa didengar;
- membantu menemukan pola dari cerita yang ditulis;
- mengurangi rasa bahwa semua masalah bercampur menjadi satu;
- membantu menemukan kebutuhan yang relevan;
- membantu memilih satu langkah kecil yang realistis.

## Bukan tujuan UNMASKED

UNMASKED bukan:

- alat diagnosis;
- pengganti psikolog/psikiater;
- chatbot terapi;
- mesin pemberi nasihat hidup secara umum;
- sistem yang mengklaim mengetahui kondisi psikologis pengguna secara pasti;
- sistem yang memaksakan interpretasi AI kepada user.

---

# 5. Prinsip Produk

## 5.1 AI suggests, user decides

AI memberikan interpretasi atau hipotesis. User tetap menjadi sumber kebenaran utama.

Contoh yang diharapkan:

> “Dari ceritamu, mungkin ada pola...”

Bukan:

> “Kamu mengalami X.”

## 5.2 User confirmation/correction adalah bagian inti

Untuk insight penting, user sebaiknya dapat:

- menerima;
- mengatakan “sebagian sesuai”;
- menolak;
- mengoreksi;
- menambahkan konteks.

Koreksi tersebut menjadi konteks bagi tahap berikutnya.

## 5.3 AI harus semakin kontekstual

Semakin jauh user berjalan, semakin kaya konteks yang tersedia.

```text
MASK
  ↓
LOAD
  ↓
NEED
  ↓
ACTION
```

AI pada tahap berikutnya tidak boleh bekerja seolah-olah belum mengetahui hasil sebelumnya.

## 5.4 Setiap stage memiliki pekerjaan berbeda

- **MASK:** mencari kontras dan makna antara self yang ditampilkan dan dirasakan.
- **LOAD:** memahami tema, konteks emosional, dan pola dari beban.
- **NEED:** menentukan kebutuhan yang layak digali dan membuat pertanyaan yang relevan.
- **ACTION:** menerjemahkan kebutuhan menjadi micro-action yang realistis.
- **SUMMARY:** menyatukan perjalanan, bukan membuat diagnosis baru.

## 5.5 Reflection, not interrogation

User harus merasa sedang melakukan refleksi, bukan mengisi survei psikologi panjang.

---

# 6. User Journey Utama

Alur produk:

```text
Landing
   ↓
Onboarding
   ↓
MASK
   ├── Public Self
   ├── Actual Feeling
   └── Mask Result
   ↓
LOAD
   ├── Brain Dump
   └── Story Reflection
   ↓
NEED
   ├── Dynamic Need Questions
   └── Need Result
   ↓
ACTION
   └── Personalized Micro Action
   ↓
SUMMARY
   ↓
Selesai
```

Secara makna:

```text
WHAT I SHOW
      ↓
WHAT I FEEL
      ↓
WHAT I CARRY
      ↓
WHAT MAY BE HAPPENING
      ↓
WHAT I MAY NEED
      ↓
WHAT I CAN DO NEXT
```

---

# 7. Kondisi Frontend Saat Ini

Prototype frontend yang sekarang harus dianggap sebagai **reference implementation untuk UX dan intended behavior**, bukan backend final.

Struktur route yang ada:

```text
/
onboarding/
public-self/
actual-feeling/
mask-result/
brain-dump/
story-reflection/
need-sheet/
need-result/
action-step/
summary/
selesai/
```

Prototype menggunakan Zustand untuk state dan masih memiliki hardcoded result/content di beberapa tahap.

### Aturan penting

Hardcoded output adalah **contoh hasil yang ingin dicapai**, bukan aturan final AI.

Jangan memindahkan hardcoded text ke backend lalu menganggap pekerjaan AI sudah selesai. Backend harus menggantikan placeholder tersebut dengan output dinamis berbasis konteks user.

---

# 8. Stage 0 — Landing & Onboarding

## Tujuan

Menjelaskan apa yang akan dilakukan user sebelum refleksi dimulai.

User perlu memahami:

- tujuan UNMASKED;
- perjalanan MASK → LOAD → NEED → ACTION;
- sifat reflektif sistem;
- bahwa AI bukan tenaga profesional;
- gambaran perlindungan data.

## Output

Sistem membuat satu `ReflectionSession`.

Contoh konseptual:

```json
{
  "sessionId": "uuid",
  "status": "active",
  "currentStage": "mask"
}
```

---

# 9. Stage 1 — MASK

## 9.1 Tujuan

Membantu user melihat perbedaan antara bagaimana dirinya terlihat dan bagaimana dirinya sebenarnya merasa.

## 9.2 Input

### Public Self

Contoh:

```text
Productive
Strong
Reliable
Cheerful
Independent
```

### Actual Feeling

Contoh:

```text
Tired
Overwhelmed
Anxious
Lost
Disconnected
```

### Optional Feeling Note

User dapat menjelaskan konteks tambahan.

---

## 9.3 Peran AI pada MASK

AI tidak hanya merangkum pilihan user.

AI harus dapat melakukan:

### A. Contrast detection

Mencari kontras yang bermakna.

Contoh:

```text
Strong ↔ Exhausted
Productive ↔ Overwhelmed
Independent ↔ Needing Support
```

### B. Pattern interpretation

Menyusun kemungkinan pola dari kontras tersebut.

Contoh:

> “Ada perbedaan antara performa yang terlihat kuat dengan kapasitas internal yang terasa menurun.”

### C. Reflective language

Interpretasi harus terasa seperti mirror, bukan diagnosis.

Contoh:

> “Mungkin kamu tetap mempertahankan performa yang terlihat baik meskipun sebenarnya sedang kewalahan.”

### D. Focused reflection question

AI dapat membuat satu pertanyaan lanjutan yang lebih spesifik.

Contoh:

> “Saat kamu merasa kewalahan, mana yang paling berat: banyaknya tugas, ekspektasi orang lain, atau dorongan untuk tetap terlihat mampu?”

### E. User confirmation

Hasil harus dapat dikonfirmasi atau dikoreksi.

---

## 9.4 Target output MASK

```json
{
  "contrasts": [
    {
      "public": "Productive",
      "internal": "Exhausted",
      "meaning": "Possible gap between visible performance and internal capacity"
    }
  ],
  "reflection": "There seems to be a gap between how capable you appear and how overwhelmed you currently feel.",
  "question": "What feels hardest to carry right now?",
  "confidence": "medium"
}
```

`confidence` hanya menggambarkan keyakinan sistem terhadap interpretasi, bukan tingkat keparahan kondisi psikologis user.

---

# 10. Stage 2 — LOAD

## 10.1 Tujuan

Memberi ruang bagi user untuk mengeluarkan hal-hal yang sedang memenuhi pikirannya.

Input utama adalah **free-form brain dump**.

Contoh:

> “Tugas kuliah banyak. Organisasi juga belum selesai. Saya takut mengecewakan orang. Mau istirahat tapi merasa bersalah.”

---

## 10.2 Load Categorization

Beban dapat dikelompokkan menjadi tiga pendekatan:

### ACT

Hal yang masih bisa atau perlu dilakukan.

### SHARE

Hal yang mungkin perlu dibicarakan atau dibagikan kepada orang lain.

### LET GO

Hal yang mungkin tidak perlu terus dibawa, atau sesuatu yang tidak sepenuhnya berada dalam kontrol user.

Kategori adalah alat refleksi, bukan penilaian moral.

---

## 10.3 Peran AI pada LOAD

### A. Theme extraction

Contoh:

```text
Academic Pressure
Expectation
Responsibility
Fear of Failure
Relationship Pressure
```

### B. Emotional context

AI dapat mengidentifikasi konteks emosional yang terlihat dari tulisan, tetapi tidak boleh mengubahnya menjadi diagnosis.

### C. Pattern detection

Contoh:

```text
Tugas banyak
    ↓
Merasa tertinggal
    ↓
Mencoba mengejar semuanya
    ↓
Sulit beristirahat
    ↓
Semakin kewalahan
```

### D. Load summary

Ringkasan harus menangkap inti, bukan sekadar mengulang kalimat user.

### E. User confirmation

User dapat menerima, mengoreksi, atau menambahkan konteks.

---

# 11. Stage 3 — NEED

## 11.1 Prinsip utama

NEED adalah tahap yang paling perlu berubah dari prototype saat ini.

Jangan menggunakan pertanyaan generik yang sama untuk semua user.

Contoh yang terlalu umum:

> “Seberapa kamu butuh istirahat?”

Pertanyaan harus mengikuti konteks user.

---

## 11.2 Dynamic Need Flow

```text
MASK INSIGHT
+
LOAD INSIGHT
+
USER CORRECTIONS
        ↓
AI IDENTIFIES POSSIBLE NEEDS
        ↓
AI GENERATES RELEVANT QUESTIONS
        ↓
USER ANSWERS
        ↓
AI SYNTHESIZES NEED
        ↓
USER CONFIRMS/CORRECTS
```

---

## 11.3 Need Taxonomy

UNMASKED dapat memiliki taxonomy internal seperti:

```text
REST
CONTROL
CONNECTION
EXPRESSION
SUPPORT
SAFETY
```

Taxonomy ini adalah **bahasa internal sistem**, bukan checklist yang wajib ditanyakan kepada semua user.

AI menentukan aspek mana yang relevan berdasarkan konteks.

---

## 11.4 Contoh

User:

> “Tugas banyak, organisasi banyak, tapi saya juga merasa harus memenuhi ekspektasi orang.”

AI dapat mengidentifikasi:

```text
Possible needs:
- Control
- Rest
- Support
```

Kemudian menghasilkan pertanyaan yang lebih relevan:

> “Bagian mana dari situasi ini yang paling membuatmu merasa kehilangan kendali?”

atau:

> “Saat semua hal terasa harus selesai sekaligus, bantuan seperti apa yang sebenarnya paling kamu harapkan dari orang lain?”

---

# 12. NEED RESULT

Need Result harus terasa seperti insight, bukan nilai survei.

Minimal memiliki:

### What you may need

Contoh:

> **A stronger sense of control**

### Why

> “Banyak tekanan yang kamu ceritakan muncul karena terlalu banyak hal terasa harus ditangani pada waktu yang sama.”

### Context / evidence

Hubungkan kesimpulan dengan konteks yang benar-benar diberikan user.

### User confirmation

> “Apakah interpretasi ini terasa sesuai?”

User dapat memperbaiki atau menolak.

---

# 13. Stage 4 — ACTION

## 13.1 Tujuan

Mengubah insight yang sudah dikonfirmasi menjadi **satu langkah kecil yang realistis**.

Action bukan daftar nasihat.

---

## 13.2 Input AI

AI menggunakan konteks yang sudah dibangun:

```text
MASK INSIGHT
+
LOAD THEMES
+
LOAD PATTERNS
+
CONFIRMED NEED
+
USER CORRECTIONS
```

---

## 13.3 Karakteristik Micro Action

Action harus:

- kecil;
- konkret;
- realistis;
- dapat dilakukan dalam waktu dekat;
- terkait dengan kebutuhan;
- tidak mengharuskan perubahan hidup besar.

Kurang baik:

> “Cobalah mengatur waktu lebih baik.”

Lebih baik:

> “Selama 15 menit malam ini, tulis semua tugas yang sedang memenuhi pikiranmu. Pilih satu yang akan dikerjakan besok pagi dan biarkan sisanya menunggu.”

---

## 13.4 Why this action?

Sistem sebaiknya menjelaskan alasan pemilihan action.

Contoh:

> “Langkah ini dipilih karena dari ceritamu, masalah yang paling menonjol bukan kurangnya usaha, tetapi terlalu banyak hal yang terasa harus diselesaikan sekaligus.”

---

## 13.5 Alternative Action

Sediakan alternatif ketika action utama tidak cocok.

Contoh:

```text
Primary Action
Alternative Action
Low-Energy Alternative
```

Alternatif harus tetap konsisten dengan need dan konteks user.

---

## 13.6 Completion

User dapat:

```text
I'll try this
        ↓
Done
```

Status completion menjadi bagian dari session.

---

# 14. Stage 5 — SUMMARY

Summary menyatukan perjalanan tanpa menciptakan diagnosis baru.

Struktur utama:

```text
WHAT YOU SHOW
WHAT YOU CARRY
WHAT YOU MAY NEED
YOUR NEXT STEP
```

Contoh:

```text
WHAT YOU SHOW
Strong • Productive

WHAT YOU CARRY
Academic Pressure
Fear of Falling Behind

WHAT YOU MAY NEED
Rest + Control

YOUR NEXT STEP
Choose one task and let another wait.
```

AI boleh memberikan closing reflection yang natural, tetapi tidak boleh menjadi motivational quote generik atau klaim psikologis.

---

# 15. Cross-Stage Intelligence

Inilah salah satu nilai utama UNMASKED.

AI bukan kumpulan chatbot kecil yang berdiri sendiri.

Contoh journey:

```text
MASK
Strong + Productive
        ↓
LOAD
Academic Pressure
Fear of Disappointing Others
        ↓
AI
Pattern: responsibility overload
        ↓
NEED
Control + Rest
        ↓
ACTION
Reduce immediate workload by choosing one priority
```

### Aturan

**Semakin jauh perjalanan, semakin kaya konteks.**

Action tidak boleh dihasilkan hanya berdasarkan Need Sheet. Ia harus dipengaruhi oleh seluruh konteks yang relevan.

---

# 16. AI Architecture

Jangan membuat satu prompt raksasa untuk seluruh aplikasi.

Gunakan AI berdasarkan stage.

Contoh awal:

```text
POST /api/ai/mask
POST /api/ai/load
POST /api/ai/need
POST /api/ai/action
POST /api/ai/summary
POST /api/safety/check
```

Setiap endpoint mempunyai:

- input schema;
- context yang dibutuhkan;
- output schema;
- safety constraints;
- error handling.

---

# 17. Structured AI Output

AI sebaiknya mengembalikan JSON terstruktur, bukan paragraph bebas yang harus diparse frontend.

Contoh:

```json
{
  "reflection": "...",
  "themes": [],
  "emotions": [],
  "possibleNeeds": [],
  "question": "...",
  "confidence": "medium"
}
```

Frontend hanya merender hasil sesuai schema.

---

# 18. AI Rules

## Jangan

- memberikan diagnosis;
- mengarang fakta;
- mengklaim mengetahui user secara pasti;
- memaksakan interpretasi;
- membuat insight terlalu generik;
- mengubah semua masalah menjadi “kamu butuh istirahat”;
- memberi nasihat panjang yang tidak actionable;
- menggunakan konteks yang tidak tersedia.

## Lakukan

- gunakan konteks;
- gunakan bahasa tentatif untuk interpretasi;
- beri alasan;
- fokus pada satu atau beberapa insight yang paling relevan;
- ajukan pertanyaan yang spesifik;
- izinkan koreksi;
- jaga output tetap ringkas;
- gunakan schema terstruktur.

---

# 19. Prompt Design Principle

Setiap prompt sebaiknya memiliki:

```text
ROLE
CONTEXT
TASK
CONSTRAINTS
OUTPUT CONTRACT
```

Contoh struktur:

```text
ROLE
You are a reflective assistant.

CONTEXT
Public self: Strong, Productive
Actual feeling: Exhausted, Overwhelmed

TASK
Identify meaningful contrasts and formulate one reflective question.

CONSTRAINTS
Do not diagnose.
Do not assume facts not provided.
Use tentative language.

OUTPUT
Return JSON matching the specified schema.
```

Prompt final harus berada di codebase dan versioned.

---

# 20. Context Strategy

Tidak semua stage perlu menerima seluruh data mentah.

## MASK

```text
publicSelf
actualFeelings
feelingNote
```

## LOAD

```text
maskInsight
brainDump
categories
```

## NEED

```text
maskInsight
loadInsight
userCorrections
```

## ACTION

```text
loadInsight
needInsight
confirmedNeed
relevantConstraints
```

## SUMMARY

```text
all confirmed results
selected action
completion status
```

---

# 21. Session Data Model

Gunakan satu session sebagai pusat perjalanan.

Contoh konseptual:

```ts
type ReflectionSession = {
  id: string
  status: "active" | "completed"
  currentStage: "mask" | "load" | "need" | "action" | "summary" | "done"

  mask: {
    publicSelf: string[]
    actualFeelings: string[]
    feelingNote?: string
    aiInsight?: MaskInsight
    confirmation?: Confirmation
  }

  load: {
    rawText: string
    items?: LoadItem[]
    aiInsight?: LoadInsight
    confirmation?: Confirmation
  }

  need: {
    candidateNeeds?: Need[]
    questions?: NeedQuestion[]
    answers?: NeedAnswer[]
    finalInsight?: NeedInsight
    confirmation?: Confirmation
  }

  action: {
    recommendations?: ActionRecommendation[]
    selectedActionId?: string
    completed?: boolean
  }

  summary?: {
    whatYouShow?: string
    whatYouCarry?: string[]
    whatYouMayNeed?: string[]
    nextStep?: string
    reflection?: string
  }

  safety?: {
    status: "normal" | "review" | "intervention"
  }

  timestamps: {
    createdAt: string
    updatedAt: string
  }
}
```

Ini adalah konsep awal. Schema database final harus dibuat terpisah di `DATA_CONTRACT.md`.

---

# 22. Frontend vs Backend

## Frontend bertanggung jawab atas

- UI;
- input/form;
- navigation;
- loading state;
- error state;
- rendering AI output;
- confirmation/correction UI;
- client state;
- accessibility;
- interaction dan animation.

Frontend tidak menentukan sendiri insight AI.

## Backend bertanggung jawab atas

- API;
- input validation;
- session processing;
- AI orchestration;
- structured output validation;
- safety processing;
- persistence;
- API key protection;
- authentication jika nantinya digunakan.

---

# 23. Zustand & Session State

Zustand boleh tetap digunakan sebagai state layer frontend.

Namun state prototype yang masih berupa kumpulan field harus diarahkan menjadi state yang merepresentasikan session.

Contoh target:

```text
session.mask
session.load
session.need
session.action
session.summary
```

State jangan menyimpan dummy result seperti production data.

---

# 24. Persistence Strategy

## MVP tanpa akun

Dapat menggunakan:

```text
Zustand + sessionStorage/localStorage
```

untuk session sementara.

## Dengan backend/database

Gunakan database apabila membutuhkan:

- persistence lintas perangkat;
- akun;
- history;
- progress resume.

Karena data refleksi berpotensi sensitif, simpan hanya data yang benar-benar dibutuhkan.

---

# 25. Suggested API

Rancangan awal:

```text
POST /api/sessions
GET  /api/sessions/:id

POST /api/ai/mask
POST /api/ai/load
POST /api/ai/need
POST /api/ai/action
POST /api/ai/summary

POST /api/safety/check
```

Endpoint ini masih konseptual. Request/response final harus ditulis di `API_SPEC.md`.

---

# 26. Loading & Error State

Setiap proses AI minimal memiliki:

```text
Idle
 ↓
Analyzing
 ↓
Success
```

atau:

```text
Idle
 ↓
Analyzing
 ↓
Error
```

Jika AI gagal:

- input user tidak boleh hilang;
- tidak boleh menampilkan hasil AI palsu;
- tersedia retry;
- session tetap konsisten.

---

# 27. Safety & Responsible AI

Safety adalah bagian arsitektur, bukan hanya teks disclaimer.

Konsep awal:

```text
User Input
    ↓
Basic Safety Filter
    ↓
Contextual AI Check
    ↓
Normal Flow
      OR
Safety Intervention
```

Prinsip:

- tidak melakukan diagnosis;
- tidak menyederhanakan situasi serius menjadi saran generik;
- tidak memaksa user meneruskan refleksi;
- menyediakan jalur bantuan yang sesuai ketika diperlukan;
- meminimalkan penyimpanan data sensitif;
- memberi kontrol kepada user.

Detail operasional harus berada di `SAFETY.md`.

---

# 28. Current Page → Target Behavior

| Page | Kondisi Prototype | Target |
|---|---|---|
| `public-self` | Input selection | Tetap menjadi input user |
| `actual-feeling` | Input selection + note | Tetap menjadi input user |
| `mask-result` | Hardcoded reflection | AI contrast + reflection + focused question |
| `brain-dump` | Functional input | Input + Act/Share/Let Go + context |
| `story-reflection` | Hardcoded AI interpretation | LLM theme + pattern + confirmation |
| `need-sheet` | Assessment generik | Dynamic context-aware questions |
| `need-result` | Hardcoded result | AI synthesized need + reason + confirmation |
| `action-step` | Static action list | Personalized AI micro-action + alternatives |
| `summary` | Sebagian dynamic | Fully session-driven summary |
| `selesai` | Completion screen | Session completion |

---

# 29. Apa yang Dipertahankan dari Prototype

Backend tidak berarti frontend harus dibuat ulang.

Pertahankan:

- visual journal/tactile;
- progress journey;
- pemisahan MASK/LOAD/NEED/ACTION;
- interaksi yang sederhana;
- AI interpretation + confirmation;
- summary structure.

Tujuan backend adalah **menghidupkan prototype**, bukan menghapus konsep UX yang sudah ada.

---

# 30. Prioritas Perbaikan

## Prioritas 1 — MASK

Dari:

```text
Input → generic summary
```

Menjadi:

```text
Input → contrast → pattern → reflection → question
```

## Prioritas 2 — LOAD

Pastikan Act/Share/Let Go menjadi bagian nyata dari flow dan AI dapat menemukan tema serta pola.

## Prioritas 3 — NEED

Dari:

```text
generic questions
```

Menjadi:

```text
previous context → AI → dynamic questions → answer → need insight
```

## Prioritas 4 — ACTION

Dari:

```text
static recommendation
```

Menjadi:

```text
MASK + LOAD + NEED → personalized micro-action
```

## Prioritas 5 — SUMMARY

Semua output harus berasal dari session, bukan hardcoded content.

---

# 31. MVP Definition

MVP dianggap berhasil jika user dapat menjalani perjalanan:

```text
Start
 ↓
MASK
 ↓
LOAD
 ↓
AI Reflection
 ↓
NEED
 ↓
AI Reflection
 ↓
ACTION
 ↓
SUMMARY
```

dan AI benar-benar menggunakan konteks dari tahap sebelumnya.

Fitur yang tidak wajib untuk MVP:

- social features;
- public profile;
- gamification kompleks;
- dashboard besar;
- history kompleks;
- admin panel besar.

---

# 32. Definition of Done

Sebuah stage dianggap selesai apabila:

- UI terhubung ke data nyata;
- input tervalidasi;
- API berhasil dipanggil;
- output AI memiliki schema;
- loading state tersedia;
- error state tersedia;
- user dapat mengoreksi AI bila diperlukan;
- data tersimpan dalam session;
- output dapat digunakan stage berikutnya;
- tidak ada hardcoded insight yang dianggap sebagai hasil final.

---

# 33. Testing Strategy

## Unit testing

- validation schema;
- state transformation;
- utility;
- mapping API response.

## Integration testing

- frontend → API;
- API → AI;
- AI response → schema parser.

## E2E testing

Satu user harus dapat menjalankan:

```text
Landing
→ MASK
→ LOAD
→ NEED
→ ACTION
→ SUMMARY
```

## AI evaluation

Buat skenario anonim dan evaluasi:

- relevance;
- grounding;
- genericness;
- hallucination;
- tone;
- safety;
- usefulness of action.

---

# 34. Team Development Structure

Jika anggota cukup, pembagian logisnya:

## Frontend

- page integration;
- state;
- forms;
- API consumption;
- loading/error;
- UX.

## Backend

- route handlers;
- validation;
- session;
- persistence;
- API security.

## AI

- prompts;
- JSON schemas;
- model integration;
- context strategy;
- AI evaluation.

## Safety / QA

- safety scenarios;
- hallucination checks;
- regression;
- inappropriate recommendations;
- consistency.

Satu orang dapat memegang beberapa peran bila jumlah anggota sedikit.

---

# 35. Git & Collaboration Rules

Branch contoh:

```text
main
develop

feature/mask-ai
feature/load-ai
feature/need-ai
feature/action-ai
feature/session
feature/safety
feature/api
```

Commit contoh:

```text
feat: connect mask result to ai endpoint
feat: add dynamic need question schema
fix: preserve brain dump when ai request fails
refactor: normalize reflection session state
```

Utamakan nama branch berdasarkan pekerjaan/feature, bukan nama halaman semata.

---

# 36. Review Rules

Sebelum merge, periksa:

1. Apakah perubahan masih mengikuti user journey?
2. Apakah data dari stage sebelumnya tetap tersedia?
3. Apakah output AI sesuai schema?
4. Apakah user masih dapat mengoreksi AI?
5. Apakah ada behavior baru yang belum dirancang?
6. Apakah ada hardcoded data yang seharusnya dinamis?
7. Apakah safety terdampak?

---

# 37. Example End-to-End Scenario

## MASK

Public:

```text
Strong
Productive
```

Actual:

```text
Tired
Overwhelmed
```

## LOAD

```text
Three deadlines this week.
I am afraid of disappointing my team.
I keep working even when I am exhausted.
```

## AI insight

```text
Themes:
- Academic pressure
- Expectation
- Fear of disappointing others

Possible pattern:
High responsibility + difficulty allowing rest
```

## NEED

Possible:

```text
Control
Rest
Support
```

Dynamic question:

> “Which part feels hardest to control right now?”

User:

> “Too many things depend on me.”

## NEED RESULT

```text
Possible primary need: CONTROL
```

Reason:

> “Your responses suggest that the pressure comes partly from feeling responsible for too many things at once.”

User confirms.

## ACTION

> “List all active responsibilities. Mark only one that truly must move forward tomorrow morning. Let the rest remain untouched tonight.”

Alternative:

> “Tell one teammate which part you currently need help with.”

## SUMMARY

```text
What You Show
Strong / Productive

What You Carry
Academic pressure
Responsibility
Fear of disappointing others

What You May Need
A stronger sense of control
Permission to reduce load

Your Next Step
Choose one responsibility for tomorrow and let the others wait.
```

---

# 38. Product Differentiator

UNMASKED sebaiknya tidak diposisikan sebagai:

> “A journal with AI.”

Konsep yang lebih tepat:

> **A guided AI-assisted reflection journey that progressively connects what the user shows, what they carry, what they may need, and what they can do next.**

Nilai utamanya adalah **progressive understanding** dan **cross-stage context**.

---

# 39. Dokumentasi Pendamping yang Disarankan

## Wajib

### `PROJECT_GUIDE.md`

Dokumen ini. Berisi vision, product behavior, stage, rules, MVP, dan collaboration principles.

### `USER_FLOW.md`

Berisi detail:

```text
Page
↓
User action
↓
System response
↓
Next page
↓
Data produced
```

Tujuan: designer, frontend, backend, dan AI memahami perjalanan yang sama.

### `DATA_CONTRACT.md`

Berisi struktur data resmi antar-stage dan JSON schema.

Ini adalah kontrak utama frontend ↔ backend ↔ AI.

### `AI_SPEC.md`

Berisi:

- tugas AI per stage;
- input/context;
- prompt objective;
- output schema;
- constraints;
- examples;
- model/prompt versioning;
- evaluation criteria.

### `API_SPEC.md`

Berisi:

- endpoint;
- method;
- request;
- response;
- validation;
- errors;
- authentication.

### `SAFETY.md`

Berisi:

- safety principle;
- detection;
- intervention;
- prohibited output;
- escalation behavior;
- data/privacy rules.

## Sangat disarankan

### `UI_MAP.md`

Berisi page, component, state, API dependency, dan user action.

### `CONTRIBUTING.md`

Berisi branch, commit, PR, code style, review, dan folder convention.

### `EVALUATION.md`

Berisi cara mengevaluasi output AI dan end-to-end behavior.

---

# 40. Source of Truth Order

Agar perubahan tidak saling bertentangan, gunakan urutan konsep:

```text
PROJECT_GUIDE.md
       ↓
USER_FLOW.md
       ↓
AI_SPEC.md
       ↓
DATA_CONTRACT.md
       ↓
API_SPEC.md
       ↓
Implementation
```

Namun setelah implementasi berubah, dokumentasi juga harus diperbarui.

Dokumentasi tidak boleh tertinggal jauh dari implementation.

---

# 41. Recommended Implementation Order

Jangan mengerjakan semua page secara paralel.

Bangun berdasarkan **alur data**:

```text
1. Finalize data contract
        ↓
2. Finalize AI output schemas
        ↓
3. Normalize session state
        ↓
4. Build MASK AI
        ↓
5. Build LOAD AI
        ↓
6. Build dynamic NEED
        ↓
7. Build personalized ACTION
        ↓
8. Connect SUMMARY
        ↓
9. Add safety layer
        ↓
10. E2E testing
```

Urutan tersebut menjaga agar setiap stage memiliki data yang dibutuhkan sebelum stage berikutnya dibangun.

---

# 42. Final Direction

Target akhir UNMASKED bukan sekadar:

```text
Frontend + LLM API
```

Targetnya adalah:

```text
A coherent reflection system
```

dengan alur:

```text
USER INPUT
      ↓
CONTEXT
      ↓
AI INTERPRETATION
      ↓
USER CONFIRMATION
      ↓
DEEPER CONTEXT
      ↓
NEED
      ↓
ACTION
      ↓
SUMMARY
```

Setiap fitur baru harus dapat menjawab pertanyaan:

> **Apakah fitur ini membantu user memahami apa yang ia tunjukkan, apa yang ia bawa, apa yang mungkin ia butuhkan, atau apa langkah kecil yang dapat ia ambil?**

Jika tidak, fitur tersebut harus dievaluasi kembali sebelum menjadi bagian dari MVP.

---

# 43. One-Sentence Product Definition

> **UNMASKED is a guided AI-assisted reflection journey that helps students move from “I'm fine” to a clearer understanding of what they show, what they carry, what they may need, and what they can do next.**
