"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LogoIcon } from "./logo-icon";
import { NavList } from "./nav-list";

/**
 * The nav equivalent of `Sidebar`, but for below `lg` — `Sidebar` is
 * `hidden lg:flex`, so without this there was previously no way to
 * navigate at all on mobile/tablet (no hamburger, no drawer, nothing).
 * Built on the existing `Dialog` primitive repositioned as a left-side
 * slide-in panel via an overriding `className` (twMerge resolves the
 * conflicting `top/left/translate` utilities) rather than adding a
 * separate "Sheet" primitive for one caller.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex size-10 items-center justify-center rounded-full hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="top-0 left-0 flex h-full max-h-none w-72 max-w-[85vw] -translate-x-0 -translate-y-0 flex-col rounded-none rounded-r-2xl p-0 duration-200 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="flex items-center gap-2 px-5 pt-6 pb-4">
            <LogoIcon size={32} />
            <span className="font-heading text-lg font-bold text-primary">
              Crest
            </span>
          </div>
          <NavList onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
