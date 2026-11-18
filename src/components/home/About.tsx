import Image from "next/image";
import { aboutImage } from "@/data/site";

export function About() {
  return (
    <section id="historia" className="scroll-mt-24 px-5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
          <Image
            src={aboutImage}
            alt="Grãos de café selecionados para a extração da casa"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-olive uppercase">
            Processo artesanal
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">Nossa história</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/80">
            <p>
              Cada pão da Forno & Grão começa no dia anterior. O levain trabalha devagar, a
              massa descansa, e o forno só entra quando a fermentação terminou o serviço.
              São cerca de 36 horas para uma casca crocante e um miolo que se conserva
              melhor.
            </p>
            <p>
              O café segue o mesmo critério. Grãos de origem escolhidos pela safra, torra
              recente e extração ajustada no balcão. A xícara muda com o lote e o pão muda
              com o dia. O pedido segue direto para a casa, sem aplicativo no meio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
