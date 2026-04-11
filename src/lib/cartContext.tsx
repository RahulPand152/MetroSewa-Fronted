"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;           // unique cart-item id (uuid)
  serviceId: string;
  serviceName: string;
  serviceImage?: string;
  price: number;
  category?: string;
  // user-selected options
  selectedColor?: string;
  selectedAttributes: Record<string, string>; // e.g. { "Size": "Large", "Type": "Standard" }
  quantity: number;
  addedAt: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => void;
  removeItem: (cartItemId: string) => void;
  updateItem: (cartItemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  isInCart: (serviceId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "metro_sewa_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

let idCounter = 0;
function genId() {
  return `cart-${Date.now()}-${idCounter++}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "id" | "addedAt">) => {
    setItems((prev) => {
      // Check if item with same serviceId already exists
      const existingItemIndex = prev.findIndex((i) => i.serviceId === item.serviceId);
      
      if (existingItemIndex >= 0) {
        // If it exists, just add to its quantity
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + item.quantity,
        };
        return updated;
      }
      
      // Otherwise, add a new row
      const newItem: CartItem = {
        ...item,
        id: genId(),
        addedAt: new Date().toISOString(),
      };
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const updateItem = useCallback((cartItemId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, ...updates } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (serviceId: string) => items.some((i) => i.serviceId === serviceId),
    [items]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addItem, removeItem, updateItem, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
