import { type SiteStrings, whatsappUrl } from "../../lib/i18n";
import { WhatsAppGlyph } from "./glyphs";

// The one door most clients actually use. It stays out of the film and
// appears once the reader is past the hero (a class toggle from motion.ts,
// never a per-frame write); a circle on phones, a pill with the label on
// wider screens.
export function WhatsAppFloat({ t }: { t: SiteStrings }) {
  return (
    <a
      data-whatsapp
      href={whatsappUrl(t.contact.whatsappText)}
      target="_blank"
      rel="noreferrer"
      className="bhy-wa"
      aria-label={t.contact.whatsappCta}
    >
      <WhatsAppGlyph className="w-6 shrink-0" />
      <span className="bhy-wa-label">{t.contact.whatsappCta}</span>
    </a>
  );
}
