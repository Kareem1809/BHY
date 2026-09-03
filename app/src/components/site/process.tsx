import type { SiteStrings } from "../../lib/i18n";
import { pic } from "../../lib/images";
import { Words } from "./words";

// How a project moves from the first conversation to the front door: four
// steps laid out like a ledger, each on its own hairline that draws itself
// as the reader arrives.
export function Process({ t }: { t: SiteStrings }) {
  return (
    <section id="process" data-band="light" className="bg-[#F5EFE6] py-28 md:py-36">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-16 px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p data-drift="24" className="bhy-eyebrow">
            {t.process.eyebrow}
          </p>
          <h2 data-words className="bhy-display-2 mt-6 text-[#3E2E23]">
            <Words text={t.process.title} />
          </h2>
          <p data-drift="36" className="mt-8 max-w-[34ch] text-base leading-relaxed text-[#6B5748]">
            {t.process.body}
          </p>
        </div>
        <ol className="md:col-span-8">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="bhy-step">
              <span data-rule aria-hidden="true" className="bhy-step-rule" />
              <span data-drift="40" dir="ltr" className="bhy-step-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div data-drift="56" className="bhy-step-body">
                <h3 className="bhy-display-4 text-[#3E2E23]">{step.title}</h3>
                <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-[#6B5748]">
                  {step.body}
                </p>
              </div>
              <figure
                data-drift="72"
                data-zoom={`/assets/process-${i + 1}.webp`}
                className="bhy-fig bhy-step-fig overflow-hidden"
              >
                <img
                  {...pic(`/assets/process-${i + 1}`, 1000)}
                  sizes="(min-width: 768px) 160px, 112px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
