import Link from "next/link";
import { About } from "@/components/home/About";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { Location } from "@/components/home/Location";
import { Menu } from "@/components/home/Menu";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="topo">
        <Hero />
        <Highlights />
        <Menu />
        <About />
        <Location />
      </main>
      <footer className="border-t border-ink/10 bg-canvas px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-sm text-ink/70 sm:flex-row sm:text-left">
          <p>
            <strong className="font-serif font-bold text-ink">Forno & Grão</strong> · Padaria
            artesanal e café · Vila Madalena, São Paulo
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/admin"
              className="rounded-full border border-ink/15 px-3 py-1 font-medium text-ink/60 transition hover:border-terracotta hover:text-terracotta"
            >
              🔒 Painel da Equipe
            </Link>
          </div>
        </div>
      </footer>
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
