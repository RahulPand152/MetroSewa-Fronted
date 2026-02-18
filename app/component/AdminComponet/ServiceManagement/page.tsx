"use client";

import React, { useState, useMemo } from "react";
import {
    Plus, Pencil, Trash2, X, Check, Search, Filter,
    Wrench, Zap, Wind, Paintbrush, Droplets, Tv2,
    LayoutGrid, CheckCircle2, XCircle, Tag, Upload,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, getCategoryConfig, Category } from "@/app/constants/categories";
import { RichTextEditor } from "./RichTextEditor";

// ─── Types ────────────────────────────────────────────────────────────────────
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

    React.useEffect(() => {
        if (editService) {
            setForm({
                name: editService.name, category: editService.category,
                shortDescription: editService.shortDescription, longDescription: editService.longDescription,
                price: String(editService.price),
                duration: String(editService.duration), durationUnit: editService.durationUnit,
                active: editService.active,
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [editService, open]);

    const set = (key: string, val: string | boolean) => setForm((f) => ({ ...f, [key]: val }));

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
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary transition-all group">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Upload className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                </div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                            </div>
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

// ─── Manage Categories Dialog ─────────────────────────────────────────────────
function ManageCategoriesDialog({ open, onClose, categories, onAdd, onDelete }: {
    open: boolean; onClose: () => void;
    categories: Category[];
    onAdd: (name: string) => void;
    onDelete: (id: number) => void;
}) {
    const [newCat, setNewCat] = useState("");
    const handleAdd = () => {
        if (!newCat.trim()) return;
        onAdd(newCat.trim());
        setNewCat("");
    };
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                    <DialogDescription>Add or remove service categories.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {/* Add new */}
                    <div className="flex gap-2">
                        <Input placeholder="New category name..." value={newCat} onChange={(e) => setNewCat(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
                        <Button onClick={handleAdd} className="shrink-0"><Plus className="h-4 w-4 mr-1" />Add</Button>
                    </div>
                    {/* List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 ${cat.bg} ${cat.color} rounded-lg flex items-center justify-center`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                                    </div>
                                    <button onClick={() => onDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Done</Button>
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

    const filtered = useMemo(() => services.filter((s) => {
        const q = search.toLowerCase();
        return (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) &&
            (catFilter === "All" || s.category === catFilter);
    }), [services, search, catFilter]);

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

    const handleAddCategory = (name: string) => {
        const icons = [Wrench, Zap, Wind, Paintbrush, Droplets, Tv2];
        const colors = ["text-blue-600", "text-amber-600", "text-purple-600", "text-emerald-600", "text-orange-600", "text-cyan-600"];
        const bgs = ["bg-blue-50 dark:bg-blue-900/20", "bg-amber-50 dark:bg-amber-900/20", "bg-purple-50 dark:bg-purple-900/20", "bg-emerald-50 dark:bg-emerald-900/20", "bg-orange-50 dark:bg-orange-900/20", "bg-cyan-50 dark:bg-cyan-900/20"];
        const hovers = ["group-hover:bg-blue-600", "group-hover:bg-amber-600", "group-hover:bg-purple-600", "group-hover:bg-emerald-600", "group-hover:bg-orange-600", "group-hover:bg-cyan-600"];
        const idx = categories.length % icons.length;
        const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
        setCategories((prev) => [...prev, { id: newId, name, icon: icons[idx], color: colors[idx], bg: bgs[idx], hoverBg: hovers[idx] }]);
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
                        <Tag className="h-4 w-4" /> Manage Categories
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
                    <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56 h-9" />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                        className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 appearance-none cursor-pointer">
                        <option value="All">All Categories</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <span className="text-sm text-slate-400">{filtered.length} service{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((service) => (
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

            {/* Support Banner */}
            <div className="mt-4 p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-xl font-bold mb-2">Need help with categories?</h4>
                        <p className="text-slate-400 text-sm max-w-md">Our specialized support team can help you structure your services and pricing for maximum conversion.</p>
                    </div>
                    <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100 font-bold shrink-0">
                        Contact Support
                    </Button>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Dialogs */}
            <ServiceFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editService={editService} />
            <ManageCategoriesDialog open={catDialogOpen} onClose={() => setCatDialogOpen(false)} categories={categories} onAdd={handleAddCategory} onDelete={handleDeleteCategory} />
            <DeleteDialog service={deleteService} open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
        </div>
    );
}
