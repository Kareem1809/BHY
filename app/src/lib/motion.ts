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

          // Scroll-driven film — the Higgsfield engine, nothing more:
          // fetch the clip fully into memory, then each tick glide the
          // playhead a fifth of the way toward where the scroll points.
          // Until the blob lands the poster holds the opening frame, and
          // playback joins wherever the reader already is — one seek, no
          // catch-up journey, no source swapping.
          const film = document.querySelector<HTMLVideoElement>("[data-hero-film]");
          if (hero && film) {
            const density = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
            const big = density >= 2000;
            const clipUrl = (big ? film.dataset.srcHd : film.dataset.srcSm) ?? "";

            let filmLength = 0;
            let currentFrac = 0;
            let targetFrac = 0;
            let blobUrl = "";

            fetch(clipUrl)
              .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
              .then((blob) => {
                blobUrl = URL.createObjectURL(blob);
                film.addEventListener(
                  "loadedmetadata",
                  () => {
                    filmLength = film.duration;
                    currentFrac = targetFrac;
                    film.currentTime = currentFrac * filmLength;
                    // muted inline play/pause wakes the decoder (iOS needs it)
                    film.play().then(() => film.pause()).catch(() => {});
                  },
                  { once: true },
                );
                film.src = blobUrl;
                film.load();
              })
              .catch(() => {});

            // Glide toward the target; write currentTime only past a small
            // epsilon and never while a seek is in flight — piled-up seeks
            // are what reads as stutter.
            const epsilon = big ? 0.008 : 0.02;
            const chase = () => {
              if (!filmLength || film.seeking) return;
              currentFrac += (targetFrac - currentFrac) * 0.2;
              const t = Math.min(Math.max(currentFrac, 0), 0.999) * filmLength;
              if (Math.abs(film.currentTime - t) > epsilon) {
                try {
                  film.currentTime = t;
                } catch {
                  // keep the last painted frame while the browser catches up
                }
              }
            };
            gsap.ticker.add(chase);

            filmCleanup = () => {
              gsap.ticker.remove(chase);
              if (blobUrl) URL.revokeObjectURL(blobUrl);
            };

            const playhead = { p: 0 };
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: hero,
                  start: "top top",
                  end: "+=185%",
                  pin: true,
                  scrub: true,
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
                    targetFrac = playhead.p;
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
