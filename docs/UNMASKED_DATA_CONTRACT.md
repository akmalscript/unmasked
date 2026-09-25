# UNMASKED — Data Contract

> **Status:** Draft v1  
> **Fungsi:** Kontrak data bersama antara Frontend, Backend, dan AI  
> **Parent document:** `PROJECT_GUIDE.md`
>
> Dokumen ini mendefinisikan data apa yang masuk, data apa yang dihasilkan, bagaimana data berpindah antar-stage, dan bentuk JSON yang digunakan oleh sistem.
>
> **Prinsip utama:** data contract adalah sumber kebenaran untuk struktur data. Implementasi frontend, backend, dan AI tidak boleh membuat struktur sendiri-sendiri tanpa memperbarui dokumen ini.

---

# 1. Tujuan

`DATA_CONTRACT.md` dibuat agar seluruh anggota tim memiliki pemahaman yang sama tentang:

- struktur satu reflection session,
- input dan output setiap stage,
- hubungan antar-stage,
- field yang wajib dan opsional,
- data hasil AI,
- data hasil konfirmasi user,
- data safety,
- status progress,
- format timestamp,
- aturan perubahan schema.

Dokumen ini bukan dokumentasi database secara fisik.

Perbedaan:

```text
DATA_CONTRACT.md
= bentuk data yang dipertukarkan aplikasi

DATABASE_SCHEMA.md
= bagaimana data tersebut disimpan di database
```

---

# 2. Core Principle

UNMASKED menggunakan satu konsep pusat:

```text
Reflection Session
```

Satu user journey direpresentasikan sebagai satu session.

Contoh:

```text
Session
 ├── Mask
 ├── Load
 ├── Need
 ├── Action
 ├── Summary
 └── Safety
```

Semua stage harus dapat ditelusuri kembali ke `sessionId`.

---

# 3. High-Level Data Flow

```text
                 ReflectionSession
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
      MASK             LOAD             Safety
        │               │
        └───────┬───────┘
                ▼
              NEED
                │
                ▼
              ACTION
                │
                ▼
             SUMMARY
```

Secara detail:

```text
Public Self
     +
Actual Feeling
     +
Feeling Note
     ↓
MASK AI
     ↓
Mask Insight
     ↓
Brain Dump
     +
Load Categories
     ↓
LOAD AI
     ↓
Load Insight
     ↓
Mask Insight + Load Insight
     ↓
NEED AI
     ↓
Need Questions
     ↓
User Answers
     ↓
Need Insight
     ↓
ACTION AI
     ↓
Action Recommendations
     ↓
User Selects Action
     ↓
SUMMARY
```

---

# 4. Data Ownership

Setiap jenis data memiliki owner yang jelas.

| Data | Owner | Sumber |
|---|---|---|
| Public Self | User | Frontend input |
| Actual Feelings | User | Frontend input |
| Feeling Note | User | Frontend input |
| Brain Dump | User | Frontend input |
| Load Category | User | User interaction |
| AI Reflection | AI system | LLM |
| AI Themes | AI system | LLM |
| AI Pattern | AI system | LLM |
| Need Questions | AI system | LLM |
| Need Answers | User | Frontend input |
| Confirmed Need | User + AI | User confirmation |
| Action Recommendation | AI system | LLM |
| Selected Action | User | Frontend input |
| Action Completion | User | Frontend input |
| Summary | System | Derived from session |
| Safety Status | Safety layer | Rule + AI |
| Session Status | Backend | System state |

---

# 5. ID Convention

Setiap session harus mempunyai identifier unik.

Contoh:

```text
sessionId = UUID
```

Contoh:

```json
{
  "sessionId": "0f5d4f0f-5d8e-4b73-9c40-82a1a7d0d321"
}
```

AI result juga sebaiknya dapat dilacak.

Contoh:

```json
{
  "analysisId": "..."
}
```

---

# 6. Common Data Types

## 6.1 Confirmation

Digunakan ketika user menilai hasil interpretasi AI.

```ts
type ConfirmationStatus =
  | "accepted"
  | "partially_accepted"
  | "rejected"
  | "edited"
```

