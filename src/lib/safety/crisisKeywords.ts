/**
 * Crisis and safety keyword detection according to UNMASKED Specification (Bab 25 & 26).
 * This provides compassionate emergency resources if self-harm or high-risk ideation is detected.
 */

import { CRISIS_RESOURCES, CrisisResource } from "./crisisResources";

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
  emergencyContacts: CrisisResource[];
}

export const INDONESIA_EMERGENCY_RESOURCES = CRISIS_RESOURCES;

export function checkCrisisRisk(text: string): SafetyCheckResult {
  if (!text || typeof text !== "string") {
    return { isCrisis: false, emergencyContacts: CRISIS_RESOURCES };
  }

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

  return {
    isCrisis: false,
    emergencyContacts: CRISIS_RESOURCES,
  };
}

export function containsCrisisKeywords(text: string): boolean {
  return checkCrisisRisk(text).isCrisis;
}

export function getCrisisMatches(text: string): string[] {
  const result = checkCrisisRisk(text);
  return result.matchedTrigger ? [result.matchedTrigger] : [];
}
