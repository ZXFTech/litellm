"use client";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { MaximizeIcon, MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ghostButton, mono, paper } from "./surfaces";

export function Diagram({
  title,
  zoom,
  children,
  onZoomIn,
  onZoomOut,
  onReset,
  onExpand,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "title"
  | "zoom"
  | "children"
  | "onZoomIn"
  | "onZoomOut"
  | "onReset"
  | "onExpand"
> & {
  title: string;
  zoom: number;
  children: React.ReactNode;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onExpand?: () => void;
}) {
  return (
    <div
      data-slot="diagram"
      className={cn(
        paper,
        "flex w-full max-w-md flex-col overflow-hidden rounded-2xl",
        className,
      )}

      {...props}
    >
      <div className="flex flex-wrap items-center gap-1 px-3 py-2">
        <span className="min-w-0 flex-1 wrap-anywhere text-sm font-medium">
          {title}
        </span>
        <span
          className={cn(mono, "text-muted-foreground shrink-0 tabular-nums")}
        >
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="sm"
          type="button"
          aria-label="Zoom out"
          onClick={onZoomOut}
          disabled={!onZoomOut}
          className={cn(cn(ghostButton, "size-7 shrink-0"), "p-0")}
        >
          <MinusIcon className="size-3.5" />
        </Button>
        <Button variant="ghost" size="sm"
          type="button"
          aria-label="Zoom in"
          onClick={onZoomIn}
          disabled={!onZoomIn}
          className={cn(cn(ghostButton, "size-7 shrink-0"), "p-0")}
        >
          <PlusIcon className="size-3.5" />
        </Button>
        <Button variant="ghost" size="sm"
          type="button"
          aria-label="Reset the view"
          onClick={onReset}
          disabled={!onReset}
          className={cn(cn(ghostButton, "size-7 shrink-0"), "p-0")}
        >
          <RotateCcwIcon className="size-3.5" />
        </Button>
        <Button variant="ghost" size="sm"
          type="button"
          aria-label="Open full screen"
          onClick={onExpand}
          disabled={!onExpand}
          className={cn(cn(
            ghostButton,
            "size-7 shrink-0 disabled:pointer-events-none disabled:opacity-30",
          ), "p-0")}
        >
          <MaximizeIcon className="size-3.5" />
        </Button>
      </div>

      <div className="border-foreground/[0.07] flex min-h-[10rem] items-center justify-center overflow-hidden border-t p-4">
        <div
          className="min-w-0 max-w-full transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${18.25 * zoom}rem` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
