"use client";

// Adapted from shadcn/ui's Base UI Input OTP and Nova recipe (MIT).
import { useContext, useState, type ComponentProps } from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/cva.config";
import styles from "@/components/ui/input-otp.module.css";

function InputOTP({ className, containerClassName, defaultValue, value, onChange, ...props }: ComponentProps<typeof OTPInput>) {
  // input-otp 1.4.2 forwards defaultValue alongside its internal value to React.
  // Keep the initial value here so React 19 receives a single controlled value.
  const [internalValue, setInternalValue] = useState(typeof defaultValue === "string" ? defaultValue : "");
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex min-w-0 max-w-full items-center gap-2 has-disabled:opacity-50", containerClassName)}
      spellCheck={false}
      value={value ?? internalValue}
      onChange={(nextValue) => {
        if (value === undefined) setInternalValue(nextValue);
        onChange?.(nextValue);
      }}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, size = "default", ...props }: ComponentProps<"div"> & { size?: "default" | "lg" }) {
  return (
    <div
      data-slot="input-otp-group"
      data-size={size}
      className={cn(
        "flex min-w-0 items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        size === "lg" && "*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSlot({ index, className, ...props }: ComponentProps<"div"> & { index: number }) {
  const context = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = context?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-8 items-center justify-center border-y border-r border-input text-sm outline-none transition-all first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 rtl:first:rounded-none rtl:first:rounded-r-lg rtl:first:border-l-0 rtl:first:border-r rtl:last:rounded-none rtl:last:rounded-l-lg rtl:last:border-l",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className={cn("h-4 w-px bg-foreground", styles.caret)} />
        </div>
      ) : null}
    </div>
  );
}

function InputOTPSeparator({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" className={cn("flex shrink-0 items-center [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      {children ?? <MinusIcon aria-hidden="true" />}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
