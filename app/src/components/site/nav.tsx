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
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-6">
        <a href="#top" className="bhy-wordmark">
          {t.brandLatin}
        </a>
        <nav aria-label={t.footer.menu} className="hidden items-center gap-9 md:flex">
          {LINKS.map(([href, key]) => (
            <a key={key} href={href} className="bhy-nav-link">
              {t.nav[key]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-7">
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
