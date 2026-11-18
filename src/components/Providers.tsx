"use client";

import type { ReactNode } from "react";
import { GoogleLoginModal } from "@/components/auth/GoogleLoginModal";
import { CartProvider } from "@/context/CartContext";
import { CartDrawerProvider } from "@/context/CartDrawerContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <CartDrawerProvider>
            {children}
            <GoogleLoginModal />
          </CartDrawerProvider>
        </CartProvider>
      </CustomerAuthProvider>
    </ThemeProvider>
  );
}
