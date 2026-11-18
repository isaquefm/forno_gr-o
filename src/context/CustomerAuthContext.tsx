"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CustomerUser } from "@/types/customer";

const STORAGE_KEY = "forno_grao_customer_session";

interface CustomerAuthContextValue {
  customer: CustomerUser | null;
  isHydrated: boolean;
  loginWithGoogleData: (name: string, email: string, picture?: string) => Promise<void>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Hidratação do localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.email === "string") {
          setCustomer(parsed);
        }
      }
    } catch {
      // Ignora erro de storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const loginWithGoogleData = useCallback(
    async (name: string, email: string, picture?: string) => {
      try {
        const res = await fetch("/api/customers/entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, picture }),
        });

        if (res.ok) {
          const registeredCustomer: CustomerUser = await res.json();
          setCustomer(registeredCustomer);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registeredCustomer));
        } else {
          // Fallback caso backend falhe
          const fallbackUser: CustomerUser = {
            id: `temp_${Date.now()}`,
            name,
            email,
            picture,
            provider: "google",
            firstVisitAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            loginCount: 1,
          };
          setCustomer(fallbackUser);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
        }
      } catch {
        const fallbackUser: CustomerUser = {
          id: `temp_${Date.now()}`,
          name,
          email,
          picture,
          provider: "google",
          firstVisitAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          loginCount: 1,
        };
        setCustomer(fallbackUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
      }
      setIsLoginModalOpen(false);
    },
    [],
  );

  const logout = useCallback(() => {
    setCustomer(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora
    }
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  // Inicializa o Google Identity Services se houver Client ID
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const google = (window as unknown as { google?: { accounts?: { id?: { initialize: (config: object) => void } } } }).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              const payload = parseJwt(response.credential);
              if (payload?.email && payload?.name) {
                loginWithGoogleData(payload.name, payload.email, payload.picture);
              }
            }
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [loginWithGoogleData]);

  const value = useMemo(
    () => ({
      customer,
      isHydrated,
      loginWithGoogleData,
      logout,
      openLoginModal,
      closeLoginModal,
      isLoginModalOpen,
    }),
    [
      customer,
      isHydrated,
      loginWithGoogleData,
      logout,
      openLoginModal,
      closeLoginModal,
      isLoginModalOpen,
    ],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth deve ser usado dentro de um CustomerAuthProvider.");
  }
  return context;
}
