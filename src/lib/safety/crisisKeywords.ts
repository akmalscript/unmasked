/**
 * Deterministic Crisis & Safety Fallback according to UNMASKED Safety v2 Specification.
 *
 * PENTING:
 * Komponen ini BUKAN gate keamanan primer.
 * Komponen ini berfungsi strictly sebagai DETERMINISTIC FALLBACK ketika AI Safety Model
 * tidak dapat diakses (misal timeout, network issue, atau output parsing error)
 * untuk mencegah silent pass pada indikasi bahaya fisik/diri yang sangat eksplisit.
 */

import { SafetyAssessment } from "@/schemas/safety";
import { CRISIS_RESOURCES, CrisisResource, resolveResources } from "./crisisResources";

/**
 * Daftar pemicu krisis eksplisit untuk evaluasi deterministik.
 */
export const CRISIS_TRIGGERS: string[] = [
  "bunuh diri",
  "suicide",
  "mau mati",
  "ingin mati",
  "akhiri hidup",
  "mengakhiri hidup",
  "melukai diri",
  "self harm",
  "self-harm",
  "sayat tangan",
  "loncat dari gedung",
  "lompat dari gedung",
  "minum racun",
  "gak kuat hidup",
  "tidak sanggup hidup lagi",
  "lebih baik mati",
  "end my life",
  "kill myself",
];

/**
 * Penanda pihak ketiga atau konteks edukatif/akademik.
 * Digunakan oleh deterministic fallback untuk mencegah false positive
 * ketika konteks menunjukkan diskusi berita, mata kuliah, atau orang lain.
 */
const THIRD_PARTY_OR_EDUCATIONAL_PATTERNS: RegExp[] = [
  /\b(teman|temanku|temannya|dia|mereka|orang lain|orang itu|beliau)\b/i,
  /\b(berita|artikel|film|novel|buku|cerita|kasus|topik|tugas kuliah|mata kuliah|pelajaran|belajar|mempelajari|membahas|penelitian|riset)\b/i,
];

export interface DeterministicSafetyResult {
  isCrisis: boolean;
  matchedTrigger?: string;
  assessment: SafetyAssessment;
  emergencyContacts: CrisisResource[];
}

/**
 * Evaluasi fallback deterministik ketat ketika AI Safety tidak tersedia.
 */
export function checkExplicitDeterministicRisk(text: string): DeterministicSafetyResult {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    const safeAssessment: SafetyAssessment = {
      riskLevel: "safe",
      confidence: "high",
      category: "none",
      isDirectlyAboutUser: false,
      isCurrentOrImminent: false,
      signals: [],
      supportiveResponse: "Kondisi terdeteksi aman untuk melanjutkan refleksi.",
      saferNextStep: "Lanjutkan jurnal seperti biasa.",
      recommendedResourceIds: [],
      source: "deterministic",
    };

    return {
      isCrisis: false,
      assessment: safeAssessment,
      emergencyContacts: CRISIS_RESOURCES,
    };
  }

  const normalizedText = text.toLowerCase();

  // 1. Cek apakah ada pemicu krisis
  let matchedTrigger: string | undefined;
  for (const trigger of CRISIS_TRIGGERS) {
    if (normalizedText.includes(trigger)) {
      matchedTrigger = trigger;
      break;
    }
  }

  // Jika tidak ada kata sensitif krisis sama sekali -> SAFE
  if (!matchedTrigger) {
    const safeAssessment: SafetyAssessment = {
      riskLevel: "safe",
      confidence: "high",
      category: "none",
      isDirectlyAboutUser: false,
      isCurrentOrImminent: false,
      signals: [],
      supportiveResponse: "Kondisi terdeteksi aman untuk melanjutkan refleksi.",
      saferNextStep: "Lanjutkan jurnal seperti biasa.",
      recommendedResourceIds: [],
      source: "deterministic",
    };

    return {
      isCrisis: false,
      assessment: safeAssessment,
      emergencyContacts: CRISIS_RESOURCES,
    };
  }

  // 2. Cek apakah konteks adalah pihak ketiga atau edukasi (Contextual Disambiguation)
  const isContextualThirdPartyOrEducation = THIRD_PARTY_OR_EDUCATIONAL_PATTERNS.some((pattern) =>
    pattern.test(text)
  );

  if (isContextualThirdPartyOrEducation) {
    const concernAssessment: SafetyAssessment = {
      riskLevel: "concern",
      confidence: "medium",
      category: "emotional_distress",
      isDirectlyAboutUser: false,
      isCurrentOrImminent: false,
      signals: [`Kata kunci krisis dalam konteks pihak ketiga / edukasi: "${matchedTrigger}"`],
      supportiveResponse:
        "Tampaknya ada hal yang cukup berat atau melelahkan yang sedang kamu bicarakan. Luangkan waktu sejenak untuk bernapas sebelum melanjutkan.",
      saferNextStep: "Tarik napas perlahan dan lanjutkan refleksi dengan ritmemu sendiri.",
      recommendedResourceIds: ["healing119"],
      source: "deterministic",
    };

    return {
      isCrisis: false,
      matchedTrigger,
      assessment: concernAssessment,
      emergencyContacts: resolveResources(concernAssessment.recommendedResourceIds),
    };
  }

  // 3. Sinyal bahaya krisis langsung / first-person terdeteksi -> CRITICAL CRISIS
  const criticalAssessment: SafetyAssessment = {
    riskLevel: "critical",
    confidence: "high",
    category: "suicidal_risk",
    isDirectlyAboutUser: true,
    isCurrentOrImminent: true,
    signals: [`Pola bahaya eksplisit terdeteksi: "${matchedTrigger}"`],
    supportiveResponse:
      "Kami mendengar bahwa beban yang kamu pikul saat ini terasa begitu luar biasa dan menyakitkan. Keselamatan dan hidupmu sangat berharga. Tolong jangan lewati ini sendirian—ada orang-orang terpercaya yang siap mendampingimu sekarang juga.",
    saferNextStep: "Berhenti sejenak, jangan sendirian, dan hubungi kontak bantuan krisis di bawah ini.",
    recommendedResourceIds: ["healing119", "emergency119", "lisa"],
    source: "deterministic",
  };

  return {
    isCrisis: true,
    matchedTrigger,
    assessment: criticalAssessment,
    emergencyContacts: resolveResources(criticalAssessment.recommendedResourceIds),
  };
}

/**
 * Backward-compatible helper untuk fungsi lama.
 * Memastikan tidak ada breaking change pada caller atau regression test.
 */
export function checkCrisisRisk(text: string): {
  isCrisis: boolean;
  matchedTrigger?: string;
  emergencyContacts: CrisisResource[];
} {
  const result = checkExplicitDeterministicRisk(text);
  return {
    isCrisis: result.isCrisis,
    matchedTrigger: result.matchedTrigger,
    emergencyContacts: result.emergencyContacts,
  };
}

export function containsCrisisKeywords(text: string): boolean {
  return checkExplicitDeterministicRisk(text).isCrisis;
}

export function getCrisisMatches(text: string): string[] {
  const result = checkExplicitDeterministicRisk(text);
  return result.matchedTrigger ? [result.matchedTrigger] : [];
}
