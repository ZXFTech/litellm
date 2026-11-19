"use client";

import type { ComponentProps } from "react";
import { ChevronDownIcon, FileIcon, FolderIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import { mono, paper } from "./surfaces";
import { take } from "../utils/range";
import { Button } from "@/components/ui/button";

export interface FileTreeNode {
  path: string;
  name: string;
  depth: number;
  kind: "folder" | "file";
  additions?: number;
  deletions?: number;
}

export function FileTree({
  nodes,
  visibleCount,
  totalAdditions,
  totalDeletions,
  mode = "changes",
  heading = "项目目录",
  expandedPaths,
  onToggleFolder,
  selectedPath,
  onSelectFile,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  "children" | "nodes" | "visibleCount" | "totalAdditions" | "totalDeletions"
> & {
  nodes: readonly FileTreeNode[];
  visibleCount: number;
  totalAdditions: number;
  totalDeletions: number;
  mode?: "changes" | "browse";
  heading?: string;
  expandedPaths?: readonly string[];
  onToggleFolder?: (path: string) => void;
  selectedPath?: string;
  onSelectFile?: (path: string) => void;
}) {
  const files = nodes.filter((node) => node.kind === "file").length;
  const shown = take(nodes, visibleCount).filter(node => mode !== "browse" || expandedPaths === undefined || !nodes.some(parent => parent.kind === "folder" && node.path.startsWith(`${parent.path.replace(/\/+$/, "")}/`) && !expandedPaths.includes(parent.path)));

  return (
    <div
      data-slot="file-tree"
      className={cn(
        paper,
        "flex w-full max-w-sm flex-col gap-2 rounded-2xl p-3.5",
        className,
      )}

      {...props}
    >
      <div className="flex items-baseline justify-between px-1">
        <span className="text-sm font-medium">{mode === "browse" ? heading : `${files} files changed`}</span>
        {mode === "browse" ? <span className={cn(mono, "text-muted-foreground tabular-nums")}>{files} 个文件</span> : <span className={cn(mono, "tabular-nums")}>
          <span className="text-success text-success">
            +{totalAdditions}
          </span>{" "}
          <span className="text-destructive text-destructive">
            −{totalDeletions}
          </span>
        </span>}
      </div>

      <div className="flex flex-col">
        {shown.map((node) => {
          const expanded = expandedPaths?.includes(node.path) ?? true;
          const selected = selectedPath === node.path;
          const className = cn("fade-in slide-in-from-left-1 animate-in fill-mode-both hover:bg-foreground/[0.03] flex items-center gap-2 rounded-lg px-1 py-1 text-sm transition-colors duration-300", selectedPath === node.path && "bg-accent");
          const style = { paddingInlineStart: `${0.25 + node.depth * 0.85}rem` };
          const content = node.kind === "folder" ? (
              <>
                <ChevronDownIcon aria-hidden className={cn("text-muted-foreground size-3 shrink-0", !expanded && "-rotate-90")} />
                <FolderIcon aria-hidden className="text-muted-foreground size-3.5 shrink-0" />
                <span className="text-foreground/60 min-w-0 flex-1 wrap-anywhere">
                  {node.name}
                </span>
              </>
            ) : (
              <>
                <FileIcon aria-hidden className="text-muted-foreground ms-3 size-3.5 shrink-0" />
                <span className="text-foreground/85 min-w-0 flex-1 wrap-anywhere">
                  {node.name}
                </span>
                <span className={cn(mono, "shrink-0 tabular-nums")}>
                  {node.additions ? (
                    <span className="text-success text-success">
                      +{node.additions}
                    </span>
                  ) : null}{" "}
                  {node.deletions ? (
                    <span className="text-destructive text-destructive">
                      −{node.deletions}
                    </span>
                  ) : null}
                </span>
              </>
            );
          const interactive = mode === "browse" && (node.kind === "folder" ? onToggleFolder : onSelectFile);
          return interactive ? <div key={node.path} className="min-w-0" style={{ paddingInlineStart: `calc(var(--spacing) * ${node.depth * 3.4})` }}><Button variant={selected ? "secondary" : "ghost"} size="sm" data-path={node.path} className="w-full min-w-0 justify-start text-start"
            aria-label={node.kind === "folder" ? `${expanded ? "折叠" : "展开"} ${node.path}` : `预览 ${node.path}`}
            aria-expanded={node.kind === "folder" ? expanded : undefined} aria-current={node.path === selectedPath || undefined}
            onClick={() => { if (node.kind === "folder") onToggleFolder?.(node.path); else onSelectFile?.(node.path); }}
          >{content}</Button></div> : <div key={node.path} data-path={node.path} className={className} style={style}>{content}</div>;
        })}
      </div>
    </div>
  );
}
