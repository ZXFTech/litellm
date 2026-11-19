"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { RecordPreview } from "./record-card";

export function RecordPanel({ count, open, onOpenChange, onSave, onDiscard, children }: { count: number; open: boolean; onOpenChange: (open: boolean) => void; onSave: () => void; onDiscard: () => void; children: ReactNode }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerTrigger render={<RecordPreview count={count} />} />
      <DrawerContent className="zhaosie-record-panel">
        <DrawerHeader>
          <div className="flex items-center justify-between gap-4">
            <DrawerTitle>记录内容 · {count} 段</DrawerTitle>
            <DrawerClose render={<Button variant="ghost" size="sm" />}>收起</DrawerClose>
          </div>
          <DrawerDescription>查看和编辑本次记录的内容。</DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">{children}</div>
        <DrawerFooter className="flex-row flex-wrap">
          <Button variant="secondary" onClick={onDiscard}>废弃草稿</Button>
          <Button className="flex-1" onClick={onSave}>保存记录</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
