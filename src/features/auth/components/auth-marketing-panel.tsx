"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils/index"

// Per-screen marketing slides, confirmed against Figma screenshots exported
// for each auth screen (docs/design/screenshots/). The 3-dot indicator, the
// headline/subheading, and the illustration all change together per screen —
// there is no auto-rotating timer; the "active slide" is a function of the
// current route, matching what Figma's prototype shows on each frame.
//
// Confirmed mapping: Login/Phone/Verify Phone/Create Password all use slide
// 0 (the same slide login uses); Create Account uses slide 1; Verify Email
// uses slide 2. This isn't a clean repeating 0-1-2-0-1-2 cycle — it's what
// the actual exported screens show, not an idealized pattern.
const SLIDES = [
  {
    headline: "A safer way To Rent Or Buy Homes",
    subheading: "Find verified properties and avoid scams or inflated prices.",
    image: "/images/auth/login/house-illustration.png",
    imageAlt: "Illustration of a house with a key, representing home ownership",
  },
  {
    headline: "Connect Directly With Landlords",
    subheading: "No agents. No middlemen. Just transparent property deals.",
    image: "/images/auth/register/landlord-illustration.png",
    imageAlt: "Illustration of a landlord pointing at a house",
  },
  {
    headline: "Your Safety Comes First",
    subheading:
      "Crest verifies landlords and properties to reduce scams and protect your money.",
    image: "/images/auth/login/key-lock.svg",
    imageAlt: "Illustration of a padlock and a house-shaped key, representing security",
  },
] as const

// Routes not in this map (forgot/reset-password, register/success) fall back
// to slide 0 — none of those have been pulled from Figma yet.
const SLIDE_INDEX_BY_PATH: Record<string, number> = {
  "/login": 0,
  "/register": 1,
  "/register/verify-email": 2,
  "/register/phone": 0,
  "/register/verify-phone": 0,
  "/register/password": 0,
}

function AuthMarketingPanel() {
  const pathname = usePathname()
  const activeIndex = SLIDE_INDEX_BY_PATH[pathname] ?? 0
  const slide = SLIDES[activeIndex]

  return (
    <div className="relative hidden h-screen shrink-0 overflow-hidden bg-[#061d52] lg:flex lg:w-[clamp(360px,49vw,708px)] lg:flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -right-1/3 h-[140%] w-[140%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent_70%)]" />
        <div className="absolute top-0 left-[15%] h-full w-24 rotate-12 bg-linear-to-b from-white/10 via-white/0 to-transparent blur-2xl" />
        <div className="absolute top-0 left-[55%] h-full w-32 -rotate-12 bg-linear-to-b from-white/8 via-white/0 to-transparent blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col justify-between gap-6 p-8 xl:p-12 2xl:p-16">
        <div className="flex max-w-113 flex-col gap-4 text-white xl:gap-6">
          <h2 className="font-heading text-[28px] leading-[1.2] font-bold xl:text-[40px] xl:leading-12">
            {slide.headline}
          </h2>
          <p className="text-base leading-normal xl:text-2xl xl:leading-8">
            {slide.subheading}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div
            className="relative h-full max-h-101 w-auto max-w-full overflow-hidden rounded-[60px] border-4 border-white xl:rounded-[100px]"
            style={{ aspectRatio: "452 / 404" }}
          >
            <Image
              key={slide.image}
              src={slide.image}
              alt={slide.imageAlt}
              fill
              sizes="(min-width: 1024px) 49vw, 0px"
              className="object-contain"
              preload
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((s, i) => (
            <span
              key={s.headline}
              className={cn(
                "h-1.25 rounded-full transition-all",
                i === activeIndex ? "w-8.75 bg-white" : "w-2 bg-[#a9a9a9]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { AuthMarketingPanel }
