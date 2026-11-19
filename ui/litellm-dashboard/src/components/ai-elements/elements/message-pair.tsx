"use client";

import { Button } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import type { ComponentProps, ReactNode } from "react";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ghostButton, paper } from "./surfaces";
import { StreamingText } from "./streaming-text";

export interface MessagePairProps extends Omit<
  ComponentProps<"div">,
  "children" | "onCopy"
> {
  userMessage: string;
  words: readonly string[];
  visibleWords: number;
  streaming: boolean;
  variant?: "bubble" | "flat";
  wordSeparator?: string;
  onCopy?: () => void;
  onRegenerate?: () => void;
  copyRequest?: AiRequestState;
  regenerateRequest?: AiRequestState;
  userContent?: ReactNode;
  userActions?: ReactNode;
  userActionsPosition?: "below" | "before";
  beforeResponse?: ReactNode;
  responseContent?: ReactNode;
  responseActions?: ReactNode;
}

export function MessagePair({
  userMessage,
  words,
  visibleWords,
  streaming,
  variant = "bubble",
  wordSeparator = " ",
  onCopy,
  onRegenerate,
  copyRequest,
  regenerateRequest,
  userContent,
  userActions,
  userActionsPosition = "below",
  beforeResponse,
  responseContent,
  responseActions,
  className,
  ...props
}: MessagePairProps) {
  const user = userContent ?? <p
    className={cn(
      "max-w-[85%] self-end text-sm",
      userActionsPosition === "before" && "min-w-0 self-auto",
      variant === "bubble" ? cn(paper, "rounded-2xl px-3.5 py-2") : "text-foreground/90 text-end",
    )}
  >{userMessage}</p>;

  return (
    <div
      data-slot="message-pair"
      className={cn("flex w-full max-w-sm flex-col gap-5", className)}

      {...props}
    >
      {userActionsPosition === "before" ? <div data-slot="user-message-row" className="group/user-message flex min-w-0 items-center justify-end gap-2">{userActions}{user}</div> : <>{user}{userActions}</>}
      <div className="group/message flex flex-col items-start">
        {beforeResponse}
        {responseContent ?? <StreamingText className="min-h-0 max-w-none" segments={words.map(text => ({ text }))} unit="segment" wordSeparator={wordSeparator} count={visibleWords} streaming={streaming} />}
        {responseActions}
        {(onCopy || onRegenerate) && (
          <div className="flex items-center gap-1 pt-1 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 motion-reduce:transition-none">
            {onCopy && (
              <Button variant="ghost" size="sm"
                type="button"
                aria-label="Copy response"
                onClick={onCopy}
                disabled={streaming || copyRequest?.busy}
                aria-busy={copyRequest?.status === "loading" || undefined}
                className={cn(ghostButton, "size-7")}
              >
                {copyRequest && copyRequest.status !== "idle" ? <ButtonFeedbackIcon status={copyRequest.status} /> : <CopyIcon className="size-3.5" />}
              </Button>
            )}
            {onRegenerate && (
              <Button variant="ghost" size="sm"
                type="button"
                aria-label="Regenerate response"
                onClick={onRegenerate}
                disabled={streaming || regenerateRequest?.busy}
                aria-busy={regenerateRequest?.status === "loading" || undefined}
                className={cn(ghostButton, "size-7")}
              >
                {regenerateRequest && regenerateRequest.status !== "idle" ? <ButtonFeedbackIcon status={regenerateRequest.status} /> : <RefreshCwIcon className="size-3.5" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
