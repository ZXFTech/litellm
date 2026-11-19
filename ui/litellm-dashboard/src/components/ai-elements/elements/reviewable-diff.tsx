"use client";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { codeScroll, codeSurface,  mono, paper } from "./surfaces";
import type { DiffLine } from "./code-diff";

export type HunkDecision = "pending" | "kept" | "discarded";

export interface DiffHunk {
  id: string;
  range: string;
  decision: HunkDecision;
  lines: readonly DiffLine[];
}

const GUTTER = { context: "", added: "+", removed: "−" } as const;

export function ReviewableDiff({
  filename,
  hunks,
  onKeep,
  onDiscard,
  onApply,
  applyRequest,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "filename" | "hunks" | "onKeep" | "onDiscard" | "onApply"
> & {
  filename: string;
  hunks: readonly DiffHunk[];
  onKeep?: (id: string) => void;
  onDiscard?: (id: string) => void;
  onApply?: () => void;
  applyRequest?: AiRequestState;
}) {
  const kept = hunks.filter((hunk) => hunk.decision === "kept").length;
  const pending = hunks.filter((hunk) => hunk.decision === "pending").length;

  return (
    <div
      data-slot="reviewable-diff"
      className={cn(
        paper,
        "flex w-full max-w-md flex-col overflow-hidden rounded-2xl",
        className,
      )}

      {...props}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="font-mono text-xs">{filename}</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {kept} of {hunks.length} kept
        </span>
      </div>

      <div className="flex flex-col">
        {hunks.map((hunk) => (
          <div
            key={hunk.id}
            className={cn(
              "border-foreground/[0.06] border-t transition-opacity duration-300",
              hunk.decision === "discarded" && "opacity-40",
            )}
          >
            <div className="flex items-center gap-2 px-4 py-1.5">
              <span className={cn(mono, "text-muted-foreground")}>
                {hunk.range}
              </span>
              <span className="ms-auto flex items-center gap-1">
                {hunk.decision === "pending" && (onKeep || onDiscard) ? (
                  <>
                    {onDiscard && (
                      <Button variant="ghost" size="sm"
                        type="button"
                        aria-label={`Discard hunk ${hunk.range}`}
                        onClick={() => onDiscard(hunk.id)}
                        disabled={applyRequest?.busy}
                        className="text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground/90 flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96]"
                      >
                        <XIcon className="size-3" />
                        Discard
                      </Button>
                    )}
                    {onKeep && (
                      <Button variant="ghost" size="sm"
                        type="button"
                        aria-label={`Keep hunk ${hunk.range}`}
                        onClick={() => onKeep(hunk.id)}
                        disabled={applyRequest?.busy}
                        className="flex h-6 items-center gap-1 rounded-full bg-success/12 px-2 text-xs font-medium text-success transition-[background-color,scale] duration-150 hover:bg-success/20 active:scale-[0.96] text-success"
                      >
                        <CheckIcon className="size-3" />
                        Keep
                      </Button>
                    )}
                  </>
                ) : (
                  <span
                    className={cn(
                      mono,
                      "fade-in animate-in duration-300",
                      hunk.decision === "kept"
                        ? "text-success text-success"
                        : "text-muted-foreground",
                    )}
                  >
                    {hunk.decision}
                  </span>
                )}
              </span>
            </div>
            <div className={cn(codeScroll, "pb-1.5 font-mono text-xs")}>
              <div className={codeSurface}>
                {hunk.lines.map((line, i) => (
                  <div
                    key={`${hunk.id}-${i}`}
                    className={cn(
                      "flex px-4 py-0.5 leading-relaxed whitespace-pre-wrap wrap-anywhere",
                      line.kind === "context" && "text-muted-foreground",
                      line.kind === "added" &&
                        "bg-success/10 text-success text-success",
                      line.kind === "removed" &&
                        "bg-destructive/10 text-destructive text-destructive",
                    )}
                  >
                    <span className="w-4 shrink-0 select-none">
                      {GUTTER[line.kind]}
                    </span>
                    <span className="min-w-0 flex-1 wrap-anywhere">{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-foreground/[0.06] flex items-center justify-between border-t px-4 py-2.5">
        <span className={cn(mono, "text-muted-foreground")}>
          {pending > 0 ? `${pending} left to review` : "All reviewed"}
        </span>
        {onApply && (
          <Button variant="ghost" size="sm"
            type="button"
            disabled={pending > 0 || applyRequest?.busy}
            aria-busy={applyRequest?.status === "loading" || undefined}
            onClick={onApply}
            className={cn(
                            "flex h-7 items-center rounded-full px-3 text-xs font-medium disabled:pointer-events-none disabled:opacity-30",
            )}
          >
            {applyRequest && applyRequest.status !== "idle" ? <ButtonFeedbackIcon status={applyRequest.status}/> : null}
            Apply {kept}
          </Button>
        )}
      </div>
    </div>
  );
}
