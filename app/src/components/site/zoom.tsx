import { useEffect, useRef, useState } from "react";

import type { SiteStrings } from "../../lib/i18n";
import { lockScroll } from "../../lib/motion";

// The one glass and the one full screen for the whole page. Any <figure> that
// names a print in data-zoom is enlarged by both: hover lays the glass on it,
// a click gives it the screen. It listens on the document rather than on a
// section, so a photograph anywhere on the page is covered by the same code
// and there is only ever one panel in the DOM.
export function Zoom({ t }: { t: SiteStrings }) {
  const loupe = useRef<HTMLDivElement>(null);
  // The picture given the whole screen. It keeps rendering while it closes,
  // so the fade out has something to fade.
  const [full, setFull] = useState<{ src: string; alt: string } | null>(null);
  const [fullOn, setFullOn] = useState(false);
  const closeTimer = useRef(0);
  // Read inside the pointer loop, which must not re-run on every state change.
  const isOpen = useRef(false);

  // The panel is always in the DOM, so opening it is one commit: the picture
  // and the class together. It used to raise the class in a rAF a frame later
  // — which opened the first picture and then silently failed on every one
  // after it, since by then the two updates were landing in different frames.
  const openFull = (src: string, alt: string) => {
    if (!src) return;
    window.clearTimeout(closeTimer.current);
    isOpen.current = true;
    setFull({ src, alt });
    setFullOn(true);
  };
  const closeFull = () => {
    isOpen.current = false;
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

  useEffect(() => {
    // The full screen belongs to every reader, so this listener is registered
    // unconditionally. It used to sit inside the glass effect below, which
    // returns early on a touch screen — and a tap opened nothing at all.
    const onOpen = (event: MouseEvent) => {
      const figure = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-zoom]");
      if (!figure || figure.closest(".bhy-slide--idle, .bhy-slide--leaving")) return;
      openFull(figure.dataset.zoom ?? "", figure.querySelector("img")?.alt ?? "");
    };
    document.addEventListener("click", onOpen);
    return () => document.removeEventListener("click", onOpen);
  }, []);

  useEffect(() => {
    // A round glass laid on the frame under the pointer: the real print at
    // twice life size, cropped to exactly what the glass covers. Mouse only —
    // a finger has no hover, and on a phone a tap opens the picture instead.
    const panel = loupe.current;
    if (!panel) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const eye = panel.firstElementChild as HTMLElement;
    const big = eye.querySelector("img") as HTMLImageElement;

    const ZOOM = 2;
    // While a picture holds the screen, the glass has no business existing.
    const shut = () =>
      isOpen.current || document.documentElement.classList.contains("bhy-menu-open");
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
      if (shut()) {
        hide();
        return;
      }
      if (showing && stillOnIt()) return;
      at(pointerX, pointerY);
    };
    // What sits under a still pointer changes on its own: the page scrolls,
    // or the reader clicks through to the next project. Listening for the
    // pointer alone left them waving the mouse to wake the preview up.
    const lookAgain = () => {
      review = 0;
      if (pointerX < 0 || shut()) return;
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
    // A click changes what is under a pointer that has not moved — and if it
    // opened a picture, the glass has no business staying on screen.
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest("[data-zoom]")) hide();
      onChange();
    };

    document.addEventListener("pointermove", onPointer);
    document.addEventListener("pointerover", onPointer);
    document.addEventListener("pointerleave", hide);
    document.addEventListener("keydown", onChange);
    document.addEventListener("click", onClick);
    document.addEventListener("animationend", onChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      document.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerover", onPointer);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("keydown", onChange);
      document.removeEventListener("click", onClick);
      document.removeEventListener("animationend", onChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onChange);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(review);
    };
  }, []);

  return (
    <>
      {/* One glass for the whole page: it only ever holds the print of the
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
    </>
  );
}
