# What still helps — measured 2026-09-04

Numbers below are from the shipped build (`app/dist/client`), not estimates.

## 1. Smoothness — the live complaint

Kareem: «صار يقطع كثير» and «ليش بطل سموذ بعد ما غيرت لون الكتابة». The
colour-adapting lockup landed in 04b36ca / 5f26a87 / 2f4db2e, and the stutter
arrived with it. Three costs came in together; none of them has been ranked on
his machine yet.

**The rule from the last scroll saga (memory `scroll-scrub-recipe`): measure on
Kareem's own screen BEFORE fixing anything.** Headless Chrome renders in
software, which is exactly where a GPU cost is not a GPU cost — that is how I
twice concluded the readback was free. The method that ended the saga: inject a
rAF recorder logging `[frameDelta, scrollY]` plus a `longtask`
PerformanceObserver through Claude-in-Chrome, ask him to scrub the hero once,
bucket the drops (>24ms) by scroll position.

Suspects, in the order the recorded rules would rank them:

1. **Five live `drop-shadow` filters over the scrubbing film** —
   `styles.css:307-315`, phone only, active exactly while `.bhy-nav-onfilm` is
   on. Three on the ink print, two on the ivory one. The saga's verdict was
   blunt: *never carry a live CSS filter over the film* — a filter above a
   surface that repaints every frame is re-run every frame. Fix is the same one
   that worked then: bake the halo into the file. `tools/images.py --nav-prints`
   already prints `nav-mark.webp` / `nav-mark-light.webp`; give them a baked
   glow and delete the CSS filters.
2. **Two `opacity` transitions over the film** — `styles.css:288-295`, 0.35s,
   fired about 8 times per scrub. A single class-toggle transition was accepted
   last time; eight of them mid-scrub was never tested.
3. **Canvas readback of the film** — already cut from ~120 a second to 10
   (8200622). What remains is 10 GPU readbacks a second while scrubbing.
   If it still costs, the answer is the colour TABLE: sample the film offline
   into a small grid per time step and look it up at runtime — zero readbacks.
   It must be a grid in the film's OWN coordinates, because `object-fit: cover`
   crops the sides by an amount that depends on the window.

## 2. Weight

| what | now | note |
| --- | --- | --- |
| `hero-scrub-hd.mp4` | 7.6 MB | 1920×1080, 24fps, 241 frames, 6.3 Mbps, keyframe every 4 |
| `hero-scrub-sm.mp4` | 2.8 MB | 1024×576, same length, served under 2000 device px |
| `styles-*.css` | 62 KB gzip | mostly the unused scaffold component library |
| all JS | 154 KB gzip | |
| `public/presets/*.png` | 508 KB | scaffold leftovers, published for nothing — delete |

The film is fetched whole before it moves, so its size is the wait. The encode
is already at the recipe's settings (`-g 4`, CRF ~20); the only honest levers
left are a shorter clip or a third tier around 1600px.

## 3. The things that actually bring her clients

None of these are code. They are worth more than every millisecond above.

- Her real photograph and a real bio — the page still carries placeholders.
- Client testimonials.
- **Google Business Profile** (Taybeh / Haifa) and Search Console verification.
  For a local architect this is the single biggest lever on the whole list.
- `basma@basmahaj.com` through Cloudflare Email Routing.
- Still open since August: should every contact-form submission also copy
  `accountant@kareem00.com`?
