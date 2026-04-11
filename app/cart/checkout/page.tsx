"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { formatBookingDate } from "@/lib/utils"
import { Calendar as CalendarIcon, ArrowLeft, User, FileText, CheckCircle, Wallet, Check, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { useProfile } from "@/src/hooks/useAuth"
import axiosInstance from "@/src/lib/axios"
import { useCart } from "@/src/lib/cartContext"

import { NavbarPage } from "@/app/component/Navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { AuthDialog } from "@/components/AuthDialog"

const STEPS = [
    { title: "Details", description: "Booking info" },
    { title: "Review", description: "Review & book" },
    { title: "Payment", description: "Select method" },
    { title: "Success", description: "All done" },
]

function BatchCheckoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data: userProfile, isLoading: isAuthLoading } = useProfile()
    const { items, clearCart } = useCart()

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
    const [showAuthDialog, setShowAuthDialog] = useState(false)
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
    const [paymentError, setPaymentError] = useState<string | null>(null)

    // Calculate sum of cart items
    const [totalAmount, setTotalAmount] = useState(0)

    useEffect(() => {
        let total = 0
        items.forEach(item => {
            total += item.price * item.quantity
        })
        setTotalAmount(total)
    }, [items])

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
            toast.error("Admins and Technicians are not eligible to book services.");
            router.push("/");
        }
    }, [userRole, router])

    // Redirect if cart is empty and we haven't paid yet
    useEffect(() => {
        if (!isAuthLoading && items.length === 0 && step < 4) {
            router.push("/cart")
        }
    }, [items, isAuthLoading, step, router])

    const handleKhaltiCallback = useCallback(async () => {
        const pidx = searchParams.get("pidx")
        const status = searchParams.get("status")
        const transaction_id = searchParams.get("transaction_id")

        if (!pidx) return
        if (isVerifyingPayment || bookingResult) return

        setIsVerifyingPayment(true)
        setStep(4)

        if (status === "Completed") {
            try {
                // Verify batch payment
                const res = await axiosInstance.post("/payment/verify-batch", { pidx })
                const data = res.data?.data || res.data;

                if (res.status === 200) {
                    setBookingResult({
                        id: transaction_id || pidx, // Using pidx as proxy for multi-id order
                        paymentStatus: "PAID",
                        transactionId: transaction_id || pidx,
                        khaltiStatus: "Completed",
                    })
                    clearCart()
                    toast.success("Batch Payment verified successfully! Bookings confirmed.")
                } else {
                    setPaymentError("Payment verification returned unexpected status.")
                    toast.error("Payment verification failed")
                }
            } catch (error: any) {
                const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || "Verify error";
                setPaymentError(errorMsg)
                toast.error(errorMsg)
            }
        } else if (status === "User canceled") {
            setPaymentError("Payment was cancelled.")
            setStep(3)
        } else {
            setPaymentError(`Payment status: ${status}.`)
        }
        setIsVerifyingPayment(false)
    }, [searchParams, isVerifyingPayment, bookingResult, clearCart])

    useEffect(() => {
        handleKhaltiCallback()
    }, [handleKhaltiCallback])

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <NavbarPage />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                </div>
            </div>
        )
    }

    const displayPrice = totalAmount > 0 ? `NPR ${totalAmount.toLocaleString()}` : "Free"

    const handleNextStep = () => {
        if (step === 1 && !userProfile) {
            setShowAuthDialog(true)
            return
        }
        if (step === 1 && (!bookingDate || !bookingTime || !contactAddress)) {
            toast.error("Please completely fill the details form (Date, Time, Address).")
            return
        }
        setStep((s) => Math.min(s + 1, 4))
    }

    const processBackendBatchBooking = async () => {
        try {
            const finalDescription = notes.trim()
            const dateObj = new Date(bookingDate!)

            if (bookingTime) {
                const [hours, minutes] = bookingTime.split(":").map(Number)
                dateObj.setHours(hours, minutes, 0, 0)
            }

            // Generate payload for batch bookings
            const batchItems = items.map(item => ({
                serviceId: item.serviceId,
                quantity: item.quantity
            }))

            const payload = {
                items: batchItems,
                scheduledDate: dateObj.toISOString(),
                description: finalDescription,
                address: contactAddress,
            }

            const response = await axiosInstance.post("/bookings/batch", payload)
            // Returns an array of created bookings
            return response.data?.data;
        } catch (error: any) {
            const errMsg = error.response?.data?.error?.message || error.response?.data?.message || "Failed to create batch bookings.";
            toast.error(errMsg);
            setIsSubmitting(false)
            return null;
        }
    }

    const handleConfirmBooking = async () => {
        if (!userProfile) return;
        setIsSubmitting(true);

        // CREATE BATCH BOOKING
        const createdBookings = await processBackendBatchBooking();
        if (!createdBookings || createdBookings.length === 0) {
            setIsSubmitting(false);
            return;
        }

        const bookingIds = createdBookings.map((b: any) => b.id);

        if (paymentMethod === "KHALTI") {
            try {
                const initiatePayload = {
                    bookingIds: bookingIds,
                    return_url: `${window.location.origin}/cart/checkout`,
                    website_url: window.location.origin,
                    customer_info: {
                        name: contactName || "Customer",
                        email: contactEmail || "customer@metrosewa.com",
                        phone: contactPhone || "9800000000"
                    }
                };

                const res = await axiosInstance.post("/payment/initiate-batch", initiatePayload);
                const data = res.data?.data;

                if (!data || !data.payment_url) {
                    throw new Error("Failed to generate Khalti payment URL.");
                }

                window.location.href = data.payment_url;
            } catch (error: any) {
                const errMsg = error.response?.data?.error?.message || error.response?.data?.message || "An error occurred while initializing batch payment.";
                toast.error(errMsg);
                setIsSubmitting(false);
            }
        } else if (paymentMethod === "CASH") {
            try {
                await axiosInstance.post("/payment/cod-batch", { bookingIds });

                setBookingResult({
                    id: bookingIds[0], // Display one as ref
                    paymentStatus: "Pending",
                    transactionId: "COD",
                    amount: totalAmount
                });
                clearCart() // empty cart after placing order
                setStep(4);
                setIsSubmitting(false);
            } catch (error: any) {
                const errMsg = error.response?.data?.error?.message || error.response?.data?.message || "Error confirming COD.";
                toast.error(errMsg);
                setIsSubmitting(false);
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <NavbarPage />
            <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

            <div className="max-w-4xl mx-auto px-4 py-8 mt-10">
                <div className="mb-10">
                    <button onClick={() => router.push("/cart")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#236b9d] transition mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">Checkout Cart</h1>
                    <p className="text-slate-500 mt-2">Complete the checkout wizard to finalize all your selected services.</p>
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

                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                    <div className="p-6 md:p-8">
                        {/* STEP 1: Details */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Your Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Full Name</Label>
                                                <Input className="mt-1" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Email Address</Label>
                                                <Input className="mt-1" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Phone Number</Label>
                                                <Input className="mt-1" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Enter your contact number" />
                                            </div>
                                            <div>
                                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Address *</Label>
                                                <Input className="mt-1" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Enter your service address" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Schedule & Notes</h3>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Preferred Date *</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-slate-200", !bookingDate && "text-slate-400")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4 text-sky-500" />
                                                            {bookingDate ? formatBookingDate(bookingDate, "PPP") : "Select a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarUI mode="single" selected={bookingDate} onSelect={setBookingDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label>Preferred Time *</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <div className="w-full justify-start h-10 text-left font-normal flex gap-1 cursor-pointer border border-slate-200 rounded-md px-3 py-2 shadow-sm items-center hover:border-slate-300 transition-colors bg-white">
                                                            {(() => {
                                                                let displayH = "10"; let displayM = "00"; let displayAmPm = "AM";
                                                                if (bookingTime) {
                                                                    const [h, m] = bookingTime.split(":");
                                                                    const h24 = Number(h);
                                                                    displayAmPm = h24 >= 12 ? "PM" : "AM";
                                                                    displayH = (h24 % 12 || 12).toString().padStart(2, "0");
                                                                    displayM = m.toString().padStart(2, "0");
                                                                }
                                                                return (
                                                                    <>
                                                                        <div className={cn("px-2 py-0.5 rounded text-sm font-medium transition-colors border", bookingTime ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-transparent border-transparent text-slate-400")}>{bookingTime ? displayH : "--"}</div>
                                                                        <div className="flex flex-col justify-center font-bold text-slate-400 text-sm">:</div>
                                                                        <div className={cn("px-2 py-0.5 rounded text-sm font-medium transition-colors border", bookingTime ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-transparent border-transparent text-slate-400")}>{bookingTime ? displayM : "--"}</div>
                                                                        <div className={cn("px-2 py-0.5 rounded text-sm font-medium ml-1 transition-colors border", bookingTime ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-transparent border-transparent text-slate-400")}>{bookingTime ? displayAmPm : "--"}</div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-fit p-1 border border-slate-200 rounded-lg shadow-xl" align="start">
                                                        {(() => {
                                                            let currentH = "10"; let currentM = "00"; let currentAmPm = "AM";
                                                            if (bookingTime) {
                                                                const [h, m] = bookingTime.split(":");
                                                                const h24 = Number(h);
                                                                currentAmPm = h24 >= 12 ? "PM" : "AM";
                                                                currentH = (h24 % 12 || 12).toString().padStart(2, "0");
                                                                currentM = m.toString().padStart(2, "0");
                                                            }
                                                            const setTimePart = (type: 'h' | 'm' | 'ampm', val: string) => {
                                                                let nH = currentH; let nM = currentM; let nAmPm = currentAmPm;
                                                                if (type === 'h') nH = val; if (type === 'm') nM = val; if (type === 'ampm') nAmPm = val;
                                                                let h24 = Number(nH);
                                                                if (nAmPm === "PM" && h24 !== 12) h24 += 12;
                                                                if (nAmPm === "AM" && h24 === 12) h24 = 0;
                                                                setBookingTime(`${h24.toString().padStart(2, '0')}:${nM}`);
                                                            };
                                                            return (
                                                                <div className="flex h-[280px] bg-white gap-2 text-sm select-none justify-between px-2">
                                                                    <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                                                                    <div className="w-16 overflow-y-auto hide-scroll flex flex-col gap-1.5 pr-2">
                                                                        {Array.from({ length: 12 }).map((_, i) => {
                                                                            const val = (i + 1).toString().padStart(2, "0");
                                                                            const isSelected = currentH === val;
                                                                            return (<div key={`h-${val}`} onClick={() => setTimePart('h', val)} className={cn("px-3 py-3 text-center rounded-xl cursor-pointer", isSelected ? "bg-[#2baba8] text-white font-bold shadow-md scale-105" : "hover:bg-slate-100 text-slate-600 font-medium")}>{val}</div>)
                                                                        })}
                                                                    </div>
                                                                    <div className="w-16 overflow-y-auto hide-scroll flex flex-col gap-1.5 px-1">
                                                                        {Array.from({ length: 60 }).map((_, i) => {
                                                                            const val = (i).toString().padStart(2, "0");
                                                                            const isSelected = currentM === val;
                                                                            return (<div key={`m-${val}`} onClick={() => setTimePart('m', val)} className={cn("px-3 py-3 text-center rounded-xl cursor-pointer", isSelected ? "bg-[#2baba8] text-white font-bold shadow-md scale-105" : "hover:bg-slate-100 text-slate-600 font-medium")}>{val}</div>)
                                                                        })}
                                                                    </div>
                                                                    <div className="w-16 overflow-y-auto hide-scroll flex flex-col gap-1.5 pl-2">
                                                                        {["AM", "PM"].map((val) => {
                                                                            const isSelected = currentAmPm === val;
                                                                            return (<div key={`ampm-${val}`} onClick={() => setTimePart('ampm', val)} className={cn("px-3 py-3 text-center rounded-xl cursor-pointer", isSelected ? "bg-[#2baba8] text-white font-bold shadow-md scale-105" : "hover:bg-slate-100 text-slate-600 font-medium")}>{val}</div>)
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
                                                <Textarea placeholder="Any specific requests or instructions..." className="resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center max-w-lg mx-auto mb-8">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Wallet className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Payment Processing</h2>
                                    <p className="text-slate-500 mt-2">Choose your preferred payment method to secure your batch booking instantly.</p>
                                </div>

                                <div className="max-w-xl mx-auto mb-6">
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 text-center">
                                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Amount to Pay</p>
                                        <p className="text-4xl font-extrabold text-purple-700">{displayPrice}</p>
                                        <p className="text-xs text-slate-400 mt-1">for {items.length} items</p>
                                    </div>
                                </div>

                                <div className="max-w-xl mx-auto space-y-4">
                                    <div onClick={() => setPaymentMethod('KHALTI')} className={cn("border-2 rounded-xl p-5 cursor-pointer flex items-start gap-4 transition-all", paymentMethod === 'KHALTI' ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white hover:border-slate-300")}>
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
                                                    <p className="text-xs text-purple-600 font-medium">You will be redirected to Khalti&apos;s secure payment portal for batch checkout.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div onClick={() => setPaymentMethod('CASH')} className={cn("border-2 rounded-xl p-5 cursor-pointer flex items-center gap-4 transition-all", paymentMethod === 'CASH' ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300")}>
                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", paymentMethod === 'CASH' ? "border-emerald-500" : "border-slate-300")}>
                                            {paymentMethod === 'CASH' && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900">Cash on Delivery</h4>
                                            <p className="text-sm text-slate-500 mt-1">Pay for all booked services after they are completed.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Review your Batch Checkout</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto">
                                    <div className="bg-white p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 relative">
                                        <div className="absolute top-0 right-0 p-3">
                                            <span className="bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-bl-xl rounded-tr-xl">User Account</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <User className="w-5 h-5 text-sky-500" /> Customer Data
                                        </h3>
                                        <div className="space-y-4">
                                            <div><p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Name</p><p className="font-medium text-slate-800 text-lg">{contactName}</p></div><Separator />
                                            <div><p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email</p><p className="font-medium text-slate-800">{contactEmail}</p></div><Separator />
                                            <div><p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone</p><p className="font-medium text-slate-800">{contactPhone}</p></div><Separator />
                                            <div><p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Address</p><p className="font-medium text-slate-800">{contactAddress}</p></div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 md:p-8 relative">
                                        <div className="absolute top-0 right-0 p-3">
                                            <span className="bg-sky-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-bl-xl rounded-tr-xl">Cart Summary</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-indigo-500" /> Administrative Invoice
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Items List</p>
                                                <ul className="list-disc pl-5 mt-1 text-sm text-indigo-700 font-medium">
                                                    {items.map((i, idx) => (
                                                        <li key={idx}> {i.serviceName} (x{i.quantity}) </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-slate-100">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Schedule</p>
                                                    <p className="font-medium text-sm leading-tight text-sky-700">
                                                        {bookingDate ? formatBookingDate(bookingDate, "MMM d, yyyy") : ""} <br />
                                                        {bookingTime && (function () { const [h, m] = bookingTime.split(":"); const d = new Date(); d.setHours(Number(h), Number(m)); return format(d, "h:mm a"); })()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Total</p>
                                                    <p className="font-bold text-emerald-600 text-xl">{displayPrice}</p>
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

                        {step === 4 && (
                            <div className="py-12 px-4 text-center animate-in zoom-in-95 duration-700">
                                {isVerifyingPayment && (
                                    <div>
                                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-purple-50">
                                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Verifying Payment...</h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto">Please wait while we confirm your payment with Khalti.</p>
                                    </div>
                                )}

                                {!isVerifyingPayment && paymentError && !bookingResult && (
                                    <div>
                                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50"><XCircle className="w-12 h-12 text-red-500" /></div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Payment Issue</h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">{paymentError}</p>
                                        <div className="flex gap-3 justify-center">
                                            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => { setPaymentError(null); setStep(3); window.history.replaceState({}, "", `/cart/checkout`) }}>Try Again</Button>
                                            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 rounded-full px-8" onClick={() => router.push('/')}>Go Home</Button>
                                        </div>
                                    </div>
                                )}

                                {!isVerifyingPayment && bookingResult && (
                                    <div>
                                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50"><CheckCircle className="w-12 h-12 text-emerald-500" /></div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Batch Checkout Confirmed!</h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto">All of your selected services have been successfully booked. Our technicians have been notified.</p>
                                        <div className="flex mt-8 gap-4 justify-center">
                                            <Button onClick={() => router.push("/user/my-bookings")} className="bg-[#2baba8] hover:bg-[#238b89]">View My Bookings</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {step < 4 && (
                        <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                            <Button variant="ghost" className="text-slate-500 hover:text-slate-800 font-medium" onClick={() => (step === 1 ? router.push("/cart") : setStep(s => s - 1))} disabled={isSubmitting}>
                                {step === 1 ? "Cancel" : "Back"}
                            </Button>
                            <Button className="bg-[#2baba8] hover:bg-[#238b89] text-white px-8 rounded-full shadow-md hover:shadow-lg transition-all font-semibold" onClick={step < 3 ? handleNextStep : handleConfirmBooking} disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : step === 3 ? "Confirm & Pay" : "Continue"}
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default function BatchCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                </div>
            </div>
        }>
            <BatchCheckoutContent />
        </Suspense>
    )
}
