"use client";

import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";
import {
  CollapsibleRoot as Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible-root";
import { collapsePanel, fieldInteractive, mono, paper } from "./surfaces";
import { hostOf, safeHref } from "../utils/href";

export interface Source {
  domain?: string | undefined;
  title: string;
  url?: string | undefined;
  snippet?: string | undefined;
  author?: string | undefined;
  publishedAt?: string | undefined;
}

export interface SourcesProps {
  sources: readonly Source[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout?: "grid" | "list" | "stack" | undefined;
  showUrl?: boolean | undefined;
  hideTrigger?: boolean | undefined;
  locale?: string | undefined;
  className?: string | undefined;
}

export function SourceGlyph({ domain }: { domain: string }) {
  return (
    <span
      aria-hidden
      className="bg-foreground/[0.06] text-muted-foreground flex size-4 shrink-0 items-center justify-center rounded text-[9px] font-medium"
    >
      {domain.charAt(0).toUpperCase()}
    </span>
  );
}

const displayDomain = (source: Source) => source.domain || hostOf(source.url);

const formatPublishedAt = (publishedAt: string | undefined, locale: string) => {
  if (!publishedAt) return undefined;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.valueOf())) return undefined;
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
  };
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }
};

export function Sources({
  sources,
  open,
  onOpenChange,
  layout = "grid",
  showUrl = false,
  hideTrigger = false,
  locale = "en-US",
  className,
}: SourcesProps) {
  const badgeDomains = sources
    .map(displayDomain)
    .filter((domain): domain is string => domain !== undefined)
    .slice(0, 3);

  return (
    <Collapsible
      data-slot="sources"
      data-layout={layout}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("w-full max-w-sm", className)}
    >
      {hideTrigger ? null : (
        <CollapsibleTrigger
          className={cn(
            fieldInteractive,
            "group/trigger text-foreground/60 hover:text-foreground/90 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-xs outline-none",
          )}
        >
          {badgeDomains.length > 0 ? (
            <span aria-hidden className="flex -space-x-1">
              {badgeDomains.map((domain, index) => (
                <span
                  key={`${domain}-${index}`}
                  data-slot="sources-badge"
                  className="bg-foreground/[0.08] text-muted-foreground ring-background dark:ring-popover flex size-4 items-center justify-center rounded-full text-[8px] font-medium ring-1"
                >
                  {domain.charAt(0).toUpperCase()}
                </span>
              ))}
            </span>
          ) : null}
          <span>Sources</span>
          <span className={cn(mono, "text-muted-foreground tabular-nums")}>
            {sources.length}
          </span>
          <ChevronDownIcon className="size-3 opacity-60 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-open/trigger:rotate-180 group-data-panel-open/trigger:rotate-180 motion-reduce:transition-none" />
        </CollapsibleTrigger>
      )}
      <CollapsibleContent className={cn(collapsePanel, "outline-none")}>
        <div
          className={
            layout === "list"
              ? "flex flex-col pt-2.5"
              : layout === "stack" ? "flex flex-col gap-2 pt-2.5" : "grid grid-cols-2 gap-2 pt-2.5"
          }
        >
          {sources.map((source, index) => {
            const domain = displayDomain(source);
            const href = safeHref(source.url);
            const meta = [
              source.author,
              formatPublishedAt(source.publishedAt, locale),
            ]
              .filter((value): value is string => Boolean(value))
              .join(" · ");
            const cardClassName =
              layout === "list"
                ? "focus-visible:ring-ring/50 hover:bg-foreground/[0.03] flex flex-col gap-1 rounded-xl px-2.5 py-1.5 transition-colors duration-300 outline-none focus-visible:ring-3 focus-visible:ring-inset motion-reduce:transition-none"
                : cn(
                    paper,
                    "focus-visible:ring-ring/50 flex flex-col gap-1.5 rounded-2xl p-3 transition-transform duration-150 outline-none hover:-translate-y-px focus-visible:ring-3 focus-visible:ring-inset motion-reduce:transition-none",
                  );
            const glyph = domain ? <SourceGlyph domain={domain} /> : null;
            const details = (
              <>
                {source.snippet ? (
                  <span className={cn("text-muted-foreground line-clamp-2 text-xs leading-relaxed", showUrl && "line-clamp-none wrap-anywhere")}>
                    {source.snippet}
                  </span>
                ) : null}
                {meta ? (
                  <span className="text-muted-foreground truncate text-xs">
                    {meta}
                  </span>
                ) : null}
              </>
            );
            const content =
              layout === "list" ? (
                <>
                  <div className="flex min-w-0 items-center gap-2.5">
                    {glyph}
                    <span className={cn("text-foreground/90 min-w-0 flex-1 truncate text-sm", showUrl && "whitespace-normal wrap-anywhere")}>
                      {source.title}
                    </span>
                    {domain ? (
                      <span
                        className={cn(
                          mono,
                          "text-muted-foreground max-w-[40%] min-w-0 truncate",
                        )}
                      >
                        {domain}
                      </span>
                    ) : null}
                  </div>
                  {source.snippet || meta ? (
                    <div
                      className={cn(
                        "flex min-w-0 flex-col gap-1",
                        domain && "pl-6.5",
                      )}
                    >
                      {details}
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  {domain ? (
                    <div className="flex items-center gap-1.5">
                      {glyph}
                      <span
                        className={cn(mono, "text-muted-foreground truncate", showUrl && "whitespace-normal wrap-anywhere")}
                      >
                        {domain}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className={cn("text-foreground/90 line-clamp-2 text-sm leading-snug font-medium", showUrl && "line-clamp-none wrap-anywhere")}>
                      {source.title}
                    </span>
                    {details}
                  </div>
                </>
              );

            const visibleContent = <>{content}{showUrl && source.url ? <span data-slot="source-url" className={cn(mono, "text-muted-foreground wrap-anywhere")}>{source.url}</span> : null}</>;

            if (href) {
              return (
                <a
                  key={`${source.url ?? source.domain ?? source.title}-${index}`}
                  data-slot="source-card"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(cardClassName, "cursor-pointer")}
                >
                  {visibleContent}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              );
            }

            return (
              <div
                key={`${source.url ?? source.domain ?? source.title}-${index}`}
                data-slot="source-card"
                className={cardClassName}
              >
                {visibleContent}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
