"use client";

import { Button } from "@/components/ui/button";
import { AiAsyncButton, useAiActionController } from "../examples/action-scope";

import type { ComponentProps } from "react";
import { ArrowUpIcon, MicIcon, PlusIcon, SquareIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field, ghostButton,  mono } from "./surfaces";

export function MobileComposer({
  value,
  keyboardOpen,
  running,
  actions,
  onAction,
  onAttach,
  onValueChange,
  onSend,
  onStop,
  onFocus,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "value"
  | "keyboardOpen"
  | "running"
  | "actions"
  | "onAction"
  | "onAttach"
  | "onValueChange"
  | "onSend"
  | "onStop"
  | "onFocus"
> & {
  value: string;
  keyboardOpen: boolean;
  running: boolean;
  actions: readonly string[];
  onAction?: (action: string) => void;
  onAttach?: () => void;
  onValueChange?: (value: string) => void;
  onSend?: () => void;
  onStop?: () => void;
  onFocus?: () => void;
}) {
  const demoAction = useAiActionController();
  return (
    <div
      data-slot="mobile-composer"
      className={cn(
        "bg-background border-foreground/[0.07] flex w-full max-w-[19rem] flex-col gap-2.5 rounded-t-[20px] border-t px-3 pt-3",
        keyboardOpen ? "pb-3" : "pb-6",
        className,
      )}

      {...props}
    >
      {!keyboardOpen && (
        <div className="fade-in animate-in flex flex-wrap gap-1.5 pb-0.5 duration-200">
          {actions.map((action) => (
            <Button variant="ghost" size="sm"
              key={action}
              type="button"
              onClick={() => onAction?.(action)}
              disabled={!onAction || demoAction.busy}
              className={cn(cn(
                "disabled:pointer-events-none",
                field,
                "text-foreground/60 shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap",
              ), "h-auto min-h-7 whitespace-normal")}
            >
              {action}
            </Button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <Button variant="ghost" size="sm"
          type="button"
          aria-label="Add an attachment"
          onClick={() => { demoAction.notify("附件选择交互已触发；当前示例不读取设备文件。"); onAttach?.(); }}
          disabled={!onAttach}
          className={cn(cn(
            ghostButton,
            field,
            "size-9 shrink-0 disabled:pointer-events-none disabled:opacity-30",
          ), "p-0")}
        >
          <PlusIcon className="size-4" />
        </Button>

        <div
          className={cn(
            field,
            "flex min-w-0 flex-1 items-center gap-2 rounded-[18px] px-3 py-2",
          )}
        >
          <input
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
            onFocus={onFocus}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) return;
              if (
                event.nativeEvent.isComposing ||
                event.nativeEvent.keyCode === 229
              )
                return;
              event.preventDefault();
              if (!running && !demoAction.busy && value.trim() && onSend) demoAction.run(onSend, "发送消息", "mobile-send");
            }}
            placeholder="Message"
            aria-label="Message"
            readOnly={demoAction.busy || !onValueChange}
            className="text-foreground/85 placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-[16px] outline-none"
          />
          {value === "" && (
            <MicIcon className="text-muted-foreground size-4 shrink-0" />
          )}
        </div>

        {(onSend || onStop) && (
          <AiAsyncButton actionKey="mobile-send" asyncAction={!running} variant="default" size="sm"
            type="button"
            aria-label={running ? "Stop" : "Send"}
            onClick={running ? onStop : onSend}
            disabled={running ? !onStop : !onSend || !value.trim()}
            className={cn(cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full disabled:pointer-events-none disabled:opacity-25",
            ), "p-0")}
          >
            {running ? (
              <SquareIcon className="size-3 fill-current" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </AiAsyncButton>
        )}
      </div>

      {!keyboardOpen && (
        <span
          aria-hidden
          className="bg-foreground/15 mx-auto h-1 w-28 rounded-full"
        />
      )}

      {keyboardOpen && (
        <span className={cn(mono, "text-muted-foreground text-center")}>
          return to send
        </span>
      )}
    </div>
  );
}
