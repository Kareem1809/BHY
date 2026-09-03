import { useEffect, useState, type CSSProperties } from "react";

import {
  EMAIL_ADDRESS,
  INSTAGRAM_URL,
  type Lang,
  type SiteStrings,
  whatsappUrl,
} from "../../lib/i18n";
import { lockScroll } from "../../lib/motion";
import { InstagramGlyph, WhatsAppGlyph } from "./glyphs";

const LINKS = [
  ["#about", "about"],
  ["#portfolio", "portfolio"],
  ["#services", "services"],
  ["#process", "process"],
] as const;

const MENU_LINKS = [...LINKS, ["#contact", "contact"]] as const;

// The ink twin of the row above. It is painted, never touched: no links, no
// buttons, hidden from assistive technology, and clipped by motion.ts to
// exactly the part of the strip that currently sits over a light section.
// Same classes and same order as the real row, so the two line up to the
// pixel and a section edge cuts the lockup cleanly in half.
function GhostRow({ t }: { t: SiteStrings }) {
  return (
    <div className="bhy-nav-cut" aria-hidden="true">
      <div className="bhy-nav-row">
        <span className="bhy-logo-link">
          <img
            src="/assets/nav-mark.webp"
            alt=""
            width={796}
            height={802}
            className="bhy-logo"
          />
        </span>
        <div className="bhy-nav-controls">
          <span className="bhy-nav-links">
            {LINKS.map(([, key]) => (
              <span key={key} className="bhy-nav-link">
                {t.nav[key]}
              </span>
            ))}
          </span>
          <span className="bhy-lang">{t.langToggle}</span>
          <span className="bhy-nav-link bhy-nav-contact">{t.nav.contact}</span>
          <span className="bhy-burger">
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  );
}

type NavProps = {
  t: SiteStrings;
  lang: Lang;
  onToggleLang: () => void;
};

export function SiteNav({ t, lang, onToggleLang }: NavProps) {
  // The phone menu: a curtain of the five destinations. It is a sibling of
  // the strip, not a child, because a fixed element inside a transformed
  // parent would be boxed into that parent.
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    document.documentElement.classList.toggle("bhy-menu-open", open);
    lockScroll(open);
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove("bhy-menu-open");
      lockScroll(false);
    },
    [],
  );

  // At the foot of the page her lockup is printed large, and on a phone the
  // floating one lands right on top of it — the same mark twice on one screen.
  // So the floating one steps aside while the printed one is in view. Only the
  // class is set here; whether it means anything is the stylesheet's call, and
  // there it is a phone-width rule.
  useEffect(() => {
    const printed = document.querySelector("[data-footer-logo]");
    if (!printed) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.classList.toggle("bhy-logo-yield", entry.isIntersecting);
      },
      { rootMargin: "-8% 0px 0px 0px" },
    );
    watch.observe(printed);
    return () => {
      watch.disconnect();
      document.documentElement.classList.remove("bhy-logo-yield");
    };
  }, []);

  return (
    <>
      {/* No bar: the lockup and the links float on the page itself, on
          nothing. Legibility comes from painting the row twice, ivory and
          ink, and clipping the ink copy to whatever is light behind it. */}
      <header data-site-nav className="bhy-nav">
        <div className="bhy-nav-strip">
          <div className="bhy-nav-row">
            <a href="#top" onClick={close} className="bhy-logo-link" aria-label={t.brandLatin}>
              {/* The print for dark ground: her lockup in its own colours,
                  exposed up so the leaves stay green on the espresso instead of
                  going black. The ink twin below is the same artwork exposed
                  down, for paper and for the film's lit ceiling. */}
              <img
                src="/assets/nav-mark-light.webp"
                alt={t.brandLatin}
                width={796}
                height={802}
                className="bhy-logo"
              />
            </a>
            <div className="bhy-nav-controls">
              <nav aria-label={t.footer.menu} className="bhy-nav-links">
                {LINKS.map(([href, key]) => (
                  <a key={key} href={href} className="bhy-nav-link">
                    {t.nav[key]}
                  </a>
                ))}
              </nav>
              <button
                type="button"
                onClick={onToggleLang}
                className="bhy-lang"
                lang={lang === "he" ? "ar" : "he"}
              >
                {t.langToggle}
              </button>
              <a href="#contact" className="bhy-nav-link bhy-nav-contact">
                {t.nav.contact}
              </a>
              <button
                type="button"
                className="bhy-burger"
                aria-expanded={open}
                aria-controls="site-menu"
                aria-label={open ? t.nav.close : t.nav.menu}
                onClick={() => setOpen((value) => !value)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
          <GhostRow t={t} />
        </div>
      </header>

      <div id="site-menu" className="bhy-menu" aria-hidden={!open}>
        <nav aria-label={t.nav.menu} className="bhy-menu-nav">
          <ol>
            {MENU_LINKS.map(([href, key], i) => (
              <li key={key} style={{ "--i": i } as CSSProperties}>
                <a href={href} onClick={close} className="bhy-menu-link" tabIndex={open ? 0 : -1}>
                  <span dir="ltr" className="bhy-menu-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t.nav[key]}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="bhy-menu-foot">
          <button
            type="button"
            onClick={() => {
              onToggleLang();
              close();
            }}
            className="bhy-menu-lang"
            lang={lang === "he" ? "ar" : "he"}
            tabIndex={open ? 0 : -1}
          >
            {t.langToggle}
          </button>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="bhy-menu-social"
            tabIndex={open ? 0 : -1}
          >
            <InstagramGlyph className="w-5" />
            <span>{t.footer.socials[0].label}</span>
          </a>
          <a
            href={whatsappUrl(t.contact.whatsappText)}
            target="_blank"
            rel="noreferrer"
            className="bhy-menu-social"
            tabIndex={open ? 0 : -1}
          >
            <WhatsAppGlyph className="w-5" />
            <span>{t.footer.socials[1].label}</span>
          </a>
          <a
            href={`mailto:${EMAIL_ADDRESS}`}
            dir="ltr"
            className="bhy-menu-social"
            tabIndex={open ? 0 : -1}
          >
            {EMAIL_ADDRESS}
          </a>
        </div>
      </div>
    </>
  );
}
