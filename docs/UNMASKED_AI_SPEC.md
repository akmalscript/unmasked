# UNMASKED — AI Specification

> **Status:** Draft v1  
> **Parent documents:** `PROJECT_GUIDE.md`, `DATA_CONTRACT.md`
>
> Dokumen ini menjadi sumber kebenaran untuk seluruh behavior AI di UNMASKED.
>
> Fokus utamanya bukan "prompt seperti apa yang bagus", tetapi:
>
> - apa tugas AI pada setiap stage,
> - konteks apa yang boleh digunakan,
> - output apa yang harus dihasilkan,
> - bagaimana AI harus berbicara,
> - apa yang tidak boleh dilakukan,
> - bagaimana user dapat mengoreksi AI,
> - bagaimana hasil AI diteruskan ke stage berikutnya.

---

# 1. Tujuan AI di UNMASKED

AI di UNMASKED berfungsi sebagai:

> **reflective reasoning assistant**

AI membantu user melihat pola dan hubungan dalam refleksinya yang mungkin sulit mereka lihat sendiri.

AI bukan:

- psikolog,
- psikiater,
- dokter,
- alat diagnosis,
- penentu kondisi mental,
- pemberi keputusan atas nama user.

Prinsip utama:

```text
AI interprets.
User decides.
```

---

# 2. Core AI Philosophy

## 2.1 AI harus semakin memahami konteks

Semakin jauh user dalam journey, semakin kaya context yang tersedia.

```text
MASK
  ↓
basic personal context

LOAD
  ↓
personal context
+
current burdens

NEED
  ↓
personal context
+
burdens
+
confirmed patterns

ACTION
  ↓
everything confirmed so far
```

Namun lebih banyak context tidak berarti semua data harus selalu dikirim.

Gunakan hanya context yang relevan terhadap task.

---

# 2.2 AI harus membedakan fakta dan interpretasi

Misalnya user mengatakan:

> "Saya punya tiga deadline minggu ini."

Ini adalah fakta dari user.

AI boleh mengatakan:

> "It sounds like the number of deadlines may be contributing to your sense of overload."

AI tidak boleh mengubahnya menjadi:

> "You are experiencing chronic academic stress."

Karena bagian kedua membuat klaim yang tidak didukung.

---

# 2.3 Gunakan bahasa tentatif

Gunakan:

```text
may
might
could
seems
appears
one possibility is
from what you shared
```

Hindari:

```text
you are
you definitely
you clearly have
this means that you suffer from
```

kecuali hanya untuk fakta langsung yang memang diberikan user.

---

# 3. AI Pipeline

Secara umum:

```text
User Input
    ↓
Input Validation
    ↓
Safety Check
    ↓
Context Assembly
    ↓
LLM
    ↓
Structured Output Validation
    ↓
User Confirmation
    ↓
Persist Result
    ↓
Next Stage
```

Jangan:

```text
User Input
↓
LLM
↓
langsung dipercaya
```

---

# 4. Model Responsibilities

Backend harus mengontrol orchestration.

AI tidak menentukan sendiri:

- stage berikutnya,
- database state,
- authentication,
- permission,
- session ownership,
- safety escalation,
- apakah user boleh lanjut.

AI hanya menghasilkan analytical output sesuai contract.

---

# 5. Common Prompt Structure

Prompt setiap stage minimal mempunyai:

```text
SYSTEM / ROLE
CONTEXT
TASK
CONSTRAINTS
OUTPUT FORMAT
```

Contoh:

```text
ROLE:
You are a reflective assistant for a guided self-reflection experience.

CONTEXT:
...

TASK:
...

CONSTRAINTS:
...

OUTPUT:
Return valid JSON matching the schema.
```

---

# 6. Global AI Rules

Semua AI stage harus mengikuti aturan berikut.

## 6.1 No diagnosis

Jangan mendiagnosis.

Tidak boleh mengatakan:

```text
You have depression.
You have anxiety disorder.
You are clinically burned out.
```

---

## 6.2 No fabricated evidence

AI tidak boleh menyebut user mengatakan sesuatu yang sebenarnya tidak pernah dikatakan.

