import { useEffect } from "react";

type Cleanup = () => void;

// The live smooth-scroll instance, so the phone menu can hold the page still
// while it is open. Null before motion starts and under reduced motion, where
// the stylesheet's overflow lock does the job instead.
let activeLenis: { stop: () => void; start: () => void } | null = null;

export function lockScroll(locked: boolean) {
  if (locked) activeLenis?.stop();
  else activeLenis?.start();
}

// Central motion director. Lenis smooth scroll is bridged to GSAP's ticker and
// every scroll effect is scrub-linked WITH LAG (scrub: 0.9) so reveals ease
// behind the scroll instead of snapping to it. Bound through data attributes:
//   data-drift="<px>"   vertical drift toward rest
//   data-words          per-word rise of the .bhy-w-inner spans inside
//   data-img-reveal     the photograph eases back to rest inside its frame
//   data-grow           the block grows to full size as it arrives
//   data-rule           a hairline draws itself across
//   data-parallax       slow vertical parallax on the inner <img>
//   data-bg-parallax    parallax on a full-bleed background <img>
//   data-progress       page scroll-progress hairline
// Everything animates transform only (content is never hidden behind
// opacity). Under prefers-reduced-motion only the functional nav state runs.
export function useSiteMotion(deps: readonly unknown[]) {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-site-nav]");
    const whatsapp = document.querySelector("[data-whatsapp]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // The solid nav swap is contrast, not decoration: keep it working, and
      // the WhatsApp door still has to open once the reader is past the hero.
      const onScroll = () => {
        const past = window.scrollY > window.innerHeight * 0.8;
        nav?.classList.toggle("bhy-nav-solid", past);
        whatsapp?.classList.toggle("bhy-wa-show", past);
      };
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
        // shifted the About reveals past their range, so they sat frozen on
        // their final frame. This tells ScrollTrigger to ignore exactly that
        // resize (GSAP's documented fix for it).
        ScrollTrigger.config({ ignoreMobileResize: true });

        const lenis = new Lenis({
          autoRaf: false,
          lerp: 0.09,
          anchors: { offset: 0 },
        });
        activeLenis = lenis;
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

          // Scroll-driven film: the Higgsfield engine, nothing more. Fetch
          // the clip fully into memory, then each tick glide the playhead a
          // fifth of the way toward where the scroll points. Until the blob
          // lands the poster holds the opening frame, and playback joins
          // wherever the reader already is: one seek, no catch-up journey,
          // no source swapping.
          const film = document.querySelector<HTMLVideoElement>("[data-hero-film]");
          if (hero && film) {
            const density = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
            const big = density >= 2000;
            const clipUrl = (big ? film.dataset.srcHd : film.dataset.srcSm) ?? "";

            let filmLength = 0;
            let currentFrac = 0;
            let targetFrac = 0;
            let blobUrl = "";

            // The film stays invisible until the reader's first gesture; the
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
            // epsilon and never while a seek is in flight, because piled-up
            // seeks are what reads as stutter.
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
                  // scrolling its own height is the scrub track: no pin, no
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
              );

            // The copy and the veil deliberately do NOT ride the scrub. An
            // element whose opacity changes every frame on top of the video
            // costs the video its fast compositing path, and that, not the
            // decoding, the network or the engine, is the stutter that kept
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
            // Past the film the lockup shrinks and the WhatsApp door opens.
            // It never tucks away: it is the only masthead the page has, and
            // on a phone it carries the menu and the language switch.
            ScrollTrigger.create({
              trigger: hero,
              start: "bottom top+=96",
              onEnter: () => {
                nav.classList.add("bhy-nav-solid");
                whatsapp?.classList.add("bhy-wa-show");
              },
              onLeaveBack: () => {
                nav.classList.remove("bhy-nav-solid");
                whatsapp?.classList.remove("bhy-wa-show");
              },
            });

            // The lockup takes its colour from whatever is behind it. Every
            // section declares its ground with data-band, their edges are
            // cached in document coordinates on refresh, and each scroll
            // update is pure arithmetic on scrollY — no layout read, and one
            // string written only when it actually changes. The ink copy is
            // clipped to the light stretch, so an edge crossing the strip
            // splits the lockup in two colours at exactly that line.
            const cut = nav.querySelector<HTMLElement>(".bhy-nav-cut");
            const strip = nav.querySelector<HTMLElement>(".bhy-nav-strip");
            if (cut && strip) {
              type Band = { top: number; bottom: number; light: boolean; film: boolean };
              let bands: Band[] = [];
              let stripHeight = 0;
              let lastClip = "";
              let lastOnFilm: boolean | null = null;
              // Over the film the words have no fixed ground: they open on
              // dark wood and by a quarter of the way through they are on a lit
              // ceiling. So they ask the picture itself what they are standing
              // on, and print themselves accordingly — a 24x6 canvas takes the
              // patch of video under them and counts how much of it is dark.
              //
              // ONLY WHEN EVERYTHING HAS STOPPED. Reading pixels back from a
              // video texture stalls the pipeline: sampling ten times a second
              // cost every single frame of a full read of the page (237 of 237
              // over 24ms, a p99 of 35). Debounced behind the scroll and behind
              // the playhead's own seeks, it costs nothing while anything is
              // moving, and lands on the frame the reader actually stopped on.
              // Measuring the FILE instead would have been cheaper and wrong:
              // object-fit: cover crops the sides, so the dark corner the file
              // ends on is off screen at this width.
              //
              // 127 is where the two prints are equally legible: ink is
              // #3E2E23 (L 0.029), paper is #F5EFE6 (L 0.85), and the contrast
              // curves cross where the ground's luminance is 0.217.
              //
              // What is counted is the SHARE of the patch darker than that,
              // not its average, and the gap between the two thresholds is what
              // keeps a patch sitting near the line from flickering.
              //
              // Only the words are read this way. The mark's box ends the film
              // half over a bright ceiling and half over a dark cabinet, and no
              // single number for that box is honest: by average or by majority
              // it reads "dark" and would print her lockup in paper over a lit
              // wall, which is worse than the ink it replaces. Her mark keeps
              // the ink print over the film, where the ceiling behind it is
              // light at both ends of the scrub.
              const CROSSOVER = 127;
              let markInk = true;
              let wordsInk = true;
              const inked = (was: boolean, darkShare: number) =>
                was ? darkShare < 0.6 : darkShare < 0.4;

              const film = document.querySelector<HTMLVideoElement>("[data-hero-film]");
              const poster = document.querySelector<HTMLImageElement>(".bhy-hero-img img");
              const probe = document.createElement("canvas");
              probe.width = 24;
              probe.height = 6;
              const ink = probe.getContext("2d", { willReadFrequently: true });
              const markEl = cut.querySelector<HTMLElement>(".bhy-logo-link");
              const wordsEl = cut.querySelector<HTMLElement>(".bhy-nav-controls");

              // The luminance of the film under one box, in the film's own
              // pixels. The blob is same-origin, so the canvas stays readable.
              const groundUnder = (box: DOMRect, stage: DOMRect) => {
                // The poster is the film's own first frame, and it is there
                // before the clip is: at the top of the page, where the words
                // open on dark wood, it is the only thing to read.
                const shown =
                  film && film.readyState >= 2 && film.videoWidth
                    ? { src: film as CanvasImageSource, w: film.videoWidth, h: film.videoHeight }
                    : poster && poster.naturalWidth
                      ? { src: poster as CanvasImageSource, w: poster.naturalWidth, h: poster.naturalHeight }
                      : null;
                if (!ink || !shown) return null;
                const scale = Math.max(stage.width / shown.w, stage.height / shown.h);
                const offX = stage.left + (stage.width - shown.w * scale) / 2;
                const offY = stage.top + (stage.height - shown.h * scale) / 2;
                const sx = Math.max((box.left - offX) / scale, 0);
                const sy = Math.max((box.top - offY) / scale, 0);
                const sw = Math.min(box.width / scale, shown.w - sx);
                const sh = Math.min(box.height / scale, shown.h - sy);
                if (sw < 1 || sh < 1) return null;
                try {
                  ink.drawImage(shown.src, sx, sy, sw, sh, 0, 0, probe.width, probe.height);
                  const { data } = ink.getImageData(0, 0, probe.width, probe.height);
                  let dark = 0;
                  for (let i = 0; i < data.length; i += 4) {
                    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    if (y < CROSSOVER) dark += 1;
                  }
                  return dark / (data.length / 4);
                } catch {
                  return null;
                }
              };

              const readFilm = () => {
                if (!film || !wordsEl || !markEl) return;
                const stage = film.getBoundingClientRect();
                if (stage.height < 1) return;
                const words = groundUnder(wordsEl.getBoundingClientRect(), stage);
                if (words !== null) setWords(inked(wordsInk, words));
                const mark = groundUnder(markEl.getBoundingClientRect(), stage);
                if (mark !== null) setMark(inked(markInk, mark));
              };
              const setMark = (on: boolean) => {
                if (on === markInk) return;
                markInk = on;
                nav.style.setProperty("--bhy-ink-mark", on ? "1" : "0");
              };
              const setWords = (on: boolean) => {
                if (on === wordsInk) return;
                wordsInk = on;
                nav.style.setProperty("--bhy-ink-words", on ? "1" : "0");
              };

              const measureBands = () => {
                bands = Array.from(document.querySelectorAll<HTMLElement>("[data-band]"))
                  .map((el) => {
                    const rect = el.getBoundingClientRect();
                    const top = rect.top + window.scrollY;
                    return {
                      top,
                      bottom: top + rect.height,
                      light: el.dataset.band === "light",
                      film: el.hasAttribute("data-film"),
                    };
                  })
                  .sort((a, b) => a.top - b.top);
                lastClip = "";
                lastOnFilm = null;
              };

              const bandAt = (pos: number) => {
                for (const band of bands) if (pos >= band.top && pos < band.bottom) return band;
                return pos < bands[0].top ? bands[0] : bands[bands.length - 1];
              };

              const paint = (scroll: number) => {
                if (!bands.length || !stripHeight) return;
                const top = bandAt(scroll + 1);
                const bottom = bandAt(scroll + stripHeight - 1);
                let clip: string;
                if (top.light === bottom.light) {
                  clip = top.light ? "inset(0px 0px 0px 0px)" : "inset(100% 0px 0px 0px)";
                } else {
                  // the two bands touch, so their shared edge is the split
                  const edge = Math.round(top.bottom - scroll);
                  clip = top.light
                    ? `inset(0px 0px ${stripHeight - edge}px 0px)`
                    : `inset(${edge}px 0px 0px 0px)`;
                }
                if (clip !== lastClip) {
                  cut.style.clipPath = clip;
                  lastClip = clip;
                }
                const onFilm = top.film || bottom.film;
                if (onFilm !== lastOnFilm) {
                  nav.classList.toggle("bhy-nav-onfilm", onFilm);
                  lastOnFilm = onFilm;
                }

                // Only while the whole strip is inside the film. The moment it
                // straddles the hero's bottom edge the clip above is telling
                // the truth again, and these two must get out of its way.
                // The playhead glides toward the scroll for about a second
                // after the scrolling stops, so one reading at scroll time
                // would be of the frame BEFORE the one that lands. While the
                // strip is over the film a slow watch keeps looking; away from
                // it nothing runs at all.
                if (top.film && bottom.film) {
                  watchFilm();
                } else {
                  unwatchFilm();
                  setWords(true);
                  setMark(true);
                }
              };

              let pending = 0;
              let onFilmNow = false;
              const scheduleRead = () => {
                window.clearTimeout(pending);
                pending = window.setTimeout(readFilm, 180);
              };
              const watchFilm = () => {
                onFilmNow = true;
                scheduleRead();
              };
              const unwatchFilm = () => {
                onFilmNow = false;
                window.clearTimeout(pending);
                pending = 0;
              };
              // The playhead keeps gliding for about a second after the scroll
              // stops, so the last seek — not the last scroll — is the moment
              // the picture finally holds still.
              const onSeeked = () => {
                if (onFilmNow) scheduleRead();
              };
              film?.addEventListener("seeked", onSeeked);

              let lastScroll = 0;
              measureBands();
              const remeasure = () => {
                measureBands();
                paint(lastScroll);
              };
              ScrollTrigger.addEventListener("refresh", remeasure);
              // The strip is tall over the film and compact below it, and the
              // clip is expressed in pixels from its top: a stale height put
              // the split line in the wrong place, or past the end of the
              // strip entirely. The observer follows the real height through
              // the whole transition instead of guessing when it settles.
              const watchStrip = new ResizeObserver(() => {
                stripHeight = strip.offsetHeight;
                lastClip = "";
                paint(lastScroll);
              });
              watchStrip.observe(strip);
              navCleanup = () => {
                watchStrip.disconnect();
                unwatchFilm();
                film?.removeEventListener("seeked", onSeeked);
                ScrollTrigger.removeEventListener("refresh", remeasure);
              };
              ScrollTrigger.create({
                start: 0,
                end: "max",
                onUpdate: (self) => {
                  lastScroll = self.scroll();
                  paint(lastScroll);
                },
              });
            }
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
          // on the way up). Pure transform, so the compositor plays it.
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

          // Hairlines draw themselves from the reading edge as they arrive.
          document.querySelectorAll<HTMLElement>("[data-rule]").forEach((el) => {
            gsap.fromTo(
              el,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 96%", end: "top 62%", scrub: 0.9 },
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
          // be composited, so it repainted the image on every scroll frame,
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

        // Web fonts change every measurement; re-measure when they land,
        // including the Arabic pair that arrives only after a language switch.
        const onFonts = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(onFonts).catch(() => {});
        document.fonts?.addEventListener("loadingdone", onFonts);

        cleanup = () => {
          document.fonts?.removeEventListener("loadingdone", onFonts);
          filmCleanup();
          navCleanup();
          ctx.revert();
          gsap.ticker.remove(tick);
          if (activeLenis === lenis) activeLenis = null;
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
