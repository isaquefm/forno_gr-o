import { formatCurrency, parseMoney } from "./currency";

export const fulfillmentOptions = [
  "Na mesa",
  "Retirada no balcão",
  "Entrega",
] as const;

export const paymentOptions = ["Pix", "Cartão na entrega", "Dinheiro"] as const;

export type Fulfillment = (typeof fulfillmentOptions)[number];
export type PaymentMethod = (typeof paymentOptions)[number];

export type CheckoutValues = {
  name: string;
  fulfillment: Fulfillment;
  tableNumber: string;
  address: string;
  payment: PaymentMethod;
  changeFor: string;
};

export type OrderLine = {
  name: string;
  quantity: number;
  lineTotal: number;
};

export type FieldErrors = Partial<
  Record<
    "name" | "tableNumber" | "address" | "changeFor" | "cart" | "whatsapp" | "auth",
    string
  >
>;

export const emptyCheckout: CheckoutValues = {
  name: "",
  fulfillment: "Na mesa",
  tableNumber: "",
  address: "",
  payment: "Pix",
  changeFor: "",
};

export function validateCheckout(
  values: CheckoutValues,
  itemCount: number,
  subtotal: number,
  phone: string,
  isLoggedIn: boolean,
): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();

  if (!isLoggedIn) {
    errors.auth = "Faça login com o Google para concluir seu pedido com segurança.";
  }

  if (itemCount === 0) {
    errors.cart = "Adicione ao menos um item para enviar o pedido.";
  }

  if (name.length < 2) {
    errors.name = "Informe o nome de quem vai receber o pedido.";
  }

  if (values.fulfillment === "Na mesa" && values.tableNumber.trim().length === 0) {
    errors.tableNumber = "Informe o número ou identificação da mesa.";
  }

  if (values.fulfillment === "Entrega" && values.address.trim().length < 6) {
    errors.address = "Informe rua, número e bairro.";
  }

  if (values.payment === "Dinheiro" && values.changeFor.trim()) {
    const changeFor = parseMoney(values.changeFor);
    if (changeFor === null) {
      errors.changeFor = "Informe um valor de troco válido.";
    } else if (changeFor < subtotal) {
      errors.changeFor = "O troco precisa cobrir o subtotal dos produtos.";
    }
  }

  if (!phone) {
    errors.whatsapp =
      "O WhatsApp da loja ainda não foi configurado. Preencha NEXT_PUBLIC_WHATSAPP_PHONE no .env.local e reinicie o servidor.";
  }

  return errors;
}

export function buildOrderMessage(
  values: CheckoutValues,
  lines: OrderLine[],
  subtotal: number,
  orderCode?: string,
  customerEmail?: string,
  trackingUrl?: string,
) {
  const header = orderCode
    ? `*🍞 Pedido ${orderCode} — Forno & Grão ☕*`
    : "*🍞 Pedido — Forno & Grão ☕*";

  const rows = [
    header,
    "",
    "Olá! Acabei de montar meu pedido pelo site da Forno & Grão:",
    "",
    `👤 *Cliente:* ${values.name.trim()}`,
  ];

  if (customerEmail) {
    rows.push(`📧 *E-mail (Google):* ${customerEmail.trim()}`);
  }

  let modalityLabel = "🏪 Retirada no balcão";
  if (values.fulfillment === "Na mesa") {
    modalityLabel = `🍽️ Consumo no Local — Mesa ${values.tableNumber.trim()}`;
  } else if (values.fulfillment === "Entrega") {
    modalityLabel = "🚚 Entrega em domicílio";
  }

  rows.push(`📍 *Modalidade:* ${modalityLabel}`);

  if (values.fulfillment === "Entrega") {
    rows.push(`🏠 *Endereço:* ${values.address.trim()}`);
  }

  rows.push(`💳 *Forma de Pagamento:* ${values.payment}`);

  if (values.payment === "Dinheiro" && values.changeFor.trim()) {
    const changeFor = parseMoney(values.changeFor);
    rows.push(
      `💵 *Troco para:* ${changeFor === null ? values.changeFor.trim() : formatCurrency(changeFor)}`,
    );
  }

  rows.push("", "🛒 *Itens do Pedido:*");
  lines.forEach((line) => {
    rows.push(
      `  • ${line.quantity}× ${line.name} — ${formatCurrency(line.lineTotal)}`,
    );
  });

  rows.push("", `💰 *Subtotal dos produtos:* ${formatCurrency(subtotal)}`);

  if (values.fulfillment === "Entrega") {
    rows.push("🛵 *Taxa de Entrega:* a combinar neste atendimento.");
  }

  if (trackingUrl) {
    rows.push("", `👀 *Acompanhe o status ao vivo:* ${trackingUrl}`);
  }

  rows.push(
    "",
    "Por favor, poderiam confirmar a disponibilidade e o prazo de preparo? Obrigado!",
  );

  return rows.join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
