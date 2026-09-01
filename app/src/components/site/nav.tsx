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

type NavProps = {
  t: SiteStrings;
  lang: Lang;
  onToggleLang: () => void;
};

export function SiteNav({ t, lang, onToggleLang }: NavProps) {
  // The phone menu: a curtain of the five destinations. It is a sibling of
  // the bar, not a child, because the bar animates its transform and a fixed
  // element inside a transformed parent would be boxed into the bar.
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

  return (
    <>
      <header data-site-nav className="bhy-nav">
        {/* Full-bleed, not the 1280px content column: the logo hugs the right
            edge (the RTL start) instead of stopping at the text measure.
            Everything is top-aligned so the links sit high in the tall hero
            bar instead of floating at its vertical middle. */}
        <div className="bhy-nav-bar flex w-full items-start justify-between gap-6 px-5 md:px-8">
          <a href="#top" onClick={close} className="bhy-logo-link" aria-label={t.brandLatin}>
            <img
              src="/assets/logo.webp"
              alt={t.brandLatin}
              width={1800}
              height={1001}
              className="bhy-logo"
            />
          </a>
          {/* Menu, language and contact travel together on the left, held off
              the screen edge by the inline-end margin (the left side, in RTL). */}
          <div className="me-2 flex items-center gap-6 pt-6 md:me-12 md:gap-9 md:pt-8 xl:me-24">
            <nav aria-label={t.footer.menu} className="hidden items-center gap-9 md:flex">
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
            <a href="#contact" className="bhy-nav-link hidden sm:block">
              {t.nav.contact}
            </a>
            <button
              type="button"
              className="bhy-burger md:hidden"
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
