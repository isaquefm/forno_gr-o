"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Flame,
  MessageCircle,
  Package,
  RefreshCw,
  Store,
  Truck,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { getWhatsAppPhone } from "@/data/site";
import { formatCurrency } from "@/lib/currency";
import type { Order, OrderStatus } from "@/types/order";
import {
  statusColors,
  statusCustomerDescriptions,
  statusLabels,
} from "@/types/order";

const STEPS: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: "novo", label: "Recebido", icon: Package },
  { status: "confirmado", label: "Confirmado", icon: CheckCircle2 },
  { status: "preparando", label: "No Forno / Preparo", icon: Flame },
  { status: "pronto", label: "Pronto", icon: UtensilsCrossed },
  { status: "entregue", label: "Entregue", icon: Check },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "novo":
      return 0;
    case "confirmado":
      return 1;
    case "preparando":
      return 2;
    case "pronto":
      return 3;
    case "entregue":
      return 4;
    case "cancelado":
      return -1;
    default:
      return 0;
  }
}

export default function OrderTrackingPage() {
  const params = useParams();
  const rawCode = params?.code as string | undefined;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<"copied" | "error" | null>(null);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const phone = getWhatsAppPhone() || "5514997071115";

  const fetchOrder = useCallback(
    async (silent = false) => {
      if (!rawCode) return;
      if (!silent) setIsLoading(true);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(rawCode)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Pedido não encontrado. Verifique o código digitado.");
          } else {
            setError("Não foi possível carregar o status do pedido.");
          }
          return;
        }

        const data: Order = await res.json();
        setOrder(data);
        setError(null);
        setLastCheck(new Date());
      } catch {
        if (!silent) setError("Erro de conexão ao buscar o pedido.");
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [rawCode],
  );

  useEffect(() => {
    fetchOrder(false);
  }, [fetchOrder]);

  // Atualização em tempo real (polling a cada 4 segundos se o pedido ainda não foi entregue/cancelado)
  useEffect(() => {
    if (!order || order.status === "entregue" || order.status === "cancelado") return;
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  useEffect(() => {
    if (!copyFeedback) return;
    const timeout = window.setTimeout(() => setCopyFeedback(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [copyFeedback]);

  async function copyOrderCode() {
    if (!order) return;

    try {
      await navigator.clipboard.writeText(order.code);
      setCopyFeedback("copied");
    } catch {
      setCopyFeedback("error");
    }
  }

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === "cancelado";

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 sm:px-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-terracotta"
          >
            <ArrowLeft className="size-4" />
            Voltar ao Cardápio
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-ink/10 bg-surface px-6 py-20 text-center">
            <RefreshCw className="size-8 animate-spin text-terracotta" />
            <h2 className="mt-4 font-serif text-2xl text-ink">Buscando seu pedido...</h2>
            <p className="mt-1 text-xs text-ink/60">Aguarde um momento enquanto conectamos à cozinha.</p>
          </div>
        ) : error || !order ? (
          <div className="rounded-3xl border border-ink/10 bg-surface px-6 py-16 text-center">
            <XCircle className="mx-auto size-12 text-terracotta" />
            <h2 className="mt-4 font-serif text-2xl text-ink">Ops! Pedido não encontrado</h2>
            <p className="mt-2 text-sm text-ink/70">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-6 text-xs font-semibold text-canvas transition hover:bg-terracotta-dark"
            >
              Fazer um novo pedido
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cartão Principal de Status */}
            <div className="overflow-hidden rounded-3xl border border-ink/10 bg-surface p-6 shadow-xl sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                      {order.code}
                    </span>
                    <button
                      type="button"
                      onClick={copyOrderCode}
                      title={
                        copyFeedback === "copied"
                          ? "Código copiado"
                          : copyFeedback === "error"
                            ? "Não foi possível copiar. Tente novamente"
                            : "Copiar código"
                      }
                      aria-label={
                        copyFeedback === "copied"
                          ? "Código copiado"
                          : copyFeedback === "error"
                            ? "Não foi possível copiar. Tente novamente"
                            : "Copiar código"
                      }
                      className={`grid size-8 place-items-center rounded-lg border bg-canvas transition cursor-pointer ${
                        copyFeedback === "copied"
                          ? "border-olive/50 bg-olive/10 text-olive"
                          : copyFeedback === "error"
                            ? "border-terracotta/50 bg-terracotta/10 text-terracotta"
                            : "border-ink/10 text-ink/70 hover:border-terracotta hover:text-terracotta"
                      }`}
                    >
                      {copyFeedback === "copied" ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                    <span className="sr-only" aria-live="polite">
                      {copyFeedback === "copied"
                        ? "Código do pedido copiado"
                        : copyFeedback === "error"
                          ? "Não foi possível copiar o código do pedido"
                          : ""}
                    </span>
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    Cliente: <strong className="text-ink">{order.customerName}</strong> · Pedido
                    realizado às{" "}
                    {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      statusColors[order.status]
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                  <span className="text-[11px] text-ink/50">
                    Ao vivo · {lastCheck.toLocaleTimeString("pt-BR")}
                  </span>
                </div>
              </div>

              {/* Destaque da Mesa ou Modalidade */}
              <div className="my-6 rounded-2xl border border-terracotta/20 bg-canvas p-4 sm:p-5">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-terracotta/15 text-terracotta">
                    {order.fulfillment === "Na mesa" ? (
                      <UtensilsCrossed className="size-6" />
                    ) : order.fulfillment === "Entrega" ? (
                      <Truck className="size-6" />
                    ) : (
                      <Store className="size-6" />
                    )}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink sm:text-xl">
                      {order.fulfillment === "Na mesa"
                        ? `Consumo no Local — ${order.tableNumber ? `Mesa ${order.tableNumber}` : "Mesa no salão"}`
                        : order.fulfillment === "Entrega"
                          ? "Entrega em Domicílio"
                          : "Retirada no Balcão"}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink/75">
                      {order.fulfillment === "Na mesa"
                        ? "Fique confortável! Nosso garçom levará o pedido quentinho direto até a sua mesa."
                        : order.fulfillment === "Entrega"
                          ? `Endereço informado: ${order.address || "A combinar no WhatsApp"}`
                          : "Avise a equipe no balcão com o número do seu pedido quando estiver pronto."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha do Tempo / Barra de Progresso Visual */}
              {!isCancelled ? (
                <div className="py-4">
                  <p className="mb-6 text-center text-sm font-medium text-ink">
                    {statusCustomerDescriptions[order.status]}
                  </p>

                  {/* Etapas no Desktop / Mobile */}
                  <div className="relative">
                    {/* Linha de fundo conectora */}
                    <div className="absolute top-5 right-4 left-4 h-1 -translate-y-1/2 bg-ink/10 sm:right-8 sm:left-8" />
                    {/* Linha de progresso ativa */}
                    <div
                      className="absolute top-5 left-4 h-1 -translate-y-1/2 bg-terracotta transition-all duration-500 sm:left-8"
                      style={{
                        width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 16px)`,
                      }}
                    />

                    <div className="relative flex justify-between">
                      {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isPassed = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                          <div key={step.status} className="flex flex-col items-center">
                            <div
                              className={`grid size-10 place-items-center rounded-full border-2 transition-all duration-300 ${
                                isPassed
                                  ? "border-terracotta bg-terracotta text-canvas shadow-md"
                                  : "border-ink/20 bg-surface text-ink/40"
                              } ${isCurrent ? "ring-4 ring-terracotta/25 scale-110" : ""}`}
                            >
                              <Icon className="size-4.5" />
                            </div>
                            <span
                              className={`mt-2 hidden text-center text-[11px] font-semibold sm:block ${
                                isPassed ? "text-ink" : "text-ink/40"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-ink/5 p-4 text-center text-sm text-ink/70">
                  <p className="font-semibold text-terracotta-dark">Pedido Cancelado</p>
                  <p className="mt-1 text-xs">
                    Se você não solicitou este cancelamento, entre em contato com nossa equipe pelo
                    WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* Resumo dos Itens do Pedido */}
            <div className="rounded-3xl border border-ink/10 bg-surface p-6 sm:p-7">
              <h3 className="font-serif text-xl text-ink">Itens do Pedido</h3>
              <ul className="mt-4 divide-y divide-ink/10">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid size-7 place-items-center rounded-lg bg-canvas text-xs font-bold tabular-nums text-ink">
                        {item.quantity}×
                      </span>
                      <span className="font-medium text-ink">{item.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-ink">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-ink/10 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/70">Subtotal dos produtos</span>
                  <span className="font-serif text-xl font-bold tabular-nums text-ink">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/60">
                  Forma de pagamento: <strong>{order.payment}</strong>
                  {order.changeFor ? ` (Troco para R$ ${order.changeFor})` : ""}
                </p>
              </div>
            </div>

            {/* Ações de Suporte e Contato Rápido */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(
                  `Olá! Gostaria de falar sobre o meu pedido ${order.code} da Forno & Grão.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25D366] text-xs font-bold text-white shadow-md transition hover:bg-[#20bd5a]"
              >
                <MessageCircle className="size-4.5 fill-white" />
                Falar com a Equipe no WhatsApp
              </a>

              <Link
                href="/#cardapio"
                className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface text-xs font-semibold text-ink transition hover:border-terracotta hover:text-terracotta"
              >
                Pedir mais itens no Cardápio
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
