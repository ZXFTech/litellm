"use client";

import { Button } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { type ComponentProps, useEffect, useRef } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field,  mono, paper } from "./surfaces";

export function EditMessage({
  value,
  discardedReplies,
  editing,
  onValueChange,
  onSave,
  onCancel,
  onStartEdit,
  request,
  variant = "default",
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "value"
  | "discardedReplies"
  | "editing"
  | "onValueChange"
  | "onSave"
  | "onCancel"
  | "onStartEdit"
> & {
  value: string;
  discardedReplies: number;
  editing: boolean;
  onValueChange?: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onStartEdit?: () => void;
  request?: AiRequestState;
  variant?: "default" | "inline";
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!editing || variant !== "inline") return;
    inputRef.current?.focus();
    inputRef.current?.closest('[data-slot="edit-message"]')?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [editing, variant]);
  if (!editing) {
    return (
      <div
        data-slot="edit-message"
        className={cn("flex w-full max-w-sm justify-end", className)}
        {...props}
      >
        <Button variant="ghost" size="sm"
          type="button"
          onClick={onStartEdit}
          disabled={!onStartEdit}
          className={cn(
            field,
            "hover:bg-foreground/[0.07] max-w-[85%] rounded-2xl px-3.5 py-2.5 text-start text-sm transition-colors",
          )}
        >
          {value}
        </Button>
      </div>
    );
  }

  return (
    <div
      data-slot="edit-message"
      data-variant={variant}
      className={cn(
        variant === "inline" ? [field, "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"] : paper,
        "flex w-full max-w-sm flex-col gap-3 rounded-xl p-3.5",
        className,
      )}

      {...props}
    >
      <textarea
        ref={inputRef}
        readOnly={!onValueChange || request?.busy}
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        rows={2}
        aria-label="Edit your message"
        className={cn(
          "text-foreground/90 resize-none text-sm leading-relaxed outline-none",
          variant === "inline" ? "w-full min-w-0 bg-transparent p-0" : [field, "focus-visible:ring-ring/50 rounded-xl px-3 py-2.5 focus-visible:ring-3"],
        )}
      />

      {discardedReplies > 0 && (
        <div className="flex items-center gap-2 text-warning text-warning">
          <AlertTriangleIcon className="size-3.5 shrink-0" />
          <span className={cn(mono, "tabular-nums")}>
            sending discards {discardedReplies}{" "}
            {discardedReplies === 1 ? "reply" : "replies"}
          </span>
        </div>
      )}

      <div data-slot="edit-message-actions" className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm"
          type="button"
          onClick={onCancel}
          disabled={!onCancel}
          className={cn("text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground/90 h-8 rounded-full px-3.5 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96]", variant === "inline" && "focus-visible:border-transparent focus-visible:ring-0")}
        >
          Cancel
        </Button>
        <Button variant="default" size="sm"
          type="button"
          onClick={onSave}
          disabled={!onSave || !value.trim() || request?.busy}
          aria-busy={request?.status === "loading" || undefined}
          className={cn(
                        "flex h-8 items-center rounded-full px-3.5 text-xs font-medium",
            variant === "inline" && "focus-visible:border-transparent focus-visible:ring-0",
          )}
        >
          {request && <ButtonFeedbackIcon status={request.status} />}Send
        </Button>
      </div>
    </div>
  );
}
