"use client";

import type { ReactNode } from "react";
import { ChevronRightIcon, FolderIcon, HistoryIcon, LightbulbIcon, MenuIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const menuItems = [
  { label: "记录历史", icon: HistoryIcon },
  { label: "想法空间", icon: LightbulbIcon },
  { label: "专题空间", icon: FolderIcon },
  { label: "设置", icon: SettingsIcon },
] as const;

export function ZhaosieHeader({ menu }: { menu: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-2xl font-semibold tracking-tight">朝夕</span>
      {menu}
    </div>
  );
}

export function RecordNotice({ recording = false }: { recording?: boolean }) {
  return <p role="status" className="text-sm leading-6 text-muted-foreground">{recording ? "松开停止记录" : <>随手记录，不必整理。<br />需要的时候，一切都有迹可循。</>}</p>;
}

export function ZhaosieMenu({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange: (open: boolean) => void; onSelect: (label: string) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon-lg" />} aria-label="打开全屏菜单"><MenuIcon aria-hidden="true" /></DialogTrigger>
      <DialogContent className="zhaosie-menu">
        <DialogHeader>
          <DialogTitle>菜单</DialogTitle>
          <DialogDescription>朝夕 · Zhaosie</DialogDescription>
        </DialogHeader>
        <ul className="zhaosie-menu-list">
          {menuItems.map(({ label, icon: Icon }) => <li key={label}>
            <Button className="zhaosie-menu-item" variant="ghost" onClick={() => onSelect(label)}>
              <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1">{label}</span>
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </li>)}
        </ul>
        <p className="mt-auto text-xs leading-6 text-muted-foreground">选择要打开的功能。</p>
      </DialogContent>
    </Dialog>
  );
}
