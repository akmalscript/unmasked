# UNMASKED — AI-First Safety System Specification & Agent Implementation Guide

> **Status:** Implementation specification  
> **Version:** Safety v2  
> **Target branch:** `agathan`  
> **Scope:** Safety / AI / data-flow / system behavior / testing  
> **UI/UX scope:** Hanya perubahan UI yang diperlukan agar safety intervention dapat tampil sebagai modal → floating safety companion. Jangan melakukan redesign visual di luar fitur safety.
>
> **Important:** Dokumen ini dibuat berdasarkan source code repository `unmasked-agathan` yang sedang digunakan saat dokumen ini ditulis. Agent wajib membaca file yang disebutkan di bawah sebelum mengubah kode dan tidak boleh mengarang struktur baru yang bertentangan dengan codebase.

---

# 1. Tujuan Perubahan

UNMASKED saat ini sudah memiliki safety layer deterministik berbasis keyword.

Masalah desain saat ini:

```text
USER INPUT
   ↓
checkCrisisRisk()
   ↓
normalized.includes(trigger)
   ↓
SAFETY_INTERVENTION / NORMAL
```

Implementasi ini terlalu literal.

Contoh masalah:

```text
"Aku membaca berita tentang bunuh diri."
```

tidak sama dengan:

```text
"Aku ingin mengakhiri hidup."
```

Keduanya dapat mengandung kata yang sama, tetapi konteks risikonya berbeda.

Safety v2 mengubah arsitektur menjadi:

```text
USER INPUT
   ↓
AI SAFETY ASSESSMENT
   ↓
SAFE / CONCERN
   ↓
NORMAL UNMASKED AI
```

atau:

```text
USER INPUT
   ↓
AI SAFETY ASSESSMENT
   ↓
HIGH / CRITICAL
   ↓
PERSONALIZED SAFETY INTERVENTION
   ↓
SAFETY MODAL
   ↓
FLOATING SAFETY COMPANION
```

Apabila AI safety assessment gagal secara teknis:

```text
AI SAFETY
   ↓
ERROR / TIMEOUT / INVALID OUTPUT
   ↓
DETERMINISTIC HIGH-SIGNAL FALLBACK
```

Deterministic fallback **bukan sistem utama**.

Deterministic fallback hanya menangkap sinyal yang sangat eksplisit dan berisiko tinggi.

---

# 2. Prinsip Utama yang Tidak Boleh Dilanggar

## 2.1 AI bukan diagnostician

AI boleh:

- memahami konteks,
- mengidentifikasi indikasi risiko,
- membuat respons suportif,
- memberikan alternatif tindakan yang lebih aman,
- merekomendasikan resource yang sudah terdaftar.

AI tidak boleh:

- mendiagnosis depresi, anxiety, atau gangguan mental,
- menyatakan mengetahui kondisi psikologis user secara pasti,
- menyatakan user pasti akan melakukan sesuatu,
- memberikan kepastian bahwa user "baik-baik saja",
- mengarang nomor telepon / hotline,
- menentukan nomor darurat melalui free-form text.

---

## 2.2 Jangan trigger hanya karena keyword

Keyword bukan lagi dasar utama intervensi.

Policy:

```text
keyword ditemukan
≠
safety intervention
```

Yang diperlukan adalah konteks.

AI harus dapat membedakan antara:

```text
orang ketiga
masa lalu
contoh
berita / materi pembelajaran
kutipan
cerita fiksi
```

versus:

```text
user sendiri
kondisi saat ini
niat / tindakan / rencana berbahaya
indikasi bahaya langsung
```

---

## 2.3 Modal hanya untuk risiko yang benar-benar tinggi

Gunakan empat level:

```ts
type SafetyRiskLevel =
  | "safe"
  | "concern"
  | "high"
  | "critical";
```

Perilaku:

### `safe`

```text
Tidak ada intervention.
Normal UNMASKED flow.
```

### `concern`

```text
Ada distress / ambiguity / contextual concern,
tetapi bukti tidak cukup untuk crisis intervention.

Tidak ada popup.
Normal UNMASKED flow tetap berjalan.
```

### `high`

```text
Indikasi risiko serius,
langsung berkaitan dengan user,
dan cukup kuat untuk intervention.

Tampilkan Safety Modal.
```

### `critical`

```text
Risiko sangat serius / immediate danger.

Tampilkan Safety Modal.
Normal reflection output tidak boleh ditampilkan
sebelum intervention handling.
```

---

# 3. Threshold Anti-False-Positive

Popup intervention harus memenuhi policy aplikasi.

Server tidak boleh hanya mempercayai boolean `shouldIntervene` dari model.

Model mengembalikan klasifikasi.

Server mengambil keputusan akhir.

Gunakan policy:

```ts
function shouldTriggerIntervention(
  assessment: SafetyAssessment,
): boolean {
  if (
    assessment.confidence !== "high"
  ) {
    return false;
  }

  if (!assessment.isDirectlyAboutUser) {
    return false;
  }

  if (
    assessment.riskLevel !== "high" &&
    assessment.riskLevel !== "critical"
  ) {
    return false;
  }

  if (
    assessment.riskLevel === "high" &&
    !assessment.isCurrentOrImminent &&
    assessment.category !== "unsafe_action"
  ) {
    return false;
  }

  return true;
}
```

Prinsip:

```text
HIGH + high confidence
+ directly about user
+ current/imminent
→ intervention
```

atau:

```text
CRITICAL + high confidence
+ directly about user
→ intervention
```

Untuk output AI yang berbahaya:

```text
unsafe_action
→ intervention / regenerate safely
```

jika model menilai output itu benar-benar berbahaya.

---

# 4. Yang Tidak Boleh Menjadi Intervention

Kasus berikut **tidak boleh otomatis membuka modal** hanya karena mengandung kata sensitif:

```text
"Aku membaca artikel tentang bunuh diri."

"Temanku pernah mengalami self-harm."

"Film itu memiliki adegan tentang kematian."

"Aku takut gagal dan rasanya ingin menghilang dari tugas."

"Aku sudah capek banget dengan kuliah."
```

Contoh di atas masih memerlukan pemahaman konteks.

Sistem boleh memberikan:

```text
riskLevel = "concern"
```

tetapi:

```text
shouldIntervene = false
```

selama belum ada bukti high/critical yang cukup.

---

# 5. Fitur Safety Baru

Safety v2 harus mempunyai empat fungsi utama:

```text
1. AI contextual safety assessment
2. Personalized intervention response
3. Verified resource routing
4. Persistent floating safety companion
```

---

# 6. Arsitektur Target

Jangan membuat frontend memanggil `/api/safety/assess` lalu memanggil `/api/ai/*` secara terpisah untuk normal flow.

Untuk codebase saat ini, lebih aman dan lebih sederhana:

```text
Existing /api/ai/* route
        ↓
validate body
        ↓
AI safety assessment
        ↓
if SAFE / CONCERN
        ↓
normal AI generation
        ↓
output safety assessment (khusus generated output)
        ↓
return normal result
```

atau:

```text
Existing /api/ai/* route
        ↓
validate body
        ↓
AI safety assessment
        ↓
HIGH / CRITICAL
        ↓
return SAFETY_INTERVENTION
```

Dengan demikian user tetap melihat satu loading process.

Contoh:

```text
User klik lanjut
        ↓
MindfulLoading
        ↓
Safety AI
        ↓
Normal AI
        ↓
Result
```

User tidak perlu mengetahui detail internal bahwa ada safety classification terlebih dahulu.

---

# 7. Kondisi Kode Saat Ini

## 7.1 Existing centralized state

File:

```text
src/store/useJournalStore.ts
```

Saat ini sudah mempunyai:

```ts
sessionId
lastActiveTimestamp

maskInsight
maskConfirmation

loadInsight
loadConfirmation

needInsight
needConfirmation

actionRecommendations
selectedAction
selectedActionId

summaryData
```

