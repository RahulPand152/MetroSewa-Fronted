"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetJobById, useAcceptJob, useCompleteJob } from "@/src/hooks/useTechnician";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft, Calendar, Clock, MapPin, User, Phone,
    Receipt, CheckCircle2, Circle, Loader2, Briefcase, Mail
} from "lucide-react";
import { format } from "date-fns";
import { formatBookingDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
import { useState } from "react";

const TIMELINE_STEPS = [
    { key: "PENDING", label: "Booking Placed", desc: "User has placed the initial request", color: "bg-amber-500 border-amber-500 text-white", ring: "ring-amber-500/20", activeText: "text-amber-600" },
    { key: "ASSIGNED", label: "Assigned", desc: "Job assigned to you", color: "bg-blue-500 border-blue-500 text-white", ring: "ring-blue-500/20", activeText: "text-blue-600" },
    { key: "IN_PROGRESS", label: "Work In Progress", desc: "You are currently working on this", color: "bg-indigo-500 border-indigo-500 text-white", ring: "ring-indigo-500/20", activeText: "text-indigo-600" },
    { key: "COMPLETED", label: "Completed", desc: "Service completed successfully", color: "bg-emerald-500 border-emerald-500 text-white", ring: "ring-emerald-500/20", activeText: "text-emerald-600" },
];
const STEP_ORDER = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];

