"use client";
import { AiAsyncButton } from "../examples/action-scope";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field, floating,  mono } from "./surfaces";

export function LauncherBubble({
  open,
  unread,
  greeting,
  prompts,
  onToggle,
  onPick,
  onStart,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "open"
  | "unread"
  | "greeting"
  | "prompts"
  | "onToggle"
  | "onPick"
  | "onStart"
> & {
  open: boolean;
  unread: number;
  greeting: string;
  prompts: readonly string[];
  onToggle?: () => void;
  onPick?: (prompt: string) => void;
  onStart?: () => void;
}) {
  const bubble = (
    <>
      <span className="grid">
        <MessageCircleIcon
          className={cn(
            "size-5 transition-[opacity,rotate] duration-200 [grid-area:1/1]",
            open && "rotate-90 opacity-0",
          )}
        />
        <XIcon
          className={cn(
            "size-5 transition-[opacity,rotate] duration-200 [grid-area:1/1]",
            !open && "-rotate-90 opacity-0",
          )}
        />
      </span>

      {unread > 0 && !open && (
        <span
          className={cn(
            mono,
            "bg-background text-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full tabular-nums",
          )}
        >
          {unread}
        </span>
      )}
    </>
  );

  return (
    <div
      data-slot="launcher-bubble"
      className={cn(
        "flex w-full max-w-[19rem] flex-col items-end gap-2.5",
        className,
      )}

      {...props}
    >
      {open && (
        <div
          className={cn(
            floating,
            "fade-in zoom-in-95 slide-in-from-bottom-2 animate-in flex w-full flex-col gap-3 rounded-xl p-4 duration-200",
          )}
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{greeting}</span>
            <span className={cn(mono, "text-muted-foreground")}>
              typically replies in a minute
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {prompts.map((prompt) =>
              onPick ? (
                <Button variant="ghost" size="sm"
                  key={prompt}
                  type="button"
                  onClick={() => onPick(prompt)}
                  className={cn(cn(
                    field,
                    "hover:bg-foreground/[0.07] text-foreground/70 rounded-xl px-3 py-2 text-start text-sm transition-colors",
                  ), "h-auto min-h-7 whitespace-normal")}
                >
                  {prompt}
                </Button>
              ) : (
                <span
                  key={prompt}
                  className={cn(
                    field,
                    "text-foreground/70 rounded-xl px-3 py-2 text-sm",
                  )}
                >
                  {prompt}
                </span>
              ),
            )}
          </div>

          {onStart && (
            <AiAsyncButton variant="default" size="sm"
              type="button"
              onClick={onStart}
              className={cn(
                                "flex h-8 items-center justify-center rounded-full text-xs font-medium",
              )}
            >
              Start a conversation
            </AiAsyncButton>
          )}
        </div>
      )}

      {onToggle && (
        <Button variant="default" size="sm"
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close the assistant" : "Open the assistant"}
          onClick={onToggle}
          className={cn(
                        "relative flex size-12 shrink-0 items-center justify-center rounded-full",
          )}
        >
          {bubble}
        </Button>
      )}

      {!onToggle && !open && (
        <div className="bg-foreground text-background relative flex size-12 shrink-0 items-center justify-center rounded-full">
          {bubble}
        </div>
      )}
    </div>
  );
}
