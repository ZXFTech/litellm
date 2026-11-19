"use client";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { PauseIcon, PlayIcon, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field, ghostButton, mono, paper } from "./surfaces";
import { announced, pct } from "../utils/range";

export function ReadAloud({
  words,
  spokenIndex,
  playing,
  rate,
  elapsed,
  duration,
  onToggle,
  onRateChange,
  onSeek,
  variant = "default",
  wordSeparator = " ",
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "words"
  | "spokenIndex"
  | "playing"
  | "rate"
  | "elapsed"
  | "duration"
  | "onToggle"
  | "onRateChange"
> & {
  words: readonly string[];
  spokenIndex: number;
  playing: boolean;
  rate: number;
  elapsed: string;
  duration: string;
  onToggle?: () => void;
  onRateChange?: () => void;
  onSeek?: (percent: number) => void;
  variant?: "default" | "text" | "controls";
  wordSeparator?: string;
}) {
  const progress = pct(spokenIndex, words.length);

  return (
    <div
      data-slot="read-aloud"
      data-variant={variant}
      className={cn(
        "flex w-full flex-col gap-3",
        variant === "default" && [paper, "max-w-sm rounded-2xl p-3.5"],
        className,
      )}

      {...props}
    >
      {variant !== "controls" && <p className="text-sm leading-relaxed">
        {words.map((word, i) => (
          <span
            key={`${i}-${word}`}
            data-current-word={i === spokenIndex || undefined}
            className={cn(
              "rounded transition-colors duration-300 motion-reduce:transition-none",
              i < spokenIndex
                ? "text-muted-foreground"
                : i === spokenIndex
                  ? "text-foreground/95 bg-primary/15 duration-0"
                  : "text-foreground/70",
            )}
          >
            {word}{wordSeparator}
          </span>
        ))}
      </p>}

      {variant !== "text" && <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="ghost" size="sm"
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={onToggle}
          disabled={!onToggle || !words.length}
          className={cn(ghostButton, "bg-foreground/[0.06] size-8 shrink-0")}
        >
          {playing ? (
            <PauseIcon className="size-3.5" />
          ) : (
            <PlayIcon className="size-3.5 translate-x-px" />
          )}
        </Button>

        {onSeek ? <input type="range" min={0} max={100} step={1} value={progress} aria-label="朗读进度" aria-valuetext={`${elapsed} / ${duration}`} onChange={event => onSeek(Number(event.target.value))} className="min-w-16 flex-1 accent-primary enabled:cursor-pointer" /> : <span
          role="progressbar"
          aria-label="Read aloud progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={announced(progress)}
          aria-valuetext={`${elapsed} of ${duration}`}
          className="bg-foreground/[0.08] inset-ring-border h-[3px] min-w-0 flex-1 overflow-hidden rounded-full inset-ring forced-colors:outline"
        >
          <span
            className="block h-full rounded-full bg-primary transition-[width] duration-200 ease-linear forced-color-adjust-none motion-reduce:transition-none bg-primary"
            style={{ width: `${progress}%` }}
          />
        </span>}

        <span
          className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}
        >
          {elapsed} / {duration}
        </span>

        <Button variant="ghost" size="sm"
          type="button"
          aria-label={`Playback speed, currently ${rate} times`}
          onClick={onRateChange}
          disabled={!onRateChange || !words.length}
          className={cn(
            field,
            mono,
            "text-muted-foreground hover:text-foreground/90 shrink-0 rounded-full px-2 py-1 tabular-nums transition-colors",
          )}
        >
          {rate}×
        </Button>

        <Volume2Icon className="text-foreground/25 size-3.5 shrink-0" />
      </div>}
    </div>
  );
}
