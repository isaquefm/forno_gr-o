"use client";

import {
  AlertCircle,
  ArrowRight,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
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
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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

  // Polling automático a cada 5 segundos quando logado
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
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

  // Contadores por status para os filtros gigantes
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: orders.length };
    orderStatuses.forEach((st) => {
      counts[st] = orders.filter((o) => o.status === st).length;
    });
    return counts;
  }, [orders]);

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
          <p className="font-serif text-lg text-ink">Carregando painel do balcão...</p>
        </div>
      </div>
    );
  }

  // Tela de Login da Equipe
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-surface p-8 shadow-2xl">
          <div className="text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <Lock className="size-7" />
            </span>
            <h1 className="mt-4 font-serif text-3xl text-ink">Forno & Grão</h1>
            <p className="mt-1 text-xs font-semibold tracking-wider text-olive uppercase">
              Painel de Pedidos & Balcão
            </p>
            <p className="mt-3 text-sm text-ink/70">
              Digite a senha da equipe para gerenciar a fila da cozinha e entregas.
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
      {/* Topbar Operacional */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-ink">
              Forno <span className="text-terracotta">&</span> Grão
            </Link>
            <span className="hidden rounded-full bg-terracotta/15 px-3 py-1 text-xs font-bold text-terracotta sm:inline-block">
              Balcão & Cozinha
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de status ao vivo */}
            <div className="hidden items-center gap-2 rounded-full border border-olive/20 bg-olive/10 px-3 py-1 text-xs font-semibold text-olive sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-olive"></span>
              </span>
              <span>Ao vivo</span>
            </div>

            {/* Alternador de tema Café / Claro */}
            <ThemeToggle className="size-10" />

            {/* Alternar som de alerta */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playNotificationChime();
              }}
              title={soundEnabled ? "Som ativado (clique para mutar)" : "Som desativado (clique para ativar)"}
              className={`grid size-10 cursor-pointer place-items-center rounded-full border transition ${
                soundEnabled
                  ? "border-olive/40 bg-olive/15 text-olive shadow-xs"
                  : "border-ink/10 bg-surface text-ink/40"
              }`}
            >
              {soundEnabled ? <Bell className="size-4.5" /> : <BellOff className="size-4.5" />}
            </button>

            {/* Atualizar manual */}
            <button
              type="button"
              onClick={() => fetchData(false)}
              disabled={isLoadingData}
              title="Atualizar agora"
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-ink/10 bg-surface hover:bg-canvas text-ink"
            >
              <RefreshCw className={`size-4.5 ${isLoadingData ? "animate-spin text-terracotta" : ""}`} />
            </button>

            {/* Ver Site */}
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-surface md:flex"
            >
              <ExternalLink className="size-3.5" />
              Ver Cardápio
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-xs font-semibold text-ink/80 hover:bg-terracotta/10 hover:text-terracotta-dark transition"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Navegação Principal das Abas da Equipe */}
        <div className="flex border-b border-ink/10">
          <button
            type="button"
            onClick={() => setActiveTab("pedidos")}
            className={`flex items-center gap-2.5 border-b-2 px-6 py-3.5 text-base font-bold transition ${
              activeTab === "pedidos"
                ? "border-terracotta text-terracotta"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            <Package className="size-5" />
            Fila de Pedidos ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clientes")}
            className={`flex items-center gap-2.5 border-b-2 px-6 py-3.5 text-base font-bold transition ${
              activeTab === "clientes"
                ? "border-terracotta text-terracotta"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            <Globe className="size-5" />
            Entradas no Site ({customers.length})
          </button>
        </div>

        {/* CONTEÚDO DA ABA PEDIDOS */}
        {activeTab === "pedidos" ? (
          <div>
            {/* FILTROS GIGANTES E APARENTES NO TOPO (Feedback da Equipe) */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wider text-ink/60 uppercase">
                  Filtre por etapa da produção:
                </span>
                {lastUpdated ? (
                  <span className="text-xs text-ink/50">
                    Sincronizado às {lastUpdated.toLocaleTimeString("pt-BR")}
                  </span>
                ) : null}
              </div>

              {/* Grid de Filtros Grandes com Contadores Gigantes */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
                {/* 1. Todos */}
                <button
                  type="button"
                  onClick={() => setStatusFilter("todos")}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                    statusFilter === "todos"
                      ? "border-ink bg-ink text-canvas shadow-lg ring-2 ring-ink/20"
                      : "border-ink/10 bg-surface text-ink hover:border-ink/30"
                  }`}
                >
                  <span className="text-xs font-medium opacity-80">Todos</span>
                  <span className="font-serif text-3xl font-bold tabular-nums">
                    {statusCounts.todos}
                  </span>
                  <span className="text-[10px] mt-1 uppercase tracking-wider opacity-60">Geral</span>
                </button>

                {/* 2. Novos (Destaque Vermelho/Terracota pulsante se houver) */}
                <button
                  type="button"
                  onClick={() => setStatusFilter("novo")}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                    statusFilter === "novo"
                      ? "border-terracotta bg-terracotta text-canvas shadow-lg ring-2 ring-terracotta/30"
                      : "border-terracotta/30 bg-terracotta/10 text-terracotta hover:border-terracotta/60"
                  }`}
                >
                  {statusCounts.novo > 0 ? (
                    <span className="absolute top-2 right-2 flex size-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-75"></span>
                      <span className="relative inline-flex size-2.5 rounded-full bg-terracotta"></span>
                    </span>
                  ) : null}
                  <div className="flex items-center gap-1">
                    <Flame className="size-3.5" />
                    <span className="text-xs font-bold">Novos</span>
                  </div>
                  <span className="font-serif text-3xl font-bold tabular-nums">
                    {statusCounts.novo}
                  </span>
                  <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">
                    A Confirmar
                  </span>
                </button>

                {/* 3. Confirmados */}
                <button
                  type="button"
                  onClick={() => setStatusFilter("confirmado")}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                    statusFilter === "confirmado"
                      ? "border-sky-600 bg-sky-600 text-canvas shadow-lg ring-2 ring-sky-600/30"
                      : "border-sky-500/20 bg-sky-500/10 text-sky-800 dark:text-sky-300 hover:border-sky-500/40"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" />
                    <span className="text-xs font-bold">Confirmados</span>
                  </div>
                  <span className="font-serif text-3xl font-bold tabular-nums">
                    {statusCounts.confirmado}
                  </span>
                  <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">
                    Na Fila
                  </span>
                </button>

                {/* 4. Preparando / No Forno */}
                <button
                  type="button"
                  onClick={() => setStatusFilter("preparando")}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                    statusFilter === "preparando"
                      ? "border-amber-600 bg-amber-600 text-canvas shadow-lg ring-2 ring-amber-600/30"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    <span className="text-xs font-bold">No Forno</span>
                  </div>
                  <span className="font-serif text-3xl font-bold tabular-nums">
                    {statusCounts.preparando}
                  </span>
                  <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">
                    Em Preparo
                  </span>
                </button>

                {/* 5. Prontos */}
                <button
                  type="button"
                  onClick={() => setStatusFilter("pronto")}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                    statusFilter === "pronto"
                      ? "border-olive bg-olive text-canvas shadow-lg ring-2 ring-olive/30"
                      : "border-olive/30 bg-olive/10 text-olive hover:border-olive/50"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <UtensilsCrossed className="size-3.5" />
                    <span className="text-xs font-bold">Prontos</span>
                  </div>
                  <span className="font-serif text-3xl font-bold tabular-nums">
                    {statusCounts.pronto}
                  </span>
                  <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">
                    Pronto p/ Servir
                  </span>
                </button>

                {/* 6. Entregues */}
                <button
                  type="button"
                  onClick={() => setStatusFilter("entregue")}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                    statusFilter === "entregue"
                      ? "border-ink bg-ink text-canvas shadow-lg"
                      : "border-ink/10 bg-surface text-ink hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Check className="size-3.5" />
                    <span className="text-xs font-bold">Entregues</span>
                  </div>
                  <span className="font-serif text-3xl font-bold tabular-nums">
                    {statusCounts.entregue}
                  </span>
                  <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">
                    Concluídos
                  </span>
                </button>
              </div>
            </div>

            {/* LISTA DE CARDS GRANDES DE PEDIDOS */}
            <div className="mt-8">
              {filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-ink/20 bg-surface/40 px-6 py-20 text-center">
                  <Package className="mx-auto size-16 text-ink/30" />
                  <h3 className="mt-4 font-serif text-2xl text-ink">Nenhum pedido nesta etapa</h3>
                  <p className="mt-1 text-sm text-ink/60">
                    {statusFilter === "todos"
                      ? "Nenhum pedido registrado no momento."
                      : `Não há pedidos com o status "${statusLabels[statusFilter]}".`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
                    const isNew = order.status === "novo";

                    return (
                      <article
                        key={order.id}
                        className={`flex flex-col justify-between rounded-3xl border bg-surface p-6 shadow-md transition-all duration-200 hover:shadow-xl ${
                          isNew
                            ? "border-terracotta ring-4 ring-terracotta/20"
                            : "border-ink/10"
                        }`}
                      >
                        <div>
                          {/* Cabeçalho do Card: Código Gigante e Badge de Status */}
                          <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-serif text-3xl font-bold tracking-tight text-ink">
                                  {order.code}
                                </span>
                                {isNew ? (
                                  <span className="rounded-full bg-terracotta px-2.5 py-0.5 text-[10px] font-bold text-canvas uppercase animate-pulse">
                                    Novo
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
                                <Clock className="size-3.5" />
                                {dateString} às <strong>{timeString}</strong>
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                  statusColors[order.status]
                                }`}
                              >
                                {statusLabels[order.status]}
                              </span>
                              <Link
                                href={`/pedido/${order.code.replace("#", "")}`}
                                target="_blank"
                                className="flex items-center gap-1 text-[11px] font-semibold text-terracotta hover:underline"
                              >
                                Ver tela do cliente
                                <ExternalLink className="size-3" />
                              </Link>
                            </div>
                          </div>

                          {/* FAIXA DESTACADA DA MESA OU MODALIDADE (IMPOSSÍVEL NÃO NOTAR) */}
                          <div className="my-4">
                            {order.fulfillment === "Na mesa" ? (
                              <div className="flex items-center gap-3 rounded-2xl border-2 border-terracotta/30 bg-terracotta/15 p-4 text-ink">
                                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-terracotta text-canvas shadow-xs">
                                  <UtensilsCrossed className="size-6" />
                                </span>
                                <div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-terracotta-dark">
                                    Consumo no Local
                                  </span>
                                  <p className="font-serif text-2xl font-bold leading-tight text-ink">
                                    {order.tableNumber ? `MESA ${order.tableNumber}` : "Mesa no Salão"}
                                  </p>
                                </div>
                              </div>
                            ) : order.fulfillment === "Entrega" ? (
                              <div className="flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-ink">
                                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-600 text-canvas shadow-xs">
                                  <Truck className="size-6" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                                    Entrega em Domicílio
                                  </span>
                                  <p className="text-sm font-semibold truncate text-ink">
                                    {order.address || "Endereço a combinar"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 rounded-2xl border border-olive/30 bg-olive/10 p-4 text-ink">
                                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-olive text-canvas shadow-xs">
                                  <Store className="size-6" />
                                </span>
                                <div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-olive">
                                    Retirada Balcão
                                  </span>
                                  <p className="font-serif text-xl font-bold text-ink">
                                    Cliente retira no balcão
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Dados do Cliente e Pagamento */}
                          <div className="rounded-2xl bg-canvas p-3.5 text-xs text-ink/80">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-ink">
                                {order.customerName}
                              </span>
                              <span className="rounded-full bg-surface px-2.5 py-0.5 font-semibold text-ink/80">
                                {order.payment}
                                {order.changeFor ? ` (Troco: R$ ${order.changeFor})` : ""}
                              </span>
                            </div>
                            {order.customerEmail ? (
                              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink/60">
                                <Mail className="size-3" />
                                {order.customerEmail}
                              </p>
                            ) : null}
                          </div>

                          {/* Itens do Pedido com Quantidades em Destaque */}
                          <div className="mt-4 border-t border-ink/10 pt-3">
                            <p className="text-xs font-bold tracking-wider text-ink/50 uppercase">
                              Itens da Comanda ({order.items.reduce((s, i) => s + i.quantity, 0)})
                            </p>
                            <ul className="mt-2.5 space-y-2">
                              {order.items.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center justify-between rounded-xl bg-canvas/70 px-3 py-2 text-sm"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="grid size-6.5 place-items-center rounded-lg bg-terracotta/15 text-xs font-bold text-terracotta">
                                      {item.quantity}×
                                    </span>
                                    <span className="font-semibold text-ink">{item.name}</span>
                                  </div>
                                  <span className="font-medium tabular-nums text-xs text-ink/60">
                                    {formatCurrency(item.lineTotal)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Rodapé do Card: Subtotal e BOTÃO GIGANTE DE AÇÃO */}
                        <div className="mt-6 border-t border-ink/10 pt-4">
                          <div className="flex items-center justify-between text-sm mb-4">
                            <span className="text-xs text-ink/60">Total do Pedido:</span>
                            <span className="font-serif text-2xl font-bold tabular-nums text-ink">
                              {formatCurrency(order.subtotal)}
                            </span>
                          </div>

                          {/* BOTÃO DE AÇÃO GIGANTE PARA TOCAR COM FACILIDADE */}
                          {nextStatus && nextAction ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, nextStatus)}
                              className="inline-flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-terracotta px-5 text-sm font-bold text-canvas shadow-md transition-all hover:bg-terracotta-dark hover:shadow-lg active:scale-98"
                            >
                              <span>Avançar: {nextAction}</span>
                              <ArrowRight className="size-4.5" />
                            </button>
                          ) : order.status === "entregue" ? (
                            <div className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-olive/15 text-sm font-bold text-olive">
                              <CheckCircle2 className="size-5" />
                              Pedido Concluído e Entregue
                            </div>
                          ) : null}

                          {/* Seletor Manual de Status e Cancelar */}
                          <div className="mt-3 flex items-center justify-between gap-2 text-xs pt-1">
                            {order.status !== "cancelado" && order.status !== "entregue" ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, "cancelado")}
                                className="cursor-pointer text-ink/40 hover:text-terracotta-dark hover:underline"
                              >
                                Cancelar pedido
                              </button>
                            ) : (
                              <span />
                            )}

                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-ink/50">Mudar para:</span>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateStatus(order.id, e.target.value as OrderStatus)
                                }
                                className="cursor-pointer rounded-xl border border-ink/15 bg-canvas px-2.5 py-1.5 text-xs font-medium text-ink outline-none"
                              >
                                {orderStatuses.map((st) => (
                                  <option key={st} value={st}>
                                    {statusLabels[st]}
                                  </option>
                                ))}
                              </select>
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

        {/* CONTEÚDO DA ABA ENTRADAS NO SITE */}
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
