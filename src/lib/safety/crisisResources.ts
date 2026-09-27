/**
 * Single Source of Truth untuk Sumber Bantuan & Hotline Krisis Kesehatan Mental di Indonesia.
 * Sesuai Prioritas 9: Hanya menggunakan sumber resmi/terverifikasi untuk krisis kesehatan jiwa
 * dan TIDAK menyamakan call center umum (seperti Halo Kemenkes 1500-567) sebagai hotline krisis.
 */

export interface CrisisResource {
  name: string;
  description: string;
  contact: string;
  actionUrl: string;
  type: "hotline" | "whatsapp" | "website";
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "LISA (Love Inside Suicide Awareness)",
    description: "Helpline pencegahan bunuh diri dan dukungan kesehatan mental 24 Jam (Bahasa Indonesia & English)",
    contact: "0811-3855-472",
    actionUrl: "tel:08113855472",
    type: "hotline",
  },
  {
    name: "SAPA 129 (KemenPPPA)",
    description: "Layanan Sahabat Perempuan dan Anak untuk perlindungan serta pendampingan psikososial darurat",
    contact: "Hotline 129 / WA 08111-129-129",
    actionUrl: "https://wa.me/628111129129",
    type: "whatsapp",
  },
  {
    name: "Yayasan Pulih",
    description: "Layanan konseling psikologis, penanganan trauma, dan dukungan pemulihan kesehatan jiwa",
    contact: "+62 811-8436-633 (WhatsApp)",
    actionUrl: "https://wa.me/628118436633",
    type: "whatsapp",
  },
  {
    name: "Into The Light Indonesia",
    description: "Panduan pencegahan bunuh diri dan direktori bantuan psikologis untuk remaja dan mahasiswa",
    contact: "intothelightid.org",
    actionUrl: "https://www.intothelightid.org",
    type: "website",
  },
  {
    name: "Layanan Kegawatdaruratan Medis 119",
    description: "Panggilan darurat nasional untuk situasi kritis dan kegawatdaruratan medis",
    contact: "119",
    actionUrl: "tel:119",
    type: "hotline",
  },
];
