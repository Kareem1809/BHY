import { useEffect, useRef, useState } from "react";

import type { SiteStrings } from "../../lib/i18n";
import { pic } from "../../lib/images";
import { lockScroll } from "../../lib/motion";
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
  const loupe = useRef<HTMLDivElement>(null);
  // The picture given the whole screen. It keeps rendering while it closes,
  // so the fade out has something to fade.
  const [full, setFull] = useState<{ src: string; alt: string } | null>(null);
  const [fullOn, setFullOn] = useState(false);
  const closeTimer = useRef(0);
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
  useEffect(() => {
    // A round glass laid on the frame under the pointer: the real print at
    // twice life size, cropped to exactly what the glass covers. Mouse only —
    // a finger has no hover, and on a phone a tap opens the picture instead.
    const panel = loupe.current;
    const root = section.current;
    if (!panel || !root) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const eye = panel.firstElementChild as HTMLElement;
    const big = eye.querySelector("img") as HTMLImageElement;

    const ZOOM = 2;
    let raf = 0;
    let review = 0;
    let showing = false;
    let wanted = "";
    let ratio = 1.5;
    let pointerX = -1;
    let pointerY = -1;
    let x = 0;
    let y = 0;
    let glass = 0; // the diameter of the eye
    let drawW = 0; // the print inside it, already magnified
    let drawH = 0;
    let offX = 0; // where that print starts inside the magnified frame
    let offY = 0;
    // Where the open frame sat, and the scroll it sat at. While the pointer
    // is still inside it, nothing has to be looked up at all.
    let hoverBox: DOMRect | null = null;
    let hoverScroll = 0;
    // Read in the scroll event, never inside the animation frame. Asking the
    // window for scrollY between GSAP's transform writes forces a synchronous
    // layout — the same thrash that once made the whole page hitch — and the
    // scroll event is the one place where the value is already settled.
    let scrolled = 0;

    // The frame on the page shows its photograph with object-fit: cover. The
    // glass has to show the SAME crop, magnified about the frame's own
    // corner, or the picture under the glass would not be the picture under
    // the pointer. Worked out once per opening, never while it travels.
    const fit = () => {
      if (!hoverBox) return;
      glass = eye.offsetWidth;
      const w = hoverBox.width * ZOOM;
      const h = hoverBox.height * ZOOM;
      if (ratio > w / h) {
        drawH = h;
        drawW = h * ratio;
      } else {
        drawW = w;
        drawH = w / ratio;
      }
      offX = (w - drawW) / 2;
      offY = (h - drawH) / 2;
      big.style.width = `${drawW.toFixed(1)}px`;
      big.style.height = `${drawH.toFixed(1)}px`;
    };

    // Two composited writes per frame and not one repaint: the glass moves by
    // its own transform, the print behind it by another.
    const crop = () => {
      if (!hoverBox) return;
      const half = glass / 2;
      const px = x - hoverBox.left;
      const py = y - (hoverBox.top - (scrolled - hoverScroll));
      const tx = Math.min(Math.max(half - px * ZOOM + offX, glass - drawW), 0);
      const ty = Math.min(Math.max(half - py * ZOOM + offY, glass - drawH), 0);
      big.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
    };
    const follow = () => {
      x += (pointerX - x) * 0.24;
      y += (pointerY - y) * 0.24;
      panel.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      crop();
      raf = requestAnimationFrame(follow);
    };
    const hide = () => {
      wanted = "";
      if (!showing) return;
      showing = false;
      panel.classList.remove("bhy-loupe--on");
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const show = () => {
      fit();
      if (showing) return;
      showing = true;
      x = pointerX;
      y = pointerY;
      panel.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      crop();
      panel.classList.add("bhy-loupe--on");
      raf = requestAnimationFrame(follow);
    };

    // The print is decoded BEFORE the glass opens. Swapping the source and
    // revealing in the same frame left the browser decoding a 1600px
    // photograph while the entrance was already running, and the opening
    // visibly caught on it. Decoded first, the entrance has nothing to do
    // but move. The section's own preloader means this is usually instant.
    const open = (figure: HTMLElement) => {
      const src = figure.dataset.zoom ?? "";
      hoverBox = figure.getBoundingClientRect();
      scrolled = window.scrollY;
      hoverScroll = scrolled;
      if (wanted === src) {
        show();
        return;
      }
      wanted = src;
      const next = new Image();
      next.src = src;
      const settle = () => {
        if (wanted !== src) return;
        if (next.naturalHeight) ratio = next.naturalWidth / next.naturalHeight;
        big.src = src;
        show();
      };
      next.decode().then(settle, settle);
    };

    const at = (clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const figure = el?.closest<HTMLElement>("[data-zoom]") ?? null;
      // only the slide on stage, never the ones waiting behind it
      if (!figure || figure.closest(".bhy-slide--idle, .bhy-slide--leaving")) {
        hoverBox = null;
        hide();
        return;
      }
      open(figure);
    };

    // Asking the document what is under the pointer costs a hit test, and
    // doing it on every scroll frame cost 10 frames of 371 on a parked
    // pointer. The open frame's box is remembered instead, and the scroll it
    // was measured at: while the pointer is still inside that box — shifted
    // by however far the page has travelled since — there is nothing to look
    // up, and the check is arithmetic. Only when it leaves does one real
    // hit test run.
    const stillOnIt = () => {
      if (!hoverBox) return false;
      const top = hoverBox.top - (scrolled - hoverScroll);
      return (
        pointerX >= hoverBox.left &&
        pointerX <= hoverBox.right &&
        pointerY >= top &&
        pointerY <= top + hoverBox.height
      );
    };
    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (showing && stillOnIt()) return;
      at(pointerX, pointerY);
    };
    // What sits under a still pointer changes on its own: the page scrolls,
    // or the reader clicks through to the next project. Listening for the
    // pointer alone left them waving the mouse to wake the preview up.
    const lookAgain = () => {
      review = 0;
      if (pointerX < 0) return;
      if (showing && stillOnIt()) return;
      at(pointerX, pointerY);
    };
    const onScroll = () => {
      scrolled = window.scrollY;
      if (!review) review = requestAnimationFrame(lookAgain);
    };
    // A click or a slide finishing its entrance changes the DOM under a
    // pointer that has not moved: the remembered box is meaningless then.
    const onChange = () => {
      hoverBox = null;
      if (!review) review = requestAnimationFrame(lookAgain);
    };

    root.addEventListener("pointermove", onPointer);
    root.addEventListener("pointerover", onPointer);
    root.addEventListener("pointerleave", hide);
    root.addEventListener("click", onChange);
    root.addEventListener("animationend", onChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      root.removeEventListener("pointermove", onPointer);
      root.removeEventListener("pointerover", onPointer);
      root.removeEventListener("pointerleave", hide);
      root.removeEventListener("click", onChange);
      root.removeEventListener("animationend", onChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onChange);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(review);
    };
  }, []);

  // Clicking a frame gives the whole screen to that one photograph — the way
  // a phone enlarges, and the way anyone expects a picture to open.
  const openFull = (src: string, alt: string) => {
    window.clearTimeout(closeTimer.current);
    setFull({ src, alt });
    requestAnimationFrame(() => setFullOn(true));
  };
  const closeFull = () => {
    setFullOn(false);
    closeTimer.current = window.setTimeout(() => setFull(null), 340);
  };
  useEffect(() => {
    document.documentElement.classList.toggle("bhy-full-open", fullOn);
    lockScroll(fullOn);
    if (!fullOn) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFull();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullOn]);
  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current);
      document.documentElement.classList.remove("bhy-full-open");
      lockScroll(false);
    },
    [],
  );

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
    <section ref={section} id="portfolio" data-band="light" className="bg-[#F5EFE6] py-28 md:py-36">
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
                  <figure
                    data-zoom={`${frames.hero}.webp`}
                    onClick={() => openFull(`${frames.hero}.webp`, caption)}
                    className="bhy-slide-img bhy-fig overflow-hidden"
                  >
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
                      <figure
                        key={thumb}
                        data-zoom={`${thumb}.webp`}
                        onClick={() => openFull(`${thumb}.webp`, caption)}
                        className="bhy-fig overflow-hidden"
                      >
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
      {/* One glass for the whole section: it only ever holds the print of the
          frame under the pointer, and only transforms are written per frame. */}
      <div ref={loupe} aria-hidden="true" className="bhy-loupe">
        <div className="bhy-loupe-eye">
          {/* A transparent pixel until the first frame is hovered: an <img>
              with no src at all counts as a broken image. */}
          <img
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt=""
            width={1}
            height={1}
            decoding="async"
          />
        </div>
      </div>

      <div
        className={`bhy-full ${fullOn ? "bhy-full--on" : ""}`}
        aria-hidden={!fullOn}
        onClick={closeFull}
      >
        <button
          type="button"
          className="bhy-full-close"
          aria-label={t.nav.close}
          tabIndex={fullOn ? 0 : -1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6 L18 18 M18 6 L6 18" />
          </svg>
        </button>
        {full ? <img src={full.src} alt={full.alt} decoding="async" /> : null}
      </div>
    </section>
  );
}
