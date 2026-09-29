/**
 * Single Source of Truth untuk Sumber Bantuan & Hotline Krisis Kesehatan Mental di Indonesia.
 * Sesuai Spesifikasi UNMASKED Safety v2:
 * Hanya menggunakan sumber resmi/terverifikasi, memiliki stable ID unik,
 * dan TIDAK menyamakan call center umum sebagai hotline krisis.
 */

export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  contact: string;
  actionUrl: string;
  type: "hotline" | "whatsapp" | "website";
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: "healing119",
    name: "Healing119 (Kemenkes)",
    description: "Dukungan psikologis awal dari Kementerian Kesehatan RI untuk masyarakat yang membutuhkan ruang dengar dan pendampingan.",
    contact: "119 ext. 8",
    actionUrl: "https://www.healing119.id",
    type: "website",
  },
  {
    id: "emergency119",
    name: "Layanan Kegawatdaruratan Medis 119",
    description: "Layanan kegawatdaruratan medis nasional terpadu untuk situasi kritis atau bahaya fisik langsung.",
    contact: "119",
    actionUrl: "tel:119",
    type: "hotline",
  },
  {
    id: "sapa129",
    name: "SAPA 129 (KemenPPPA)",
    description: "Layanan Sahabat Perempuan dan Anak untuk perlindungan, pelaporan kekerasan, dan pendampingan darurat.",
    contact: "129 / WhatsApp 08111-129-129",
    actionUrl: "https://wa.me/628111129129",
    type: "whatsapp",
  },
  {
    id: "lisa",
    name: "LISA (Love Inside Suicide Awareness)",
    description: "Helpline pencegahan bunuh diri dan dukungan kesehatan mental (Bahasa Indonesia & English).",
    contact: "0811-3855-472",
    actionUrl: "tel:08113855472",
    type: "hotline",
  },
  {
    id: "yayasan_pulih",
    name: "Yayasan Pulih",
    description: "Layanan konseling psikologis dan penanganan trauma kesehatan mental.",
    contact: "+62 811-8436-633 (WhatsApp)",
    actionUrl: "https://wa.me/628118436633",
    type: "whatsapp",
  },
];

export const DEFAULT_CRISIS_RESOURCE_IDS = ["healing119", "emergency119"];

/**
 * Mencocokkan array resource ID dari evaluasi AI dengan registry resmi.
 * ID yang tidak dikenal otomatis difilter keluar (anti-hallucination safeguard).
 */
export function resolveResources(resourceIds?: string[]): CrisisResource[] {
  if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
    return CRISIS_RESOURCES.filter((res) => DEFAULT_CRISIS_RESOURCE_IDS.includes(res.id));
  }

  const matched = resourceIds
    .map((id) => CRISIS_RESOURCES.find((res) => res.id === id))
    .filter((res): res is CrisisResource => Boolean(res));

  // Jika semua resource ID tidak valid/unknown, fallback ke default resmi
  if (matched.length === 0) {
    return CRISIS_RESOURCES.filter((res) => DEFAULT_CRISIS_RESOURCE_IDS.includes(res.id));
  }

  return matched;
}
