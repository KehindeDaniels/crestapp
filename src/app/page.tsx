import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * Landing page — no Figma design exists for this screen, so this is an
 * original, minimal composition built from the app's existing design tokens
 * and assets (not a new visual language). Purely presentational: both CTAs
 * route into the real, already-built auth flow — no new functionality here.
 */
export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-8">
        <Image
          src="/images/auth/shared/logo-lockup.png"
          alt="Crest"
          width={122}
          height={37}
          className="h-9 w-auto"
        />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-12 px-6 pb-16 lg:flex-row lg:justify-between lg:gap-8">
        <div className="flex max-w-lg flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <h1 className="font-heading text-4xl leading-tight font-bold text-auth-heading lg:text-5xl">
            A safer way to rent or buy homes
          </h1>
          <p className="text-lg text-muted-foreground">
            Find verified properties, connect directly with landlords, and
            avoid scams — Crest checks every listing and every user before
            you ever make contact.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <Image
          src="/images/auth/login/house-illustration.png"
          alt=""
          width={452}
          height={404}
          className="hidden w-full max-w-md lg:block"
          preload
        />
      </div>
    </main>
  );
}
