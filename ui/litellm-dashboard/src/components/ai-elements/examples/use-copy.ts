"use client";

import { useButtonFeedback } from "@/components/ui/use-button-feedback";

export function useCopyToClipboard() {
  const feedback = useButtonFeedback();
  return {
    ...feedback,
    isCopied: feedback.buttonStatus() === "success",
    copyToClipboard: (text: string) => feedback.run(async () => {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
    }),
  };
}
