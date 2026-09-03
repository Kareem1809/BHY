import type { Lang } from "../i18n";

/**
 * The public site is a static export — there is no server behind it to receive
 * the form — so the browser hands the message straight to FormSubmit, which
 * relays it to Basma's inbox.
 *
 * This is the alias FormSubmit issued her when she confirmed the address, not
 * the address itself: the endpoint used to spell out her inbox in the page
 * source, where anything crawling the site could read it and post to it
 * directly. The alias is meant to be public — it is the whole point of it —
 * and it can be revoked and reissued without her ever changing her email.
 */
const ENDPOINT = "https://formsubmit.co/ajax/1072f74d2a71a6614befd4a43eb2a12e";

export type ContactMessage = {
  name: string;
  phone: string;
  email: string;
  message: string;
  lang: Lang;
  /** Honeypot: a human leaves it empty, a form-filling bot does not. */
  honey: string;
};

// FormSubmit stamps its mail in its own timezone, so the hour on the message
// is not the hour the enquiry was written. The real one is carried inside the
// mail instead, read from the sender's own clock and written in Israel time —
// the only clock that matters to whoever answers it.
function sentAt() {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}

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
      "מועד הפנייה": sentAt(),
    }),
  });

  const body = (await response.json().catch(() => null)) as { success?: unknown } | null;
  const ok = response.ok && String(body?.success) === "true";
  return { ok: ok as boolean };
}