Store juga sudah memiliki:

```ts
getConfirmedNeed()
getConfirmedLoadSummary()
getConfirmedLoadThemes()
getConfirmedMaskReflection()
```

dan:

```ts
isMaskCompleted()
isLoadCompleted()
isNeedCompleted()
isActionSelected()
canProceedToSummary()
```

Jangan membuat store session baru untuk data reflection.

---

## 7.2 Existing AI routes

Saat ini terdapat:

```text
src/app/api/ai/mask/route.ts
src/app/api/ai/load/route.ts
src/app/api/ai/need/prepare/route.ts
src/app/api/ai/need/synthesize/route.ts
src/app/api/ai/action/route.ts
src/app/api/ai/summary/route.ts
```

Semua route sudah melakukan:

```text
body size validation
rate limiting
input Zod validation
deterministic safety check
LLM
output validation
safe error handling
```

Safety v2 harus mengganti **bagian deterministic safety gate**, bukan membuat gate kedua yang paralel.

---

## 7.3 Existing deterministic safety

File:

```text
src/lib/safety/crisisKeywords.ts
```

Saat ini:

```ts
const normalized = text.toLowerCase();

for (const trigger of CRISIS_TRIGGERS) {
  if (normalized.includes(trigger)) {
    return {
      isCrisis: true,
      matchedTrigger: trigger,
      emergencyContacts: CRISIS_RESOURCES,
    };
  }
}
```

Ini harus diubah.

Jangan mempertahankan:

```ts
normalized.includes(trigger)
```

sebagai primary intervention detector.

Kode deterministic tetap dipertahankan sebagai fallback.

---

## 7.4 Existing CrisisModal

File:

```text
src/components/CrisisModal.tsx
```

Saat ini modal:

- menggunakan seluruh `CRISIS_RESOURCES`,
- memiliki teks statis,
- tidak menerima context user,
- tidak menerima AI-generated supportive response,
- tidak memiliki floating companion state.

Modal harus direvisi.

---

## 7.5 Existing local modal state

Saat ini `CrisisModal` digunakan pada:

```text
src/components/Header.tsx
src/components/sections/StoryReflectionSection.tsx
src/components/sections/NeedSheetSection.tsx
src/components/sections/NeedResultSection.tsx
```

Sedangkan:

```text
MaskResultSection
ActionStepSection
SummarySection
```

belum memiliki modal safety lokal.

Jangan menambah `useState(false)` baru pada setiap page.

Safety v2 harus memiliki satu UI state terpusat.

---

# 8. Struktur File Target

Tambahkan / modifikasi:

```text
src/
├── app/
│   └── api/
│       ├── ai/
│       │   ├── mask/route.ts
│       │   ├── load/route.ts
│       │   ├── need/prepare/route.ts
│       │   ├── need/synthesize/route.ts
│       │   ├── action/route.ts
│       │   └── summary/route.ts
│       │
│       └── safety/
│           └── check/route.ts
│
├── components/
│   ├── CrisisModal.tsx
│   ├── SafetyCompanion.tsx
│   └── SafetyOverlay.tsx
│
├── lib/
│   └── safety/
│       ├── aiAssessment.ts
│       ├── crisisKeywords.ts
│       ├── crisisResources.ts
│       └── interventionPolicy.ts
│
├── schemas/
│   └── safety.ts
│
└── store/
    ├── useJournalStore.ts
    └── useSafetyUIStore.ts
```

Nama file boleh disesuaikan hanya jika codebase sudah mempunyai util yang ekuivalen.

Jangan membuat file duplikat dengan fungsi yang sama.

---

# 9. Safety Schema

Buat:

```text
src/schemas/safety.ts
```

Gunakan schema terpisah dari `reflection.ts`.

Contoh:

```ts
import { z } from "zod";

export const SafetyRiskLevelSchema = z.enum([
  "safe",
  "concern",
  "high",
  "critical",
]);

export const SafetyCategorySchema = z.enum([
  "none",
  "emotional_distress",
  "self_harm",
  "suicidal_risk",
  "harm_to_others",
  "imminent_physical_danger",
  "abuse",
  "unsafe_action",
  "other",
]);

export const SafetySourceSchema = z.enum([
  "ai",
  "deterministic",
]);

export const SafetyAssessmentSchema = z.object({
  riskLevel: SafetyRiskLevelSchema,

  confidence: z.enum([
    "low",
    "medium",
    "high",
  ]),

  category: SafetyCategorySchema,

  isDirectlyAboutUser: z.boolean(),

  isCurrentOrImminent: z.boolean(),

  signals: z
    .array(z.string().trim().min(1).max(250))
    .max(3),

  supportiveResponse: z
    .string()
    .trim()
    .min(20)
    .max(800),

  saferNextStep: z
    .string()
    .trim()
    .min(10)
    .max(500),

  recommendedResourceIds: z
    .array(z.string().trim().min(1).max(80))
    .max(5),
});
```

Catatan:

`signals` bukan chain-of-thought.

Jangan meminta model menjelaskan hidden reasoning.

`signals` hanya boleh berisi ringkasan sinyal yang terlihat dari input.

---

# 10. Safety Input

Buat schema input internal:

```ts
export const SafetyAssessmentInputSchema = z.object({
  stage: z.enum([
    "mask",
    "load",
    "need_prepare",
    "need_synthesize",
    "action",
    "summary",
  ]),

  userText: z
    .string()
    .trim()
    .max(6000),

  contextualData: z
    .string()
    .trim()
    .max(6000)
    .optional(),
});
```

Pemisahan ini penting.

`userText` = teks yang benar-benar dibuat / dipilih user.

`contextualData` = context aplikasi / hasil AI / metadata yang membantu memahami situasi.

AI harus diberi instruksi:

> Jangan menyimpulkan high-risk hanya dari `contextualData` yang berasal dari AI. Gunakan user-authored content sebagai sumber utama untuk risk determination.

---

# 11. Safety Prompt

Tambahkan pada:

```text
src/lib/ai/prompts.ts
```

prompt khusus:

```ts
export const SAFETY_SYSTEM_INSTRUCTION = `
You are the UNMASKED safety assessment layer.

Your job is NOT to diagnose the user.

Your job is to determine whether the user's own words
contain a serious and current safety risk.

Be conservative about intervention.

Do not trigger intervention merely because a sensitive word
appears in the text.

Distinguish:
- third-person discussion
- past events
- fictional or educational discussion
- quoted text
from
- statements directly about the user
- current or imminent danger
- direct self-harm or suicidal intent
- serious intent to harm another person
- dangerous action already occurring
- clearly unsafe AI-generated action recommendations

Use:
- high/critical only when evidence is strong
- concern for ambiguous or emotionally heavy but non-crisis text
- safe when there is no meaningful safety concern

If intervention is required:
- write a calm personalized supportiveResponse
- reference the user's actual issue when possible
- suggest one safer immediate next step
- do not diagnose
- do not shame
- do not promise that everything will be fine
- do not invent emergency numbers
- return resource IDs only from the allowed resource list

Return JSON only.
`;
```

---

# 12. Safety Assessment AI Client

Buat:

```text
src/lib/safety/aiAssessment.ts
```

Jangan memakai `generateStructuredAI()` secara langsung apabila fungsi tersebut otomatis melakukan retry model yang tidak dibutuhkan untuk safety.

Safety classifier harus memiliki budget yang kecil dan predictable.

Gunakan model:

```env
GEMINI_SAFETY_MODEL=gemini-3.5-flash-lite
```

Gemini 3.5 Flash-Lite saat ini adalah model stabil dan Google mendokumentasikannya sebagai model low-latency / cost-effective dengan structured outputs. citeturn826884search2turn826884search3

Contoh implementasi konsep:

