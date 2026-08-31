import { useEffect, useState } from "react";

import type { SiteStrings } from "../../lib/i18n";
import { Arrow } from "./arrow";
import { Words } from "./words";

// Four frames per project: one wide hero and a row of three details.
const SLIDE_IMAGES = [
  {
    hero: "/assets/projects/proj1-1.jpg",
    thumbs: [
      "/assets/projects/proj1-2.jpg",
      "/assets/projects/proj1-3.jpg",
      "/assets/projects/proj1-4.jpg",
    ],
  },
  {
    hero: "/assets/projects/proj2-1.jpg",
    thumbs: [
      "/assets/projects/proj2-2.jpg",
      "/assets/projects/proj2-3.jpg",
      "/assets/projects/proj2-4.jpg",
    ],
  },
  {
    hero: "/assets/projects/proj3-1.jpg",
    thumbs: [
      "/assets/projects/proj3-2.jpg",
      "/assets/projects/proj3-3.jpg",
      "/assets/projects/proj3-4.jpg",
    ],
  },
  {
    hero: "/assets/projects/proj4-1.jpg",
    thumbs: [
      "/assets/projects/proj4-2.jpg",
      "/assets/projects/proj4-3.jpg",
      "/assets/projects/proj4-4.jpg",
    ],
  },
];

export function Portfolio({ t }: { t: SiteStrings }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Warm every slide's frames shortly after load — the visible slide's
    // images arrive on their own, but the other projects' used to start
    // downloading only on click, which showed as a beat of blank. Once
    // warmed, switching serves straight from cache.
    const timer = window.setTimeout(() => {
      for (const slideImages of SLIDE_IMAGES) {
        for (const src of [slideImages.hero, ...slideImages.thumbs]) {
          const img = new Image();
          img.decoding = "async";
          img.src = src;
        }
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);
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
          className="bhy-slide mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12 md:gap-12"
        >
          <div className="md:col-span-7">
            <figure className="bhy-slide-img bhy-fig overflow-hidden">
              <img
                src={images.hero}
                alt={slide.title}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>
            <div className="bhy-slide-swatch mt-3 grid grid-cols-3 gap-3">
              {images.thumbs.map((src) => (
                <figure key={src} className="bhy-fig overflow-hidden">
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:col-span-5">
            <div className="flex items-baseline justify-between text-sm text-[#6B5748]">
              <span>{slide.place}</span>
              <span dir="ltr" className="tracking-[0.2em]">
                {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-10">
              <h3 className="bhy-display-3 text-[#3E2E23]">{slide.title}</h3>
              <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-[#6B5748]">
                {slide.description}
              </p>
            </div>
            <div className="mt-auto flex items-end justify-end gap-3 pt-12">
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
    </section>
  );
}
