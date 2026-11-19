"use client";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { ghostButton, mono, paper } from "./surfaces";
import { clamp } from "../utils/range";

export type VoiceMode = "connecting" | "listening" | "thinking" | "speaking";

export interface VoiceTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const CAPTION: Record<VoiceMode, string> = {
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

const HINT: Record<VoiceMode, string> = {
  connecting: "Opening the mic",
  listening: "Listening for you",
  thinking: "Working on it",
  speaking: "Playing the reply",
};

export function VoiceConversation({
  mode,
  variant = "card",
  amplitude,
  transcript,
  muted,
  onToggleMute,
  onInterrupt,
  onPlay,
  onEnd,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "mode"
  | "amplitude"
  | "transcript"
  | "muted"
  | "onToggleMute"
  | "onInterrupt"
  | "onPlay"
  | "onEnd"
> & {
  mode: VoiceMode;
  variant?: "card" | "inline";
  amplitude: number;
  transcript: readonly VoiceTurn[];
  muted?: boolean;
  onToggleMute?: () => void;
  onInterrupt?: () => void;
  onPlay?: () => void;
  onEnd?: () => void;
}) {
  const level = clamp(amplitude, 0, 1);
  const active = mode === "listening" || mode === "speaking";
  const canInterrupt = mode === "speaking" && onInterrupt !== undefined;
  const canPlay = mode === "listening" && onPlay !== undefined;

  const orb = (<Button variant="ghost" size="sm"
        type="button"
        onClick={canInterrupt ? onInterrupt : onPlay}
        disabled={!canInterrupt && !canPlay}
        aria-label={canPlay ? "播放语音回复示例" : "Interrupt the assistant"}
        title={canPlay ? "播放语音回复示例" : canInterrupt ? "点击中断语音回复" : undefined}
        data-slot="voice-orb"
        className={cn("focus-visible:ring-ring/50 relative flex size-24 items-center justify-center rounded-full outline-none focus-visible:ring-3 disabled:cursor-default", variant === "inline" && "size-36 shrink-0 disabled:opacity-100 [@media(max-height:32rem)]:size-24")}
      >
        <span
          aria-hidden
          className={cn(
            "absolute rounded-full transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            mode === "speaking"
              ? "bg-primary/12 bg-primary/15"
              : "bg-foreground/[0.05]",
          )}
          style={{
            width: variant === "inline" ? "100%" : "6rem",
            height: variant === "inline" ? "100%" : "6rem",
            transform: `scale(${active ? 0.72 + level * 0.28 : 0.62})`,
            opacity: active ? 1 : 0.5,
          }}
        />
        <span
          aria-hidden
          className={cn(
            "absolute rounded-full transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            mode === "speaking"
              ? "bg-primary/20 bg-primary/25"
              : "bg-foreground/[0.08]",
          )}
          style={{
            width: variant === "inline" ? "70.8333%" : "4.25rem",
            height: variant === "inline" ? "70.8333%" : "4.25rem",
            transform: `scale(${active ? 0.8 + level * 0.22 : 0.7})`,
          }}
        />
        <span
          aria-hidden
          className={cn(
            "relative size-10 rounded-full transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            mode === "connecting" && "bg-foreground/20 animate-pulse",
            mode === "listening" && "bg-foreground/80",
            mode === "thinking" && "bg-foreground/30 animate-pulse",
            mode === "speaking" && "bg-primary bg-primary",
            variant === "inline" && "absolute",
          )}
          style={{ transform: `scale(${active ? 0.9 + level * 0.2 : 0.85})`, ...(variant === "inline" ? { width: "41.6667%", height: "41.6667%" } : {}) }}
        />
      </Button>);
  const muteButton = (<Button variant="ghost" size="sm"
          type="button"
          aria-label={
            muted ? "Turn the microphone on" : "Turn the microphone off"
          }
          aria-pressed={muted}
          onClick={onToggleMute}
          disabled={!onToggleMute}
          className={cn(
            ghostButton,
            "size-10 disabled:pointer-events-none disabled:opacity-30",
            muted && "bg-foreground/[0.08] text-foreground/90",
          )}
        >
          {muted ? (
            <MicOffIcon className="size-4" />
          ) : (
            <MicIcon className="size-4" />
          )}
        </Button>);
  const endButton = (<Button variant="ghost" size="sm"
          type="button"
          aria-label="End the call"
          onClick={onEnd}
          disabled={!onEnd}
          className={cn(ghostButton, "size-10 disabled:pointer-events-none disabled:opacity-30")}
        >
          <PhoneOffIcon className="size-4 text-danger" />
        </Button>);

  if (variant === "inline") return (
    <div data-slot="voice-conversation" data-variant="inline" data-mode={mode} data-amplitude={level.toFixed(3)} className={cn("flex w-full items-center justify-center gap-3", className)} {...props}>
      {muteButton}{orb}{endButton}
      <span className="sr-only" role="status">{muted ? "Mic off" : CAPTION[mode]}</span>
    </div>
  );

  return (
    <div
      data-slot="voice-conversation"
      className={cn(
        paper,
        "flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl px-5 py-5",
        className,
      )}

      {...props}
    >
      {orb}

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium">{CAPTION[mode]}</span>
        <span className={cn(mono, "text-muted-foreground")}>
          {muted ? "Mic off" : canInterrupt ? "Tap to interrupt" : HINT[mode]}
        </span>
      </div>

      <div className="flex min-h-[4.5rem] w-full flex-col gap-1.5">
        {transcript.map((turn) => (
          <div
            key={turn.id}
            className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex gap-2 text-xs leading-relaxed duration-300"
          >
            <span
              className={cn(
                mono,
                "w-8 shrink-0",
                turn.role === "user"
                  ? "text-muted-foreground"
                  : "text-primary/70 text-primary/70",
              )}
            >
              {turn.role === "user" ? "you" : "ai"}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 break-words",
                turn.role === "user"
                  ? "text-muted-foreground"
                  : "text-foreground/80",
              )}
            >
              {turn.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">{muteButton}{endButton}</div>
    </div>
  );
}
