import { getSupabase } from "@/lib/supabaseServer";
import type { CreateOrderPayload, Order, OrderStatus } from "@/types/order";

interface OrderRow {
  id: string;
  number: number;
  customer_name: string;
  customer_email: string | null;
  fulfillment: Order["fulfillment"];
  address: string | null;
  payment: Order["payment"];
  change_for: string | null;
  items: Order["items"];
  subtotal: number | string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    code: `#FG-${row.number}`,
    customerName: row.customer_name,
    customerEmail: row.customer_email ?? undefined,
    fulfillment: row.fulfillment,
    address: row.address ?? undefined,
    payment: row.payment,
    changeFor: row.change_for ?? undefined,
    items: row.items,
    subtotal: Number(row.subtotal),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao ler pedidos:", error);
    return [];
  }
  return (data as OrderRow[]).map(toOrder);
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await getSupabase()
    .from("orders")
    .insert({
      id,
      customer_name: payload.customerName.trim(),
      customer_email: payload.customerEmail?.trim() || null,
      fulfillment: payload.fulfillment,
      address: payload.address?.trim() || null,
      payment: payload.payment,
      change_for: payload.changeFor?.trim() || null,
      items: payload.items,
      subtotal: payload.subtotal,
      status: "novo",
    })
    .select()
    .single();

  if (error) throw error;
  return toOrder(data as OrderRow);
}

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data ? toOrder(data as OrderRow) : null;
}
