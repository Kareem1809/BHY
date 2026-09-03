import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import { SITE_URL, STRINGS } from "../lib/i18n";
import { FONTS_HE, OG_IMAGE } from "../lib/seo";

declare const __HF_DESIGN_INSPECTOR__: boolean;

// The page is served in Hebrew and switched to Arabic on the client, so the
// document head speaks Hebrew: that is what Google and every share card read.
const SEO = STRINGS.he.seo;

function buildHead() {
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SEO.title },
      { name: "description", content: SEO.description },
      { name: "author", content: "Basma Haj Yahia" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Basma Haj Yahia" },
      { property: "og:title", content: SEO.title },
      { property: "og:description", content: SEO.description },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Basma Haj Yahia, architecture & interior design" },
      { property: "og:locale", content: "he_IL" },
      { property: "og:locale:alternate", content: "ar_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SEO.title },
      { name: "twitter:description", content: SEO.description },
      { name: "twitter:image", content: OG_IMAGE },
      // Paper, not espresso: with no bar under it, a dark strip across the
      // top of the phone reads as exactly the bar this page does not have.
      { name: "theme-color", content: "#F5EFE6" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      { rel: "stylesheet", href: FONTS_HE },
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "alternate", hrefLang: "he", href: `${SITE_URL}/` },
      { rel: "alternate", hrefLang: "ar", href: `${SITE_URL}/?lang=ar` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}/` },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      // The file every browser asks for by name whether it is declared or
      // not — undeclared it was answering 404 on every first visit.
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

function Notice({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="bhy-site flex min-h-dvh flex-col items-center justify-center bg-[#F5EFE6] px-6 py-24 text-center text-[#3E2E23]">
      <p dir="ltr" className="bhy-eyebrow">
        {eyebrow}
      </p>
      <h1 className="bhy-display-2 mt-6">{title}</h1>
      <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-[#6B5748]">{body}</p>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8">{children}</div>
    </div>
  );
}

function NotFoundComponent() {
  const t = STRINGS.he.notFound;
  return (
    <Notice eyebrow="404" title={t.title} body={t.body}>
      <a href="/" className="bhy-cta-underline text-[#3E2E23]">
        <span>{t.home}</span>
      </a>
    </Notice>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <Notice
      eyebrow="Error"
      title="משהו השתבש"
      body="העמוד לא נטען כמו שצריך. אפשר לנסות שוב, או לחזור לעמוד הבית."
    >
      <button
        type="button"
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="bhy-cta-underline text-[#3E2E23]"
      >
        <span>לנסות שוב</span>
      </button>
      <a href="/" className="bhy-cta-underline text-[#3E2E23]">
        <span>{STRINGS.he.notFound.home}</span>
      </a>
    </Notice>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: buildHead,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" data-theme="default-dark" style={{ colorScheme: "light" }}>
      {/* Marketplace apps are permanently dark: data-theme is pinned on <html>
          above. Do not add quanta's bootstrapScript/ThemeController, a theme
          toggle, or a light mode. */}
      <head>
        <HeadContent />
      </head>
      <body className="bhy-body">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) {
      return;
    }

    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error ? error : new Error("Failed to load design inspector"),
          {
            boundary: "higgsfield_design_inspector_import",
          },
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
