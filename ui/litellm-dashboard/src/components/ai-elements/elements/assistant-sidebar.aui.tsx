"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../connected/ui/resizable";
import type { FC, PropsWithChildren } from "react";
import { useIsMobile } from "../connected/use-mobile";

import { Thread } from "./thread.aui";

export const AssistantSidebar: FC<PropsWithChildren> = ({ children }) => {
  const narrow = useIsMobile();
  return (
    <ResizablePanelGroup orientation={narrow ? "vertical" : "horizontal"}>
      <ResizablePanel>{children}</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <Thread />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
