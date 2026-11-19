"use client";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import {
  CheckIcon,
  CircleAlertIcon,
  CircleIcon,
  CircleSlashIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ghostButton, mono, paper } from "./surfaces";
import { announced, clamp, pct, progressOf, take } from "../utils/range";

export interface JobStage {
  name: string;
  weight: number;
  description?: string | undefined;
}

type JobOutcomeStatus = "success" | "partial" | "failed" | "cancelled";

function formatElapsed(elapsedMs: number) {
  const seconds = Math.max(
    0,
    Math.round(Number.isFinite(elapsedMs) ? elapsedMs / 1_000 : 0),
  );
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return {
    dateTime: `PT${seconds}S`,
    label:
      minutes === 0
        ? `${seconds}s`
        : remainder === 0
          ? `${minutes}m`
          : `${minutes}m ${remainder}s`,
  };
}

export function JobProgress({
  title,
  stages,
  stageIndex,
  stageProgress,
  eta,
  onCancel,
  outcome,
  elapsedMs,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "title"
  | "stages"
  | "stageIndex"
  | "stageProgress"
  | "eta"
  | "onCancel"
  | "outcome"
  | "elapsedMs"
> & {
  title: string;
  stages: readonly JobStage[];
  stageIndex: number;
  stageProgress: number;
  eta: string;
  onCancel?: (() => void) | undefined;
  outcome?:
    | {
        status: JobOutcomeStatus;
        summary?: string | undefined;
      }
    | undefined;
  elapsedMs?: number | undefined;
}) {
  const stage = progressOf(stageIndex, stages.length);
  const progress = clamp(stageProgress, 0, 1);
  const totalWeight = stages.reduce((sum, item) => sum + item.weight, 0) || 1;
  const completed = take(stages, stage).reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  const current = stages[stage];
  const overall = pct(
    completed + (current ? current.weight * progress : 0),
    totalWeight,
  );
  const idle = stages.length === 0 && outcome === undefined;
  const finished = !idle && stage >= stages.length;
  const running = !idle && !finished && outcome === undefined;
  const state = idle ? "idle" : (outcome?.status ?? (finished ? "done" : "running"));
  const elapsed =
    !idle && !running && elapsedMs !== undefined ? formatElapsed(elapsedMs) : undefined;
  const statusWord =
    idle ? "not started" : outcome?.status === "success" ? "done" : (outcome?.status ?? "done");
  const announcement = idle ? "Job has not started" : outcome
    ? `Job ${outcome.status === "success" ? "done" : outcome.status === "partial" ? "partly done" : outcome.status}`
    : current
      ? `Current stage: ${current.name}`
      : finished
        ? "Job done"
        : "Job running";
  const outcomeBar =
    outcome?.status === "success"
      ? "bg-success"
      : outcome?.status === "partial"
        ? "bg-warning bg-warning"
        : outcome?.status === "failed"
          ? "bg-destructive bg-destructive"
          : outcome?.status === "cancelled"
            ? "bg-foreground/20"
            : undefined;
  const progressPercent = outcome?.status === "success" ? 100 : overall;

  return (
    <div
      data-slot="job-progress"
      data-state={state}
      className={cn(
        paper,
        "flex w-full max-w-sm flex-col gap-3 rounded-2xl p-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        {idle ? (
          <CircleIcon className="text-muted-foreground size-3.5 shrink-0" />
        ) : outcome?.status === "partial" ? (
          <CircleAlertIcon className="size-3.5 shrink-0 text-warning text-warning" />
        ) : outcome?.status === "failed" ? (
          <XIcon className="size-3.5 shrink-0 text-destructive text-destructive" />
        ) : outcome?.status === "cancelled" ? (
          <CircleSlashIcon className="text-muted-foreground size-3.5 shrink-0" />
        ) : !running ? (
          <CheckIcon className="size-3.5 shrink-0 text-success" />
        ) : (
          <Loader2Icon className="text-muted-foreground size-3.5 shrink-0 animate-spin motion-reduce:animate-none" />
        )}
        <span className="min-w-0 flex-1 wrap-anywhere text-sm font-medium">
          {title}
        </span>
        <span
          className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}
        >
          {elapsed ? (
            <time dateTime={elapsed.dateTime}>{elapsed.label}</time>
          ) : !running ? (
            statusWord
          ) : (
            eta
          )}
        </span>
        {running && onCancel ? (
          <Button variant="ghost" size="sm"
            type="button"
            aria-label="Cancel the job"
            onClick={onCancel}
            className={cn(cn(ghostButton, "size-6 shrink-0"), "p-0")}
          >
            <XIcon className="size-3.5" />
          </Button>
        ) : null}
      </div>

      <span
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={announced(progressPercent)}
        className="bg-foreground/[0.06] inset-ring-border h-1 w-full overflow-hidden rounded-full inset-ring forced-colors:border"
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-500 ease-out forced-color-adjust-none motion-reduce:transition-none",
            outcomeBar ??
              (finished ? "bg-success" : "bg-primary bg-primary"),
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </span>

      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {stages.map((item, i) => (
            <span
              key={item.name}
              className={cn(
                mono,
                i === stage ? "text-foreground/90" : "text-muted-foreground",
              )}
            >
              {item.name}
            </span>
          ))}
        </div>
        {current?.description ? (
          <p className="text-muted-foreground text-xs leading-4 break-words">
            {current.description}
          </p>
        ) : null}
      </div>
      {idle || outcome?.summary ? (
        <p className="text-foreground/60 text-sm leading-snug break-words">
          {idle ? "No job has been started." : outcome?.summary}
        </p>
      ) : null}
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
