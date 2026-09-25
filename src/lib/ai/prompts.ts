import { LoadItem, UserConfirmation } from "@/types/session";

export const SYSTEM_GUIDELINES = `
Kamu adalah asisten refleksi diri untuk platform UNMASKED: Beyond "I'm Fine".
Platform ini ditujukan bagi mahasiswa untuk memahami kondisi batin mereka secara tenang, terstruktur, dan penuh empati.

PRINSIP UTAMA:
1. CLARITY > DEPTH: Jangan membuat pertanyaan atau kalimat yang terdengar rumit/puitis hanya agar terkesan mendalam. Utamakan kejelasan agar mudah dipahami dalam sekali baca.
2. NATURAL > POETIC: Gunakan Bahasa Indonesia sehari-hari yang akrab bagi mahasiswa, santai, hangat, dan tidak kaku.
3. NO DIAGNOSIS: Jangan pernah mendiagnosis atau memberi label klinis (seperti "depresi", "anxiety disorder", "burnout klinis").
4. TENTATIVE TONE: Gunakan bahasa yang tidak memaksakan (misal: "tampaknya...", "mungkin kamu merasa...", "dari apa yang kamu ceritakan..."). AI adalah cermin pemantul, bukan hakim atau penasihat mutlak.
5. HINDARI JARGON PSIKOLOGI & KATA-KATA ABSTRAK:
   Jangan gunakan istilah seperti: 'dinamika', 'kapasitas', 'regulasi', 'kebutuhan terdalam', 'ruang batin', 'mekanisme', 'kondisi internal', 'keberlangsungan diri', 'emotional capacity', 'psychological pattern'.
6. PRIORITAS KONTEKS: Koreksi dan kata-kata langsung dari pengguna selalu memiliki otoritas tertinggi di atas kesimpulan AI.
7. KEMBALIKAN HANYA FORMAT JSON VALID sesuai skema yang diminta.
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
      "interpretation": "string (penjelasan tentatif tentang kemungkinan jarak atau arti kontras ini, bahasa sederhana, max 1-2 kalimat)"
    }
  ],
  "reflection": "string (refleksi 2-3 kalimat yang hangat dan menyadarkan adanya kesenjangan tanpa menghakimi)",
  "question": "string (satu pertanyaan reflektif yang singkat, jelas, maksimal 15 kata)",
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
Pengguna telah mencurahkan isi kepalanya (Brain Dump). Bantu mereka mengurai benang kusut cerita ini menjadi tema, konteks emosional, pola yang berulang, dan rangkuman yang lebih rapi dengan bahasa yang wajar dan tidak berbelit.

CURAHAN PIKIRAN (BRAIN DUMP):
"${params.brainDump}"

${categorizedItems}

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "themes": [
    {
      "name": "string (nama tema yang konkret dan familiar, misal: 'Tuntutan Tugas Kuliah', 'Ekspektasi Orang Lain', 'Takut Mengecewakan', dll)",
      "description": "string (penjelasan ringkas dan jelas, 1 kalimat)",
      "relevance": "high"
    }
  ],
  "emotionalContext": [
    {
      "label": "string (kata emosi sehari-hari, misal: 'Kewalahan', 'Cemas', 'Merasa Bersalah', 'Lelah')",
      "intensity": "high"
    }
  ],
  "patterns": [
    {
      "description": "string (penjelasan pola yang konkret, misal: 'Banyaknya tugas membuatmu merasa harus terus bekerja sehingga sulit memberi izin diri untuk beristirahat')",
      "relatedThemes": ["string nama tema yang relevan"],
      "confidence": "medium"
    }
  ],
  "summary": "string (rangkuman narasi 2-3 kalimat yang terstruktur tentang inti beban yang sedang dihadapi)",
  "question": "string (opsional: 1 pertanyaan pendek maksimal 15 kata untuk memperjelas hal yang paling berat)",
  "confidence": "medium"
}
`;
}

