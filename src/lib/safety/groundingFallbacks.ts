import {
  MaskInsight,
  LoadInsight,
  CandidateNeed,
  NeedQuestion,
  NeedInsight,
  ActionRecommendation,
  SummaryStage,
} from "@/types/session";

/**
 * UNMASKED — Safe Grounding Fallbacks
 *
 * Digunakan ketika:
 * 1. AI Safety Intervention terpicu (riskLevel high/critical),
 * 2. Atau terjadi kegagalan jaringan/server AI dan pengguna memilih melanjutkan jurnal.
 *
 * Mencegah deadlock di seluruh journey sehingga pengguna tetap dapat melanjutkan
 * proses refleksi dan melihat rangkuman akhir secara utuh tanpa hambatan sistem.
 */

export function createGroundingMaskInsight(
  publicTags: string[],
  actualFeelings: string[],
  supportiveMessage?: string
): MaskInsight {
  const contrasts = publicTags.slice(0, 2).map((pt, i) => ({
    publicTrait: pt,
    internalState: actualFeelings[i] || actualFeelings[0] || "Perasaan yang sedang berat",
    interpretation:
      "Di balik apa yang kamu tampilkan ke luar, ada perasaan yang sangat butuh ruang aman untuk didengarkan.",
  }));

  return {
    contrasts: contrasts.length > 0 ? contrasts : [
      {
        publicTrait: "Terlihat baik-baik saja",
        internalState: "Kelelahan yang menumpuk",
        interpretation: "Menyimpan perasaan berat di balik topeng keseharian.",
      },
    ],
    reflection:
      supportiveMessage ||
      "Saat ini beban atau perasaan yang kamu simpan terasa begitu intens. Yang paling utama sekarang bukanlah menuntut kesempurnaan analisis diri, melainkan memberi izin pada dirimu sendiri untuk beristirahat dan merasa aman.",
    confidence: "high",
    meta: {
      model: "grounding-safe-fallback",
      promptVersion: "safety-v2",
      generatedAt: new Date().toISOString(),
    },
  };
}

export function createGroundingLoadInsight(
  brainDump: string,
  stickyNotes: { text: string; category?: string }[] = [],
  supportiveMessage?: string
): LoadInsight {
  const noteSnippets = stickyNotes.map((n) => n.text).filter(Boolean);
  const baseSummary =
    supportiveMessage ||
    (brainDump.trim().length > 0
      ? `Ceritamu menunjukkan beban yang sangat berat dan melelahkan untuk ditanggung sendiri: "${brainDump.trim().slice(0, 120)}..."`
      : noteSnippets.length > 0
      ? `Catatan bebanmu (${noteSnippets.slice(0, 2).join(", ")}) menunjukkan situasi yang berat dan butuh jeda sejenak.`
      : "Curahan pikiranmu menunjukkan beban emosional yang menumpuk dan butuh ruang aman untuk dilepaskan.");

  return {
    summary: baseSummary,
    themes: [
      {
        name: "Kelelahan Batin",
        description: "Beban emosional yang menumpuk dan membutuhkan jeda sejenak untuk bernapas.",
        relevance: "high",
      },
      {
        name: "Kebutuhan Ruang Aman",
        description: "Kebutuhan mendesak untuk didengarkan dan didampingi tanpa penghakiman.",
        relevance: "high",
      },
    ],
    emotionalContext: [
      { label: "Kelelahan", intensity: "high" },
      { label: "Beban Berat", intensity: "high" },
    ],
    patterns: [
      {
        description: "Kecenderungan memendam beban sendirian dalam waktu yang panjang.",
        relatedThemes: ["Kelelahan Batin", "Kebutuhan Ruang Aman"],
        confidence: "high",
      },
    ],
    confidence: "high",
    meta: {
      model: "grounding-safe-fallback",
      promptVersion: "safety-v2",
      generatedAt: new Date().toISOString(),
    },
  };
}

