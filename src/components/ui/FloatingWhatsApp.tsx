"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { getWhatsAppPhone } from "@/data/site";

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);
  const phone = getWhatsAppPhone() || "5514997071115";

  const defaultGreeting = encodeURIComponent(
    "Olá! Gostaria de tirar uma dúvida sobre os pães e cafés da Forno & Grão.",
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${defaultGreeting}`;

  return (
    <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end sm:right-6 sm:bottom-6">
      {/* Balãozinho flutuante de chamada */}
      {showTooltip ? (
        <div className="relative mb-2.5 max-w-[240px] rounded-2xl border border-ink/10 bg-canvas p-3 shadow-xl transition-all sm:max-w-[280px]">
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 grid size-5 cursor-pointer place-items-center rounded-full text-ink/40 hover:bg-surface hover:text-ink"
            aria-label="Fechar mensagem"
          >
            <X className="size-3" />
          </button>
          <div className="flex items-start gap-2.5 pr-4">
            <span className="relative flex size-2.5 shrink-0 mt-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-bold text-ink">Atendimento direto</p>
              <p className="mt-0.5 text-[11px] leading-tight text-ink/75">
                Dúvidas ou encomendas artesanais? Fale com a gente no WhatsApp!
              </p>
            </div>
          </div>
          {/* Triângulo apontador */}
          <div className="absolute -bottom-1.5 right-6 size-3 rotate-45 border-r border-b border-ink/10 bg-canvas" />
        </div>
      ) : null}

      {/* Botão de Ação do WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar conosco no WhatsApp"
        className="group relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
      >
        <MessageCircle className="size-7 fill-white" />
        <span className="sr-only">Abrir conversa no WhatsApp</span>
      </a>
    </div>
  );
}
