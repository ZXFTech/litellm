"use client";

// Adapted from shadcn/ui's Base UI Toggle Group and Nova recipe (MIT).
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cn } from "@/lib/cva.config";

function ToggleGroup({ className, ...props }: Omit<ToggleGroupPrimitive.Props, "className"> & { className?: string }) {
  return <ToggleGroupPrimitive data-slot="toggle-group" className={cn("flex w-fit items-center gap-2 rounded-lg", className)} {...props} />;
}

function ToggleGroupItem({ className, size = "default", ...props }: Omit<Toggle.Props, "className"> & { className?: string; size?: "default" | "icon" }) {
  return <Toggle data-slot="toggle-group-item" data-size={size} className={cn("inline-flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-input bg-transparent text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted hover:text-foreground aria-pressed:bg-muted aria-pressed:[&_svg]:text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 motion-reduce:transition-none", size === "icon" ? "size-8 p-0" : "px-2.5", className)} {...props} />;
}

export { ToggleGroup, ToggleGroupItem };
