import type { SiteStrings } from "../../lib/i18n";
import { Arrow } from "./arrow";

export function Hero({ t }: { t: SiteStrings }) {
  return (
    <section data-hero id="top" className="relative h-[260svh] bg-[#2A1E16]">
      {/* The section owns its full height and the stage sticks inside it —
          plain CSS sticky, no pinning and no fixed positioning, so nothing is
          ever laid over the section that follows. */}
      <div
        data-hero-stage
        className="sticky top-0 flex h-[100svh] flex-col justify-end overflow-hidden"
      >
      {/* The film never plays on its own — scroll is the playhead (the
          Higgsfield chase: the clip loads fully into memory, then currentTime
          glides toward where the scroll points). The poster holds the opening
          frame until the clip is ready; reduced-motion and no-JS visitors
          simply keep it. */}
      <div aria-hidden="true" className="bhy-hero-img absolute inset-0">
        <img
          src="/assets/hero-poster.jpg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          data-hero-film
          data-src-hd="/assets/hero-scrub-hd.mp4"
          data-src-sm="/assets/hero-scrub-sm.mp4"
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div
        data-hero-veil
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#190f09]/85 via-[#2A1E16]/40 to-[#2A1E16]/25"
      />
      <div
        data-hero-copy
        className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-16 pt-44 md:pb-24"
      >
        <h1 className="bhy-display leading-[1.02] text-[#F5EFE6]">
          <span className="block overflow-hidden pb-1">
            <span className="bhy-hero-line block">{t.hero.lines[0]}</span>
          </span>
          <span className="block overflow-hidden pb-1 md:ms-[14%]">
            <span className="bhy-hero-line bhy-hero-line-2 block">{t.hero.lines[1]}</span>
          </span>
          <span className="block overflow-hidden pb-1 md:ms-[28%]">
            <span className="bhy-hero-line bhy-hero-line-3 block">{t.hero.lines[2]}</span>
          </span>
        </h1>
        <div className="mt-10 flex flex-col items-start gap-9 md:ms-[46%]">
          <p className="bhy-hero-fade max-w-[34ch] text-base leading-relaxed text-[#F5EFE6]/85">
            {t.hero.body}
          </p>
          <a href="#contact" className="bhy-hero-fade bhy-hero-fade-2 bhy-cta-underline text-[#F5EFE6]">
            <span>{t.hero.cta}</span>
            <Arrow className="bhy-cta-underline-arrow w-6" />
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}
