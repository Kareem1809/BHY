import type { SiteStrings } from "../../lib/i18n";
import { Arrow } from "./arrow";

export function Hero({ t }: { t: SiteStrings }) {
  return (
    <section
      data-hero
      id="top"
      className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-[#2A1E16]"
    >
      {/* The film never plays on its own — scroll drives it frame by frame
          (motion.ts pins the section and maps scroll progress to currentTime).
          No src here: motion.ts picks 4K or FHD per screen, so reduced-motion
          and no-JS visitors get only the 4K poster, not a silent download. */}
      <video
        data-hero-film
        data-src-uhd="/assets/hero-film-4k.mp4"
        data-src-fhd="/assets/hero-film-fhd.mp4"
        poster="/assets/hero-poster.jpg"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        className="bhy-hero-img absolute inset-0 h-full w-full object-cover"
      />
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
    </section>
  );
}