Struktur:

```ts
type UserConfirmation = {
  status: ConfirmationStatus
  correction?: string
  note?: string
  confirmedAt: string
}
```

Contoh:

```json
{
  "status": "partially_accepted",
  "correction": "Saya memang kewalahan, tetapi bukan karena takut mengecewakan orang.",
  "confirmedAt": "2026-09-25T08:30:00.000Z"
}
```

---

# 7. Common AI Metadata

Semua hasil AI sebaiknya menyimpan metadata minimum.

```ts
type AIArtifactMeta = {
  model: string
  promptVersion: string
  generatedAt: string
}
```

Contoh:

```json
{
  "model": "provider-model",
  "promptVersion": "mask-v1",
  "generatedAt": "2026-09-25T08:30:00.000Z"
}
```

Tujuannya:

- debugging,
- evaluasi,
- reproducibility,
- tracking perubahan prompt,
- membandingkan hasil model.

---

# 8. Reflection Session

Struktur utama:

```ts
type ReflectionSession = {
  id: string

  status: SessionStatus

  currentStage: SessionStage

  mask: MaskStage

  load: LoadStage

  need: NeedStage

  action: ActionStage

  summary?: SummaryStage

  safety: SafetyState

  timestamps: SessionTimestamps
}
```

---

# 9. Session Status

```ts
type SessionStatus =
  | "active"
  | "completed"
  | "abandoned"
  | "safety_intervention"
```

Penjelasan:

### `active`

User masih menjalankan session.

### `completed`

Seluruh flow selesai.

### `abandoned`

User berhenti sebelum selesai.

### `safety_intervention`

Session memasuki safety handling dan normal flow dapat dihentikan atau ditunda.

---

# 10. Session Stage

```ts
type SessionStage =
  | "onboarding"
  | "mask"
  | "load"
  | "need"
  | "action"
  | "summary"
  | "completed"
```

---

# 11. Session Timestamps

```ts
type SessionTimestamps = {
  createdAt: string
  updatedAt: string
  completedAt?: string
}
```

Gunakan ISO 8601.

Contoh:

```text
2026-09-25T08:30:00.000Z
```

---

# 12. MASK Data Contract

MASK terdiri dari:

```text
Public Self
+
Actual Feeling
+
Optional Note
↓
AI Insight
↓
User Confirmation
```

---

# 13. Public Self

```ts
type PublicSelf = {
  selectedTags: string[]
}
```

Contoh:

```json
{
  "selectedTags": [
    "Productive",
    "Strong",
    "Reliable"
  ]
}
```

---

# 14. Actual Feeling

```ts
type ActualFeeling = {
  selectedTags: string[]
  note?: string
}
```

Contoh:

```json
{
  "selectedTags": [
    "Tired",
    "Overwhelmed"
  ],
  "note": "Saya masih bisa mengerjakan banyak hal, tapi rasanya sudah sangat penuh."
}
```

---

# 15. Mask Insight

AI tidak hanya menghasilkan satu paragraph.

Gunakan struktur:

```ts
type MaskInsight = {
  contrasts: MaskContrast[]
  reflection: string
  question?: string
  confidence: "low" | "medium" | "high"
  meta: AIArtifactMeta
}
```

---

# 16. Mask Contrast

```ts
type MaskContrast = {
  publicTrait: string
  internalState: string
  interpretation: string
}
```

Contoh:

```json
{
  "publicTrait": "Productive",
  "internalState": "Overwhelmed",
  "interpretation": "There may be a gap between visible performance and internal capacity."
}
```

`interpretation` harus tetap bersifat tentatif.

---

# 17. Mask User Confirmation

```ts
type MaskStage = {
  publicSelf: PublicSelf
  actualFeeling: ActualFeeling

  aiInsight?: MaskInsight

  confirmation?: UserConfirmation
}
```

---

# 18. LOAD Data Contract

LOAD terdiri dari:

```text
Brain Dump
+
Load Items
+
Act / Share / Let Go
↓
AI Analysis
↓
User Confirmation
```

---

