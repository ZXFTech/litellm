"use client";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { AlertCircleIcon, Loader2Icon, RotateCwIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field, mono, paper } from "./surfaces";

export function ToolError({
  name,
  target,
  message,
  attempt,
  maxAttempts,
  retrying,
  onRetry,
  retryRequest,
  onSkip,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "name"
  | "target"
  | "message"
  | "attempt"
  | "maxAttempts"
  | "retrying"
  | "onRetry"
  | "onSkip"
> & {
  name: string;
  target: string;
  message: string;
  attempt: number;
  maxAttempts: number;
  retrying: boolean;
  onRetry?: () => void;
  retryRequest?: AiRequestState;
  onSkip?: () => void;
}) {
  return (
    <div
      data-slot="tool-error"
      className={cn(
        paper,
        "flex w-full max-w-sm flex-col gap-3 rounded-2xl p-3.5",
        className,
      )}

      {...props}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircleIcon className="size-3.5 shrink-0 text-destructive" />
        <span
          className={cn(mono, "text-muted-foreground min-w-0 wrap-anywhere")}
        >
          {name}
        </span>
        <span className="text-foreground/80 min-w-0 flex-1 wrap-anywhere text-sm">
          {target}
        </span>
        <span
          className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}
        >
          {attempt}/{maxAttempts}
        </span>
      </div>

      <div
        className={cn(
          field,
          "rounded-xl px-3 py-2 font-mono text-xs leading-relaxed break-words text-destructive text-destructive",
        )}
      >
        {message}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm"
          type="button"
          onClick={onSkip}
          disabled={!onSkip}
          className="text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground/90 h-7 rounded-full px-2.5 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-30"
        >
          Skip
        </Button>
        <Button variant="ghost" size="sm"
          type="button"
          onClick={onRetry}
          disabled={retrying || !onRetry || retryRequest?.busy}
          aria-busy={retrying || undefined}
          className="text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground/95 flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96] disabled:pointer-events-none"
        >
          {retryRequest && retryRequest.status !== "idle" ? <ButtonFeedbackIcon status={retryRequest.status}/> : retrying ? (
            <Loader2Icon className="size-3 animate-spin motion-reduce:animate-none" />
          ) : (
            <RotateCwIcon className="size-3" />
          )}
          {retrying ? "Retrying" : "Retry"}
        </Button>
      </div>
    </div>
  );
}
