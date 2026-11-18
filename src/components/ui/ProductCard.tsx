"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/data/products";
import { QuantityControl } from "@/components/ui/QuantityControl";

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, incrementItem, decrementItem } = useCart();
  const quantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
        {product.badge ? (
          <span className="absolute top-3 left-3 rounded-full bg-canvas/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-olive uppercase">
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-olive uppercase">
          {product.category}
        </p>
        <div className="space-y-2">
          <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-ink/75">
            {product.description}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="text-lg font-semibold tabular-nums">{formatCurrency(product.price)}</p>
        </div>
        <QuantityControl
          quantity={quantity}
          productName={product.name}
          onAdd={() => addItem(product)}
          onIncrement={() => incrementItem(product.id)}
          onDecrement={() => decrementItem(product.id)}
        />
      </div>
    </article>
  );
}
