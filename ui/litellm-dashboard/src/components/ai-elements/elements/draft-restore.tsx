"use client";
import { AiAsyncButton, useAiActionController } from "../examples/action-scope";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { PencilLineIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ghostButton, mono, paper } from "./surfaces";

export function DraftRestore({
  draft,
  savedAt,
  onRestore,
  onDiscard,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "draft" | "savedAt" | "onRestore" | "onDiscard"
> & {
  draft: string;
  savedAt: string;
  onRestore?: () => void;
  onDiscard?: () => void;
}) {
  const action = useAiActionController();
  return (
    <div
      data-slot="draft-restore"
      className={cn(
        paper,
        "fade-in slide-in-from-bottom-1 animate-in flex w-full max-w-sm items-center gap-2.5 rounded-2xl py-2 pr-2 pl-3.5 duration-300",
        className,
      )}

      {...props}
    >
      <PencilLineIcon className="text-muted-foreground size-3.5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground/70 truncate text-sm">{draft}</span>
        <span className={cn(mono, "text-muted-foreground")}>
          unsent draft · {savedAt}
        </span>
      </div>
      <AiAsyncButton variant="ghost" size="sm"
        type="button"
        onClick={onRestore}
        className="text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground/95 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96] h-auto min-h-7 whitespace-normal"
      >
        Restore
      </AiAsyncButton>
      <Button variant="ghost" size="sm"
        type="button"
        aria-label="Discard the draft"
        onClick={() => { action.cancel(); onDiscard?.(); }}
        disabled={!onDiscard}
        className={cn(cn(ghostButton, "size-7 shrink-0"), "p-0")}
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
}
