import { NextResponse } from "next/server";
import { getOrderByCode } from "@/lib/ordersServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: "Código do pedido não informado." }, { status: 400 });
    }

    const order = await getOrderByCode(code);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido por código:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