# 19. Brain Dump

```ts
type BrainDump = {
  rawText: string
}
```

Contoh:

```json
{
  "rawText": "Tugas kuliah banyak, organisasi juga belum selesai..."
}
```

Raw input harus dipertahankan selama session karena menjadi sumber utama analisis.

---

# 20. Load Item

Jika user memecah brain dump menjadi beberapa item:

```ts
type LoadItem = {
  id: string
  text: string
  category?: LoadCategory
}
```

---

# 21. Load Category

```ts
type LoadCategory =
  | "act"
  | "share"
  | "let_go"
```

Makna:

### `act`

Hal yang dapat diambil tindakannya oleh user.

### `share`

Hal yang mungkin perlu dibicarakan atau dibagikan.

### `let_go`

Hal yang mungkin tidak sepenuhnya berada dalam kontrol user atau tidak perlu terus dibawa.

Category bukan diagnosis atau penilaian moral.

---

# 22. Load Insight

```ts
type LoadInsight = {
  themes: LoadTheme[]
  emotionalContext: EmotionalContext[]
  patterns: LoadPattern[]
  summary: string
  question?: string
  confidence: "low" | "medium" | "high"
  meta: AIArtifactMeta
}
```

---

# 23. Load Theme

```ts
type LoadTheme = {
  name: string
  description?: string
  relevance: "low" | "medium" | "high"
}
```

Contoh:

```json
{
  "name": "Academic Pressure",
  "description": "Multiple deadlines appear to contribute to the user's feeling of overload.",
  "relevance": "high"
}
```

---

# 24. Emotional Context

```ts
type EmotionalContext = {
  label: string
  evidence?: string
  intensity?: "low" | "medium" | "high"
}
```

Contoh:

```json
{
  "label": "Overwhelm",
  "evidence": "The user describes several simultaneous responsibilities.",
  "intensity": "high"
}
```

`intensity` adalah intensitas bahasa/konteks yang muncul dalam tulisan, bukan ukuran klinis.

---

# 25. Load Pattern

Pattern adalah hubungan antar bagian cerita.

```ts
type LoadPattern = {
  description: string
  relatedThemes: string[]
  confidence: "low" | "medium" | "high"
}
```

Contoh:

```json
{
  "description": "Multiple responsibilities appear to create a cycle of trying to handle everything simultaneously, which may make rest difficult.",
  "relatedThemes": [
    "Academic Pressure",
    "Responsibility"
  ],
  "confidence": "medium"
}
```

---

# 26. Load Stage

```ts
type LoadStage = {
  brainDump: BrainDump
  items: LoadItem[]

  aiInsight?: LoadInsight

  confirmation?: UserConfirmation
}
```

---

# 27. NEED Data Contract

NEED adalah bagian paling dinamis.

Flow:

```text
Previous Context
↓
Candidate Needs
↓
Dynamic Questions
↓
User Answers
↓
Need Synthesis
↓
User Confirmation
```

---

# 28. Need Taxonomy

Taxonomy internal:

```ts
type NeedKey =
  | "rest"
  | "control"
  | "connection"
  | "expression"
  | "support"
  | "safety"
```

Taxonomy ini adalah classification vocabulary.

AI tidak diwajibkan menampilkan semua kategori.

---

# 29. Candidate Need

```ts
type CandidateNeed = {
  key: NeedKey
  title: string
  reason: string
  relevance: "low" | "medium" | "high"
}
```

Contoh:

```json
{
  "key": "control",
  "title": "Sense of Control",
  "reason": "Several parts of the reflection involve having too many responsibilities at once.",
  "relevance": "high"
}
```

---

# 30. Need Question

Pertanyaan dibuat AI berdasarkan konteks.

```ts
type NeedQuestion = {
  id: string
  question: string
  targetNeed: NeedKey
  type: "open" | "choice"
}
```

Contoh:

```json
{
  "id": "need-q-001",
  "question": "Which part of this situation feels hardest to control right now?",
  "targetNeed": "control",
  "type": "open"
}
```

---

# 31. Need Answer

