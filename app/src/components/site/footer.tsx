import { makerWhatsappUrl, type SiteStrings } from "../../lib/i18n";
import { pic } from "../../lib/images";
import { Arrow } from "./arrow";

export function Footer({ t }: { t: SiteStrings }) {
  const links = [
    ["#about", t.nav.about],
    ["#portfolio", t.nav.portfolio],
    ["#services", t.nav.services],
    ["#process", t.nav.process],
  ] as const;

  return (
    <footer data-band="light" className="bg-[#EFE4D4]">
      {/* Same shape as the navbar: full-bleed, logo holding the right edge at the
          navbar's own inset, the columns riding beside it on the left. Keeping
          them on one row is what stops the text from dropping below the logo. */}
      <div className="grid w-full grid-cols-1 gap-12 px-5 py-16 md:grid-cols-3 md:items-start md:px-8 md:py-20">
        {/* A dedicated print of the lockup for the ivory band: denser strokes
            and a deeper bronze, baked into the file, no runtime filters. */}
        <img
          data-drift="24"
          data-footer-logo
          src="/assets/footer-logo.webp"
          alt="Basma Haj Yahia, architecture & interior design"
          width={1800}
          height={1001}
          loading="lazy"
          decoding="async"
          className="w-80 max-w-full shrink-0 md:w-[34rem] md:justify-self-start"
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
        <a href="#top" data-drift="40" className="bhy-top md:justify-self-end">
          <span>{t.footer.top}</span>
          <span className="bhy-top-ring">
            <Arrow className="w-4 rotate-90" />
          </span>
        </a>
      </div>
      <div className="border-t border-[#3E2E23]/15">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-[#6B5748]">
          <span>{t.footer.rights}</span>
          {/* Who built it. The lockup came as a mockup on a dark wall, so it
              keeps that ground and sits as a small badge rather than pretending
              to be artwork with an alpha channel. The link is SITENA's own
              WhatsApp, and it opens with the message already written. */}
          <a
            href={makerWhatsappUrl(t.footer.builtByText)}
            target="_blank"
            rel="noreferrer"
            className="bhy-maker"
            aria-label={`${t.footer.builtBy} — SITENA`}
          >
            <span className="bhy-maker-label">{t.footer.builtBy}</span>
            <img
              {...pic("/assets/sitena", 900)}
              sizes="(min-width: 768px) 168px, 140px"
              alt="SITENA — building technology solutions"
              width={900}
              height={387}
              loading="lazy"
              decoding="async"
              className="bhy-maker-mark"
            />
          </a>
          <span dir="ltr" className="font-latin tracking-[0.18em] text-[#94553A]">
            {t.taglineLatin}
          </span>
        </div>
      </div>
    </footer>
  );
}
