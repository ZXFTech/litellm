import { CheckIcon, CircleAlertIcon, LoaderCircleIcon } from "lucide-react";
import type { ButtonFeedbackStatus } from "@/components/ui/button-feedback-state";

export function ButtonFeedbackIcon({ status, "data-icon": position = "inline-start" }: { status: ButtonFeedbackStatus; "data-icon"?: "inline-start" | "inline-end" }) {
  if (status === "loading") return <LoaderCircleIcon data-icon={position} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />;
  if (status === "error") return <CircleAlertIcon data-icon={position} aria-hidden="true" className="in-[button]:text-danger" />;
  if (status === "success") return <CheckIcon data-icon={position} aria-hidden="true" className="in-[button]:text-success" />;
  return null;
}
