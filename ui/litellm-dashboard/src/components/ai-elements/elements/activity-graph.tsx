"use client";

import type { ComponentProps } from "react";
import * as HeatGraph from "../connected/heat-graph-primitive/index";
import { cn } from "@/lib/cva.config";
import { mono, paper } from "./surfaces";

const LEVEL_TINT = [
  "bg-foreground/[0.06] inset-ring inset-ring-border forced-colors:border",
  "bg-primary/25 bg-primary/25 forced-color-adjust-none",
  "bg-primary/45 bg-primary/45 forced-color-adjust-none",
  "bg-primary/70 bg-primary/70 forced-color-adjust-none",
  "bg-primary bg-primary forced-color-adjust-none",
] as const;

export function ActivityGraph({
  data,
  start,
  end,
  title,
  total,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "data" | "start" | "end" | "title" | "total"
> & {
  data: readonly HeatGraph.DataPoint[];
  start: string | Date;
  end: string | Date;
  title: string;
  total: string;
}) {
  return (
    <div
      data-slot="activity-graph"
      className={cn(
        paper,
        "flex w-full max-w-sm flex-col gap-3 rounded-2xl p-4",
        className,
      )}

      {...props}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {total}
        </span>
      </div>

      <HeatGraph.Root
        data={[...data]}
        start={start}
        end={end}
        weekStart="monday"
        className="flex flex-col gap-2"
      >
        <div className="flex min-w-0 gap-2">
          <div className="grid shrink-0 grid-rows-7 gap-[3px]">
            <HeatGraph.DayLabels>
              {({ label }) => (
                <span
                  className={cn(
                    mono,
                    "text-muted-foreground flex h-full min-h-0 items-center leading-none",
                  )}
                >
                  {label.row % 2 === 1
                    ? HeatGraph.DAY_SHORT[label.dayOfWeek]
                    : ""}
                </span>
              )}
            </HeatGraph.DayLabels>
          </div>

          <div className="flex min-w-0 flex-1">
            <HeatGraph.Grid className="w-full min-w-0 gap-[3px]">
              {({ cell }) => (
                <HeatGraph.Cell
                  className={cn(
                    "aspect-square min-w-0 rounded-[2px]",
                    LEVEL_TINT[cell.level] ?? LEVEL_TINT[0],
                  )}
                />
              )}
            </HeatGraph.Grid>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end">
          <span className={cn(mono, "text-muted-foreground")}>less</span>
          {LEVEL_TINT.map((tint, level) => (
            <span
              key={level}
              aria-hidden
              className={cn("size-[9px] shrink-0 rounded-[2px]", tint)}
            />
          ))}
          <span className={cn(mono, "text-muted-foreground")}>more</span>
        </div>
      </HeatGraph.Root>
    </div>
  );
}
