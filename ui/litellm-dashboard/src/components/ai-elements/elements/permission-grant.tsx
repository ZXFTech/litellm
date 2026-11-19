"use client";

import { Button } from "@/components/ui/button";

import type { ComponentProps } from "react";
import { KeyRoundIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field,  mono, paper } from "./surfaces";
import { useReceiptFocus } from "./receipt-focus";

export type GrantScope = "session" | "always" | "denied";

export function PermissionGrant({
  capability,
  requester,
  reach,
  scope,
  onGrant,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "capability" | "requester" | "reach" | "scope" | "onGrant"
> & {
  capability: string;
  requester: string;
  reach: readonly string[];
  scope: GrantScope | "pending";
  onGrant?: (scope: GrantScope) => void;
}) {
  const { receiptRef, focusHandlers } = useReceiptFocus(props);
  return (
    <div
      data-slot="permission-grant"
      className={cn(
        paper,
        "flex w-full max-w-sm flex-col gap-3.5 rounded-xl p-4",
        className,
      )}

      {...props}
      {...focusHandlers}
    >
      <div className="flex items-center gap-2.5">
        <span className="bg-foreground/[0.05] text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
          <KeyRoundIcon className="size-3.5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="wrap-anywhere text-sm font-medium">
            {capability}
          </span>
          <span className="text-muted-foreground wrap-anywhere text-xs">
            requested by {requester}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn(mono, "text-muted-foreground")}>this grants</span>
        {reach.map((item) => (
          <span
            key={item}
            className="text-foreground/60 flex items-baseline gap-2 text-xs"
          >
            <span
              aria-hidden
              className="bg-foreground/20 size-1 rounded-full"
            />
            {item}
          </span>
        ))}
      </div>

      <div className="flex min-h-8 flex-wrap items-center justify-end gap-2">
        {scope === "pending" ? (
          onGrant ? (
            <>
              <Button variant="ghost" size="sm"
                type="button"
                onClick={() => onGrant("denied")}
                className="text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground/90 h-8 rounded-full px-3 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96]"
              >
                Deny
              </Button>
              <Button variant="ghost" size="sm"
                type="button"
                onClick={() => onGrant("session")}
                className="text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground/90 h-8 rounded-full px-3 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96]"
              >
                This session
              </Button>
              <Button variant="ghost" size="sm"
                type="button"
                onClick={() => onGrant("always")}
                className={cn(
                                    "flex h-8 items-center rounded-full px-3 text-xs font-medium",
                )}
              >
                Always
              </Button>
            </>
          ) : (
            <span
              key={scope}
              className={cn(
                field,
                mono,
                "fade-in animate-in text-muted-foreground rounded-full px-2.5 py-1.5 duration-300",
              )}
            >
              pending
            </span>
          )
        ) : (
          <span
            key={scope}
            ref={receiptRef}
            tabIndex={-1}
            className={cn(
              field,
              mono,
              "fade-in animate-in text-muted-foreground rounded-full px-2.5 py-1.5 duration-300",
            )}
          >
            {scope === "denied" ? "denied" : `granted · ${scope}`}
          </span>
        )}
      </div>
    </div>
  );
}