```ts
import { GoogleGenAI } from "@google/genai";
import {
  SafetyAssessmentSchema,
  type SafetyAssessment,
} from "@/schemas/safety";

const SAFETY_MODEL =
  process.env.GEMINI_SAFETY_MODEL ||
  "gemini-3.5-flash-lite";

export async function assessSafetyWithAI(
  input: SafetyAssessmentInput
): Promise<SafetyAssessment> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model: SAFETY_MODEL,

    contents: JSON.stringify({
      stage: input.stage,
      userText: input.userText,
      contextualData: input.contextualData || "",
    }),

    config: {
      systemInstruction:
        SAFETY_SYSTEM_INSTRUCTION,

      responseMimeType:
        "application/json",

      temperature: 0.1,

      maxOutputTokens: 700,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("SAFETY_AI_EMPTY_RESPONSE");
  }

  const parsedJson = JSON.parse(text);

  const parsed =
    SafetyAssessmentSchema.safeParse(
      parsedJson
    );

  if (!parsed.success) {
    throw new Error(
      "SAFETY_AI_INVALID_OUTPUT"
    );
  }

  return parsed.data;
}
```

Tidak perlu repair loop.

Jika safety model menghasilkan output invalid:

```text
AI safety failed
↓
deterministic fallback
```

---

# 13. Deterministic Fallback

Ubah:

```text
src/lib/safety/crisisKeywords.ts
```

menjadi fallback yang lebih ketat.

Jangan menggunakan:

```ts
text.includes("bunuh diri")
```

sebagai high-risk final decision.

Gunakan explicit high-signal patterns yang mengandung konteks langsung.

Contoh konsep:

```ts
const EXPLICIT_FIRST_PERSON_PATTERNS = [
  /\baku\b.{0,80}\b(ingin|mau|kepikiran)\b.{0,80}\b(akhiri hidup|bunuh diri)\b/i,
  /\bsaya\b.{0,80}\b(ingin|mau|kepikiran)\b.{0,80}\b(akhiri hidup|bunuh diri)\b/i,
];
```

Tambahkan pattern lain hanya jika memang diperlukan.

Fallback result harus:

```ts
{
  riskLevel: "critical",
  confidence: "high",
  source: "deterministic",
  category: "...",
}
```

hanya ketika sinyal eksplisit benar-benar ditemukan.

Jika hanya menemukan generic keyword:

```text
riskLevel = "concern"
```

bukan `high`.

Tujuan fallback:

```text
AI safety unavailable
+
explicit high-signal danger
→ prevent silent pass
```

Bukan:

```text
keyword found
→ popup
```

---

# 14. Safety Orchestrator

Buat:

```text
src/lib/safety/assess.ts
```

Ini menjadi satu-satunya entry point safety untuk route AI.

Contoh:

```ts
export type SafetyDecision =
  | {
      action: "allow";
      assessment: SafetyAssessment;
    }
  | {
      action: "intervene";
      assessment: SafetyAssessment;
    };

export async function assessSafety(
  input: SafetyAssessmentInput
): Promise<SafetyDecision> {
  try {
    const aiAssessment =
      await assessSafetyWithAI(input);

    const shouldIntervene =
      shouldTriggerIntervention(
        aiAssessment
      );

    return {
      action: shouldIntervene
        ? "intervene"
        : "allow",
      assessment: {
        ...aiAssessment,
        source: "ai",
      },
    };
  } catch (error) {
    console.warn(
      "[Safety] AI assessment failed. Falling back to deterministic safety.",
      error
    );

    const fallback =
      checkExplicitDeterministicRisk(
        input.userText
      );

    return {
      action: fallback.isCrisis
        ? "intervene"
        : "allow",
      assessment: fallback.assessment,
    };
  }
}
```

Jangan menganggap AI failure sebagai:

```text
SAFE
```

Gunakan deterministic fallback.

---

# 15. Important: Normal AI Must Not Run Before Safety

Untuk setiap route:

```text
src/app/api/ai/mask/route.ts
src/app/api/ai/load/route.ts
src/app/api/ai/need/prepare/route.ts
src/app/api/ai/need/synthesize/route.ts
src/app/api/ai/action/route.ts
src/app/api/ai/summary/route.ts
```

urutan wajib:

```text
1. body-size validation
2. rate limit
3. JSON parse
4. Zod input validation
5. safety assessment
6. intervention decision
7. normal AI generation
8. output validation
9. output safety check if applicable
10. response
```

Tidak boleh:

```text
normal AI
↓
safety check
```

untuk INPUT safety gate.

---

# 16. Integrasi MASK

File:

```text
src/app/api/ai/mask/route.ts
```

Current user-authored source:

```ts
actualFeelings
note
```

Safety input:

```ts
const safetyDecision = await assessSafety({
  stage: "mask",

  userText: [
    ...actualFeelings,
    note || "",
  ].join("\n"),

  contextualData: [
    ...publicTags,
  ].join("\n"),
});
```

Kemudian:

```ts
if (safetyDecision.action === "intervene") {
  return createSafetyInterventionResponse(
    safetyDecision.assessment
  );
}
```

Jika `safe` / `concern`:

lanjut ke `generateStructuredAI()` normal.

---

# 17. Integrasi LOAD

File:

```text
src/app/api/ai/load/route.ts
```

User source:

```ts
brainDump
stickyNotes[].text
```

Gunakan:

```ts
const userText = [
  brainDump,
  ...items.map((item) => item.text),
].join("\n");
```

Mask insight tidak boleh dijadikan primary risk evidence.

---

# 18. Integrasi NEED PREPARE

File:

```text
src/app/api/ai/need/prepare/route.ts
```

User-authored source utama:

```text
loadContext.userCorrection
maskContext.userCorrection
```

dan bila available, include original user-provided context yang memang berasal dari session.

Jangan menganggap:

```text
loadContext.summary
```

sebagai fakta user.

Itu adalah AI-derived data.

Safety prompt harus diberitahu bahwa data tersebut derived.

---

# 19. Integrasi NEED SYNTHESIZE

File:

```text
src/app/api/ai/need/synthesize/route.ts
```

Primary safety evidence:

```ts
answers[].answer
```

Tambahkan context:

```text
loadContext
maskContext
```

tetapi user answers menjadi primary evidence.

Contoh:

```ts
const safetyDecision =
  await assessSafety({
    stage: "need_synthesize",

    userText:
      answers
        .map((a) => a.answer)
        .join("\n"),

    contextualData: JSON.stringify({
      loadContext,
      maskContext,
    }),
  });
```

---

# 20. Integrasi ACTION — INPUT SAFETY

File:

```text
src/app/api/ai/action/route.ts
```

Action input safety tetap dilakukan.

Tetapi jangan hanya menggunakan:

```ts
primaryNeed.title
loadSummary
loadThemes
```

sebagai equivalent user risk.

Gunakan:

```text
needCorrection
mask user correction
confirmed user context
```

sebisa mungkin.

Jika tidak ada direct high-risk user text di ACTION stage:

```text
jangan artificially trigger
```

karena risiko tersebut seharusnya sudah ditangani pada NEED stage.

---

# 21. ACTION OUTPUT SAFETY

Ini fitur tambahan yang wajib.

Masalah:

AI sendiri dapat menghasilkan action yang tidak aman.

Flow:

```text
User Context
   ↓
INPUT SAFETY
   ↓
Action AI
   ↓
ActionOutputSchema
   ↓
OUTPUT SAFETY
```

Buat helper:

```ts
assessGeneratedActionSafety({
  userContext,
  recommendations,
});
```

Gunakan AI safety assessment dengan context:

```text
USER CONTEXT
+
PROPOSED ACTIONS
```

AI harus menjawab apakah salah satu action:

- mendorong perilaku berbahaya,
- membuat user masuk situasi berbahaya,
- mengandung instruksi unsafe,
- atau tidak sesuai untuk kondisi berisiko tinggi.

Jika unsafe:

```text
DO NOT return the unsafe recommendation.
```

Kembalikan:

```json
{
  "success": false,
  "code": "SAFETY_INTERVENTION",
  "intervention": {
    "supportiveResponse": "...",
    "saferNextStep": "...",
    "recommendedResourceIds": [...]
  }
}
```

