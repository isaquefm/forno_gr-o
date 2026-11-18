import { NextResponse } from "next/server";
import { getOrdersByCustomerEmail } from "@/lib/ordersServer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "E-mail não informado." }, { status: 400 });
    }

    const orders = await getOrdersByCustomerEmail(email);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos do cliente:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
