"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { menuFilters, products, type MenuFilter } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function Menu() {
  const [filter, setFilter] = useState<MenuFilter>("Todos");
  const [search, setSearch] = useState("");

  const visibleProducts = useMemo(() => {
    const query = normalize(search);

    return products.filter((product) => {
      const inCategory = filter === "Todos" || product.category === filter;
      if (!inCategory) return false;
      if (!query) return true;

      const haystack = normalize([product.name, ...product.ingredients].join(" "));
      return haystack.includes(query);
    });
  }, [filter, search]);

  return (
    <section id="cardapio" className="scroll-mt-24 bg-surface/60 px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-olive uppercase">
            Cardápio digital
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-5xl">Peça direto da casa</h2>
          <p className="mt-4 text-ink/75">
            Escolha a categoria ou busque por nome e ingrediente. A sacola monta o pedido
            para o WhatsApp.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorias">
            {menuFilters.map((category) => {
              const selected = filter === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(category)}
                  className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selected
                      ? "bg-ink text-canvas"
                      : "bg-canvas text-ink hover:bg-canvas/70"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Buscar por nome ou ingrediente</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/50"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou ingrediente"
              className="h-12 w-full rounded-full border border-ink/10 bg-canvas pr-12 pl-11 text-sm outline-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full hover:bg-surface"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
        </div>

        <p className="mt-6 text-sm text-ink/60" aria-live="polite">
          {visibleProducts.length} {visibleProducts.length === 1 ? "item" : "itens"}
        </p>

        {visibleProducts.length > 0 ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl bg-canvas px-6 py-12 text-center">
            <p className="font-serif text-2xl">Nada encontrado</p>
            <p className="mt-2 text-sm text-ink/70">
              Tente outro nome, um ingrediente ou uma categoria diferente.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
