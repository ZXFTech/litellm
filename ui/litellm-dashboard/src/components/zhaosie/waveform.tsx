import type { CSSProperties } from "react";
import { cn } from "@/lib/cva.config";

const sampleLevels = [0.3, 0.75, 0.45, 1, 0.55, 0.85, 0.25];

/** Visual prototype. Pass real levels from the recorder when audio is integrated. */
export function Waveform({ active = false, levels = sampleLevels, className }: { active?: boolean; levels?: readonly number[]; className?: string }) {
  return (
    <div className={cn("zhaosie-waveform", className)} data-active={active} aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => <span key={index} style={{ "--level": active ? Math.max(0, Math.min(1, levels[index] ?? 0)) : 0 } as CSSProperties} />)}
    </div>
  );
}
