"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  PackageOpen,
  Palette,
  Tag,
  Clock,
  Zap,
  CheckCircle,
} from "lucide-react";
import { NavbarPage } from "@/app/component/Navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart, CartItem } from "@/src/lib/cartContext";
import { useProfile } from "@/src/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";



function CartItemCard({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex gap-0">
        {/* Image / Color accent */}
        <div className="relative w-28 sm:w-36 flex-shrink-0">
          {item.serviceImage ? (
            <img
              src={item.serviceImage}
              alt={item.serviceName}
              className="h-full w-full object-cover min-h-[120px]"
            />
          ) : (
            <div className="h-full min-h-[120px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">
              {item.serviceName}
            </h3>
            <button
              onClick={onRemove}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>


          {/* Price + Qty */}
          <div className="flex items-center justify-between mt-auto pt-1">
            <p className="text-[#236b9d] font-bold text-sm sm:text-base">
              NPR {(item.price * item.quantity).toLocaleString()}
              {item.quantity > 1 && (
                <span className="text-xs font-normal text-slate-400 ml-1">
                  ({item.price.toLocaleString()} × {item.quantity})
                </span>
              )}
            </p>
            {/* Qty stepper */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQty(Math.max(1, item.quantity - 1))}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#236b9d] transition text-slate-600"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-slate-800">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQty(Math.min(10, item.quantity + 1))}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#236b9d] transition text-slate-600"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { data: userProfile, isLoading: authLoading } = useProfile();
  const { items, totalItems, totalPrice, removeItem, updateItem, clearCart } = useCart();
  const [proceedingId, setProceedingId] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  React.useEffect(() => {
    if (!authLoading && !userProfile?.data) {
      router.replace("/signin");
    }
  }, [authLoading, userProfile, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavbarPage />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#236b9d]" />
        </div>
      </div>
    );
  }

  const handleProceedBooking = (item: CartItem) => {
    setProceedingId(item.id);
    router.push(`/booking/${item.serviceId}`);
  };

  const handleBookAll = () => {
    if (items.length === 0) return;
    router.push(`/cart/checkout`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <NavbarPage />

      <div className="max-w-5xl mx-auto px-4 py-8 mt-14">
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#236b9d] transition mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-[#236b9d]" />
              My Booking Cart
              {totalItems > 0 && (
                <Badge className="bg-[#236b9d] text-white text-base px-3 py-1 rounded-full">
                  {totalItems}
                </Badge>
              )}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Review your selections and proceed to book
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="text-sm text-red-400 hover:text-red-600 transition flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>

        {/* ── Empty state ───────────────────────────────────── */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 max-w-xs mb-8">
              Browse our services and add them to your cart to get started.
            </p>
            <Button
              onClick={() => router.push("/services")}
              className="bg-[#236b9d] hover:bg-[#1a5177] rounded-full px-8 h-11"
            >
              Explore Services
            </Button>
          </div>
        )}

        {/* ── Cart items + summary ──────────────────────────── */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: item list */}
            <div className="lg:col-span-2 space-y-4">

              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <CartItemCard
                    item={item}
                    onRemove={() => {
                      removeItem(item.id);
                      toast.success(`"${item.serviceName}" removed`);
                    }}
                    onUpdateQty={(qty) => updateItem(item.id, { quantity: qty })}
                  />
                  {/* Per-item Book Now */}
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full px-5 text-xs border-[#236b9d] text-[#236b9d] hover:bg-[#236b9d] hover:text-white transition-all"
                      onClick={() => handleProceedBooking(item)}
                      disabled={proceedingId === item.id}
                    >
                      {proceedingId === item.id ? (
                        "Redirecting..."
                      ) : (
                        <>
                          Book This <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: order summary */}
            <div className="space-y-4">
              <div className="sticky top-20 space-y-4">
                {/* Summary card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
                  <Separator />

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600 truncate mr-2">
                          {item.serviceName}
                          {item.quantity > 1 && (
                            <span className="text-slate-400 ml-1">×{item.quantity}</span>
                          )}
                        </span>
                        <span className="font-semibold text-slate-800 flex-shrink-0">
                          NPR {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Total</span>
                    <span className="text-2xl font-bold text-[#236b9d]">
                      NPR {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <Button
                    className="w-full rounded-full h-12 bg-[#236b9d] hover:bg-[#1a5177] text-base font-semibold shadow-md hover:shadow-lg transition-all"
                    onClick={handleBookAll}
                  >
                    Proceed to Book <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    All services in your cart will be booked together in one seamless checkout.
                  </p>
                </div>

                {/* Trust badges */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 space-y-3">
                  {[
                    { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, text: "Verified professionals" },
                    { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, text: "Secure Khalti / Cash payment" },
                    { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, text: "Satisfaction guaranteed" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      {t.icon}
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
