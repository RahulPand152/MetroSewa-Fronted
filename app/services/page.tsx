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

const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM",
];

export default function ServicesPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Booking state
    const [bookingService, setBookingService] = useState<any>(null);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
    const [bookingTime, setBookingTime] = useState("");
    const [bookingNote, setBookingNote] = useState("");
    const [isBooked, setIsBooked] = useState(false);

    const { data: categories = [], isLoading: catLoading } = useGetPublicCategories();
    const { data: services = [], isLoading: svcLoading } = useGetPublicServices();

    const filteredServices = services.filter((s: any) => {
        const matchesSearch =
            (s.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (s.description?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "all" || s.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleBookNow = (service: any) => {
        setBookingService(service);
        setBookingDate(undefined);
        setBookingTime("");
        setBookingNote("");
        setIsBooked(false);
    };

    const handleConfirm = () => {
        if (!bookingService || !bookingDate || !bookingTime) return;

        // Build new booking record
        const newBooking = {
            id: `B-${Date.now()}`,
            service: bookingService.name,
            category: bookingService.slug
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            status: "Upcoming",
            date: format(bookingDate, "MMM d, yyyy"),
            time: bookingTime,
            price: bookingService.price || "—",
            description: bookingNote || bookingService.description || "",
            statusColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
        };

        // Persist to localStorage so My Bookings page can read it
        try {
            const existing = JSON.parse(localStorage.getItem("metro_bookings") || "[]");
            localStorage.setItem("metro_bookings", JSON.stringify([newBooking, ...existing]));
        } catch (_) { }

        setIsBooked(true);
    };

    const canConfirm = bookingDate && bookingTime;

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
                                    const imageUrl = cat.iconPublicId || cat.imageUrl || cat.icon || "https://picsum.photos/200/300";
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(isActive ? "all" : cat.id)}
                                            className={`group relative rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer text-left ${isActive
                                                ? "border-sky-500 ring-2 ring-sky-200 dark:ring-sky-900"
                                                : "border-slate-200 dark:border-slate-800 hover:border-sky-300 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="relative h-24 w-full overflow-hidden flex items-center justify-center bg-slate-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={cat.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
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
                                            <div className="relative h-36 w-full overflow-hidden shrink-0">
                                                <img
                                                    src={mainImg}
                                                    alt={service.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-300" />
                                                {service.priority && (
                                                    <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5">
                                                        {service.badge || "Priority"}
                                                    </Badge>
                                                )}
                                                {service.isPremium && !service.priority && (
                                                    <Badge className="absolute top-2 left-2 bg-sky-500 text-white text-[10px] px-2 py-0.5">
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
                                                        onClick={() => handleBookNow({ ...service, slug: service.categoryId, price: service.price != null ? `Rs. ${service.price}` : "" })}
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

            {/* Booking Dialog */}
            <Dialog open={!!bookingService} onOpenChange={(open) => { if (!open) setBookingService(null); }}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    {isBooked ? (
                        /* Success State */
                        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Booking Confirmed!</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Your <span className="font-medium text-slate-700 dark:text-slate-300">{bookingService?.name}</span> is scheduled for{" "}
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {bookingDate ? format(bookingDate, "MMM d, yyyy") : ""} at {bookingTime}
                                    </span>.
                                </p>
                            </div>
                            <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-left text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-500">Service</span>
                                    <span className="font-medium">{bookingService?.name}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-bold text-sky-600">{bookingService?.price || "—"}</span>
                                </div>
                                {bookingNote && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Note</span>
                                        <span className="text-slate-600 dark:text-slate-300 text-right max-w-[200px] truncate">{bookingNote}</span>
                                    </div>
                                )}
                            </div>
                            <Button
                                className="bg-sky-500 hover:bg-sky-600 text-white w-full"
                                onClick={() => setBookingService(null)}
                            >
                                Done
                            </Button>
                        </div>
                    ) : (
                        /* Booking Form */
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                                        <Calendar className="h-5 w-5 text-sky-500" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-base leading-tight">{bookingService?.name}</DialogTitle>
                                        <DialogDescription className="text-xs mt-0.5">
                                            {bookingService?.price && <span className="font-semibold text-sky-600">{bookingService.price}</span>}
                                            {bookingService?.duration && <span className="text-slate-400"> · {bookingService.duration}</span>}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid gap-5 py-2">
                                {/* Date */}
                                <div className="flex flex-col gap-2">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                                        <Calendar className="h-3.5 w-3.5 text-sky-500" /> Preferred Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800",
                                                    !bookingDate && "text-muted-foreground"
                                                )}
                                            >
                                                <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                                {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                                            <CalendarUI
                                                mode="single"
                                                selected={bookingDate}
                                                onSelect={setBookingDate}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                className="bg-white dark:bg-slate-950 rounded-md border"
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Time */}
                                <div className="flex flex-col gap-2">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                                        <Clock className="h-3.5 w-3.5 text-sky-500" /> Preferred Time
                                    </Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            type="time"
                                            className="pl-9 border-slate-200 dark:border-slate-800 text-sm"
                                            value={
                                                // If the selected time matches a preset, don't prefill the custom input
                                                timeSlots.includes(bookingTime) ? "" : bookingTime
                                            }
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    // Convert 24h "HH:mm" to "H:MM AM/PM"
                                                    const [h, m] = e.target.value.split(":").map(Number);
                                                    const ampm = h >= 12 ? "PM" : "AM";
                                                    const hour = h % 12 || 12;
                                                    setBookingTime(`${hour}:${String(m).padStart(2, "0")} ${ampm}`);
                                                }
                                            }}
                                        />
                                    </div>
                                    {bookingTime && (
                                        <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                                            Selected: {bookingTime}
                                        </p>
                                    )}
                                    {/* Preset slots */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => setBookingTime(slot)}
                                                className={cn(
                                                    "text-xs py-2 px-1 rounded-lg border transition-all",
                                                    bookingTime === slot
                                                        ? "bg-sky-500 text-white border-sky-500 font-medium"
                                                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Custom time input */}


                                </div>

                                <Separator className="bg-slate-100 dark:bg-slate-800" />

                                {/* Note */}
                                <div className="flex flex-col gap-2">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                                        <FileText className="h-3.5 w-3.5 text-slate-400" /> Note{" "}
                                        <span className="text-slate-400 font-normal text-xs">(optional)</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Describe the issue or any specific requirements..."
                                        className="resize-none min-h-[80px] border-slate-200 dark:border-slate-800 text-sm"
                                        value={bookingNote}
                                        onChange={(e) => setBookingNote(e.target.value)}
                                    />
                                </div>

                                {/* Summary */}
                                {bookingService?.price && (
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Total Amount</span>
                                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">{bookingService.price}</span>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={() => setBookingService(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-sky-500 hover:bg-sky-600 text-white w-full sm:w-auto gap-2"
                                    onClick={handleConfirm}
                                    disabled={!canConfirm}
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Confirm &amp; Pay
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
