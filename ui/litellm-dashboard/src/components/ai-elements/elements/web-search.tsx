"use client";

import type { ComponentProps, ReactNode } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field, mono, ShimmerLabel } from "./surfaces";
import { take } from "../utils/range";

export interface WebSearchResult {
  title: string;
  domain: string;
}

export function WebSearch({
  query,
  results,
  visibleResults,
  searching,
  cycle,
  resultContent,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "query" | "results" | "visibleResults" | "searching" | "cycle"
> & {
  query: string;
  results: readonly WebSearchResult[];
  visibleResults: number;
  searching: boolean;
  cycle: number;
  resultContent?: ReactNode;
}) {
  const displayedResults = take(results, visibleResults);

  return (
    <div
      data-slot="web-search"
      className={cn("flex w-full max-w-sm flex-col gap-2.5", className)}

      {...props}
    >
      <span
        className={cn(
          field,
          "text-foreground/70 inline-flex w-fit min-w-0 max-w-full items-center gap-1.5 rounded-full px-3.5 py-2 text-xs",
        )}
      >
        <SearchIcon aria-hidden className="text-muted-foreground size-3 shrink-0" />
        <span className="min-w-0 wrap-anywhere">{query}</span>
      </span>
      <div className="text-muted-foreground text-xs">
        {searching ? (
          <ShimmerLabel className="relative inline-block leading-none">
            Searching
          </ShimmerLabel>
        ) : (
          <span className="fade-in animate-in duration-300">
            {displayedResults.length === 0
              ? "No sources found"
              : `Read ${displayedResults.length} ${displayedResults.length === 1 ? "source" : "sources"}`}
          </span>
        )}
      </div>
      <div className="flex min-h-[5.75rem] flex-col">
        {resultContent ?? displayedResults.map((result) => (
          <div
            key={`${cycle}-${result.domain}`}
            className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both hover:bg-foreground/[0.03] flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors duration-300"
          >
            <span className="bg-foreground/[0.06] text-muted-foreground flex size-4 shrink-0 items-center justify-center rounded text-[9px] font-medium">
              {result.domain.charAt(0).toUpperCase()}
            </span>
            <span className="text-foreground/90 min-w-0 flex-1 wrap-anywhere text-sm">
              {result.title}
            </span>
            <span className={cn(mono, "text-muted-foreground shrink-0")}>
              {result.domain}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
