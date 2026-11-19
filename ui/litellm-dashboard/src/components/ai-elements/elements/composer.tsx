"use client";

import { AiAsyncButton, useAiActionController } from "../examples/action-scope";
import { Button } from "@/components/ui/button";

import {
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  FileArchiveIcon,
  FileImageIcon,
  FileTextIcon,
  Loader2Icon,
  MicIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cva.config";
import {
  field,
  floating,
  ghostButton,
  inkButton,
  iconSwap,
  iconSwapIn,
  iconSwapOut,
    mono,
  paper,
  ShimmerLabel,
} from "./surfaces";
import { clamp, pct } from "../utils/range";

export interface ComposerAttachment {
  name: string;
  meta: string;
  state: "uploading" | "done" | "error";
  progress?: number;
  kind?: "image" | "text" | "archive";
}

export interface ComposerCommand {
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface ComposerPerson {
  name: string;
  role: "agent" | "human";
}

export interface ComposerModel {
  name: string;
  meta: string;
}

export interface ComposerUsage {
  system: number;
  tools: number;
  messages: number;
  total: number;
}

const ATTACHMENT_ICONS: Record<
  NonNullable<ComposerAttachment["kind"]>,
  LucideIcon
> = {
  image: FileImageIcon,
  text: FileTextIcon,
  archive: FileArchiveIcon,
};

const BARS = Array.from({ length: 14 }, (_, i) => i);

function barHeight(bar: number, tick: number): number {
  return 5 + Math.abs(Math.sin(bar * 1.35 + tick * 0.55)) * 13;
}

/** Commands whose name starts with the slash query, or none when not typing one. */
export function useSlashMatches(
  value: string,
  commands: readonly ComposerCommand[] | undefined,
): ComposerCommand[] {
  return useMemo(() => {
    if (!commands || !value.startsWith("/")) return [];
    const query = value.slice(1).toLowerCase();
    return commands.filter((command) => command.name.startsWith(query));
  }, [commands, value]);
}

/** People matching a trailing @mention, or none when the caret is not in one. */
export function useMentionMatches(
  value: string,
  people: readonly ComposerPerson[] | undefined,
): ComposerPerson[] {
  return useMemo(() => {
    if (!people) return [];
    const match = /@([\w]*)$/.exec(value);
    if (!match) return [];
    const query = match[1]?.toLowerCase() ?? "";
    return people.filter((person) =>
      person.name.toLowerCase().startsWith(query),
    );
  }, [people, value]);
}

/** Replaces the trailing @mention with the chosen name. */
export function applyMention(value: string, name: string): string {
  return value.replace(/@[\w]*$/, `@${name} `);
}

export function Composer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="composer"
      className={cn("relative w-full max-w-lg", className)}
      {...props}
    />
  );
}

export function ComposerBar({
  dragActive = false,
  className,
  ...props
}: ComponentProps<"div"> & { dragActive?: boolean }) {
  return (
    <div
      data-slot="composer-bar"
      data-drag-active={dragActive || undefined}
      className={cn(
        paper,
        "flex w-full flex-col gap-2 rounded-[24px] p-2.5 transition-colors",
        dragActive && "bg-primary/[0.04] bg-primary/10",
        className,
      )}
      {...props}
    />
  );
}

function useFitInComposer(
  menuRef: RefObject<HTMLDivElement | null>,
  align: "start" | "end",
) {
  const [fit, setFit] = useState<{ shift: number; maxWidth: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return undefined;
    const bounds =
      menu.closest<HTMLElement>('[data-slot="composer"]') ??
      document.documentElement;
    const measure = () => {
      const parent = menu.offsetParent;
      if (!parent) return;
      const { left: min, right: max } = bounds.getBoundingClientRect();
      const left = parent.getBoundingClientRect().left + menu.offsetLeft;
      const width = Math.min(menu.offsetWidth, max - min);
      const shift = Math.max(min - left, Math.min(0, max - left - width));
      setFit((current) =>
        current?.shift === shift && current.maxWidth === max - min
          ? current
          : { shift, maxWidth: max - min },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bounds);
    observer.observe(menu);
    return () => observer.disconnect();
  }, [menuRef, align]);

  return fit;
}

