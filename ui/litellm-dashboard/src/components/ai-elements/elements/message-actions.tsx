"use client";

import { Button } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import type { ComponentProps } from "react";
import {
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  RefreshCwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ghostButton } from "./surfaces";

export type Reaction = "up" | "down" | null;

export interface MessageActionsProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  copied: boolean;
  reaction: Reaction;
  regenerating: boolean;
  onCopy: () => void;
  onReactionChange: (reaction: Reaction) => void;
  onRegenerate: () => void;
  onMore: () => void;
  copyRequest?: AiRequestState;
  regenerateRequest?: AiRequestState;
  disabled?: boolean;
}

export function MessageActions({
  copied,
  reaction,
  regenerating,
  onCopy,
  onReactionChange,
  onRegenerate,
  onMore,
  copyRequest,
  regenerateRequest,
  disabled = false,
  className,
  ...props
}: MessageActionsProps) {
  const buttonClassName = cn(ghostButton, "size-7 aria-pressed:[&_svg]:text-primary");

  return (
    <div
      data-slot="message-actions"
      className={cn("flex items-center gap-1", className)}

      {...props}
    >
      <Button variant="ghost" size="icon-sm"
        type="button"
        aria-label={copied ? "Copied response" : "Copy response"}
        onClick={onCopy}
        disabled={disabled || copyRequest?.busy}
        aria-busy={copyRequest?.status === "loading" || undefined}
        className={cn(
          buttonClassName,
          "[&_svg:not([class*='size-'])]:size-3.5",
        )}
      >
        {copyRequest && copyRequest.status !== "idle" ? <ButtonFeedbackIcon status={copyRequest.status} /> : copied ? <CheckIcon className="size-3.5 text-success" /> : <CopyIcon className="size-3.5" />}
      </Button>
      <Button variant="ghost" size="sm"
        type="button"
        aria-label="Mark response helpful"
        aria-pressed={reaction === "up"}
        onClick={() => onReactionChange(reaction === "up" ? null : "up")}
        disabled={disabled}
        className={cn(
          buttonClassName,
          reaction === "up" &&
            "bg-foreground/[0.06] text-foreground/90 dark:bg-foreground/[0.09]",
        )}
      >
        <ThumbsUpIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="sm"
        type="button"
        aria-label="Mark response unhelpful"
        aria-pressed={reaction === "down"}
        onClick={() => onReactionChange(reaction === "down" ? null : "down")}
        disabled={disabled}
        className={cn(
          buttonClassName,
          reaction === "down" &&
            "bg-foreground/[0.06] text-foreground/90 dark:bg-foreground/[0.09]",
        )}
      >
        <ThumbsDownIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="sm"
        type="button"
        aria-label="Regenerate response"
        onClick={onRegenerate}
        disabled={disabled || regenerateRequest?.busy}
        aria-busy={regenerating || undefined}
        className={buttonClassName}
      >
        {regenerateRequest && regenerateRequest.status !== "idle" ? <ButtonFeedbackIcon status={regenerateRequest.status} /> : <RefreshCwIcon className={cn("size-3.5", regenerating && "animate-spin motion-reduce:animate-none")} />}
      </Button>
      <Button variant="ghost" size="sm"
        type="button"
        aria-label="More response actions"
        onClick={onMore}
        disabled={disabled}
        className={buttonClassName}
      >
        <EllipsisIcon className="size-3.5" />
      </Button>
    </div>
  );
}
