"use client";

import { Fragment, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/cva.config";

type SliderProps<Value extends number | readonly number[] = number | readonly number[]> =
  SliderPrimitive.Root.Props<Value> &
    Pick<SliderPrimitive.Thumb.Props, "getAriaLabel" | "getAriaValueText"> & {
      label?: ReactNode;
      renderValue?: (values: readonly number[]) => ReactNode;
      formatDisplayValue?: (value: number) => string;
      showTicks?: boolean;
    };

type SliderThumbInputs = RefObject<(HTMLInputElement | null)[]>;
type SliderFormatter = (value: number) => string;
type SliderThumbAccessibility = Pick<
  SliderPrimitive.Thumb.Props,
  "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid" | "getAriaLabel" | "getAriaValueText"
>;

function getSliderSteps(min: number, max: number, step: number) {
  const steps = Number(((max - min) / step).toPrecision(14));
  return Number.isInteger(steps) && steps > 0 && steps < 1000 ? steps : 0;
}

function selectSliderTick(value: number, values: readonly number[], minimumGap: number, inputs: SliderThumbInputs) {
  let closest: HTMLInputElement | undefined;
  let distance = Infinity;
  for (const [index, currentValue] of values.entries()) {
    const input = inputs.current[index];
    if (!input || input.disabled) continue;

    const left = values[index - 1] ?? -Infinity;
    const right = values[index + 1] ?? Infinity;
    const nextDistance = Math.abs(value - currentValue);
    if (nextDistance > distance || value - left < minimumGap || right - value < minimumGap) continue;

    closest = input;
    distance = nextDistance;
  }

  if (!closest || distance === 0) return;
  closest.valueAsNumber = value;
  closest.dispatchEvent(new Event("input", { bubbles: true }));
}

function SliderThumbValue({
  index,
  vertical,
  formatValue,
}: {
  index: number;
  vertical: boolean;
  formatValue: SliderFormatter;
}) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-thumb-value"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute hidden rounded-[var(--radius-surface,var(--radius-lg))] border bg-popover px-1.5 py-0.5 text-xs whitespace-nowrap text-popover-foreground tabular-nums shadow-sm",
        vertical ? "top-1/2 left-full ml-3 -translate-y-1/2" : "bottom-full left-1/2 mb-3 -translate-x-1/2",
      )}
    >
      {(_, values) => (
        <>
          {formatValue(values[index])}
          <span
            data-slot="slider-thumb-value-arrow"
            aria-hidden="true"
            className={cn(
              "absolute size-1.5 rotate-45 rounded-[2px] border-b bg-popover",
              vertical
                ? "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 border-l"
                : "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r",
            )}
          />
        </>
      )}
    </SliderPrimitive.Value>
  );
}

function SliderTickMarks({ steps, vertical, insetThumb }: { steps: number; vertical: boolean; insetThumb: boolean }) {
  const axisInset = vertical ? "inset-y-(--slider-thumb-radius)" : "inset-x-(--slider-thumb-radius)";
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", insetThumb && axisInset)}>
      {Array.from({ length: steps + 1 }, (_, index) => {
        const position = String((index / steps) * 100) + "%";
        return (
          <span
            key={index}
            data-slot="slider-tick"
            className={cn(
              "absolute size-(--slider-thumb-size) rounded-full border border-muted-foreground bg-background",
              vertical
                ? "left-1/2 -translate-x-1/2 translate-y-1/2"
                : "top-1/2 -translate-y-1/2 [margin-inline-start:calc(-1*var(--slider-thumb-radius))]",
            )}
            style={vertical ? { bottom: position } : { insetInlineStart: position }}
          />
        );
      })}
    </span>
  );
}

function SliderControl({
  steps,
  vertical,
  insetThumb,
  count,
  thumbInputs,
  formatValue,
  accessibility,
}: {
  steps: number;
  vertical: boolean;
  insetThumb: boolean;
  count: number;
  thumbInputs: SliderThumbInputs;
  formatValue: SliderFormatter;
  accessibility: SliderThumbAccessibility;
}) {
  const hasTicks = steps > 0;
  const thumbInset = insetThumb ? "var(--slider-thumb-radius)" : "0px";
  const tickInset = "calc(50% / " + String(steps + 1) + " - " + thumbInset + ")";
  const tickStyle = vertical ? { insetBlock: tickInset } : { marginInline: tickInset };
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn(
        "relative flex cursor-pointer touch-none items-center select-none data-disabled:cursor-default data-disabled:opacity-50 data-[orientation=vertical]:flex-col",
        vertical ? "-mx-1 w-(--slider-thumb-size)" : "-my-1 h-(--slider-thumb-size)",
        vertical && hasTicks
          ? "absolute inset-x-0"
          : "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40",
        !vertical && !hasTicks && "w-full",
      )}
      style={hasTicks ? tickStyle : undefined}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted select-none data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Indicator
          data-slot="slider-range"
          className="bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {hasTicks ? <SliderTickMarks steps={steps} vertical={vertical} insetThumb={insetThumb} /> : null}
      {Array.from({ length: count }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          index={index}
          inputRef={(element) => {
            thumbInputs.current[index] = element;
          }}
          data-slot="slider-thumb"
          {...accessibility}
          className="relative block size-(--slider-thumb-size) shrink-0 cursor-pointer rounded-full border border-ring bg-white ring-ring/50 outline-none transition-[color,box-shadow] select-none hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden focus-within:ring-3 active:ring-3 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-disabled:pointer-events-none motion-reduce:transition-none [&[data-dragging]:focus-within>[data-slot=slider-thumb-value]]:block"
        >
          <SliderThumbValue index={index} vertical={vertical} formatValue={formatValue} />
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Control>
  );
}

