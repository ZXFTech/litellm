"use client";

import { Button } from "@/components/ui/button";

/** Inline toast prototype. Its consumer owns visibility and the undo action. */
export function ZhaosieToast({ message, onUndo }: { message: string; onUndo?: () => void }) {
  return (
    <div className="zhaosie-toast" role="status" aria-atomic="true">
      <span>{message}</span>
      {onUndo ? <Button variant="link" size="sm" onClick={onUndo}>撤销</Button> : null}
    </div>
  );
}