```ts
type NeedAnswer = {
  questionId: string
  answer: string
}
```

---

# 32. Need Insight

```ts
type NeedInsight = {
  primaryNeed: CandidateNeed
  secondaryNeeds?: CandidateNeed[]

  explanation: string

  evidence?: string[]

  confidence: "low" | "medium" | "high"

  meta: AIArtifactMeta
}
```

Contoh:

```json
{
  "primaryNeed": {
    "key": "control",
    "title": "Sense of Control",
    "reason": "The user describes multiple responsibilities arriving at the same time.",
    "relevance": "high"
  },
  "explanation": "A major part of the pressure appears connected to feeling responsible for too many things at once.",
  "confidence": "medium"
}
```

---

# 33. Need Stage

```ts
type NeedStage = {
  candidates?: CandidateNeed[]

  questions?: NeedQuestion[]

  answers?: NeedAnswer[]

  finalInsight?: NeedInsight

  confirmation?: UserConfirmation
}
```

---

# 34. ACTION Data Contract

ACTION tidak boleh berdiri sendiri.

Input minimum:

```text
Mask
+
Load
+
Confirmed Need
```

---

# 35. Action Recommendation

```ts
type ActionRecommendation = {
  id: string
  title: string
  description: string
  why: string

  estimatedMinutes?: number

  difficulty?: "low" | "medium"

  type:
    | "primary"
    | "alternative"
    | "low_energy"

  relatedNeed: NeedKey
}
```

Contoh:

```json
{
  "id": "action-001",
  "title": "Choose One Thing",
  "description": "Write down all current responsibilities and choose only one that truly needs attention tomorrow.",
  "why": "Your reflection suggests that the pressure is partly coming from trying to hold too many responsibilities at once.",
  "estimatedMinutes": 15,
  "difficulty": "low",
  "type": "primary",
  "relatedNeed": "control"
}
```

---

# 36. Action Selection

```ts
type ActionSelection = {
  selectedActionId: string
  selectedAt: string
}
```

---

# 37. Action Completion

```ts
type ActionCompletion = {
  completed: boolean
  completedAt?: string
  userNote?: string
}
```

---

# 38. Action Stage

```ts
type ActionStage = {
  recommendations?: ActionRecommendation[]

  selection?: ActionSelection

  completion?: ActionCompletion
}
```

---

# 39. SUMMARY Data Contract

Summary berasal dari data yang telah melalui proses dan/atau dikonfirmasi user.

```ts
type SummaryStage = {
  whatYouShow: string[]
  whatYouCarry: string[]
  whatYouMayNeed: string[]
  nextStep?: string
  reflection?: string

  generatedAt: string
  meta?: AIArtifactMeta
}
```

Contoh:

```json
{
  "whatYouShow": [
    "Strong",
    "Productive"
  ],
  "whatYouCarry": [
    "Academic Pressure",
    "Fear of Falling Behind"
  ],
  "whatYouMayNeed": [
    "Sense of Control",
    "Rest"
  ],
  "nextStep": "Choose one responsibility for tomorrow and let the others wait.",
  "reflection": "You do not need to solve everything at once."
}
```

---

# 40. SAFETY Data Contract

Safety harus tersedia pada level session.

```ts
type SafetyStatus =
  | "normal"
  | "review"
  | "intervention"
```

---

# 41. Safety State

```ts
type SafetyState = {
  status: SafetyStatus

  triggeredAt?: string

  source?: "rule" | "ai" | "combined"

  category?: string

  handled?: boolean
}
```

Jangan menyimpan data safety lebih detail daripada yang diperlukan tanpa alasan yang jelas.

---

# 42. Complete ReflectionSession Example

Contoh gabungan:

