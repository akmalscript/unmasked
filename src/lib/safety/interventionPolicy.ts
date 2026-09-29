/**
 * UNMASKED Safety v2 Server Anti-False-Positive Intervention Policy.
 *
 * Prinsip:
 * - SAFE & CONCERN: Tidak pernah memicu modal intervensi krisis.
 * - HIGH: Harus confidence "high" + isDirectlyAboutUser + isCurrentOrImminent.
 * - CRITICAL: Harus confidence "high" + isDirectlyAboutUser.
 * - UNSAFE_ACTION (AI output): Memicu intervensi jika model mendeteksi rekomendasi berbahaya.
 */

import { SafetyAssessment } from "@/schemas/safety";

export function shouldTriggerIntervention(assessment: SafetyAssessment): boolean {
  // 1. Safe dan Concern tidak pernah membuka modal
  if (assessment.riskLevel === "safe" || assessment.riskLevel === "concern") {
    return false;
  }

  // 2. Evaluasi output AI yang berbahaya (Action recommendation unsafe)
  if (assessment.category === "unsafe_action") {
    return (
      assessment.confidence === "high" ||
      assessment.riskLevel === "critical" ||
      assessment.riskLevel === "high"
    );
  }

  // 3. Untuk input pengguna, confidence harus high agar terhindar dari false alarms
  if (assessment.confidence !== "high") {
    return false;
  }

  // 4. Harus secara langsung mengenai diri pengguna (bukan cerita pihak ketiga, berita, atau materi kuliah)
  if (!assessment.isDirectlyAboutUser) {
    return false;
  }

  // 5. Tingkat risiko HIGH mewajibkan bahaya bersifat sekarang/segera (current or imminent)
  if (assessment.riskLevel === "high") {
    return assessment.isCurrentOrImminent;
  }

  // 6. Tingkat risiko CRITICAL langsung memicu intervensi jika directly about user
  if (assessment.riskLevel === "critical") {
    return true;
  }

  return false;
}
