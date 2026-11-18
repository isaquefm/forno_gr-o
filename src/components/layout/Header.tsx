"use client";

import { LogOut, Menu, Package, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MyOrdersModal } from "@/components/cart/MyOrdersModal";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { navLinks } from "@/data/site";

export function Header() {
  const { itemCount, isHydrated: isCartHydrated } = useCart();
  const { customer, isHydrated: isAuthHydrated, openLoginModal, logout } = useCustomerAuth();
  const { openDrawer } = useCartDrawer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  const visibleCount = isCartHydrated ? itemCount : 0;
  const firstName = customer?.name?.split(" ")[0] || "Cliente";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
          <a href="#topo" className="font-serif text-xl tracking-tight text-ink">
            Forno <span className="text-terracotta">&</span> Grão
          </a>

          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Seções">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink/85 transition-colors hover:text-terracotta"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Alternador de Tema Claro / Dark Café */}
            <ThemeToggle />

            {/* Botão Acompanhar Pedido */}
            <button
              type="button"
              onClick={() => setIsOrdersModalOpen(true)}
              title="Acompanhar status do pedido"
              className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border border-ink/10 bg-surface px-3 text-xs font-semibold text-ink transition hover:border-terracotta hover:text-terracotta"
            >
              <Package className="size-4 text-terracotta" />
              <span className="hidden sm:inline">Acompanhar</span>
            </button>

            {/* Botão de Login com Google ou Perfil */}
            {isAuthHydrated && customer ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-surface px-3 text-xs font-semibold text-ink transition hover:border-terracotta"
                >
                  {customer.picture ? (
                    <div className="relative size-6 overflow-hidden rounded-full border border-ink/10">
                      <Image
                        src={customer.picture}
                        alt={customer.name}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="grid size-6 place-items-center rounded-full bg-terracotta/15 text-terracotta">
                      <User className="size-3.5" />
                    </span>
                  )}
                  <span className="hidden max-w-[80px] truncate sm:inline-block">
                    {firstName}
                  </span>
                </button>

                {isUserMenuOpen ? (
                  <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl border border-ink/10 bg-canvas p-2 shadow-2xl z-50">
                    <div className="border-b border-ink/10 px-3 py-2 text-left">
                      <p className="truncate text-xs font-semibold text-ink">{customer.name}</p>
                      <p className="truncate text-[11px] text-ink/60">{customer.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOrdersModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface"
                    >
                      <Package className="size-3.5 text-terracotta" />
                      Meus Pedidos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-terracotta-dark hover:bg-surface"
                    >
                      <LogOut className="size-3.5" />
                      Sair da conta
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-surface px-3.5 text-xs font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
              >
                <GoogleIcon className="size-3.5" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Botão da Sacola */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas transition-colors hover:bg-ink/90"
              aria-label={
                visibleCount > 0 ? `Abrir sacola, ${visibleCount} itens` : "Abrir sacola"
              }
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sacola</span>
              {visibleCount > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 text-xs text-canvas">
                  {visibleCount}
                </span>
              ) : null}
            </button>

            {/* Menu Mobile */}
            <button
              type="button"
              className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-surface text-ink md:hidden"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <nav className="border-t border-ink/10 px-5 py-3 md:hidden bg-canvas" aria-label="Seções">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-3 text-sm text-ink"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {isCartHydrated ? `${itemCount} ${itemCount === 1 ? "item" : "itens"} na sacola` : ""}
        </p>
      </header>

      {/* Modal de Acompanhamento / Meus Pedidos */}
      <MyOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />
    </>
  );
}
