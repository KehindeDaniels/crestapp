import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * Static marketing CTA — links to the property-creation flow, which isn't
 * built yet (Phase 4/5 scope), so the button currently points at the
 * disabled "List Property" nav destination.
 *
 * Mobile layout confirmed against a real Figma mobile pull (node
 * 570:1225, not inferred): illustration centered ABOVE the heading (not
 * beside it), no body/description paragraph at all, full-width solid
 * button — genuinely different from desktop, not just a restyle.
 */
export function ListPropertiesBanner() {
  return (
    <>
      {/* Mobile */}
      <div className="rounded-[10px] bg-[rgba(229,231,235,0.51)] p-4 sm:hidden">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/home/list-property-illustration.png"
            alt=""
            width={117}
            height={79}
          />
          <h2 className="text-base font-semibold text-foreground">
            List your properties on Crest
          </h2>
        </div>
        <Button asChild size="xl" className="mt-3 w-full">
          <Link href="/properties/new">Get Started</Link>
        </Button>
      </div>

      {/* Desktop */}
      <div className="hidden items-center justify-between gap-6 rounded-2xl bg-muted p-5 sm:flex">
        <div className="max-w-md space-y-2">
          <h2 className="text-base font-semibold">List your Properties on Crest</h2>
          <p className="text-sm text-muted-foreground">
            This helps keep Crest safe and ensures you&apos;re connecting with
            real people and real properties.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-1 bg-background">
            <Link href="/properties/new">Get Started</Link>
          </Button>
        </div>
        <Image
          src="/images/home/list-property-illustration.png"
          alt=""
          width={172}
          height={82}
          className="shrink-0"
        />
      </div>
    </>
  );
}
