"use client"

import * as React from "react"
import { Eye } from "lucide-react"

import { cn } from "@/lib/utils/index"
import { Input } from "@/components/ui/input"

// Functional addition riding along with the visual pass: the Figma mockup only
// shows a static "hide" (eye-slash) icon with no toggled-open state, so real
// show/hide behavior (and the second icon) wasn't part of the design pull.
// The "hide" state uses the real exported Figma asset for exact fidelity; the
// "shown" state falls back to lucide-react since no matching asset exists.
function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        size="xl"
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-input-placeholder"
      >
        {visible ? (
          <Eye className="size-6" />
        ) : (
          <img
            src="/images/auth/shared/icon-hide.svg"
            alt=""
            className="size-6"
          />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }
