import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { About } from "../components/site/about";
import { Contact } from "../components/site/contact";
import { Footer } from "../components/site/footer";
import { Hero } from "../components/site/hero";
import { Journal } from "../components/site/journal";
import { SiteNav } from "../components/site/nav";
import { Portfolio } from "../components/site/portfolio";
import { Services } from "../components/site/services";
import { STRINGS, type Lang } from "../lib/i18n";
import { useSiteMotion } from "../lib/motion";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [lang, setLang] = useState<Lang>("he");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("bhy-lang");
      if (saved === "ar" || saved === "he") setLang(saved);
    } catch {
      // storage unavailable (private mode): keep the Hebrew default
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = "rtl";
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
      <div className="bhy-progress" data-progress aria-hidden="true" />
      <SiteNav t={t} lang={lang} onToggleLang={() => setLang((l) => (l === "he" ? "ar" : "he"))} />
      <main>
        <Hero t={t} />
        <About t={t} />
        <Portfolio t={t} />
        <Services t={t} />
        <Journal t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} />
    </div>
  );
}
