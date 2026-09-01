import type { SiteStrings } from "../../lib/i18n";
import { pic } from "../../lib/images";
import { Arrow } from "./arrow";
import { Words } from "./words";

export function About({ t }: { t: SiteStrings }) {
  return (
    <section id="about" className="bg-[#FBF7F0] py-28 md:py-36">
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p data-drift="24" className="bhy-eyebrow">
              {t.about.eyebrow}
            </p>
            <h2 data-words className="bhy-display-2 mt-16 text-[#3E2E23] md:mt-28">
              <Words text={t.about.title} />
            </h2>
            <p data-drift="36" className="mt-8 max-w-[44ch] text-base leading-relaxed text-[#6B5748]">
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
              <figure data-img-reveal className="bhy-fig col-span-7 overflow-hidden">
                <img
                  {...pic("/assets/about-main", 1400)}
                  sizes="(min-width: 768px) 34vw, 58vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full object-cover"
                />
              </figure>
              <figure
                data-img-reveal
                data-drift="90"
                className="bhy-fig col-span-5 mt-16 overflow-hidden md:mt-28"
              >
                <img
                  {...pic("/assets/about-side", 1400)}
                  sizes="(min-width: 768px) 24vw, 42vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
            </div>
          </div>
        </div>
        {/* The three things every project is measured against. */}
        <ul className="mt-24 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 md:mt-32">
          {t.about.pillars.map((pillar, i) => (
            <li key={pillar.title} data-drift={[32, 56, 80][i]} className="bhy-pillar">
              <span dir="ltr" className="bhy-pillar-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="bhy-display-4 mt-4 text-[#3E2E23]">{pillar.title}</h3>
              <p className="mt-3 max-w-[34ch] text-base leading-relaxed text-[#6B5748]">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
