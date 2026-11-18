import { getSupabase } from "@/lib/supabaseServer";
import type { CustomerUser, RegisterEntryPayload } from "@/types/customer";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  picture: string | null;
  provider: "google";
  first_visit_at: string;
  last_login_at: string;
  login_count: number;
}

function toCustomer(row: CustomerRow): CustomerUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    picture: row.picture ?? undefined,
    provider: row.provider,
    firstVisitAt: row.first_visit_at,
    lastLoginAt: row.last_login_at,
    loginCount: row.login_count,
  };
}

export async function getCustomers(): Promise<CustomerUser[]> {
  const { data, error } = await getSupabase()
    .from("customers")
    .select("*")
    .order("last_login_at", { ascending: false });

  if (error) {
    console.error("Erro ao ler clientes:", error);
    return [];
  }
  return (data as CustomerRow[]).map(toCustomer);
}

export async function registerOrUpdateCustomer(
  payload: RegisterEntryPayload,
): Promise<CustomerUser> {
  const supabase = getSupabase();
  const email = payload.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const { data: current, error: readError } = await supabase
    .from("customers")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (readError) throw readError;

  if (current) {
    const row = current as CustomerRow;
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: payload.name.trim() || row.name,
        picture: payload.picture || row.picture,
        last_login_at: now,
        login_count: (row.login_count || 1) + 1,
      })
      .eq("id", row.id)
      .select()
      .single();
    if (error) throw error;
    return toCustomer(data as CustomerRow);
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: payload.name.trim(),
      email,
      picture: payload.picture ?? null,
      provider: "google",
      first_visit_at: now,
      last_login_at: now,
      login_count: 1,
    })
    .select()
    .single();
  if (error) throw error;
  return toCustomer(data as CustomerRow);
}
