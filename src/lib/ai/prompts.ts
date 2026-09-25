import { LoadItem, UserConfirmation } from "@/types/session";

export const SYSTEM_GUIDELINES = `
Kamu adalah asisten refleksi diri untuk platform UNMASKED: Beyond "I'm Fine".
Platform ini ditujukan bagi mahasiswa untuk memahami kondisi batin mereka secara tenang, terstruktur, dan penuh empati.

ATURAN UTAMA:
1. JANGAN PERNAH MENDIAGNOSIS atau memberi label klinis (seperti "depresi klinis", "gangguan kecemasan", "burnout kronis").
2. Gunakan BAHASA INDONESIA yang hangat, tenang, santun, tidak menghakimi, dan tentatif (misal: "tampaknya...", "ada kemungkinan...", "mungkin kamu merasa...", "dari apa yang kamu bagikan...").
3. AI bertindak sebagai "cermin pemantul" (mirror), bukan otoritas penasihat hidup mutlak.
4. Jangan mengarang informasi di luar apa yang diberikan pengguna.
5. Jaga keluaran tetap ringkas, bernas, dan mudah dicerna.
6. Kembalikan HANYA format JSON valid sesuai skema yang diminta.
`;

export function buildMaskPrompt(params: {
  publicTags: string[];
  actualFeelings: string[];
  note?: string;
}): string {
  return `
TUGAS STAGE MASK:
Analisis perbedaan (contrast) antara persona yang ditampilkan pengguna ke luar ("Public Self") dan apa yang sebenarnya mereka rasakan di dalam ("Actual Feeling").

INPUT PENGGUNA:
- Tampilan Luar (Public Self): ${params.publicTags.join(", ")}
- Perasaan Nyata (Actual Feeling): ${params.actualFeelings.join(", ")}
${params.note ? `- Catatan Pribadi Tambahan: "${params.note}"` : ""}

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "contrasts": [
    {
      "publicTrait": "string (salah satu sifat luar yang relevan)",
      "internalState": "string (salah satu perasaan dalam yang kontras)",
      "interpretation": "string (penjelasan tentatif tentang kemungkinan jarak atau arti kontras ini, max 1-2 kalimat)"
    }
  ],
  "reflection": "string (refleksi menyeluruh 2-3 kalimat yang hangat dan menyadarkan adanya kesenjangan tanpa menghakimi)",
  "question": "string (satu pertanyaan reflektif eksploratif yang membuka kesadaran lebih dalam)",
  "confidence": "medium"
}
`;
}

export function buildLoadPrompt(params: {
  brainDump: string;
  items?: LoadItem[];
  maskContext?: {
    publicTags: string[];
    actualFeelings: string[];
    reflection?: string;
    confirmation?: UserConfirmation;
  };
}): string {
  const maskSummary = params.maskContext
    ? `Konteks Stage MASK Sebelumnya:
- Tampilan luar: ${params.maskContext.publicTags.join(", ")}
- Perasaan sebenarnya: ${params.maskContext.actualFeelings.join(", ")}
${params.maskContext.confirmation?.correction ? `- Koreksi pengguna terhadap refleksi MASK: "${params.maskContext.confirmation.correction}"` : ""}
`
    : "";

  const categorizedItems = params.items && params.items.length > 0
    ? `Item beban yang dikategorikan pengguna:
${params.items.map((it) => `- [${it.category || "uncategorized"}] ${it.text}`).join("\n")}`
    : "";

  return `
${maskSummary}

TUGAS STAGE LOAD:
Pengguna telah mencurahkan isi kepalanya (Brain Dump). Bantu mereka mengurai benang kusut cerita ini menjadi tema, konteks emosional, pola yang berulang, dan rangkuman yang lebih rapi.

CURAHAN PIKIRAN (BRAIN DUMP):
"${params.brainDump}"

${categorizedItems}

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "themes": [
    {
      "name": "string (misal: 'Academic Pressure', 'Expectation', 'Fear of Disappointing Others', 'Overload', dll)",
      "description": "string (penjelasan ringkas tentang kemunculan tema ini)",
      "relevance": "high"
    }
  ],
  "emotionalContext": [
    {
      "label": "string (misal: 'Kewalahan', 'Cemas', 'Rasa Bersalah', 'Lelah')",
      "intensity": "high"
    }
  ],
  "patterns": [
    {
      "description": "string (penjelasan pola sebab-akibat yang mungkin terjadi, misal: 'Tuntutan tinggi membuatmu sulit memberi izin diri sendiri untuk beristirahat')",
      "relatedThemes": ["string nama tema yang relevan"],
      "confidence": "medium"
    }
  ],
  "summary": "string (rangkuman narasi 2-3 kalimat yang terstruktur tentang inti beban yang sedang dipikul)",
  "question": "string (opsional: 1 pertanyaan untuk memperjelas hal yang tampaknya paling berat)",
  "confidence": "medium"
}
`;
}

