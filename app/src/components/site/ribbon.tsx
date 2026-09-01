import { useEffect, useRef } from "react";

import type { SiteStrings } from "../../lib/i18n";

// A slow strip of the studio's words between About and the projects. Pure
// CSS transform on one layer, and it only runs while it is actually on
// screen, so it costs the page nothing while the reader is elsewhere.
export function Ribbon({ t }: { t: SiteStrings }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) =>
      el.classList.toggle("bhy-ribbon-live", entry.isIntersecting),
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Two identical halves back to back: at the end of the run the track has
  // travelled exactly one half, so the second half is standing where the
  // first began and the loop hands over invisibly. For that to hold, ONE
  // half must be wider than the screen — otherwise the track runs out and
  // the reader watches the words drift away into an empty strip before the
  // jump back. The list is therefore repeated inside each half until it
  // comfortably clears the widest desktop.
  const half = [...t.ribbon, ...t.ribbon, ...t.ribbon];
  const words = [...half, ...half];

  return (
    <div ref={ref} aria-hidden="true" data-band="light" className="bhy-ribbon">
      <div className="bhy-ribbon-track">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="bhy-ribbon-word">
            {word}
            <i className="bhy-ribbon-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
