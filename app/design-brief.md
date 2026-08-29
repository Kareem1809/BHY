# Design brief — Basma Haj Yahia, interior & architecture design

**Design read.** Private and commercial clients in Israel (Hebrew first, Arabic toggle) hiring a boutique interior and architecture studio; the register is quiet luxury: warm, tactile, unhurried.

**Concept spine.** "The site is a plastered wall in changing light": every section is one troweled surface where imagery and type are revealed the way daylight moves across lime plaster. The user supplied a reference video of a complete landing-page design; that video is the binding specification for structure, layout and motion, re-branded to BHY.

**Delivery tier.** cinema (Lenis + GSAP scroll chapters; the reference video's reveal choreography is the motion contract).

**Locked palette** (override justified: these are the user's explicit brand colors, taken from the supplied BHY logo, which is cream paper + rose-gold copper + olive):
- `#F5EFE6` paper (page ground), `#FBF7F0` lifted panel
- `#EFE4D4` footer band
- `#3E2E23` ink (text), `#2A1E16` espresso (dark sections)
- `#B67B62` rose-gold copper (single accent), `#6B5748` muted caption
- `#7D7A4E` olive (imagery + tiny details only)

**Locked type** (serif justified: the brand logo is a serif/script luxury mark and the reference design is a high-contrast display serif):
- Hebrew: display "Frank Ruhl Libre", body "Assistant"
- Arabic: display "Amiri", body "Almarai"
- Latin wordmark/accents: "Cormorant Garamond"

**Animation mode:** non-animated — user's verbatim request: "I want the website thats inside of the video … make the motion itself seamless" (a faithful recreation of a specific reference landing page whose motion is load reveals + scroll-linked reveals + a project carousel, not a scroll-scrubbed film). Tier-1 mechanic: the reference video's choreography itself: staircase hero headline mask-rise on load over a full-bleed slow-scaling image, then Lenis-smoothed scrub reveals (clip-path image blooms, drifting type) per chapter, and an RTL project carousel with clip transitions. Interactive (scroll- and input-driven), not a passive loop.

**Section plan** (ordered; one layout family each, mirrored RTL from the reference):
1. Hero: full-bleed dark image, staircase 3-line display headline, side paragraph + underline CTA.
2. About: split 5/7, text start + two offset images end.
3. Portfolio: centered headline, editorial carousel (large image / meta column with counter, small swatch image, round arrows).
4. Services: dark chapter, text column + 2x2 offset white cards (01–04).
5. Journal: 4-column staggered masonry with titles.
6. Contact: split, statement + underline-field form (D1-backed).
7. Footer: cream band, wordmark + menu / social / rights.

**Eyebrow deviation (documented):** the reference video shows a small uppercase kicker on every chapter; the user's instruction to recreate that design overrides the eyebrow ration. Kickers appear on about/portfolio/services/journal/contact exactly as in the reference.

**Asset plan** (all generated on Higgsfield, palette-locked): hero dark interior 16:9; about pair (3:4 + 4:3); three portfolio pairs (3:4 + 1:1); four service card images 3:4; four journal images; regenerated BHY logo plate (footer + head kit source); launch cover scenes 3:2; hand-authored SVG monogram favicon + full head kit. Boards = `refs/f_*.jpg`, frames extracted from the user's reference video.

**CTA inventory** (one label per intent page-wide):
- "צרו קשר" (contact intent: nav + hero + services), hero garment: oversized text link with drawing underline + traveling arrow (the single rationed-trio garment on the page); services garment: split-label that slides to reveal the arrow underneath.
- "עוד עלינו" (about): arrow that travels along a drawn hairline path.
- "שליחת פנייה" (form submit): hairline press-block, :active imprint, arrow slide.
- Carousel arrows: round hairline badges, next filled on hover; lang toggle: small caps text with sliding hairline.
