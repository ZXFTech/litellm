"use client";

import { PrismAsyncLight } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { coldarkCold, coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { SyntaxHighlighterProps } from "@assistant-ui/react-markdown";

for (const language of ["js", "jsx", "ts", "tsx"]) PrismAsyncLight.registerLanguage(language, tsx);
PrismAsyncLight.registerLanguage("python", python);

const style = { background: "transparent", margin: 0, padding: "1rem", whiteSpace: "pre-wrap" as const, overflowWrap: "anywhere" as const };

// The reference Prism renderer is kept while its small adapter uses the project's installed React runtime.
export function SyntaxHighlighter({ language, code }: SyntaxHighlighterProps) {
  return <div data-slot="prism-highlighter" className="min-w-0 max-w-full">
    <div className="dark:hidden"><PrismAsyncLight language={language} style={coldarkCold} customStyle={style} codeTagProps={{ style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } }} wrapLongLines>{code}</PrismAsyncLight></div>
    <div className="hidden dark:block"><PrismAsyncLight language={language} style={coldarkDark} customStyle={style} codeTagProps={{ style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } }} wrapLongLines>{code}</PrismAsyncLight></div>
  </div>;
}
