import { useEffect } from "react";

type Cleanup = () => void;

// Central motion director. Lenis smooth scroll is bridged to GSAP's ticker and
// every scroll effect is scrub-linked WITH LAG (scrub: 0.9) so reveals ease
// behind the scroll instead of snapping to it. Bound through data attributes:
//   data-drift="<px>"   vertical drift toward rest
//   data-words          per-word rise of the .bhy-w-inner spans inside
//   data-img-reveal     clip-path bloom of an image frame
//   data-parallax       slow vertical parallax on the inner <img>
//   data-bg-parallax    parallax on a full-bleed background <img>
//   data-progress       page scroll-progress hairline
// Everything animates transform or clip only (content is never hidden behind
// opacity). Under prefers-reduced-motion only the functional nav state runs.
export function useSiteMotion(deps: readonly unknown[]) {
  useEffect(() => {
    const nav = document.querySelector("[data-site-nav]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // The solid nav swap is contrast, not decoration: keep it working.
      const onScroll = () =>
        nav?.classList.toggle("bhy-nav-solid", window.scrollY > window.innerHeight * 0.8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    let cancelled = false;
    let cleanup: Cleanup = () => {};

    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")])
      .then(([gsapModule, scrollTriggerModule, lenisModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        const Lenis = lenisModule.default;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          autoRaf: false,
          lerp: 0.09,
          anchors: { offset: 0 },
        });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Verification hatch, localhost only: headless checks can pump
        // gsap.ticker.tick() by hand when the preview pane is hidden and
        // the browser freezes requestAnimationFrame. Inert in production.
        if (window.location.hostname === "localhost") {
          (window as unknown as Record<string, unknown>).__bhyMotion = { gsap, ScrollTrigger, lenis };
        }

        let filmCleanup: Cleanup = () => {};

        const ctx = gsap.context(() => {
          const hero = document.querySelector("[data-hero]");

          // Scroll-driven film: the hero pins for ~2.5 screens and scroll
          // progress becomes the playhead — the film never runs on its own,
          // scrolling down advances it, scrolling up rewinds it. The film is a
          // WebP still sequence painted onto a canvas: video-element scrubbing
          // stuttered (every currentTime write pays a 4K decode), while
          // drawImage of a ready frame is near-free, so this stays smooth.
          const filmCanvas = document.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
          const paint2d = filmCanvas?.getContext("2d");
          if (hero && filmCanvas && paint2d) {
            // Retina laptops and up read the 2880px frames; phones take the
            // 1440px cut and a quarter of the bytes.
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const density = window.innerWidth * dpr;
            const seqBase = density >= 2000 ? filmCanvas.dataset.seqUhd : filmCanvas.dataset.seqFhd;
            const FRAMES = Number(filmCanvas.dataset.frames) || 121;
            const frameUrl = (i: number) => `${seqBase}/${String(i).padStart(3, "0")}.webp`;

            const frames: (HTMLImageElement | undefined)[] = new Array(FRAMES);
            const ready = new Uint8Array(FRAMES);
            let shownFrame = -1;
            let targetFrame = 0;

            const sizeCanvas = () => {
              filmCanvas.width = Math.round(filmCanvas.clientWidth * dpr);
              filmCanvas.height = Math.round(filmCanvas.clientHeight * dpr);
              shownFrame = -1; // force a repaint at the new size
              paintNearest();
            };

            // cover-crop, same fit the old <video object-cover> had
            const paintFrame = (i: number) => {
              const img = frames[i];
              if (!img || !ready[i]) return;
              const cw = filmCanvas.width;
              const ch = filmCanvas.height;
              const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
              const dw = img.naturalWidth * scale;
              const dh = img.naturalHeight * scale;
              paint2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
              shownFrame = i;
            };

            // While the sequence streams in, show the closest frame that has
            // arrived — the film starts coarse and sharpens into place.
            const paintNearest = () => {
              for (let d = 0; d < FRAMES; d++) {
                const lo = targetFrame - d;
                const hi = targetFrame + d;
                if (lo >= 0 && ready[lo]) return paintFrame(lo);
                if (hi < FRAMES && ready[hi]) return paintFrame(hi);
              }
            };

            const loadFrame = (i: number) => {
              if (frames[i]) return;
              const img = new Image();
              img.decoding = "async";
              img.onload = () => {
                ready[i] = 1;
                // pre-decode off the main thread so first paint doesn't jank
                img.decode?.().catch(() => {});
                if (shownFrame !== targetFrame) paintNearest();
              };
              img.src = frameUrl(i);
              frames[i] = img;
            };

            // Two-wave load: every 6th frame first so scrubbing works within
            // the first second, then the gaps fill in and it turns buttery.
            for (let i = 0; i < FRAMES; i += 6) loadFrame(i);
            const fillTimer = window.setTimeout(() => {
              for (let i = 0; i < FRAMES; i++) loadFrame(i);
            }, 900);

            sizeCanvas();
            window.addEventListener("resize", sizeCanvas);
            filmCleanup = () => {
              window.clearTimeout(fillTimer);
              window.removeEventListener("resize", sizeCanvas);
            };

            const playhead = { p: 0 };
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: hero,
                  start: "top top",
                  end: "+=250%",
                  pin: true,
                  // M3 motion: the scroll→playhead mapping itself stays linear;
                  // easing lives only in this short catch-up lag (~300ms) so the
                  // film feels tied to the finger, responsive rather than floaty.
                  scrub: 0.3,
                  anticipatePin: 1,
                },
              })
              .to(
                playhead,
                {
                  p: 1,
                  ease: "none",
                  duration: 1,
                  onUpdate: () => {
                    targetFrame = Math.round(playhead.p * (FRAMES - 1));
                    if (targetFrame !== shownFrame) paintNearest();
                  },
                },
                0,
              )
              // The headline said its piece — it bows out over the first
              // quarter so the film takes the room (exit fade, not a reveal).
              .to("[data-hero-copy]", { opacity: 0, y: -64, ease: "none", duration: 0.25 }, 0)
              // ...and the legibility veil thins right out so the film reads
              // clean and bright once the text is gone.
              .to("[data-hero-veil]", { opacity: 0.3, ease: "none", duration: 0.3 }, 0);
          }

          if (nav && hero) {
            ScrollTrigger.create({
              trigger: hero,
              start: "bottom top+=96",
              onEnter: () => nav.classList.add("bhy-nav-solid"),
              onLeaveBack: () => nav.classList.remove("bhy-nav-solid"),
            });
            // Tuck the nav away while scrolling down, bring it back on the
            // first upward movement.
            ScrollTrigger.create({
              start: 0,
              end: "max",
              onUpdate: (self) => {
                const pastHero = self.scroll() > window.innerHeight * 0.6;
                nav.classList.toggle("bhy-nav-hidden", pastHero && self.direction === 1);
              },
            });
          }

          const progress = document.querySelector("[data-progress]");
          if (progress) {
            gsap.fromTo(
              progress,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
              },
            );
          }

          document.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
            const distance = Number(el.dataset.drift) || 48;
            gsap.fromTo(
              el,
              { y: distance },
              {
                y: 0,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 98%", end: "top 58%", scrub: 0.9 },
              },
            );
          });

          document.querySelectorAll<HTMLElement>("[data-words]").forEach((el) => {
            const words = el.querySelectorAll(".bhy-w-inner");
            if (!words.length) return;
            gsap.fromTo(
              words,
              { yPercent: 110 },
              {
                yPercent: 0,
                ease: "power2.out",
                stagger: 0.08,
                scrollTrigger: { trigger: el, start: "top 96%", end: "top 60%", scrub: 0.9 },
              },
            );
          });

          document.querySelectorAll<HTMLElement>("[data-img-reveal]").forEach((el) => {
            gsap.fromTo(
              el,
              { clipPath: "inset(12% 6% 12% 6%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 96%", end: "top 48%", scrub: 0.9 },
              },
            );
          });

          document.querySelectorAll<HTMLElement>("[data-parallax] img").forEach((img) => {
            gsap.fromTo(
              img,
              { yPercent: -7, scale: 1.14 },
              {
                yPercent: 7,
                scale: 1.14,
                ease: "none",
                scrollTrigger: {
                  trigger: img.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.9,
                },
              },
            );
          });

          document.querySelectorAll<HTMLElement>("[data-bg-parallax]").forEach((img) => {
            gsap.fromTo(
              img,
              { yPercent: -10, scale: 1.18 },
              {
                yPercent: 10,
                scale: 1.18,
                ease: "none",
                scrollTrigger: {
                  trigger: img.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.9,
                },
              },
            );
          });
        });

        document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

        cleanup = () => {
          filmCleanup();
          ctx.revert();
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      })
      .catch((error) => console.error("site motion failed to initialize", error));

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