export function buildNeedPreparePrompt(params: {
  maskConfirmed?: string;
  loadThemes: string[];
  loadSummary: string;
  userCorrection?: string;
}): string {
  return `
TUGAS STAGE NEED (Bagian 1 - Eksplorasi Kebutuhan):
Berdasarkan refleksi MASK dan LOAD, tentukan 2 atau 3 kandidat kebutuhan yang paling relevan bagi pengguna dari taksonomi berikut:
Taksonomi Kebutuhan yang Diizinkan:
- 'rest' (Kebutuhan jeda fisik & mental, pemulihan energi)
- 'control' (Kebutuhan mendapatkan kembali rasa kendali atas batasan & ritme)
- 'connection' (Kebutuhan merasa dipahami, tidak sendirian)
- 'expression' (Kebutuhan meluapkan emosi/isi pikiran yang selama ini dipendam)
- 'support' (Kebutuhan bantuan nyata atau delegasi beban)
- 'safety' (Kebutuhan ruang aman, bebas dari rasa takut dihakimi/gagal)

KONTEKS PENGGUNA:
- Tema Beban Utama: ${params.loadThemes.join(", ")}
- Inti Beban (Load Summary): ${params.loadSummary}
${params.userCorrection ? `- Penegasan/Koreksi Pengguna: "${params.userCorrection}"` : ""}

KEMUDIAN: Buatlah 2 sampai 3 pertanyaan reflektif kontekstual (BUKAN survei skala generik!) yang secara spesifik menanyakan apa yang mereka rasakan terkait kandidat kebutuhan tersebut, agar kita bisa memastikan kebutuhan utama mereka.

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "candidates": [
    {
      "key": "rest | control | connection | expression | support | safety",
      "title": "string (nama kebutuhan dalam bahasa Indonesia, misal: 'Rasa Kendali', 'Istirahat')",
      "reason": "string (alasan mengapa kebutuhan ini relevan dengan beban mereka)",
      "relevance": "high"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "string (pertanyaan refleksi kontekstual mendalam yang berkaitan dengan beban cerita mereka)",
      "targetNeed": "rest | control | connection | expression | support | safety",
      "type": "open"
    }
  ]
}
`;
}

export function buildNeedSynthesizePrompt(params: {
  candidates: { key: string; title: string; reason: string }[];
  questions: { id: string; question: string; targetNeed: string }[];
  answers: { questionId: string; answer: string }[];
  loadSummary: string;
}): string {
  const qaPairs = params.questions.map((q) => {
    const ans = params.answers.find((a) => a.questionId === q.id)?.answer || "(tidak dijawab)";
    return `Tanya: "${q.question}"\nJawab Pengguna: "${ans}"\nTarget: ${q.targetNeed}`;
  }).join("\n\n");

  return `
TUGAS STAGE NEED (Bagian 2 - Sintesis Kebutuhan Utama):
Berdasarkan jawaban pengguna atas pertanyaan eksploratif, tentukan kebutuhan utama ('primaryNeed') yang paling mendesak dan dibutuhkan saat ini, serta kebutuhan sekunder jika ada.

KONTEKS BEBAN:
"${params.loadSummary}"

TANYA JAWAB EKSPLORASI KEBUTUHAN:
${qaPairs}

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "primaryNeed": {
    "key": "rest | control | connection | expression | support | safety",
    "title": "string (nama kebutuhan dalam Bahasa Indonesia)",
    "reason": "string (mengapa kebutuhan ini menjadi prioritas utama berdasarkan jawaban mereka)",
    "relevance": "high"
  },
  "secondaryNeeds": [
    {
      "key": "rest | control | connection | expression | support | safety",
      "title": "string",
      "reason": "string",
      "relevance": "medium"
    }
  ],
  "explanation": "string (penjelasan narasi 2-3 kalimat yang melegakan dan memvalidasi bahwa wajar mereka membutuhkan hal ini sekarang)",
  "confidence": "high"
}
`;
}

