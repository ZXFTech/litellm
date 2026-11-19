"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import { useTooltipState } from "../context";
import type { CellData } from "../types";

type PopperContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup> & Pick<ComponentPropsWithoutRef<typeof TooltipPrimitive.Positioner>, "side" | "sideOffset">;

export type TooltipProps = Omit<PopperContentProps, "children"> & {
  children: (props: { cell: CellData }) => ReactNode;
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, side = "top", sideOffset = 8, ...props }, ref) => {
    const state = useTooltipState();
    if (!state.hoveredCell || !state.anchor) return null;

    return (
      <TooltipPrimitive.Provider>
        <TooltipPrimitive.Root open>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner anchor={state.anchor} side={side} sideOffset={sideOffset} className="z-50">
              <TooltipPrimitive.Popup ref={ref} {...props}>
                {children({ cell: state.hoveredCell })}
              </TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);

Tooltip.displayName = "HeatGraph.Tooltip";
