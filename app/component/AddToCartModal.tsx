"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, X, Plus, Minus, Palette, SlidersHorizontal, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/src/lib/cartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────
// Predefined color palette for service customisation
// ──────────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { label: "Standard",  value: "standard",   hex: "#6B7280" },
  { label: "White",     value: "white",       hex: "#F9FAFB" },
  { label: "Black",     value: "black",       hex: "#111827" },
  { label: "Blue",      value: "blue",        hex: "#3B82F6" },
  { label: "Green",     value: "green",       hex: "#10B981" },
  { label: "Red",       value: "red",         hex: "#EF4444" },
  { label: "Yellow",    value: "yellow",      hex: "#F59E0B" },
  { label: "Purple",    value: "purple",      hex: "#8B5CF6" },
  { label: "Orange",    value: "orange",      hex: "#F97316" },
  { label: "Pink",      value: "pink",        hex: "#EC4899" },
];

const ATTRIBUTE_PRESETS: Record<string, string[]> = {
  "Service Level": ["Basic", "Standard", "Premium"],
  "Area Size":     ["Small (< 500 sq ft)", "Medium (500–1000 sq ft)", "Large (> 1000 sq ft)"],
  "Urgency":       ["Normal (within 3 days)", "Urgent (within 24h)", "Emergency (same day)"],
  "Time Slot":     ["Morning (8AM–12PM)", "Afternoon (12PM–5PM)", "Evening (5PM–8PM)"],
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: {
    id: string;
    name: string;
    price?: number | null;
    images?: Array<{ url: string }>;
    categoryId?: string;
  };
  onSuccess?: () => void;
}

export function AddToCartModal({ open, onOpenChange, service, onSuccess }: Props) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();

  const [quantity, setQuantity]           = useState(1);
  const [selectedColor, setSelectedColor] = useState("standard");
  const [attributes, setAttributes]       = useState<Record<string, string>>({
    "Service Level": "Standard",
    "Area Size":     "Medium (500–1000 sq ft)",
    "Urgency":       "Normal (within 3 days)",
    "Time Slot":     "Morning (8AM–12PM)",
  });
  const [added, setAdded] = useState(false);

  const price    = service.price ? Number(service.price) : 0;
  const imgUrl   = service.images?.[0]?.url;
  const alreadyInCart = isInCart(service.id);

  const handleAttrChange = (key: string, val: string) =>
    setAttributes((prev) => ({ ...prev, [key]: val }));

  const handleAddToCart = () => {
    addItem({
      serviceId:          service.id,
      serviceName:        service.name,
      serviceImage:       imgUrl,
      price,
      category:           service.categoryId,
      selectedColor,
      selectedAttributes: attributes,
      quantity,
    });

    setAdded(true);
    toast.success(`"${service.name}" added to your Cart!`, {
      description: `Qty: ${quantity} · ${COLOR_OPTIONS.find(c => c.value === selectedColor)?.label} · ${attributes["Service Level"]}`,
      action: { label: "View Cart", onClick: () => router.push("/cart") },
    });

    setTimeout(() => {
      setAdded(false);
      onOpenChange(false);
      onSuccess?.();
    }, 1200);
  };

  const handleViewCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 rounded-3xl overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Customise & Add to Cart</DialogTitle>
          <DialogDescription>Select your preferences</DialogDescription>
        </DialogHeader>

        {/* ── Hero top bar ─────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#236b9d] to-[#1a5175] p-6 text-white">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={service.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-white/30 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">Customise Booking</p>
              <h3 className="text-xl font-bold leading-tight truncate">{service.name}</h3>
              <p className="text-white/80 font-medium mt-1">
                {price > 0 ? `NPR ${price.toLocaleString()} / service` : "Free"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────── */}
        <div className="overflow-y-auto max-h-[65vh] p-6 space-y-6">

          {/* Quantity */}
          <div>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#236b9d]" /> Quantity
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-[#236b9d] transition text-slate-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-lg text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-[#236b9d] transition text-slate-600"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400 ml-2">
                Subtotal: <strong className="text-slate-700">NPR {(price * quantity).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          <Separator />

          {/* Color / Theme */}
          <div>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#236b9d]" /> Colour Preference
            </p>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  title={c.label}
                  className={cn(
                    "relative w-9 h-9 rounded-full border-2 transition-all duration-200 focus:outline-none",
                    selectedColor === c.value
                      ? "border-[#236b9d] ring-2 ring-[#236b9d]/30 scale-110"
                      : "border-slate-200 hover:scale-105"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {selectedColor === c.value && (
                    <Check
                      className="w-4 h-4 absolute inset-0 m-auto"
                      style={{ color: c.value === "white" || c.value === "yellow" ? "#1e293b" : "white" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Selected: <strong className="text-slate-600">{COLOR_OPTIONS.find(c => c.value === selectedColor)?.label}</strong>
            </p>
          </div>

          <Separator />

          {/* Attributes */}
          <div>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#236b9d]" /> Service Options
            </p>
            <div className="space-y-5">
              {Object.entries(ATTRIBUTE_PRESETS).map(([attrKey, options]) => (
                <div key={attrKey}>
                  <p className="text-xs font-semibold text-slate-500 mb-2">{attrKey}</p>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAttrChange(attrKey, opt)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200",
                          attributes[attrKey] === opt
                            ? "bg-[#236b9d] text-white border-[#236b9d] shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-[#236b9d] hover:text-[#236b9d]"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary badge row */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="text-xs">{attributes["Service Level"]}</Badge>
            <Badge variant="secondary" className="text-xs">{attributes["Urgency"]}</Badge>
            <Badge variant="secondary" className="text-xs">{attributes["Time Slot"]}</Badge>
          </div>
        </div>

        {/* ── Footer CTA ───────────────────────────────────── */}
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          {alreadyInCart ? (
            <Button
              className="flex-1 rounded-full bg-slate-800 hover:bg-slate-700 h-12 text-base font-semibold"
              onClick={handleViewCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> View Cart
            </Button>
          ) : (
            <Button
              className={cn(
                "flex-1 rounded-full h-12 text-base font-semibold transition-all duration-300",
                added
                  ? "bg-emerald-500 hover:bg-emerald-500"
                  : "bg-[#236b9d] hover:bg-[#1a5177]"
              )}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? (
                <><Check className="w-5 h-5 mr-2" /> Added!</>
              ) : (
                <><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart — NPR {(price * quantity).toLocaleString()}</>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-full h-12 px-6 border-slate-200"
            onClick={() => {
              onOpenChange(false);
              router.push(`/booking/${service.id}`);
            }}
          >
            Book Directly
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
