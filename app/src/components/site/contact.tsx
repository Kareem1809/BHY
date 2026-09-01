import { useState, type FormEvent } from "react";

import { sendContactMessage } from "../../lib/api/contact.email";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  type Lang,
  type SiteStrings,
  whatsappUrl,
} from "../../lib/i18n";
import { Arrow } from "./arrow";
import { InstagramGlyph, WhatsAppGlyph } from "./glyphs";
import { Words } from "./words";

type Status = "idle" | "sending" | "success" | "error";
type Field = "name" | "phone" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact({ t, lang }: { t: SiteStrings; lang: Lang }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      honey: String(data.get("_honey") ?? ""),
    };

    const nextErrors: Errors = {};
    if (!values.name) nextErrors.name = t.contact.required;
    if (!values.phone) nextErrors.phone = t.contact.required;
    if (!values.email) nextErrors.email = t.contact.required;
    else if (!EMAIL_RE.test(values.email)) nextErrors.email = t.contact.invalidEmail;
    if (!values.message) nextErrors.message = t.contact.required;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("sending");
    try {
      const result = await sendContactMessage({ ...values, lang });
      if (result.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("contact submit failed", error);
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="bg-[#FBF7F0] py-28 md:py-36">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-16 px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <p data-drift="24" className="bhy-eyebrow">
            {t.contact.eyebrow}
          </p>
          <h2 data-words className="bhy-display-2 mt-6 text-[#3E2E23]">
            <Words text={t.contact.title} />
          </h2>
          <p data-drift="36" className="mt-8 max-w-[40ch] text-base leading-relaxed text-[#6B5748]">
            {t.contact.body}
          </p>
          {/* The two doors people actually use, beside the form rather than
              buried in the footer. */}
          <div data-drift="48" className="mt-12 flex flex-col gap-9">
            <div>
              <p className="max-w-[36ch] text-sm leading-relaxed text-[#6B5748]">
                {t.contact.whatsappLead}
              </p>
              <a
                href={whatsappUrl(t.contact.whatsappText)}
                target="_blank"
                rel="noreferrer"
                className="bhy-cta-underline mt-4 text-[#3E2E23]"
              >
                <WhatsAppGlyph className="w-5" />
                <span>{t.contact.whatsappCta}</span>
              </a>
            </div>
            <div>
              <p className="max-w-[36ch] text-sm leading-relaxed text-[#6B5748]">
                {t.contact.instagramLead}
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="bhy-cta-underline mt-4 text-[#3E2E23]"
              >
                <InstagramGlyph className="w-5" />
                <span dir="ltr" className="font-latin text-lg tracking-[0.08em]">
                  @{INSTAGRAM_HANDLE}
                </span>
              </a>
            </div>
          </div>
        </div>
        <form data-drift="48" className="md:col-span-7" onSubmit={onSubmit} noValidate>
          <div className="flex flex-col gap-9">
            {/* Spam trap: invisible to people, irresistible to form-filling bots. */}
            <input
              type="text"
              name="_honey"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <div className="bhy-field">
              <label className="bhy-label" htmlFor="contact-name">
                {t.contact.name}
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                className="bhy-input"
              />
              {errors.name ? <p className="bhy-error">{errors.name}</p> : null}
            </div>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
              <div className="bhy-field">
                <label className="bhy-label" htmlFor="contact-phone">
                  {t.contact.phone}
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="bhy-input"
                />
                {errors.phone ? <p className="bhy-error">{errors.phone}</p> : null}
              </div>
              <div className="bhy-field">
                <label className="bhy-label" htmlFor="contact-email">
                  {t.contact.email}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="bhy-input"
                />
                {errors.email ? <p className="bhy-error">{errors.email}</p> : null}
              </div>
            </div>
            <div className="bhy-field">
              <label className="bhy-label" htmlFor="contact-message">
                {t.contact.message}
              </label>
              <textarea id="contact-message" name="message" className="bhy-input bhy-textarea" />
              {errors.message ? <p className="bhy-error">{errors.message}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <button type="submit" disabled={status === "sending"} className="bhy-submit">
                <span>{status === "sending" ? t.contact.sending : t.contact.submit}</span>
                <Arrow className="w-5" />
              </button>
              <p aria-live="polite" className="min-h-6 text-sm">
                {status === "success" ? (
                  <span className="text-[#B67B62]">{t.contact.success}</span>
                ) : null}
                {status === "error" ? (
                  <span className="text-[#9A3B2E]">{t.contact.error}</span>
                ) : null}
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
