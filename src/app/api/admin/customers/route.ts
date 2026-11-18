import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCustomers } from "@/lib/customersServer";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const customers = await getCustomers();
  return NextResponse.json(customers);
}
