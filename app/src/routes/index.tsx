import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { StructuredData } from "../components/StructuredData";
import { About } from "../components/site/about";
import { Contact } from "../components/site/contact";
import { Footer } from "../components/site/footer";
import { Hero } from "../components/site/hero";
import { SiteNav } from "../components/site/nav";
import { CursorTrail } from "../components/site/trail";
import { Portfolio } from "../components/site/portfolio";
import { Process } from "../components/site/process";
import { Ribbon } from "../components/site/ribbon";
import { Services } from "../components/site/services";
import { WhatsAppFloat } from "../components/site/whatsapp";
import { STRINGS, type Lang } from "../lib/i18n";
import { useSiteMotion } from "../lib/motion";
import { FONTS_AR, JSON_LD } from "../lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
});

// A shared link (?lang=ar) wins over the reader's last choice, which wins
// over the Hebrew default.
function readLang(): Lang | null {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "ar" || fromUrl === "he") return fromUrl;
  try {
    const saved = window.localStorage.getItem("bhy-lang");
    if (saved === "ar" || saved === "he") return saved;
  } catch {
    // storage unavailable (private mode): keep the Hebrew default
  }
  return null;
}

function Index() {
  const [lang, setLang] = useState<Lang>("he");

  useEffect(() => {
    const chosen = readLang();
    if (chosen) setLang(chosen);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = "rtl";
    document.title = STRINGS[lang].seo.title;

    // The Arabic faces are fetched the first time they are needed, so a
    // Hebrew visit never pays for them.
    if (lang === "ar" && !document.querySelector("link[data-fonts-ar]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONTS_AR;
      link.dataset.fontsAr = "";
      document.head.appendChild(link);
    }

    // Keep the language in the address, so the page can be shared in Arabic.
    const url = new URL(window.location.href);
    if (lang === "ar") url.searchParams.set("lang", "ar");
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);

    try {
      window.localStorage.setItem("bhy-lang", lang);
    } catch {
      // storage unavailable: the toggle still works for this visit
    }
  }, [lang]);

  useSiteMotion([lang]);

  const t = STRINGS[lang];

  return (
    <div className="bhy-site" lang={lang}>
      <StructuredData json={JSON_LD} />
      <div className="bhy-progress" data-progress aria-hidden="true" />
      <SiteNav t={t} lang={lang} onToggleLang={() => setLang((l) => (l === "he" ? "ar" : "he"))} />
      <main>
        <Hero t={t} />
        <About t={t} />
        <Ribbon t={t} />
        <Portfolio t={t} />
        <Services t={t} />
        <Process t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} />
      <WhatsAppFloat t={t} />
      <CursorTrail />
    </div>
  );
}