export const ComposerMenu = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & { open: boolean; align?: "start" | "end" }
>(function ComposerMenu(
  { open, align = "start", className, style, ...props },
  ref,
) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fit = useFitInComposer(menuRef, align);
  const composedRef = useCallback(
    (node: HTMLDivElement | null) => {
      menuRef.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref],
  );

  return (
    <div
      ref={composedRef}
      data-slot="composer-menu"
      inert={!open}
      aria-hidden={!open || undefined}
      data-open={open || undefined}
      style={
        fit
          ? { maxWidth: fit.maxWidth, translate: `${fit.shift}px 0`, ...style }
          : style
      }
      className={cn(
        floating,
        "absolute bottom-full z-10 mb-2 flex w-72 flex-col gap-0.5 rounded-2xl p-1.5",
        align === "start"
          ? "start-0 origin-bottom-left"
          : "end-0 origin-bottom-right",
        "transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        open
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-[0.97] opacity-0",
        className,
      )}
      {...props}
    />
  );
});

export function ComposerMenuItem({
  active = false,
  className,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  const action = useAiActionController();
  return (
    <Button variant="ghost" size="sm"
      type="button"
      data-slot="composer-menu-item"
      data-active={active || undefined}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-sm transition-colors",
        active ? field : "hover:bg-foreground/[0.04]",
        className,
      )}
      {...props}
      disabled={props.disabled || action.busy}
    />
  );
}

export function ComposerCommandItem({
  command,
  active,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  command: ComposerCommand;
  active: boolean;
}) {
  return (
    <ComposerMenuItem active={active} {...props}>
      <command.icon className="text-muted-foreground size-3.5 shrink-0" />
      <span className="font-medium">/{command.name}</span>
      <span className="text-muted-foreground flex-1 truncate text-start text-xs">
        {command.description}
      </span>
      {active && (
        <kbd className="bg-foreground/[0.06] text-muted-foreground rounded px-1 font-mono text-[10px]">
          ↵
        </kbd>
      )}
    </ComposerMenuItem>
  );
}

export function ComposerPersonItem({
  person,
  active,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  person: ComposerPerson;
  active: boolean;
}) {
  return (
    <ComposerMenuItem active={active} {...props}>
      <span className="bg-foreground/[0.06] text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium">
        {person.name[0]}
      </span>
      <span className="flex-1 truncate text-start">{person.name}</span>
      <span className={cn(mono, "text-muted-foreground")}>{person.role}</span>
    </ComposerMenuItem>
  );
}

export function ComposerAttachments({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="composer-attachments"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  );
}

