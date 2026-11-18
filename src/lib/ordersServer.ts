import fs from "fs/promises";
import path from "path";
import type { CreateOrderPayload, Order, OrderStatus } from "@/types/order";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(ORDERS_FILE);
    } catch {
      await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Erro ao garantir arquivo de pedidos:", error);
  }
}

export async function getOrders(): Promise<Order[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // Ordena do mais recente para o mais antigo
    return data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("Erro ao ler pedidos:", error);
    return [];
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  await ensureDataFile();
  const orders = await getOrders();

  const now = new Date();
  const nextNumber = 1000 + orders.length + 1;
  const code = `#FG-${nextNumber}`;
  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newOrder: Order = {
    id,
    code,
    customerName: payload.customerName.trim(),
    customerEmail: payload.customerEmail?.trim() || undefined,
    fulfillment: payload.fulfillment,
    address: payload.address?.trim() || undefined,
    payment: payload.payment,
    changeFor: payload.changeFor?.trim() || undefined,
    items: payload.items,
    subtotal: payload.subtotal,
    status: "novo",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const updatedOrders = [newOrder, ...orders];
  await fs.writeFile(ORDERS_FILE, JSON.stringify(updatedOrders, null, 2), "utf-8");

  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
): Promise<Order | null> {
  await ensureDataFile();
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return null;
  }

  orders[index] = {
    ...orders[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return orders[index];
}
