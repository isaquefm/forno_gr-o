import { NextResponse } from "next/server";
import { registerOrUpdateCustomer } from "@/lib/customersServer";
import type { RegisterEntryPayload } from "@/types/customer";

export async function POST(request: Request) {
  try {
    const body: RegisterEntryPayload = await request.json();

    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios." },
        { status: 400 },
      );
    }

    const customer = await registerOrUpdateCustomer(body);
    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Erro na rota /api/customers/entry:", error);
    return NextResponse.json(
      { error: "Falha ao registrar entrada do cliente." },
      { status: 500 },
    );
  }
}
