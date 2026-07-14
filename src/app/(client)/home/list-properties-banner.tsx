import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * Static marketing CTA — links to the property-creation flow, which isn't
 * built yet (Phase 4/5 scope), so the button currently points at the
 * disabled "List Property" nav destination. Illustration reuses the
 * already-downloaded auth house asset as a placeholder — the real Figma
 * illustration ("property for sale, signing a contract") wasn't exported;
 * swap in once it is.
 */
export function ListPropertiesBanner() {
  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl bg-muted p-6">
      <div className="max-w-md space-y-3">
        <h2 className="text-lg font-semibold">List your Properties on Crest</h2>
        <p className="text-sm text-muted-foreground">
          This helps keep Crest safe and ensures you&apos;re connecting with
          real people and real properties.
        </p>
        <Button asChild variant="outline">
          <Link href="/properties/new">Get Started</Link>
        </Button>
      </div>
      <Image
        src="/images/auth/login/house-illustration.png"
        alt=""
        width={140}
        height={129}
        className="hidden shrink-0 sm:block"
      />
    </div>
  );
}
