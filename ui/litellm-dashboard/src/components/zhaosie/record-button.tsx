"use client";

import { MicIcon, SquareIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/cva.config";

export type RecordButtonProps = Omit<ButtonProps, "children" | "variant" | "size"> & { recording?: boolean };

/** Controlled presentation. Audio capture belongs to the consuming application. */
export function RecordButton({ recording = false, className, ...props }: RecordButtonProps) {
  return (
    <Button
      size="icon"
      className={cn("zhaosie-record-button", className)}
      data-recording={recording}
      aria-label={recording ? "停止记录" : "开始记录"}
      aria-pressed={recording}
      {...props}
    >
      {recording ? <SquareIcon className="size-8 fill-current" aria-hidden="true" /> : <MicIcon className="size-14" aria-hidden="true" />}
    </Button>
  );
}
