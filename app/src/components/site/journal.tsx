import type { SiteStrings } from "../../lib/i18n";
import { Words } from "./words";

const ENTRIES = [
  { img: "/assets/journal-1.jpg", aspect: "aspect-[3/4]", offset: "" },
  { img: "/assets/journal-2.jpg", aspect: "aspect-square", offset: "md:mt-20" },
  { img: "/assets/journal-3.jpg", aspect: "aspect-[3/4]", offset: "md:mt-44" },
  { img: "/assets/journal-4.jpg", aspect: "aspect-[3/4]", offset: "md:mt-8" },
];

export function Journal({ t }: { t: SiteStrings }) {
  return (
    <section id="journal" className="bg-[#F5EFE6] pb-32 pt-28 md:pt-36">
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div className="text-center">
          <p data-drift="24" className="bhy-eyebrow">
            {t.journal.eyebrow}
          </p>
          <h2 data-words className="bhy-display-2 mt-4 text-[#3E2E23]">
            <Words text={t.journal.title} />
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:mt-24 md:grid-cols-4">
          {ENTRIES.map((entry, i) => (
            <article key={entry.img} data-drift={[36, 72, 24, 56][i]} className={entry.offset}>
              <figure data-img-reveal data-parallax className="bhy-fig overflow-hidden">
                <img
                  src={entry.img}
                  alt=""
                  loading="lazy"
                  className={`${entry.aspect} w-full object-cover`}
                />
              </figure>
              <h3 className="bhy-display-4 mt-5 text-[#3E2E23]">{t.journal.items[i]}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
