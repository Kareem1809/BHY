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
      {/* Full-bleed like the navbar lockup: the logo answers the screen edge at
          the same inset, rather than stopping at the 1280px text column. No
          plate around it either — it sits straight on the band. */}
      <div data-drift="24" className="flex justify-start px-5 pt-16 md:px-8 md:pt-20">
        <img
          src="/assets/logo.png"
          alt="Basma Haj Yahia, interior & architecture design"
          loading="lazy"
          className="w-72 max-w-full md:w-[30rem]"
        />
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-6 pt-12 pb-16 md:grid-cols-12 md:pb-20">
        <div data-drift="48" className="md:col-span-3 md:col-start-6">
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
        <div data-drift="72" className="md:col-span-4">
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
