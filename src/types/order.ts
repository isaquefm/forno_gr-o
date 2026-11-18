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

export const statusColors: Record<OrderStatus, string> = {
  novo: "bg-terracotta/15 text-terracotta-dark border-terracotta/20",
  confirmado: "bg-sky-100 text-sky-800 border-sky-200",
  preparando: "bg-amber-100 text-amber-800 border-amber-200",
  pronto: "bg-olive/15 text-olive border-olive/20",
  entregue: "bg-olive/10 text-olive/60 border-olive/10",
  cancelado: "bg-ink/5 text-ink/40 border-ink/10",
};

/** Próximo status lógico no fluxo do pedido. */
export const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  novo: "confirmado",
  confirmado: "preparando",
  preparando: "pronto",
  pronto: "entregue",
};

export const nextStatusAction: Partial<Record<OrderStatus, string>> = {
  novo: "Confirmar",
  confirmado: "Iniciar preparo",
  preparando: "Marcar pronto",
  pronto: "Marcar entregue",
};

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerEmail?: string;
  fulfillment: "Entrega" | "Retirada no balcão";
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
  fulfillment: "Entrega" | "Retirada no balcão";
  address?: string;
  payment: "Pix" | "Cartão na entrega" | "Dinheiro";
  changeFor?: string;
  items: OrderItem[];
  subtotal: number;
}
