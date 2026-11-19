"use client";
import { Input } from "@/components/ui/input";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import type { AiRequestState } from "../utils/request";

import { Button } from "@/components/ui/button";

import { useId, type ComponentProps } from "react";
import { CheckIcon, PlugIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { field,  mono, paper } from "./surfaces";
import { useReceiptFocus } from "./receipt-focus";

export type ElicitationState = "request" | "accepted" | "declined";

export interface ElicitationField {
  name: string;
  label: string;
  value: string;
  kind: "text" | "choice" | "toggle";
  options?: readonly string[];
  required?: boolean;
}

function Toggle({ value }: { value: string }) {
  const enabled = value === "true";
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "flex h-4 w-7 items-center rounded-full p-0.5 transition-colors duration-200",
          enabled ? "bg-foreground/80" : "bg-foreground/15",
        )}
      >
        <span
          className={cn(
            "bg-background size-3 rounded-full transition-transform duration-200 motion-reduce:transition-none",
            enabled && "translate-x-3",
          )}
        />
      </span>
      <span className="text-muted-foreground text-xs">
        {enabled ? "On" : "Off"}
      </span>
    </>
  );
}

export function ElicitationForm({
  server,
  message,
  fields,
  state,
  onFieldChange,
  onAccept,
  onDecline,
  sendRequest,
  declineRequest,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "server"
  | "message"
  | "fields"
  | "state"
  | "onFieldChange"
  | "onAccept"
  | "onDecline"
> & {
  server: string;
  message: string;
  fields: readonly ElicitationField[];
  state: ElicitationState;
  onFieldChange?: ((name: string, value: string) => void) | undefined;
  onAccept?: () => void;
  onDecline?: () => void;
  sendRequest?: AiRequestState;
  declineRequest?: AiRequestState;
}) {
  const fieldPrefix = useId();
  const { receiptRef, focusHandlers } = useReceiptFocus(props);
  const interactive = state === "request" && onFieldChange !== undefined;
  const missingRequired =
    interactive &&
    fields.some(
      (item) =>
        item.kind !== "toggle" &&
        item.required === true &&
        item.value.trim() === "",
    );

  return (
    <div
      data-slot="elicitation-form"
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
          <PlugIcon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1 wrap-anywhere text-sm font-medium">
          {server}
        </span>
        <span className={cn(mono, "text-muted-foreground shrink-0")}>
          {state === "request" ? "needs input" : state === "accepted" ? "submitted" : "declined"}
        </span>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">{message}</p>

      <div className="flex flex-col gap-2.5">
        {fields.map((item, index) => {
          const labelId = `${fieldPrefix}-${index}`;
          const inputId = `${labelId}-input`;
          return (
            <div key={item.name} className="flex flex-col gap-1">
              {item.kind === "text" && interactive ? (
                <label
                  id={labelId}
                  htmlFor={inputId}
                  className={cn(mono, "text-muted-foreground")}
                >
                  {item.label}
                  {item.required && (
                    <span className="text-muted-foreground"> *</span>
                  )}
                </label>
              ) : (
                <span
                  id={labelId}
                  className={cn(mono, "text-muted-foreground")}
                >
                  {item.label}
                  {item.required && (
                    <span className="text-muted-foreground"> *</span>
                  )}
                </span>
              )}
              {item.kind === "choice" ? (
                <div
                  role={interactive ? "group" : undefined}
                  aria-labelledby={interactive ? labelId : undefined}
                  className="flex flex-wrap gap-1.5"
                >
                  {item.options?.map((option) =>
                    interactive ? (
                      <Button variant="ghost" size="sm"
                        key={option}
                        type="button"
                        aria-pressed={option === item.value}
                        disabled={sendRequest?.busy || declineRequest?.busy}
                        onClick={() => onFieldChange(item.name, option)}
                        className={cn(cn(
                          "focus-visible:ring-ring/50 rounded-full px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-3",
                          option === item.value
                            ? "bg-foreground text-background"
                            : cn(field, "text-muted-foreground"),
                        ), "h-auto min-h-7 whitespace-normal")}
                      >
                        {option}
                      </Button>
                    ) : (
                      <span
                        key={option}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs transition-colors",
                          option === item.value
                            ? "bg-foreground text-background"
                            : cn(field, "text-muted-foreground"),
                        )}
                      >
                        {option}
                      </span>
                    ),
                  )}
                </div>
              ) : item.kind === "toggle" ? (
                interactive ? (
                  <Button variant="ghost" size="sm"
                    type="button"
                    role="switch"
                    disabled={sendRequest?.busy || declineRequest?.busy}
                    aria-labelledby={labelId}
                    aria-checked={item.value === "true"}
                    onClick={() =>
                      onFieldChange(
                        item.name,
                        item.value === "true" ? "false" : "true",
                      )
                    }
                    className="focus-visible:ring-ring/50 flex w-fit items-center gap-2 rounded-lg outline-none focus-visible:ring-3 h-auto min-h-7 whitespace-normal"
                  >
                    <Toggle value={item.value} />
                  </Button>
                ) : (
                  <span className="flex items-center gap-2">
                    <Toggle value={item.value} />
                  </span>
                )
              ) : interactive ? (
                <Input
                  id={inputId}
                  value={item.value}
                  disabled={sendRequest?.busy || declineRequest?.busy}
                  aria-required={item.required || undefined}
                  onChange={(event) =>
                    onFieldChange(item.name, event.currentTarget.value)
                  }
                  className={cn(
                    field,
                    "text-foreground/80 focus-visible:ring-ring/50 rounded-lg px-2.5 py-1.5 text-xs outline-none focus-visible:ring-3",
                  )}
                />
              ) : (
                <span
                  className={cn(
                    field,
                    "text-foreground/80 rounded-lg px-2.5 py-1.5 text-xs",
                  )}
                >
                  {item.value}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex min-h-8 flex-wrap items-center justify-end gap-2">
        {state === "request" ? (
          <>
            <Button variant="ghost" size="sm"
              type="button"
              onClick={onDecline}
              disabled={!onDecline || declineRequest?.busy}
              aria-busy={declineRequest?.status === "loading" || undefined}
              className="text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground/90 h-8 rounded-full px-3.5 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96]"
            >
              {declineRequest && declineRequest.status !== "idle" ? <ButtonFeedbackIcon status={declineRequest.status}/> : null}
              Decline
            </Button>
            <Button variant="ghost" size="sm"
              type="button"
              onClick={onAccept}
              disabled={missingRequired || !onAccept || sendRequest?.busy}
              aria-busy={sendRequest?.status === "loading" || undefined}
              className={cn(
                                "flex h-8 items-center rounded-full px-3.5 text-xs font-medium disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              {sendRequest && sendRequest.status !== "idle" ? <ButtonFeedbackIcon status={sendRequest.status}/> : null}
              Send
            </Button>
          </>
        ) : (
          <span
            key={state}
            ref={receiptRef}
            tabIndex={-1}
            className="fade-in animate-in text-muted-foreground flex items-center gap-2 text-xs duration-300"
          >
            {state === "accepted" ? (
              <>
                <CheckIcon className="size-3.5 text-success" />
                Sent to {server}
              </>
            ) : (
              <>
                <XIcon className="text-muted-foreground size-3.5" />
                Declined
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