```json
{
  "id": "session-001",
  "status": "active",
  "currentStage": "need",

  "mask": {
    "publicSelf": {
      "selectedTags": [
        "Productive",
        "Strong"
      ]
    },

    "actualFeeling": {
      "selectedTags": [
        "Tired",
        "Overwhelmed"
      ],
      "note": "Saya tetap mengerjakan semuanya walaupun sebenarnya sudah penuh."
    },

    "aiInsight": {
      "contrasts": [
        {
          "publicTrait": "Productive",
          "internalState": "Overwhelmed",
          "interpretation": "There may be a gap between visible performance and internal capacity."
        }
      ],
      "reflection": "You seem to be maintaining a productive appearance while feeling increasingly overloaded.",
      "question": "What feels hardest to carry right now?",
      "confidence": "medium",
      "meta": {
        "model": "provider-model",
        "promptVersion": "mask-v1",
        "generatedAt": "2026-09-25T08:30:00Z"
      }
    },

    "confirmation": {
      "status": "accepted",
      "confirmedAt": "2026-09-25T08:31:00Z"
    }
  },

  "load": {
    "brainDump": {
      "rawText": "Tugas kuliah banyak dan saya takut mengecewakan tim."
    },

    "items": [
      {
        "id": "load-001",
        "text": "Tugas kuliah banyak",
        "category": "act"
      },
      {
        "id": "load-002",
        "text": "Takut mengecewakan tim",
        "category": "share"
      }
    ],

    "aiInsight": {
      "themes": [
        {
          "name": "Academic Pressure",
          "description": "Multiple academic responsibilities are contributing to overload.",
          "relevance": "high"
        },
        {
          "name": "Expectation",
          "description": "The user expresses concern about disappointing others.",
          "relevance": "medium"
        }
      ],

      "emotionalContext": [
        {
          "label": "Overwhelm",
          "intensity": "high"
        }
      ],

      "patterns": [
        {
          "description": "Responsibility appears to increase pressure when the user feels they must handle everything themselves.",
          "relatedThemes": [
            "Academic Pressure",
            "Expectation"
          ],
          "confidence": "medium"
        }
      ],

      "summary": "The reflection centers on academic pressure and responsibility toward others.",

      "confidence": "medium",

      "meta": {
        "model": "provider-model",
        "promptVersion": "load-v1",
        "generatedAt": "2026-09-25T08:35:00Z"
      }
    }
  },

  "need": {
    "candidates": [
      {
        "key": "control",
        "title": "Sense of Control",
        "reason": "Several responsibilities appear to be competing for attention.",
        "relevance": "high"
      },
      {
        "key": "rest",
        "title": "Rest",
        "reason": "The user describes feeling exhausted while continuing to work.",
        "relevance": "medium"
      }
    ],

    "questions": [
      {
        "id": "need-q-001",
        "question": "Which part of this situation feels hardest to control right now?",
        "targetNeed": "control",
        "type": "open"
      }
    ],

    "answers": [
      {
        "questionId": "need-q-001",
        "answer": "Too many things depend on me."
      }
    ]
  },

  "action": {},

  "safety": {
    "status": "normal"
  },

  "timestamps": {
    "createdAt": "2026-09-25T08:20:00Z",
    "updatedAt": "2026-09-25T08:40:00Z"
  }
}
```

---

# 43. Frontend ↔ Backend Contract

Frontend mengirim data yang diperlukan.

Contoh:

```http
POST /api/ai/mask
```

Request:

```json
{
  "sessionId": "session-001",
  "publicSelf": [
    "Productive",
    "Strong"
  ],
  "actualFeelings": [
    "Tired",
    "Overwhelmed"
  ],
  "feelingNote": "Saya tetap mengerjakan semuanya."
}
```

Backend mengembalikan:

```json
{
  "success": true,
  "data": {
    "contrasts": [],
    "reflection": "...",
    "question": "...",
    "confidence": "medium",
    "meta": {}
  }
}
```

Frontend tidak perlu mengetahui prompt AI.

---

# 44. Backend ↔ AI Contract

Backend bertanggung jawab untuk:

```text
receive input
↓
validate
↓
build context
↓
call model
↓
validate model output
↓
return structured JSON
```

AI provider tidak boleh menentukan bentuk API publik secara langsung.

---

# 45. Validation Rules

Semua input harus divalidasi.

Contoh:

```text
publicSelf
→ array
→ minimal 1 item

actualFeelings
→ array
→ minimal 1 item

brainDump
→ string
→ tidak kosong
```