Jangan tampilkan action unsafe ke frontend.

---

# 22. Jangan Regenerate Unsafe Action Tanpa Batas

Tidak boleh:

```text
generate
→ unsafe
→ regenerate
→ unsafe
→ regenerate
→ ...
```

Maksimal:

```text
1 generated action assessment
```

Jika unsafe:

```text
discard
→ safety intervention
```

atau, jika implementasi memiliki dedicated safe-action regeneration:

```text
1 regeneration maximum
→ re-check
→ if still unsafe: intervention
```

Jangan membuat loop tanpa batas.

---

# 23. SUMMARY

File:

```text
src/app/api/ai/summary/route.ts
```

Summary bukan tempat untuk melakukan psychological reinterpretation baru.

Gunakan confirmed session state.

Safety pada SUMMARY harus memprioritaskan user-authored context dan active safety state.

Jangan membuat popup baru hanya karena Summary menampilkan kata:

```text
"berat"
"takut"
"capek"
"mati"
```

jika kata tersebut tidak merepresentasikan current/high-risk user state.

---

# 24. Safety Response Contract

Safety AI harus menghasilkan response yang personal.

Struktur:

```ts
type SafetyIntervention = {
  riskLevel:
    | "high"
    | "critical";

  category:
    | "self_harm"
    | "suicidal_risk"
    | "harm_to_others"
    | "imminent_physical_danger"
    | "unsafe_action"
    | "abuse"
    | "other";

  supportiveResponse: string;

  saferNextStep: string;

  recommendedResourceIds: string[];
};
```

---

# 25. Safety Response Tidak Boleh Generik

Jangan:

```text
"Kamu tidak harus menghadapi semuanya sendirian."
```

sebagai satu-satunya isi.

Harus ada personal context.

Contoh:

User:

```text
"Tugas kuliah menumpuk dan orang tua terus menuntut.
Aku sudah tidak tahu harus bagaimana."
```

Response ideal:

```text
"Kedengarannya tekanan dari tugas kuliah dan ekspektasi
di rumah sudah menumpuk cukup jauh untukmu.

Untuk sekarang, jangan paksa dirimu menyelesaikan
semuanya sekaligus. Berhenti sejenak dari tugas yang
sedang dikerjakan dan coba tetap bersama seseorang
yang kamu percaya.

Kalau kamu merasa ada kemungkinan kamu menyakiti diri
atau berada dalam bahaya sekarang, bantuan langsung
tersedia di bawah."
```

Yang boleh dihasilkan AI:

```text
personal context
support
safer next step
```

Yang tidak boleh dihasilkan AI:

```text
nomor telepon
URL
jaminan medis
diagnosis
```

---

# 26. Safe Next Step

Safe next step harus:

- kecil,
- segera,
- realistis,
- tidak berbahaya,
- tidak terlalu kompleks.

Contoh:

```text
"Untuk saat ini, tetap bersama seseorang yang kamu percaya
dan jangan menghadapi situasi ini sendirian."
```

atau:

```text
"Berhenti sejenak dari tugas yang sedang kamu lakukan
dan cari seseorang yang bisa menemanimu."
```

Jangan:

```text
"Ubah seluruh pola hidupmu."
```

atau:

```text
"Segera diagnosis..."
```

---

# 27. Crisis Resources

File:

```text
src/lib/safety/crisisResources.ts
```

Current file masih menggunakan resource pihak ketiga seperti:

```text
LISA
Yayasan Pulih
Into The Light
```

Jangan memasukkan resource baru tanpa verifikasi.

Untuk default safety registry, gunakan resource resmi / dapat diverifikasi.

## Recommended current registry

### Healing119

Kementerian Kesehatan saat ini menjelaskan Healing119 sebagai layanan dukungan psikologis awal.

Akses:

```text
119 ext. 8
https://www.healing119.id
```

Sumber Kemenkes menyatakan Healing119 menyediakan dukungan psikologis dan akses voice/chat. citeturn472430search0turn472430search23

### Medical Emergency 119

Gunakan untuk kegawatdaruratan medis.

```text
119
```

Kemenkes menjelaskan 119 sebagai layanan darurat medis. citeturn472430search6

### SAPA 129

Untuk situasi kekerasan/perlindungan perempuan dan anak.

```text
129
08111-129-129
https://laporsapa129.kemenpppa.go.id
```

Sumber resmi KemenPPPA saat ini mencantumkan 129 dan WhatsApp 08111-129-129 sebagai kanal SAPA 129. citeturn710620search0turn710620search12

---

# 28. Resource IDs

AI jangan mengembalikan kontak.

AI hanya boleh mengembalikan:

```json
{
  "recommendedResourceIds": [
    "healing119",
    "emergency119"
  ]
}
```

Registry:

```ts
export interface CrisisResource {
  id: string;

  name: string;

  description: string;

  contact: string;

  actionUrl: string;

  type:
    | "hotline"
    | "whatsapp"
    | "website";
}
```

Contoh:

```ts
{
  id: "healing119",
  name: "Healing119",
  description:
    "Dukungan psikologis awal dari Kementerian Kesehatan.",
  contact: "119 ext. 8",
  actionUrl: "https://www.healing119.id",
  type: "website",
}
```

```ts
{
  id: "emergency119",
  name: "Darurat Medis 119",
  description:
    "Layanan kegawatdaruratan medis.",
  contact: "119",
  actionUrl: "tel:119",
  type: "hotline",
}
```

```ts
{
  id: "sapa129",
  name: "SAPA 129",
  description:
    "Layanan KemenPPPA untuk perempuan dan anak.",
  contact:
    "129 / WhatsApp 08111-129-129",
  actionUrl:
    "https://laporsapa129.kemenpppa.go.id",
  type: "website",
}
```

Jangan menyatakan resource tersebut 24 jam kecuali informasi terkini memang telah diverifikasi.

---

# 29. Resource Selection

AI memilih:

```text
resource ID
```

berdasarkan kategori.

Contoh:

```text
suicidal_risk
→ healing119
→ emergency119

imminent_physical_danger
→ emergency119
→ healing119

abuse involving woman/child
→ sapa129
```

Aplikasi mengambil resource dari:

```ts
CRISIS_RESOURCES
```

Jangan langsung menggunakan URL dari model.

---

# 30. Session Safety State

`useJournalStore.ts` harus ditambah:

```ts
type SafetyStatus =
  | "normal"
  | "review"
  | "intervention";

type SafetyState = {
  status: SafetyStatus;

  riskLevel:
    | "safe"
    | "concern"
    | "high"
    | "critical";

  source:
    | "ai"
    | "deterministic"
    | "combined";

  category?: string;

  triggeredAt?: string;

  handled: boolean;
};
```

Tambahkan:

```ts
safety: SafetyState;
```

ke `JournalState`.

Initial:

```ts
safety: {
  status: "normal",
  riskLevel: "safe",
  source: "ai",
  handled: false,
},
```

---

# 31. Apa yang Boleh Dipersist

Persist minimal:

```text
status
riskLevel
source
category
triggeredAt
handled
```

Jangan persist:

```text
supportiveResponse lengkap
sensitive evidence
raw safety prompt
raw AI safety response
```

kecuali ada alasan produk yang jelas.

Ini sejalan dengan prinsip bahwa safety state dapat ditelusuri pada level session tetapi data safety sensitif jangan disimpan berlebihan.

---

# 32. Separate Safety UI Store

Jangan menyimpan seluruh modal content di persisted journal store.

Buat:

```text
src/store/useSafetyUIStore.ts
```

Gunakan Zustand biasa tanpa persist.

Contoh:

