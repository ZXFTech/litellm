"use client";

import * as React from "react";

import { cn } from "@/lib/cva.config";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none has-[:is(input[type=checkbox],input[type=radio],[role=checkbox],[role=radio],[role=switch]):not(:disabled,[data-disabled],[data-readonly],[aria-disabled=true],[aria-readonly=true])]:cursor-pointer data-disabled:pointer-events-none data-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