AI response juga harus divalidasi sebelum dikirim ke frontend.

---

# 46. Invalid AI Output

Jika model mengembalikan:

```text
invalid JSON
```

atau:

```text
field missing
```

backend harus:

1. mencoba structured retry jika tersedia,
2. atau meminta model memperbaiki output,
3. atau mengembalikan controlled error.

Jangan mengirim JSON rusak ke frontend.

---

# 47. Optional vs Required Data

Gunakan prinsip:

### Required

Data tanpa data tersebut stage tidak dapat diproses.

### Optional

Data yang membantu AI tetapi tidak wajib.

Contoh:

```text
feelingNote
= optional

actualFeelings
= required
```

Jangan membuat terlalu banyak field wajib hanya demi kelengkapan schema.

---

# 48. User Correction sebagai Data

Koreksi user adalah data penting.

Jangan langsung overwrite AI result.

Simpan keduanya:

```text
AI interpretation
+
User correction
```

Contoh:

```json
{
  "aiInsight": "...",
  "confirmation": {
    "status": "edited",
    "correction": "Yang lebih tepat adalah saya takut tertinggal, bukan takut mengecewakan orang."
  }
}
```

Stage berikutnya harus lebih memprioritaskan koreksi user daripada interpretasi AI yang ditolak.

---

# 49. Confirmed Context

Untuk stage berikutnya, gunakan konsep:

```text
raw input
+
AI interpretation
+
user-confirmed interpretation
```

Ketika terjadi konflik:

```text
User correction
>
AI interpretation
```

Contoh:

```text
AI:
"Fear of disappointing others"

User:
"Not really. I am more afraid of falling behind."

Next stage:
gunakan "Fear of falling behind".
```

---

# 50. Data yang Tidak Boleh Menjadi Sumber Truth

Jangan gunakan:

- generated text yang sudah ditampilkan,
- paragraph hasil format UI,
- text yang sudah dipotong untuk display,

sebagai sumber data utama.

Sumber truth harus berupa structured data.

Contoh:

Jangan:

```text
summaryParagraph
```

sebagai satu-satunya sumber.

Lebih baik:

```text
themes[]
patterns[]
needs[]
action{}
```

Kemudian summary dibuat dari data tersebut.

---

# 51. Data Presentation vs Data Domain

Pisahkan:

```text
Domain Data
```

dengan:

```text
UI Presentation Data
```

Contoh domain:

```json
{
  "key": "control",
  "relevance": "high"
}
```

UI boleh menampilkan:

> **You may need a sense of control**

Jika wording UI berubah, domain data tidak perlu diubah.

---

# 52. Schema Evolution

Data contract akan berubah.

Gunakan versioning ketika perubahan signifikan.

Contoh:

```text
DATA_CONTRACT v1
DATA_CONTRACT v2
```

Atau field:

```json
{
  "schemaVersion": "1.0"
}
```

Perubahan breaking harus dibicarakan sebelum implementasi.

---

# 53. Breaking Change

Contoh breaking change:

Dari:

```ts
primaryNeed: string
```

menjadi:

```ts
primaryNeed: CandidateNeed
```

Perubahan seperti ini harus:

1. diperbarui di dokumen,
2. diperbarui pada backend,
3. diperbarui pada frontend,
4. diperbarui pada AI schema,
5. diuji end-to-end.

---

# 54. Recommended Folder Relationship

Contoh struktur:

```text
src/
├── app/
│   ├── api/
│   └── ...
│
├── components/
│   └── ...
│
├── store/
│   └── ...
│
├── lib/
│   ├── ai/
│   ├── validation/
│   └── session/
│
├── types/
│   ├── session.ts
│   ├── mask.ts
│   ├── load.ts
│   ├── need.ts
│   ├── action.ts
│   └── summary.ts
│
└── schemas/
    ├── mask.ts
    ├── load.ts
    ├── need.ts
    └── action.ts
```

Struktur ini adalah rekomendasi, bukan aturan mutlak.

---

# 55. TypeScript Type vs Zod Schema

