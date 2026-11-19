"use client";

import { useEffect, useState, type ComponentProps, type CSSProperties } from "react";

import { Tooltip, TooltipContent } from "@/components/ai-elements/connected/ui/tooltip";
import { cn } from "@/lib/cva.config";

const numberWidthModes = ["auto", "compact", "normal", "wide", "fill"] as const;
const actionInputTypes = ["button", "checkbox", "color", "file", "image", "radio", "reset", "submit"];
const presetDigits = { compact: 3, normal: 6, wide: 12 } as const;
const maxDigits = 24;

type NumberInputWidth = (typeof numberWidthModes)[number];
type InputProps = ComponentProps<"input"> & {
  digits?: number;
  precision?: number;
  minWidth?: number | string;
  maxWidth?: number | string;
};

function parseDecimal(value: InputProps["min"]) {
  if (value == null) return;
  if (typeof value === "string" && !/^-?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) return;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function getNumberBounds(min: InputProps["min"], max: InputProps["max"]) {
  const lower = parseDecimal(min);
  const upper = parseDecimal(max);
  return lower != null && upper != null && lower > upper ? { lower: undefined, upper: undefined } : { lower, upper };
}

function decimalPlaces(value: number | undefined) {
  const [mantissa, exponent = "0"] = String(value ?? 0).split("e");
  return Math.max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent));
}

function getNumberCapacity(mode: Exclude<NumberInputWidth, "fill">, { digits, precision, min, max, step }: InputProps) {
  if (digits != null && Number.isFinite(digits) && digits > 0) return Math.min(maxDigits, Math.ceil(digits));
  if (mode !== "auto") return presetDigits[mode];

  const { lower, upper } = getNumberBounds(min, max);
  const magnitude = Math.max(Math.abs(lower ?? 0), Math.abs(upper ?? 0));
  const integerDigits = magnitude >= 1e21 ? maxDigits : String(Math.trunc(magnitude)).length;
  const integerCapacity = Math.max(integerDigits, lower == null || upper == null ? 6 : 1);
  const fraction =
    precision != null && Number.isFinite(precision) && precision >= 0
      ? Math.ceil(precision)
      : Math.max(decimalPlaces(lower), decimalPlaces(upper), decimalPlaces(parseDecimal(step)));
  const sign = lower == null || lower < 0 ? 1 : 0;
  return Math.min(maxDigits, integerCapacity + sign + (fraction > 0 ? 1 + fraction : 0));
}

function numberInputLength(value: number | string | undefined) {
  if (typeof value === "string") return value.trim() || undefined;
  return value != null && Number.isFinite(value) && value >= 0 ? `${value}px` : undefined;
}

function correctNumberRange(input: HTMLInputElement) {
  const value = input.valueAsNumber;
  if (input.readOnly || !Number.isFinite(value)) return;

  const { lower, upper } = getNumberBounds(input.min, input.max);
  const low = lower != null && value < lower;
  const high = upper != null && value > upper;
  if (!low && !high) return;

  const view = input.ownerDocument.defaultView;
  if (!view) return;
  const setValue = Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")?.set;
  if (!setValue) return;
  setValue.call(input, low ? input.min : input.max);
  input.dispatchEvent(new view.Event("input", { bubbles: true }));

  if (lower != null && upper != null) return `Enter a value from ${input.min} to ${input.max}`;
  return low ? `Enter a value of at least ${input.min}` : `Enter a value of at most ${input.max}`;
}

function InputControl({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 motion-reduce:transition-none",
        type &&
          actionInputTypes.includes(type) &&
          "cursor-pointer aria-disabled:cursor-not-allowed file:[cursor:inherit]",
        type === "date" &&
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer read-only:[&::-webkit-calendar-picker-indicator]:cursor-default disabled:[&::-webkit-calendar-picker-indicator]:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function SizedNumberInput({
  mode,
  digits,
  precision,
  minWidth,
  maxWidth,
  className,
  style,
  onBlur,
  onKeyDown,
  ...props
}: Omit<InputProps, "type" | "width"> & { mode: NumberInputWidth }) {
  const [correction, setCorrection] = useState<{
    anchor: HTMLInputElement;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!correction) return;
    const timeout = setTimeout(() => setCorrection(null), 3000);
    return () => clearTimeout(timeout);
  }, [correction]);

  function commitNumber(anchor: HTMLInputElement) {
    const message = correctNumberRange(anchor);
    if (message) setCorrection({ anchor, message });
  }

  const minimum = numberInputLength(minWidth);
  const maximum = numberInputLength(maxWidth);
  const capacity = mode === "fill" ? undefined : getNumberCapacity(mode, { ...props, digits, precision });
  const ideal = capacity == null ? undefined : `calc(${capacity}ch + var(--spacing, 0.25rem) * 5 + 1.25rem + 2px)`;
  const numberStyle = {
    "--number-input-width": ideal && minimum ? `max(${ideal}, ${minimum})` : ideal,
    "--number-input-max-width": maximum ? `min(100%, ${maximum})` : "100%",
    ...style,
  } as CSSProperties;

  return (
    <>
      <InputControl
        {...props}
        type="number"
        style={numberStyle}
        onBlur={(event) => {
          commitNumber(event.currentTarget);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing && !event.defaultPrevented) {
            commitNumber(event.currentTarget);
          }
          onKeyDown?.(event);
        }}
        className={cn(
          "box-border max-w-(--number-input-max-width) tabular-nums",
          "[&:not(:hover):not(:focus)::-webkit-inner-spin-button]:hidden [&:not(:hover):not(:focus)::-webkit-outer-spin-button]:hidden",
          ideal && "w-(--number-input-width)",
          className,
        )}
      />
      <span role="status" className="sr-only">
        {correction?.message}
      </span>
      {correction && (
        <Tooltip
          open
          onOpenChange={(open, details) => {
            if (!open && details.reason === "escape-key") setCorrection(null);
          }}
        >
          <TooltipContent anchor={correction.anchor}>{correction.message}</TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

function Input({ type, width, digits, precision, minWidth, maxWidth, ...props }: InputProps) {
  if (type !== "number") return <InputControl {...props} type={type} width={width} />;

  const mode = numberWidthModes.find((option) => option === width);
  const hasSizing = mode || [digits, precision, minWidth, maxWidth].some((value) => value != null);
  if (!hasSizing) return <InputControl {...props} type={type} width={width} />;

  return (
    <SizedNumberInput
      {...props}
      mode={mode ?? "auto"}
      digits={digits}
      precision={precision}
      minWidth={minWidth}
      maxWidth={maxWidth}
    />
  );
}

export { Input, numberInputLength, type InputProps, type NumberInputWidth };
