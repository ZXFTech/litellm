"use client";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { ExternalLinkIcon, RotateCwIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field, mono, paper, ShimmerLabel } from "./surfaces";

/**
 * Chrome around a preview: a URL bar, reload, and open-in-new. It renders
 * `children` as given and enforces no isolation of its own, so the caller is
 * responsible for passing an already-sandboxed frame.
 */
export function WebPreview({
  origin,
  loading,
  children,
  onReload,
  reloadRequest,
  retainContent = false,
  onOpenExternal,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "origin" | "loading" | "children" | "onReload" | "onOpenExternal"
> & {
  origin: string;
  loading: boolean;
  children: React.ReactNode;
  onReload?: () => void;
  reloadRequest?: AiRequestState;
  retainContent?: boolean;
  onOpenExternal?: () => void;
}) {
  return (
    <div
      data-slot="web-preview"
      className={cn(
        paper,
        "flex w-full max-w-md flex-col overflow-hidden rounded-2xl",
        className,
      )}

      {...props}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <Button variant="ghost" size="icon-sm"
          type="button"
          aria-label="Reload the preview"
          onClick={onReload}
          disabled={!onReload || loading || reloadRequest?.busy}
          aria-busy={loading || undefined}
          className="shrink-0"
        >
          {reloadRequest && reloadRequest.status !== "idle" ? <ButtonFeedbackIcon status={reloadRequest.status}/> : <RotateCwIcon
            aria-hidden
            className={loading ? "animate-spin motion-reduce:animate-none" : undefined}
          />}
        </Button>

        <span
          className={cn(
            field,
            "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2.5 py-1",
          )}
        >
          <span className={cn(mono, "text-muted-foreground min-w-0 wrap-anywhere")}>
            {origin}
          </span>
        </span>

        <Button variant="ghost" size="icon-sm"
          type="button"
          aria-label="Open the preview in a new tab"
          onClick={onOpenExternal}
          disabled={!onOpenExternal}
          className="shrink-0"
        >
          <ExternalLinkIcon aria-hidden />
        </Button>
      </div>

      <div className="border-foreground/[0.07] relative min-h-[9rem] border-t">
        <div
          aria-hidden={loading && !retainContent}
          className={cn(
            "transition-opacity duration-300 motion-reduce:transition-none",
            loading && !retainContent && "invisible opacity-0",
          )}
        >
          {children}
        </div>
        {loading && (
          <div className={retainContent ? "flex justify-center p-2" : "absolute inset-0 flex items-center justify-center"}>
            <ShimmerLabel className="text-muted-foreground relative inline-block text-xs leading-none">
              Loading preview
            </ShimmerLabel>
          </div>
        )}
      </div>
    </div>
  );
}