function SliderTickLabels({
  min,
  max,
  steps,
  step,
  vertical,
  formatValue,
  thumbInputs,
}: {
  min: number;
  max: number;
  steps: number;
  step: number;
  vertical: boolean;
  formatValue: SliderFormatter;
  thumbInputs: SliderThumbInputs;
}) {
  const tickCount = steps + 1;
  const grid = "repeat(" + String(tickCount) + ", minmax(0, 1fr))";
  return (
    <SliderPrimitive.Value
      htmlFor={undefined}
      className={cn(
        "grid text-xs text-muted-foreground tabular-nums",
        vertical ? "min-w-0 items-center" : "mt-2 text-center",
      )}
      style={vertical ? { gridTemplateRows: grid } : { gridTemplateColumns: grid }}
      render={(props, state) => (
        <div {...props}>
          {Array.from({ length: tickCount }, (_, index) => {
            const value = index === steps ? max : Number((min + step * index).toPrecision(15));
            return (
              <button
                key={index}
                type="button"
                data-slot="slider-tick-label"
                aria-pressed={state.values.includes(value)}
                disabled={state.disabled}
                className={cn(
                  "min-w-0 cursor-pointer rounded-sm px-0.5 wrap-anywhere focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default",
                  vertical && "text-start",
                )}
                onClick={() =>
                  selectSliderTick(value, state.values, state.step * state.minStepsBetweenValues, thumbInputs)
                }
                style={vertical ? { gridRow: tickCount - index } : undefined}
              >
                {formatValue(value)}
              </button>
            );
          })}
        </div>
      )}
    />
  );
}

function SliderCaption({
  label,
  renderValue,
  vertical,
  formatValue,
}: Pick<SliderProps, "label" | "renderValue"> & {
  vertical: boolean;
  formatValue: SliderFormatter;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 justify-between text-sm",
        vertical ? "flex-col items-start rtl:items-end" : "mb-2 items-center gap-3",
      )}
    >
      {label != null ? (
        <SliderPrimitive.Label data-slot="slider-label" className="font-medium">
          {label}
        </SliderPrimitive.Label>
      ) : null}
      <SliderPrimitive.Value
        {...(renderValue && { render: <div />, htmlFor: undefined })}
        data-slot="slider-current-value"
        className={cn("min-w-0 font-medium wrap-anywhere tabular-nums", !vertical && "ms-auto text-end")}
      >
        {(_, values) =>
          renderValue
            ? renderValue(values)
            : values.map((item, index) => (
                <Fragment key={index}>
                  {index > 0 && " · "}
                  <bdi>{formatValue(item)}</bdi>
                </Fragment>
              ))
        }
      </SliderPrimitive.Value>
    </div>
  );
}

function Slider<Value extends number | readonly number[]>({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  largeStep,
  orientation = "horizontal",
  thumbAlignment = "edge",
  showTicks = false,
  label,
  renderValue,
  formatDisplayValue,
  format,
  locale,
  getAriaLabel,
  getAriaValueText,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SliderProps<Value>) {
  const current = value ?? defaultValue ?? min;
  const count = typeof current === "number" ? 1 : current.length;
  const thumbInputs: SliderThumbInputs = useRef([]);
  const vertical = orientation === "vertical";
  const steps = showTicks ? getSliderSteps(min, max, step) : 0;
  const showCaption = label != null || renderValue != null;
  const formatValue = useMemo(
    () => formatDisplayValue ?? new Intl.NumberFormat(locale, format ?? { maximumFractionDigits: 20 }).format,
    [formatDisplayValue, format, locale],
  );
  const aria = {
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid,
  };
  const control = (
    <SliderControl
      steps={steps}
      vertical={vertical}
      insetThumb={thumbAlignment !== "center"}
      count={count}
      thumbInputs={thumbInputs}
      formatValue={formatValue}
      accessibility={{
        ...aria,
        "aria-label": getAriaLabel ? undefined : ariaLabel,
        getAriaLabel,
        getAriaValueText,
      }}
    />
  );
  const tickLabels = (
    <SliderTickLabels
      min={min}
      max={max}
      steps={steps}
      step={step}
      vertical={vertical}
      formatValue={formatValue}
      thumbInputs={thumbInputs}
    />
  );
  const tickTrack = vertical ? (
    <div className="flex h-full min-h-40 gap-2 py-(--slider-thumb-radius)">
      <div className="relative w-1 shrink-0">{control}</div>
      {tickLabels}
    </div>
  ) : (
    <div className="px-(--slider-thumb-radius)">
      {control}
      {tickLabels}
    </div>
  );
  const caption = showCaption ? (
    <SliderCaption label={label} renderValue={renderValue} vertical={vertical} formatValue={formatValue} />
  ) : null;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={(state) =>
        cn(
          "min-w-0 [--slider-thumb-radius:calc(var(--spacing)*1.5)] [--slider-thumb-size:calc(var(--slider-thumb-radius)*2)] data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
          vertical && showCaption && "flex min-h-40 items-stretch gap-2 rtl:flex-row-reverse",
          typeof className === "function" ? className(state) : className,
        )
      }
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep ?? (showTicks ? step : undefined)}
      orientation={orientation}
      thumbAlignment={thumbAlignment}
      format={format}
      locale={locale}
      {...aria}
      {...props}
    >
      {vertical ? null : caption}
      {steps > 0 ? tickTrack : control}
      {vertical ? caption : null}
    </SliderPrimitive.Root>
  );
}

export { Slider, type SliderProps };
