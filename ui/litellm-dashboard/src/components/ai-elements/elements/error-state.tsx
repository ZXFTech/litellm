"use client";

import { Button } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import type { ComponentProps } from "react";
import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ShimmerLabel } from "./surfaces";

export interface ErrorStateProps extends Omit<
  ComponentProps<"div">,
  "children" | "role"
> {
  title: string;
  detail: string;
  retrying: boolean;
  onRetry?: () => void;
  request?: AiRequestState;
}

export function ErrorState({
  title,
  detail,
  retrying,
  onRetry,
  request,
  className,
  ...props
}: ErrorStateProps) {
  if (retrying && !request) {
    return (
      <div
        data-slot="error-state"
        key="retrying"
        role="status"
        className={cn(
          "fade-in animate-in flex w-full max-w-sm items-center gap-2.5 text-sm duration-300 motion-reduce:animate-none",
          className,
        )}

        {...props}
      >
        <RefreshCwIcon className="text-muted-foreground size-3.5 shrink-0 animate-spin motion-reduce:animate-none" />
        <ShimmerLabel className="text-muted-foreground relative inline-block">
          Retrying
        </ShimmerLabel>
      </div>
    );
  }

  return (
    <div
      data-slot="error-state"
      key="error"
      role="alert"
      className={cn(
        "fade-in animate-in flex w-full max-w-sm items-start gap-2.5 rounded-2xl bg-destructive/[0.06] px-4 py-3 text-sm duration-300 motion-reduce:animate-none bg-destructive/10",
        className,
      )}

      {...props}
    >
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive/80" />
      <div>
        <p className="font-medium text-destructive text-destructive">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-destructive/60 text-destructive/60">
          {detail}
        </p>
      </div>
      {onRetry && <Button variant="ghost" size="sm"
        type="button"
        onClick={onRetry}
        disabled={request?.busy}
        aria-busy={request?.status === "loading" || undefined}
        className="ms-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 text-destructive"
      >
        {request && request.status !== "idle" ? <ButtonFeedbackIcon status={request.status} /> : <RefreshCwIcon className="size-3" />}
        Retry
      </Button>}
    </div>
  );
}
