"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cva.config";
import { Button } from "@/components/ui/button";
import { Input, numberInputLength, type InputProps, type NumberInputWidth } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center rounded-lg border border-input shadow-xs transition-[color,box-shadow] outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input/30 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pe-1.5 has-[>[data-align=inline-start]]:[&>input]:ps-1.5 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto shrink-0 cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first ps-2 has-[>button]:-ms-1 has-[>kbd]:ms-[-0.15rem]",
        "inline-end": "order-last pe-2 has-[>button]:-me-1 has-[>kbd]:me-[-0.15rem]",
        "block-start":
          "order-first w-full flex-wrap justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full flex-wrap justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as Element).closest("button, a")) {
          return;
        }
        e.currentTarget.parentElement
          ?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
          ?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "flex shrink-0 items-center gap-2 text-sm shadow-none focus-visible:ring-0 aria-invalid:ring-0",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset";
  }) {
  return (
    <Button
      type={type}
      data-slot="input-group-button"
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: InputProps) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

type NumberInputProps = Omit<InputProps, "type" | "prefix" | "width"> & {
  width?: NumberInputWidth;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

function NumberInput({ width = "auto", minWidth, maxWidth, prefix, suffix, className, ...props }: NumberInputProps) {
  const minimum = numberInputLength(minWidth);
  const maximum = numberInputLength(maxWidth);
  const style = {
    "--number-input-min-width": minimum,
    "--number-input-max-width": maximum ? `min(100%, ${maximum})` : "100%",
  } as React.CSSProperties;
  const fill = width === "fill";

  return (
    <div
      data-slot="number-input"
      style={style}
      className={cn(
        "grid min-w-0 max-w-(--number-input-max-width) grid-cols-[minmax(0,1fr)]",
        fill ? "w-full" : "w-max",
        minimum &&
          "before:pointer-events-none before:col-start-1 before:row-start-1 before:w-(--number-input-min-width) before:max-w-full",
        className,
      )}
    >
      <InputGroup className="col-start-1 row-start-1 w-auto">
        <InputGroupInput
          {...props}
          type="number"
          width={width}
          className={cn("min-w-[min(100%,calc(2ch_+_2rem))]", fill && "w-0")}
        />
        {prefix != null && typeof prefix !== "boolean" && (
          <InputGroupAddon className="min-w-0 shrink overflow-hidden ps-0">
            <InputGroupText className="block min-w-0 truncate ps-2">{prefix}</InputGroupText>
          </InputGroupAddon>
        )}
        {suffix != null && typeof suffix !== "boolean" && (
          <InputGroupAddon align="inline-end" className="min-w-0 shrink overflow-hidden pe-0">
            <InputGroupText className="block min-w-0 truncate pe-2">{suffix}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
  NumberInput,
  type NumberInputProps,
};
