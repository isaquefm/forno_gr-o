"use client";

import { Minus, Plus } from "lucide-react";

type QuantityControlProps = {
  quantity: number;
  productName: string;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function QuantityControl({
  quantity,
  productName,
  onAdd,
  onIncrement,
  onDecrement,
}: QuantityControlProps) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-terracotta px-4 text-sm font-semibold text-canvas transition-colors hover:bg-terracotta-dark"
      >
        <Plus className="size-4" aria-hidden="true" />
        Adicionar
      </button>
    );
  }

  return (
    <div className="flex h-11 w-full items-center justify-between rounded-full bg-canvas px-1 text-ink">
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Diminuir quantidade de ${productName}`}
        className="grid size-9 cursor-pointer place-items-center rounded-full transition-colors hover:bg-surface"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Aumentar quantidade de ${productName}`}
        className="grid size-9 cursor-pointer place-items-center rounded-full transition-colors hover:bg-surface"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
