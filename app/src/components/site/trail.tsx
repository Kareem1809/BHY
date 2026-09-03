import { useEffect, useRef } from "react";

// Six drawing-board marks — the tools a plan is made with — falling out of the
// pointer's wake. They are drawn once into a <defs> and stamped by <use>, so a
// pool of nodes costs one copy of the artwork, not fourteen.
//
// Rules this obeys, the same ones the rest of the page obeys: one rAF loop for
// the whole pool, transform and opacity only, no filters on a moving element,
// no layout read per frame (the bands are measured once and on resize), and
// nothing at all on a touch screen or under prefers-reduced-motion.

// Six of Lucide's own drawings — the family 21st.dev's icon community is
// built on (ISC, so they may simply be carried) — chosen for one subject:
// the tools a plan is drawn with, and the thing they draw.
const MARKS = [
  // drafting compass
  '<path d="m12.99 6.74 1.93 3.44"/><path d="M19.136 12a10 10 0 0 1-14.271 0"/><path d="m21 21-2.16-3.84"/><path d="m3 21 8.02-14.26"/><circle cx="12" cy="5" r="2"/>',
  // ruler
  '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  // pencil and ruler
  '<path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13"/><path d="m8 6 2-2"/><path d="m18 16 2-2"/><path d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  // set square
  '<path d="M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z"/>',
  // a house
  '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  // an opening
  '<line x1="22" x2="2" y1="6" y2="6"/><line x1="22" x2="2" y1="18" y2="18"/><line x1="6" x2="6" y1="2" y2="22"/><line x1="18" x2="18" y1="2" y2="22"/>',
] as const;

const POOL = 22;
const EVERY = 46; // px of travel between two throws
const BURST = 2; // marks per throw
const LIFE = 1150; // ms
const GRAVITY = 260; // px/s² — barely a settle, they mostly just stop
const DRAG = 0.09; // what is left of a speed after one second
const PEAK = 0.62; // a whisper, not a second cursor

type Fleck = {
  node: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  born: number;
  size: number;
  live: boolean;
};

export function CursorTrail() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    const flecks: Fleck[] = [];
    for (let i = 0; i < POOL; i += 1) {
      const node = document.createElement("i");
      node.className = "bhy-fleck";
      node.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#bhy-mark-0" /></svg>';
      root.append(node);
      flecks.push({ node, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, born: 0, size: 24, live: false });
    }

    // Which ground is a mark falling over? Measured once, and again on resize —
    // never in the loop. Ivory on the espresso sections, rose on the paper ones.
    let bands: { top: number; bottom: number; dark: boolean }[] = [];
    const measure = () => {
      bands = Array.from(document.querySelectorAll<HTMLElement>("[data-band]")).map((el) => {
        const box = el.getBoundingClientRect();
        return {
          top: box.top + window.scrollY,
          bottom: box.bottom + window.scrollY,
          dark: el.dataset.band === "dark",
        };
      });
    };
    measure();

    const bandAt = (y: number) => {
      const at = y + window.scrollY;
      for (const band of bands) if (at >= band.top && at < band.bottom) return band.dark;
      return false;
    };

    // A section says what it is, but the cards laid on it do not: the ivory
    // panels inside the espresso services block are light ground sitting in
    // a dark band, and an ivory mark landing there would vanish. So the real
    // ground is read where the mark lands — once per mark, never per frame —
    // and the band answers only when nothing under the point paints at all
    // (the hero, where the ground is a film).
    const inkAt = (x: number, y: number) => {
      let el = document.elementFromPoint(x, y) as HTMLElement | null;
      while (el && el !== document.documentElement) {
        const found = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor);
        if (found) {
          const [r, g, b, a = 1] = found[1].split(",").map(Number);
          if (a > 0.5) return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
        }
        el = el.parentElement;
      }
      return bandAt(y);
    };

    let lastX = 0;
    let lastY = 0;
    let seeded = false;
    let since = EVERY; // the first move already earns a mark
    let next = 0;
    let mark = 0;
    let running = false;
    let frame = 0;
    let previous = 0;

    // Thrown out of the pointer in every direction, then stopped almost at
    // once by the drag — a splash, not a comet's tail.
    const spawn = (x: number, y: number, vx: number, vy: number) => {
      const f = flecks[next];
      next = (next + 1) % POOL;
      mark = (mark + 1) % MARKS.length;
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 210;
      f.x = x;
      f.y = y;
      f.vx = Math.cos(angle) * speed + vx * 0.06;
      f.vy = Math.sin(angle) * speed + vy * 0.06;
      f.rot = Math.random() * 60 - 30;
      f.vr = (Math.random() - 0.5) * 110;
      f.size = 13 + Math.random() * 11;
      f.born = performance.now();
      f.live = true;
      const svg = f.node.firstElementChild as SVGElement;
      svg.firstElementChild?.setAttribute("href", `#bhy-mark-${mark}`);
      f.node.style.width = `${f.size}px`;
      // Ink for the ground it lands on, and a hairline of the opposite ink
      // under it so a rose mark never dissolves into a rose photograph. A
      // halo drawn INTO the artwork, not a CSS filter: a filter on something
      // this page moves every frame is the one thing that always costs.
      const dark = inkAt(x, y);
      f.node.style.color = dark ? "var(--bhy-paper)" : "var(--bhy-ink)";
      f.node.style.setProperty("--bhy-halo", dark ? "rgba(20,12,6,.55)" : "rgba(252,249,243,.75)");
      if (!running) {
        running = true;
        previous = performance.now();
        frame = requestAnimationFrame(step);
      }
    };

    function step(now: number) {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      let alive = 0;
      for (const f of flecks) {
        if (!f.live) continue;
        const age = now - f.born;
        if (age >= LIFE) {
          f.live = false;
          f.node.style.opacity = "0";
          continue;
        }
        alive += 1;
        const slow = DRAG ** dt;
        f.vx *= slow;
        f.vy = f.vy * slow + GRAVITY * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.rot += f.vr * dt;
        const t = age / LIFE;
        const rise = t < 0.14 ? t / 0.14 : 1;
        f.node.style.opacity = String(PEAK * (t < 0.14 ? rise : 1 - (t - 0.14) / 0.86));
        const scale = 0.72 + rise * 0.28;
        f.node.style.transform = `translate3d(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px, 0) rotate(${f.rot.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
      }
      if (alive === 0) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(step);
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (document.documentElement.classList.contains("bhy-menu-open")) return;
      const x = event.clientX;
      const y = event.clientY;
      if (!seeded) {
        seeded = true;
        lastX = x;
        lastY = y;
        return;
      }
      const dx = x - lastX;
      const dy = y - lastY;
      lastX = x;
      lastY = y;
      since += Math.hypot(dx, dy);
      if (since < EVERY) return;
      since = 0;
      for (let i = 0; i < BURST; i += 1) spawn(x, y, dx * 60, dy * 60);
    };

    const onLeave = () => {
      seeded = false;
      since = EVERY;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    const settle = window.setTimeout(measure, 1200);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      window.clearTimeout(settle);
      cancelAnimationFrame(frame);
      for (const f of flecks) f.node.remove();
    };
  }, []);

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          {MARKS.map((art, i) => (
            <g
              key={art}
              id={`bhy-mark-${i}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g
                stroke="var(--bhy-halo, transparent)"
                strokeWidth="3.8"
                dangerouslySetInnerHTML={{ __html: art }}
              />
              <g dangerouslySetInnerHTML={{ __html: art }} />
            </g>
          ))}
        </defs>
      </svg>
      <div ref={host} className="bhy-trail" aria-hidden="true" />
    </>
  );
}
