"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { formatBookingDate } from "@/lib/utils"
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight, ShieldCheck, CreditCard, User, Mail, Phone, FileText, CheckCircle, Wallet, Check, Loader2, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { useProfile } from "@/src/hooks/useAuth"
import { useGetPublicServices } from "@/src/hooks/useServices"
import axiosInstance from "@/src/lib/axios"
import { useCart } from "@/src/lib/cartContext"

import { NavbarPage } from "@/app/component/Navbar"
import { Button } from "@/components/ui/button"
import { Card, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"

import { AuthDialog } from "@/components/AuthDialog"

// The steps of our booking wizard
const STEPS = [
    { title: "Details", description: "Booking info" },
    { title: "Review", description: "Review & book" },
    { title: "Payment", description: "Select method" },
    { title: "Success", description: "All done" },
]

export default function BookingWizardPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const serviceId = params.serviceId as string

    const { data: userProfile, isLoading: isAuthLoading } = useProfile()
    const { data: services = [], isLoading: isServicesLoading } = useGetPublicServices()
    const { items, removeItem } = useCart()

    const service = services.find((s: any) => s.id === serviceId)

    const cartItem = items.find((i) => i.serviceId === serviceId)
    const quantity = cartItem ? cartItem.quantity : 1

    // Form State
    const [step, setStep] = useState(1)

    // Step 1 State
    const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined)
    const [bookingTime, setBookingTime] = useState("")
    const [notes, setNotes] = useState("")

    const [contactName, setContactName] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [contactPhone, setContactPhone] = useState("")
    const [contactAddress, setContactAddress] = useState("")
    const [initialized, setInitialized] = useState(false)

    // Step 3 State
    const [paymentMethod, setPaymentMethod] = useState("KHALTI")

    // Final state from backend
    const [bookingResult, setBookingResult] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Auth Dialog State
    const [showAuthDialog, setShowAuthDialog] = useState(false)

    // Khalti callback verification state
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
    const [paymentError, setPaymentError] = useState<string | null>(null)

    useEffect(() => {
        const user = userProfile?.data;
        if (user && !initialized) {
            setContactName(`${user.firstName || ""} ${user.lastName || ""}`.trim())
            setContactEmail(user.email || "")
            setContactPhone(user.phoneNumber || "")
            setInitialized(true)
        }
    }, [userProfile, initialized])

    const userRole = userProfile?.data?.role || userProfile?.role;
    useEffect(() => {
        if (userRole === "ADMIN" || userRole === "TECHNICIAN") {
            toast.error("Admins and Technicians are not eligible to book services. Only standard users can make a booking.");
            router.push("/");
        }
    }, [userRole, router])

    // ── Handle Khalti Callback ─────────────────────────────────────────
    // When Khalti redirects back, URL has: ?pidx=xxx&status=Completed&transaction_id=xxx&purchase_order_id=xxx
    const handleKhaltiCallback = useCallback(async () => {
        const pidx = searchParams.get("pidx")
        const status = searchParams.get("status")
        const purchase_order_id = searchParams.get("purchase_order_id")
        const transaction_id = searchParams.get("transaction_id")

        if (!pidx || !purchase_order_id) return

        // Prevent re-processing
        if (isVerifyingPayment || bookingResult) return

        setIsVerifyingPayment(true)
        setStep(4) // Jump to success/result step

        if (status === "Completed") {
            try {
                // Verify payment via our backend
                const res = await axiosInstance.post("/payment/verify", {
                    pidx,
                    bookingId: purchase_order_id,
                })

                const data = res.data?.data || res.data;

                if (res.status === 200 && data) {
                    setBookingResult({
                        id: purchase_order_id,
                        paymentStatus: "PAID",
                        transactionId: transaction_id || data.transaction_id,
                        amount: data.total_amount,
                        khaltiStatus: data.khaltiStatus || "Completed",
                    })
                    if (cartItem) removeItem(cartItem.id) // Clear from cart
                    toast.success("Payment verified successfully! Your booking is confirmed.")
                } else {
                    setPaymentError("Payment verification returned unexpected status.")
                    toast.error("Payment verification failed")
                }
            } catch (error: any) {
                console.error("Verification error:", error)
                const errorMsg = error.response?.data?.message || error.response?.data?.error || "An error occurred while verifying your payment. Please contact support.";
                setPaymentError(errorMsg)
                toast.error(errorMsg)
            }
        } else if (status === "User canceled") {
            setPaymentError("Payment was cancelled. You can try again.")
            setStep(3) // Go back to payment step
            toast.error("Payment was cancelled")
        } else {
            setPaymentError(`Payment status: ${status}. Please try again or contact support.`)
            toast.error(`Payment ${status}`)
        }

        setIsVerifyingPayment(false)
    }, [searchParams, isVerifyingPayment, bookingResult])

    useEffect(() => {
        handleKhaltiCallback()
    }, [handleKhaltiCallback])

    if (isAuthLoading || isServicesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <NavbarPage />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                </div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <NavbarPage />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-xl font-medium text-gray-700">Service not found.</p>
                    <Button onClick={() => router.back()} variant="outline">Go Back</Button>
                </div>
            </div>
        )
    }

    // Calculate display price
    const servicePriceNPR = service.price ? Number(service.price) * quantity : 0
    const displayPrice = servicePriceNPR > 0 ? `NPR ${servicePriceNPR.toLocaleString()}` : "Free"

    const handleNextStep = () => {
        if (step === 1 && !userProfile) {
            setShowAuthDialog(true)
            return
        }
        setStep((s) => Math.min(s + 1, 4))
    }
    const prevStep = () => setStep((s) => Math.max(s - 1, 1))

    // Validation for Step 1
    const isStep1Valid = bookingDate && bookingTime && contactAddress.trim() !== "";

    const processBackendBooking = async () => {
        try {
            const finalDescription = notes.trim()
            const dateObj = new Date(bookingDate!)

            // Parse time from input type="time" (e.g., "14:30")
            if (bookingTime) {
                const [hours, minutes] = bookingTime.split(":").map(Number)
                dateObj.setHours(hours, minutes, 0, 0)
            }

            // 1. Initiate backend booking
            const payload: any = {
                serviceId: service.id,
                scheduledDate: dateObj.toISOString(),
                description: finalDescription,
                address: contactAddress,
                // optionally pass quantity if backend handles it
                quantity: quantity
            }

            const response = await axiosInstance.post("/bookings", payload)
            return response.data?.data;

        } catch (error: any) {
            console.error("Booking error:", error)
            const errMsg = error.response?.data?.error?.message || error.response?.data?.message || "Failed to create booking. Please try again.";
            toast.error(errMsg);
            setIsSubmitting(false)
            return null;
        }
    }

    const handleConfirmBooking = async () => {
        if (!userProfile) return;
        setIsSubmitting(true);

        if (paymentMethod === "KHALTI") {
            try {
                // Step 1: Create the pending booking
                const booking = await processBackendBooking();
                if (!booking) return;

                // Step 2: Initiate Khalti payment directly via our backend Express API
                const initiatePayload = {
                    bookingId: booking.id,
                    return_url: `${window.location.origin}/booking/${service.id}`,
                    website_url: window.location.origin,
                    customer_info: {
                        name: contactName || "Customer",
                        email: contactEmail || "customer@metrosewa.com",
                        phone: contactPhone || "9800000000"
                    }
                };

                const res = await axiosInstance.post("/payment/initiate", initiatePayload);
                const data = res.data?.data;

                if (!data || !data.payment_url) {
                    throw new Error(res.data?.message || "Failed to generate payment URL.");
                }

                // Step 4: Redirect user to Khalti payment page
                window.location.href = data.payment_url;
            } catch (error: any) {
                console.error("Khalti API Exception:", error);
                const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || "An error occurred while initializing payment.";
                toast.error(errMsg);
                setIsSubmitting(false);
            }
        } else if (paymentMethod === "CASH") {
            try {
                // Step 1: Create the pending booking
                const booking = await processBackendBooking();
                if (!booking) return;

                // Step 2: Call the COD endpoint
                await axiosInstance.post("/payment/cod", { bookingId: booking.id });

                // Step 3: Go to Success View
                setBookingResult({
                    id: booking.id,
                    paymentStatus: "Pending",
                    transactionId: null,
                    amount: servicePriceNPR
                });
                if (cartItem) removeItem(cartItem.id) // Clear from cart
                setStep(4);
                setIsSubmitting(false);
            } catch (error: any) {
                console.error("COD Exception:", error);
                const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || "An error occurred while confirming Cash on Delivery.";
                toast.error(errMsg);
                setIsSubmitting(false);
            }
        } else {
            const booking = await processBackendBooking();
            if (booking) {
                setBookingResult(booking);
                if (cartItem) removeItem(cartItem.id) // Clear from cart
                setStep(4);
                setIsSubmitting(false);
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <NavbarPage />

            {/* Auth Dialog */}
            <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

            <div className="max-w-4xl mx-auto px-4 py-8 mt-10">
                {/* Header & Stepper */}
                <div className="mb-10">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#236b9d] transition mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to service
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">Book {service.name}</h1>
                    <p className="text-slate-500 mt-2">Complete the steps below to secure your appointment.</p>
                </div>

                <div className="relative mb-12">
                    <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden z-0">
                        <div
                            className="h-full bg-[#2baba8] transition-all duration-500 ease-in-out"
                            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>
                    <div className="relative grid grid-cols-4 z-10 w-full">
                        {STEPS.map((s, idx) => {
                            const isCompleted = step > idx + 1
                            const isCurrent = step === idx + 1
                            return (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300",
                                        isCurrent ? "bg-[#2baba8] text-white ring-4 ring-[#2baba8]/20" :
                                            isCompleted ? "bg-[#2baba8] text-white" : "bg-white text-slate-400 border border-slate-200"
                                    )}>
                                        {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    <div className="mt-3 text-center hidden sm:block">
                                        <div className={cn("text-sm font-bold", isCurrent || isCompleted ? "text-slate-900" : "text-slate-400")}>
                                            {s.title}
                                        </div>
                                        <div className="text-xs text-slate-500">{s.description}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                    <div className="p-6 md:p-8">
                        {/* STEP 1: Details */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* User Details (Auto-filled) */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Your Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Full Name</Label>
                                                <Input
                                                    className="mt-1"
                                                    value={contactName}
                                                    onChange={(e) => setContactName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Email Address</Label>
                                                <Input
                                                    className="mt-1"
                                                    value={contactEmail}
                                                    onChange={(e) => setContactEmail(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Phone Number</Label>
                                                <Input
                                                    className="mt-1"
                                                    value={contactPhone}
                                                    onChange={(e) => setContactPhone(e.target.value)}
                                                    placeholder="Enter your contact number"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Address *</Label>
                                                <Input
                                                    className="mt-1"
                                                    value={contactAddress}
                                                    onChange={(e) => setContactAddress(e.target.value)}
                                                    placeholder="Enter your service address"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Service Details</h3>
                                        <div className="space-y-4">
                                            {/* Date */}
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Preferred Date *</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn("w-full justify-start text-left font-normal border-slate-200", !bookingDate && "text-slate-400")}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4 text-sky-500" />
                                                            {bookingDate ? formatBookingDate(bookingDate, "PPP") : "Select a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarUI
                                                            mode="single"
                                                            selected={bookingDate}
                                                            onSelect={setBookingDate}
                                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            {/* Time: Chrome-style Dropdown Picker */}
                                            <div className="flex flex-col gap-2">
                                                <Label>Preferred Time *</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <div className="w-full justify-start h-10 text-left font-normal flex gap-1 cursor-pointer border border-slate-200 rounded-md px-3 py-2 shadow-sm items-center hover:border-slate-300 transition-colors bg-white">
                                                            {(() => {
                                                                let displayH = "10";
                                                                let displayM = "00";
                                                                let displayAmPm = "AM";
                                                                if (bookingTime) {
                                                                    const [h, m] = bookingTime.split(":");
                                                                    const h24 = Number(h);
                                                                    displayAmPm = h24 >= 12 ? "PM" : "AM";
                                                                    const h12 = h24 % 12 || 12;
                                                                    displayH = h12.toString().padStart(2, "0");
                                                                    displayM = m.toString().padStart(2, "0");
                                                                }

                                                                return (
                                                                    <>
                                                                        <div className={cn(
                                                                            "px-2 py-0.5 rounded text-sm font-medium transition-colors border",
                                                                            bookingTime ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-transparent border-transparent text-slate-400"
                                                                        )}>
                                                                            {bookingTime ? displayH : "--"}
                                                                        </div>
                                                                        <div className="flex flex-col justify-center font-bold text-slate-400 text-sm">:</div>
                                                                        <div className={cn(
                                                                            "px-2 py-0.5 rounded text-sm font-medium transition-colors border",
                                                                            bookingTime ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-transparent border-transparent text-slate-400"
                                                                        )}>
                                                                            {bookingTime ? displayM : "--"}
                                                                        </div>
                                                                        <div className={cn(
                                                                            "px-2 py-0.5 rounded text-sm font-medium ml-1 transition-colors border",
                                                                            bookingTime ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-transparent border-transparent text-slate-400"
                                                                        )}>
                                                                            {bookingTime ? displayAmPm : "--"}
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-fit p-1 border border-slate-200 rounded-lg shadow-xl" align="start">
                                                        {(() => {
                                                            let currentH = "10";
                                                            let currentM = "00";
                                                            let currentAmPm = "AM";

                                                            if (bookingTime) {
                                                                const [h, m] = bookingTime.split(":");
                                                                const h24 = Number(h);
                                                                currentAmPm = h24 >= 12 ? "PM" : "AM";
                                                                const h12 = h24 % 12 || 12;
                                                                currentH = h12.toString().padStart(2, "0");
                                                                currentM = m.toString().padStart(2, "0");
                                                            }

                                                            const setTimePart = (type: 'h' | 'm' | 'ampm', val: string) => {
                                                                let newH = currentH;
                                                                let newM = currentM;
                                                                let newAmPm = currentAmPm;

                                                                if (type === 'h') newH = val;
                                                                if (type === 'm') newM = val;
                                                                if (type === 'ampm') newAmPm = val;

                                                                let h24 = Number(newH);
                                                                if (newAmPm === "PM" && h24 !== 12) h24 += 12;
                                                                if (newAmPm === "AM" && h24 === 12) h24 = 0;

                                                                setBookingTime(`${h24.toString().padStart(2, '0')}:${newM}`);
                                                            };

                                                            return (
                                                                <div className="flex h-[280px] bg-white gap-2 text-sm select-none justify-between px-2" style={{ WebkitUserSelect: "none" }}>
                                                                    <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                                                                    {/* Hours */}
                                                                    <div className="w-16 overflow-y-auto hide-scroll flex flex-col gap-1.5 pr-2 overscroll-contain">
                                                                        {Array.from({ length: 12 }).map((_, i) => {
                                                                            const val = (i + 1).toString().padStart(2, "0");
                                                                            const isSelected = currentH === val;
                                                                            return (
                                                                                <div key={`h-${val}`} onClick={() => setTimePart('h', val)} className={cn("px-3 py-3 text-center rounded-xl cursor-pointer transition-all duration-200", isSelected ? "bg-[#2baba8] text-white font-bold shadow-md scale-105" : "hover:bg-slate-100 text-slate-600 font-medium")}>{val}</div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                    {/* Minutes */}
                                                                    <div className="w-16 overflow-y-auto hide-scroll flex flex-col gap-1.5 px-1 overscroll-contain">
                                                                        {Array.from({ length: 60 }).map((_, i) => {
                                                                            const val = (i).toString().padStart(2, "0");
                                                                            const isSelected = currentM === val;
                                                                            return (
                                                                                <div key={`m-${val}`} onClick={() => setTimePart('m', val)} className={cn("px-3 py-3 text-center rounded-xl cursor-pointer transition-all duration-200", isSelected ? "bg-[#2baba8] text-white font-bold shadow-md scale-105" : "hover:bg-slate-100 text-slate-600 font-medium")}>{val}</div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                    {/* AM/PM */}
                                                                    <div className="w-16 overflow-y-auto hide-scroll flex flex-col gap-1.5 pl-2 overscroll-contain">
                                                                        {["AM", "PM"].map((val) => {
                                                                            const isSelected = currentAmPm === val;
                                                                            return (
                                                                                <div key={`ampm-${val}`} onClick={() => setTimePart('ampm', val)} className={cn("px-3 py-3 text-center rounded-xl cursor-pointer transition-all duration-200", isSelected ? "bg-[#2baba8] text-white font-bold shadow-md scale-105" : "hover:bg-slate-100 text-slate-600 font-medium")}>{val}</div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <Label>Extra Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
                                                <Textarea
                                                    placeholder="Any specific requests or instructions..."
                                                    className="resize-none"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Payment */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center max-w-lg mx-auto mb-8">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Wallet className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Payment Processing</h2>
                                    <p className="text-slate-500 mt-2">Choose your preferred payment method to secure your booking instantly.</p>
                                </div>

                                {/* Amount Display */}
                                <div className="max-w-xl mx-auto mb-6">
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 text-center">
                                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Amount to Pay</p>
                                        <p className="text-4xl font-extrabold text-purple-700">{displayPrice}</p>
                                        <p className="text-xs text-slate-400 mt-1">for {service.name}</p>
                                    </div>
                                </div>

                                <div className="max-w-xl mx-auto space-y-4">
                                    {/* Khalti option */}
                                    <div onClick={() => setPaymentMethod('KHALTI')} className={cn(
                                        "border-2 rounded-xl p-5 cursor-pointer flex items-start gap-4 transition-all",
                                        paymentMethod === 'KHALTI' ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white hover:border-slate-300"
                                    )}>
                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 shrink-0", paymentMethod === 'KHALTI' ? "border-purple-500" : "border-slate-300")}>
                                            {paymentMethod === 'KHALTI' && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-lg text-slate-900">Pay with Khalti</h4>
                                                <img src="/khalti image.png" alt="Khalti" className="h-6" />
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">Fast and secure digital wallet payment prominent in Nepal.</p>

                                            {paymentMethod === 'KHALTI' && (
                                                <div className="mt-4 bg-white p-4 rounded-lg border border-purple-100 text-sm space-y-2">
                                                    {/* <p className="font-semibold text-slate-700 flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sandbox Test Credentials
                                                    </p> */}
                                                    {/* <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-2 items-center">
                                                        <span className="text-slate-500">Mobile:</span>
                                                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700 font-mono">9800000000</code>
                                                        <span className="text-slate-500">MPIN:</span>
                                                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700 font-mono">1111</code>
                                                        <span className="text-slate-500">OTP:</span>
                                                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700 font-mono">987654</code>
                                                    </div> */}
                                                    <p className="text-xs text-purple-600 mt-2 font-medium">
                                                        You will be redirected to Khalti&apos;s secure payment portal.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cash Option */}
                                    <div onClick={() => setPaymentMethod('CASH')} className={cn(
                                        "border-2 rounded-xl p-5 cursor-pointer flex items-center gap-4 transition-all",
                                        paymentMethod === 'CASH' ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                                    )}>
                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", paymentMethod === 'CASH' ? "border-emerald-500" : "border-slate-300")}>
                                            {paymentMethod === 'CASH' && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900">Cash on Delivery</h4>
                                            <p className="text-sm text-slate-500 mt-1">Pay the technician after the service is completed securely.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Review (Split View) */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Review your Booking</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto">
                                    {/* Left Side: User Info */}
                                    <div className="bg-white p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 relative">
                                        <div className="absolute top-0 right-0 p-3">
                                            <span className="bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-bl-xl rounded-tr-xl">User Account</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <User className="w-5 h-5 text-sky-500" /> Customer Data
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Name</p>
                                                <p className="font-medium text-slate-800 text-lg">{contactName || "Not provided"}</p>
                                            </div>
                                            <Separator />
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email</p>
                                                <p className="font-medium text-slate-800">{contactEmail || "Not provided"}</p>
                                            </div>
                                            <Separator />
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone Contact</p>
                                                <p className="font-medium text-slate-800">{contactPhone || "Not provided"}</p>
                                            </div>
                                            <Separator />
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Address</p>
                                                <p className="font-medium text-slate-800">{contactAddress || "Not provided"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Admin / Service Info */}
                                    <div className="bg-slate-50 p-6 md:p-8 relative">
                                        <div className="absolute top-0 right-0 p-3">
                                            <span className="bg-sky-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-bl-xl rounded-tr-xl">Service Entry</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-indigo-500" /> Administrative Invoice
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Service Tag</p>
                                                <p className="font-bold text-indigo-700 text-lg">{service.name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-slate-100">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Schedule</p>
                                                    <p className="font-medium text-sm leading-tight text-sky-700">
                                                        {bookingDate ? formatBookingDate(bookingDate, "MMM d, yyyy") : ""} <br />
                                                        {bookingTime && (function () {
                                                            const [h, m] = bookingTime.split(":");
                                                            const d = new Date();
                                                            d.setHours(Number(h), Number(m));
                                                            return format(d, "h:mm a");
                                                        })()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Payment</p>
                                                    <p className="font-bold text-emerald-600 text-xl">
                                                        {displayPrice}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Additional Notes</p>
                                                <p className="font-medium text-slate-800 text-sm italic border-l-2 border-slate-300 pl-3">
                                                    {notes ? notes : "No specific notes provided by customer."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Success / Verifying / Error */}
                        {step === 4 && (
                            <div className="py-12 px-4 text-center animate-in zoom-in-95 duration-700">
                                {/* Verifying Payment State */}
                                {isVerifyingPayment && (
                                    <div>
                                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-purple-50">
                                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Verifying Payment...</h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto">
                                            Please wait while we confirm your payment with Khalti.
                                        </p>
                                    </div>
                                )}

                                {/* Payment Error State */}
                                {!isVerifyingPayment && paymentError && !bookingResult && (
                                    <div>
                                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50">
                                            <XCircle className="w-12 h-12 text-red-500" />
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Payment Issue</h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">
                                            {paymentError}
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="rounded-full px-8"
                                                onClick={() => {
                                                    setPaymentError(null)
                                                    setStep(3)
                                                    // Clean URL params
                                                    window.history.replaceState({}, "", `/booking/${serviceId}`)
                                                }}
                                            >
                                                Try Again
                                            </Button>
                                            <Button
                                                size="lg"
                                                className="bg-slate-900 hover:bg-slate-800 rounded-full px-8"
                                                onClick={() => router.push('/')}
                                            >
                                                Go Home
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Success State */}
                                {!isVerifyingPayment && bookingResult && (
                                    <div>
                                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
                                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                                        </div>
                                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Booking Confirmed!</h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto">
                                            Your service has been successfully booked and payment has been verified. Our technicians have been notified.
                                        </p>

                                        <div className="mt-8 max-w-sm mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                                            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Transaction / Booking ID</p>
                                            <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">
                                                {bookingResult?.id ? bookingResult.id.split("-")[0].toUpperCase() : "METRO-9AB2FDC"}
                                            </p>
                                            <Separator className="my-4" />
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Service</span>
                                                <span className="font-bold text-slate-800">{service.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm mt-2">
                                                <span className="text-slate-500">Amount</span>
                                                <span className="font-bold text-purple-700">{displayPrice}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm mt-2">
                                                <span className="text-slate-500">Payment Status</span>
                                                <span className={cn(
                                                    "font-bold px-2 py-0.5 rounded text-xs uppercase",
                                                    (bookingResult?.paymentStatus || "Paid").toString().toLowerCase().includes("pending")
                                                        ? "text-red-600 bg-red-100"
                                                        : "text-emerald-600 bg-emerald-100"
                                                )}>
                                                    {bookingResult?.paymentStatus || "Paid"}
                                                </span>
                                            </div>
                                            {bookingResult?.transactionId && (
                                                <div className="flex justify-between items-center text-sm mt-2">
                                                    <span className="text-slate-500">Transaction</span>
                                                    <span className="font-mono text-xs text-slate-600">
                                                        {bookingResult.transactionId.substring(0, 12)}...
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-10">
                                            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 rounded-full px-8" onClick={() => router.push('/')}>
                                                Back to Home
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Fallback: No callback params, direct success (e.g., cash) */}
                                {!isVerifyingPayment && !paymentError && !bookingResult && (
                                    <div>
                                        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-amber-50">
                                            <AlertTriangle className="w-12 h-12 text-amber-500" />
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Processing...</h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto">
                                            Your payment is being processed. If you were redirected here, please wait.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    {step < 4 && (
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                            <Button
                                variant="ghost"
                                className="text-slate-500"
                                onClick={step === 1 ? () => router.back() : prevStep}
                                disabled={isSubmitting}
                            >
                                {step === 1 ? "Cancel" : "Back"}
                            </Button>

                            {step < 3 ? (
                                <Button
                                    className="bg-[#236b9d] hover:bg-[#1a5177] text-white px-8 rounded-full shadow-sm"
                                    onClick={handleNextStep}
                                    disabled={step === 1 && !isStep1Valid}
                                >
                                    Proceed <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    className="bg-emerald-500 hover:bg-emerald-600 px-10 rounded-full shadow-sm text-lg font-bold disabled:opacity-70"
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'KHALTI' ? 'Pay & Book' : 'Confirm Booking'}
                                            <ShieldCheck className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