export function ComposerAttachmentChip({
  attachment,
  onRemove,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  attachment: ComposerAttachment;
  onRemove?: (name: string) => void;
}) {
  const Icon = ATTACHMENT_ICONS[attachment.kind ?? "text"];
  return (
    <div
      data-slot="composer-attachment"
      data-state={attachment.state}
      className={cn(
        field,
        "relative flex items-center gap-2.5 overflow-hidden rounded-[14px] py-1.5 ps-1.5 pe-2.5",
        className,
      )}
      {...props}
    >
      <span className="bg-background text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-[10px] dark:bg-background/10">
        <Icon className="size-4" />
      </span>
      <span className="flex flex-col">
        <span className="max-w-36 truncate text-xs font-medium">
          {attachment.name}
        </span>
        <span
          className={cn(
            "text-xs",
            attachment.state === "error"
              ? "text-destructive/80 text-destructive/80"
              : "text-muted-foreground",
          )}
        >
          {attachment.meta}
        </span>
      </span>
      <span className="ms-1 flex w-5 items-center justify-end">
        {attachment.state === "uploading" ? (
          <Loader2Icon className="text-muted-foreground size-3.5 animate-spin motion-reduce:animate-none" />
        ) : attachment.state === "done" && onRemove ? (
          <Button variant="ghost" size="sm"
            type="button"
            aria-label={`Remove ${attachment.name}`}
            onClick={() => onRemove(attachment.name)}
            className={cn(cn(ghostButton, "size-5 [&_svg]:size-3"), "p-0")}
          >
            <XIcon />
          </Button>
        ) : attachment.state === "done" ? (
          <CheckIcon className="size-3.5 text-success" />
        ) : null}
      </span>
      {attachment.state === "uploading" && (
        <span
          role="progressbar"
          aria-label={`Uploading ${attachment.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct(attachment.progress ?? 0, 100))}
          className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/70 transition-[width] duration-300 bg-primary/70"
          style={{ width: `${pct(attachment.progress ?? 0, 100)}%` }}
        />
      )}
    </div>
  );
}

export function ComposerInput({
  onSubmit,
  onKeyDown,
  className,
  ...props
}: Omit<ComponentProps<"input">, "onSubmit"> & { onSubmit?: () => void }) {
  const action = useAiActionController();
  return (
    <input
      data-slot="composer-input"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (
          event.key !== "Enter" ||
          event.nativeEvent.isComposing ||
          event.nativeEvent.keyCode === 229
        )
          return;
        if (action.busy || !String(props.value ?? "").trim()) return;
        const value=String(props.value ?? "");
        if (/^\/\w*$/.test(value) || /@\w*$/.test(value)) onSubmit?.();
        else if (onSubmit) action.run(onSubmit,"发送消息");
      }}
      className={cn(
        "placeholder:text-muted-foreground min-h-11 w-full bg-transparent px-3 text-[15px] caret-primary outline-none",
        className,
      )}
      {...props}
      readOnly={props.readOnly || action.busy}
    />
  );
}

export function ComposerVoice({
  recording,
  seconds,
  connecting = false,
  levels,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  recording: boolean;
  seconds: number;
  connecting?: boolean;
  levels?: readonly number[];
}) {
  const bars = levels === undefined ? BARS : Array.from({ length: 48 }, (_, index) => index);
  return (
    <div
      data-slot="composer-voice"
      data-recording={recording || undefined}
      className={cn("flex min-h-11 w-full min-w-0 items-center gap-3 px-3", className)}
      {...props}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full bg-primary", recording && "animate-pulse motion-reduce:animate-none")} />
      <div data-slot="composer-waveform" data-transcribing={!recording || undefined} className="relative flex h-6 min-w-0 flex-1 items-center justify-between gap-px overflow-hidden" aria-hidden>
        {bars.map(bar => (
          <span
            key={bar}
            className={cn(
              "max-w-1 min-w-px flex-1 rounded-full transition-[height] duration-150 motion-reduce:transition-none",
              recording ? "bg-foreground/50" : "ai-transcribing-bar bg-primary",
            )}
            style={{ height: recording ? levels ? 3 + clamp(levels[bar] ?? 0, 0, 1) * 21 : barHeight(bar, seconds * 10) : 3, animationDelay: recording ? undefined : `${bar / (bars.length - 1) * 0.498}s` }}
          />
        ))}
      </div>
      <span className="w-20 shrink-0 text-end">{recording ? (
        <span className={cn(mono, "shrink-0 text-muted-foreground tabular-nums")}>
          {connecting ? "Connecting" : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}
        </span>
      ) : (
        <ShimmerLabel className="text-muted-foreground relative text-sm">
          Transcribing
        </ShimmerLabel>
      )}</span>
    </div>
  );
}

export function ComposerToolbar({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="composer-toolbar"
      className={cn("flex flex-wrap items-center justify-between gap-y-2", className)}
      {...props}
    />
  );
}

export function ComposerActions({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="composer-actions"
      className={cn("flex items-center gap-1.5 last:ms-auto", className)}
      {...props}
    />
  );
}

export function ComposerAttachButton({
  className,
  ...props
}: Omit<ComponentProps<"button">, "children">) {
  const action = useAiActionController();
  return (
    <Button variant="ghost" size="sm"
      type="button"
      aria-label="Add attachment"
      data-slot="composer-attach"
      disabled={!props.onClick}
      className={cn(cn(
        ghostButton,
        "size-8 disabled:pointer-events-none disabled:opacity-30",
        className,
      ), "p-0")}
      {...props}
      onClick={event=>{action.notify("附件选择交互已触发；当前示例不读取设备文件。");props.onClick?.(event);}}
    >
      <PlusIcon className="size-4" />
    </Button>
  );
}

export function ComposerModelTrigger({
  model,
  open,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  model: string;
  open: boolean;
}) {
  const action = useAiActionController();
  return (
    <Button variant="ghost" size="sm"
      type="button"
      aria-expanded={open}
      data-slot="composer-model-trigger"
      className={cn(
        "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground/90 dark:hover:bg-foreground/[0.09] flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] transition-colors",
        className,
      )}
      {...props}
      disabled={props.disabled || action.busy}
    >
      {model}
      <ChevronDownIcon className="size-3 opacity-60" />
    </Button>
  );
}

export function ComposerModelItem({
  entry,
  selected,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  entry: ComposerModel;
  selected: boolean;
}) {
  return (
    <ComposerMenuItem active={selected} {...props}>
      <span className="flex-1 text-start">{entry.name}</span>
      <span className={cn(mono, "text-muted-foreground tabular-nums")}>
        {entry.meta}
      </span>
      <span className="flex w-4 justify-end">
        {selected && (
          <CheckIcon className="fade-in zoom-in-90 animate-in size-3.5 duration-200" />
        )}
      </span>
    </ComposerMenuItem>
  );
}

export function ComposerContext({
  usage,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & { usage: ComposerUsage }) {
  const used = usage.system + usage.tools + usage.messages;
  const fraction = usage.total === 0 ? 0 : used / usage.total;
  const warn = fraction > 0.85;
  const circumference = 2 * Math.PI * 6;
  const segments = [
    { label: "System", value: usage.system, className: "bg-foreground/25" },
    { label: "Tools", value: usage.tools, className: "bg-foreground/45" },
    { label: "Messages", value: usage.messages, className: "bg-foreground/80" },
  ];

  return (
    <div
      data-slot="composer-context"
      className={cn("group/ctx relative", className)}
      {...props}
    >
      <div
        className={cn(
          floating,
          "absolute end-0 bottom-full z-10 mb-2 flex w-60 origin-bottom-right flex-col gap-3.5 rounded-2xl p-4",
          "transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          "pointer-events-none scale-[0.97] opacity-0",
          "group-hover/ctx:pointer-events-auto group-hover/ctx:scale-100 group-hover/ctx:opacity-100",
          "group-focus-within/ctx:pointer-events-auto group-focus-within/ctx:scale-100 group-focus-within/ctx:opacity-100",
        )}
      >
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Context</p>
          <p
            className={cn(
              mono,
              "tabular-nums",
              warn ? "text-destructive text-destructive" : "text-muted-foreground",
            )}
          >
            {Math.round(fraction * 100)}%
          </p>
        </div>
        <div className="bg-foreground/[0.06] inset-ring-border flex h-[5px] w-full gap-px overflow-hidden rounded-full inset-ring forced-colors:border">
          {segments.map((segment) => (
            <span
              key={segment.label}
              className={cn(
                "h-full transition-[width] duration-700 forced-color-adjust-none motion-reduce:transition-none",
                segment.className,
              )}
              style={{ width: `${pct(segment.value, usage.total)}%` }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="text-muted-foreground flex items-center gap-2.5 text-sm"
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full forced-color-adjust-none",
                  segment.className,
                )}
              />
              <span className="flex-1">{segment.label}</span>
              <span className={cn(mono, "text-muted-foreground tabular-nums")}>
                {segment.value}k
              </span>
            </div>
          ))}
        </div>
        <div className="bg-foreground/[0.06] h-px" />
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>Total</span>
          <span className={cn(mono, "text-muted-foreground tabular-nums")}>
            {used}k / {usage.total}k
          </span>
        </div>
      </div>
      <Button variant="ghost" size="sm"
        type="button"
        aria-label="Context usage"
        className={cn(cn(
          ghostButton,
          "size-8",
          warn && "text-destructive text-destructive",
        ), "p-0")}
      >
        <svg viewBox="0 0 16 16" className="size-4 -rotate-90" aria-hidden>
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            strokeWidth="2.5"
            className="stroke-border"
          />
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-current transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamp(fraction, 0, 1))}
          />
        </svg>
      </Button>
    </div>
  );
}

export function ComposerVoiceButton({
  active,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & { active: boolean }) {
  const action = useAiActionController();
  return (
    <Button variant={active ? "default" : "ghost"} size="sm"
      type="button"
      aria-label={active ? "Stop recording" : "Start voice input"}
      data-slot="composer-voice-button"
      className={cn(cn(
        active
          ? cn(
                            "flex size-8 items-center justify-center rounded-full",
            )
          : cn(ghostButton, "size-8"),
        className,
      ), "p-0")}
      {...props}
      disabled={props.disabled || (action.busy && !active)}
    >
      {active ? (
        <SquareIcon className="size-3 fill-current" />
      ) : (
        <MicIcon className="size-4" />
      )}
    </Button>
  );
}

export function ComposerSend({
  streaming,
  idle,
  asyncAction = true,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  streaming: boolean;
  idle: boolean;
  asyncAction?: boolean;
}) {
  return (
    <AiAsyncButton actionKey="composer-send" asyncAction={asyncAction && !streaming} variant={streaming || !idle ? "default" : "ghost"} size="sm"
      type="button"
      aria-label={streaming ? "Stop generating" : "Send message"}
      data-slot="composer-send"
      className={cn(cn(
        "grid size-8 place-items-center rounded-full",
        streaming || !idle
          ? inkButton
          : "bg-foreground/[0.06] text-muted-foreground inset-ring-border dark:bg-foreground/[0.09] inset-ring transition-colors forced-colors:border forced-colors:border-[GrayText] forced-colors:text-[GrayText]",
        className,
      ), "p-0")}
      {...props}
      disabled={props.disabled || (!streaming && idle)}
    >
      <ArrowUpIcon
        className={cn(iconSwap, "size-4", streaming ? iconSwapOut : iconSwapIn)}
      />
      <SquareIcon
        className={cn(
          iconSwap,
          "size-3 fill-current",
          streaming ? iconSwapIn : iconSwapOut,
        )}
      />
    </AiAsyncButton>
  );
}