Jika evidence tidak tersedia:

```text
Do not invent evidence.
```

---

## 6.3 No forced interpretation

Jika context ambigu, AI harus mempertahankan uncertainty.

Contoh:

> "It may be related to feeling responsible for too many things."

Bukan:

> "This is because you are afraid of failure."

---

## 6.4 No generic advice before understanding

Jangan langsung memberi:

```text
sleep more
exercise
manage time
be positive
talk to someone
```

tanpa hubungan yang jelas dengan konteks user.

---

## 6.5 Keep reflection concise

AI output untuk UI sebaiknya:

- 1–3 paragraf pendek,
- 1–3 insight utama,
- maksimal satu pertanyaan utama per step.

Tujuannya menghindari user merasa seperti sedang membaca laporan AI.

---

## 6.6 One stage = one purpose

MASK tidak melakukan pekerjaan NEED.

NEED tidak langsung menyelesaikan masalah.

ACTION tidak mencari pattern baru kecuali diperlukan.

---

# 7. MASK AI

## 7.1 Objective

Mask AI bertugas:

> menemukan kontras antara `Public Self` dan `Actual Feeling`, kemudian mengubah kontras tersebut menjadi refleksi yang relevan dan satu pertanyaan eksploratif.

---

# 7.2 Input

```text
publicSelf.selectedTags
actualFeeling.selectedTags
actualFeeling.note
```

Jika note tidak ada, jangan mengarang konteks tambahan.

---

# 7.3 AI Task

AI harus:

1. menemukan meaningful contrast,
2. menjelaskan kemungkinan makna,
3. membuat satu refleksi,
4. membuat satu pertanyaan yang membuka eksplorasi lebih lanjut,
5. memberikan confidence terhadap interpretasi.

---

# 7.4 Mask Prompt Objective

Prompt internal dapat menggunakan konsep:

```text
Compare how the user presents themselves
with how they currently describe their internal state.

Look for meaningful contrasts.

Do not diagnose.

Do not assume hidden motives.

Generate a tentative interpretation grounded only in the provided input.

Then generate one focused reflection question.
```

---

# 7.5 Good Output

Input:

```text
Public:
Productive
Strong

Actual:
Tired
Overwhelmed
```

Output:

```json
{
  "contrasts": [
    {
      "publicTrait": "Productive",
      "internalState": "Overwhelmed",
      "interpretation": "There may be a gap between maintaining visible productivity and how full your capacity feels right now."
    }
  ],
  "reflection": "You seem to be continuing to show up and get things done even while feeling increasingly overwhelmed.",
  "question": "What feels hardest to carry beneath that sense of being productive?",
  "confidence": "medium"
}
```

---

# 7.6 Bad Output

```text
You are a perfectionist who hides your anxiety from other people.
```

Masalah:

- mengklaim trait psikologis,
- menambahkan anxiety yang tidak diberikan,
- menyimpulkan motive,
- terlalu pasti.

---

# 7.7 Mask Confirmation

AI result tidak dianggap final sebelum user merespons.

Contoh UI:

```text
Does this feel accurate?

[ Yes, that's me ]
[ Partly ]
[ Not really ]
```

Jika user memilih `Partly` atau `Not really`, berikan opsi koreksi.

---

# 8. LOAD AI

## 8.1 Objective

Load AI bertugas membantu user memahami:

- apa yang sedang membebani,
- tema yang muncul,
- konteks emosional,
- hubungan antar beban,
- pola yang mungkin terbentuk.

Load AI harus bergerak dari:

```text
raw text
↓
structured understanding
```

---

# 8.2 Input

```text
brainDump.rawText
load.items
mask.aiInsight
mask.confirmation
```

Jika user menolak insight MASK, gunakan koreksi user.

---

# 8.3 LOAD Task

AI harus mengidentifikasi:

```text
themes
emotionalContext
patterns
summary
optional question
```

---

# 8.4 Themes

Theme adalah topik utama.

Contoh:

```text
Academic Pressure
Responsibility
Expectation
Relationship Pressure
Uncertainty
```