const STATUS_BADGE: Record<string, string> = {
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

function InfoRow({ label, value, icon: Icon, isBold = false, iconColor }: { label: string; value: string; icon: any; isBold?: boolean; iconColor?: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center shrink-0">
                <Icon className={`h-5 w-5 ${iconColor || "text-[#236b9d]"}`} />
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className={`text-sm ${isBold ? 'font-bold text-[#236b9d]' : 'font-medium text-slate-800 dark:text-slate-200'}`}>{value}</p>
            </div>
        </div>
    );
}

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: job, isLoading } = useGetJobById(id);
    const { mutate: acceptJob, isPending: isAccepting } = useAcceptJob();
    const { mutate: completeJob, isPending: isCompleting } = useCompleteJob();

    const [actionDialog, setActionDialog] = useState<"accept" | "complete" | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32 flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#236b9d]" />
                <p className="text-slate-500 font-medium">Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Briefcase className="h-16 w-16 text-slate-200" />
                <p className="text-lg font-semibold text-slate-600">Job not found</p>
                <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
        );
    }

    const status = job.status as string;
    const isCancelled = status === "CANCELLED";
    const currentStepIdx = isCancelled ? -1 : STEP_ORDER.indexOf(status);
    const d = new Date(job.scheduledDate);

    const isPendingAct = isAccepting || isCompleting;

    const handleAction = () => {
        if (actionDialog === "accept") {
            acceptJob(id, { onSuccess: () => setActionDialog(null) });
        } else if (actionDialog === "complete") {
            completeJob(id, { onSuccess: () => setActionDialog(null) });
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
            {/* Nav */}
            <Button variant="ghost" size="sm" className="self-start gap-2 -ml-2 text-slate-500 hover:text-slate-800" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" /> Back to My Jobs
            </Button>

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 
bg-white/80 dark:bg-slate-900/60 backdrop-blur shadow-lg p-6 md:p-8 
flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#236b9d]/10 to-transparent rounded-bl-[120px] -z-0" />

                {/* LEFT CONTENT */}
                <div className="z-10 space-y-2 max-w-xl">

                    {/* Status Badge */}
                    <span
                        className={`inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-wider 
      px-3 py-1 rounded-full border shadow-sm backdrop-blur
      ${STATUS_BADGE[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                    >
                        {status.replace("_", " ")}
                    </span>

                    {/* Title */}
                    <h1 className="text-md sm:text-lg md:text-xl lg:text-2xl 
    font-bold transition text-slate-900 dark:text-white leading-tight">
                        {job.service?.name}
                    </h1>

                    {/* Category */}
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
                        {job.service?.category?.name || " "}
                    </p>

                </div>

                {/* RIGHT ACTIONS */}
                <div className="z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                    {status === "ASSIGNED" && (
                        <Button
                            className="w-full sm:w-auto h-11 px-5 text-sm sm:text-base font-semibold 
        bg-gradient-to-r from-[#236b9d] to-[#1a5279] text-white 
        shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={() => setActionDialog("accept")}
                        >
                            Accept & Start Job
                        </Button>
                    )}

                    {status === "IN_PROGRESS" && (
                        <Button
                            className="w-full sm:w-auto h-11 px-5 text-sm sm:text-base font-semibold 
        bg-gradient-to-r from-emerald-600 to-emerald-700 text-white 
        shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={() => setActionDialog("complete")}
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Mark Completed
                        </Button>
                    )}

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Col: Customer & Task Info */}
                <div className="flex flex-col gap-6">

                    {/* Customer Card */}
                    <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-500" /> Customer Details
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                                    {job.user?.firstName || job.customer?.firstName || job.firstName}{" "}
                                    {job.user?.lastName || job.customer?.lastName || job.lastName || ""}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex gap-3">
                                    <Phone className="h-5 w-5 text-green-500 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200 mt-0.5">
                                            {job.user?.phoneNumber || job.customer?.phoneNumber || job.phoneNumber || "Not provided"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200 mt-0.5 truncate max-w-[160px]" title={job.user?.email || job.customer?.email}>
                                            {job.user?.email || job.customer?.email || job.email || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex gap-3">
                                <MapPin className="h-5 w-5 text-rose-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Service Address</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-200 mt-1 leading-relaxed">
                                        {job.address || job.user?.address || job.customer?.address || "No address provided"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Instructions */}
                    <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-purple-500" /> Task Instructions
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl">
                            {job.description || "No specific instructions provided by the customer."}
                        </p>
                    </div>
                </div>

                {/* Right Col: Timeline & Payment */}
                <div className="flex flex-col gap-6">

                    {/* Schedule & Payment */}
                    <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" /> Schedule & Payment
                        </h2>
                        <div className="space-y-4">
                            <InfoRow icon={Calendar} label="Date" value={formatBookingDate(d, "EEEE, MMMM d, yyyy")} iconColor="text-blue-500" />
                            <InfoRow icon={Clock} label="Time" value={format(d, "hh:mm a")} iconColor="text-amber-500" />
                            <InfoRow icon={Receipt} label="Service Pay Amount" value={`Rs. ${job.service?.price}`} iconColor="text-emerald-500" isBold />

                            <div className="mt-2 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col gap-1">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Payment Status</span>
                                <span className="font-semibold text-emerald-900">
                                    {job.payment?.status === "PAID" ? "Paid Online (Khalti)" : "Collect Cash on Delivery"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Status Timeline</h2>
                        {!isCancelled ? (
                            <div className="relative">
                                <div className="absolute left-5 top-2 bottom-5 w-0.5 bg-gradient-to-b from-[#236b9d] to-transparent" />
                                <div className="space-y-8">
                                    {TIMELINE_STEPS.map((step, i) => {
                                        const isDone = i <= currentStepIdx;
                                        const isCurrent = i === currentStepIdx;
                                        return (
                                            <div key={step.key} className="relative flex items-start gap-5 pl-[48px]">
                                                <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all shadow-md
                    ${isDone ? step.color : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"}
                    ${isCurrent ? `ring-4 ${step.ring}` : ""}`}
                                                >
                                                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 w-full">
                                                    <p className={`font-semibold ${isDone ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                                                        {step.label}
                                                        {isCurrent && <span className={`ml-2 text-xs font-medium ${step.activeText}`}>(Current)</span>}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{step.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-700 rounded-xl">
                                <p className="font-bold text-rose-700 dark:text-rose-400">Booking Cancelled</p>
                                <p className="text-sm text-rose-600 dark:text-rose-200 mt-1">This job has been cancelled.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Accept / Complete Dialog */}
            <AlertDialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionDialog === "accept" ? "Accept this Job?" : "Complete this Job?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog === "accept"
                                ? "This will notify the customer that you are on your way / have started the work."
                                : "Marking this complete means the work is fully finished. Make sure you collected payment if it was Cash on Delivery."
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPendingAct}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isPendingAct}
                            className={actionDialog === "accept" ? "bg-[#236b9d] hover:bg-[#1a5279]" : "bg-emerald-600 hover:bg-emerald-700"}
                            onClick={(e) => {
                                e.preventDefault(); // Prevent default dialog close to show loading
                                handleAction();
                            }}
                        >
                            {isPendingAct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {actionDialog === "accept" ? "Yes, Accept" : "Yes, Complete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
