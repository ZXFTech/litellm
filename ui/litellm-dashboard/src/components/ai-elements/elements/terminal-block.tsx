"use client";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../connected/ui/tooltip";

import { useId, useRef, useState, type ComponentProps } from "react";
import { CircleCheckIcon, CircleDotIcon, CircleHelpIcon, CircleStopIcon, CircleXIcon, CopyIcon, Loader2Icon, SquareIcon, TerminalIcon } from "lucide-react";
import { useCopyToClipboard } from "../examples/use-copy";
import { cn } from "@/lib/cva.config";
import { clamp, take } from "../utils/range";
import { isTerminalPending, resolveTerminalLogStatus, terminalLogLabels, terminalSessionLabels, type TerminalLogStatus, type TerminalSessionStatus } from "./terminal-state";
export type { TerminalLogStatus, TerminalSessionStatus } from "./terminal-state";
export { readTerminalTheme, observeTerminalTheme } from "./terminal-theme";
export type { TerminalThemeSnapshot } from "./terminal-theme";

export type AnsiColor =
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97;

export type AnsiSegment = {
  text: string;
  color?: AnsiColor | undefined;
  bold: boolean;
  dim: boolean;
};

const ANSI_COLORS = new Set<AnsiColor>([
  30, 31, 32, 33, 34, 35, 36, 37, 90, 91, 92, 93, 94, 95, 96, 97,
]);

const findCsiEnd = (line: string, start: number) => {
  for (let index = start; index < line.length; index += 1) {
    const code = line.charCodeAt(index);
    if (code >= 0x40 && code <= 0x7e) return index;
  }
  return line.length;
};

const findStringEnd = (line: string, start: number, bell: boolean) => {
  for (let index = start; index < line.length; index += 1) {
    if (bell && line[index] === "\u0007") return index + 1;
    if (line[index] === "\u001b" && line[index + 1] === "\\") {
      return index + 2;
    }
  }
  return line.length;
};

const applySgr = (value: string, state: Omit<AnsiSegment, "text">) => {
  const parts = value.split(";");
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const code = part === "" ? 0 : Number(part);
    if (code === 38 || code === 48) {
      index += parts[index + 1] === "2" ? 4 : parts[index + 1] === "5" ? 2 : 1;
    } else if (code === 0) {
      state.color = undefined;
      state.bold = false;
      state.dim = false;
    } else if (code === 1) {
      state.bold = true;
    } else if (code === 2) {
      state.dim = true;
    } else if (code === 22) {
      state.bold = false;
      state.dim = false;
    } else if (code === 39) {
      state.color = undefined;
    } else if (ANSI_COLORS.has(code as AnsiColor)) {
      state.color = code as AnsiColor;
    }
  }
};

export function parseAnsi(line: string): AnsiSegment[] {
  const state: Omit<AnsiSegment, "text"> = {
    color: undefined,
    bold: false,
    dim: false,
  };
  const segments: AnsiSegment[] = [];
  let index = 0;

  const append = (text: string) => {
    if (text === "") return;
    const previous = segments[segments.length - 1];
    if (
      previous &&
      previous.color === state.color &&
      previous.bold === state.bold &&
      previous.dim === state.dim
    ) {
      previous.text += text;
      return;
    }
    segments.push({ text, ...state });
  };

  while (index < line.length) {
    const escape = line.indexOf("\u001b", index);
    const c1Offset = line.slice(index).search(/[\u009b\u009d]/);
    const c1 = c1Offset === -1 ? -1 : index + c1Offset;
    const next = escape === -1 ? c1 : c1 === -1 ? escape : Math.min(escape, c1);

    if (next === -1) {
      append(line.slice(index));
      break;
    }

    append(line.slice(index, next));
    const csi = line[next] === "\u009b" || line[next + 1] === "[";
    const osc = line[next] === "\u009d" || line[next + 1] === "]";

    if (csi) {
      const start = next + (line[next] === "\u001b" ? 2 : 1);
      const end = findCsiEnd(line, start);
      if (end === line.length) break;
      if (line[end] === "m") applySgr(line.slice(start, end), state);
      index = end + 1;
    } else if (osc) {
      index = findStringEnd(
        line,
        next + (line[next] === "\u001b" ? 2 : 1),
        true,
      );
    } else if (
      line[next] === "\u001b" &&
      ["P", "^", "_"].includes(line[next + 1] ?? "")
    ) {
      index = findStringEnd(line, next + 2, false);
    } else {
      index =
        line[next] === "\u001b" &&
        ["(", ")", "*", "+", "-", ".", "/"].includes(line[next + 1] ?? "")
          ? next + 3
          : next + 2;
    }
  }

  return segments;
}

