import { useEffect, useRef, useState } from "react";

import type { SiteStrings } from "../../lib/i18n";
import { pic } from "../../lib/images";
import { Arrow } from "./arrow";
import { Words } from "./words";

// Four frames per project: one wide hero and a row of three details.
const SLIDES = [1, 2, 3, 4].map((p) => ({
  hero: `/assets/projects/proj${p}-1`,
  thumbs: [2, 3, 4].map((k) => `/assets/projects/proj${p}-${k}`),
}));
const HERO_SIZES = "(min-width: 768px) 58vw, 100vw";
const THUMB_SIZES = "(min-width: 768px) 19vw, 33vw";

export function Portfolio({ t }: { t: SiteStrings }) {
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  // The slide on its way out keeps rendering for the exit animation, so the
  // stage is never empty for even a frame.
  const [leaving, setLeaving] = useState<number | null>(null);
  const leaveTimer = useRef(0);

  useEffect(() => {
    // Warm every project's frames once the section is a screen away, so a
    // switch never waits on the network, and a reader who never gets this
    // far never downloads them. The warm-up asks for exactly the print the
    // <img> below would pick, so the cache hit is guaranteed.
    const el = section.current;
    if (!el) return;
    const warm = () => {
      for (const slide of SLIDES) {
        for (const [path, sizes] of [
          [slide.hero, HERO_SIZES],
          ...slide.thumbs.map((thumb) => [thumb, THUMB_SIZES]),
        ]) {
          const img = new Image();
          img.decoding = "async";
          img.sizes = sizes;
          const { src, srcSet } = pic(path, path.endsWith("-1") ? 1600 : 1000);
          img.srcset = srcSet;
          img.src = src;
        }
      }
    };
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        warm();
        obs.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const count = t.portfolio.slides.length;

  const go = (n: number) => {
    window.clearTimeout(leaveTimer.current);
    setLeaving(index);
    setIndex(((n % count) + count) % count);
    leaveTimer.current = window.setTimeout(() => setLeaving(null), 650);
  };
  const next = () => go(index + 1);
  const prev = () => go(index - 1);
  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  return (
    <section ref={section} id="portfolio" className="bg-[#F5EFE6] py-28 md:py-36">
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div className="text-center">
          <p data-drift="24" className="bhy-eyebrow">
            {t.portfolio.eyebrow}
          </p>
          <h2 data-words className="bhy-display-2 mt-4 text-[#3E2E23]">
            <Words text={t.portfolio.title} />
          </h2>
        </div>
        <div data-grow className="mt-16 grid origin-center md:mt-24">
          {t.portfolio.slides.map((slide, i) => {
            const frames = SLIDES[i];
            const state =
              i === index
                ? "bhy-slide--active"
                : i === leaving
                  ? "bhy-slide--leaving"
                  : "bhy-slide--idle";
            const caption = slide.place ? `${slide.title}, ${slide.place}` : slide.title;
            return (
              <div
                key={slide.title + i}
                aria-hidden={i !== index}
                className={`bhy-slide ${state} grid grid-cols-1 gap-10 [grid-area:1/1] md:grid-cols-12 md:gap-12`}
              >
                <div className="md:col-span-7">
                  <figure className="bhy-slide-img bhy-fig overflow-hidden">
                    <img
                      {...pic(frames.hero, 1600)}
                      sizes={HERO_SIZES}
                      alt={caption}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  </figure>
                  <div className="bhy-slide-swatch mt-3 grid grid-cols-3 gap-3">
                    {frames.thumbs.map((thumb) => (
                      <figure key={thumb} className="bhy-fig overflow-hidden">
                        <img
                          {...pic(thumb, 1000)}
                          sizes={THUMB_SIZES}
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
                      {String(i + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
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
                      tabIndex={i === index ? 0 : -1}
                      className="bhy-carousel-btn"
                    >
                      <Arrow className="w-5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label={t.portfolio.next}
                      tabIndex={i === index ? 0 : -1}
                      className="bhy-carousel-btn bhy-carousel-btn-next"
                    >
                      <Arrow className="w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
