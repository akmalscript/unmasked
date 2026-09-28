import { z } from "zod";

// ==========================================
// OUTPUT SCHEMAS (Enforcing AI Constraints)
// ==========================================

export const MaskContrastSchema = z.object({
  publicTrait: z.string().min(1),
  internalState: z.string().min(1),
  interpretation: z.string().min(1),
});

export const MaskInsightSchema = z.object({
  contrasts: z.array(MaskContrastSchema).min(1, "Minimal 1 kontras persona"),
  reflection: z.string().min(10, "Refleksi harus memiliki narasi yang bermakna"),
  question: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const LoadThemeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  relevance: z.enum(["low", "medium", "high"]).default("medium"),
});

export const EmotionalContextSchema = z.object({
  label: z.string().min(1),
  intensity: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

export const LoadPatternSchema = z.object({
  description: z.string().min(1),
  relatedThemes: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const LoadInsightSchema = z.object({
  themes: z.array(LoadThemeSchema).min(1, "Minimal 1 tema beban"),
  emotionalContext: z.array(EmotionalContextSchema).min(1, "Minimal 1 konteks emosional"),
  patterns: z.array(LoadPatternSchema).default([]),
  summary: z.string().min(10, "Ringkasan beban harus bermakna"),
  question: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const NeedKeyEnum = z.enum([
  "rest",
  "control",
  "connection",
  "expression",
  "support",
  "safety",
]);

export const CandidateNeedSchema = z.object({
  key: NeedKeyEnum,
  title: z.string().min(1),
  reason: z.string().min(1),
  relevance: z.enum(["low", "medium", "high"]).default("medium"),
});

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export const NeedQuestionSchema = z.object({
  id: z.string().min(1),
  question: z
    .string()
    .trim()
    .min(10, "Pertanyaan minimal 10 karakter")
    .max(140, "Pertanyaan terlalu panjang")
    .refine(
      (value) => {
        const count = wordCount(value);
        return count >= 10 && count <= 18;
      },
      {
        message: "Pertanyaan harus terdiri dari 10–18 kata",
      }
    ),
  targetNeed: NeedKeyEnum,
  type: z.enum(["open", "choice"]).default("open"),
  options: z.array(z.string()).optional(),
});

// Enforce 2-3 questions per prompt requirement
export const NeedPrepareOutputSchema = z.object({
  candidates: z.array(CandidateNeedSchema).min(1, "Minimal 1 kandidat kebutuhan").max(6),
  questions: z
    .array(NeedQuestionSchema)
    .min(2, "AI harus menghasilkan minimal 2 pertanyaan refleksi")
    .max(3, "AI harus menghasilkan maksimal 3 pertanyaan refleksi"),
});

export const NeedInsightSchema = z.object({
  primaryNeed: CandidateNeedSchema,
  secondaryNeeds: z.array(CandidateNeedSchema).optional().default([]),
  explanation: z.string().min(10),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const ActionRecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  why: z.string().min(1),
  type: z.enum(["primary", "alternative", "low_energy"]),
  estimatedMinutes: z.number().int().min(5, "Durasi minimal 5 menit").max(15, "Durasi maksimal 15 menit"),
  difficulty: z.enum(["low", "medium"]).optional().default("low"),
  relatedNeed: z.string().min(1),
});

// Enforce exactly 3 recommendations with types: primary, alternative, low_energy
export const ActionOutputSchema = z.object({
  recommendations: z
    .array(ActionRecommendationSchema)
    .length(3, "Harus menghasilkan tepat 3 rekomendasi aksi")
    .refine((recs) => {
      const types = new Set(recs.map((r) => r.type));
      return types.has("primary") && types.has("alternative") && types.has("low_energy");
    }, {
      message: "Rekomendasi aksi harus mencakup tepat satu 'primary', satu 'alternative', dan satu 'low_energy'",
    }),
});

export const SummaryOutputSchema = z.object({
  whatYouShow: z.array(z.string().min(1)).min(1),
  whatYouCarry: z.array(z.string().min(1)).min(1),
  whatYouMayNeed: z.array(z.string().min(1)).min(1),
  nextStep: z.string().min(1),
  reflection: z.string().min(10),
});

// ==========================================
// INPUT SCHEMAS (Enforcing Request Validation)
// ==========================================

export const MaskInputSchema = z.object({
  publicTags: z
    .array(z.string().trim().min(1, "Tag tidak boleh kosong").max(50))
    .min(1, "Minimal pilih 1 tag persona luar")
    .max(10, "Maksimal 10 tag"),
  actualFeelings: z
    .array(z.string().trim().min(1, "Perasaan tidak boleh kosong").max(50))
    .min(1, "Minimal pilih 1 perasaan batin")
    .max(10, "Maksimal 10 perasaan"),
  note: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

export const LoadInputSchema = z.object({
  brainDump: z
    .string()
    .trim()
    .min(3, "Curahan pikiran minimal 3 karakter")
    .max(2000, "Curahan pikiran maksimal 2000 karakter"),
  items: z
    .array(
      z.object({
        id: z.string().max(100),
        text: z.string().trim().max(300),
        category: z.enum(["act", "share", "let_go"]).optional(),
      })
    )
    .max(30)
    .optional(),
  maskContext: z
    .object({
      publicTags: z.array(z.string().trim().max(50)).optional(),
      actualFeelings: z.array(z.string().trim().max(50)).optional(),
      reflection: z.string().max(1000).optional(),
      confirmation: z
        .object({
          status: z.enum(["accepted", "partially_accepted", "rejected", "edited"]),
          correction: z.string().max(500).optional(),
        })
        .optional(),
    })
    .optional(),
});

export const NeedPrepareInputSchema = z.object({
  loadContext: z.object({
    themes: z
      .array(z.string().trim().min(1).max(100))
      .min(1, "Minimal 1 tema beban dari LOAD wajib disediakan"),
    summary: z
      .string()
      .trim()
      .min(3, "Ringkasan beban dari LOAD wajib diisi")
      .max(2000),
    userCorrection: z.string().trim().max(500).optional(),
  }),
  maskContext: z
    .object({
      publicTags: z.array(z.string().trim().max(50)).optional(),
      actualFeelings: z.array(z.string().trim().max(50)).optional(),
      reflection: z.string().max(1000).optional(),
      userCorrection: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export const NeedSynthesizeInputSchema = z.object({
  candidates: z
    .array(CandidateNeedSchema)
    .min(1, "Kandidat kebutuhan diperlukan")
    .max(6),
  questions: z
    .array(NeedQuestionSchema)
    .min(1, "Pertanyaan kebutuhan diperlukan")
    .max(5),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        answer: z.string().trim().min(1, "Jawaban tidak boleh kosong").max(1000),
      })
    )
    .min(1, "Minimal 1 jawaban pertanyaan harus terisi"),
  loadContext: z
    .object({
      themes: z.array(z.string()).optional(),
      summary: z.string().max(2000).optional(),
      userCorrection: z.string().max(500).optional(),
    })
    .optional(),
  maskContext: z
    .object({
      publicTags: z.array(z.string()).optional(),
      actualFeelings: z.array(z.string()).optional(),
      userCorrection: z.string().max(500).optional(),
    })
    .optional(),
});

export const ActionInputSchema = z.object({
  primaryNeed: CandidateNeedSchema,
  loadSummary: z
    .string()
    .trim()
    .min(3, "Ringkasan beban LOAD wajib ada untuk menyusun langkah aksi")
    .max(2000),
  loadThemes: z
    .array(z.string().trim().min(1).max(100))
    .min(1, "Minimal 1 tema LOAD wajib ada untuk menyusun langkah aksi"),
  needCorrection: z.string().trim().max(500).optional(),
  maskContext: z
    .object({
      publicTags: z.array(z.string()).optional(),
      actualFeelings: z.array(z.string()).optional(),
      userCorrection: z.string().max(500).optional(),
    })
    .optional(),
});

export const SummaryInputSchema = z.object({
  whatYouShow: z
    .array(z.string().trim().min(1).max(100))
    .min(1, "Data MASK tidak boleh kosong")
    .max(10),

  whatYouCarry: z
    .array(z.string().trim().min(1).max(200))
    .min(1, "Data LOAD tidak boleh kosong")
    .max(10),

  whatYouMayNeed: z
    .array(z.string().trim().min(1).max(300))
    .min(1, "Data NEED tidak boleh kosong")
    .max(3),

  selectedActionTitle: z
    .string()
    .trim()
    .min(1)
    .max(150),

  selectedActionDesc: z
    .string()
    .trim()
    .min(1)
    .max(500),
});
