"use client";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { ChevronRightIcon, PlugIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field, mono, paper } from "./surfaces";

export type McpServerStatus =
  | "connected"
  | "connecting"
  | "needs-auth"
  | "failed";

export interface McpServer {
  id: string;
  name: string;
  transport: string;
  status: McpServerStatus;
  tools: readonly string[];
}

const DOT: Record<McpServerStatus, string> = {
  connected: "bg-success",
  connecting: "bg-foreground/30 animate-pulse",
  "needs-auth": "bg-warning",
  failed: "bg-destructive",
};

const LABEL: Record<McpServerStatus, string> = {
  connected: "connected",
  connecting: "connecting",
  "needs-auth": "needs auth",
  failed: "failed",
};

export function McpServerPanel({
  servers,
  expandedId,
  onToggle,
  onAuthorize,
  authorization,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "servers" | "expandedId" | "onToggle" | "onAuthorize"
> & {
  servers: readonly McpServer[];
  expandedId?: string;
  onToggle?: (id: string) => void;
  onAuthorize?: (id: string) => void;
  authorization?: AiRequestState;
}) {
  const connected = servers.filter(
    (server) => server.status === "connected",
  ).length;

  return (
    <div
      data-slot="mcp-server-panel"
      className={cn(
        paper,
        "flex w-full max-w-sm flex-col gap-1 rounded-2xl p-3",
        className,
      )}

      {...props}
    >
      <div className="flex items-baseline justify-between px-1 pb-1">
        <span className="text-sm font-medium">Servers</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {connected} of {servers.length} connected
        </span>
      </div>

      {servers.map((server) => {
        const expanded = expandedId === server.id;
        const rowClassName = cn(
          "flex items-center gap-2.5 rounded-xl px-1.5 py-2 text-start",
          onToggle && "hover:bg-foreground/[0.04] transition-colors",
        );
        const row = (
          <>
            <ChevronRightIcon
              className={cn(
                "text-muted-foreground size-3 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                expanded && "rotate-90",
              )}
            />
            <PlugIcon className="text-muted-foreground size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 wrap-anywhere text-sm">
              {server.name}
            </span>
            <span className={cn(mono, "text-muted-foreground shrink-0")}>
              {server.tools.length} tools
            </span>
            <span
              aria-hidden
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                DOT[server.status],
              )}
            />
            <span className="sr-only">{LABEL[server.status]}</span>
          </>
        );
        return (
          <div key={server.id} className="flex flex-col">
            {onToggle ? (
              <Button variant="ghost" size="sm"
                type="button"
                aria-expanded={expanded}
                onClick={() => onToggle(server.id)}
                className={cn(rowClassName, "h-auto min-h-7 whitespace-normal")}
              >
                {row}
              </Button>
            ) : (
              <div className={rowClassName}>{row}</div>
            )}

            {expanded && (
              <div className="fade-in slide-in-from-top-1 animate-in flex flex-col gap-1.5 px-1.5 ps-8 pb-2 duration-200">
                <div className="flex items-center gap-2">
                  <span className={cn(mono, "text-muted-foreground")}>
                    {server.transport}
                  </span>
                  <span className={cn(mono, "text-muted-foreground")}>
                    · {LABEL[server.status]}
                  </span>
                  {server.status === "needs-auth" && onAuthorize && (
                    <Button variant="ghost" size="sm"
                      type="button"
                      onClick={() => onAuthorize(server.id)}
                      disabled={authorization?.busy}
                      aria-busy={authorization?.status === "loading" || undefined}
                      className="ms-auto rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning transition-[background-color,scale] duration-150 hover:bg-warning/25 active:scale-[0.96] text-warning h-auto min-h-7 whitespace-normal"
                    >
                      {authorization && authorization.status !== "idle" ? <ButtonFeedbackIcon status={authorization.status}/> : null}
                      Authorize
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {server.tools.map((tool) => (
                    <span
                      key={tool}
                      className={cn(
                        field,
                        mono,
                        "text-muted-foreground rounded-md px-1.5 py-0.5",
                      )}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
