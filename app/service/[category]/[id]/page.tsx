"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, ShoppingCart, Calendar, Clock, FileText, CreditCard, CheckCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { NavbarPage } from "@/app/component/Navbar"
import Link from "next/link"
import { Reviews } from "@/app/component/Reviews"
import { useGetPublicServices } from "@/src/hooks/useServices"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM",
];

export default function ServiceDetails() {
    const router = useRouter();
    const params = useParams();

    const id = params.id as string;
    const { data: services = [], isLoading } = useGetPublicServices();

    const service = services.find((item: any) => item.id === id);

    // Booking state
    const [bookingService, setBookingService] = React.useState<any>(null);
    const [bookingDate, setBookingDate] = React.useState<Date | undefined>(undefined);
    const [bookingTime, setBookingTime] = React.useState("");
    const [bookingNote, setBookingNote] = React.useState("");
    const [isBooked, setIsBooked] = React.useState(false);

    const handleBookNow = (serviceData: any) => {
        setBookingService(serviceData);
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
            category: (bookingService.slug || "")
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            status: "Upcoming",
            date: format(bookingDate, "MMM d, yyyy"),
            time: bookingTime,
            price: bookingService.price || "—",
            description: bookingNote || bookingService.description || "",
            statusColor: "bg-sky-100 text-sky-700",
        };

        try {
            const existing = JSON.parse(localStorage.getItem("metro_bookings") || "[]");
            localStorage.setItem("metro_bookings", JSON.stringify([newBooking, ...existing]));
        } catch (_) { }

        setIsBooked(true);
    };

    const canConfirm = bookingDate && bookingTime;

    if (isLoading) {
        return (
            <div>
                <NavbarPage />
                <div className='flex justify-center items-center h-[60vh]'>
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (!service) {
        return (
            <div>
                <NavbarPage />
                <div className='flex justify-center items-center h-[60vh] flex-col gap-4'>
                    <h1 className='text-2xl font-bold text-gray-800'>Service Not Found</h1>
                    <Button onClick={() => router.back()} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    // Fallback values
    const images = service.images?.map((img: any) => img.url) || [];
    if (images.length === 0) images.push("https://picsum.photos/800/600"); // placeholder if missing

    const price = service.price != null ? `Rs. ${service.price}` : "Contact for Price";
    const duration = service.duration || "Variable";
    const rating = service.rating || 4.5;
    const reviewsCount = service.reviewsCount || 0;
    const longDescription = service.description || "";
    const features = service.features || ["Professional Service", "Verified Expert", "Satisfaction Guaranteed"];
    const isPremium = service.isPremium || false;
    const reviews = service.reviews || [];

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <NavbarPage />
            {/* Hero Carousel */}
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6 bg-gray-200 text-2xl px-2 py-1 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium text-sm">Back</span>
                </button>

                <Carousel
                    plugins={[
                        Autoplay({
                            delay: 3000,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent>
                        {images.map((img: string, index: number) => (
                            <CarouselItem key={index}>
                                <div className="relative h-[200px] md:h-[400px] w-full overflow-hidden rounded-3xl shadow-lg">
                                    <img
                                        src={img}
                                        alt={service.name}
                                        className="h-fit w-full object-cover transition-all duration-700 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 text-white max-w-2xl">
                                        {isPremium && (
                                            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-medium tracking-wide">PREMIUM EXPERIENCE</span>
                                            </div>
                                        )}
                                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">{service.name}</h2>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-max">
                        <Button
                            size="lg"
                            className="rounded-full shadow-2xl bg-white text-black hover:bg-gray-100 font-bold text-lg px-4 py-2 h-auto border border-gray-100 flex items-center gap-2 transition-all duration-300 hover:scale-105"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </Button>
                    </div>

                    <CarouselPrevious className="left-4 hidden md:flex h-12 w-12 border-none bg-white/20 hover:bg-white/40 text-gray-800" />
                    <CarouselNext className="right-4 hidden md:flex h-12 w-12 border-none bg-white/20 hover:bg-white/40 text-gray-800" />

                </Carousel>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Description & Reviews */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Description Card */}
                    <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-8 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">About this Service</h3>
                                <div 
                                    className="text-lg text-gray-600 leading-relaxed
                                    [&_p]:mb-4 last:[&_p]:mb-0
                                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul_li]:mb-2 
                                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol_li]:mb-2
                                    [&_li_p]:inline
                                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-8
                                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-4 [&_h2]:mt-8
                                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-3 [&_h3]:mt-6
                                    [&_strong]:font-semibold [&_strong]:text-gray-900
                                    [&_a]:text-sky-600 [&_a]:hover:underline [&_a]:transition-colors
                                    [&_blockquote]:border-l-4 [&_blockquote]:border-sky-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-gray-50 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-lg
                                    [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-6
                                    [&_code]:text-sm [&_code]:font-mono [&_code]:bg-sky-50 [&_code]:text-sky-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md
                                    [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold
                                    [&_td]:border [&_td]:border-gray-200 [&_td]:p-3"
                                    dangerouslySetInnerHTML={{ __html: longDescription || "<p>No description provided.</p>" }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-sky-500">
                                            <svg
                                                className="h-3 w-3 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>

                                        <span className="font-medium text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Customer Reviews
                            <span className="text-base font-normal text-gray-500">({reviews.length})</span>
                        </h3>
                        <Reviews reviews={reviews} />
                    </div>
                </div>

                {/* Right Column: Key Info & Booking */}
                <div className="space-y-6">
                    <div className="sticky top-24 space-y-6">
                        <Card className="rounded-3xl border-0 shadow-xl bg-white p-6">
                            <CardContent className="p-0 space-y-6">
                                <div className="space-y-2 text-center pb-6 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Starting from</p>
                                    <p className="text-4xl font-bold text-gray-900">{price}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Duration</span>
                                        <span className="font-semibold text-gray-900">{duration}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold text-gray-900">{rating}</span>
                                            <span className="text-gray-400">({reviewsCount})</span>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    size="lg" 
                                    className="w-full rounded-full h-10 text-lg font-medium shadow-lg hover:shadow-xl transition-all bg-sky-500 hover:bg-sky-600"
                                    onClick={() => handleBookNow({ ...service, slug: service.categoryId || "all", price: price })}
                                >
                                    Book Now
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="bg-blue-50 rounded-3xl p-6 text-center space-y-2">
                            <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                <img src="/assets/verified.png" alt="Verified" className="w-5 h-5 opacity-80" />
                            </div>
                            <h4 className="font-semibold text-blue-900">Verified Professionals</h4>
                            <p className="text-sm text-blue-700/80">All our experts are background checked and trained.</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Booking Dialog */}
            <Dialog open={!!bookingService} onOpenChange={(open) => { if (!open) setBookingService(null); }}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    {isBooked ? (
                        /* Success State */
                        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Booking Confirmed!</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Your <span className="font-medium text-gray-700">{bookingService?.name}</span> is scheduled for{" "}
                                    <span className="font-medium text-gray-700">
                                        {bookingDate ? format(bookingDate, "MMM d, yyyy") : ""} at {bookingTime}
                                    </span>.
                                </p>
                            </div>
                            <div className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-medium">{bookingService?.name}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-bold text-sky-600">{bookingService?.price || "—"}</span>
                                </div>
                                {bookingNote && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Note</span>
                                        <span className="text-gray-600 text-right max-w-[200px] truncate">{bookingNote}</span>
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
                                    <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                                        <Calendar className="h-5 w-5 text-sky-500" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-base leading-tight">{bookingService?.name}</DialogTitle>
                                        <DialogDescription className="text-xs mt-0.5">
                                            {bookingService?.price && <span className="font-semibold text-sky-600">{bookingService.price}</span>}
                                            {bookingService?.duration && <span className="text-gray-400"> · {bookingService.duration}</span>}
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
                                                    "w-full justify-start text-left font-normal border-gray-200",
                                                    !bookingDate && "text-muted-foreground"
                                                )}
                                            >
                                                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                                {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                                            <CalendarUI
                                                mode="single"
                                                selected={bookingDate}
                                                onSelect={setBookingDate}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                className="bg-white rounded-md border"
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
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                        <Input
                                            type="time"
                                            className="pl-9 border-gray-200 text-sm"
                                            value={timeSlots.includes(bookingTime) ? "" : bookingTime}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const [h, m] = e.target.value.split(":").map(Number);
                                                    const ampm = h >= 12 ? "PM" : "AM";
                                                    const hour = h % 12 || 12;
                                                    setBookingTime(`${hour}:${String(m).padStart(2, "0")} ${ampm}`);
                                                }
                                            }}
                                        />
                                    </div>
                                    {bookingTime && (
                                        <p className="text-xs text-sky-600 font-medium">
                                            Selected: {bookingTime}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-4 gap-2">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => setBookingTime(slot)}
                                                className={cn(
                                                    "text-xs py-2 px-1 rounded-lg border transition-all",
                                                    bookingTime === slot
                                                        ? "bg-sky-500 text-white border-sky-500 font-medium"
                                                        : "border-gray-200 text-gray-600 hover:border-sky-300 hover:bg-sky-50"
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="bg-gray-100" />

                                {/* Note */}
                                <div className="flex flex-col gap-2">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                                        <FileText className="h-3.5 w-3.5 text-gray-400" /> Note{" "}
                                        <span className="text-gray-400 font-normal text-xs">(optional)</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Describe the issue or any specific requirements..."
                                        className="resize-none min-h-[80px] border-gray-200 text-sm"
                                        value={bookingNote}
                                        onChange={(e) => setBookingNote(e.target.value)}
                                    />
                                </div>

                                {/* Summary */}
                                {bookingService?.price && (
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Total Amount</span>
                                        <span className="text-base font-bold text-gray-900">{bookingService.price}</span>
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
        </div>
    )
}
