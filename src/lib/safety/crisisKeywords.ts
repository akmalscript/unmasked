/**
 * Crisis and safety keyword detection according to UNMASKED Specification (Bab 25 & 26).
 * This provides compassionate emergency resources if self-harm or high-risk ideation is detected.
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
  "minum racun",
  "gak kuat hidup",
  "tidak sanggup hidup lagi",
  "lebih baik mati",
  "end my life",
  "kill myself",
];

export interface SafetyCheckResult {
  isCrisis: boolean;
  matchedTrigger?: string;
  emergencyContacts: {
    name: string;
    description: string;
    contact: string;
    actionUrl: string;
  }[];
}

export const INDONESIA_EMERGENCY_RESOURCES = [
  {
    name: "Halo Kemenkes",
    description: "Layanan konseling krisis Kementerian Kesehatan RI (24 Jam)",
    contact: "1500-567",
    actionUrl: "tel:1500567",
  },
  {
    name: "Into The Light Indonesia",
    description: "Panduan pencegahan bunuh diri dan kesehatan mental remaja/mahasiswa",
    contact: "intothelightid.org",
    actionUrl: "https://www.intothelightid.org",
  },
  {
    name: "Yayasan Pulih",
    description: "Layanan konseling trauma dan dukungan psikososial",
    contact: "+62 811-8436-633 (WhatsApp)",
    actionUrl: "https://wa.me/628118436633",
  },
];

export function checkCrisisRisk(text: string): SafetyCheckResult {
  if (!text || typeof text !== "string") {
    return { isCrisis: false, emergencyContacts: INDONESIA_EMERGENCY_RESOURCES };
  }

  const normalized = text.toLowerCase();
  for (const trigger of CRISIS_TRIGGERS) {
    if (normalized.includes(trigger)) {
      return {
        isCrisis: true,
        matchedTrigger: trigger,
        emergencyContacts: INDONESIA_EMERGENCY_RESOURCES,
      };
    }
  }

  return {
    isCrisis: false,
    emergencyContacts: INDONESIA_EMERGENCY_RESOURCES,
  };
}
