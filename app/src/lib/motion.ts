import { useEffect } from "react";

type Cleanup = () => void;

// Central motion director. Lenis smooth scroll is bridged to GSAP's ticker and
// every reveal is scrub-linked through data attributes, animating transform or
// clip only (never opacity-to-zero) so all content stays visible in any static
// capture:
//   data-drift="<px>"  vertical drift toward rest while the element scrolls in
//   data-img-reveal    clip-path bloom of an image frame
//   data-parallax      slow vertical parallax on the inner <img>
// Fully disabled under prefers-reduced-motion.
export function useSiteMotion(deps: readonly unknown[]) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: Cleanup = () => {};

    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")])
      .then(([gsapModule, scrollTriggerModule, lenisModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        const Lenis = lenisModule.default;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
          const nav = document.querySelector("[data-site-nav]");
          const hero = document.querySelector("[data-hero]");
          if (nav && hero) {
            ScrollTrigger.create({
              trigger: hero,
              start: "bottom top+=96",
              onEnter: () => nav.classList.add("bhy-nav-solid"),
              onLeaveBack: () => nav.classList.remove("bhy-nav-solid"),
            });
          }

          document.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
            const distance = Number(el.dataset.drift) || 48;
            gsap.fromTo(
              el,
              { y: distance },
              {
                y: 0,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 96%", end: "top 55%", scrub: true },
              },
            );
          });

          document.querySelectorAll<HTMLElement>("[data-img-reveal]").forEach((el) => {
            gsap.fromTo(
              el,
              { clipPath: "inset(10% 5% 10% 5%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 94%", end: "top 45%", scrub: true },
              },
            );
          });

          document.querySelectorAll<HTMLElement>("[data-parallax] img").forEach((img) => {
            gsap.fromTo(
              img,
              { yPercent: -6, scale: 1.12 },
              {
                yPercent: 6,
                scale: 1.12,
                ease: "none",
                scrollTrigger: {
                  trigger: img.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });
        });

        document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

        cleanup = () => {
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
