"use client";

import { Check, Eye, Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { useCart } from "@/context/CartContext";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getWhatsAppPhone } from "@/data/site";
import { formatCurrency } from "@/lib/currency";
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  emptyCheckout,
  validateCheckout,
  type CheckoutValues,
  type FieldErrors,
} from "@/lib/whatsapp";
import type { CreateOrderPayload, Order } from "@/types/order";

export function CartDrawer() {
  const { items, subtotal, itemCount, incrementItem, decrementItem, removeItem, clearCart } =
    useCart();
  const { isOpen, closeDrawer } = useCartDrawer();
  const { customer, openLoginModal } = useCustomerAuth();

  const [values, setValues] = useState<CheckoutValues>(emptyCheckout);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [orderSent, setOrderSent] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const phone = getWhatsAppPhone();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [closeDrawer, isOpen]);

  // Reseta o estado de "pedido enviado" quando o drawer abre
  useEffect(() => {
    if (isOpen) {
      setOrderSent(false);
      setCreatedOrderCode(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  function updateValues(patch: Partial<CheckoutValues>) {
    setValues((current) => ({ ...current, ...patch }));
    setErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const isLoggedIn = Boolean(customer);
    const nextErrors = validateCheckout(values, itemCount, subtotal, phone, isLoggedIn);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.auth) {
        openLoginModal();
      }
      requestAnimationFrame(() => {
        document.querySelector("[role='alert']")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    setIsSubmitting(true);

    let generatedCode: string | undefined = undefined;

    // 1. Registra o pedido no painel interno da Forno & Grão
    try {
      const payload: CreateOrderPayload = {
        customerName: values.name,
        customerEmail: customer?.email,
        fulfillment: values.fulfillment,
        tableNumber: values.fulfillment === "Na mesa" ? values.tableNumber : undefined,
        address: values.fulfillment === "Entrega" ? values.address : undefined,
        payment: values.payment,
        changeFor: values.payment === "Dinheiro" ? values.changeFor : undefined,
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          lineTotal: item.product.price * item.quantity,
        })),
        subtotal,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const orderData: Order = await res.json();
        generatedCode = orderData.code;
        setCreatedOrderCode(orderData.code);
      }
    } catch (err) {
      console.warn("Aviso: falha ao salvar pedido no painel interno, prosseguindo com WhatsApp.", err);
    }

    // Link de acompanhamento
    const trackingUrl = generatedCode
      ? `${window.location.origin}/pedido/${generatedCode.replace("#", "")}`
      : undefined;

    // 2. Monta mensagem do WhatsApp personalizada com o código, mesa e e-mail Google
    const message = buildOrderMessage(
      values,
      items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        lineTotal: item.product.price * item.quantity,
      })),
      subtotal,
      generatedCode,
      customer?.email,
      trackingUrl,
    );

    const whatsappUrl = buildWhatsAppUrl(phone, message);

    // 3. Mostra confirmação visual
    setOrderSent(true);
    setIsSubmitting(false);

    // 4. Limpa o carrinho e reseta o formulário
    clearCart();
    setValues(emptyCheckout);
    setErrors({});

    // 5. Redireciona automaticamente para o WhatsApp após 1.6s
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 1600);
  }

  const cleanOrderCode = createdOrderCode ? createdOrderCode.replace("#", "") : null;

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={isOpen ? undefined : true}
      {...(isOpen ? {} : { inert: true })}
    >
      <button
        type="button"
        aria-label="Fechar sacola"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeDrawer}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute top-0 right-0 flex h-dvh w-full max-w-md flex-col bg-canvas shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <h2 id={titleId} className="font-serif text-2xl text-ink">
              Sua sacola
            </h2>
            <button
              type="button"
              onClick={closeDrawer}
              ref={closeButtonRef}
              aria-label="Fechar sacola"
              className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-surface text-ink"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Mensagem de confirmação de pedido enviado */}
            {orderSent ? (
              <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-olive/15">
                  <Check className="size-8 text-olive" />
                </div>
                <p className="mt-5 font-serif text-3xl text-ink">Pedido registrado!</p>
                {createdOrderCode ? (
                  <span className="mt-2 inline-block rounded-full bg-surface px-4 py-1 text-sm font-semibold tracking-wider text-ink">
                    Código: {createdOrderCode}
                  </span>
                ) : null}
                <p className="mt-3 text-sm text-ink/70">
                  Estamos redirecionando você para o WhatsApp da Forno & Grão para finalizar o
                  atendimento.
                </p>

                {cleanOrderCode ? (
                  <Link
                    href={`/pedido/${cleanOrderCode}`}
                    onClick={closeDrawer}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-canvas transition hover:bg-ink/85 shadow-md"
                  >
                    <Eye className="size-4" />
                    Acompanhar Status ao Vivo
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    const fallbackMsg = createdOrderCode
                      ? `Olá! Acabei de registrar o pedido ${createdOrderCode} pelo site.`
                      : "Olá! Acabei de enviar meu pedido pelo site.";
                    window.location.href = buildWhatsAppUrl(phone, fallbackMsg);
                  }}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-terracotta px-5 text-xs font-semibold text-canvas hover:bg-terracotta-dark transition"
                >
                  Abrir WhatsApp agora
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <p className="font-serif text-3xl text-ink">Sua sacola está vazia</p>
                <p className="mt-3 text-sm text-ink/70">
                  Escolha um pão, um café ou um combo no cardápio.
                </p>
                <a
                  href="#cardapio"
                  onClick={closeDrawer}
                  className="mt-6 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-canvas"
                >
                  Ver cardápio
                </a>
              </div>
            ) : (
              <ul className="divide-y divide-ink/10">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-3 px-5 py-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
                      <Image
                        src={item.product.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-ink">{item.product.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          aria-label={`Remover ${item.product.name}`}
                          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink/70 hover:bg-surface hover:text-ink"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm tabular-nums text-ink/70">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                      <div className="mt-3 inline-flex h-9 items-center rounded-full bg-surface px-1">
                        <button
                          type="button"
                          onClick={() => decrementItem(item.product.id)}
                          aria-label={`Diminuir quantidade de ${item.product.name}`}
                          className="grid size-7 cursor-pointer place-items-center rounded-full text-ink"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-semibold tabular-nums text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementItem(item.product.id)}
                          aria-label={`Aumentar quantidade de ${item.product.name}`}
                          className="grid size-7 cursor-pointer place-items-center rounded-full text-ink"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!orderSent && items.length > 0 ? (
              <CheckoutForm values={values} errors={errors} onChange={updateValues} />
            ) : null}
          </div>

          {!orderSent ? (
            <div className="border-t border-ink/10 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/70">Subtotal</span>
                <span className="text-lg font-semibold tabular-nums text-ink">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/60">
                O subtotal soma só os produtos. Na entrega, o frete é combinado no WhatsApp.
              </p>
              {errors.auth || errors.cart || errors.whatsapp ? (
                <p role="alert" className="mt-3 text-sm font-medium text-terracotta-dark">
                  {errors.auth ?? errors.cart ?? errors.whatsapp}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={items.length === 0 || isSubmitting}
                className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-terracotta text-sm font-semibold text-canvas transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Registrando pedido...
                  </>
                ) : (
                  "Enviar Pedido no WhatsApp"
                )}
              </button>
            </div>
          ) : null}
        </form>
      </aside>
    </div>
  );
}