export function createGroundingNeedQuestions(
  supportiveMessage?: string
): {
  candidates: CandidateNeed[];
  questions: NeedQuestion[];
} {
  return {
    candidates: [
      {
        key: "safety",
        title: "Ruang Bernapas & Rasa Aman",
        reason:
          supportiveMessage ||
          "Memberi jeda pada diri agar tidak terus tertekan oleh situasi saat ini.",
        relevance: "high",
      },
      {
        key: "rest",
        title: "Istirahat Batin Tanpa Beban",
        reason: "Memberi tubuh dan pikiran kesempatan memulihkan energi tanpa tuntutan.",
        relevance: "high",
      },
      {
        key: "support",
        title: "Teman Berbagi yang Terpercaya",
        reason: "Memastikan kamu tidak menanggung beban berat ini seorang diri.",
        relevance: "high",
      },
    ],
    questions: [
      {
        id: "q_grounding_1",
        question:
          "Apa hal paling sederhana yang bisa membuatmu merasa sedikit lebih tenang atau aman saat ini?",
        targetNeed: "safety",
        type: "open",
      },
      {
        id: "q_grounding_2",
        question:
          "Apakah ada seseorang atau layanan bantuan terpercaya yang bisa kamu hubungi saat rasa lelah ini datang?",
        targetNeed: "support",
        type: "open",
      },
    ],
  };
}

export function createGroundingNeedInsight(
  supportiveMessage?: string
): NeedInsight {
  return {
    primaryNeed: {
      key: "safety",
      title: "Ruang Bernapas dan Dukungan yang Aman",
      reason:
        supportiveMessage ||
        "Ketika beban terasa luar biasa, kebutuhan paling mendasar adalah merasa aman, tidak sendirian, dan memiliki waktu untuk beristirahat.",
      relevance: "high",
    },
    secondaryNeeds: [
      {
        key: "rest",
        title: "Istirahat Batin",
        reason: "Melepaskan ketegangan sejenak tanpa menghakimi diri sendiri.",
        relevance: "high",
      },
    ],
    explanation:
      "Fokus terbaikmu saat ini adalah merawat diri dan menerima dukungan, tanpa memaksakan diri menyelesaikan semua masalah sekaligus.",
    confidence: "high",
    meta: {
      model: "grounding-safe-fallback",
      promptVersion: "safety-v2",
      generatedAt: new Date().toISOString(),
    },
  };
}

export function createGroundingActionRecommendations(
  saferStep?: string
): ActionRecommendation[] {
  return [
    {
      id: "safe-action-1",
      type: "primary",
      title: saferStep ? "Langkah Menjaga Diri Saat Ini" : "Tarik Napas & Beri Jeda 5 Menit",
      description:
        saferStep ||
        "Duduk bersandar nyaman, minum segelas air hangat, dan biarkan dirimu beristirahat tanpa memikirkan solusi apa pun sekarang.",
      why: "Membantu menenangkan sistem saraf yang sedang terbebani ketegangan tinggi.",
      estimatedMinutes: 5,
      relatedNeed: "Ruang Bernapas & Rasa Aman",
    },
    {
      id: "safe-action-2",
      type: "low_energy",
      title: "Rebahkan Diri & Rilekskan Bahu",
      description:
        "Letakkan ponsel, rebahkan tubuh sejenak, dan lepaskan ketegangan di area bahu serta rahang.",
      why: "Tubuh dan pikiranmu berhak mendapatkan istirahat penuh saat rasa lelah datang.",
      estimatedMinutes: 5,
      relatedNeed: "Istirahat Batin",
    },
    {
      id: "safe-action-3",
      type: "alternative",
      title: "Hubungi Kontak Terpercaya atau Bantuan",
      description:
        "Kirim pesan singkat ke orang terdekat atau hubungi layanan bantuan terverifikasi untuk mengabarkan perasaanmu.",
      why: "Kamu tidak harus memikul semuanya sendirian. Ada orang yang siap mendengarkan.",
      estimatedMinutes: 10,
      relatedNeed: "Teman Berbagi",
    },
  ];
}

export function createGroundingSummaryData(
  whatYouShow: string[] = [],
  whatYouCarry: string[] = [],
  whatYouMayNeed: string[] = [],
  nextStep?: string,
  supportiveMessage?: string
): SummaryStage {
  return {
    whatYouShow: whatYouShow.length > 0 ? whatYouShow : ["Yang Ditampilkan"],
    whatYouCarry: whatYouCarry.length > 0 ? whatYouCarry : ["Beban Pikiran"],
    whatYouMayNeed: whatYouMayNeed.length > 0 ? whatYouMayNeed : ["Ruang Bernapas & Rasa Aman"],
    nextStep: nextStep || "Beri jeda dan rawat diri",
    reflection:
      supportiveMessage ||
      "Hari ini kamu telah berani jujur melihat apa yang ada di dalam dirimu. Mengakui rasa lelah dan butuh jeda adalah bukti keberanian, bukan kelemahan. Rawat dirimu dengan penuh kelembutan.",
    generatedAt: new Date().toISOString(),
    meta: {
      model: "grounding-safe-fallback",
      promptVersion: "safety-v2",
      generatedAt: new Date().toISOString(),
    },
  };
}
