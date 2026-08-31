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

          // Scroll-driven film, the proven Higgsfield mechanism: the hero pins
          // and every ticker frame the video's currentTime glides a fraction
          // of the way toward where the scroll points. Nothing ever plays on
          // its own; scrolling down advances the film, scrolling up rewinds
          // it. 1080p with a keyframe every 4 frames keeps each seek cheap —
          // the still-sequence experiments stuttered on laptop-class decode,
          // this glide does not. When the scroll rests, the razor-sharp
          // 2880px still of that exact frame fades in over the video.
          const film = document.querySelector<HTMLVideoElement>("[data-hero-film]");
          const sharpImg = document.querySelector<HTMLImageElement>("[data-hero-sharp]");
          if (hero && film) {
            const density = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
            const big = density >= 2000;
            const clipUrl = (big ? film.dataset.srcHd : film.dataset.srcSm) ?? "";
            const sharpBase = big ? film.dataset.sharpUhd : film.dataset.sharpFhd;
            const SHARP_FRAMES = Number(film.dataset.frames) || 241;

            let filmLength = 0;
            let clipObjectUrl = "";
            film.addEventListener(
              "loadedmetadata",
              () => {
                filmLength = film.duration;
                // muted inline play/pause wakes the decoder (iOS needs it)
                film.play().then(() => film.pause()).catch(() => {});
                ScrollTrigger.refresh();
              },
              { once: true },
            );
            // The Higgsfield engine's core trick: pull the whole clip into
            // memory first and play it from a blob — a seek against a blob
            // never touches the network, which is where streamed scrubbing
            // stutters. Until it lands, the poster holds the frame.
            fetch(clipUrl)
              .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
              .then((blob) => {
                clipObjectUrl = URL.createObjectURL(blob);
                film.src = clipObjectUrl;
                film.load();
              })
              .catch(() => {
                // fall back to streaming rather than showing nothing
                film.src = clipUrl;
                film.load();
              });

            // The chase, verbatim from the Higgsfield engine: glide a fifth
            // of the way toward the target each frame, skip while a seek is
            // in flight, and only write currentTime past a small epsilon —
            // piled-up seeks are exactly what reads as stutter.
            let currentFrac = 0;
            let targetFrac = 0;
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

            let settleTimer = 0;
            const hideSharp = () => {
              if (sharpImg) sharpImg.style.opacity = "0";
            };
            const settle = () => {
              if (!sharpImg || !filmLength || !sharpBase) return;
              const i = Math.round(targetFrac * (SHARP_FRAMES - 1));
              const want = `${sharpBase}/${String(i).padStart(3, "0")}.webp`;
              const show = () => {
                const decoded = sharpImg.decode ? sharpImg.decode().catch(() => {}) : Promise.resolve();
                decoded.then(() => {
                  // only if the visitor is still resting on this very frame
                  const j = Math.round(targetFrac * (SHARP_FRAMES - 1));
                  if (j === i) sharpImg.style.opacity = "1";
                });
              };
              if (sharpImg.src.endsWith(want)) show();
              else {
                sharpImg.onload = show;
                sharpImg.src = want;
              }
            };

            filmCleanup = () => {
              gsap.ticker.remove(chase);
              window.clearTimeout(settleTimer);
              if (clipObjectUrl) URL.revokeObjectURL(clipObjectUrl);
            };

            const playhead = { p: 0 };
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: hero,
                  start: "top top",
                  end: "+=185%",
                  pin: true,
                  // scrub feeds the target directly; the chase above is the
                  // only smoothing layer, exactly like the Higgsfield engine
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
                    hideSharp();
                    window.clearTimeout(settleTimer);
                    settleTimer = window.setTimeout(settle, 160);
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