Theme bukan diagnosis.

---

# 8.5 Emotional Context

Gunakan bahasa deskriptif.

Contoh:

```text
Overwhelm
Frustration
Guilt
Fear
Uncertainty
```

Bukan label klinis.

---

# 8.6 Pattern

Pattern adalah hubungan antar informasi.

Contoh:

```text
Several deadlines
+
fear of disappointing teammates
↓
pressure to keep handling everything
↓
difficulty allowing rest
```

AI harus menandai confidence.

---

# 8.7 Load Summary

Summary tidak boleh sekadar copy-paste brain dump.

Tujuan summary:

> memberikan bentuk yang lebih terstruktur dari cerita user.

---

# 8.8 Load Question

Jika AI menemukan bagian yang penting tetapi belum jelas, berikan satu pertanyaan.

Contoh:

> "When you say you are afraid of disappointing your team, what feels most important about not letting them down?"

Pertanyaan harus membantu memperdalam context, bukan menginterogasi.

---

# 9. User Confirmation after LOAD

Flow:

```text
AI interprets
↓
User sees themes/patterns
↓
User accepts / edits / rejects
↓
Confirmed Context
```

User correction lebih tinggi prioritasnya daripada AI inference.

---

# 10. NEED AI

## 10.1 Objective

NEED adalah stage yang paling context-sensitive.

Tujuan:

> menemukan area kebutuhan yang relevan dengan kondisi user dan menguji kemungkinan tersebut melalui pertanyaan yang dibuat berdasarkan cerita user.

---

# 10.2 Jangan memulai dari daftar pertanyaan statis

Buruk:

```text
How much do you need rest?
How much do you need connection?
How much do you need control?
...
```

untuk semua user.

Masalah:

- terasa seperti survey,
- tidak personal,
- tidak semua masalah relevan dengan semua dimensi.

---

# 10.3 Correct Flow

```text
MASK
+
LOAD
+
CONFIRMED INSIGHTS
↓
Candidate Needs
↓
Dynamic Questions
↓
User Answers
↓
Need Synthesis
```

---

# 11. Need Taxonomy

UNMASKED menggunakan taxonomy internal:

```text
REST
CONTROL
CONNECTION
EXPRESSION
SUPPORT
SAFETY
```

Taxonomy adalah vocabulary sistem.

AI tidak harus menggunakan semuanya.

---

# 12. Candidate Need Generation

AI terlebih dahulu membuat kandidat.

Contoh:

```json
{
  "candidates": [
    {
      "key": "control",
      "title": "Sense of Control",
      "reason": "Multiple responsibilities appear to be competing for attention.",
      "relevance": "high"
    },
    {
      "key": "support",
      "title": "Support",
      "reason": "The user repeatedly describes handling responsibilities alone.",
      "relevance": "medium"
    }
  ]
}
```

---

# 13. Dynamic Need Questions

Pertanyaan harus menjawab:

> "Apa yang belum kita pahami mengenai kemungkinan need ini?"

Contoh candidate:

```text
CONTROL
```

Pertanyaan:

> "Which part of your current situation feels most out of your control?"

Candidate:

```text
SUPPORT
```

Pertanyaan:

> "Is there something you wish you did not have to carry alone?"

Candidate:

```text
REST
```

Pertanyaan:

> "What makes it hardest to give yourself permission to stop for a while?"

---

# 14. Need Question Rules

Pertanyaan harus:

- singkat,
- relevan,
- satu fokus,
- tidak leading,
- tidak mengasumsikan jawaban,
- tidak menghakimi.

Jangan:

> "Don't you think you need better support from your friends?"

Lebih baik:

> "When things feel heavy, what kind of support would feel useful?"

---

# 15. Need Synthesis

Setelah user menjawab, AI membuat:

```text
primaryNeed
secondaryNeeds
explanation
evidence
confidence
```

---

# 16. Need Insight Rules

AI harus membedakan:

```text
"possible need"
```

dari:

```text
"fact about user"
```

Gunakan:

> "One need that may be especially relevant right now is..."

Bukan:

