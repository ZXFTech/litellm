"use client";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import {  paper } from "./surfaces";

export function EmptyState({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex w-full max-w-md flex-col items-center gap-7",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyStateGreeting({
  className,
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="empty-state-greeting"
      className={cn(
        "fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-center text-2xl font-medium tracking-tight duration-500 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyStateSuggestions({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-suggestions"
      className={cn("flex flex-wrap justify-center gap-2", className)}
      {...props}
    />
  );
}

export function EmptyStateSuggestion({
  index = 0,
  className,
  style,
  ...props
}: ComponentProps<"button"> & { index?: number }) {
  return (
    <Button variant="ghost" size="sm"
      type="button"
      data-slot="empty-state-suggestion"
      style={{ animationDelay: `${120 + index * 70}ms`, ...style }}
      className={cn(
        paper,
        "fade-in slide-in-from-bottom-2 animate-in fill-mode-both focus-visible:ring-ring/50 rounded-full px-4 py-2 text-sm transition-transform duration-500 outline-none hover:-translate-y-px focus-visible:ring-3 active:scale-[0.96] motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyStateComposer({
  placeholder,
  onSend,
  className,
  style,
  ...props
}: Omit<ComponentProps<"div">, "children" | "placeholder"> & {
  placeholder: string;
  onSend?: () => void;
}) {
  return (
    <div
      data-slot="empty-state-composer"
      style={{ animationDelay: "360ms", ...style }}
      className={cn(
        paper,
        "fade-in slide-in-from-bottom-2 animate-in fill-mode-both flex h-13 w-full items-center justify-between rounded-full py-2 ps-5 pe-2.5 duration-500 motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <span className="text-muted-foreground text-[15px]">{placeholder}</span>
      <Button variant="default" size="sm"
        type="button"
        aria-label="Send"
        onClick={onSend}
        disabled={!onSend}
        className={cn(cn(
                    "flex size-8 items-center justify-center rounded-full disabled:pointer-events-none disabled:opacity-30",
        ), "p-0")}
      >
        <ArrowUpIcon className="size-4" />
      </Button>
    </div>
  );
}
