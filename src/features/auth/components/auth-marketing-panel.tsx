import Image from "next/image"

// The navy background, "rays of light," headline, and dot indicator are all
// live CSS — only the house illustration is a real exported image. An
// earlier pass flattened this entire panel to one raster image to work
// around a broken Figma export (isolating the blend-mode shapes lost their
// navy backdrop, see docs/design-fidelity-notes.md), but that sacrificed
// live/selectable text and true responsiveness for no good reason once the
// real fix (reproduce the background live) was on the table.
//
// Layout uses flex distribution instead of the Figma frame's fixed
// (708x1024) absolute offsets, so content compresses proportionally on
// shorter desktop viewports instead of the bottom (the dot indicator) being
// clipped below the fold.
function AuthMarketingPanel() {
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
            A safer way To Rent Or Buy Homes
          </h2>
          <p className="text-base leading-normal xl:text-2xl xl:leading-8">
            Find verified properties and avoid scams or inflated prices.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div
            className="relative h-full max-h-101 w-auto max-w-full overflow-hidden rounded-[60px] border-4 border-white xl:rounded-[100px]"
            style={{ aspectRatio: "452 / 404" }}
          >
            <Image
              src="/images/auth/login/house-illustration.png"
              alt="Illustration of a house with a key, representing home ownership"
              fill
              sizes="(min-width: 1024px) 49vw, 0px"
              className="object-contain"
              preload
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="h-1.25 w-8.75 rounded-full bg-white" />
          <span className="h-1.25 w-2 rounded-full bg-[#a9a9a9]" />
          <span className="h-1.25 w-2 rounded-full bg-[#a9a9a9]" />
        </div>
      </div>
    </div>
  )
}

export { AuthMarketingPanel }