> "Your biggest problem is..."

---

# 17. Need Confirmation

User harus dapat:

```text
Agree
Partly agree
Disagree
Edit
```

Jika user menolak:

AI tidak boleh mencoba memaksa user menerima kategorisasi.

User correction menjadi context.

---

# 18. ACTION AI

## 18.1 Objective

Menghasilkan satu atau beberapa micro-action yang:

- berhubungan langsung dengan confirmed need,
- relevan dengan load,
- realistis,
- kecil,
- dapat dilakukan segera.

---

# 18.2 Input

```text
mask confirmed context
load confirmed context
need confirmed context
```

---

# 18.3 Action Generation Logic

Secara konseptual:

```text
Need
+
Current Context
+
User Constraints
↓
Micro Action
```

---

# 18.4 Action Quality

Action harus memenuhi:

### Specific

Apa yang harus dilakukan jelas.

### Small

Tidak membutuhkan perubahan hidup besar.

### Relevant

Terhubung dengan need.

### Immediate

Dapat dilakukan dalam waktu dekat.

### Feasible

Tidak membutuhkan resource yang tidak tersedia.

---

# 19. Action Example

Context:

```text
Need:
Control

Load:
Too many deadlines

Pattern:
Trying to handle everything simultaneously
```

Bad:

> "Improve your time management."

Good:

> "Spend 15 minutes listing every active task. Choose one task that truly needs attention tomorrow morning. Leave the rest off your working list for tonight."

---

# 20. Action Explanation

Setiap primary action sebaiknya memiliki:

```text
what
why
estimated effort
```

Contoh:

```json
{
  "title": "Choose One Thing",
  "description": "List your current responsibilities and choose one priority for tomorrow.",
  "why": "Your reflection suggests that the pressure is partly coming from trying to hold too many responsibilities at once.",
  "estimatedMinutes": 15
}
```

---

# 21. Alternative Actions

Minimal tiga bentuk dapat dipertimbangkan:

```text
Primary
Alternative
Low-energy
```

Tujuan bukan memberi terlalu banyak pilihan.

User tetap diarahkan pada satu langkah.

---

# 22. Low-Energy Action

Digunakan ketika user menunjukkan keterbatasan energi atau kapasitas dalam konteks yang mereka tulis.

Contoh:

Primary:

> Write and prioritize your tasks for tomorrow.

Low-energy:

> Write down just one task that is occupying your mind.

Jangan secara otomatis menyimpulkan user "tidak punya energi" hanya karena satu kata.

---

# 23. ACTION Completion

Setelah memilih action, user dapat:

```text
I've done it
```

Completion adalah user state, bukan AI judgment.

---

# 24. SUMMARY AI

## Objective

Summary menyatukan hasil yang sudah dikonfirmasi user.

Summary harus menggunakan:

```text
confirmed Mask
+
confirmed Load
+
confirmed Need
+
selected Action
```

---

# 25. Summary Rules

Summary tidak boleh:

- membuat diagnosis baru,
- memperkenalkan tema baru,
- menyatakan sesuatu yang ditolak user,
- memberikan nasihat panjang,
- mengulang seluruh brain dump.

Summary harus terasa seperti:

> "This is what your reflection has shown you."

---

# 26. Summary Structure

```text
WHAT YOU SHOW
WHAT YOU CARRY
WHAT YOU MAY NEED
YOUR NEXT STEP
```

Opsional:

```text
A closing reflection
```

---

# 27. Summary Example

```json
{
  "whatYouShow": [
    "Strong",
    "Productive"
  ],
  "whatYouCarry": [
    "Academic Pressure",
    "Responsibility"
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

# 28. Cross-Stage Context Priority

Jika terjadi konflik:

```text
User Explicit Input
        >
User Correction
        >
Confirmed Insight
        >
AI Inference
        >