```ts
type SafetyInterventionUI = {
  riskLevel: "high" | "critical";

  category: string;

  supportiveResponse: string;

  saferNextStep: string;

  recommendedResourceIds: string[];
};

type SafetyUIState = {
  isModalOpen: boolean;

  isCompanionVisible: boolean;

  intervention:
    | SafetyInterventionUI
    | null;

  openIntervention: (
    intervention: SafetyInterventionUI
  ) => void;

  closeToCompanion: () => void;

  reopenIntervention: () => void;

  dismissCompanion: () => void;
};
```

Tidak memakai persist.

---

# 33. Modal Behavior

File:

```text
src/components/CrisisModal.tsx
```

Jangan lagi memiliki data text utama hardcoded.

API:

```tsx
<CrisisModal
  intervention={intervention}
  isOpen={isModalOpen}
  onClose={closeToCompanion}
/>
```

Modal wajib mempunyai:

```text
close X
personalized response
safer next step
resource cards
button to call / open resource
```

---

# 34. Modal Layout Logic

Urutan informasi:

```text
[Title]

[Personalized context / supportive response]

[Safer next step]

[Need help now?]

[Resource 1]
[Resource 2]
[...]

[X / close]
```

Jangan menggunakan kata:

```text
"Diagnosis"
"Anda mengalami..."
"Anda pasti..."
```

---

# 35. Modal Copy

Judul sebaiknya berdasarkan situasi, tetapi AI tidak perlu menggenerate title bebas.

Gunakan title yang dikontrol aplikasi berdasarkan category/risk.

Contoh:

```ts
const SAFETY_TITLES = {
  suicidal_risk:
    "Ada bagian yang perlu kita perhatikan sebentar.",
  self_harm:
    "Mari berhenti sebentar dan cari ruang yang lebih aman.",
  imminent_physical_danger:
    "Yang paling penting sekarang adalah tetap aman.",
  unsafe_action:
    "Langkah ini sebaiknya kita ubah menjadi pilihan yang lebih aman.",
  other:
    "Mari berhenti sebentar.",
};
```

AI hanya menghasilkan body.

Tujuannya mengurangi unpredictable UI copy.

---

# 36. Modal Close Behavior

User menutup modal dengan:

```text
X
```

atau button:

```text
Kembali ke Jurnal
```

maka:

```ts
closeToCompanion()
```

bukan:

```ts
clearSafety()
```

Artinya:

```text
Modal close
↓
Modal hidden
↓
Floating companion appears
↓
Safety state tetap ada
```

---

# 37. Floating Safety Companion

Buat:

```text
src/components/SafetyCompanion.tsx
```

Behavior:

```text
modal open
→ companion hidden

modal closed after intervention
→ companion visible

companion clicked
→ modal opens kembali
```

Desktop default:

```text
fixed bottom-right
```

Mobile:

```text
fixed bottom/right
```

Pastikan tidak menutupi:

- BottomDock,
- textarea,
- primary CTA.

Tidak perlu membuat desain baru di luar style system yang sudah digunakan UNMASKED.

---

# 38. Global Safety Overlay

Buat:

```text
src/components/SafetyOverlay.tsx
```

Komponen ini merender:

```tsx
<>
  <CrisisModal ... />
  <SafetyCompanion ... />
</>
```

Pasang sekali pada root/layout yang tetap hidup selama navigation.

Contoh:

```tsx
<body>
  <SessionExpiryGuard />

  <SafetyOverlay />

  {children}
</body>
```

Jangan menambahkan `<CrisisModal>` manual ke enam page secara terpisah.

---

# 39. Header Existing Crisis Button

`Header.tsx` saat ini memiliki button:

```tsx
<button
  onClick={() => setShowCrisis(true)}
>
```

dan:

```tsx
<CrisisModal
  isOpen={showCrisis}
  onClose={() => setShowCrisis(false)}
/>
```

Jangan menghapus akses manual bantuan.

Tetapi ubah agar menggunakan safety UI controller global.

Fungsi button header:

```text
manual support access
```

berbeda dengan:

```text
automatic safety intervention
```

Manual support boleh membuka modal dengan:

```text
resource-only mode
```

sedangkan intervention menggunakan:

```text
personalized intervention mode
```

Jangan mencampurkan kedua state tersebut.

---

# 40. Safety Modal Modes

Gunakan:

```ts
type CrisisModalMode =
  | "manual"
  | "intervention";
```

### `manual`

Teks generik yang aman.

Tidak ada risk claim.

### `intervention`

Tampilkan:

```text
personalizedResponse
saferNextStep
recommended resources
```

---

# 41. Frontend API Handling

Jangan lagi setiap section melakukan:

```ts
const [isCrisisOpen, setIsCrisisOpen] =
  useState(false);
```

dan:

```ts
if (json.code === "SAFETY_INTERVENTION") {
  setIsCrisisOpen(true);
}
```

Gantikan dengan helper:

```ts
handleAIResponse(json)
```

atau langsung:

```ts
if (
  json.code === "SAFETY_INTERVENTION" &&
  json.intervention
) {
  useSafetyUIStore
    .getState()
    .openIntervention(
      json.intervention
    );

  useJournalStore
    .getState()
    .setSafetyState(...);
}
```

Tetap pertahankan loading false pada `finally`.

---

# 42. Safety Intervention Response Contract

Semua endpoint AI harus mengembalikan contract yang sama.

```ts
{
  success: false,

  code:
    "SAFETY_INTERVENTION",

  retryable: false,

  intervention: {
    riskLevel: "high",

    category:
      "suicidal_risk",

    supportiveResponse:
      "...",

    saferNextStep:
      "...",

    recommendedResourceIds: [
      "healing119",
      "emergency119"
    ]
  }
}
```

Jangan mengembalikan seluruh `CRISIS_RESOURCES` dari setiap route.

Frontend melakukan lookup berdasarkan ID.

---

# 43. Safety Error vs Safety Intervention

Bedakan:

```text
SAFETY_INTERVENTION
```

dari:

```text
AI_TEMPORARY_ERROR
```

Jangan melakukan:

```ts
if (!res.ok) {
  show crisis modal
}
```

Hanya:

```ts
if (
  json.code ===
  "SAFETY_INTERVENTION"
) {
  openSafetyIntervention();
}
```

---

# 44. AI Output Safety for Normal Reflection

Selain input safety, minimal ACTION output harus diperiksa.

Opsional untuk seluruh normal output:

```text
MASK reflection
LOAD insight
NEED synthesis
SUMMARY
```

dapat dinilai dengan lightweight output policy jika dibutuhkan.

Tetapi untuk scope pertama, **wajib**:

```text
ACTION output safety
```

karena action adalah instruksi yang langsung diberikan kepada user.

---

# 45. Do Not Leak Safety Classification to Normal UI

Jangan menampilkan:

```text
riskLevel: high
category: suicidal_risk
confidence: high
```

kepada user.

Jangan menampilkan:

```text
AI detected self-harm.
```

Gunakan:

```text
supportive intervention response
```

saja.

---

# 46. Safety State Is Not Diagnosis

Data:

```ts
riskLevel: "high"
```

hanya berarti:

```text
"application safety policy meminta intervention"
```

bukan:

```text
"user has a mental disorder"
```

Jangan menggunakan field ini sebagai diagnosis.

---

# 47. Existing `/api/safety/check`

File:

```text
src/app/api/safety/check/route.ts
```

Saat ini endpoint tersebut hanya melakukan deterministic `checkCrisisRisk()`.

Safety v2:

Pilihan yang direkomendasikan:

```text
KEEP endpoint
but use it as internal/debug/safety endpoint
```

Jika endpoint tetap public:

- gunakan Zod,
- gunakan body cap,
- rate limit,
- return safe contract,
- jangan expose matched sensitive trigger ke client,
- jangan menjadi source of truth terpisah dari `assessSafety()`.

Ideal:

```ts
POST /api/safety/check
→ assessSafety()
```

sehingga endpoint dan AI routes memakai safety engine yang sama.

---

# 48. API Key

Jangan pernah mengirim:

```text
GEMINI_API_KEY
```

ke browser.

Safety model dipanggil server-side.

