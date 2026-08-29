import type { Lang } from "../i18n";

/**
 * The public site is a static export — there is no server behind it to receive
 * the form — so the browser hands the message straight to FormSubmit, which
 * relays it to Basma's inbox. No API key is involved: the endpoint *is* the
 * address, and it only starts delivering once she confirms it (one activation
 * mail, sent on the very first submission). The address is already printed in
 * the footer, so posting to it here exposes nothing new.
 */
const RECIPIENT = "basmahaj99@gmail.com";
const ENDPOINT = `https://formsubmit.co/ajax/${RECIPIENT}`;

export type ContactMessage = {
  name: string;
  phone: string;
  email: string;
  message: string;
  lang: Lang;
  /** Honeypot: a human leaves it empty, a form-filling bot does not. */
  honey: string;
};

export async function sendContactMessage(data: ContactMessage) {
  if (data.honey) {
    // Silently swallow the bot: it gets the same answer a person does.
    return { ok: true as const };
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: `פנייה חדשה מהאתר — ${data.name}`,
      _template: "table",
      // AJAX submissions cannot show a captcha page, so it has to be off.
      _captcha: "false",
      // Hebrew keys below mean FormSubmit can't spot the sender's address on
      // its own; naming it here is what makes "Reply" in Gmail go to them.
      _replyto: data.email,
      שם: data.name,
      טלפון: data.phone,
      אימייל: data.email,
      הודעה: data.message,
      "שפת הפנייה": data.lang === "he" ? "עברית" : "ערבית",
    }),
  });

  const body = (await response.json().catch(() => null)) as { success?: unknown } | null;
  const ok = response.ok && String(body?.success) === "true";
  return { ok: ok as boolean };
}