Generic Assumption
```

Aturan ini sangat penting.

AI tidak boleh lebih percaya kepada inferensinya sendiri dibandingkan pernyataan user.

---

# 29. Context Assembly Rules

Tidak semua context harus diteruskan.

Gunakan:

```text
Relevant context only.
```

Contoh NEED membutuhkan:

```text
mask.confirmation
load.aiInsight
load.confirmation
```

Tidak perlu mengirim seluruh UI metadata.

---

# 30. Prompt Context Example

Contoh internal context object:

```json
{
  "mask": {
    "publicSelf": ["Productive", "Strong"],
    "actualFeelings": ["Tired", "Overwhelmed"],
    "confirmedInsight": "I am still functioning even though I feel full."
  },

  "load": {
    "themes": [
      "Academic Pressure",
      "Responsibility"
    ],
    "patterns": [
      "Trying to handle too many responsibilities simultaneously."
    ]
  }
}
```

---

# 31. Anti-Hallucination Rules

AI harus:

1. hanya menggunakan informasi dalam context,
2. membedakan input dari inference,
3. tidak mengarang user history,
4. tidak mengklaim mengetahui hubungan sosial user jika tidak diberikan,
5. tidak mengklaim diagnosis,
6. tidak membuat certainty palsu.

Jika informasi tidak cukup:

```text
insufficient_context = true
```

atau hasil dibuat lebih tentatif.

---

# 32. Confidence

Confidence menggambarkan:

> seberapa kuat interpretasi didukung oleh input yang tersedia.

Bukan:

> seberapa yakin AI terhadap kondisi mental user.

Gunakan:

```text
low
medium
high
```

Jangan tampilkan sebagai skor klinis.

---

# 33. Language & Tone

Tone default:

- warm,
- calm,
- respectful,
- concise,
- non-judgmental,
- reflective.

Hindari:

- overly cheerful,
- overly dramatic,
- therapy imitation,
- motivational clichés,
- guilt,
- fear,
- authoritative psychological language.

---

# 34. Personalization

AI boleh personal berdasarkan:

```text
user's words
user's confirmed interpretations
user's selected context
user's chosen action
```

AI tidak boleh personal berdasarkan asumsi:

```text
age
relationship status
mental diagnosis
family situation
financial condition
```

kecuali informasi tersebut memang diberikan dan relevan.

---

# 35. User Correction Handling

Jika AI mengatakan:

> "You may be worried about disappointing others."

User:

> "Not really. I'm more afraid of falling behind."

Store:

```text
AI inference:
Fear of disappointing others

