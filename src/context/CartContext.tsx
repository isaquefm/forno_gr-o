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
import { productCategories, type Product } from "../data/products";

const CART_STORAGE_KEY = "forno-e-grao-cart";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  addItem: (product: Product) => void;
  incrementItem: (productId: Product["id"]) => void;
  decrementItem: (productId: Product["id"]) => void;
  removeItem: (productId: Product["id"]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isStoredProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;

  const product = value as Partial<Product>;

  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    typeof product.image === "string" &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    typeof product.category === "string" &&
    productCategories.includes(product.category as Product["category"]) &&
    Array.isArray(product.ingredients) &&
    product.ingredients.every((ingredient) => typeof ingredient === "string") &&
    (product.badge === undefined ||
      product.badge === "Mais pedido" ||
      product.badge === "Feito hoje") &&
    (product.featured === undefined || typeof product.featured === "boolean")
  );
}

function isStoredCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;
  return (
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    isStoredProduct(item.product)
  );
}

function getStoredCart(): CartItem[] {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart: unknown = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart.filter(isStoredCartItem) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // O acesso ao localStorage ocorre somente após a hidratação no navegador.
  useEffect(() => {
    setItems(getStoredCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // A navegação continua funcional mesmo se o armazenamento estiver indisponível.
    }
  }, [items, isHydrated]);

  const addItem = useCallback((product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { product, quantity: 1 }];
    });
  }, []);

  const incrementItem = useCallback((productId: Product["id"]) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }, []);

  const decrementItem = useCallback((productId: Product["id"]) => {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.product.id !== productId) return item;
        if (item.quantity === 1) return [];

        return { ...item, quantity: item.quantity - 1 };
      }),
    );
  }, []);

  const removeItem = useCallback((productId: Product["id"]) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotal,
      isHydrated,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    };
  }, [
    addItem,
    clearCart,
    decrementItem,
    incrementItem,
    isHydrated,
    items,
    removeItem,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider.");
  }

  return context;
}
