"use client";

import { CheckIcon, ChevronRightIcon, CircleIcon, Loader2Icon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cva.config";
import {
  CollapsibleRoot as Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible-root";
import {
  collapsePanel,
  field,
  mono,
  ShimmerLabel,
  SwapLabel,
} from "./surfaces";

export interface ToolCallProps {
  label: string;
  activeLabel: string;
  query: string;
  request: string;
  result: string;
  running: boolean;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  status?: "pending" | "running" | "success" | "error";
  requestContent?: ReactNode;
  resultContent?: ReactNode;
}

export function ToolCall({
  label,
  activeLabel,
  query,
  request,
  result,
  running,
  open,
  onOpenChange,
  className,
  status,
  requestContent,
  resultContent,
}: ToolCallProps) {
  return (
    <Collapsible
      data-slot="tool-call"
      data-tool-status={status}
      data-tool-name={status ? label : undefined}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("w-full max-w-sm", className)}
    >
      <CollapsibleTrigger disabled={!onOpenChange} aria-busy={status === "running" || undefined} className={cn("group/trigger text-muted-foreground hover:text-foreground/90 focus-visible:ring-ring/50 focus-visible:ring-3 flex w-full items-center gap-2 rounded-md py-1 text-sm transition-colors outline-none", status && "flex-wrap")}>
        <ChevronRightIcon className="size-3.5 shrink-0 opacity-60 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-open/trigger:rotate-90 group-data-panel-open/trigger:rotate-90 motion-reduce:transition-none" />
        {status ? <span className="min-w-0 wrap-anywhere text-start">{label}</span> : <SwapLabel
          active={running ? 0 : 1}
          className="shrink-0 text-start whitespace-nowrap"
        >
          <ShimmerLabel
            active={running}
            className="relative inline-block leading-none"
          >
            {activeLabel}
          </ShimmerLabel>
          <>{label}</>
        </SwapLabel>}
        {status && <Badge variant="outline">{{ pending: "Pending", running: "Running", success: "Success", error: "Error" }[status]}</Badge>}
        <span
          className={cn(
            mono,
            "bg-foreground/[0.06] text-foreground/70 min-w-0 wrap-anywhere rounded-md px-1.5 py-0.5",
          )}
        >
          {query}
        </span>
        <span className="ms-auto flex w-4 shrink-0 items-center justify-end">
          {status === "pending" ? <CircleIcon aria-hidden className="size-3.5 text-muted-foreground" /> : status === "running" ? <Loader2Icon aria-hidden className="size-3.5 animate-spin motion-reduce:animate-none" /> : status === "error" ? <XIcon aria-hidden className="size-3.5 text-destructive" /> : !running && (
            <CheckIcon className="fade-in zoom-in-90 animate-in size-3.5 text-success duration-200" />
          )}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className={cn(collapsePanel, "outline-none")}>
        <div className={cn(field, "mt-2 overflow-hidden rounded-2xl text-xs")}>
          <div className="px-3.5 pt-2.5 pb-2">
            <p className={cn(mono, "text-muted-foreground mb-1")}>Request</p>
            {requestContent ?? <p className="text-muted-foreground font-mono break-words">
              {request}
            </p>}
          </div>
          <div className="bg-foreground/[0.06] mx-3.5 h-px" />
          <div className="px-3.5 pt-2 pb-2.5">
            <p className={cn(mono, "text-muted-foreground mb-1")}>Result</p>
            {resultContent ?? <p className="text-foreground/90 break-words">{result}</p>}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