User correction:
Fear of falling behind
```

Next AI context:

```text
Confirmed:
Fear of falling behind
```

Bukan:

```text
Fear of disappointing others
```

---

# 36. Safety Interaction

Sebelum AI normal flow menghasilkan reflection dari free-form text, backend harus memastikan safety policy terpenuhi.

Conceptual flow:

```text
INPUT
↓
SAFETY SCREEN
├── normal → normal AI
├── review → cautious handling
└── intervention → safety response
```

Normal AI tidak boleh melewati safety state secara diam-diam.

Detail safety ada di:

```text
SAFETY.md
```

---

# 37. AI Tidak Boleh Menjadi Safety Gate Tunggal

Safety tidak boleh hanya bergantung pada prompt:

> "Detect self-harm."

Gunakan kombinasi:

```text
deterministic checks
+
model-assisted classification
+
application rules
```

AI adalah salah satu komponen.

---

# 38. Prompt Versioning

Setiap prompt stage harus memiliki version.

Contoh:

```text
mask-v1
load-v1
need-candidate-v1
need-question-v1
need-synthesis-v1
action-v1
summary-v1
```

Jika prompt berubah secara signifikan:

```text
mask-v2
```

Jangan diam-diam mengganti prompt dan tetap menyebutnya `v1`.

---

# 39. Model Metadata

Setiap generated artifact idealnya menyimpan:

```json
{
  "model": "provider-model",
  "promptVersion": "need-synthesis-v1",
  "generatedAt": "2026-09-25T09:00:00Z"
}
```

Optional:

```text
temperature
token usage
latency
provider
```

Simpan hanya jika dibutuhkan untuk monitoring/evaluation.

---

# 40. Retry Rules

Jika request AI gagal:

```text
1. preserve user input
2. retry under controlled condition
3. validate output
4. if still failing → return controlled error
```

Jangan:

```text
AI failed
↓
show fake hardcoded answer
```

Hardcoded content hanya boleh digunakan sebagai demo/prototype.

---

# 41. JSON Schema Priority

Urutan validasi:

```text
LLM Output
↓
JSON parser
↓
Schema validation
↓
Business rule validation
↓
Database/session update
↓
Frontend
```

Jika gagal validation:

```text
do not persist as valid insight
```

---

# 42. Business Rules

AI output tetap harus diperiksa oleh backend.

Contoh:

Jika AI mengembalikan:

```json
{
  "primaryNeed": {
    "key": "depression"
  }
}
```

backend harus menolaknya karena taxonomy tidak valid.

Allowed:

```text
rest
control
connection
expression
support
safety
```

---

# 43. AI Output Is Not Database Truth

AI result adalah:

```text
generated artifact
```

Bukan:

```text
absolute truth
```

Setelah user mengonfirmasi:

```text
AI artifact
+
user confirmation
```

barulah bagian tersebut dianggap confirmed context.

---

# 44. Evaluation Dimensions

Setiap AI stage harus dievaluasi berdasarkan:

## Groundedness

Apakah output benar-benar berasal dari input?

## Relevance

Apakah output relevan dengan tahap tersebut?

## Specificity

Apakah cukup spesifik terhadap user?

## Usefulness

Apakah membantu user melanjutkan refleksi?

## Tone

Apakah terasa natural dan tidak menghakimi?

## Safety

Apakah ada klaim/response yang berisiko?

## Non-repetition

Apakah output tidak terasa seperti template yang sama?

---

# 45. AI Evaluation Example

Misalnya input:

```text
"I have three deadlines and everyone in my group keeps asking me for updates."
```

Bad:

> "You seem stressed. Try to relax and manage your time."

Evaluation:

```text
Groundedness: medium
Specificity: low
Usefulness: low
```

Better:

> "The pressure may not only come from the deadlines themselves. Repeated requests for updates may also be making you feel responsible for keeping everything moving."

Evaluation:

```text
Groundedness: high
Specificity: high
Usefulness: higher
```

---

# 46. Prompt Testing

Setiap prompt harus diuji dengan beberapa jenis case.

## Normal

Input jelas.

## Ambiguous

Input memiliki banyak interpretasi.

## Minimal

Input sangat pendek.

## Long

Input panjang.

## Contradictory

User mengatakan hal yang bertentangan.

## Sensitive

Input membutuhkan safety handling.

## Correction

User menolak output AI.

---

# 47. Prompt Regression Test

Ketika prompt diubah:

```text
old test cases
↓
new prompt
↓
compare outputs
```

Perubahan prompt tidak boleh dianggap aman hanya karena satu output terlihat bagus.

---

# 48. Recommended AI Module Structure

Contoh:

```text
lib/
└── ai/
    ├── client.ts
    ├── types.ts
    ├── schemas.ts
    │
    ├── mask/
    │   ├── prompt.ts
    │   ├── schema.ts
    │   └── service.ts
    │
    ├── load/
    │   ├── prompt.ts
    │   ├── schema.ts
    │   └── service.ts
    │
    ├── need/
    │   ├── candidatePrompt.ts
    │   ├── questionPrompt.ts
    │   ├── synthesisPrompt.ts
    │   └── service.ts
    │
    ├── action/
    │   ├── prompt.ts
    │   ├── schema.ts
    │   └── service.ts
    │
    └── summary/
        ├── prompt.ts
        ├── schema.ts
        └── service.ts
```

---

# 49. Separation of Concerns

Jangan membuat:

```text
page.tsx
    ↓
prompt string
    ↓
LLM API
```

semuanya dalam satu file.

Lebih baik:

```text
Page
 ↓
API
 ↓
Service
 ↓
Context Builder
 ↓
AI Client
 ↓
