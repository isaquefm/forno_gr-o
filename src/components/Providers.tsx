"use client";

import type { ReactNode } from "react";
import { GoogleLoginModal } from "@/components/auth/GoogleLoginModal";
import { CartProvider } from "@/context/CartContext";
import { CartDrawerProvider } from "@/context/CartDrawerContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <CartDrawerProvider>
          {children}
          <GoogleLoginModal />
        </CartDrawerProvider>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
