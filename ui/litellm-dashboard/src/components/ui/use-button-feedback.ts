"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createButtonFeedback } from "@/components/ui/button-feedback-state";

export function useButtonFeedback() {
  const [feedback] = useState(createButtonFeedback);
  const snapshot = useSyncExternalStore(feedback.subscribe, feedback.getSnapshot, feedback.getSnapshot);
  useEffect(() => () => feedback.reset(), [feedback]);
  const loading = snapshot.status === "loading";
  const busy = snapshot.buttonStatus !== "idle";
  function buttonStatus(action = "default") {
    return snapshot.action === action ? snapshot.buttonStatus : "idle";
  }
  return {
    ...snapshot, loading, busy, run: feedback.run, reset: feedback.reset, buttonStatus,
    buttonProps(action = "default") {
      return { disabled: busy, focusableWhenDisabled: true, "aria-busy": buttonStatus(action) === "loading" || undefined, "data-state": buttonStatus(action) };
    },
  };
}
