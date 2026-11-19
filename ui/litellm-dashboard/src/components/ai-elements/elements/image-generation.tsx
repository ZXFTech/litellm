"use client";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ghostButton, mono, paper, ShimmerLabel } from "./surfaces";

const DOTS = Array.from({ length: 64 }, (_, i) => i);

export function ImageGeneration({
  prompt,
  generating,
  onRegenerate,
  regenerateRequest,
  retainImage = false,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "prompt" | "generating" | "onRegenerate"
> & {
  prompt: string;
  generating: boolean;
  onRegenerate?: () => void;
  regenerateRequest?: AiRequestState;
  retainImage?: boolean;
}) {
  return (
    <div
      data-slot="image-generation"
      className={cn("flex w-52 flex-col gap-2.5", className)}

      {...props}
    >
      <div
        className={cn(
          paper,
          "relative aspect-square w-full overflow-hidden rounded-2xl",
        )}
      >
        <div
          className="absolute inset-0 grid grid-cols-8 place-items-center p-6"
          aria-hidden
        >
          {DOTS.map((dot) => {
            const row = Math.floor(dot / 8);
            const col = dot % 8;
            return (
              <span
                key={dot}
                className={cn(
                  "bg-foreground/20 size-1 rounded-full transition-opacity duration-500",
                  generating
                    ? "animate-pulse motion-reduce:animate-none"
                    : "opacity-0",
                )}
                style={{ animationDelay: `${(row + col) * 90}ms` }}
              />
            );
          })}
        </div>
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 transition-[opacity,filter] duration-1000 ease-out motion-reduce:transition-none",
            generating && !retainImage ? "opacity-0 blur-xl" : "blur-0 opacity-100",
          )}
          style={{
            background: prompt.trim() ? "radial-gradient(120% 90% at 20% 100%, color-mix(in oklab, var(--primary) 75%, transparent) 0%, transparent 55%), radial-gradient(110% 80% at 85% 90%, color-mix(in oklab, var(--accent) 80%, transparent) 0%, transparent 60%), linear-gradient(to top, var(--muted), var(--background))" : "none",
          }}
        />
        <span
          className={cn(
            mono,
            "text-muted-foreground absolute end-2.5 top-2.5 tabular-nums",
          )}
        >
          {prompt.trim() ? "1024 × 1024" : "No image"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground min-w-0 flex-1 wrap-anywhere text-xs">
          {generating ? (
            <ShimmerLabel className="relative">Generating</ShimmerLabel>
          ) : (
            prompt
          )}
        </p>
        {onRegenerate && (
          <Button variant="ghost" size="sm"
            type="button"
            aria-label="Regenerate image"
            aria-hidden={generating && !regenerateRequest || undefined}
            disabled={generating || regenerateRequest?.busy}
            aria-busy={regenerateRequest?.status === "loading" || undefined}
            onClick={onRegenerate}
            className={cn(cn(
              ghostButton,
              "size-6 shrink-0",
              generating && !regenerateRequest && "pointer-events-none opacity-0",
            ), "p-0")}
          >
            {regenerateRequest && regenerateRequest.status !== "idle" ? <ButtonFeedbackIcon status={regenerateRequest.status}/> : <RefreshCwIcon className="size-3"/>}
          </Button>
        )}
      </div>
    </div>
  );
}
