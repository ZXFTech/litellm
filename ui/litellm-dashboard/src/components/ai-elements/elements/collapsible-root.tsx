"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { forwardRef } from "react";
import { cn } from "@/lib/cva.config";

export const CollapsibleRoot = forwardRef<
  React.ComponentRef<typeof Collapsible.Root>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Root>
>(function CollapsibleRoot(props, ref) {
  return <Collapsible.Root ref={ref} data-slot="collapsible" {...props} />;
});

export function CollapsibleTrigger({ className, ...props }: Collapsible.Trigger.Props) {
  return (
    <Collapsible.Trigger
      data-slot="collapsible-trigger"
      className={state => cn("cursor-pointer disabled:cursor-default aria-disabled:cursor-default data-disabled:cursor-default", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

export function CollapsibleContent({ ...props }: Collapsible.Panel.Props) {
  return <Collapsible.Panel data-slot="collapsible-content" {...props} />;
}