const formatDuration = (durationMs: number) => {
  const duration = Math.floor(clamp(durationMs, 0, Number.MAX_SAFE_INTEGER));
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60_000) {
    const seconds = Math.round(duration / 100) / 10;
    return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(duration / 60_000);
  const seconds = Math.floor((duration % 60_000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};

const plainText = (line: string) =>
  parseAnsi(line)
    .map((segment) => segment.text)
    .join("");

/** Shared shell; embedded layout delegates the boundary to its host. */
export function TerminalFrame({ layout = "standalone", variant = "paper", className, ...props }: ComponentProps<"div"> & {
  layout?: "standalone" | "embedded";
  variant?: "paper" | "ink";
}) {
  return <div data-slot="terminal-frame" data-layout={layout} data-variant={variant}
    className={cn("terminal-frame group/terminal flex min-h-0 min-w-0 max-w-full flex-col", layout === "standalone" ? "w-full" : "size-full", className)} {...props} />;
}

/** Paths wrap; constrained headers scroll without consuming the whole body. */
export function TerminalHeader({ className, children, tabIndex = 0, ...props }: ComponentProps<"div">) {
  return <div data-slot="terminal-header" tabIndex={tabIndex}
    className={cn("terminal-header min-h-0 min-w-0 shrink-0 overflow-y-auto wrap-anywhere outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50", className)} {...props}>
    <TerminalIcon aria-hidden="true" className="terminal-heading-icon size-3.5 shrink-0" />
    <div data-slot="terminal-header-content" className="flex min-w-0 flex-1 flex-wrap items-center justify-between">{children}</div>
  </div>;
}

/** Engine mode delegates all body scrolling, selection and input to the engine. */
export function TerminalViewport({ scroll = "content", className, ...props }: ComponentProps<"div"> & { scroll?: "engine" | "content" }) {
  return <div data-slot="terminal-viewport" data-scroll={scroll}
    className={cn("terminal-viewport min-h-0 min-w-0 flex-1", scroll === "engine" ? "overflow-hidden" : "overflow-y-auto", className)} {...props} />;
}

function TerminalStateIcon({ status, command = false }: { status: TerminalLogStatus | TerminalSessionStatus; command?: boolean }) {
  const spinning = status === "starting" || status === "stopping" || (command && status === "running");
  const Icon = spinning ? Loader2Icon : status === "running" ? CircleDotIcon : status === "unknown" ? CircleHelpIcon : status === "failed" ? CircleXIcon : status === "done" ? CircleCheckIcon : status === "ended" ? CircleStopIcon : SquareIcon;
  return <Icon aria-hidden="true" className={cn("size-3 shrink-0", spinning && "animate-spin motion-reduce:animate-none")} />;
}

/** Controlled shell lifetime, rendered without a badge surface. */
export function TerminalStatus({ status, exitCode, message, className, tabIndex = 0, ...props }: Omit<ComponentProps<"div">, "children"> & {
  status: TerminalSessionStatus;
  exitCode?: number;
  message?: string;
}) {
  const terminal = status === "ended" || status === "failed";
  return <div role="status" data-slot="terminal-status" data-state={status} data-terminal-state={status} tabIndex={tabIndex}
    className={cn("terminal-session-status min-w-0 shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)} {...props}>
    <span data-slot="terminal-state" data-terminal-state={status} className="terminal-state"><TerminalStateIcon status={status} />{terminalSessionLabels[status]}
      {terminal && exitCode !== undefined ? <span>· exit {exitCode}</span> : null}
    </span>
    {message ? <span className="sr-only">{message}</span> : null}
  </div>;
}

/** A single-line title; its full value is available on hover and keyboard focus. */
export function TerminalTitle({ children }: { children: string }) {
  const [open, setOpen] = useState(false);
  return <TooltipProvider><Tooltip open={open} onOpenChange={setOpen}>
    <TooltipTrigger render={<button type="button" />} closeOnClick={false} onClick={() => setOpen(true)} aria-label={children} className="terminal-session-title cursor-pointer">
      {children}
    </TooltipTrigger>
    <TooltipContent><span className="whitespace-pre-wrap wrap-anywhere">{children}</span></TooltipContent>
  </Tooltip></TooltipProvider>;
}

/** Session composition keeps status at the right without changing the log header. */
export function TerminalSessionHeader({ title, status, exitCode, className, ...props }: Omit<ComponentProps<typeof TerminalHeader>, "title" | "children"> & {
  title: string;
  status: TerminalSessionStatus;
  exitCode?: number;
}) {
  return <TerminalHeader tabIndex={-1} className={cn("terminal-session-header", className)} {...props}>
    <TerminalTitle>{title}</TerminalTitle>
    <TerminalStatus status={status} exitCode={exitCode} tabIndex={-1} />
  </TerminalHeader>;
}

/** Only an error entry occupies the bottom row; details never shrink the viewport. */
export function TerminalErrorDetails({ message }: { message: string }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const focusContentOnMount = useRef(false);
  return <div data-slot="terminal-error-details" className="terminal-error-details">
    <HoverCard open={open} onOpenChange={(nextOpen, details) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        focusContentOnMount.current = false;
        if (details.reason === "escape-key") triggerRef.current?.focus();
      }
    }}>
      <HoverCardTrigger variant="ghost" size="xs" render={<Button ref={triggerRef} variant="ghost" size="xs" />}
        className="terminal-error-trigger hover:text-[var(--terminal-error)] aria-expanded:text-[var(--terminal-error)]" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? contentId : undefined}
        onClick={(event) => {
          if (event.detail === 0) {
            if (contentRef.current) contentRef.current.focus();
            else focusContentOnMount.current = true;
          }
          setOpen(true);
        }}>
        <CircleXIcon aria-hidden="true" data-icon="inline-start" />查看错误信息
      </HoverCardTrigger>
      <HoverCardContent id={contentId} role="dialog" aria-label="终端错误信息" tabIndex={0} side="top" align="end"
        ref={(element) => {
          contentRef.current = element;
          if (element && focusContentOnMount.current) {
            focusContentOnMount.current = false;
            element.focus();
          }
        }}>
        <p className="font-medium">错误信息</p>
        <p className="mt-2 whitespace-pre-wrap wrap-anywhere">{message}</p>
      </HoverCardContent>
    </HoverCard>
  </div>;
}

export type TerminalBlockProps = Omit<ComponentProps<"div">, "children"> & {
  command: string;
  lines: readonly string[];
  visibleCount: number;
  done: boolean;
  status?: TerminalLogStatus;
  /** Ordered mixed streams take precedence over lines/stderr. */
  outputLines?: readonly { text: string; stream: "stdout" | "stderr" }[];
  variant?: "paper" | "ink";
  exitCode?: number;
  stderr?: readonly string[];
  cwd?: string;
  durationMs?: number;
  truncated?: boolean;
  maxCollapsedLines?: number;
  allowCopy?: boolean;
};

/** Log adapter composed from the same shell as interactive engines. */
export function TerminalBlock({ command, lines, visibleCount, done: doneProp, status, outputLines, variant = "paper", exitCode, stderr, cwd, durationMs, truncated, maxCollapsedLines, allowCopy = true, className, ...props }: TerminalBlockProps) {
  const state = resolveTerminalLogStatus(doneProp, exitCode, status);
  const done = !isTerminalPending(state);
  const output = outputLines?.map(({ text, stream }) => ({ line: text, stderr: stream === "stderr" })) ?? [
    ...lines.map((line) => ({ line, stderr: false })),
    ...(stderr ?? []).map((line) => ({ line, stderr: true })),
  ];
  const revealedLines = take(output, visibleCount);
  const collapsedLines = Math.floor(clamp(maxCollapsedLines ?? revealedLines.length, 0, revealedLines.length));
  const canCollapse = done && maxCollapsedLines !== undefined && revealedLines.length > collapsedLines;
  const [expanded, setExpanded] = useState(false);
  const displayedLines = canCollapse && !expanded ? take(revealedLines, collapsedLines) : revealedLines;
  const outputId = useId();
  const copy = useCopyToClipboard();
  return <TerminalFrame variant={variant} className={className} {...props} data-slot="terminal-block" data-state={state} data-terminal-state={state}>
    <TerminalHeader>
      <span data-slot="terminal-command" className="min-w-0 flex-auto wrap-anywhere">{cwd ? <span className="terminal-metadata">{cwd} $ </span> : null}{command || "无命令"}</span>
      <div data-slot="terminal-actions" className="flex min-w-0 flex-wrap items-center">
        <span role="status" data-slot="terminal-state" data-terminal-state={state} className="terminal-state">
          <TerminalStateIcon status={state} command />{terminalLogLabels[state]}
          {(state === "done" || state === "failed") && exitCode !== undefined ? <span>· exit {exitCode}</span> : null}
        </span>
        {done && durationMs !== undefined ? <span className="terminal-metadata">{formatDuration(durationMs)}</span> : null}
        {allowCopy && output.length > 0 ? <Button variant="ghost" size="icon-xs" type="button" aria-label="复制输出" disabled={copy.busy} aria-busy={copy.loading || undefined}
          onClick={() => void copy.copyToClipboard(output.map(({ line }) => plainText(line)).join("\n"))}
          className="terminal-copy">
          {copy.buttonStatus() !== "idle" ? <ButtonFeedbackIcon status={copy.buttonStatus()} /> : <CopyIcon aria-hidden="true" />}
        </Button> : null}
      </div>
    </TerminalHeader>
    <TerminalViewport className="terminal-log flex min-h-[8.5rem] flex-col gap-1">
      <div id={outputId} className="flex min-w-0 flex-col gap-1">
        {displayedLines.map(({ line, stderr: isStderr }, index) => <div key={index} data-stream={isStderr ? "stderr" : "stdout"} className="wrap-anywhere whitespace-pre-wrap">
          <span className="sr-only">{isStderr ? "stderr" : "stdout"}: </span>
          {parseAnsi(line).map((segment, segmentIndex) => <span key={segmentIndex} data-ansi-color={!isStderr ? segment.color : undefined} className={cn(segment.bold && "font-bold", segment.dim && "opacity-60")}>{segment.text}</span>)}
        </div>)}
        {revealedLines.length === 0 ? <p className="terminal-message">{done ? "暂无输出。" : "等待输出…"}</p> : null}
      </div>
      {canCollapse ? <Button variant="ghost" size="sm" type="button" aria-expanded={expanded} aria-controls={outputId} onClick={() => setExpanded(value => !value)} className="terminal-copy self-start">{expanded ? "收起输出" : "展开全部 " + revealedLines.length + " 行"}</Button> : null}
      {truncated ? <p className="terminal-warning">输出已截断，仅展示保留的记录。</p> : null}
      {copy.status !== "idle" ? <p role={copy.status === "error" ? "alert" : "status"} className="terminal-message" data-feedback={copy.status}>{copy.status === "error" ? "复制失败，请检查剪贴板权限后重试。" : copy.status === "success" ? "已复制完整输出。" : "正在复制输出。"}</p> : null}
      {!done ? <span aria-hidden="true" className="terminal-log-cursor inline-block h-3 w-1.5 animate-pulse motion-reduce:animate-none" /> : null}
    </TerminalViewport>
  </TerminalFrame>;
}
