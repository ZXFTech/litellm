import type { ComponentProps } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/cva.config";

export function Spinner({ className, ...props }: ComponentProps<typeof LoaderCircleIcon>) {
  return <LoaderCircleIcon data-slot="spinner" role="status" aria-label="加载中" className={cn("size-4 animate-spin motion-reduce:animate-none", className)} {...props} />;
}
