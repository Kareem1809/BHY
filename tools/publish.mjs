#!/usr/bin/env node
// شو هاد؟ زر النشر الوحيد لموقع basmahaj.com — بيشتغل على ماك وويندوز ولينكس بنفس الأمر.
// ليش؟ publish.sh كان sh بس (ما بيشتغل عالويندوز)، ومساعد الواتساب عالويندوز لازم ينشر بنفس الطريقة.
//
//   node tools/publish.mjs              بناء + نشر + فحص الموقع الحي
//   node tools/publish.mjs --build-only بناء بس (للتجربة، ما بينشر شي)
//   node tools/publish.mjs --no-verify  نشر بدون فحص الموقع بعده
//
// الخطوات (نفس publish.sh القديم بالزبط):
//   1. vite build مع HF_STATIC=1 (بيطلع HTML ثابت بدل Worker).
//   2. نسخ index.html → 404.html: Pages بتقدّم 404.html لأي عنوان مش ملف حقيقي، فالموقع
//      نفسه بيظهر (مع لوحة «الصفحة مش موجودة» تبعه) وبيرجّع 404 صح، وملف قديم محذوف
//      بيرجّع 404 بدل ما يرجّع الصفحة متنكّرة كـCSS (هاد اللي خرب الموقع مرة).
//   3. wrangler pages deploy على مشروع basmahaj (فرع main).
//   4. فحص: https://basmahaj.com/ بترجّع 200 وفيها <title>.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(ROOT, "app");
const OUT = join(APP, "dist", "client");
const PROJECT = "basmahaj";
const LIVE = "https://basmahaj.com/";
const args = new Set(process.argv.slice(2));

function run(cmd, cwd, env = {}) {
  console.log(`\n$ ${cmd}`);
  const r = spawnSync(cmd, { cwd, stdio: "inherit", shell: true, env: { ...process.env, ...env } });
  if (r.status !== 0) {
    console.error(`\n❌ فشل: ${cmd} (رمز ${r.status})`);
    process.exit(r.status ?? 1);
  }
}

if (!existsSync(join(APP, "node_modules"))) {
  console.error("❌ app/node_modules مش موجود — شغّل أول: cd app && npm ci");
  process.exit(1);
}

run("npx vite build", APP, { HF_STATIC: "1" });
copyFileSync(join(OUT, "index.html"), join(OUT, "404.html"));
console.log("✓ 404.html = index.html");

if (args.has("--build-only")) {
  console.log(`\n✅ البناء خلص (بدون نشر). الناتج: ${OUT}`);
  process.exit(0);
}

run(`npx wrangler pages deploy "${OUT}" --project-name ${PROJECT} --branch main --commit-dirty=true`, ROOT);

if (!args.has("--no-verify")) {
  // Pages بتاخد ثواني لحد ما النسخة الجديدة توصل لكل المواقع؛ 3 محاولات بفاصل 5 ثواني.
  let ok = false;
  for (let i = 1; i <= 3 && !ok; i++) {
    try {
      const res = await fetch(LIVE, { cache: "no-store" });
      const html = await res.text();
      ok = res.status === 200 && html.includes("<title>");
      console.log(`فحص ${i}/3: ${LIVE} → ${res.status}${ok ? " ✓" : ""}`);
    } catch (e) {
      console.log(`فحص ${i}/3: ما وصلت (${e.message})`);
    }
    if (!ok && i < 3) await new Promise((r) => setTimeout(r, 5000));
  }
  if (!ok) {
    console.error("❌ الموقع الحي ما رجّع 200 مع صفحة — افحص بإيدك قبل ما تقول «انتشر».");
    process.exit(2);
  }
}
console.log(`\n✅ انتشر وانفحص: ${LIVE}`);
