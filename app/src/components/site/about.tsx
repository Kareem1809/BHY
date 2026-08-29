import type { SiteStrings } from "../../lib/i18n";
import { Arrow } from "./arrow";

export function About({ t }: { t: SiteStrings }) {
  return (
    <section id="about" className="bg-[#FBF7F0] py-28 md:py-36">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-16 px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="bhy-eyebrow">{t.about.eyebrow}</p>
          <h2 data-drift="40" className="bhy-display-2 mt-16 text-[#3E2E23] md:mt-28">
            {t.about.title}
          </h2>
          <p className="mt-8 max-w-[44ch] text-base leading-relaxed text-[#6B5748]">
            {t.about.body}
          </p>
          <a href="#portfolio" className="bhy-cta-path mt-12 text-[#3E2E23]">
            <span>{t.about.link}</span>
            <span className="bhy-cta-path-line" aria-hidden="true">
              <Arrow className="bhy-cta-path-arrow w-5" />
            </span>
          </a>
        </div>
        <div className="md:col-span-7">
          <div className="grid grid-cols-12 items-start gap-6">
            <figure data-img-reveal data-parallax className="col-span-7 overflow-hidden">
              <img
                src="/assets/about-main.jpg"
                alt=""
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
              />
            </figure>
            <figure
              data-img-reveal
              data-parallax
              data-drift="90"
              className="col-span-5 mt-16 overflow-hidden md:mt-28"
            >
              <img
                src="/assets/about-side.jpg"
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
