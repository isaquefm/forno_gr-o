import Image from "next/image";
import { heroImage } from "@/data/site";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-28 pb-16 lg:grid-cols-2 lg:pt-32 lg:pb-24">
      <div className="max-w-xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-olive uppercase">
          Padaria artesanal · Vila Madalena
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.05] sm:text-6xl">
          Fermentação lenta e café de origem, do forno para a sua mesa.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink/75 sm:text-lg">
          Peça direto pelo WhatsApp, sem taxa de aplicativo. Retire no balcão ou receba em
          casa — o valor da entrega a gente combina com você.
        </p>
        <a
          href="#cardapio"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-terracotta px-6 text-sm font-semibold text-canvas transition-colors hover:bg-terracotta-dark"
        >
          Fazer Pedido Agora
        </a>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
        <Image
          src={heroImage}
          alt="Pães artesanais recém-assados na bancada da padaria"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
