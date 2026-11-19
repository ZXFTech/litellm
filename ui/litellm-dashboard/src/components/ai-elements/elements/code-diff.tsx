"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cva.config";
import { codeScroll, codeSurface, mono, paper } from "./surfaces";

export type DiffKind = "context" | "added" | "removed";

export interface DiffLine {
  kind: DiffKind;
  text: string;
}

const GUTTER: Record<DiffKind, string> = {
  context: "",
  added: "+",
  removed: "−",
};

export function CodeDiff({
  filename,
  additions,
  deletions,
  lines,
  cycle,
  animateRows = true,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "filename" | "additions" | "deletions" | "lines" | "cycle" | "animateRows"
> & {
  filename: string;
  additions: number;
  deletions: number;
  lines: readonly DiffLine[];
  cycle: number;
  animateRows?: boolean;
}) {
  return (
    <div
      data-slot="code-diff"
      className={cn(
        paper,
        "w-full max-w-md overflow-hidden rounded-2xl font-mono text-xs",
        className,
      )}

      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 pb-2">
        <span className="text-foreground/90 min-w-0 flex-1 wrap-anywhere">{filename}</span>
        <span className={cn(mono, "shrink-0 tabular-nums")}>
          <span className="text-success text-success">
            +{additions}
          </span>{" "}
          <span className="text-destructive text-destructive">−{deletions}</span>
        </span>
      </div>
      <div className={codeScroll}>
        <div className={codeSurface}>
          {lines.map((line, i) => (
            <div
              key={`${cycle}-${i}-${line.text}`}
              className={cn(
                "flex min-w-0 px-4 py-0.5 leading-relaxed whitespace-pre-wrap",
                animateRows && "fade-in animate-in fill-mode-both duration-300",
                line.kind === "context" && "text-muted-foreground",
                line.kind === "added" &&
                  "bg-success/10 text-success bg-success/10 text-success",
                line.kind === "removed" &&
                  "bg-destructive/10 text-destructive text-destructive",
              )}
              style={animateRows ? { animationDelay: `${i * 60}ms` } : undefined}
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
  );
}
