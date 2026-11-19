"use client";

import type { CSSProperties } from "react";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import { cn } from "@/lib/cva.config";

export type SyntaxHighlighterProps = {
  code: string;
  language?: string;
  className?: string;
  style?: CSSProperties;
  streaming?: boolean;
  highlightLines?: readonly number[];
  addDefaultStyles?: boolean;
  showLanguage?: boolean;
  theme?: unknown;
};

function SettledCode({ code, language, highlightLines }: Pick<SyntaxHighlighterProps, "code" | "language" | "highlightLines">) {
  const lines = useHighlightedCode(code, language ?? "text");
  return <pre className="min-w-0 max-w-full whitespace-pre-wrap wrap-anywhere rounded-lg border border-border bg-muted/30 p-3.5 text-sm leading-relaxed"><code>{lines.map((line, index) => <span key={index} className={cn("block min-w-0 whitespace-pre-wrap wrap-anywhere", highlightLines?.includes(index + 1) && "bg-muted")}>{line || "\n"}</span>)}</code></pre>;
}

// The app's Shiki 3 highlighter supplies the same deferred rendering without a second Shiki runtime.
export function SyntaxHighlighter({ code, language, className, style, streaming, highlightLines }: SyntaxHighlighterProps) {
  return <div data-slot="shiki-highlighter" className={cn("aui-shiki-base min-w-0 max-w-full", streaming && "aui-shiki-streaming", className)} style={style}>
    {streaming ? <pre className="whitespace-pre-wrap wrap-anywhere rounded-lg border border-border bg-muted/30 p-3.5 text-sm leading-relaxed"><code>{code.trim()}</code></pre> : <SettledCode code={code.trim()} language={language} highlightLines={highlightLines} />}
  </div>;
}