export function buildActionPrompt(params: {
  primaryNeed: { key: string; title: string; reason: string };
  loadSummary: string;
  loadThemes: string[];
}): string {
  return `
TUGAS STAGE ACTION:
Rancang 3 rekomendasi langkah mikro (micro-actions) yang konkret, sangat realistis, dan ber-skala kecil untuk membantu memenuhi kebutuhan utama pengguna.

PRINSIP MICRO-ACTION:
- "Small enough to actually do" (bisa dilakukan dalam 5-20 menit hari ini).
- Bukan nasihat abstrak seperti "kelola waktu lebih baik" atau "jangan overthinking".
- Berikan 3 tipe:
  1. 'primary': Tindakan utama yang paling seimbang dan realistis.
  2. 'alternative': Tindakan alternatif jika langkah utama terasa kurang pas.
  3. 'low_energy': Tindakan super ringan jika pengguna sedang kehabisan energi sama sekali (low-friction).

KONTEKS PENGGUNA:
- Kebutuhan Utama: ${params.primaryNeed.title} (${params.primaryNeed.key})
- Alasan Kebutuhan: ${params.primaryNeed.reason}
- Tema Beban: ${params.loadThemes.join(", ")}
- Inti Beban: ${params.loadSummary}

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "recommendations": [
    {
      "id": "action-primary",
      "title": "string (judul tindakan singkat)",
      "description": "string (instruksi langkah konkret dan spesifik, 1-2 kalimat)",
      "why": "string (alasan mengapa langkah kecil ini membantu kebutuhan mereka)",
      "type": "primary",
      "estimatedMinutes": 15,
      "difficulty": "low",
      "relatedNeed": "${params.primaryNeed.key}"
    },
    {
      "id": "action-alt",
      "title": "string",
      "description": "string",
      "why": "string",
      "type": "alternative",
      "estimatedMinutes": 10,
      "difficulty": "low",
      "relatedNeed": "${params.primaryNeed.key}"
    },
    {
      "id": "action-low-energy",
      "title": "string",
      "description": "string",
      "why": "string",
      "type": "low_energy",
      "estimatedMinutes": 5,
      "difficulty": "low",
      "relatedNeed": "${params.primaryNeed.key}"
    }
  ]
}
`;
}

export function buildSummaryPrompt(params: {
  whatYouShow: string[];
  whatYouCarry: string[];
  whatYouMayNeed: string[];
  selectedActionTitle: string;
  selectedActionDesc: string;
}): string {
  return `
TUGAS STAGE SUMMARY:
Sintesiskan seluruh perjalanan refleksi pengguna menjadi rangkuman akhir yang utuh dan menenangkan.

DATA REFLEKSI PENGGUNA:
- Tampilan Luar (What You Show): ${params.whatYouShow.join(", ")}
- Beban yang Dipikul (What You Carry): ${params.whatYouCarry.join(", ")}
- Kebutuhan Diri (What You May Need): ${params.whatYouMayNeed.join(", ")}
- Satu Langkah Kecil Pilihan (Your Next Step): "${params.selectedActionTitle} — ${params.selectedActionDesc}"

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "whatYouShow": ${JSON.stringify(params.whatYouShow)},
  "whatYouCarry": ${JSON.stringify(params.whatYouCarry)},
  "whatYouMayNeed": ${JSON.stringify(params.whatYouMayNeed)},
  "nextStep": "${params.selectedActionTitle}: ${params.selectedActionDesc}",
  "reflection": "string (kalimat penutup reflektif 2-3 kalimat yang hangat, menenangkan, menegaskan bahwa melangkah satu langkah kecil sudah sangat cukup)"
}
`;
}
