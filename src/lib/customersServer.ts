import fs from "fs/promises";
import path from "path";
import type { CustomerUser, RegisterEntryPayload } from "@/types/customer";

const DATA_DIR = path.join(process.cwd(), "data");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(CUSTOMERS_FILE);
    } catch {
      await fs.writeFile(CUSTOMERS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Erro ao inicializar arquivo de clientes:", error);
  }
}

export async function getCustomers(): Promise<CustomerUser[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(CUSTOMERS_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.sort(
      (a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime(),
    );
  } catch (error) {
    console.error("Erro ao ler clientes:", error);
    return [];
  }
}

export async function registerOrUpdateCustomer(
  payload: RegisterEntryPayload,
): Promise<CustomerUser> {
  await ensureDataFile();
  const customers = await getCustomers();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const existingIndex = customers.findIndex(
    (c) => c.email.toLowerCase() === normalizedEmail,
  );

  if (existingIndex !== -1) {
    const current = customers[existingIndex];
    const updated: CustomerUser = {
      ...current,
      name: payload.name.trim() || current.name,
      picture: payload.picture || current.picture,
      lastLoginAt: now,
      loginCount: (current.loginCount || 1) + 1,
    };
    customers[existingIndex] = updated;
    await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
    return updated;
  }

  const newCustomer: CustomerUser = {
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name.trim(),
    email: normalizedEmail,
    picture: payload.picture,
    provider: "google",
    firstVisitAt: now,
    lastLoginAt: now,
    loginCount: 1,
  };

  const updatedCustomers = [newCustomer, ...customers];
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(updatedCustomers, null, 2), "utf-8");
  return newCustomer;
}
