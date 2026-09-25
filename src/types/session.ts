export type ConfirmationStatus = "accepted" | "partially_accepted" | "rejected" | "edited";

export interface UserConfirmation {
  status: ConfirmationStatus;
  correction?: string;
  note?: string;
  confirmedAt?: string;
}

export interface AIArtifactMeta {
  model: string;
  promptVersion: string;
  generatedAt: string;
}

// ----------------- STAGE 1: MASK -----------------
export interface MaskContrast {
  publicTrait: string;
  internalState: string;
  interpretation: string;
}

export interface MaskInsight {
  contrasts: MaskContrast[];
  reflection: string;
  question?: string;
  confidence: "low" | "medium" | "high";
  meta?: AIArtifactMeta;
}

export interface MaskStage {
  publicSelf: {
    selectedTags: string[];
  };
  actualFeeling: {
    selectedTags: string[];
    note?: string;
  };
  aiInsight?: MaskInsight;
  confirmation?: UserConfirmation;
}

// ----------------- STAGE 2: LOAD -----------------
export type LoadCategory = "act" | "share" | "let_go";

export interface LoadItem {
  id: string;
  text: string;
  category?: LoadCategory;
}

export interface LoadTheme {
  name: string;
  description?: string;
  relevance: "low" | "medium" | "high";
}

export interface EmotionalContext {
  label: string;
  intensity?: "low" | "medium" | "high";
}

export interface LoadPattern {
  description: string;
  relatedThemes: string[];
  confidence: "low" | "medium" | "high";
}

export interface LoadInsight {
  themes: LoadTheme[];
  emotionalContext: EmotionalContext[];
  patterns: LoadPattern[];
  summary: string;
  question?: string;
  confidence: "low" | "medium" | "high";
  meta?: AIArtifactMeta;
}

export interface LoadStage {
  brainDump: {
    rawText: string;
  };
  items: LoadItem[];
  aiInsight?: LoadInsight;
  confirmation?: UserConfirmation;
}

// ----------------- STAGE 3: NEED -----------------
export type NeedKey =
  | "rest"
  | "control"
  | "connection"
  | "expression"
  | "support"
  | "safety";

export interface CandidateNeed {
  key: NeedKey;
  title: string;
  reason: string;
  relevance: "low" | "medium" | "high";
}

export interface NeedQuestion {
  id: string;
  question: string;
  targetNeed: NeedKey;
  type: "open" | "choice";
  options?: string[];
}

export interface NeedAnswer {
  questionId: string;
  answer: string;
}

export interface NeedInsight {
  primaryNeed: CandidateNeed;
  secondaryNeeds?: CandidateNeed[];
  explanation: string;
  confidence: "low" | "medium" | "high";
  meta?: AIArtifactMeta;
}

export interface NeedStage {
  candidates?: CandidateNeed[];
  questions?: NeedQuestion[];
  answers?: NeedAnswer[];
  finalInsight?: NeedInsight;
  confirmation?: UserConfirmation;
}

// ----------------- STAGE 4: ACTION -----------------
export interface ActionRecommendation {
  id: string;
  title: string;
  description: string;
  why: string;
  type: "primary" | "alternative" | "low_energy";
  estimatedMinutes?: number;
  difficulty?: "low" | "medium";
  relatedNeed: string;
}

export interface ActionStage {
  recommendations?: ActionRecommendation[];
  selectedActionId?: string;
  completed?: boolean;
}

// ----------------- SUMMARY -----------------
export interface SummaryStage {
  whatYouShow: string[];
  whatYouCarry: string[];
  whatYouMayNeed: string[];
  nextStep?: string;
  reflection?: string;
  generatedAt?: string;
  meta?: AIArtifactMeta;
}

// ----------------- OVERALL REFLECTION SESSION -----------------
export interface ReflectionSession {
  id: string;
  status: "active" | "completed" | "safety_intervention";
  currentStage: "onboarding" | "mask" | "load" | "need" | "action" | "summary" | "completed";
  mask: MaskStage;
  load: LoadStage;
  need: NeedStage;
  action: ActionStage;
  summary?: SummaryStage;
  timestamps: {
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
  };
}
