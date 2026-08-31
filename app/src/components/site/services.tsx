import type { SiteStrings } from "../../lib/i18n";
import { Arrow } from "./arrow";
import { Words } from "./words";

export function Services({ t }: { t: SiteStrings }) {
  return (
    <section id="services" className="relative overflow-hidden bg-[#2A1E16] py-28 md:py-36">
      <img
        src="/assets/hero.jpg"
        alt=""
        loading="lazy"
                      decoding="async"
        data-bg-parallax
        className="absolute inset-0 h-full w-full object-cover object-bottom opacity-35 blur-[2px]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#1f150e]/70" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-16 px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p data-drift="24" className="bhy-eyebrow text-[#F5EFE6]/70">
            {t.services.eyebrow}
          </p>
          <h2 data-words className="bhy-display-2 mt-6 text-[#F5EFE6]">
            <Words text={t.services.title} />
          </h2>
          <p data-drift="36" className="mt-8 max-w-[36ch] text-base leading-relaxed text-[#F5EFE6]/80">
            {t.services.body}
          </p>
          <a href="#contact" className="bhy-cta-split mt-12 text-[#F5EFE6]">
            <span className="bhy-cta-split-label">
              <span>{t.services.cta}</span>
              <span aria-hidden="true">{t.services.cta}</span>
            </span>
            <Arrow className="w-5" />
          </a>
        </div>
        <div className="md:col-span-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {t.services.items.map((item, i) => (
              <div
                key={item}
                data-drift={i % 2 === 1 ? "110" : "60"}
                className={i % 2 === 1 ? "sm:mt-14" : ""}
              >
                <article className="bhy-service-card">
                  <span dir="ltr" className="block text-sm tracking-[0.2em] text-[#6B5748]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <figure data-parallax className="bhy-fig mt-5 overflow-hidden">
                    <img
                      src={`/assets/service-${i + 1}.jpg`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </figure>
                  <h3 className="bhy-display-4 mt-6 text-[#3E2E23]">{item}</h3>
                </article>
              </div>
            ))}
          </div>
          <p className="mt-16 text-end text-sm leading-relaxed text-[#F5EFE6]/70 sm:mt-28">
            {t.services.caption}
          </p>
        </div>
      </div>
    </section>
  );
}
