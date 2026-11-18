import { Clock, MapPin, Star } from "lucide-react";
import { address, hours, mapsUrl, reviews } from "@/data/site";

export function Location() {
  return (
    <section id="localizacao" className="scroll-mt-24 px-5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-olive uppercase">
            A casa
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-5xl">Onde estamos</h2>
          <div className="mt-8 space-y-6">
            <div className="flex gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-terracotta" aria-hidden="true" />
              <div>
                <p className="font-semibold">{address.street}</p>
                <p className="text-ink/75">
                  {address.neighborhood}
                  <br />
                  {address.city}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-1 size-5 shrink-0 text-terracotta" aria-hidden="true" />
              <dl className="w-full max-w-xs space-y-2 text-sm">
                {hours.map((slot) => (
                  <div key={slot.label} className="flex justify-between gap-6">
                    <dt className="text-ink/70">{slot.label}</dt>
                    <dd className="font-semibold">{slot.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-terracotta px-6 text-sm font-semibold text-canvas transition-colors hover:bg-terracotta-dark"
          >
            Abrir no Google Maps
          </a>
        </div>

        <ul className="grid gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-3xl bg-surface p-6">
              <div className="flex gap-1 text-olive" aria-label="5 de 5">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed">“{review.text}”</blockquote>
              <p className="mt-4 text-sm font-semibold">{review.name}</p>
              <p className="text-xs tracking-wide text-ink/60 uppercase">Cliente da casa</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
