"use client";

import Link from "next/link";
import { Search, Star, Calendar, Clock, FileText, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { NavbarPage } from "../component/Navbar";
import { useGetPublicCategories, useGetPublicServices } from "@/src/hooks/useServices";
import { useProfile } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";

const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM",
];

export default function ServicesPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const router = useRouter();
    const { data: userProfile } = useProfile();
    const isEligibleToBook = userProfile?.role !== 'ADMIN' && userProfile?.role !== 'TECHNICIAN';

    const handleBookRoute = (serviceId: string) => {
        if (!userProfile) {
            router.push("/login");
            return;
        }
        if (!isEligibleToBook) {
            alert("For security reasons, Admins and Technicians cannot book services.");
            return;
        }
        router.push(`/booking/${serviceId}`);
    };

    const { data: categories = [], isLoading: catLoading } = useGetPublicCategories();
    const { data: services = [], isLoading: svcLoading } = useGetPublicServices();

    const filteredServices = services.filter((s: any) => {
        const matchesSearch =
            (s.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (s.description?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "all" || s.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <NavbarPage />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            All Services
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Browse categories or search for any service
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search for any service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-11"
                        />
                    </div>

                    {/* Categories Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                                Service Categories
                            </h2>
                            <span className="text-xs text-slate-400">{categories.length} categories</span>
                        </div>

                        {catLoading ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <p className="text-sm">No categories available</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {categories.map((cat: any) => {
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(isActive ? "all" : cat.id)}
                                            className={`group relative rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer text-left ${isActive
                                                ? "border-sky-500 ring-2 ring-sky-200 dark:ring-sky-900"
                                                : "border-slate-200 dark:border-slate-800 hover:border-sky-300 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="relative h-24 w-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                {cat.icon ? (
                                                    <img
                                                        src={cat.icon}
                                                        alt={cat.name}
                                                        className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                                                )}
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-300" />
                                            </div>
                                            <div className="p-2 bg-white dark:bg-slate-900">
                                                <p className={`text-xs sm:text-sm font-semibold text-center truncate ${isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-200"}`}>
                                                    {cat.name}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Services Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                                {selectedCategory === "all"
                                    ? "All Services"
                                    : `${categories.find((c: any) => c.id === selectedCategory)?.name ?? ""} Services`}
                            </h2>
                            <div className="flex items-center gap-2">
                                {selectedCategory !== "all" && (
                                    <button
                                        onClick={() => setSelectedCategory("all")}
                                        className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
                                    >
                                        Clear filter
                                    </button>
                                )}
                                <Badge className="bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 text-xs">
                                    {filteredServices.length} services
                                </Badge>
                            </div>
                        </div>

                        {svcLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <p className="text-sm sm:text-base font-medium">No services found</p>
                                <p className="text-xs sm:text-sm mt-1">Try a different search term or category</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredServices.map((service: any) => {
                                    const mainImg = service.images?.[0]?.url || "https://picsum.photos/200/300";
                                    return (
                                        <div
                                            key={service.id}
                                            className="group relative rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                                        >
                                            <div className="relative h-36 w-full overflow-hidden shrink-0 cursor-pointer">
                                                <Link href={`/service/${service.categoryId ?? 'all'}/${service.id}`}>
                                                    <img
                                                        src={mainImg}
                                                        alt={service.name}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 block"
                                                    />
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-300" />
                                                </Link>
                                                {service.priority && (
                                                    <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 pointer-events-none">
                                                        {service.badge || "Priority"}
                                                    </Badge>
                                                )}
                                                {service.isPremium && !service.priority && (
                                                    <Badge className="absolute top-2 left-2 bg-sky-500 text-white text-[10px] px-2 py-0.5 pointer-events-none">
                                                        Premium
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="p-4 flex flex-col flex-1 gap-2">
                                                <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                                    {service.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2"
                                                    dangerouslySetInnerHTML={{ __html: service.description ?? '' }}
                                                />

                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                    {service.rating && (
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{service.rating}</span>
                                                            {service.reviewsCount && <span>({service.reviewsCount})</span>}
                                                        </span>
                                                    )}
                                                    {service.duration && (
                                                        <span className="text-slate-400">{service.duration}</span>
                                                    )}
                                                </div>

                                                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                        {service.price != null ? `Rs. ${service.price}` : "--"}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-8 px-4 ml-auto"
                                                        onClick={() => handleBookRoute(service.id)}
                                                    >
                                                        Book Now
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </>
    );
}
