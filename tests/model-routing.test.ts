import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";
import {
  MODEL_CONFIG,
  TASK_MODEL,
  getModelForTask,
  type AITask,
} from "../src/lib/ai/models";

// Hoisted mock for @google/genai
const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

import { generateStructuredAI } from "../src/lib/ai/client";

const TestSchema = z.object({
  test: z.string(),
});

describe("Model Routing & Registry Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  // ========================================================
  // 1. Model Registry and Task Mapping Tests (Section 28)
  // ========================================================
  describe("Task to Model Mapping", () => {
    it("should map mask to standard model (gemini-3.5-flash-lite)", () => {
      expect(TASK_MODEL.mask).toBe(MODEL_CONFIG.standard);
      expect(TASK_MODEL.mask).toBe("gemini-3.5-flash-lite");
    });

    it("should map load to complex model (gemini-3.8-flash)", () => {
      expect(TASK_MODEL.load).toBe(MODEL_CONFIG.complex);
      expect(TASK_MODEL.load).toBe("gemini-3.8-flash");
    });

    it("should map needPrepare to standard model (gemini-3.5-flash-lite)", () => {
      expect(TASK_MODEL.needPrepare).toBe(MODEL_CONFIG.standard);
      expect(TASK_MODEL.needPrepare).toBe("gemini-3.5-flash-lite");
    });

    it("should map needSynthesize to complex model (gemini-3.8-flash)", () => {
      expect(TASK_MODEL.needSynthesize).toBe(MODEL_CONFIG.complex);
      expect(TASK_MODEL.needSynthesize).toBe("gemini-3.8-flash");
    });

    it("should map action to standard model (gemini-3.5-flash-lite)", () => {
      expect(TASK_MODEL.action).toBe(MODEL_CONFIG.standard);
      expect(TASK_MODEL.action).toBe("gemini-3.5-flash-lite");
    });

    it("should map summary to standard model (gemini-3.5-flash-lite)", () => {
      expect(TASK_MODEL.summary).toBe(MODEL_CONFIG.standard);
      expect(TASK_MODEL.summary).toBe("gemini-3.5-flash-lite");
    });
  });

  // ========================================================
  // 2. Symmetric Fallback Policy Tests (Section 28)
  // ========================================================
  describe("Fallback Policy Resolution", () => {
    it("should route standard task primary to 3.5 Flash-Lite and fallback to 3.8 Flash", () => {
      const standardTasks: AITask[] = ["mask", "needPrepare", "action", "summary"];

      for (const task of standardTasks) {
        const { primary, fallback } = getModelForTask(task);
        expect(primary).toBe(MODEL_CONFIG.standard);
        expect(fallback).toBe(MODEL_CONFIG.complex);
      }
    });

    it("should route complex task primary to 3.8 Flash and fallback to 3.5 Flash-Lite", () => {
      const complexTasks: AITask[] = ["load", "needSynthesize"];

      for (const task of complexTasks) {
        const { primary, fallback } = getModelForTask(task);
        expect(primary).toBe(MODEL_CONFIG.complex);
        expect(fallback).toBe(MODEL_CONFIG.standard);
      }
    });
  });

  // ========================================================
  // 3. Safety Model Configuration (Section 30)
  // ========================================================
  describe("Safety Model Configuration", () => {
    it("should configure safety model as gemini-3.5-flash-lite", () => {
      expect(MODEL_CONFIG.safety).toBe(
        process.env.GEMINI_SAFETY_MODEL || "gemini-3.5-flash-lite"
      );
    });
  });

  // ========================================================
  // 4. generateStructuredAI() Mock Execution Tests (Section 29)
  // ========================================================
  describe("generateStructuredAI Execution with Mocks", () => {
    // Test 1: task=mask -> primary = 3.5 Flash-Lite
    it("Test 1: should use 3.5 Flash-Lite as primary for task=mask", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ test: "mask-ok" }),
      });

      const result = await generateStructuredAI("prompt", TestSchema, {
        task: "mask",
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe(MODEL_CONFIG.standard);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("gemini-3.5-flash-lite");
      expect(result.data).toEqual({ test: "mask-ok" });
      expect(result.modelUsed).toBe("gemini-3.5-flash-lite");
    });

    // Test 2: task=load -> primary = 3.8 Flash
    it("Test 2: should use 3.8 Flash as primary for task=load", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ test: "load-ok" }),
      });

      const result = await generateStructuredAI("prompt", TestSchema, {
        task: "load",
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe(MODEL_CONFIG.complex);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("gemini-3.8-flash");
      expect(result.data).toEqual({ test: "load-ok" });
      expect(result.modelUsed).toBe("gemini-3.8-flash");
    });

    // Test 3: task=needSynthesize -> primary = 3.8 Flash
    it("Test 3: should use 3.8 Flash as primary for task=needSynthesize", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ test: "needSynthesize-ok" }),
      });

      const result = await generateStructuredAI("prompt", TestSchema, {
        task: "needSynthesize",
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe(MODEL_CONFIG.complex);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("gemini-3.8-flash");
      expect(result.data).toEqual({ test: "needSynthesize-ok" });
      expect(result.modelUsed).toBe("gemini-3.8-flash");
    });

    // Test 4: task=action -> primary = 3.5 Flash-Lite
    it("Test 4: should use 3.5 Flash-Lite as primary for task=action", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ test: "action-ok" }),
      });

      const result = await generateStructuredAI("prompt", TestSchema, {
        task: "action",
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe(MODEL_CONFIG.standard);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("gemini-3.5-flash-lite");
      expect(result.data).toEqual({ test: "action-ok" });
      expect(result.modelUsed).toBe("gemini-3.5-flash-lite");
    });

    // Test 5: Primary success -> Fallback NOT called
    it("Test 5: should not call fallback if primary succeeds", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ test: "success-first-try" }),
      });

      const result = await generateStructuredAI("prompt", TestSchema, {
        task: "summary",
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("gemini-3.5-flash-lite");
      expect(result.data).toEqual({ test: "success-first-try" });
    });

    // Test 6: Primary fails -> Fallback called once
    it("Test 6: should call fallback exactly once when primary model fails", async () => {
      // Call 1: Primary fails with network/server error
      mockGenerateContent.mockRejectedValueOnce(new Error("503 Service Unavailable"));
      // Call 2: Fallback succeeds
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ test: "fallback-success" }),
      });

      const result = await generateStructuredAI("prompt", TestSchema, {
        task: "load", // Primary: 3.8 Flash, Fallback: 3.5 Flash-Lite
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("gemini-3.8-flash");
      expect(mockGenerateContent.mock.calls[1][0].model).toBe("gemini-3.5-flash-lite");
      expect(result.data).toEqual({ test: "fallback-success" });
      expect(result.modelUsed).toBe("gemini-3.5-flash-lite");
    });

    // Test 7: Primary output invalid -> repair once, then fallback initial once
    it("Test 7: should repair primary once, then if still invalid try fallback initial once without extra retries", async () => {
      // Call 1: Primary initial returns invalid JSON / schema mismatch
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ unexpected: "mismatch" }),
      });
      // Call 2: Primary repair attempt also returns invalid schema
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ stillUnexpected: "mismatch" }),
      });
      // Call 3: Fallback initial succeeds
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ test: "fallback-saved-it" }),
      });

      const result = await generateStructuredAI("prompt", TestSchema, {
        task: "mask", // Primary: 3.5 Flash-Lite, Fallback: 3.8 Flash
      });

      // Exact count: 1 initial primary + 1 repair primary + 1 initial fallback = 3
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("gemini-3.5-flash-lite");
      expect(mockGenerateContent.mock.calls[1][0].model).toBe("gemini-3.5-flash-lite");
      expect(mockGenerateContent.mock.calls[2][0].model).toBe("gemini-3.8-flash");
      expect(result.data).toEqual({ test: "fallback-saved-it" });
      expect(result.modelUsed).toBe("gemini-3.8-flash");
    });
  });
});
