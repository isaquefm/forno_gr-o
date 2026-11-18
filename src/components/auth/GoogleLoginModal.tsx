"use client";

import { AlertCircle, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export function GoogleLoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithGoogleData } = useCustomerAuth();
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Renderiza botão oficial do Google se houver Client ID
  useEffect(() => {
    if (!isLoginModalOpen || !googleClientId) return;

    const interval = setInterval(() => {
      const google = (window as unknown as { google?: { accounts?: { id?: { renderButton: (el: HTMLElement, opts: object) => void } } } }).google;
      if (google?.accounts?.id && googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = "";
        google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "pill",
        });
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isLoginModalOpen, googleClientId]);

  if (!isLoginModalOpen) return null;

  async function handleQuickGoogleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setError("Por favor, preencha seu nome e e-mail.");
      return;
    }
    if (!customEmail.includes("@") || !customEmail.includes(".")) {
      setError("Por favor, informe um e-mail válido.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await loginWithGoogleData(
        customName.trim(),
        customEmail.trim().toLowerCase(),
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(customName)}`,
      );
    } catch {
      setError("Ocorreu um erro ao conectar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={closeLoginModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-ink/10 bg-canvas p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-5 right-5 grid size-9 cursor-pointer place-items-center rounded-full hover:bg-surface text-ink/60 hover:text-ink"
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>

        <div className="text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-surface p-2 shadow-xs">
            <GoogleIcon className="size-6" />
          </span>
          <h2 className="mt-3 font-serif text-2xl text-ink">Entrar com o Google</h2>
          <p className="mt-1 text-xs font-semibold tracking-wider text-olive uppercase">
            Identificação Segura de Cliente
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">
            Faça login para acompanhar seus pedidos, receber novidades fresquinhas do forno e
            personalizar sua experiência.
          </p>
        </div>

        {/* Botão Oficial do Google GIS (se configurado) */}
        {googleClientId ? (
          <div className="mt-6 flex flex-col items-center justify-center">
            <div ref={googleBtnContainerRef} className="min-h-[44px]" />
            <div className="my-4 flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-ink/10" />
              <span className="text-xs text-ink/40">ou entrada manual rápida</span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>
          </div>
        ) : null}

        {/* Formulário de Identificação Rápida / Simulação Google */}
        <form onSubmit={handleQuickGoogleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink/80">
              Seu Nome Completo
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ex.: Maria Souza"
              className="mt-1.5 h-11 w-full rounded-2xl border border-ink/15 bg-surface px-4 text-sm text-ink outline-none transition focus:border-terracotta"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/80">
              Seu E-mail da Conta Google
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="Ex.: maria.souza@gmail.com"
              className="mt-1.5 h-11 w-full rounded-2xl border border-ink/15 bg-surface px-4 text-sm text-ink outline-none transition focus:border-terracotta"
            />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl bg-terracotta/10 p-2.5 text-xs text-terracotta-dark">
              <AlertCircle className="size-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-terracotta text-sm font-semibold text-canvas transition-colors hover:bg-terracotta-dark disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            {isSubmitting ? "Conectando..." : "Conectar com Google"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-ink/50">
          Seus dados são utilizados exclusivamente para identificar seu pedido e contato da loja.
        </p>
      </div>
    </div>
  );
}
