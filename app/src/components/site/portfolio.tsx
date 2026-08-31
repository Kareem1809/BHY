import { useState } from "react";

import type { SiteStrings } from "../../lib/i18n";
import { Arrow } from "./arrow";
import { Words } from "./words";

const SLIDE_IMAGES = [
  { main: "/assets/project-1.jpg", swatch: "/assets/project-1-detail.jpg" },
  { main: "/assets/project-2.jpg", swatch: "/assets/project-2-detail.jpg" },
  { main: "/assets/project-3.jpg", swatch: "/assets/project-3-detail.jpg" },
];

export function Portfolio({ t }: { t: SiteStrings }) {
  const [index, setIndex] = useState(0);
  const count = t.portfolio.slides.length;
  const slide = t.portfolio.slides[index];
  const images = SLIDE_IMAGES[index];

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  return (
    <section id="portfolio" className="bg-[#F5EFE6] py-28 md:py-36">
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div className="text-center">
          <p data-drift="24" className="bhy-eyebrow">
            {t.portfolio.eyebrow}
          </p>
          <h2 data-words className="bhy-display-2 mt-4 text-[#3E2E23]">
            <Words text={t.portfolio.title} />
          </h2>
        </div>
        <div
          key={index}
          className="bhy-slide mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-12"
        >
          <figure className="bhy-slide-img bhy-fig overflow-hidden md:col-span-6">
            <img
              src={images.main}
              alt={slide.title}
              loading="lazy"
                      decoding="async"
              className="aspect-[3/4] w-full object-cover"
            />
          </figure>
          <div className="flex flex-col md:col-span-6">
            <div className="flex items-baseline justify-between text-sm text-[#6B5748]">
              <span>
                {slide.place}, {slide.year}
              </span>
              <span dir="ltr" className="tracking-[0.2em]">
                {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3 className="bhy-display-3 text-[#3E2E23]">{slide.title}</h3>
                <p className="mt-6 max-w-[38ch] text-base leading-relaxed text-[#6B5748]">
                  {slide.description}
                </p>
              </div>
              <figure className="lg:col-span-5">
                <div className="bhy-slide-swatch bhy-fig overflow-hidden">
                  <img
                    src={images.swatch}
                    alt=""
                    loading="lazy"
                      decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <figcaption className="mt-4 text-sm leading-relaxed text-[#6B5748]">
                  {slide.swatch}
                </figcaption>
              </figure>
            </div>
            <div className="mt-auto flex items-end justify-between gap-6 pt-12">
              <p className="text-sm leading-relaxed text-[#6B5748]">{slide.note}</p>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={prev}
                  aria-label={t.portfolio.prev}
                  className="bhy-carousel-btn"
                >
                  <Arrow className="w-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label={t.portfolio.next}
                  className="bhy-carousel-btn bhy-carousel-btn-next"
                >
                  <Arrow className="w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
