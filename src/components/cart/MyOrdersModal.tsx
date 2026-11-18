"use client";

import {
  Clock,
  ExternalLink,
  Package,
  RefreshCw,
  Search,
  Store,
  Truck,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatCurrency } from "@/lib/currency";
import type { Order } from "@/types/order";
import { statusColors, statusLabels } from "@/types/order";

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyOrdersModal({ isOpen, onClose }: MyOrdersModalProps) {
  const { customer } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const router = useRouter();

  const fetchCustomerOrders = useCallback(async () => {
    if (!customer?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/customer/orders?email=${encodeURIComponent(customer.email)}`,
      );
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [customer?.email]);

  useEffect(() => {
    if (isOpen && customer?.email) {
      fetchCustomerOrders();
    }
  }, [isOpen, customer?.email, fetchCustomerOrders]);

  if (!isOpen) return null;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = searchCode.trim().replace("#", "");
    if (!clean) return;
    onClose();
    router.push(`/pedido/${clean}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-ink/10 bg-canvas p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-terracotta/10 text-terracotta">
              <Package className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-xl text-ink">Acompanhar Pedido</h2>
              <p className="text-xs text-ink/60">Consulte o andamento em tempo real</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-surface text-ink/60 hover:text-ink"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Busca por código avulso */}
        <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Digite o código (ex: FG-1002)"
              className="h-11 w-full rounded-2xl border border-ink/15 bg-surface pr-3 pl-10 text-xs text-ink outline-none transition focus:border-terracotta"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-terracotta px-4 text-xs font-semibold text-canvas transition hover:bg-terracotta-dark"
          >
            Rastrear
          </button>
        </form>

        {/* Lista de Pedidos Recentes do Cliente Logado */}
        <div className="mt-5 flex-1 overflow-y-auto">
          {customer ? (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-ink/50 uppercase">
                  Pedidos de {customer.name}
                </p>
                <button
                  type="button"
                  onClick={fetchCustomerOrders}
                  className="flex items-center gap-1 text-[11px] text-terracotta hover:underline"
                >
                  <RefreshCw className={`size-3 ${isLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </button>
              </div>

              {isLoading ? (
                <div className="flex py-12 items-center justify-center gap-2 text-ink/60">
                  <RefreshCw className="size-4 animate-spin text-terracotta" />
                  <span className="text-xs">Buscando seus pedidos...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="my-8 text-center text-xs text-ink/60">
                  <p>Você ainda não realizou nenhum pedido com esta conta.</p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {orders.map((ord) => {
                    const dateStr = new Date(ord.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-ink/10 bg-surface p-4 transition hover:border-ink/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-serif text-base font-bold text-ink">
                              {ord.code}
                            </span>
                            <p className="flex items-center gap-1 text-[11px] text-ink/60">
                              <Clock className="size-3" />
                              {dateStr}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              statusColors[ord.status]
                            }`}
                          >
                            {statusLabels[ord.status]}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-ink/75">
                          <span className="flex items-center gap-1">
                            {ord.fulfillment === "Na mesa" ? (
                              <>
                                <UtensilsCrossed className="size-3.5 text-terracotta" />
                                {ord.tableNumber ? `Mesa ${ord.tableNumber}` : "Na mesa"}
                              </>
                            ) : ord.fulfillment === "Entrega" ? (
                              <>
                                <Truck className="size-3.5 text-terracotta" />
                                Entrega
                              </>
                            ) : (
                              <>
                                <Store className="size-3.5 text-olive" />
                                Retirada no balcão
                              </>
                            )}
                          </span>
                          <span className="font-semibold text-ink">
                            {formatCurrency(ord.subtotal)}
                          </span>
                        </div>

                        <Link
                          href={`/pedido/${ord.code.replace("#", "")}`}
                          onClick={onClose}
                          className="mt-3.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-canvas text-xs font-semibold text-ink transition hover:bg-terracotta hover:text-canvas"
                        >
                          <span>Acompanhar ao Vivo</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="my-6 rounded-2xl border border-dashed border-ink/15 bg-surface/50 p-5 text-center">
              <p className="text-xs text-ink/70">
                Faça login com sua conta do Google para visualizar automaticamente o histórico de
                todos os seus pedidos nesta tela.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