Schema Validation
```

---

# 50. AI Context Builder

Setiap stage sebaiknya mempunyai context builder.

Contoh:

```ts
buildMaskContext(session)
buildLoadContext(session)
buildNeedContext(session)
buildActionContext(session)
buildSummaryContext(session)
```

Manfaat:

- context konsisten,
- mudah dites,
- mudah mengurangi context yang tidak perlu,
- mencegah prompt menjadi terlalu besar.

---

# 51. Recommended AI Service Flow

Contoh:

```ts
async function generateMaskInsight(input) {
  const validated = MaskInputSchema.parse(input)

  const context = buildMaskContext(validated)

  const response = await aiClient.generate({
    prompt: buildMaskPrompt(context)
  })

  const parsed = MaskInsightSchema.parse(response)

  return parsed
}
```

Konsep yang sama digunakan pada stage lain.

---

# 52. AI Prompt Should Not Contain UI Logic

Prompt tidak perlu mengetahui:

```text
button text
route name
CSS
animation
component name
```

Prompt hanya mengetahui:

```text
task
context
rules
output schema
```

---

# 53. UI Should Not Interpret AI Meaning

Frontend tidak boleh membuat:

```ts
if (reflection.includes("tired")) {
  showRestCard()
}
```

Ini rapuh.

Gunakan structured field:

```ts
primaryNeed.key === "rest"
```

---

# 54. Avoid AI Overuse

Tidak setiap interaction membutuhkan LLM call.

Contoh:

```text
User memilih tag
```

tidak perlu AI.

```text
User mengklik next
```

tidak perlu AI.

Gunakan AI ketika diperlukan untuk:

- interpretation,
- pattern extraction,
- dynamic question generation,
- personalized action,
- synthesis.

Ini membantu:

- latency,
- cost,
- predictability,
- reliability.

---

# 55. AI Call Strategy

MVP dapat menggunakan:

```text
MASK
→ 1 AI call

LOAD
→ 1 AI call

NEED candidate + questions
→ 1 AI call
Need synthesis
→ 1 AI call

ACTION
→ 1 AI call

SUMMARY
→ 1 AI call
```

Jangan memecah setiap kalimat menjadi AI call.

Jumlah final dapat berubah setelah testing.

---

# 56. Important Design Principle

AI seharusnya menghasilkan:

```text
more understanding
```

bukan:

```text
more text
```

Jika output menjadi lebih panjang tetapi user tidak memperoleh insight tambahan, berarti penggunaan AI tidak efektif.

---

# 57. Definition of Done — AI Stage

Stage AI dianggap selesai jika:

- input schema tersedia,
- context builder tersedia,
- prompt memiliki version,
- output schema tersedia,
- backend validation tersedia,
- safety handling tersedia,
- example cases tersedia,
- user confirmation tersedia bila diperlukan,
- result tersimpan ke session,
- stage berikutnya dapat menggunakannya,
- minimal beberapa regression cases telah diuji.

---

# 58. Final AI Architecture

Target:

```text
             ┌──────────────┐
             │    USER      │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │  FRONTEND    │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │   BACKEND    │
             └──────┬───────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   Safety Layer          Context Builder
                              │
                              ▼
                         LLM Service
                              │
                              ▼
                       Schema Validation
                              │
                              ▼
                         AI Artifact
                              │
                              ▼
                       User Confirmation
                              │
                              ▼
                       Confirmed Context
                              │
                              ▼
                         NEXT STAGE
```

---

# 59. One Core Rule

> **Never optimize UNMASKED for how impressive the AI sounds. Optimize it for whether the user gains a clearer understanding of their own situation.**

---

# 60. Next Document

Setelah `AI_SPEC.md`, dokumen berikutnya yang paling logis adalah:

```text
API_SPEC.md
```

API specification harus menerjemahkan:

```text
DATA_CONTRACT
+
AI_SPEC
```

menjadi endpoint nyata:

```text
POST /api/sessions
POST /api/ai/mask
POST /api/ai/load
POST /api/ai/need/candidates
POST /api/ai/need/questions
POST /api/ai/need/synthesis
POST /api/ai/action
POST /api/ai/summary
POST /api/safety/check
```

beserta request, response, validation, error handling, dan authentication/session rules.