export function buildNeedPreparePrompt(params: {
  maskContext?: {
    publicTags: string[];
    actualFeelings: string[];
    reflection?: string;
    userCorrection?: string;
  };
  loadContext: {
    themes: string[];
    summary: string;
    userCorrection?: string;
  };
}): string {
  const maskText = params.maskContext
    ? `- Tampilan luar: ${params.maskContext.publicTags.join(", ")}
- Perasaan batin: ${params.maskContext.actualFeelings.join(", ")}
${params.maskContext.userCorrection ? `- Catatan/Koreksi MASK pengguna: "${params.maskContext.userCorrection}"` : ""}`
    : "- (Belum ada konteks MASK)";

  return `
TUGAS STAGE NEED (Bagian 1 - Pertanyaan Eksplorasi Kebutuhan):
Berdasarkan refleksi MASK dan LOAD pengguna, tentukan 2 sampai 3 kandidat kebutuhan yang paling relevan dari taksonomi internal berikut:
Taksonomi Internal:
- 'rest' (Rasa Istirahat: jeda fisik & mental, pemulihan tenaga)
- 'control' (Rasa Kendali: mengatur kembali ritme dan batasan hal yang bisa dikontrol)
- 'connection' (Koneksi: merasa dipahami, tidak menanggung semuanya sendirian)
- 'expression' (Pelepasan Emosi: meluapkan perasaan yang selama ini dipendam)
- 'support' (Bantuan Nyata: dukungan atau bantuan langsung dari orang lain)
- 'safety' (Rasa Aman: merasa bebas dari rasa takut gagal atau dihakimi)

KONTEKS LENGKAP PENGGUNA:
1. MASK (Citra vs Batin):
${maskText}

2. LOAD (Beban yang Dipikul):
- Tema Beban: ${params.loadContext.themes.join(", ")}
- Inti Cerita: ${params.loadContext.summary}
${params.loadContext.userCorrection ? `- Catatan/Koreksi LOAD pengguna: "${params.loadContext.userCorrection}"` : ""}

ATURAN PERTANYAAN (WAJIB DIPATUHI):
1. Buat HANYA 2 sampai 3 pertanyaan.
2. Setiap pertanyaan HANYA memiliki SATU fokus. Jangan gabungkan 2 atau 3 hal sekaligus!
3. Gunakan Bahasa Indonesia sehari-hari yang akrab bagi mahasiswa (santai, wajar, hangat).
4. PANJANG PERTANYAAN: MAKSIMAL 15–18 KATA (Target 10–16 kata). Pertanyaan HARUS bisa dipahami dalam SEKALI BACA.
5. Pertanyaan harus berakar dari cerita nyata pengguna, bukan pertanyaan teoritis atau survei kepribadian.
6. HINDARI KATA ABSTRAK & JARGON (dinamika, kapasitas, regulasi, mekanisme, kebutuhan terdalam, ruang batin, dll).
7. Prioritaskan kata tanya: "Apa", "Bagian mana", "Kapan", "Siapa", "Bantuan seperti apa". Hindari terlalu sering bertanya "Mengapa".

CONTOH KUALITAS PERTANYAAN:
- JANGAN: "Bagaimana dinamika berbagai tuntutan yang sedang kamu hadapi memengaruhi kapasitasmu untuk memberikan ruang bagi kebutuhan diri?"
  GUNAKAN: "Bagian mana dari semua tuntutan ini yang paling berat buatmu?"

- JANGAN: "Bagaimana kebutuhan akan koneksi sosial muncul dalam pengalamanmu saat ini?"
  GUNAKAN: "Ada seseorang yang sebenarnya ingin kamu ajak bicara soal ini?"

- JANGAN: "Bagaimana kamu memahami hambatan internal yang membuatmu sulit memberikan ruang untuk beristirahat secara utuh?"
  GUNAKAN: "Apa yang biasanya membuatmu paling sulit untuk benar-benar berhenti sejenak?"

- JANGAN: "Seberapa penting rasa kendali dalam kehidupanmu saat ini?"
  GUNAKAN: "Bagian mana dari situasi ini yang paling ingin kamu atur kembali?"

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "candidates": [
    {
      "key": "rest | control | connection | expression | support | safety",
      "title": "string (Gunakan label bahasa Indonesia ramah, misal: 'Rasa Kendali', 'Istirahat', 'Bantuan Nyata')",
      "reason": "string (alasan singkat 1 kalimat mengapa kebutuhan ini mungkin relevan)",
      "relevance": "high"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "string (pertanyaan pendek 10-18 kata, bahasa santai sehari-hari, berakhiran tanda tanya '?')",
      "targetNeed": "rest | control | connection | expression | support | safety",
      "type": "open"
    }
  ]
}
`;
}

