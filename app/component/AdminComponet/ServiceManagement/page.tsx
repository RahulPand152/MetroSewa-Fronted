"use client";

import React, { useState, useMemo, useRef } from "react";
import {
    Plus, Pencil, Trash2, X, Check, Search, Filter,
    Wrench, Zap, Wind, Paintbrush, Droplets, Tv2,
    LayoutGrid, CheckCircle2, XCircle, Tag, Upload,
    AlertTriangle, Home, Hammer, ShieldCheck, Leaf,
    Scissors, Package, Image as ImageIcon, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "./RichTextEditor";
import {
    useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
    useGetAdminServices, useCreateService, useUpdateService, useDeleteService, useToggleService,
    type AdminService, type ServiceImage,
} from "@/src/hooks/useAdmin";

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_OPTIONS: { icon: React.ElementType; label: string; color: string; bg: string }[] = [
    { icon: Wrench, label: "Wrench", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { icon: Zap, label: "Zap", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { icon: Wind, label: "Wind", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { icon: Paintbrush, label: "Paint", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { icon: Droplets, label: "Drops", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { icon: Tv2, label: "TV", color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
    { icon: Home, label: "Home", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { icon: Hammer, label: "Hammer", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { icon: ShieldCheck, label: "Shield", color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
    { icon: Leaf, label: "Leaf", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    { icon: Scissors, label: "Scissors", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20" },
    { icon: Package, label: "Package", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
];

const PAGE_SIZE = 9;

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex gap-1">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value, badge, badgeColor }: {
    icon: React.ElementType; iconBg: string; iconColor: string;
    label: string; value: number | string; badge: string; badgeColor: string;
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
function ServiceCard({ service, onEdit, onDelete, onToggle, isPending }: {
    service: AdminService;
    onEdit: () => void; onDelete: () => void; onToggle: () => void; isPending: boolean;
}) {
    const mainImage = service.images?.[0];
    const catIconValue = service.category?.icon;
    // icon field may be a Cloudinary URL (uploaded image) or an icon label name
    const isUrl = catIconValue?.startsWith('http');
    const iconOpt = (!isUrl && ICON_OPTIONS.find(o => o.label === catIconValue)) || ICON_OPTIONS[0];
    const Icon = iconOpt.icon;
    const catImage = isUrl ? catIconValue : null;

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${!service.isActive ? "opacity-60" : ""}`}>
            {/* Image strip */}
            {mainImage ? (
                <div className="relative h-36 overflow-hidden">
                    <img src={mainImage.url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {service.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-full font-medium">
                            +{service.images.length - 1}
                        </span>
                    )}
                </div>
            ) : null}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${iconOpt.bg} ${iconOpt.color} rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0`}>
                        {catImage
                            ? <img src={catImage} alt="" className="w-full h-full object-cover" />
                            : <Icon className="h-5 w-5" />}
                    </div>
                    <Switch checked={service.isActive} onCheckedChange={onToggle} disabled={isPending} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-0.5">{service.name}</h3>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${service.isActive ? "text-primary" : "text-slate-400"}`}>
                    {service.category?.name ?? "Uncategorized"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3"
                    title={service.description ? service.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : undefined}
                >
                    {service.description 
                        ? service.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || "—" 
                        : "—"}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                        <p className="text-[10px] text-slate-400 font-medium">Starts from</p>
                        <p className={`text-base font-bold ${service.isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                            {service.price != null ? `Rs. ${service.price.toLocaleString()}` : "—"}
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

// ─── Service Form Dialog ──────────────────────────────────────────────────────
type CatOption = { id: string; name: string; imageUrl: string | null; icon: string | null };
function ServiceFormDialog({ open, onClose, editService, categories, onCreate, onUpdate, isPending }: {
    open: boolean; onClose: () => void;
    editService: AdminService | null;
    categories: CatOption[];
    onCreate: (fd: FormData) => void;
    onUpdate: (id: string, fd: FormData) => void;
    isPending: boolean;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [durationUnit, setDurationUnit] = useState<"Mins" | "Hours" | "Days">("Mins");
    const [categoryId, setCategoryId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<ServiceImage[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (open) {
            if (editService) {
                setName(editService.name);
                setDescription(editService.description ?? "");
                setPrice(editService.price != null ? String(editService.price) : "");
                setDuration(editService.duration != null ? String(editService.duration) : "");
                setDurationUnit((editService.durationUnit as any) ?? "Mins");
                setCategoryId(editService.categoryId ?? "");
                setIsActive(editService.isActive);
                setExistingImages(editService.images);
            } else {
                setName(""); setDescription(""); setPrice(""); setDuration("");
                setDurationUnit("Mins"); setCategoryId(""); setIsActive(true);
                setExistingImages([]);
            }
            setNewFiles([]); setNewPreviews([]); setRemovedImageIds([]);
        }
    }, [open, editService]);

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files).slice(0, 5 - newFiles.length - existingImages.length);
        setNewFiles(f => [...f, ...arr]);
        arr.forEach(f => setNewPreviews(p => [...p, URL.createObjectURL(f)]));
    };

    const removeNewFile = (idx: number) => {
        setNewFiles(f => f.filter((_, i) => i !== idx));
        setNewPreviews(p => p.filter((_, i) => i !== idx));
    };

    const removeExisting = (img: ServiceImage) => {
        setExistingImages(imgs => imgs.filter(i => i.id !== img.id));
        setRemovedImageIds(ids => [...ids, img.id]);
    };

    const handleSave = () => {
        if (!name.trim()) return;
        const fd = new FormData();
        fd.append("name", name);
        fd.append("description", description);
        if (price) fd.append("price", price);
        if (duration) fd.append("duration", duration);
        fd.append("durationUnit", durationUnit);
        if (categoryId) fd.append("categoryId", categoryId);
        fd.append("isActive", String(isActive));
        newFiles.forEach(f => fd.append("images", f));
        removedImageIds.forEach(id => fd.append("removeImageIds", id));
        if (editService) onUpdate(editService.id, fd);
        else onCreate(fd);
    };

    const totalImages = existingImages.length + newFiles.length;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b flex-shrink-0">
                    <DialogTitle className="text-xl font-bold">{editService ? "Edit Service" : "Add New Service"}</DialogTitle>
                    <DialogDescription>Fill in the details to create a service offering.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                    {/* Name + Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                Service Title <span className="text-red-500">*</span>
                            </label>
                            <Input placeholder="e.g. Deep Cleaning" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                            {categories.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No categories found. Create one first.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                                    {/* No selection option */}
                                    <button
                                        type="button"
                                        onClick={() => setCategoryId("")}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-medium transition-all ${categoryId === ""
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary/40"
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <X className="h-4 w-4" />
                                        </div>
                                        <span className="truncate w-full text-center">None</span>
                                    </button>
                                    {categories.map(c => {
                                        const isUrl = c.icon?.startsWith('http');
                                        const iconOpt = (!isUrl && ICON_OPTIONS.find(o => o.label === c.icon)) || ICON_OPTIONS[0];
                                        const Icon = iconOpt.icon;
                                        const isSelected = categoryId === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setCategoryId(c.id)}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-medium transition-all ${isSelected
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/40"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden ${isUrl ? 'bg-slate-100 dark:bg-slate-800' : iconOpt.bg}`}>
                                                    {isUrl
                                                        ? <img src={c.icon!} alt={c.name} className="w-full h-full object-cover" />
                                                        : <Icon className={`h-4 w-4 ${iconOpt.color}`} />
                                                    }
                                                </div>
                                                <span className="truncate w-full text-center">{c.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price + Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Base Price (Rs.)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rs.</span>
                                <Input type="number" placeholder="0" className="pl-10" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Duration</label>
                            <div className="flex">
                                <Input type="number" placeholder="e.g. 45" className="rounded-r-none border-r-0"
                                    value={duration} onChange={e => setDuration(e.target.value)} />
                                <select value={durationUnit} onChange={e => setDurationUnit(e.target.value as any)}
                                    className="rounded-l-none border border-input bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none rounded-r-md">
                                    <option>Mins</option><option>Hours</option><option>Days</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Leave a description..."
                            showCharCount={true}
                            characterLimit={2000}
                            minHeight={200}
                        />
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Service Images <span className="text-slate-400 font-normal normal-case">({totalImages}/5)</span>
                        </label>
                        {/* Existing images */}
                        {existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {existingImages.map(img => (
                                    <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <button onClick={() => removeExisting(img)}
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* New previews */}
                        {newPreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {newPreviews.map((p, i) => (
                                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/40 group">
                                        <img src={p} alt="" className="w-full h-full object-cover" />
                                        <button onClick={() => removeNewFile(i)}
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Upload zone */}
                        {totalImages < 5 && (
                            <>
                                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                                    onChange={e => addFiles(e.target.files)} />
                                <button onClick={() => fileRef.current?.click()}
                                    className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg py-4 flex flex-col items-center gap-1 text-slate-400 hover:border-primary hover:text-primary text-xs font-medium transition-all">
                                    <Upload className="h-5 w-5" />
                                    Click to upload images (up to {5 - totalImages} more)
                                </button>
                            </>
                        )}
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Active Service</p>
                            <p className="text-xs text-slate-500">Visible to customers on the platform</p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t flex gap-3 justify-end flex-shrink-0">
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name.trim() || isPending} className="flex items-center gap-2">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {editService ? "Save Changes" : "Create Service"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Manage Categories Dialog ─────────────────────────────────────────────────
type CatRow = { id: string; name: string; icon: string | null; isActive: boolean; _count: { services: number } };
function ManageCategoriesDialog({ open, onClose, categories, onCreate, onUpdate, onDelete, isPending }: {
    open: boolean; onClose: () => void;
    categories: CatRow[];
    onCreate: (fd: FormData) => void;
    onUpdate: (id: string, fd: FormData) => void;
    onDelete: (id: string) => void;
    isPending: boolean;
}) {
    const [name, setName] = useState("");
    const [iconIdx, setIconIdx] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const imgRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => { if (!open) { reset(); } }, [open]);

    const reset = () => { setName(""); setIconIdx(0); setFile(null); setPreview(""); setEditingId(null); setDeleteConfirmId(null); };

    const handleFile = (f?: File) => {
        if (!f) return;
        if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        setFile(f); setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        const fd = new FormData();
        fd.append("name", name.trim());
        // Always send the selected icon label as a separate field (no collision with file)
        fd.append("iconLabel", ICON_OPTIONS[iconIdx].label);
        if (file) {
            // New image uploaded — send as "icon" for multer
            fd.append("icon", file);
        } else if (editingId && !preview) {
            // No preview means user cleared the image — request removal
            const originalCat = categories.find(c => c.id === editingId);
            const hadImage = originalCat?.icon?.startsWith("http");
            if (hadImage) {
                fd.append("removeImage", "true");
            }
        }
        if (editingId) { onUpdate(editingId, fd); }
        else { onCreate(fd); }
        reset();
    };

    const startEdit = (cat: CatRow) => {
        setName(cat.name);
        const isUrl = cat.icon?.startsWith('http');
        if (isUrl) {
            // Has uploaded image — show as preview, keep current iconIdx
            setPreview(cat.icon ?? "");
            setIconIdx(0);
        } else {
            // Has icon label (or nothing)
            const idx = ICON_OPTIONS.findIndex(o => o.label === cat.icon);
            setIconIdx(idx >= 0 ? idx : 0);
            setPreview("");
        }
        setFile(null);
        setEditingId(cat.id);
        setDeleteConfirmId(null);
    };

    const SelectedIcon = ICON_OPTIONS[iconIdx].icon;
    const selectedOpt = ICON_OPTIONS[iconIdx];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>{editingId ? "Edit Category" : "Manage Categories"}</DialogTitle>
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {categories.length} {categories.length === 1 ? "category" : "categories"}
                        </span>
                    </div>
                    <DialogDescription>Create or update service categories with an icon and optional image.</DialogDescription>
                </DialogHeader>

                <div className="px-6 py-5 border-b bg-slate-50 dark:bg-slate-900 flex-shrink-0 space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <Input placeholder="e.g. Plumbing" value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    </div>

                    {/* Icon Grid */}
                    <div className={`space-y-1.5 transition-opacity ${preview ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Choose Icon</label>
                        <div className="grid grid-cols-6 gap-2">
                            {ICON_OPTIONS.map((opt, i) => {
                                const Ic = opt.icon;
                                return (
                                    <button key={i} type="button" title={opt.label}
                                        onClick={() => setIconIdx(i)}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center border-2 transition-all ${iconIdx === i
                                            ? `${opt.bg} ${opt.color} border-current scale-105 shadow-sm`
                                            : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary/40 hover:text-primary"
                                            }`}>
                                        <Ic className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Image <span className="text-slate-400 font-normal normal-case">(optional — overrides icon)</span>
                        </label>
                        <input ref={imgRef} type="file" accept="image/*" className="hidden"
                            onChange={e => handleFile(e.target.files?.[0])} />
                        {preview ? (
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover border" />
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => imgRef.current?.click()}>
                                        <Upload className="h-3.5 w-3.5 mr-1" />Change
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-500"
                                        onClick={() => { setFile(null); setPreview(""); }}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => imgRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg py-3 flex items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary text-xs font-medium transition-all bg-white dark:bg-slate-800">
                                <Upload className="h-4 w-4" /> Click to upload image
                            </button>
                        )}
                    </div>

                    {/* Preview + Submit */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${preview ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : selectedOpt.bg}`}>
                            {preview
                                ? <img src={preview} alt="" className="w-full h-full object-cover" />
                                : <SelectedIcon className={`h-5 w-5 ${selectedOpt.color}`} />}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">
                            {name || <span className="text-slate-400 italic">Category name…</span>}
                        </span>
                        {editingId && (
                            <Button size="sm" variant="ghost" onClick={reset}><X className="h-4 w-4" /></Button>
                        )}
                        <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isPending} className="shrink-0">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <><Check className="h-4 w-4 mr-1" />Save</> : <><Plus className="h-4 w-4 mr-1" />Add</>}
                        </Button>
                    </div>
                </div>

                {/* Category list */}
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[300px]">
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 m-2 sm:m-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 gap-3 text-center">
                            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-1">
                                <Tag className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No categories yet</p>
                            <p className="text-sm">Add a new category above to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                            {categories.map(cat => {
                                const isIconUrl = cat.icon?.startsWith('http');
                                const IconOpt = (!isIconUrl && ICON_OPTIONS.find(o => o.label === cat.icon)) || ICON_OPTIONS[0];
                                const CatIcon = IconOpt.icon;
                                const isDelConfirm = deleteConfirmId === cat.id;
                                return (
                                    <div key={cat.id} className={`group flex flex-col justify-between p-3 sm:p-4 rounded-xl border transition-all hover:shadow-md ${editingId === cat.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/30"
                                        }`}>
                                        <div className="flex items-center gap-3 min-w-0 mb-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${isIconUrl ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : IconOpt.bg}`}>
                                                {isIconUrl
                                                    ? <img src={cat.icon!} alt="" className="w-full h-full object-cover" />
                                                    : <CatIcon className={`h-5 w-5 ${IconOpt.color}`} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate block">{cat.name}</span>
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{cat._count.services} services</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-700/50 pt-2 mt-auto">
                                            {isDelConfirm ? (
                                                <div className="flex items-center gap-2 justify-end w-full">
                                                    <span className="text-xs text-red-500 font-medium mr-auto">Delete confirm?</span>
                                                    <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs shadow-sm"
                                                        onClick={() => { onDelete(cat.id); setDeleteConfirmId(null); }}>Yes</Button>
                                                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs shadow-sm"
                                                        onClick={() => setDeleteConfirmId(null)}>No</Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(cat)}
                                                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors bg-slate-50 dark:bg-slate-900/50 sm:bg-transparent">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirmId(cat.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors bg-slate-50 dark:bg-slate-900/50 sm:bg-transparent">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({ name, open, onClose, onConfirm, isPending }: {
    name: string; open: boolean; onClose: () => void; onConfirm: () => void; isPending: boolean;
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
                        Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{name}</span>? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServiceManagement() {
    // API hooks
    const { data: categories = [], isLoading: catsLoading } = useGetCategories();
    const [catFilter, setCatFilter] = useState<string>("all");
    const { data: services = [], isLoading: svcLoading } = useGetAdminServices(catFilter !== "all" ? catFilter : undefined);

    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();
    const createService = useCreateService();
    const updateService = useUpdateService();
    const deleteService = useDeleteService();
    const toggleService = useToggleService();

    // Dialog state
    const [formOpen, setFormOpen] = useState(false);
    const [editService, setEditService] = useState<AdminService | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminService | null>(null);
    const [catDialogOpen, setCatDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return services.filter((s: AdminService) =>
            s.name.toLowerCase().includes(q) ||
            (s.category?.name ?? "").toLowerCase().includes(q) ||
            (s.description ?? "").toLowerCase().includes(q)
        );
    }, [services, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalActive = services.filter((s: AdminService) => s.isActive).length;

    const isCatPending = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;
    const isSvcPending = createService.isPending || updateService.isPending;
    const isDeletePending = deleteService.isPending;

    const catOptions = categories.map((c: any) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl, icon: c.icon }));

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Manage Services</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure categories, prices and availability.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCatDialogOpen(true)} className="flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Categories
                    </Button>
                    <Button onClick={() => { setEditService(null); setFormOpen(true); }} className="flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> Add Service
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={LayoutGrid} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600"
                    label="Total Services" value={services.length} badge="" badgeColor="text-slate-400 bg-slate-100" />
                <StatCard icon={Tag} iconBg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600"
                    label="Categories" value={categories.length} badge="" badgeColor="text-slate-400 bg-slate-100" />
                <StatCard icon={CheckCircle2} iconBg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600"
                    label="Active" value={totalActive}
                    badge={services.length > 0 ? `${Math.round((totalActive / services.length) * 100)}%` : "0%"}
                    badgeColor="text-green-600 bg-green-100 dark:bg-green-900/30" />
                <StatCard icon={XCircle} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600"
                    label="Inactive" value={services.length - totalActive}
                    badge={`${services.length - totalActive}`}
                    badgeColor="text-red-500 bg-red-100 dark:bg-red-900/30" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search services..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 w-48 sm:w-56 h-9" />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
                        className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 appearance-none cursor-pointer">
                        <option value="all">All Categories</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <span className="text-sm text-slate-400">{filtered.length} service{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {svcLoading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : paginated.map((s: AdminService) => (
                        <ServiceCard
                            key={s.id} service={s}
                            onEdit={() => { setEditService(s); setFormOpen(true); }}
                            onDelete={() => setDeleteTarget(s)}
                            onToggle={() => toggleService.mutate(s.id)}
                            isPending={toggleService.isPending && toggleService.variables === s.id}
                        />
                    ))}

                {/* Add new dashed card */}
                {!svcLoading && (
                    <button onClick={() => { setEditService(null); setFormOpen(true); }}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary hover:text-primary transition-all group min-h-[200px]">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">Add New Service</span>
                    </button>
                )}

                {/* Empty state */}
                {!svcLoading && services.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <ImageIcon className="h-14 w-14 opacity-20" />
                        <p className="text-base font-medium">No services yet</p>
                        <p className="text-sm">Click "Add Service" to create your first service</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1 py-2">
                    <span className="text-sm text-slate-500">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                        <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <ServiceFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                editService={editService}
                categories={catOptions}
                onCreate={fd => { createService.mutate(fd); setFormOpen(false); }}
                onUpdate={(id, fd) => { updateService.mutate({ id, formData: fd }); setFormOpen(false); }}
                isPending={isSvcPending}
            />
            <ManageCategoriesDialog
                open={catDialogOpen}
                onClose={() => setCatDialogOpen(false)}
                categories={categories}
                onCreate={fd => createCategory.mutate(fd)}
                onUpdate={(id, fd) => updateCategory.mutate({ id, formData: fd })}
                onDelete={id => deleteCategory.mutate(id)}
                isPending={isCatPending}
            />
            <DeleteDialog
                open={!!deleteTarget}
                name={deleteTarget?.name ?? ""}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) { deleteService.mutate(deleteTarget.id); setDeleteTarget(null); } }}
                isPending={isDeletePending}
            />
        </div>
    );
}
