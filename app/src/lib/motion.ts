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
        // Phone browsers collapse and restore their URL bar while scrolling,
        // which fires a resize mid-scroll; a full ScrollTrigger refresh at
        // that moment recomputes every trigger against the new viewport and
        // shifted the About reveals past their range — they then sat frozen
        // on their final frame. This tells ScrollTrigger to ignore exactly
        // that resize (GSAP's documented fix for it).
        ScrollTrigger.config({ ignoreMobileResize: true });

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
        let navCleanup: Cleanup = () => {};

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

            // The film stays invisible until the reader's first gesture — the
            // poster underneath is the identical frame. The decoder warm-up
            // (a muted play/pause iOS insists on) visibly played a beat of
            // film on phones when it ran at load; tied to the first touch,
            // and done while the element is hidden, nothing ever moves on
            // its own. Same pattern as the Higgsfield engine's primeVideo.
            film.style.opacity = "0";
            const reveal = () => {
              film.style.opacity = "";
            };
            const prime = () => {
              if (!filmLength) {
                reveal();
                return;
              }
              film
                .play()
                .then(() => {
                  film.pause();
                  film.currentTime = Math.min(Math.max(currentFrac, 0), 0.999) * filmLength;
                  film.addEventListener("seeked", reveal, { once: true });
                })
                .catch(reveal);
            };
            const gestureOpts = { once: true, passive: true } as const;
            const onFirstGesture = () => {
              window.removeEventListener("touchstart", onFirstGesture);
              window.removeEventListener("wheel", onFirstGesture);
              window.removeEventListener("pointerdown", onFirstGesture);
              prime();
            };
            window.addEventListener("touchstart", onFirstGesture, gestureOpts);
            window.addEventListener("wheel", onFirstGesture, gestureOpts);
            window.addEventListener("pointerdown", onFirstGesture, gestureOpts);

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
            // Only while the film is on screen: this used to tick for the
            // whole length of the page, poking the video element on every
            // frame of every section below.
            let chasing = false;
            const startChase = () => {
              if (chasing) return;
              chasing = true;
              gsap.ticker.add(chase);
            };
            const stopChase = () => {
              if (!chasing) return;
              chasing = false;
              gsap.ticker.remove(chase);
            };
            startChase();
            const filmStage = document.querySelector<HTMLElement>("[data-hero-stage]");
            ScrollTrigger.create({
              trigger: hero,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => {
                if (self.isActive) {
                  startChase();
                  if (filmStage) filmStage.style.visibility = "";
                } else {
                  stopChase();
                  // takes the video out of the paint path entirely once the
                  // reader is past it, instead of leaving a live decoder
                  // sitting above every section below
                  if (filmStage) filmStage.style.visibility = "hidden";
                }
              },
            });

            filmCleanup = () => {
              stopChase();
              window.removeEventListener("touchstart", onFirstGesture);
              window.removeEventListener("wheel", onFirstGesture);
              window.removeEventListener("pointerdown", onFirstGesture);
              if (blobUrl) URL.revokeObjectURL(blobUrl);
            };

            const playhead = { p: 0 };
            gsap
              .timeline({
                scrollTrigger: {
                  // The section is 260svh tall and its stage is CSS-sticky, so
                  // scrolling its own height is the scrub track — no pin, no
                  // fixed positioning, nothing laid over the next section.
                  trigger: hero,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: true,
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
              ;

            // The copy and the veil deliberately do NOT ride the scrub. An
            // element whose opacity changes every frame on top of the video
            // costs the video its fast compositing path, and that — not the
            // decoding, the network or the engine — is the stutter that kept
            // moving around: it always sat exactly where this fade sat. So
            // the fade is one class toggle and a plain CSS transition, off
            // the per-frame path entirely.
            const stage = document.querySelector("[data-hero-stage]");
            if (stage) {
              ScrollTrigger.create({
                trigger: hero,
                start: "20% top",
                onEnter: () => stage.classList.add("bhy-film-clear"),
                onLeaveBack: () => stage.classList.remove("bhy-film-clear"),
              });
            }
          }

          if (nav && hero) {
            ScrollTrigger.create({
              trigger: hero,
              start: "bottom top+=96",
              onEnter: () => nav.classList.add("bhy-nav-solid"),
              onLeaveBack: () => nav.classList.remove("bhy-nav-solid"),
            });
            // Tuck the nav away while scrolling down, bring it back on the
            // first upward movement — but never during the film: the logo is
            // meant to hold the corner for the whole hero.
            // The hero's height is measured on refresh and cached: reading
            // offsetHeight inside onUpdate forced a layout flush on every
            // scroll frame of the whole page, right after GSAP had written
            // its transforms — layout thrashing, worst where the most tweens
            // run at once (Services), which is exactly where it showed.
            let heroHeight = (hero as HTMLElement).offsetHeight;
            const measureHero = () => {
              heroHeight = (hero as HTMLElement).offsetHeight;
            };
            ScrollTrigger.addEventListener("refresh", measureHero);
            navCleanup = () => ScrollTrigger.removeEventListener("refresh", measureHero);
            ScrollTrigger.create({
              start: 0,
              end: "max",
              onUpdate: (self) => {
                const pastHero = self.scroll() > heroHeight;
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

          // Scroll-linked growth: the element enters slightly small and
          // grows to full size as it comes down the page (and shrinks back
          // on the way up). Pure transform — the compositor plays it.
          document.querySelectorAll<HTMLElement>("[data-grow]").forEach((el) => {
            gsap.fromTo(
              el,
              { scale: 0.86 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 96%", end: "top 30%", scrub: 0.9 },
              },
            );
          });

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

          // The frame opens by easing its photograph back to rest inside a
          // fixed crop, not by animating clip-path: a clip-path tween cannot
          // be composited, so it repainted the image on every scroll frame —
          // the same repaint-per-frame cost that made the film hitch.
          document.querySelectorAll<HTMLElement>("[data-img-reveal]").forEach((el) => {
            const img = el.querySelector("img");
            if (!img) return;
            gsap.fromTo(
              img,
              { scale: 1.16 },
              {
                scale: 1,
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
          navCleanup();
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
