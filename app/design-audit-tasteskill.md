# tasteskill audit — bhy.co.il (2026-09-02)

Skill: `design-taste-frontend` (Leonxlnx/taste-skill), Section 11 redesign protocol
plus the Section 14 pre-flight matrix. Read-only pass. Nothing was changed, nothing
was pushed.

## Design read

Redesign / preserve: boutique interior + architecture studio landing for private and
commercial clients in Israel, Hebrew first with an Arabic toggle, quiet-luxury register,
leaning on the locked BHY palette and a scroll-scrubbed hero film. Existing dials read as
roughly VARIANCE 8 / MOTION 7 / DENSITY 3, which is right for the brief. The brand tokens,
IA, slugs, anchor ids, copy voice and analytics-visible field names all stay as they are.

## Pre-flight matrix

### Passing

| Check | Result |
|---|---|
| Em-dash ban (Section 9.G) | Zero in visible copy. The `—` hits in `portfolio.tsx`, `nav.tsx`, `words.tsx`, `ribbon.tsx` and `styles.css` are all inside code comments, never rendered. |
| Serif discipline | Frank Ruhl Libre / Amiri / Cormorant Garamond, justified by the logo mark; neither Fraunces nor Instrument Serif. |
| Hero fits the viewport | Subtext is 17 Hebrew words (cap 20), CTA visible without scrolling, no `pt` past the cap. |
| Colour consistency lock | `#B67B62` is the single accent across every section. The one other colour, `#9A3B2E`, is the form error state, which is semantic. |
| Shape consistency | One hairline-and-square system throughout; the round carousel and back-to-top badges are a documented, consistently applied exception. |
| Viewport stability | `h-[260svh]` / `h-[100svh]`, never `h-screen`. |
| Reduced motion | `motion.ts` bails to a class-toggle-only branch, plus two `@media (prefers-reduced-motion: reduce)` blocks in `styles.css`. |
| Form patterns | Label above, error below, no placeholder-as-label, honeypot, `aria-live` status, sending / success / error all present. |
| One CTA label per intent | `צרו קשר` in nav, hero and services; `שליחת פנייה` only on submit; WhatsApp and Instagram are distinct intents. |
| Real imagery | Every visual is a real generated asset with `srcset`. No div-based fake screenshots, no hand-rolled decorative SVG. |
| Section-layout repetition | Six distinct layout families (sticky film, split 5/7, centred carousel, dark 2x2 offset cards, ledger rows, split form). No zigzag run. |
| Production tells | No scroll cues, no locale or weather strip, no version labels, no section-number eyebrows, no decorative dots outside the ribbon, no pills over images, no filled progress tracks. |

### Failing or deviating

**1. Navigation height — real fail.** Measured at 1280x720: `.bhy-nav-row` is **175px** tall,
because `.bhy-logo` renders at 143px. The skill caps desktop nav at 80px, default 64-72px.
The lockup eats 24% of a 720px viewport, which is exactly the "huge agency nav bar" the rule
exists to stop. This is the one finding with no documented justification behind it.
Fix: cap the nav lockup around 56-64px tall and let the footer carry the large print.

**2. Eyebrow count — deviation, documented.** Five `bhy-eyebrow` kickers (about, portfolio,
services, process, contact) against a cap of `ceil(7/3) = 3`. `design-brief.md` records this
as an explicit override: the reference video puts a kicker on every chapter and the user asked
for that design recreated. Accepted, but it is the single strongest reason the page still reads
as templated at a glance. Dropping the two weakest kickers would cost nothing.

**3. `window.addEventListener("scroll")` — deviation, justified.** Two instances, both banned
outright by Section 5.D:
- `lib/motion.ts:42` — only inside the reduced-motion branch, where GSAP is never loaded. It
  toggles two classes, drives no animation.
- `portfolio.tsx:219` — passive, caches `scrollY` for the hover zoom panel specifically so the
  rAF loop never reads layout mid-frame. Removing it would reintroduce the thrash it was
  written to fix.
Both are defensible engineering; noted so the deviation is on the record, not silently carried.

**4. Hero headline is 3 lines** against a 2-line cap. This is the staircase headline from the
reference design and is in the brief. Deviation, documented.

**5. Two dark chapters.** Section 4.11 allows one deliberate theme switch per page as a colour-block
story; the page has two (hero, services). It works because both are the same espresso, but it is
one more flip than the rule allows.

**6. Empty `alt` on portfolio and section photography — genuine gap.** The portfolio thumbnails,
the about pair, the four service cards and the four process frames all ship `alt=""`. Only the
carousel hero image carries a real caption. For an interior-design studio these photographs are
the product, and image search is a real acquisition channel. Descriptive Hebrew and Arabic alt
text on the project frames is the highest-value accessibility and SEO fix on the page.

**7. Lockup contrast over the hero's opening frame — verify.** In the first-paint screenshot at
1280x720 the top-right lockup nearly vanishes into the bright plastered wall of the hero poster.
The nav already carries a ghost-row ink-clipping system for light ground, so the mechanism exists;
what needs checking is whether the hero's `data-band="light"` state actually clips the ink twin
over that particular frame, or whether the ivory print is left standing on cream.

## Recommendation

Levers 1 and 2 from Section 11.D, in this order, none of them structural:

1. Cap the nav lockup at 56-64px (finding 1).
2. Write real bilingual `alt` text for the project, service and process photography (finding 6).
3. Confirm the hero-frame lockup contrast (finding 7).
4. Optional: drop two of the five kickers (finding 2).

The IA, SEO surface, palette, type and motion contract are sound and should not be touched.
