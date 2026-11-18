"use client";

import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  User,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import type { CustomerUser } from "@/types/customer";
import type { Order, OrderStatus } from "@/types/order";
import {
  nextStatusAction,
  nextStatusMap,
  orderStatuses,
  statusColors,
  statusLabels,
} from "@/types/order";

// Função para tocar som de notificação usando Web Audio API nativa
function playNotificationChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn("Áudio não pôde ser reproduzido:", e);
  }
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Aba ativa: "pedidos" ou "clientes"
  const [activeTab, setActiveTab] = useState<"pedidos" | "clientes">("pedidos");

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"todos" | OrderStatus>("todos");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  // 1. Busca os pedidos e os clientes
  const fetchData = useCallback(
    async (isPolling = false) => {
      if (!isPolling) setIsLoadingData(true);
      try {
        const [ordersRes, customersRes] = await Promise.all([
          fetch("/api/admin/orders"),
          fetch("/api/admin/customers"),
        ]);

        if (ordersRes.status === 401 || customersRes.status === 401) {
          setIsLoggedIn(false);
          return;
        }

        if (ordersRes.ok) {
          const ordersData: Order[] = await ordersRes.json();
          setIsLoggedIn(true);

          // Detecta se há pedidos novos para tocar alerta sonoro
          if (previousOrderIdsRef.current.size > 0) {
            const hasNewOrder = ordersData.some(
              (o) => !previousOrderIdsRef.current.has(o.id) && o.status === "novo",
            );
            if (hasNewOrder && soundEnabled) {
              playNotificationChime();
            }
          }

          previousOrderIdsRef.current = new Set(ordersData.map((o) => o.id));
          setOrders(ordersData);
        }

        if (customersRes.ok) {
          const customersData: CustomerUser[] = await customersRes.json();
          setCustomers(customersData);
        }

        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    },
    [soundEnabled],
  );

  // Checagem inicial
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Polling automático a cada 6 segundos quando logado
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchData]);

  // Submissão de login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordInput.trim() || isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "Senha inválida.");
        setIsLoggingIn(false);
        return;
      }

      setIsLoggedIn(true);
      setPasswordInput("");
      fetchData(false);
    } catch {
      setLoginError("Erro de comunicação com o servidor.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  // Logout
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setOrders([]);
    setCustomers([]);
    previousOrderIdsRef.current.clear();
  }

  // Atualização de status do pedido
  async function handleUpdateStatus(orderId: string, newStatus: OrderStatus) {
    setOrders((current) =>
      current.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) {
        fetchData(false);
      }
    } catch {
      fetchData(false);
    }
  }

  // Métricas do dia
  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
    const activeOrders = orders.filter(
      (o) => o.status === "novo" || o.status === "confirmado" || o.status === "preparando",
    );
    const completedOrders = orders.filter((o) => o.status === "entregue");
    const todayRevenue = todayOrders
      .filter((o) => o.status !== "cancelado")
      .reduce((sum, o) => sum + o.subtotal, 0);

    return {
      totalToday: todayOrders.length,
      activeCount: activeOrders.length,
      newCount: orders.filter((o) => o.status === "novo").length,
      completedToday: completedOrders.length,
      revenueToday: todayRevenue,
      totalCustomers: customers.length,
      totalVisits: customers.reduce((sum, c) => sum + (c.loginCount || 1), 0),
    };
  }, [orders, customers]);

  // Pedidos filtrados
  const filteredOrders = useMemo(() => {
    if (statusFilter === "todos") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  // Loading inicial
  if (isLoggedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3 text-ink/70">
          <RefreshCw className="size-8 animate-spin text-terracotta" />
          <p className="font-serif text-lg">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // Tela de Login da Equipe
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-surface p-8 shadow-xl">
          <div className="text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <Lock className="size-7" />
            </span>
            <h1 className="mt-4 font-serif text-3xl text-ink">Forno & Grão</h1>
            <p className="mt-1 text-xs font-semibold tracking-wider text-olive uppercase">
              Painel da Equipe e Balcão
            </p>
            <p className="mt-3 text-sm text-ink/70">
              Digite a senha de acesso para visualizar pedidos e monitorar entradas no site.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label htmlFor="admin-pass" className="block text-sm font-semibold text-ink">
                Senha de Acesso
              </label>
              <input
                id="admin-pass"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha..."
                autoFocus
                className="mt-2 h-12 w-full rounded-2xl border border-ink/15 bg-canvas px-4 text-sm text-ink outline-none transition focus:border-terracotta"
              />
            </div>

            {loginError ? (
              <div className="flex items-center gap-2 rounded-xl bg-terracotta/10 p-3 text-sm text-terracotta-dark">
                <AlertCircle className="size-4 shrink-0" />
                <p>{loginError}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoggingIn || !passwordInput.trim()}
              className="mt-2 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-terracotta text-sm font-semibold text-canvas transition-colors hover:bg-terracotta-dark disabled:opacity-50"
            >
              {isLoggingIn ? "Verificando..." : "Entrar no Painel"}
            </button>
          </form>

          <div className="mt-8 border-t border-ink/10 pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/60 hover:text-terracotta"
            >
              Voltar ao site público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Painel Principal da Equipe
  return (
    <div className="min-h-screen bg-canvas pb-20 text-ink">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-xl tracking-tight">
              Forno <span className="text-terracotta">&</span> Grão
            </Link>
            <span className="hidden rounded-full bg-terracotta/10 px-3 py-0.5 text-xs font-semibold text-terracotta sm:inline-block">
              Painel de Operações
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de status ao vivo */}
            <div className="hidden items-center gap-2 text-xs text-ink/60 sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-olive"></span>
              </span>
              <span>Ao vivo</span>
            </div>

            {/* Alternar som de alerta */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playNotificationChime();
              }}
              title={soundEnabled ? "Som ativado (clique para mutar)" : "Som desativado (clique para ativar)"}
              className={`grid size-9 cursor-pointer place-items-center rounded-full border transition ${
                soundEnabled
                  ? "border-olive/30 bg-olive/10 text-olive"
                  : "border-ink/10 bg-surface text-ink/40"
              }`}
            >
              {soundEnabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            </button>

            {/* Atualizar manual */}
            <button
              type="button"
              onClick={() => fetchData(false)}
              disabled={isLoadingData}
              title="Atualizar agora"
              className="grid size-9 cursor-pointer place-items-center rounded-full border border-ink/10 bg-surface hover:bg-canvas"
            >
              <RefreshCw className={`size-4 ${isLoadingData ? "animate-spin text-terracotta" : ""}`} />
            </button>

            {/* Ver Site */}
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-surface md:flex"
            >
              <ExternalLink className="size-3.5" />
              Ver Site
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-terracotta/10 hover:text-terracotta-dark"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Barra de Métricas Rápidas */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-ink/10 bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Novos Pendentes</span>
              <span className="grid size-7 place-items-center rounded-full bg-terracotta/15 text-terracotta">
                <Flame className="size-4" />
              </span>
            </div>
            <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-terracotta">
              {metrics.newCount}
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Em Andamento</span>
              <span className="grid size-7 place-items-center rounded-full bg-amber-100 text-amber-800">
                <Clock className="size-4" />
              </span>
            </div>
            <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-ink">
              {metrics.activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Clientes no Site</span>
              <span className="grid size-7 place-items-center rounded-full bg-olive/15 text-olive">
                <Users className="size-4" />
              </span>
            </div>
            <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-ink">
              {metrics.totalCustomers}
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Faturamento Hoje</span>
              <span className="grid size-7 place-items-center rounded-full bg-ink/5 text-ink">
                <ShoppingBag className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-ink sm:text-3xl">
              {formatCurrency(metrics.revenueToday)}
            </p>
          </div>
        </section>

        {/* Navegação entre Abas: Pedidos x Monitoramento de Entradas Google */}
        <div className="mt-8 flex border-b border-ink/10">
          <button
            type="button"
            onClick={() => setActiveTab("pedidos")}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
              activeTab === "pedidos"
                ? "border-terracotta text-terracotta"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            <Package className="size-4" />
            Pedidos ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clientes")}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
              activeTab === "clientes"
                ? "border-terracotta text-terracotta"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            <Globe className="size-4" />
            Entradas no Site / Google ({customers.length})
          </button>
        </div>

        {/* CONTEÚDO DA ABA PEDIDOS */}
        {activeTab === "pedidos" ? (
          <div>
            {/* Filtros de Status */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter("todos")}
                  className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                    statusFilter === "todos"
                      ? "bg-ink text-canvas"
                      : "bg-surface text-ink hover:bg-surface/80"
                  }`}
                >
                  Todos ({orders.length})
                </button>

                {orderStatuses.map((st) => {
                  const count = orders.filter((o) => o.status === st).length;
                  const isSelected = statusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-ink text-canvas"
                          : "bg-surface text-ink hover:bg-surface/80"
                      }`}
                    >
                      {statusLabels[st]} ({count})
                    </button>
                  );
                })}
              </div>

              {lastUpdated ? (
                <span className="text-right text-xs text-ink/50">
                  Atualizado às {lastUpdated.toLocaleTimeString("pt-BR")}
                </span>
              ) : null}
            </div>

            {/* Lista de Pedidos */}
            <div className="mt-6">
              {filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-ink/15 bg-surface/50 px-6 py-16 text-center">
                  <Package className="mx-auto size-12 text-ink/30" />
                  <h3 className="mt-4 font-serif text-2xl text-ink">Nenhum pedido encontrado</h3>
                  <p className="mt-1 text-sm text-ink/60">
                    {statusFilter === "todos"
                      ? "Quando um cliente fizer um pedido pelo site, ele aparecerá aqui automaticamente."
                      : `Não há pedidos com status "${statusLabels[statusFilter]}" no momento.`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredOrders.map((order) => {
                    const orderDate = new Date(order.createdAt);
                    const timeString = orderDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const dateString = orderDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    });

                    const nextStatus = nextStatusMap[order.status];
                    const nextAction = nextStatusAction[order.status];

                    return (
                      <article
                        key={order.id}
                        className={`flex flex-col justify-between rounded-3xl border bg-surface p-5 transition-shadow hover:shadow-md ${
                          order.status === "novo"
                            ? "border-terracotta ring-2 ring-terracotta/20"
                            : "border-ink/10"
                        }`}
                      >
                        <div>
                          {/* Topo do card: Código, Horário e Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-serif text-xl font-bold tracking-tight text-ink">
                                {order.code}
                              </span>
                              <p className="flex items-center gap-1 text-xs text-ink/60">
                                <Clock className="size-3" />
                                {dateString} às {timeString}
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                statusColors[order.status]
                              }`}
                            >
                              {statusLabels[order.status]}
                            </span>
                          </div>

                          {/* Informações do Cliente & Modalidade */}
                          <div className="mt-4 border-t border-ink/10 pt-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-ink">{order.customerName}</p>
                                {order.customerEmail ? (
                                  <p className="flex items-center gap-1 text-xs text-ink/60">
                                    <Mail className="size-3" />
                                    {order.customerEmail}
                                  </p>
                                ) : null}
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-0.5 text-xs text-ink/75">
                                {order.fulfillment === "Entrega" ? (
                                  <>
                                    <Truck className="size-3 text-terracotta" />
                                    Entrega
                                  </>
                                ) : (
                                  <>
                                    <Store className="size-3 text-olive" />
                                    Retirada
                                  </>
                                )}
                              </span>
                            </div>

                            {order.fulfillment === "Entrega" && order.address ? (
                              <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-canvas p-2.5 text-xs text-ink/80">
                                <MapPin className="mt-0.5 size-3.5 shrink-0 text-terracotta" />
                                <p className="line-clamp-2 leading-relaxed">{order.address}</p>
                              </div>
                            ) : null}

                            <p className="mt-2 text-xs text-ink/60">
                              Pagamento:{" "}
                              <span className="font-semibold text-ink/90">{order.payment}</span>
                              {order.changeFor ? ` (Troco para R$ ${order.changeFor})` : ""}
                            </p>
                          </div>

                          {/* Itens do Pedido */}
                          <div className="mt-4 border-t border-ink/10 pt-3">
                            <p className="text-xs font-semibold tracking-wider text-ink/50 uppercase">
                              Itens ({order.items.reduce((s, i) => s + i.quantity, 0)})
                            </p>
                            <ul className="mt-2 space-y-1.5 text-sm">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between gap-2">
                                  <span className="text-ink/85">
                                    <strong className="font-semibold text-ink">{item.quantity}×</strong>{" "}
                                    {item.name}
                                  </span>
                                  <span className="shrink-0 text-xs tabular-nums text-ink/60">
                                    {formatCurrency(item.lineTotal)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Rodapé do Card: Total e Botões de Ação */}
                        <div className="mt-5 border-t border-ink/10 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ink/60">Subtotal</span>
                            <span className="font-serif text-xl font-bold tabular-nums text-ink">
                              {formatCurrency(order.subtotal)}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col gap-2">
                            {/* Botão de avanço rápido no fluxo */}
                            {nextStatus && nextAction ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, nextStatus)}
                                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-terracotta px-4 text-xs font-semibold text-canvas transition-colors hover:bg-terracotta-dark"
                              >
                                <span>{nextAction}</span>
                                <ChevronRight className="size-3.5" />
                              </button>
                            ) : order.status === "entregue" ? (
                              <div className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-olive/15 text-xs font-semibold text-olive">
                                <CheckCircle2 className="size-3.5" />
                                Pedido Concluído
                              </div>
                            ) : null}

                            {/* Ações secundárias: Seletor de Status ou Cancelar */}
                            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                              {order.status !== "cancelado" && order.status !== "entregue" ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, "cancelado")}
                                  className="cursor-pointer text-ink/40 hover:text-terracotta-dark hover:underline"
                                >
                                  Cancelar pedido
                                </button>
                              ) : null}

                              {order.status === "cancelado" ? (
                                <span className="flex items-center gap-1 text-ink/40">
                                  <XCircle className="size-3.5" /> Cancelado
                                </span>
                              ) : null}

                              <div className="ml-auto">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleUpdateStatus(order.id, e.target.value as OrderStatus)
                                  }
                                  className="cursor-pointer rounded-lg border border-ink/10 bg-canvas px-2 py-1 text-[11px] text-ink/75 outline-none"
                                >
                                  {orderStatuses.map((st) => (
                                    <option key={st} value={st}>
                                      Mudar para: {statusLabels[st]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* CONTEÚDO DA ABA ENTRADAS NO SITE / GOOGLE */}
        {activeTab === "clientes" ? (
          <div className="mt-6">
            <div className="rounded-3xl border border-ink/10 bg-surface p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-serif text-2xl text-ink">Registro de Entradas no Site</h3>
                  <p className="mt-1 text-xs text-ink/70">
                    Acompanhe todos os clientes que se identificaram via Google para realizar pedidos
                    e interagir com a Forno & Grão.
                  </p>
                </div>
                <div className="text-right text-xs text-ink/60">
                  Total de acessos acumulados:{" "}
                  <strong className="text-ink">{metrics.totalVisits}</strong>
                </div>
              </div>

              {customers.length === 0 ? (
                <div className="my-12 text-center">
                  <Users className="mx-auto size-12 text-ink/30" />
                  <p className="mt-4 font-serif text-xl text-ink">Nenhum cliente registrado ainda</p>
                  <p className="mt-1 text-sm text-ink/60">
                    Assim que um visitante fizer login com o Google na loja, ele aparecerá aqui com
                    nome, e-mail e histórico de acessos.
                  </p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-ink/10 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 text-xs font-semibold tracking-wider text-ink/50 uppercase">
                        <th className="pb-3 pl-2">Cliente</th>
                        <th className="pb-3">E-mail (Google)</th>
                        <th className="pb-3 text-center">Acessos</th>
                        <th className="pb-3">Primeira Entrada</th>
                        <th className="pb-3">Último Acesso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {customers.map((cust) => {
                        const firstDate = new Date(cust.firstVisitAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const lastDate = new Date(cust.lastLoginAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr key={cust.id} className="hover:bg-canvas/50">
                            <td className="py-3.5 pl-2">
                              <div className="flex items-center gap-3">
                                {cust.picture ? (
                                  <div className="relative size-9 overflow-hidden rounded-full border border-ink/10">
                                    <Image
                                      src={cust.picture}
                                      alt={cust.name}
                                      fill
                                      sizes="36px"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <span className="grid size-9 place-items-center rounded-full bg-olive/15 text-olive">
                                    <User className="size-4" />
                                  </span>
                                )}
                                <span className="font-semibold text-ink">{cust.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-xs text-ink/75">{cust.email}</td>
                            <td className="py-3.5 text-center font-semibold tabular-nums text-ink">
                              {cust.loginCount || 1}
                            </td>
                            <td className="py-3.5 text-xs text-ink/60">{firstDate}</td>
                            <td className="py-3.5 text-xs font-medium text-ink/80">{lastDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
