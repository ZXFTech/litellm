"use client";

import { type ComponentProps, useMemo } from "react";
import { cn } from "@/lib/cva.config";
import { take } from "../utils/range";

export interface Segment {
  text: string;
  mono?: boolean;
}

export function StreamingText({
  segments,
  count,
  streaming,
  unit = "word",
  wordSeparator,
  className,
  ...props
}: Omit<
  ComponentProps<"p">,
  "children" | "segments" | "count" | "streaming"
> & {
  segments: Segment[];
  count: number;
  streaming: boolean;
  unit?: "word" | "character" | "segment";
  wordSeparator?: string;
}) {
  const words = useMemo(
    () =>
      segments.flatMap((segment) =>
        (unit === "segment" ? [segment.text] : unit === "character" ? Array.from(segment.text) : segment.text.split(" "))
          .map((word) => ({ word, mono: segment.mono ?? false })),
      ),
    [segments, unit],
  );
  const shown = take(words, count);

  return (
    <p
      data-slot="streaming-text"
      data-unit={unit}
      className={cn(
        "min-h-[8.5rem] max-w-sm text-sm leading-relaxed text-pretty",
        className,
      )}

      {...props}
    >
      {shown.map(({ word, mono: isMono }, i) => {
        const fresh = streaming && shown.length - 1 - i < 2;
        return (
          <span
            key={i}
            className="fade-in animate-in fill-mode-both duration-500 motion-reduce:animate-none"
          >
            <span
              className={cn(
                "transition-colors duration-700 motion-reduce:transition-none",
                fresh && "text-primary text-primary",
                isMono &&
                  "bg-foreground/[0.06] rounded-md px-1.5 py-0.5 font-mono text-[0.85em]",
              )}
            >
              {word}
            </span>{wordSeparator ?? (unit === "character" ? "" : " ")}
          </span>
        );
      })}
      {streaming && shown.length > 0 && (
        <span
          aria-hidden
          className="-mb-0.5 ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none bg-primary"
        />
      )}
    </p>
  );
}