---

# 49. Model Configuration

Current normal AI client:

```text
GEMINI_PRIMARY_MODEL
GEMINI_FALLBACK_MODEL
```

Safety model harus dipisahkan:

```env
GEMINI_SAFETY_MODEL=gemini-3.5-flash-lite
```

Normal model saat ini sudah:

```text
gemini-3.8-flash
gemini-3.5-flash-lite
```

dan model tersebut tercantum sebagai model Gemini yang tersedia saat ini. citeturn826884search0turn826884search2turn826884search3

Jangan mengembalikan:

```text
gemini-2.0-flash
```

karena Gemini 2.0 Flash sudah shutdown pada 1 Juni 2026. citeturn826884search6

---

# 50. Cost Control

Safety AI menambah 1 model call sebelum normal AI.

Untuk mengontrol biaya:

```text
Safety model:
gemini-3.5-flash-lite

temperature:
0.1

maxOutputTokens:
~700

No repair loop

No unlimited retry
```

Normal AI tetap menggunakan existing retry policy.

Jangan membuat:

```text
safety AI
→ repair
→ fallback
→ repair
→ normal AI
→ repair
...
```

Safety assessment sendiri maksimal satu AI attempt.

Jika gagal:

```text
deterministic fallback
```

---

# 51. Loading Behavior

User experience yang diinginkan:

```text
User submit
↓
MindfulLoading
↓
Safety assessment
↓
Normal AI
↓
Result
```

Jika intervention:

```text
User submit
↓
MindfulLoading
↓
Safety assessment
↓
loading selesai
↓
Safety Modal tampil
```

Jangan menampilkan dua modal secara bersamaan.

---

# 52. Jika User Menutup Modal

Setelah modal ditutup:

```text
normal current page remains
+
floating companion appears
```

Jangan:

```text
redirect ke emergency page
```

kecuali benar-benar ada product requirement baru.

Human agency tetap dipertahankan.

---

# 53. Critical Behavior

Untuk `critical`:

```text
Do not return normal AI result.
```

Response:

```text
SAFETY_INTERVENTION
```

dengan:

```text
personalizedResponse
saferNextStep
resources
```

User tetap dapat menutup modal melalui X.

Setelah ditutup:

```text
floating safety companion
```

tetap tersedia.

---

# 54. High Behavior

Untuk `high`:

```text
do not show normal AI output first
```

Tampilkan intervention.

Setelah user menutup:

```text
current flow can remain available
```

tetapi safety companion tetap tersedia.

---

# 55. Concern Behavior

Untuk:

```text
riskLevel = "concern"
```

jangan tampilkan crisis modal.

Normal flow:

```text
continue
```

Jika ingin memberi kehati-hatian kepada normal AI:

```text
safetyReview = true
```

dan normal prompt boleh menggunakan tone yang lebih grounded.

Tetapi jangan mengubah UI menjadi crisis warning.

---

# 56. AI Safety Prompt Must Avoid Over-triggering

Tambahkan contoh contrast ke prompt/test set:

### FALSE POSITIVE

```text
"Di kelas kami membahas kasus bunuh diri."
→ safe
```

```text
"Temanku pernah self-harm dan aku ingin membantunya."
→ concern / safe
```

```text
"Aku takut gagal."
→ concern / safe
```

### TRUE POSITIVE

```text
"Aku ingin mengakhiri hidup dan takut melakukannya sekarang."
→ critical
```

```text
"Aku merasa ingin menyakiti diriku sendiri sekarang."
→ high / critical
```

### OUTPUT UNSAFE

Jika Action AI menghasilkan langkah yang membahayakan user:

```text
→ unsafe_action
→ intervention
```

---

# 57. Do Not Use User's Keyword Alone as Evidence

Bad:

```ts
if (text.includes("mati")) {
  riskLevel = "high";
}
```

Good:

```text
AI contextual assessment
+
directlyAboutUser
+
current/imminent
+
high confidence
```

Fallback:

```text
explicit first-person high-signal pattern
```

---

# 58. Action Safety Example

Misalnya user memiliki context:

```text
"Kewalahan karena konflik dengan seseorang."
```

AI action menghasilkan:

```text
"Hadapi orang tersebut sekarang juga
dan konfrontasikan mereka sendirian."
```

Safety layer harus dapat menilai apakah action tersebut:

```text
safe
```

atau:

```text
unsafe_action
```

Jika unsafe:

```text
action tidak ditampilkan
```

kemudian:

```text
supportiveResponse
+
saferNextStep
```

Misalnya:

```text
"Sebelum menghadapi situasi itu langsung,
lebih aman untuk memberi jarak dan mencari
orang yang kamu percaya untuk mendampingi."
```

---

# 59. Tests — Wajib

File baru / revisi:

```text
tests/safety.test.ts
```

Minimal test:

## Test 1 — Safe

```text
"Besok aku ada presentasi."
→ safe
→ no intervention
```

## Test 2 — Emotional concern

```text
"Aku capek banget dengan semua tugas."
→ concern
→ no intervention
```

## Test 3 — Third person

```text
"Temanku pernah ingin bunuh diri."
→ no automatic intervention
```

## Test 4 — Educational context

```text
"Kami belajar tentang suicide prevention."
→ no intervention
```

## Test 5 — Historical context

```text
"Dulu aku pernah mengalami masa sulit."
→ no automatic intervention
```

## Test 6 — Current explicit risk

```text
"Aku ingin mengakhiri hidup sekarang."
→ high/critical
→ intervention
```

## Test 7 — Direct self-harm

```text
"Aku takut aku akan menyakiti diriku sekarang."
→ high/critical
→ intervention
```

## Test 8 — AI safety failure

Mock:

```text
assessSafetyWithAI throws
```

Expected:

```text
deterministic fallback runs
```

## Test 9 — AI invalid JSON

Expected:

```text
deterministic fallback
```

## Test 10 — AI high but not directly about user

```text
isDirectlyAboutUser = false
```

Expected:

```text
no intervention
```

## Test 11 — high but not current

Historical / unrelated example.

Expected:

```text
no intervention
```

## Test 12 — Unsafe action

AI action contains dangerous instruction.

Expected:

```text
action rejected
SAFETY_INTERVENTION
```

## Test 13 — resource IDs only

AI returns:

```text
recommendedResourceIds
```

Expected:

```text
frontend resolves resources from registry
```

## Test 14 — unknown resource ID

AI returns:

```text
unknown-resource
```

Expected:

```text
filter it out
```

No broken link.

## Test 15 — modal close

Expected state transition:

```text
isModalOpen = false
isCompanionVisible = true
```

## Test 16 — companion reopen

Expected:

```text
click companion
→ modal open
```

## Test 17 — safety state persistence

Persist:

```text
status
riskLevel
source
category
triggeredAt
handled
```

Do not persist full intervention text.

---

# 60. Regression Tests Existing

Do not remove:

```text
tests/regression.test.ts
```

Safety tests should complement it.

Existing tests such as:

```text
mandatory action selection
confirmed need source of truth
load category
summary prerequisite
```

must remain passing.

---

# 61. Manual E2E Scenarios

Agent wajib menguji manual / scripted minimal:

### Scenario A — normal

```text
MASK
→ LOAD
→ NEED
→ ACTION
→ SUMMARY
```

Tidak ada safety popup.

### Scenario B — emotional but safe

Input:

```text
"Aku sangat capek."
```

Expected:

```text
normal flow
```

### Scenario C — educational keyword

Input:

```text
"Di tugas aku membahas suicide prevention."
```

Expected:

```text
no popup
```

### Scenario D — high-risk

Input:

```text
explicit current self-harm/suicidal risk
```

Expected:

```text
loading
→ safety intervention
→ modal
→ personal response
→ resources
```

Normal AI result tidak boleh muncul dulu.

### Scenario E — modal close

Expected:

```text
modal closes
→ companion appears
```

### Scenario F — companion click

Expected:

