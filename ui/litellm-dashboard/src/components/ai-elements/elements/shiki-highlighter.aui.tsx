"use client";

import { useAuiState } from "@assistant-ui/react";
import type { SyntaxHighlighterProps as AuiHighlighterProps } from "@assistant-ui/react-markdown";
import { SyntaxHighlighter as Base, type SyntaxHighlighterProps } from "./shiki-highlighter";

export type HighlighterProps = SyntaxHighlighterProps & Partial<Pick<AuiHighlighterProps, "node" | "components">>;

export function SyntaxHighlighter(input: HighlighterProps) {
  const props = { ...input };
  delete props.node;
  delete props.components;
  const streaming = useAuiState(state => state.optional.part?.status.type === "running");
  return <Base {...props} streaming={streaming} />;
}
