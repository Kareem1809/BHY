import { EMAIL_ADDRESS, INSTAGRAM_URL, PHONE_INTL, SITE_URL, STRINGS } from "./i18n";

// Only the weights the stylesheet actually uses: display 500, wordmark 600,
// body 400. The Arabic pair is fetched on demand when the reader switches
// language (see routes/index.tsx), so a Hebrew visit never pays for it.
export const FONTS_HE =
  "https://fonts.googleapis.com/css2?family=Assistant:wght@400&family=Cormorant+Garamond:wght@500;600&family=Frank+Ruhl+Libre:wght@500&display=swap";
export const FONTS_AR =
  "https://fonts.googleapis.com/css2?family=Almarai:wght@400&family=Amiri:wght@400&display=swap";

export const OG_IMAGE = `${SITE_URL}/assets/og.jpg`;

// What Google reads about the studio: a local business with a phone, an
// Instagram, the towns of the published projects and both languages. Only
// facts that already appear on the page; no street address is claimed.
export const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${SITE_URL}/#studio`,
  name: "בסמה חאג' יחיא | אדריכלות ועיצוב פנים",
  alternateName: ["Basma Haj Yahia", "بسمة حاج يحيى"],
  description: STRINGS.he.seo.description,
  url: SITE_URL,
  image: OG_IMAGE,
  logo: `${SITE_URL}/assets/logo.webp`,
  telephone: `+${PHONE_INTL}`,
  email: EMAIL_ADDRESS,
  sameAs: [INSTAGRAM_URL],
  founder: { "@type": "Person", name: "בסמה חאג' יחיא" },
  areaServed: [
    { "@type": "City", name: "טייבה" },
    { "@type": "City", name: "חיפה" },
    { "@type": "City", name: "קצרין" },
    { "@type": "Country", name: "ישראל" },
  ],
  knowsAbout: ["עיצוב פנים", "אדריכלות", "תכנון בתים פרטיים", "סטיילינג", "ליווי ופיקוח"],
  knowsLanguage: ["he", "ar"],
});