Karena project menggunakan TypeScript dan Zod, gunakan keduanya:

```text
Zod Schema
→ runtime validation

TypeScript Type
→ compile-time type
```

Idealnya type dapat diturunkan dari schema.

Contoh:

```ts
const MaskInputSchema = z.object({
  publicSelf: z.array(z.string()).min(1),
  actualFeelings: z.array(z.string()).min(1),
  feelingNote: z.string().optional(),
})

type MaskInput = z.infer<typeof MaskInputSchema>
```

Dengan demikian frontend dan backend tidak perlu mendefinisikan type yang bertentangan.

---

# 56. Minimum Contract per Stage

## MASK

Input:

```text
publicSelf
actualFeelings
feelingNote?
```

Output:

```text
contrasts
reflection
question?
confidence
meta
```

---

## LOAD

Input:

```text
brainDump
loadItems
maskContext
```

Output:

```text
themes
emotionalContext
patterns
summary
question?
confidence
meta
```

---

## NEED

Input:

```text
maskContext
loadContext
confirmedInsights
```

Output tahap awal:

```text
candidateNeeds
questions
```

Input tahap lanjutan:

```text
answers
```

Output final:

```text
primaryNeed
secondaryNeeds?
explanation
evidence?
confidence
meta
```

---

## ACTION

Input:

```text
maskContext
loadContext
needContext
```

Output:

```text
recommendations[]
```

User output:

```text
selection
completion
```

---

## SUMMARY

Input:

```text
confirmedMask
confirmedLoad
confirmedNeed
selectedAction
```

Output:

```text
whatYouShow
whatYouCarry
whatYouMayNeed
nextStep
reflection
```

---

# 57. Contract Checklist

Sebelum sebuah stage dianggap terintegrasi:

- [ ] Input schema sudah jelas.
- [ ] Output schema sudah jelas.
- [ ] Required field sudah ditentukan.
- [ ] Optional field sudah ditentukan.
- [ ] Backend validation tersedia.
- [ ] AI response validation tersedia.
- [ ] User correction tersedia jika diperlukan.
- [ ] Data disimpan ke session.
- [ ] Stage berikutnya dapat membaca hasilnya.
- [ ] Error tidak menghilangkan input user.

---

# 58. Golden Rule

Jangan membuat fitur seperti:

```text
"AI menghasilkan paragraph."
```

Kemudian paragraph tersebut langsung dilempar ke stage berikutnya.

Gunakan:

```text
Structured Data
      ↓
AI Interpretation
      ↓
User Confirmation
      ↓
Structured Confirmed Data
      ↓
Next Stage
```

Ini adalah fondasi arsitektur UNMASKED.

---

# 59. Final Contract Principle

UNMASKED harus memperlakukan setiap stage sebagai bagian dari satu perjalanan, bukan sebagai page yang berdiri sendiri.

```text
MASK
↓
LOAD
↓
NEED
↓
ACTION
↓
SUMMARY
```

Data harus mengalir dengan jelas:

```text
user input
→ AI interpretation
→ user confirmation
→ confirmed context
→ next stage
```

Dan ketika AI salah:

```text
AI
↓
User correction
↓
System accepts correction
↓
Next AI receives corrected context
```

Dengan prinsip tersebut, AI UNMASKED dapat menjadi semakin personal sepanjang perjalanan tanpa mengambil alih kontrol dari user.

---

# 60. Next Document

Setelah `DATA_CONTRACT.md`, dokumen yang paling tepat dibuat adalah:

```text
AI_SPEC.md
```

Dokumen tersebut harus mendefinisikan:

```text
MASK prompt
LOAD prompt
NEED prompt
ACTION prompt
SUMMARY prompt
```

beserta:

- tujuan masing-masing AI,
- context yang dikirim,
- output JSON,
- aturan bahasa,
- anti-hallucination,
- user confirmation,
- safety boundary,
- contoh input/output,
- model strategy,
- prompt versioning.

`AI_SPEC.md` sebaiknya dibuat setelah data contract karena prompt dan output AI harus mengikuti schema yang sudah disepakati.
