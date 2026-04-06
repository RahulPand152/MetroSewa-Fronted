"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetBookingById, useCancelBooking, useSubmitReview } from "@/src/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft, Calendar, Clock, Briefcase, User, Phone,
    Receipt, CheckCircle2, Circle, Loader2, XCircle, UserCheck,
    AlertTriangle, Star
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TIMELINE_STEPS = [
    { key: "PENDING", label: "Booking Placed", desc: "Your request has been received" },
    { key: "ASSIGNED", label: "Technician Assigned", desc: "A technician has been assigned" },
    { key: "IN_PROGRESS", label: "Work In Progress", desc: "The technician is on the job" },
    { key: "COMPLETED", label: "Completed", desc: "Service completed successfully" },
];

const STEP_ORDER = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];

const STATUS_BADGE: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-[#0077b6]" />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

export default function BookingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: booking, isLoading } = useGetBookingById(id);
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
    const { mutate: submitReview, isPending: isSubmittingReview } = useSubmitReview();
    const [cancelOpen, setCancelOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#0077b6]" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <AlertTriangle className="h-12 w-12 text-rose-400" />
                <p className="text-lg font-semibold text-slate-700">Booking not found</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const status = booking.status as string;
    const isCancelled = status === "CANCELLED";
    const currentStepIdx = isCancelled ? -1 : STEP_ORDER.indexOf(status);
    const canCancel = ["PENDING", "ASSIGNED"].includes(status);
    const techName = booking.technicians?.[0]
        ? `${booking.technicians[0].user?.firstName || booking.technicians[0].firstName || ""} ${booking.technicians[0].user?.lastName || booking.technicians[0].lastName || ""}`.trim()
        : null;
    const techPhone = booking.technicians?.[0]?.user?.phoneNumber || booking.technicians?.[0]?.phoneNumber;
    const techAvatar = booking.technicians?.[0]?.user?.avatar || booking.technicians?.[0]?.profilePicture;
    const techRating = booking.technicians?.[0]?.rating;
    const d = new Date(booking.scheduledDate);

    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            {/* Back */}
            <Button variant="ghost" size="sm" className="self-start gap-2 -ml-1 text-slate-500" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" /> Back to Bookings
            </Button>

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Booking ID</p>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{booking.id}</p>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{booking.service?.name}</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{booking.service?.category?.name || "General"}</p>
                    </div>
                    <span className={`text-sm font-semibold px-4 py-1.5 rounded-full border ${STATUS_BADGE[status] || STATUS_BADGE.PENDING}`}>
                        {status?.replace("_", " ")}
                    </span>
                </div>

                <Separator className="my-5" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow icon={Calendar} label="Scheduled Date" value={format(d, "EEEE, MMMM d, yyyy")} />
                    <InfoRow icon={Clock} label="Scheduled Time" value={format(d, "hh:mm a")} />
                    <InfoRow icon={Receipt} label="Service Price" value={`Rs. ${booking.service?.price ?? "N/A"}`} />
                    <InfoRow
                        icon={Receipt}
                        label="Payment Status"
                        value={booking.payment?.status === "PAID" ? "Paid (Khalti)" : booking.payment?.paymentMethod === "COD" ? "Cash on Delivery" : "Pending"}
                    />
                </div>

                {booking.description && (
                    <>
                        <Separator className="my-5" />
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" /> Issue Description
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{booking.description}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Status Timeline */}
            {!isCancelled ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-5">Status Timeline</h2>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                        <div className="space-y-6">
                            {TIMELINE_STEPS.map((step, i) => {
                                const isDone = i <= currentStepIdx;
                                const isCurrent = i === currentStepIdx;
                                return (
                                    <div key={step.key} className="relative flex items-start gap-4 pl-10">
                                        <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all
                                            ${isDone
                                                ? "bg-[#0077b6] border-[#0077b6] text-white"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"
                                            } ${isCurrent ? "ring-4 ring-[#0077b6]/20" : ""}`}
                                        >
                                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                        </div>
                                        <div className="pb-1">
                                            <p className={`text-sm font-semibold ${isDone ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                                                {step.label}
                                                {isCurrent && <span className="ml-2 text-xs text-[#0077b6] font-medium">(Current)</span>}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 p-6 flex items-center gap-4">
                    <XCircle className="h-8 w-8 text-rose-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-rose-700 dark:text-rose-400">Booking Cancelled</p>
                        <p className="text-sm text-rose-500 mt-0.5">This booking has been cancelled.</p>
                    </div>
                </div>
            )}

            {/* Technician Card */}
            {techName && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4">Assigned Technician</h2>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-[#0077b6] pl-4">
                        <div className="flex items-center gap-4">
                            {techAvatar ? (
                                <img
                                    src={techAvatar}
                                    alt={techName}
                                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#0077b6]/20"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-[#0077b6]/10 flex items-center justify-center ring-2 ring-[#0077b6]/20">
                                    <UserCheck className="h-6 w-6 text-[#0077b6]" />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-base text-slate-900 dark:text-slate-100">{techName}</p>
                                {techPhone ? (
                                    <a href={`tel:${techPhone}`} className="text-sm font-medium text-slate-500 hover:text-[#0077b6] flex items-center gap-1.5 mt-1 transition-colors">
                                        <Phone className="h-3.5 w-3.5" />
                                        {techPhone}
                                    </a>
                                ) : (
                                    <p className="text-sm text-slate-400 mt-1 italic">Phone number not available</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800/50">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold">
                                {typeof techRating === 'number' ? techRating.toFixed(1) : "New"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            {canCancel && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-2"
                        onClick={() => setCancelOpen(true)}
                    >
                        <XCircle className="h-4 w-4" /> Cancel Booking
                    </Button>
                </div>
            )}

            {/* Leave Review if Completed */}
            {status === "COMPLETED" && !booking.reviews?.length && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300 mb-1">Leave a Review</h2>
                    <p className="text-xs text-amber-600/70 mb-4">Tap a star to rate — description is optional</p>
                    {/* Stars */}
                    <div className="flex items-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-9 w-9 cursor-pointer transition-all duration-150 ${star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400 scale-110" : "text-amber-200 dark:text-slate-600"}`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            />
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 text-sm font-semibold text-amber-700">
                                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                            </span>
                        )}
                    </div>
                    {/* Optional comment - only shows after star selected */}
                    {/* {rating > 0 && (
                        <textarea
                            className="w-full h-24 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 p-3 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all resize-none mb-4"
                            placeholder="Share your experience (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    )} */}
                    {/* Submit - visible as soon as any star is chosen */}
                    <div className="flex justify-end">
                        <Button
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                            disabled={rating === 0 || isSubmittingReview}
                            onClick={() => submitReview({ bookingId: id, rating, comment, serviceId: booking.serviceId })}
                        >
                            {isSubmittingReview && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Submit Review
                        </Button>
                    </div>
                </div>
            )}

            {/* Show Existing Review */}
            {status === "COMPLETED" && booking.reviews?.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4">Your Review</h2>
                    <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${star <= booking.reviews[0].rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                            />
                        ))}
                    </div>
                    {booking.reviews[0].comment && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{booking.reviews[0].comment}"</p>
                    )}
                </div>
            )}

            {/* Cancel Confirm */}
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone. The booking will be marked as cancelled.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep It</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-rose-600 hover:bg-rose-700"
                            disabled={isCancelling}
                            onClick={() => {
                                cancelBooking(id);
                                setCancelOpen(false);
                                router.push("/user/my-bookings");
                            }}
                        >
                            {isCancelling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Yes, Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
