"use client";

import { useGetMyBookings, useCancelBooking } from "@/src/hooks/useBookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, ChevronRight, Clock, UserCheck, XCircle, Loader2, Package } from "lucide-react";
import { format } from "date-fns";
import { formatBookingDate } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { BarChart3, Activity, CheckCircle } from "lucide-react";
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

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ASSIGNED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pending",
    ASSIGNED: "Technician Assigned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
    );
}

export default function MyBookingsPage() {
    const { data: bookings = [], isLoading } = useGetMyBookings();
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
    const [cancelTarget, setCancelTarget] = useState<string | null>(null);

    const stats = {
        total: bookings.length,
        active: bookings.filter((b: any) => ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(b.status)).length,
        completed: bookings.filter((b: any) => b.status === "COMPLETED").length,
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Bookings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track all your service appointments</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    {
                        label: "Total",
                        value: stats.total,
                        icon: BarChart3,
                        bg: "from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900",
                        text: "text-slate-700 dark:text-slate-200",
                        iconColor: "text-slate-500",
                    },
                    {
                        label: "Active",
                        value: stats.active,
                        icon: Activity,
                        bg: "from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/10",
                        text: "text-blue-700 dark:text-blue-300",
                        iconColor: "text-blue-500",
                    },
                    {
                        label: "Completed",
                        value: stats.completed,
                        icon: CheckCircle,
                        bg: "from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/10",
                        text: "text-emerald-700 dark:text-emerald-300",
                        iconColor: "text-emerald-500",
                    },
                ].map((s) => {
                    const Icon = s.icon;

                    return (
                        <Card
                            key={s.label}
                            className={`rounded-2xl border border-slate-200 dark:border-slate-800 
        bg-gradient-to-br ${s.bg} shadow-md hover:shadow-xl 
        transition-all duration-300 hover:-translate-y-1`}
                        >
                            <CardContent className="p-5 flex items-center justify-between">

                                {/* Left Content */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {s.label}
                                    </p>

                                    <p className={`font-bold text-2xl transition mt-1 ${s.text}`}>
                                        {s.value}
                                    </p>
                                </div>

                                {/* Icon */}
                                <div
                                    className={`h-12 w-12 flex items-center justify-center rounded-xl 
            bg-white/60 dark:bg-slate-800/60 shadow-inner`}
                                >
                                    <Icon className={`h-6 w-6 ${s.iconColor}`} />
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Bookings List */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200">All Bookings</CardTitle>
                        <Badge className=" text-white text-xs">{bookings.length} total</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                            <Package className="h-12 w-12 opacity-30" />
                            <p className="font-medium">No bookings yet</p>
                            <p className="text-sm">Book a service to get started</p>
                        </div>
                    ) : (
                        bookings.map((b: any) => {
                            const d = new Date(b.scheduledDate);
                            const status = b.status as string;
                            const techName = b.technicians?.[0]
                                ? `${b.technicians[0].user?.firstName || b.technicians[0].firstName || ""} ${b.technicians[0].user?.lastName || b.technicians[0].lastName || ""}`.trim()
                                : null;
                            const techAvatar = b.technicians?.[0]?.user?.avatar || b.technicians?.[0]?.profilePicture;
                            const canCancel = ["PENDING", "ASSIGNED"].includes(status);

                            return (
                                <div
                                    key={b.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-10 w-10 rounded-full bg-[#0077b6]/10 flex items-center justify-center text-[#0077b6] font-bold text-xs shrink-0">
                                            {b.id.substring(0, 3).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {b.service?.name || "Unknown Service"}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                                                    {b.service?.category?.name || "General"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                                    {formatBookingDate(d, "MMM d, yyyy")}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                    {format(d, "hh:mm a")}
                                                </span>
                                                {techName && (
                                                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                                                        {techAvatar ? (
                                                            <img
                                                                src={techAvatar}
                                                                alt={techName}
                                                                className="h-4 w-4 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserCheck className="h-3.5 w-3.5" />
                                                        )}
                                                        {techName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:justify-end shrink-0">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.PENDING}`}>
                                            {STATUS_LABELS[status] || status}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Rs. {b.service?.price ?? "—"}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {canCancel && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                                    onClick={() => setCancelTarget(b.id)}
                                                >
                                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                                    Cancel
                                                </Button>
                                            )}
                                            <Link href={`/user/my-bookings/${b.id}`}>
                                                <Button size="sm" variant="outline" className="text-xs gap-1 hover:bg-[#236b9d] hover:text-white">
                                                    Details
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. Your booking will be marked as cancelled.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isCancelling}
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={() => {
                                if (cancelTarget) {
                                    cancelBooking(cancelTarget);
                                    setCancelTarget(null);
                                }
                            }}
                        >
                            {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Yes, Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
