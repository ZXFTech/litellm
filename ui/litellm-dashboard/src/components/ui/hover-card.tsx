"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";

import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cva.config";
import { buttonVariants } from "@/components/ui/button";

function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  className,
  variant,
  size,
  ...props
}: PreviewCardPrimitive.Trigger.Props & VariantProps<typeof buttonVariants>) {
  const recipe = variant != null || size != null ? buttonVariants({ variant: variant ?? "link", size }) : undefined;
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      className={
        recipe ? (state) => cn(recipe, typeof className === "function" ? className(state) : className) : className
      }
      {...props}
    />
  );
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-popup"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-popup max-h-(--available-height) w-64 max-w-(--available-width) origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden transition-[opacity,scale] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
