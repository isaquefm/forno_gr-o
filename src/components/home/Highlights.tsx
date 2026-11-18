import { featuredProducts } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";

export function Highlights() {
  return (
    <section id="destaques" className="scroll-mt-24 px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-olive uppercase">
            O forno de hoje
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-5xl">Destaques da casa</h2>
          <p className="mt-4 text-ink/75">
            Três peças que sustentam a casa: pão de longa fermentação, focaccia do dia e o
            café coado na hora.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
