import * as React from "react";

import { cn } from "@/lib/utils/index";

/** Matches `Input`'s xl-size visual treatment — no `size` variants needed yet, only one usage shape so far. */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full resize-y rounded-xl border border-input bg-input-background px-4 py-3 text-sm shadow-xs outline-none placeholder:text-input-placeholder focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
