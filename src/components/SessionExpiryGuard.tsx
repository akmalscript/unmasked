"use client";

import { useSessionExpiryGuard } from "@/store/useJournalStore";

/**
 * Invisible client-side security guard that periodically checks session inactivity
 * and auto-resets the store if > 2 hours have passed without activity.
 */
export function SessionExpiryGuard() {
  useSessionExpiryGuard();
  return null;
}