```text
companion
→ intervention modal reopens
```

### Scenario G — AI safety outage

Simulasikan:

```text
Gemini safety request fails
```

Expected:

```text
deterministic fallback
```

### Scenario H — safe keyword

Input mengandung keyword sensitif tetapi konteks aman.

Expected:

```text
no popup
```

---

# 62. Logging

Server log boleh menyimpan:

```text
safety stage
safety source
risk level
category
model used
error code
```

Jangan log:

```text
full user text
full intervention response
```

kecuali memang diperlukan dan ada alasan privacy yang jelas.

Gunakan:

```text
console.warn("[Safety] ...")
```

tanpa raw sensitive content.

---

# 63. Error Handling

Jika Safety AI gagal:

```text
do not expose provider error
```

Client hanya menerima:

```text
controlled safety result
```

Jika deterministic fallback juga tidak menemukan explicit risk:

```text
allow normal flow
```

dengan status internal:

```text
review / unassessed
```

Jika implementasi memilih `unassessed`, jangan tampilkan warning kepada user.

---

# 64. Recommended Internal Safety Status

Untuk internal state:

```ts
type SafetyProcessingStatus =
  | "assessed"
  | "fallback"
  | "unassessed";
```

Ini berbeda dengan user-facing risk:

```ts
safe
concern
high
critical
```

Jangan mencampurnya.

---

# 65. Safety State Transition

```text
normal
  ↓
assessment
  ↓
safe
  ↓
normal
```

```text
normal
  ↓
assessment
  ↓
concern
  ↓
review
  ↓
normal
```

```text
normal
  ↓
assessment
  ↓
high / critical
  ↓
intervention
  ↓
modal
  ↓
companion
```

---

# 66. Jangan Menghentikan Journey untuk Concern

Penting:

```text
concern
≠
blocked
```

Concern hanya berarti:

```text
AI akan lebih berhati-hati
```

bukan:

```text
user tidak boleh lanjut
```

---

# 67. Do Not Force Confirmation of Safety

Jangan menambahkan:

```text
"Saya aman"
```

button sebagai prerequisite.

Jangan memaksa user mengonfirmasi:

```text
"Saya tidak akan melakukan..."
```

Safety modal memberikan pilihan bantuan, tetapi tidak menjadikan safety self-declaration sebagai gate.

---

# 68. Do Not Make the User Feel Watched

Jangan menggunakan wording:

```text
"Kami memantau bahwa kamu..."
```

atau:

```text
"Sistem mendeteksi kondisi mentalmu..."
```

Gunakan:

```text
"Ada bagian dari yang kamu tuliskan
yang terasa cukup mengkhawatirkan."
```

atau respons personal yang lebih relevan dengan input.

---

# 69. Personalization Rules

AI intervention response harus:

### Mention actual issue

```text
"Tekanan tugas dan ekspektasi keluarga..."
```

bukan:

```text
"Situasimu sangat berat."
```

### Avoid diagnosis

```text
"Tekanan ini terdengar sangat besar."
```

bukan:

```text
"Kamu sedang depresi."
```

### Give one immediate safer step

```text
"Untuk sekarang, cari seseorang yang bisa menemanimu."
```

### Give resource option

```text
"Jika kamu merasa tidak aman sekarang,
kamu bisa menghubungi..."
```

---

# 70. Never Generate Emergency Number Free-form

Forbidden:

```text
AI:
"Hubungi 12345."
```

Allowed:

```text
AI:
recommendedResourceIds:
["healing119", "emergency119"]
```

Application:

```text
resource ID
↓
verified registry
```

---

# 71. Existing Crisis Resources Migration

Current:

```text
LISA
SAPA 129
Yayasan Pulih
Into The Light
119
```

Do not blindly keep all entries as "official emergency resources".

Migration:

```text
1. add stable IDs
2. verify every resource
3. mark intended use/category
4. keep only verified entries in intervention defaults
5. allow additional resources only after manual verification
```

Default intervention should not show a huge list.

Prefer:

```text
1–3 highly relevant resources
```

---

# 72. Resource Relevance

Example:

```ts
function resolveResources(
  resourceIds: string[]
) {
  return resourceIds
    .map((id) =>
      CRISIS_RESOURCES.find(
        (resource) =>
          resource.id === id
      )
    )
    .filter(
      (resource): resource is CrisisResource =>
        Boolean(resource)
    );
}
```

Unknown IDs are silently dropped.

---

# 73. API Safety Response Helper

Buat helper:

```text
src/lib/safety/interventionResponse.ts
```

Contoh:

```ts
export function createSafetyInterventionResponse(
  assessment: SafetyAssessment
) {
  const allowedResources =
    resolveResources(
      assessment.recommendedResourceIds
    );

  return NextResponse.json(
    {
      success: false,

      code:
        "SAFETY_INTERVENTION",

      retryable: false,

      intervention: {
        riskLevel:
          assessment.riskLevel,

        category:
          assessment.category,

        supportiveResponse:
          assessment.supportiveResponse,

        saferNextStep:
          assessment.saferNextStep,

        recommendedResources:
          allowedResources,
      },
    },
    { status: 400 }
  );
}
```

Namun jika client contract ingin resource ID saja:

```text
return recommendedResourceIds
```

dan frontend melakukan registry resolution.

Pilih satu pendekatan dan gunakan konsisten pada semua route.

Rekomendasi: gunakan resource ID dari API agar response lebih kecil.

---

# 74. Existing Error Sanitization

Jangan merusak:

```text
src/lib/ai/client.ts
parseAIError()
```

Tetap:

```text
provider error
→ server log
→ safe client contract
```

Safety error harus mengikuti prinsip yang sama.

---

# 75. No UI Redesign

Agent hanya boleh mengubah UI untuk:

```text
Safety Modal
Safety Companion
Global Safety Overlay
```

Jangan menyentuh:

```text
layout lain
warna umum
typography umum
spacing umum
navigation
stage design
```

kecuali perubahan benar-benar diperlukan untuk menghindari overlap safety component.

---

# 76. Accessibility Minimum

Safety modal wajib:

```text
role="dialog"
aria-modal="true"
aria-labelledby
```

Close button:

```text
aria-label="Tutup bantuan"
```

Resource buttons harus dapat difokuskan keyboard.

Focus harus diarahkan ke dialog ketika intervention dibuka.

Jangan mengunci user tanpa mekanisme close.

---

# 77. Reduced Motion

Safety intervention harus menghormati:

```css
@media (prefers-reduced-motion: reduce)
```

Hindari animasi intens / flashing.

Jika project sudah menggunakan motion utility:

```text
gunakan existing utility
```

jangan membuat animation framework baru.

---

# 78. State Ownership

Gunakan pembagian:

```text
useJournalStore
=
persistent session safety metadata
```

```text
useSafetyUIStore
=
ephemeral modal / companion UI
```

Jangan:

```text
local component state
+
localStorage
+
journal store
```

untuk safety yang sama.

Single source of truth harus dipertahankan.

---

# 79. Agent Implementation Order

Agent wajib mengerjakan dengan urutan berikut.

## Phase 1 — Schema

```text
src/schemas/safety.ts
```

Implement:

- risk enum
- category enum
- safety output schema
- safety input schema

---

## Phase 2 — Safety AI

```text
src/lib/ai/prompts.ts
src/lib/safety/aiAssessment.ts
src/lib/safety/assess.ts
src/lib/safety/interventionPolicy.ts
```

Implement:

- AI assessment
- validation
- failover
- intervention policy

---

## Phase 3 — Deterministic Fallback

```text
src/lib/safety/crisisKeywords.ts
```

Replace generic substring behavior.

Keep deterministic as fallback only.

---

## Phase 4 — Resources

```text
src/lib/safety/crisisResources.ts
```

Add IDs.

Verify resource data.

Update resource selection.

---

## Phase 5 — Session State

```text
src/store/useJournalStore.ts
```

Add minimal safety metadata.

