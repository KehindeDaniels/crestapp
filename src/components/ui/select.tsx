import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/index";
import { inputVariants } from "./input";

const selectVariants = cva("appearance-none pr-9", {
  variants: {
    size: {
      default: "",
      xl: "",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

/**
 * Native `<select>` styled to match `Input` — a generic, `forwardRef`
 * version of `features/properties/components/filter-dropdown.tsx`'s inline
 * treatment, for use inside `FormField`/`FormControl` where a ref is
 * required.
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  Omit<React.ComponentProps<"select">, "size"> & VariantProps<typeof inputVariants>
>(({ className, size, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      data-slot="select"
      className={cn(inputVariants({ size }), selectVariants({ size }), className)}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
  </div>
));
Select.displayName = "Select";

export { Select };
