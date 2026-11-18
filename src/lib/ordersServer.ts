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
  const isTable = row.fulfillment === "Na mesa";
  const tableNumber =
    isTable && row.address
      ? row.address.replace(/^Mesa\s*:?\s*/i, "").trim()
      : undefined;

  return {
    id: row.id,
    code: `#FG-${row.number}`,
    customerName: row.customer_name,
    customerEmail: row.customer_email ?? undefined,
    fulfillment: row.fulfillment,
    tableNumber,
    address: isTable ? undefined : (row.address ?? undefined),
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

export async function getOrderByCode(codeOrId: string): Promise<Order | null> {
  const supabase = getSupabase();
  const digitsOnly = codeOrId.replace(/\D/g, "");

  // Se tiver dígitos, busca pelo número sequencial do pedido (#FG-1001 -> 1001)
  if (digitsOnly.length > 0) {
    const orderNumber = parseInt(digitsOnly, 10);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("number", orderNumber)
      .maybeSingle();

    if (data) return toOrder(data as OrderRow);
  }

  // Fallback: busca pelo id do pedido (ex: order_123456)
  const { data: byId } = await supabase
    .from("orders")
    .select("*")
    .eq("id", codeOrId)
    .maybeSingle();

  return byId ? toOrder(byId as OrderRow) : null;
}

export async function getOrdersByCustomerEmail(email: string): Promise<Order[]> {
  if (!email) return [];
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .ilike("customer_email", email.trim().toLowerCase())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao ler pedidos do cliente:", error);
    return [];
  }
  return (data as OrderRow[]).map(toOrder);
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Se for "Na mesa", guarda a indicação da mesa no campo address
  const savedAddress =
    payload.fulfillment === "Na mesa"
      ? payload.tableNumber ? `Mesa ${payload.tableNumber.trim()}` : "Mesa no salão"
      : payload.address?.trim() || null;

  const { data, error } = await getSupabase()
    .from("orders")
    .insert({
      id,
      customer_name: payload.customerName.trim(),
      customer_email: payload.customerEmail?.trim().toLowerCase() || null,
      fulfillment: payload.fulfillment,
      address: savedAddress,
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
