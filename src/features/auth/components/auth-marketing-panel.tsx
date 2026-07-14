"use client"

import * as React from "react"
import { cn } from "@/lib/utils/index"

// Slide 1 copy is confirmed verbatim from the Login screen Figma pull
// (file aDI3HOS6NVQWnLdIx5Zvif, node 1395:1540). Slides 2 and 3 use headlines
// surfaced during earlier design research but their subheadings were never
// pulled from Figma directly — flagged here and in docs/design-fidelity-notes.md
// as an open item; replace once those screens/nodes are confirmed.
const SLIDES = [
  {
    headline: "A safer way To Rent Or Buy Homes",
    subheading: "Find verified properties and avoid scams or inflated prices.",
  },
  {
    headline: "Connect Directly With Landlords",
    subheading: "Skip the middlemen and deal with verified landlords directly.",
  },
  {
    headline: "Your Safety Comes First",
    subheading: "Every listing and user is verified before you ever make contact.",
  },
] as const

const SLIDE_INTERVAL_MS = 6000

function AuthMarketingPanel() {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const slide = SLIDES[active]

  return (
    <div
      className="relative hidden h-screen w-[708px] shrink-0 overflow-hidden bg-[#061d52] lg:block"
      style={{
        backgroundImage: "url(/images/auth/login/background-decoration.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-[115px] left-[124px] flex w-[452px] flex-col gap-6 text-white">
        <p className="font-heading text-[40px] leading-[48px] font-bold">
          {slide.headline}
        </p>
        <p className="text-[24px] leading-[32px]">{slide.subheading}</p>
      </div>

      <div className="absolute top-[365px] left-[124px] h-[404px] w-[452px] overflow-hidden rounded-[100px] border-4 border-white">
        <img
          src="/images/auth/login/house-illustration.png"
          alt=""
          className="size-full object-contain"
        />
      </div>

      <div className="absolute top-[835px] left-[321px] flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <span
            key={s.headline}
            className={cn(
              "h-[5px] rounded-full transition-all",
              i === active ? "w-[35px] bg-white" : "w-2 bg-[#a9a9a9]"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export { AuthMarketingPanel }
