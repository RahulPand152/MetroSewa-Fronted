"use client";

import React, { useState, useMemo } from "react";
import {
    Plus, Pencil, Trash2, X, Check, Search, Filter,
    Wrench, Zap, Wind, Paintbrush, Droplets, Tv2,
    LayoutGrid, CheckCircle2, XCircle, Tag, Upload,
    AlertTriangle, Home, Hammer, ShieldCheck, Leaf, Car, Wifi,
    Scissors, Flame, Star, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, getCategoryConfig, Category } from "@/app/constants/categories";
import { RichTextEditor } from "./RichTextEditor";

// ─── Category Icon Options ─────────────────────────────────────────────────────
const ICON_OPTIONS: { icon: React.ElementType; label: string; color: string; bg: string; hoverBg: string }[] = [
    { icon: Wrench, label: "Wrench", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", hoverBg: "group-hover:bg-blue-600" },
    { icon: Zap, label: "Zap", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", hoverBg: "group-hover:bg-amber-600" },
    { icon: Wind, label: "Wind", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", hoverBg: "group-hover:bg-purple-600" },
    { icon: Paintbrush, label: "Paint", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", hoverBg: "group-hover:bg-emerald-600" },
    { icon: Droplets, label: "Drops", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", hoverBg: "group-hover:bg-orange-600" },
    { icon: Tv2, label: "TV", color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20", hoverBg: "group-hover:bg-cyan-600" },
    { icon: Home, label: "Home", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", hoverBg: "group-hover:bg-rose-600" },
    { icon: Hammer, label: "Hammer", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", hoverBg: "group-hover:bg-yellow-600" },
    { icon: ShieldCheck, label: "Shield", color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20", hoverBg: "group-hover:bg-teal-600" },
    { icon: Leaf, label: "Leaf", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", hoverBg: "group-hover:bg-green-600" },
    { icon: Scissors, label: "Scissors", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20", hoverBg: "group-hover:bg-pink-600" },
    { icon: Package, label: "Package", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", hoverBg: "group-hover:bg-indigo-600" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
interface Service {
    id: number;
    name: string;
    category: string;
    shortDescription: string;
    longDescription: string;
    price: number;
    duration: number;
    durationUnit: "Mins" | "Hours" | "Days";
    active: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialServices: Service[] = [
    { id: 1, name: "Leak Repair", category: "Plumbing", shortDescription: "Fix leaks fast", longDescription: "Professional fixing of water pipe leaks, faucets, and drainage systems with 30-day warranty.", price: 800, duration: 60, durationUnit: "Mins", active: true },
    { id: 2, name: "Pipe Installation", category: "Plumbing", shortDescription: "New pipe fitting", longDescription: "New pipe fitting and installation service for residential and commercial properties.", price: 1200, duration: 2, durationUnit: "Hours", active: true },
    { id: 3, name: "Wiring & Rewiring", category: "Electrical", shortDescription: "Safe home wiring", longDescription: "Safe home wiring and rewiring solutions by certified electricians.", price: 1500, duration: 3, durationUnit: "Hours", active: true },
    { id: 4, name: "Fan Installation", category: "Electrical", shortDescription: "Ceiling/wall fans", longDescription: "Ceiling and wall fan installation with proper earthing and safety checks.", price: 500, duration: 45, durationUnit: "Mins", active: true },
    { id: 5, name: "Deep Cleaning", category: "Cleaning", shortDescription: "Eco-friendly clean", longDescription: "Eco-friendly deep cleaning and medical-grade sanitization for all rooms.", price: 2000, duration: 4, durationUnit: "Hours", active: true },
    { id: 6, name: "Sofa Cleaning", category: "Cleaning", shortDescription: "Upholstery care", longDescription: "Professional sofa and upholstery cleaning using steam and dry methods.", price: 900, duration: 2, durationUnit: "Hours", active: false },
    { id: 7, name: "AC Service", category: "HVAC", shortDescription: "Filter & gas check", longDescription: "Deep cleaning of filters, gas top-up, and performance check for all AC brands.", price: 1800, duration: 90, durationUnit: "Mins", active: true },
    { id: 8, name: "Fridge Repair", category: "Appliance", shortDescription: "Cooling issues", longDescription: "Fridge repair and cooling issues resolved by certified technicians.", price: 1100, duration: 2, durationUnit: "Hours", active: true },
    { id: 9, name: "Interior Painting", category: "Renovation", shortDescription: "Custom colors", longDescription: "Custom color matching and premium finish painting for homes and offices.", price: 3500, duration: 1, durationUnit: "Days", active: false },
    { id: 10, name: "Tile Fixing", category: "Renovation", shortDescription: "Floor & wall tiles", longDescription: "Floor and wall tile fixing and replacement with quality materials.", price: 2500, duration: 1, durationUnit: "Days", active: true },
    { id: 11, name: "Pest Control", category: "Cleaning", shortDescription: "Effective treatment", longDescription: "Full home pest control treatment using safe and effective chemicals.", price: 1600, duration: 3, durationUnit: "Hours", active: true },
    { id: 12, name: "CCTV Installation", category: "Electrical", shortDescription: "Secure your space", longDescription: "Security camera setup and configuration for home and office security.", price: 4000, duration: 4, durationUnit: "Hours", active: true },
];

const EMPTY_FORM = {
    name: "", category: "", shortDescription: "", longDescription: "", price: "",
    duration: "", durationUnit: "Mins" as "Mins" | "Hours" | "Days", active: true,
    imageUrl: "",
};

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value, badge, badgeColor }: {
    icon: React.ElementType; iconBg: string; iconColor: string;
    label: string; value: number; badge: string; badgeColor: string;
}) {
    const Icon = icon;
    return (
        <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</h3>
            </CardContent>
        </Card>
    );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service, onEdit, onDelete, onToggle }: {
    service: Service;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    const cat = getCategoryConfig(service.category);
    const Icon = cat.icon;
    return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${!service.active ? "opacity-60" : ""}`}>
            <div className="p-6">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center ${cat.hoverBg} group-hover:text-white transition-colors`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <Switch checked={service.active} onCheckedChange={onToggle} />
                </div>

                {/* Name + category */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{service.name}</h3>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${service.active ? "text-primary" : "text-slate-400"}`}>
                    {service.category}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4" title={service.longDescription}>{service.shortDescription}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Starts from</p>
                        <p className={`text-lg font-bold ${service.active ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                            Rs. {service.price.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Add/Edit Service Dialog ──────────────────────────────────────────────────
function ServiceFormDialog({ open, onClose, onSave, editService }: {
    open: boolean; onClose: () => void;
    onSave: (data: Omit<Service, "id">) => void;
    editService: Service | null;
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    React.useEffect(() => {
        if (editService) {
            setForm({
                name: editService.name, category: editService.category,
                shortDescription: editService.shortDescription, longDescription: editService.longDescription,
                price: String(editService.price),
                duration: String(editService.duration), durationUnit: editService.durationUnit,
                active: editService.active,
                imageUrl: "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [editService, open]);

    const set = (key: string, val: string | boolean) => setForm((f) => ({ ...f, [key]: val }));

    const handleImageFile = (file: File | null | undefined) => {
        if (!file) return;
        if (form.imageUrl.startsWith("blob:")) URL.revokeObjectURL(form.imageUrl);
        set("imageUrl", URL.createObjectURL(file));
    };

    const removeImage = () => {
        if (form.imageUrl.startsWith("blob:")) URL.revokeObjectURL(form.imageUrl);
        set("imageUrl", "");
    };

    const handleSave = () => {
        if (!form.name || !form.category || !form.price) return;
        onSave({
            name: form.name, category: form.category,
            shortDescription: form.shortDescription, longDescription: form.longDescription,
            price: Number(form.price), duration: Number(form.duration) || 0,
            durationUnit: form.durationUnit, active: form.active,
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold">{editService ? "Edit Service" : "Add New Service"}</DialogTitle>
                    <DialogDescription>Create a new service offering for customers.</DialogDescription>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Row 1: Name + Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Service Title <span className="text-red-500">*</span></label>
                            <Input placeholder="e.g. Deep Cleaning Service" value={form.name} onChange={(e) => set("name", e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category <span className="text-red-500">*</span></label>
                            <select value={form.category} onChange={(e) => set("category", e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Select a category</option>
                                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Price + Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Base Price (Rs.) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rs.</span>
                                <Input type="number" placeholder="0" className="pl-10" value={form.price} onChange={(e) => set("price", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Service Duration</label>
                            <div className="flex">
                                <Input type="number" placeholder="e.g. 45" className="rounded-r-none border-r-0" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
                                <select value={form.durationUnit} onChange={(e) => set("durationUnit", e.target.value)}
                                    className="rounded-l-none border border-input bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary rounded-r-md">
                                    <option>Mins</option>
                                    <option>Hours</option>
                                    <option>Days</option>
                                </select>
                            </div>
                        </div>
                    </div>




                    {/* Long Description with toolbar */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide"> Description</label>
                        <RichTextEditor
                            placeholder="Describe the service details, benefits, and what customers can expect..."
                            value={form.longDescription}
                            onChange={(val) => set("longDescription", val)}
                        />
                    </div>

                    {/* Row 3: Image + Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image upload */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Service Image</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/svg+xml,image/png,image/jpeg,image/gif"
                                className="hidden"
                                onChange={(e) => handleImageFile(e.target.files?.[0])}
                            />
                            {form.imageUrl ? (
                                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                    <img src={form.imageUrl} alt="Service preview" className="w-full h-36 object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-2 right-2 bg-black/60 hover:bg-primary text-white text-xs px-2 py-1 rounded transition-colors flex items-center gap-1"
                                    >
                                        <Upload className="h-3 w-3" /> Change
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files?.[0]); }}
                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${dragOver
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary"
                                        }`}
                                >
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                        <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                                </div>
                            )}
                        </div>

                        {/* Active toggle */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Visibility Status</label>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 h-[calc(100%-1.5rem)]">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Active Service</p>
                                    <p className="text-xs text-slate-500">Service will be visible to customers</p>
                                </div>
                                <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end flex-shrink-0">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {editService ? "Save Changes" : "Create Service"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Manage Categories Dialog (Full CRUD) ─────────────────────────────────────
type CatFormData = { name: string; iconIdx: number; imageUrl: string };
const EMPTY_CAT_FORM: CatFormData = { name: "", iconIdx: 0, imageUrl: "" };

function ManageCategoriesDialog({ open, onClose, categories, onAdd, onUpdate, onDelete }: {
    open: boolean; onClose: () => void;
    categories: Category[];
    onAdd: (name: string, iconIdx: number, imageUrl: string) => void;
    onUpdate: (id: number, name: string, iconIdx: number, imageUrl: string) => void;
    onDelete: (id: number) => void;
}) {
    const [form, setForm] = useState<CatFormData>(EMPTY_CAT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const imgRef = React.useRef<HTMLInputElement>(null);

    // reset when dialog opens
    React.useEffect(() => { if (!open) { setForm(EMPTY_CAT_FORM); setEditingId(null); setDeleteConfirmId(null); } }, [open]);

    const handleImageFile = (file: File | undefined) => {
        if (!file) return;
        if (form.imageUrl.startsWith("blob:")) URL.revokeObjectURL(form.imageUrl);
        setForm(f => ({ ...f, imageUrl: URL.createObjectURL(file) }));
    };

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        if (editingId !== null) {
            onUpdate(editingId, form.name.trim(), form.iconIdx, form.imageUrl);
            setEditingId(null);
        } else {
            onAdd(form.name.trim(), form.iconIdx, form.imageUrl);
        }
        setForm(EMPTY_CAT_FORM);
    };

    const startEdit = (cat: Category & { imageUrl?: string }) => {
        const idx = ICON_OPTIONS.findIndex(o => o.icon === cat.icon);
        setForm({ name: cat.name, iconIdx: idx >= 0 ? idx : 0, imageUrl: (cat as any).imageUrl ?? "" });
        setEditingId(cat.id);
        setDeleteConfirmId(null);
    };

    const cancelEdit = () => { setForm(EMPTY_CAT_FORM); setEditingId(null); };

    const selectedIcon = ICON_OPTIONS[form.iconIdx];
    const SelectedIconComp = selectedIcon.icon;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>{editingId !== null ? "Edit Category" : "Manage Categories"}</DialogTitle>
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
                        </span>
                    </div>
                    <DialogDescription>Add or remove service categories with icon and optional image.</DialogDescription>
                </DialogHeader>

                {/* ── Form ── */}
                <div className="px-6 py-4 border-b bg-slate-50 dark:bg-slate-900 flex-shrink-0 space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category Name <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="e.g. Plumbing, Electrical..."
                            value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    </div>

                    {/* Icon Picker */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Choose Icon</label>
                        <div className="grid grid-cols-6 gap-2">
                            {ICON_OPTIONS.map((opt, idx) => {
                                const Ic = opt.icon;
                                const active = form.iconIdx === idx;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        title={opt.label}
                                        onClick={() => setForm(f => ({ ...f, iconIdx: idx }))}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center border-2 transition-all ${active
                                                ? `${opt.bg} ${opt.color} border-current scale-105 shadow-sm`
                                                : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary/40 hover:text-primary"
                                            }`}
                                    >
                                        <Ic className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Image <span className="text-slate-400 font-normal normal-case">(optional — overrides icon)</span></label>
                        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files?.[0])} />
                        {form.imageUrl ? (
                            <div className="flex items-center gap-3">
                                <img src={form.imageUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover border" />
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => imgRef.current?.click()}><Upload className="h-3.5 w-3.5 mr-1" />Change</Button>
                                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}><X className="h-3.5 w-3.5" /></Button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => imgRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg py-3 flex items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary text-xs font-medium transition-all"
                            >
                                <Upload className="h-4 w-4" /> Click to upload image
                            </button>
                        )}
                    </div>

                    {/* Preview + Submit */}
                    <div className="flex items-center gap-3">
                        {/* mini preview */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${selectedIcon.bg}`}>
                            {form.imageUrl
                                ? <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                                : <SelectedIconComp className={`h-5 w-5 ${selectedIcon.color}`} />}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">{form.name || <span className="text-slate-400 italic">Category name…</span>}</span>
                        {editingId !== null && (
                            <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                        )}
                        <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()} className="shrink-0">
                            {editingId !== null ? <><Check className="h-4 w-4 mr-1" />Save</> : <><Plus className="h-4 w-4 mr-1" />Add</>}
                        </Button>
                    </div>
                </div>

                {/* ── List ── */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                            <Tag className="h-10 w-10 opacity-20" />
                            <p className="text-sm">No categories yet. Add one above.</p>
                        </div>
                    ) : (
                        categories.map((cat) => {
                            const Icon = cat.icon;
                            const imgUrl = (cat as any).imageUrl;
                            const isDelConfirm = deleteConfirmId === cat.id;
                            return (
                                <div key={cat.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${editingId === cat.id
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    }`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ${cat.bg}`}>
                                            {imgUrl
                                                ? <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                                : <Icon className={`h-4 w-4 ${cat.color}`} />}
                                        </div>
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
                                    </div>

                                    {isDelConfirm ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-red-500 font-medium">Delete?</span>
                                            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => { onDelete(cat.id); setDeleteConfirmId(null); }}>Yes</Button>
                                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setDeleteConfirmId(null)}>No</Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => startEdit(cat as any)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Edit">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => setDeleteConfirmId(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteDialog({ service, open, onClose, onConfirm }: {
    service: Service | null; open: boolean; onClose: () => void; onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <DialogTitle>Delete Service</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{service?.name}</span>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServiceManagement() {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [categories, setCategories] = useState<Category[]>(CATEGORIES);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("All");

    const [formOpen, setFormOpen] = useState(false);
    const [editService, setEditService] = useState<Service | null>(null);
    const [deleteService, setDeleteService] = useState<Service | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [catDialogOpen, setCatDialogOpen] = useState(false);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => services.filter((s) => {
        const q = search.toLowerCase();
        return (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) &&
            (catFilter === "All" || s.category === catFilter);
    }), [services, search, catFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalActive = services.filter((s) => s.active).length;
    const totalInactive = services.filter((s) => !s.active).length;

    const handleToggle = (id: number) =>
        setServices((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));

    const handleSave = (data: Omit<Service, "id">) => {
        if (editService) {
            setServices((prev) => prev.map((s) => s.id === editService.id ? { ...s, ...data } : s));
        } else {
            const newId = Math.max(0, ...services.map((s) => s.id)) + 1;
            setServices((prev) => [...prev, { id: newId, ...data }]);
        }
    };

    const handleDelete = () => {
        if (!deleteService) return;
        setServices((prev) => prev.filter((s) => s.id !== deleteService.id));
        setDeleteOpen(false); setDeleteService(null);
    };

    const handleAddCategory = (name: string, iconIdx: number, imageUrl: string) => {
        const opt = ICON_OPTIONS[iconIdx] ?? ICON_OPTIONS[0];
        const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
        setCategories((prev) => [...prev, {
            id: newId, name,
            icon: opt.icon, color: opt.color, bg: opt.bg, hoverBg: opt.hoverBg,
            ...(imageUrl ? { imageUrl } : {}),
        } as any]);
    };

    const handleUpdateCategory = (id: number, name: string, iconIdx: number, imageUrl: string) => {
        const opt = ICON_OPTIONS[iconIdx] ?? ICON_OPTIONS[0];
        setCategories((prev) => prev.map((c) => c.id === id ? {
            ...c, name,
            icon: opt.icon, color: opt.color, bg: opt.bg, hoverBg: opt.hoverBg,
            ...(imageUrl ? { imageUrl } : { imageUrl: "" }),
        } as any : c));
    };

    const handleDeleteCategory = (id: number) =>
        setCategories((prev) => prev.filter((c) => c.id !== id));

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Manage Services</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure categories, prices and availability for your platform.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCatDialogOpen(true)} className="flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Create Categories
                    </Button>
                    <Button onClick={() => { setEditService(null); setFormOpen(true); }} className="flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> Add New Service
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={LayoutGrid} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600" label="Total Services" value={services.length} badge="+12%" badgeColor="text-green-600 bg-green-100 dark:bg-green-900/30" />
                <StatCard icon={Tag} iconBg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600" label="Active Categories" value={categories.length} badge="Static" badgeColor="text-slate-400" />
                <StatCard icon={CheckCircle2} iconBg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600" label="Active Services" value={totalActive} badge={`${Math.round((totalActive / services.length) * 100)}%`} badgeColor="text-green-600 bg-green-100 dark:bg-green-900/30" />
                <StatCard icon={XCircle} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600" label="Inactive Services" value={totalInactive} badge={`-${totalInactive}`} badgeColor="text-red-500 bg-red-100 dark:bg-red-900/30" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search services..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-56 h-9" />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
                        className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 appearance-none cursor-pointer">
                        <option value="All">All Categories</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <span className="text-sm text-slate-400">{filtered.length} service{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onEdit={() => { setEditService(service); setFormOpen(true); }}
                        onDelete={() => { setDeleteService(service); setDeleteOpen(true); }}
                        onToggle={() => handleToggle(service.id)}
                    />
                ))}

                {/* Add new card (dashed) */}
                <button
                    onClick={() => { setEditService(null); setFormOpen(true); }}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary hover:text-primary transition-all group min-h-[200px]"
                >
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">Add New Service</span>
                </button>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1 py-2">
                <span className="text-sm text-slate-500">
                    Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} service{filtered.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
            {/* Dialogs */}
            <ServiceFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editService={editService} />
            <ManageCategoriesDialog open={catDialogOpen} onClose={() => setCatDialogOpen(false)} categories={categories} onAdd={handleAddCategory} onUpdate={handleUpdateCategory} onDelete={handleDeleteCategory} />
            <DeleteDialog service={deleteService} open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
        </div>
    );
}
