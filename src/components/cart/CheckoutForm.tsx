"use client";

import { CheckCircle2, Store, Truck, UserCheck, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import type { FieldErrors } from "@/lib/whatsapp";
import {
  fulfillmentOptions,
  paymentOptions,
  type CheckoutValues,
} from "@/lib/whatsapp";

type CheckoutFormProps = {
  values: CheckoutValues;
  errors: FieldErrors;
  onChange: (patch: Partial<CheckoutValues>) => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-terracotta-dark">
      {message}
    </p>
  );
}

export function CheckoutForm({ values, errors, onChange }: CheckoutFormProps) {
  const { customer, isHydrated, openLoginModal } = useCustomerAuth();

  // Preenche automaticamente o nome quando o cliente estiver logado via Google
  useEffect(() => {
    if (isHydrated && customer?.name && !values.name) {
      onChange({ name: customer.name });
    }
  }, [customer, isHydrated, values.name, onChange]);

  return (
    <div className="space-y-6 border-t border-ink/10 px-5 py-6">
      {/* 1. Bloco de Identificação / Login com Google */}
      <div>
        <h3 className="font-serif text-2xl text-ink">Identificação</h3>
        <p className="mt-1 text-xs text-ink/70">
          Para acompanhar o status do pedido em tempo real e garantir seu atendimento direto.
        </p>

        {isHydrated && customer ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-olive/20 bg-olive/10 p-3.5">
            <div className="flex items-center gap-3">
              {customer.picture ? (
                <div className="relative size-10 overflow-hidden rounded-full border border-olive/30">
                  <Image
                    src={customer.picture}
                    alt={customer.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="grid size-10 place-items-center rounded-full bg-olive/20 text-olive">
                  <UserCheck className="size-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{customer.name}</p>
                <p className="truncate text-xs text-ink/70">{customer.email}</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-olive/20 px-2.5 py-1 text-[11px] font-semibold text-olive">
              <CheckCircle2 className="size-3" />
              Google
            </span>
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-terracotta/25 bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-canvas p-1.5 shadow-xs">
                <GoogleIcon className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">Login com Google obrigatório</p>
                <p className="mt-0.5 text-xs text-ink/75">
                  Conecte sua conta para registrar seu pedido e liberar o envio pelo WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-xs font-semibold text-canvas transition-colors hover:bg-ink/80"
                >
                  <GoogleIcon className="size-3.5" />
                  Conectar conta Google agora
                </button>
              </div>
            </div>
            <FieldError message={errors.auth} />
          </div>
        )}
      </div>

      {/* 2. Dados de Recebimento */}
      <div className="space-y-5 border-t border-ink/10 pt-5">
        <label className="block space-y-2 text-sm font-semibold text-ink">
          Nome no Pedido
          <input
            value={values.name}
            onChange={(event) => onChange({ name: event.target.value })}
            autoComplete="name"
            placeholder="Seu nome"
            className="h-12 w-full rounded-2xl border border-ink/10 bg-canvas px-4 font-normal outline-none transition focus:border-terracotta"
          />
          <FieldError message={errors.name} />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-ink">Onde você vai saborear?</legend>
          <div className="grid grid-cols-3 gap-2">
            {fulfillmentOptions.map((option) => {
              const selected = values.fulfillment === option;
              return (
                <label
                  key={option}
                  className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer rounded-2xl border p-3 text-center transition ${
                    selected
                      ? "border-ink bg-ink text-canvas shadow-xs"
                      : "border-ink/10 bg-canvas text-ink hover:bg-canvas/80"
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    value={option}
                    checked={selected}
                    onChange={() => onChange({ fulfillment: option })}
                    className="sr-only"
                  />
                  {option === "Na mesa" ? (
                    <UtensilsCrossed className="size-4 shrink-0" />
                  ) : option === "Retirada no balcão" ? (
                    <Store className="size-4 shrink-0" />
                  ) : (
                    <Truck className="size-4 shrink-0" />
                  )}
                  <span className="text-xs font-medium leading-tight">
                    {option === "Na mesa"
                      ? "Na mesa"
                      : option === "Retirada no balcão"
                        ? "Retirada"
                        : "Entrega"}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {values.fulfillment === "Na mesa" ? (
          <label className="block space-y-2 text-sm font-semibold text-ink">
            Número da Mesa
            <input
              value={values.tableNumber}
              onChange={(event) => onChange({ tableNumber: event.target.value })}
              placeholder="Ex.: Mesa 04 (veja na placa da mesa)"
              className="h-12 w-full rounded-2xl border border-ink/10 bg-canvas px-4 font-normal outline-none transition focus:border-terracotta"
            />
            <span className="block text-xs font-normal text-ink/60">
              Nosso garçom levará seu pedido quentinho direto até você.
            </span>
            <FieldError message={errors.tableNumber} />
          </label>
        ) : null}

        {values.fulfillment === "Entrega" ? (
          <label className="block space-y-2 text-sm font-semibold text-ink">
            Endereço Completo
            <textarea
              value={values.address}
              onChange={(event) => onChange({ address: event.target.value })}
              rows={3}
              placeholder="Rua, número, bairro e referências de entrega"
              className="w-full resize-none rounded-2xl border border-ink/10 bg-canvas px-4 py-3 font-normal outline-none transition focus:border-terracotta"
            />
            <FieldError message={errors.address} />
          </label>
        ) : null}

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-ink">Forma de pagamento</legend>
          <div className="grid gap-2">
            {paymentOptions.map((option) => {
              const selected = values.payment === option;
              return (
                <label
                  key={option}
                  className={`cursor-pointer rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                    selected ? "border-ink bg-ink text-canvas shadow-xs" : "border-ink/10 bg-canvas text-ink hover:bg-canvas/80"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option}
                    checked={selected}
                    onChange={() => onChange({ payment: option, changeFor: "" })}
                    className="sr-only"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>

        {values.payment === "Dinheiro" ? (
          <label className="block space-y-2 text-sm font-semibold text-ink">
            Troco para quanto?
            <input
              value={values.changeFor}
              onChange={(event) => onChange({ changeFor: event.target.value })}
              inputMode="decimal"
              placeholder="Opcional. Ex.: 50,00"
              className="h-12 w-full rounded-2xl border border-ink/10 bg-canvas px-4 font-normal outline-none transition focus:border-terracotta"
            />
            <span className="block text-xs font-normal text-ink/60">
              Deixe vazio se for pagar o valor exato.
            </span>
            <FieldError message={errors.changeFor} />
          </label>
        ) : null}
      </div>
    </div>
  );
}
