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

  // Two copies back to back: the loop hands over from one to the other at
  // exactly half the track, so the seam is invisible.
  const words = [...t.ribbon, ...t.ribbon];

  return (
    <div ref={ref} aria-hidden="true" className="bhy-ribbon">
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
