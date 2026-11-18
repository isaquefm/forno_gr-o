import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getOrders, updateOrderStatus } from "@/lib/ordersServer";
import type { OrderStatus } from "@/types/order";
import { orderStatuses } from "@/types/order";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function PATCH(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !orderStatuses.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
