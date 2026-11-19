"use client";

import * as HeatGraphPrimitive from "../connected/heat-graph-primitive/index";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cva.config";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";

const LEVEL_TINT = [
  "bg-foreground/[0.06] inset-ring inset-ring-border forced-colors:border",
  "bg-primary/25 bg-primary/25 forced-color-adjust-none",
  "bg-primary/45 bg-primary/45 forced-color-adjust-none",
  "bg-primary/70 bg-primary/70 forced-color-adjust-none",
  "bg-primary bg-primary forced-color-adjust-none",
] as const;

export function HeatGraph({ data }: { data: HeatGraphPrimitive.DataPoint[] }) {
  const [today, setToday] = useState<Date>();
  useIsomorphicLayoutEffect(() => {
    setToday(new Date());
  }, [data]);
  const latestDataDate = useMemo(
    () =>
      data.reduce<Date | undefined>((latest, point) => {
        const value =
          typeof point.date === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(point.date)
            ? new Date(`${point.date}T00:00:00`)
            : new Date(point.date);
        if (Number.isNaN(value.getTime())) return latest;
        return latest === undefined || value > latest ? value : latest;
      }, undefined),
    [data],
  );
  const end = today ?? latestDataDate;
  if (end === undefined) return <div className="flex flex-col gap-2" />;
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 364);
  // The headless grid rounds starts to Monday; align every 13-week segment once.
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const ranges = Array.from({ length: 4 }, (_, index) => {
    const first = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index * 91);
    const last = index === 3 ? end : new Date(start.getFullYear(), start.getMonth(), start.getDate() + (index + 1) * 91 - 1);
    return { first, last };
  });
  const classify = () => HeatGraphPrimitive.autoLevels(5)(data.map(point => point.count));
  return (
    <div data-slot="heat-graph" data-heat-graph-end={end.toISOString().slice(0, 10)} className="@container/heat-graph w-full min-w-0">
      <div className="hidden @min-[36rem]/heat-graph:block"><GraphRange data={data} end={end} classify={classify} legend /></div>
      <div className="flex flex-col gap-5 @min-[36rem]/heat-graph:hidden">{ranges.map(({ first, last }, index) => <GraphRange key={index} data={data} start={first} end={last} classify={classify} legend={index === ranges.length - 1} />)}</div>
    </div>
  );
}

function GraphRange({ data, start, end, classify, legend }: { data: HeatGraphPrimitive.DataPoint[]; start?: Date; end: Date; classify: HeatGraphPrimitive.ClassifyFn; legend?: boolean }) {
  return (
    <HeatGraphPrimitive.Root
      data={data}
      start={start}
      end={end}
      classify={classify}
      weekStart="monday"
      className="flex min-w-0 flex-col gap-2"
    >
      <div className="flex min-w-0 flex-row-reverse">
        <div className="flex min-w-0 grow flex-col gap-2">
          <MonthLabels end={end} />
          <div className="flex gap-2">
            <DayLabels />
            <CellGrid />
          </div>
        </div>
      </div>
      {legend && <GraphLegend />}
      <CellTooltip />
    </HeatGraphPrimitive.Root>
  );
}

// A month is labelled over the first week that starts in it, so a month whose first week falls before the grid, and a month starting in the current week, stay unlabelled instead of colliding with a neighbour or running past the grid.
function labelsMonth({ date, row }: HeatGraphPrimitive.CellData, end: Date) {
  const weekLater = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 7,
  );
  return row === 0 && date.getDate() <= 7 && weekLater <= end;
}

function MonthLabels({ end }: { end: Date }) {
  return (
    <HeatGraphPrimitive.Grid
      className="ms-10 h-5 gap-x-[3px] overflow-hidden"
      style={{ gridTemplateRows: "auto" }}
    >
      {({ cell }) =>
        labelsMonth(cell, end) ? (
          <span
            className="text-muted-foreground w-0 text-xs whitespace-nowrap"
            style={{ gridColumn: cell.column + 1, gridRow: 1 }}
          >
            {HeatGraphPrimitive.MONTH_SHORT[cell.date.getMonth()]}
          </span>
        ) : null
      }
    </HeatGraphPrimitive.Grid>
  );
}

function DayLabels() {
  return (
    <div className="flex w-8 shrink-0 flex-col justify-between py-[2px]">
      <HeatGraphPrimitive.DayLabels>
        {({ label }) => (
          <span className="text-muted-foreground flex h-[13px] items-center text-xs">
            {label.row % 2 === 0
              ? HeatGraphPrimitive.DAY_SHORT[label.dayOfWeek]
              : ""}
          </span>
        )}
      </HeatGraphPrimitive.DayLabels>
    </div>
  );
}

function CellGrid() {
  return (
    <HeatGraphPrimitive.Grid className="flex-1 gap-[3px]">
      {({ cell }) => (
        <HeatGraphPrimitive.Cell
          className={cn(
            "aspect-square w-full min-w-0 rounded-sm",
            LEVEL_TINT[cell.level] ?? LEVEL_TINT[0],
          )}
        />
      )}
    </HeatGraphPrimitive.Grid>
  );
}

function CellTooltip() {
  return (
    <HeatGraphPrimitive.Tooltip className="bg-foreground text-background pointer-events-none rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
      {({ cell }) => (
        <>
          <strong>{cell.count} contributions</strong> on{" "}
          {cell.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </>
      )}
    </HeatGraphPrimitive.Tooltip>
  );
}

function GraphLegend() {
  return (
    <div className="text-muted-foreground ms-auto flex items-center gap-1 text-xs">
      <span>Less</span>
      <HeatGraphPrimitive.Legend>
        {({ item }) => (
          <HeatGraphPrimitive.LegendLevel
            className={cn(
              "h-[13px] w-[13px] rounded-sm",
              LEVEL_TINT[item.level] ?? LEVEL_TINT[0],
            )}
          />
        )}
      </HeatGraphPrimitive.Legend>
      <span>More</span>
    </div>
  );
}
