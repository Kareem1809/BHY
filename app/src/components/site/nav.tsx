import type { Lang, SiteStrings } from "../../lib/i18n";

const LINKS = [
  ["#about", "about"],
  ["#portfolio", "portfolio"],
  ["#services", "services"],
  ["#journal", "journal"],
] as const;

type NavProps = {
  t: SiteStrings;
  lang: Lang;
  onToggleLang: () => void;
};

export function SiteNav({ t, lang, onToggleLang }: NavProps) {
  return (
    <header data-site-nav className="bhy-nav">
      {/* Full-bleed, not the 1280px content column: the logo hugs the right edge
          (the RTL start) instead of stopping at the text measure. Everything is
          top-aligned so the links sit high in the tall hero bar instead of
          floating at its vertical middle. */}
      <div className="bhy-nav-bar flex w-full items-start justify-between gap-6 px-5 md:px-8">
        <a href="#top" className="bhy-logo-link" aria-label={t.brandLatin}>
          <img
            src="/assets/logo.png"
            alt={t.brandLatin}
            width={1393}
            height={734}
            className="bhy-logo"
          />
        </a>
        {/* Menu, language and contact travel together on the left, held off the
            screen edge by the inline-end margin (the left side, in RTL). */}
        <div className="me-2 flex items-center gap-7 pt-6 md:me-12 md:gap-9 md:pt-8 xl:me-24">
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
        </div>
      </div>
    </header>
  );
}
