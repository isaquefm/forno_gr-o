const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number) {
  return brl.format(value);
}

export function parseMoney(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[R$\s]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}
