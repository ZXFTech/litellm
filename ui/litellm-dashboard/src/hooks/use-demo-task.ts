"use client";

import { useButtonFeedback } from "@/components/ui/use-button-feedback";
import type { ButtonFeedbackStatus } from "@/components/ui/button-feedback-state";

export type DemoTaskStatus = ButtonFeedbackStatus;

/** Local demo only: reset and unmount cancel any pending completion. */
export function useDemoTask() {
  const feedback = useButtonFeedback();
  function run(outcome: "success" | "error" = "success", onSuccess?: () => void, options: { action?: string; onError?: () => void; onSuccessFeedbackEnd?: () => void } = {}) {
    return feedback.run((signal) => new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(outcome === "success"); }, 1400);
      function cancel() { clearTimeout(timer); resolve(false); }
      signal.addEventListener("abort", cancel, { once: true });
    }), { ...options, onSuccess });
  }
  return { ...feedback, run };
}
