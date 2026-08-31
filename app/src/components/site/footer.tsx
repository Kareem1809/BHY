import type { SiteStrings } from "../../lib/i18n";

export function Footer({ t }: { t: SiteStrings }) {
  const links = [
    ["#about", t.nav.about],
    ["#portfolio", t.nav.portfolio],
    ["#services", t.nav.services],
    ["#journal", t.nav.journal],
  ] as const;

  return (
    <footer className="bg-[#EFE4D4]">
      {/* Same shape as the navbar: full-bleed, logo holding the right edge at the
          navbar's own inset, the columns riding beside it on the left. Keeping
          them on one row is what stops the text from dropping below the logo. */}
      <div className="grid w-full grid-cols-1 gap-12 px-5 py-16 md:grid-cols-3 md:items-start md:px-8 md:py-20">
        <img
          data-drift="24"
          src="/assets/logo.png"
          alt="Basma Haj Yahia, architecture & interior design"
          loading="lazy"
                      decoding="async"
          className="w-72 max-w-full shrink-0 md:justify-self-start md:w-[30rem]"
        />
        <div className="flex flex-col gap-12 sm:flex-row sm:gap-16 md:justify-self-center md:gap-24">
          <div data-drift="48">
            <p className="bhy-label">{t.footer.menu}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {links.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="bhy-nav-link text-[#3E2E23]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div data-drift="72">
            <p className="bhy-label">{t.footer.follow}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {t.footer.socials.map(({ label, href }) => {
                const external = href.startsWith("http");
                // The email entry shows the address itself, which is Latin and has
                // to stay LTR inside this RTL column.
                const isMail = href.startsWith("mailto:");
                return (
                  <li key={href}>
                    <a
                      href={href}
                      className="bhy-nav-link text-[#3E2E23]"
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      {...(isMail ? { dir: "ltr" as const } : {})}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[#3E2E23]/15">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-[#6B5748]">
          <span>{t.footer.rights}</span>
          <span dir="ltr" className="font-latin tracking-[0.18em] text-[#B67B62]">
            {t.taglineLatin}
          </span>
        </div>
      </div>
    </footer>
  );
}
