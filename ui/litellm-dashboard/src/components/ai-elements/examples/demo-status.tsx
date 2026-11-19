import type { ReactNode } from "react";

export function AiDemoStatus({children, error = false}: {children: ReactNode; error?: boolean}) {
  return <p data-ai-status role={error ? "alert" : "status"} className={error ? "w-full text-sm text-destructive" : "w-full text-sm text-muted-foreground"}>{children}</p>;
}
