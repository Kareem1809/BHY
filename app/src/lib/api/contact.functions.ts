import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(200),
      phone: z.string().trim().min(3).max(50),
      email: z.string().trim().email().max(200),
      message: z.string().trim().min(1).max(4000),
      lang: z.enum(["he", "ar"]),
    }),
  )
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) {
      console.error("submitContact: D1 binding is missing");
      return { ok: false as const };
    }
    try {
      await DB.prepare(
        "INSERT INTO contact_messages (name, phone, email, message, lang) VALUES (?1, ?2, ?3, ?4, ?5)",
      )
        .bind(data.name, data.phone, data.email, data.message, data.lang)
        .run();
      return { ok: true as const };
    } catch (error) {
      console.error("submitContact: insert failed", error);
      return { ok: false as const };
    }
  });
