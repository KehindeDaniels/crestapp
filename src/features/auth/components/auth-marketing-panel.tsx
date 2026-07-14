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

// The dot indicator tracks two different things depending on where you are:
// on a standalone screen (login) it's the 3-slide marketing rotation above;
// inside the register wizard it's *step progress* — one dot per actual step,
// not a fixed 3. Figma's own exports show all 5 wizard screens with the same
// 3 dots (an artifact of the marketing slides being reused across steps, see
// docs/design-fidelity-notes.md), which reads as broken progress feedback
// once the dots move with the user rather than sitting static in a
// screenshot — so this deliberately diverges from the literal Figma export.
const WIZARD_STEPS = [
  "/register",
  "/register/verify-email",
  "/register/phone",
  "/register/verify-phone",
  "/register/password",
]

function AuthMarketingPanel() {
  const pathname = usePathname()
  const activeIndex = SLIDE_INDEX_BY_PATH[pathname] ?? 0
  const slide = SLIDES[activeIndex]

  const wizardStepIndex = WIZARD_STEPS.indexOf(pathname)
  const isWizardStep = wizardStepIndex !== -1
  const dotCount = isWizardStep ? WIZARD_STEPS.length : SLIDES.length
  const activeDotIndex = isWizardStep ? wizardStepIndex : activeIndex

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
          {Array.from({ length: dotCount }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.25 rounded-full transition-all",
                i === activeDotIndex ? "w-8.75 bg-white" : "w-2 bg-[#a9a9a9]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { AuthMarketingPanel }