export function buildNeedSynthesizePrompt(params: {
  maskContext?: {
    publicTags: string[];
    actualFeelings: string[];
    userCorrection?: string;
  };
  loadContext?: {
    themes: string[];
    summary: string;
    userCorrection?: string;
  };
  candidates: { key: string; title: string; reason: string }[];
  questions: { id: string; question: string; targetNeed: string }[];
  answers: { questionId: string; answer: string }[];
}): string {
  const qaPairs = params.questions.map((q) => {
    const ans = params.answers.find((a) => a.questionId === q.id)?.answer || "(belum dijawab)";
    return `Pertanyaan: "${q.question}"\nJawaban Pengguna: "${ans}"\n(Terkait: ${q.targetNeed})`;
  }).join("\n\n");

  const maskInfo = params.maskContext
    ? `Tampilan Luar: ${params.maskContext.publicTags.join(", ")} | Perasaan: ${params.maskContext.actualFeelings.join(", ")}`
    : "";

  return `
TUGAS STAGE NEED (Bagian 2 - Sintesis Kebutuhan Utama):
Berdasarkan jawaban pengguna atas pertanyaan eksploratif, tentukan kebutuhan utama ('primaryNeed') yang tampaknya paling relevan untuk diperhatikan saat ini, serta kebutuhan sekunder jika ada.

KONTEKS PENGGUNA:
${maskInfo ? `- Konteks MASK: ${maskInfo}` : ""}
${params.loadContext?.summary ? `- Inti Cerita Beban: "${params.loadContext.summary}"` : ""}
${params.loadContext?.userCorrection ? `- Koreksi Pengguna: "${params.loadContext.userCorrection}"` : ""}

TANYA JAWAB EKSPLORASI KEBUTUHAN:
${qaPairs}

ATURAN NADA BICARA (TENTATIVE & NON-AUTHORITATIVE):
- JANGAN gunakan kata-kata seperti: "Kebutuhan prioritas terdeteksi", "Paling mendesak", "Kamu wajib...".
- Gunakan bahasa yang ramah dan tentatif: "Dari apa yang kamu ceritakan dan jawab, hal yang tampaknya paling kamu butuhkan sekarang adalah...".
- Penjelasan harus ringkas (2 kalimat), menenangkan, dan memvalidasi bahwa sangat wajar merasakan hal tersebut.

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "primaryNeed": {
    "key": "rest | control | connection | expression | support | safety",
    "title": "string (nama kebutuhan ramah pengguna dalam Bahasa Indonesia, misal: 'Rasa Kendali', 'Istirahat', 'Dukungan Orang Lain')",
    "reason": "string (alasan konkret 1 kalimat mengapa ini relevan berdasarkan jawaban mereka)",
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
  "explanation": "string (penjelasan narasi 2 kalimat yang sederhana, melegakan, dan mudah dipahami tanpa kata-kata abstrak)",
  "confidence": "high"
}
`;
}

export function buildActionPrompt(params: {
  maskContext?: {
    publicTags: string[];
    actualFeelings: string[];
    userCorrection?: string;
  };
  primaryNeed: { key: string; title: string; reason: string };
  loadSummary: string;
  loadThemes: string[];
  needCorrection?: string;
}): string {
  const maskContextText = params.maskContext
    ? `- Persona yang biasanya ditampilkan: ${params.maskContext.publicTags.join(", ")}
- Perasaan sebenarnya: ${params.maskContext.actualFeelings.join(", ")}`
    : "";

  return `
TUGAS STAGE ACTION:
Rancang 3 rekomendasi langkah mikro (micro-actions) yang konkret, realistis, dan ber-skala kecil untuk membantu kebutuhan utama pengguna.

PRINSIP MICRO-ACTION:
- "Small enough to actually do" (bisa dilakukan dalam 5-15 menit hari ini).
- Hubungkan dengan persona MASK dan beban LOAD mereka. Misalnya, jika mereka terbiasa terlihat "selalu bisa diandalkan" atau "selalu mandiri", langkah kecilnya bisa berupa memberi izin menolak satu hal atau mendelegasikan tugas kecil.
- Hindari nasihat umum yang abstrak seperti "atur waktu lebih baik" atau "cobalah relaks".
- Berikan 3 tipe:
  1. 'primary': Tindakan utama yang paling realistis dan seimbang.
  2. 'alternative': Tindakan alternatif jika langkah utama kurang pas.
  3. 'low_energy': Tindakan super ringan 5 menit jika pengguna sedang kehabisan energi sama sekali.

KONTEKS PENGGUNA:
${maskContextText}
- Kebutuhan Utama: ${params.primaryNeed.title} (${params.primaryNeed.key})
- Alasan Kebutuhan: ${params.primaryNeed.reason}
${params.needCorrection ? `- Koreksi/Pilihan Kebutuhan dari Pengguna: "${params.needCorrection}"` : ""}
- Tema Beban: ${params.loadThemes.join(", ")}
- Inti Beban: ${params.loadSummary}

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "recommendations": [
    {
      "id": "action-primary",
      "title": "string (judul tindakan singkat dan bersahabat)",
      "description": "string (instruksi langkah konkret dan spesifik, 1-2 kalimat pendek)",
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
Sintesiskan seluruh perjalanan refleksi pengguna menjadi rangkuman akhir yang utuh, sederhana, dan menenangkan.

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
  "reflection": "string (kalimat penutup reflektif 2 kalimat yang hangat, menenangkan, tanpa bahasa puitis berlebihan, menegaskan bahwa satu langkah kecil sudah sangat berarti)"
}
`;
}
