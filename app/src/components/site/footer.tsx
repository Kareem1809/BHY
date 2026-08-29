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
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12 md:py-20">
        <div data-drift="24" className="md:col-span-5">
          <div className="inline-block max-w-full rounded-sm border border-[#B67B62]/35 bg-[#FBF7F0] p-6 shadow-[0_1px_0_rgba(62,46,35,0.06)] md:p-8">
            <img
              src="/assets/logo.png"
              alt="Basma Haj Yahia, interior & architecture design"
              loading="lazy"
              className="w-72 max-w-full md:w-[26rem]"
            />
          </div>
        </div>
        <div data-drift="48" className="md:col-span-3">
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
