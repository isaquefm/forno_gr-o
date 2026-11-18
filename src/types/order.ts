export const orderStatuses = [
  "novo",
  "confirmado",
  "preparando",
  "pronto",
  "entregue",
  "cancelado",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const statusLabels: Record<OrderStatus, string> = {
  novo: "Novo pedido",
  confirmado: "Confirmado",
  preparando: "Preparando",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const statusCustomerDescriptions: Record<OrderStatus, string> = {
  novo: "Seu pedido foi recebido pelo balcão e aguarda confirmação da equipe.",
  confirmado: "Pedido aceito! A equipe já está organizando os itens da sua comanda.",
  preparando: "Massa no forno e café sendo extraído com grãos selecionados.",
  pronto: "Tudo quentinho e pronto! Em instantes estará com você.",
  entregue: "Pedido finalizado e entregue. Bom apetite e aproveite!",
  cancelado: "Este pedido foi cancelado. Fale com a equipe se precisar de ajuda.",
};

export const statusColors: Record<OrderStatus, string> = {
  novo: "bg-terracotta/15 text-terracotta-dark border-terracotta/30",
  confirmado: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-400/30",
  preparando: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/30",
  pronto: "bg-olive/20 text-olive dark:text-olive border-olive/30",
  entregue: "bg-olive/10 text-olive/70 dark:text-olive/60 border-olive/20",
  cancelado: "bg-ink/10 text-ink/50 border-ink/20",
};

/** Próximo status lógico no fluxo do pedido. */
export const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  novo: "confirmado",
  confirmado: "preparando",
  preparando: "pronto",
  pronto: "entregue",
};

export const nextStatusAction: Partial<Record<OrderStatus, string>> = {
  novo: "Confirmar Pedido",
  confirmado: "Iniciar Preparo",
  preparando: "Marcar como Pronto",
  pronto: "Concluir / Entregue",
};

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type FulfillmentType = "Na mesa" | "Retirada no balcão" | "Entrega";

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerEmail?: string;
  fulfillment: FulfillmentType;
  tableNumber?: string;
  address?: string;
  payment: "Pix" | "Cartão na entrega" | "Dinheiro";
  changeFor?: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail?: string;
  fulfillment: FulfillmentType;
  tableNumber?: string;
  address?: string;
  payment: "Pix" | "Cartão na entrega" | "Dinheiro";
  changeFor?: string;
  items: OrderItem[];
  subtotal: number;
}
