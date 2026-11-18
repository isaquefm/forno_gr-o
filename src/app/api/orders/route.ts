import { NextResponse } from "next/server";
import { createOrder } from "@/lib/ordersServer";
import type { CreateOrderPayload } from "@/types/order";

export async function POST(request: Request) {
  try {
    const body: CreateOrderPayload = await request.json();

    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Dados incompletos do pedido." },
        { status: 400 },
      );
    }

    const order = await createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erro na rota POST /api/orders:", error);
    return NextResponse.json(
      { error: "Falha interna ao registrar pedido." },
      { status: 500 },
    );
  }
}
