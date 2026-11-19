"use client";

import { ChevronUpIcon, FileTextIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/cva.config";

export function RecordPreview({ count, className, ...props }: Omit<ButtonProps, "children"> & { count: number }) {
  return (
    <Button variant="outline" className={cn("zhaosie-preview-card", className)} {...props}>
      <span className="zhaosie-preview-icon"><FileTextIcon className="size-5" aria-hidden="true" /></span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <strong className="text-sm font-medium">记录内容 · {count} 段</strong>
        <span className="text-xs text-muted-foreground">点击查看并编辑</span>
      </span>
      <ChevronUpIcon className="size-4" aria-hidden="true" />
    </Button>
  );
}

export function RecordBlock({ index, text, onEdit, onDelete }: { index: number; text: string; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="zhaosie-record-block w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{String(index).padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground">记录片段</span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit ? <Button variant="ghost" size="icon" aria-label={`编辑第 ${index} 段`} onClick={onEdit}><PencilIcon aria-hidden="true" /></Button> : null}
          {onDelete ? <Button variant="ghost" size="icon" aria-label={`删除第 ${index} 段`} onClick={onDelete}><Trash2Icon aria-hidden="true" /></Button> : null}
        </div>
      </div>
      <p className="text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{text}</p>
    </div>
  );
}