Do not persist full intervention text.

---

## Phase 6 — Safety UI State

Create:

```text
src/store/useSafetyUIStore.ts
```

No persist.

---

## Phase 7 — UI

Modify:

```text
src/components/CrisisModal.tsx
src/components/Header.tsx
```

Create:

```text
src/components/SafetyCompanion.tsx
src/components/SafetyOverlay.tsx
```

---

## Phase 8 — Route Integration

Modify:

```text
src/app/api/ai/mask/route.ts
src/app/api/ai/load/route.ts
src/app/api/ai/need/prepare/route.ts
src/app/api/ai/need/synthesize/route.ts
src/app/api/ai/action/route.ts
src/app/api/ai/summary/route.ts
```

Do not duplicate safety logic.

Every route should call:

```ts
assessSafety(...)
```

---

## Phase 9 — Action Output Safety

Implement:

```text
ACTION AI output
↓
safety assessment
↓
safe → return
unsafe → intervention
```

---

## Phase 10 — Existing `/api/safety/check`

Make it reuse the same safety engine.

Do not maintain two different safety policies.

---

## Phase 11 — Tests

Add:

```text
tests/safety.test.ts
```

Keep:

```text
tests/regression.test.ts
```

---

# 80. Final Expected Architecture

```text
                       USER INPUT
                           │
                           ▼
                  INPUT VALIDATION
                           │
                           ▼
                AI SAFETY ASSESSMENT
                           │
             ┌─────────────┼──────────────┐
             │             │              │
            SAFE        CONCERN       HIGH/CRITICAL
             │             │              │
             │             │              ▼
             │             │       PERSONALIZED
             │             │       SAFETY RESPONSE
             │             │              │
             │             │              ▼
             │             │           MODAL
             │             │              │
             │             │         close X
             │             │              │
             │             │              ▼
             │             │        COMPANION
             │             │
             └──────┬──────┘
                    ▼
              NORMAL AI FLOW
                    │
                    ▼
              OUTPUT SCHEMA
                    │
                    ▼
             ACTION OUTPUT SAFETY
                    │
              ┌─────┴─────┐
              │           │
             SAFE       UNSAFE
              │           │
              ▼           ▼
            RESULT     SAFETY
                       INTERVENTION
```

---

# 81. Acceptance Criteria

Implementasi dianggap selesai hanya jika semua kondisi berikut terpenuhi.

## Safety engine

- [ ] AI adalah primary safety detector.
- [ ] Deterministic hanya fallback.
- [ ] Deterministic tidak lagi memakai generic substring sebagai final high-risk decision.
- [ ] AI output tervalidasi Zod.
- [ ] AI safety failure tidak dianggap SAFE.
- [ ] High/critical membutuhkan evidence/context kuat.
- [ ] Concern tidak membuka modal.

## Personalization

- [ ] Intervention response berasal dari context user.
- [ ] Response tidak generik.
- [ ] Tidak ada diagnosis.
- [ ] Tidak ada false certainty.
- [ ] Safe next step tersedia.

## Resources

- [ ] Resource memiliki stable ID.
- [ ] AI hanya menghasilkan resource IDs.
- [ ] Nomor/link berasal dari local verified registry.
- [ ] Unknown resource IDs difilter.
- [ ] Healing119 / 119 / SAPA 129 hanya dipakai sesuai konteks layanan.

## UI

- [ ] Safety Modal muncul hanya untuk high/critical.
- [ ] Modal memiliki X close.
- [ ] Close tidak menghapus safety state.
- [ ] Floating companion muncul setelah close.
- [ ] Companion dapat membuka modal kembali.
- [ ] Manual crisis access tetap tersedia.
- [ ] Tidak ada duplicate modal state di setiap page.

## Action safety

- [ ] AI action output diperiksa.
- [ ] Unsafe action tidak diteruskan ke frontend.
- [ ] Tidak ada unlimited regeneration.
- [ ] Safety intervention dapat menghasilkan safer alternative.

## Data

- [ ] Minimal safety metadata tersimpan pada session.
- [ ] Full safety prose tidak dipersist secara default.
- [ ] Single source of truth tetap `useJournalStore` untuk persistent session.
- [ ] UI transient safety state berada di non-persist store.

## Testing

- [ ] Safe cases pass.
- [ ] Concern cases pass tanpa popup.
- [ ] Third-person cases pass tanpa false positive.
- [ ] Educational cases pass tanpa false positive.
- [ ] Current high-risk cases trigger.
- [ ] AI failure uses deterministic fallback.
- [ ] Invalid AI safety output uses deterministic fallback.
- [ ] Unsafe Action is blocked.
- [ ] Modal close → companion.
- [ ] Companion → modal.
- [ ] Existing regression tests tetap pass.

---

# 82. Required Commands

Agent wajib menjalankan:

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

Tambahkan jika tersedia:

```bash
npx vitest run tests/safety.test.ts
```

---

# 83. Required Static Verification

Agent wajib melakukan pencarian:

```bash
grep -RIn "normalized.includes(trigger)" src/lib/safety
```

Expected:

```text
tidak digunakan sebagai final high-risk decision
```

Search:

```bash
grep -RIn "CrisisModal" src/components/sections
```

Expected:

```text
tidak ada lagi duplicate safety intervention modal
```

kecuali manual support architecture yang memang disengaja.

Search:

```bash
grep -RIn "SAFETY_INTERVENTION" src/app/api/ai
```

Semua route harus menggunakan centralized safety handling.

Search:

```bash
grep -RIn "GEMINI_SAFETY_MODEL" .
```

Harus terdapat konfigurasi safety model.

---

# 84. Agent Reporting Requirements

Jangan hanya menjawab:

```text
Done.
```

Laporan wajib memiliki:

```text
1. Files created
2. Files modified
3. Current safety architecture
4. AI safety model
5. Deterministic fallback logic
6. Intervention threshold
7. Modal behavior
8. Companion behavior
9. Resource registry
10. ACTION output safety
11. Test cases added
12. npm run type-check
13. npm run lint
14. npm run test
15. npm run build
16. Known limitations
```

Jika salah satu command gagal:

```text
JANGAN klaim sistem selesai 100%.
```

---

# 85. Forbidden Agent Behavior

Agent TIDAK BOLEH:

- membuat diagnosis mental,
- menambah keyword trigger secara sembarangan,
- menganggap semua mention kata sensitif sebagai krisis,
- menghapus deterministic fallback,
- membuat nomor emergency sendiri,
- membuat resource URL dari hallucination,
- menambah localStorage key baru untuk safety UI,
- membuat safety state pada setiap component,
- membuat unlimited retry safety,
- menghapus existing regression tests,
- mengubah journey MASK → LOAD → NEED → ACTION → SUMMARY,
- mengubah visual UNMASKED di luar kebutuhan safety,
- mengganti existing data contract tanpa alasan dan dokumentasi,
- membuat normal AI result tampil sebelum critical safety intervention selesai,
- menganggap `concern` sama dengan `high`,
- menganggap AI safety failure sebagai safe.

---

# 86. Final Product Intent

Safety feature ini bukan:

```text
"UNMASKED memata-matai kondisi mental user."
```

Bukan juga:

```text
"UNMASKED adalah dokter AI."
```

Konsep yang diinginkan:

```text
UNMASKED memahami konteks,
lebih berhati-hati ketika menemukan risiko serius,
memberikan respons yang relevan,
menawarkan bantuan nyata,
tetapi tetap menghormati agency user.
```

Safety intervention hanya muncul ketika bukti benar-benar cukup kuat.

Ketika user hanya mengalami:

```text
stress
capek
bingung
kecewa
takut gagal
overwhelmed
```

UNMASKED tetap menjalankan reflection journey normal.

Ketika user menunjukkan risiko yang benar-benar serius:

```text
AI contextual safety
→ high/critical
→ personalized support
→ verified resources
→ modal
→ floating support
```

Itulah target Safety v2.
