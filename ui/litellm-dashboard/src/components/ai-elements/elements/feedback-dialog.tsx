"use client";

import { Button } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import { CheckIcon, PlusIcon, ThumbsDownIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field,  mono, paper } from "./surfaces";

const DISMISS_AFTER_MS = 3000;

function FeedbackDismiss({ onClose }: { onClose: () => void }) {
  const [remainingMs, setRemainingMs] = useState(DISMISS_AFTER_MS);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const deadline = performance.now() + DISMISS_AFTER_MS;
    const interval = setInterval(() => setRemainingMs(Math.max(0, deadline - performance.now())), 50);
    const timeout = setTimeout(() => closeRef.current(), DISMISS_AFTER_MS);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  return <div className="flex w-full items-center justify-end gap-2 text-xs text-muted-foreground">
    <span className="tabular-nums">{Math.ceil(remainingMs / 1000)}s 后关闭</span>
    <Button variant="ghost" size="icon-xs" className="relative shrink-0 rounded-full" aria-label="关闭感谢信息" title="立即关闭感谢信息" onClick={onClose}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute inset-0 size-full -rotate-90" fill="none">
        <circle cx="12" cy="12" r="11" strokeWidth="1.5" className="stroke-border" />
        <circle data-slot="feedback-countdown-ring" cx="12" cy="12" r="11" pathLength="100" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 * (1 - remainingMs / DISMISS_AFTER_MS)} className="stroke-muted-foreground" />
      </svg>
      <XIcon aria-hidden="true" className="size-3" />
    </Button>
  </div>;
}

export function FeedbackDialog({
  reasons,
  selected,
  note,
  sent,
  onToggleReason,
  onNoteChange,
  onSubmit,
  onSupplement,
  onClose,
  request,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "reasons"
  | "selected"
  | "note"
  | "sent"
  | "onToggleReason"
  | "onNoteChange"
  | "onSubmit"
  | "onSupplement"
  | "onClose"
> & {
  reasons: readonly string[];
  selected: readonly string[];
  note: string;
  sent: boolean;
  onToggleReason?: (reason: string) => void;
  onNoteChange?: (note: string) => void;
  onSubmit?: () => void;
  onSupplement?: () => void;
  onClose?: () => void;
  request?: AiRequestState;
}) {
  return (
    <div
      data-slot="feedback-dialog"
      className={cn(
        paper,
        "flex w-full max-w-sm rounded-xl p-4",
        sent && !onClose ? "items-center gap-2.5" : "flex-col gap-3",
        sent && "text-sm",
        className,
      )}

      {...props}
    >
      {sent && onClose && <FeedbackDismiss onClose={onClose} />}
      <div className={sent ? "flex w-full items-center gap-2.5" : "contents"}>
      {/*
        Mounted whether or not the feedback has been sent, because a live region
        only announces a change that happens after it is already in the tree; a
        region created together with its text is the case AT is free to miss.
      */}
      <div
        role="status"
        className={
          sent
            ? "flex min-w-0 flex-1 items-center gap-2.5"
            : "sr-only"
        }
      >
        {sent && (
          <>
            <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-success" />
            <span>Thanks. That helps us tune the model.</span>
          </>
        )}
      </div>

      {sent && onSupplement && <Button variant="ghost" size="sm" className="ms-auto shrink-0" onClick={onSupplement}>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />补充
      </Button>}
      </div>

      {sent ? null : (
        <>
          <div className="flex items-center gap-2.5">
            <span className="bg-foreground/[0.05] text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
              <ThumbsDownIcon className="size-3.5" />
            </span>
            <span className="text-sm font-medium">What went wrong?</span>
            <span className={cn(mono, "text-muted-foreground ms-auto")}>
              optional
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {reasons.map((reason) => {
              const active = selected.includes(reason);
              const className = cn(
                "rounded-full px-2.5 py-1 text-xs transition-[background-color,color,scale] duration-150",
                onToggleReason && "active:scale-[0.96]",
                active
                  ? "bg-foreground text-background"
                  : cn(
                      field,
                      "text-muted-foreground",
                      onToggleReason && "hover:text-foreground/90",
                    ),
              );
              return onToggleReason ? (
                <Button variant="ghost" size="sm"
                  key={reason}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleReason(reason)}
                  disabled={request?.busy}
                  className={className}
                >
                  {reason}
                </Button>
              ) : (
                <span
                  key={reason}
                  role="button"
                  aria-disabled="true"
                  aria-pressed={active}
                  className={className}
                >
                  {reason}
                </span>
              );
            })}
          </div>

          <textarea
            readOnly={!onNoteChange || request?.busy}
            value={note}
            onChange={(event) => onNoteChange?.(event.target.value)}
            rows={2}
            placeholder="Anything else?"
            aria-label="Anything else?"
            className={cn(
              field,
              "text-foreground/80 placeholder:text-muted-foreground focus-visible:ring-ring/50 resize-none rounded-xl px-3 py-2 text-xs outline-none focus-visible:ring-3",
            )}
          />

          {onSubmit && (
            <Button variant="default" size="sm"
              type="button"
              onClick={onSubmit}
              disabled={request?.busy}
              aria-busy={request?.status === "loading" || undefined}
              className={cn(
                                "flex h-8 items-center justify-center self-end rounded-full px-3.5 text-xs font-medium",
              )}
            >
              {request && <ButtonFeedbackIcon status={request.status} />}Send feedback
            </Button>
          )}
        </>
      )}
    </div>
  );
}
