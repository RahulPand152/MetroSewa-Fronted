"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetAdminBookingById, useGetBookings, useGetTechnicians, useAssignTechnician, useUpdateBookingStatus } from "@/src/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft, BadgeCheck, Calendar, Clock, Briefcase, User, Phone,
    Receipt, Loader2, AlertTriangle, MapPin, Wrench, Star
} from "lucide-react";
import { format } from "date-fns";
import { formatBookingDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type TechnicianRecord = {
    id: string;
    profilePicture?: string | null;
    experience?: number | null;
    rating?: number | null;
    isAvailable?: boolean;
    isApproved?: boolean;
    createdAt?: string;
    skills?: string | null;
    expertise?: string | null;
    acceptanceRate?: number | null;
    acceptedAssignments?: number | null;
    rejectedAssignments?: number | null;
    maxActiveJobs?: number | null;
    activeJobLimit?: number | null;
    jobLimit?: number | null;
    status?: string | null;
    isOffline?: boolean;
    isSuspended?: boolean;
    onLeave?: boolean;
    user?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string | null;
        avatar?: string | null;
        address?: string | null;
        status?: string | null;
    };
};

type RankedTechnician = TechnicianRecord & {
    activeJobs: number;
    activeJobLimit: number;
    acceptanceRateValue: number;
    recommendationScore: number;
    recommendationReasons: string[];
    availabilityLabel: string;
    availabilityTone: string;
    isRecommended: boolean;
    isFullyOccupied: boolean;
    workloadLabel: string;
    workloadTone: string;
    ratingValue: number;
    experienceYears: number;
};

type BookingTechnicianRef = {
    id?: string;
    userId?: string;
    user?: {
        id?: string;
    };
};

type BookingSummary = {
    id?: string;
    status?: string;
    scheduledDate?: string;
    description?: string;
    address?: string;
    quantity?: number;
    assignedByAdmin?: boolean;
    createdAt?: string;
    updatedAt?: string;
    technicians?: BookingTechnicianRef[];
    service?: {
        id?: string;
        name?: string;
        price?: number;
        duration?: number;
        durationUnit?: string;
        category?: {
            id?: string;
            name?: string;
        };
    };
    user?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string | null;
        avatar?: string | null;
        address?: string | null;
    };
    payment?: {
        id?: string;
        status?: string;
        amount?: number;
        paymentMethod?: string;
        transactionId?: string | null;
    };
};

const ACTIVE_BOOKING_STATUSES = new Set(["PENDING", "ASSIGNED", "IN_PROGRESS"]);

function normalizeText(value?: string | null) {
    return (value || "").toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(value: number, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function getTechnicianName(technician: TechnicianRecord) {
    return `${technician.user?.firstName || ""} ${technician.user?.lastName || ""}`.trim() || "Unknown Technician";
}

function getTechnicianSkillText(technician: TechnicianRecord) {
    return technician.skills || technician.expertise?.replace(/_/g, " ") || "-";
}

function getActiveJobLimit(technician: TechnicianRecord) {
    const limit = technician.maxActiveJobs ?? technician.activeJobLimit ?? technician.jobLimit;
    return typeof limit === "number" && limit > 0 ? limit : 5;
}

function getWorkloadState(activeJobs: number, activeJobLimit: number) {
    const safeLimit = Math.max(activeJobLimit, 1);
    const ratio = activeJobs / safeLimit;

    if (activeJobs >= safeLimit) {
        return {
            label: "Fully Occupied",
            tone: "bg-rose-100 text-rose-700 border-rose-200",
            isFullyOccupied: true,
        };
    }

    if (ratio < 0.34) {
        return {
            label: "Low",
            tone: "bg-emerald-100 text-emerald-700 border-emerald-200",
            isFullyOccupied: false,
        };
    }

    if (ratio < 0.67) {
        return {
            label: "Medium",
            tone: "bg-amber-100 text-amber-700 border-amber-200",
            isFullyOccupied: false,
        };
    }

    return {
        label: "High",
        tone: "bg-orange-100 text-orange-700 border-orange-200",
        isFullyOccupied: false,
    };
}

function getAvailabilityScore(label: string) {
    if (label === "Available") return 100;
    if (label === "Busy") return 80;
    return 0;
}

function getAccountEligibility(technician: TechnicianRecord) {
    const statusText = normalizeText(technician.status || technician.user?.status);

    if (technician.isSuspended || statusText.includes("suspend") || statusText.includes("blocked") || statusText.includes("disabled")) {
        return false;
    }
    if (technician.onLeave || statusText.includes("leave")) {
        return false;
    }
    if (technician.isOffline || statusText.includes("offline")) {
        return false;
    }

    if (!statusText) {
        return Boolean(technician.isApproved);
    }

    if (statusText.includes("active") || statusText.includes("available") || statusText.includes("online") || statusText.includes("busy")) {
        return Boolean(technician.isApproved);
    }

    return Boolean(technician.isApproved) && !statusText.includes("inactive") && !statusText.includes("pending");
}

function getAcceptanceRateValue(technician: TechnicianRecord) {
    if (typeof technician.acceptanceRate === "number") {
        return technician.acceptanceRate > 1 ? technician.acceptanceRate / 100 : technician.acceptanceRate;
    }

    const accepted = typeof technician.acceptedAssignments === "number" ? technician.acceptedAssignments : 0;
    const rejected = typeof technician.rejectedAssignments === "number" ? technician.rejectedAssignments : 0;
    const total = accepted + rejected;

    if (total > 0) {
        return accepted / total;
    }

    return 0.5;
}

function getAvailabilityState(technician: TechnicianRecord) {
    const statusText = normalizeText(technician.status || technician.user?.status);

    if (technician.isSuspended || statusText.includes("suspend")) {
        return { label: "Suspended", tone: "bg-rose-100 text-rose-700 border-rose-200" };
    }
    if (technician.onLeave || statusText.includes("leave")) {
        return { label: "On Leave", tone: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    if (technician.isOffline || statusText.includes("offline")) {
        return { label: "Offline", tone: "bg-slate-100 text-slate-700 border-slate-200" };
    }
    if (!technician.isAvailable || statusText.includes("busy") || statusText.includes("job")) {
        return { label: "Busy", tone: "bg-blue-100 text-blue-700 border-blue-200" };
    }

    return { label: "Available", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

function matchesRequiredSkill(technician: TechnicianRecord, requiredSkill: string) {
    if (!requiredSkill) return true;

    const skillText = normalizeText([technician.skills, technician.expertise].filter(Boolean).join(" "));
    if (!skillText) return false;

    const requiredTokens = requiredSkill.split(" ").filter((token) => token.length > 2);
    return (
        skillText.includes(requiredSkill) ||
        requiredSkill.includes(skillText) ||
        requiredTokens.some((token) => skillText.includes(token))
    );
}

const STATUS_BADGE: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

export default function AdminBookingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: booking, isLoading: isBookingLoading, isError: isBookingError } = useGetAdminBookingById(id);
    const { data: allBookings = [] } = useGetBookings();
    const { data: technicians, isLoading: isTechsLoading } = useGetTechnicians();

    const { mutate: assignTechnician, isPending: isAssigning } = useAssignTechnician();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBookingStatus();

    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [sortMode, setSortMode] = useState<"recommended" | "rating" | "experience" | "workload" | "acceptance">("recommended");
    const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available">("all");
    const [assignmentLocked, setAssignmentLocked] = useState(false);

    const d = booking?.scheduledDate ? new Date(booking.scheduledDate) : new Date();
    const status = (booking?.status || "UNKNOWN").toUpperCase();
    const requiredSkill = normalizeText(booking?.service?.category?.name || booking?.service?.name || "");

    const activeJobsByTechnician = useMemo(() => {
        const counts: Record<string, number> = {};

        (Array.isArray(allBookings) ? allBookings : []).forEach((bookingItem: BookingSummary) => {
            const bookingStatus = (bookingItem.status || "").toUpperCase();
            if (!ACTIVE_BOOKING_STATUSES.has(bookingStatus) || bookingItem.id === booking?.id) {
                return;
            }

            (bookingItem.technicians || []).forEach((technician: BookingTechnicianRef) => {
                const technicianId = technician?.id || technician?.userId || technician?.user?.id;
                if (!technicianId) return;
                counts[technicianId] = (counts[technicianId] || 0) + 1;
            });
        });

        return counts;
    }, [allBookings, booking?.id]);

    const rankedTechnicians = useMemo(() => {
        const rawTechnicians = Array.isArray(technicians) ? (technicians as TechnicianRecord[]) : [];

        const eligible = rawTechnicians
            .filter((technician) => {
                const availability = getAvailabilityState(technician);
                const activeJobs = activeJobsByTechnician[technician.id] || 0;
                const activeJobLimit = getActiveJobLimit(technician);
                const workloadState = getWorkloadState(activeJobs, activeJobLimit);

                return (
                    getAccountEligibility(technician) &&
                    matchesRequiredSkill(technician, requiredSkill) &&
                    !["Offline", "On Leave", "Suspended"].includes(availability.label) &&
                    !workloadState.isFullyOccupied
                );
            })
            .map((technician) => {
                const experienceYears = technician.experience || 0;
                const ratingValue = clamp((technician.rating || 0) / 5 * 100);
                const acceptanceRateValue = getAcceptanceRateValue(technician);
                const activeJobs = activeJobsByTechnician[technician.id] || 0;
                const activeJobLimit = getActiveJobLimit(technician);
                const availability = getAvailabilityState(technician);
                const workloadState = getWorkloadState(activeJobs, activeJobLimit);

                return {
                    ...technician,
                    activeJobs,
                    activeJobLimit,
                    ratingValue,
                    experienceYears,
                    acceptanceRateValue,
                    availabilityLabel: availability.label,
                    availabilityTone: availability.tone,
                    workloadLabel: workloadState.label,
                    workloadTone: workloadState.tone,
                    isFullyOccupied: workloadState.isFullyOccupied,
                } as RankedTechnician;
            });

        if (eligible.length === 0) {
            return [] as RankedTechnician[];
        }

        const maxExperience = Math.max(...eligible.map((technician) => technician.experienceYears), 0);
        const maxAcceptance = Math.max(...eligible.map((technician) => technician.acceptanceRateValue), 0);

        const scored = eligible.map((technician) => {
            const experienceScore = maxExperience === 0 ? 0 : (technician.experienceYears / maxExperience) * 100;
            const workloadScore = clamp(((technician.activeJobLimit - technician.activeJobs) / technician.activeJobLimit) * 100);
            const acceptanceScore = maxAcceptance === 0 ? 0 : (technician.acceptanceRateValue / maxAcceptance) * 100;
            const availabilityScore = getAvailabilityScore(technician.availabilityLabel);

            const recommendationScore =
                (0.4 * technician.ratingValue) +
                (0.2 * experienceScore) +
                (0.2 * workloadScore) +
                (0.1 * acceptanceScore) +
                (0.1 * availabilityScore);

            const highestRating = Math.max(...eligible.map((candidate) => candidate.ratingValue));
            const highestExperience = Math.max(...eligible.map((candidate) => candidate.experienceYears));
            const lowestWorkload = Math.min(...eligible.map((candidate) => candidate.activeJobs));
            const highestAcceptance = Math.max(...eligible.map((candidate) => candidate.acceptanceRateValue));

            const reasons = [
                technician.ratingValue === highestRating ? "Highest Rating" : null,
                technician.experienceYears === highestExperience ? "Most Experienced" : null,
                technician.activeJobs === lowestWorkload ? "Least Workload" : null,
                technician.acceptanceRateValue === highestAcceptance ? "Best Acceptance" : null,
                technician.workloadLabel === "Low" ? "Low Workload" : null,
            ].filter(Boolean) as string[];

            return {
                ...technician,
                recommendationScore,
                recommendationReasons: reasons.slice(0, 3),
            } as RankedTechnician;
        });

        const sorted = [...scored].sort((a, b) => {
            if (sortMode === "rating") return b.ratingValue - a.ratingValue;
            if (sortMode === "experience") return b.experienceYears - a.experienceYears;
            if (sortMode === "workload") return a.activeJobs - b.activeJobs;
            if (sortMode === "acceptance") return b.acceptanceRateValue - a.acceptanceRateValue;
            return b.recommendationScore - a.recommendationScore;
        });

        const filteredByAvailability = availabilityFilter === "available"
            ? sorted.filter((technician) => technician.availabilityLabel === "Available")
            : sorted;

        const topScore = filteredByAvailability[0]?.recommendationScore ?? 0;
        return filteredByAvailability.map((technician) => ({
            ...technician,
            isRecommended: Math.round(technician.recommendationScore) === Math.round(topScore),
        }));
    }, [activeJobsByTechnician, availabilityFilter, requiredSkill, sortMode, technicians]);

    if (isBookingLoading || isTechsLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isBookingError || !booking) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <AlertTriangle className="h-12 w-12 text-rose-400" />
                <p className="text-lg font-semibold text-slate-700">Booking not found or an error occurred</p>
                <Button variant="outline" onClick={() => router.push("/admin/bookings")}>Back to Bookings</Button>
            </div>
        );
    }

    const handleAssign = (technicianId: string) => {
        if (assignmentDisabled) {
            toast.info("This booking already has an assigned technician.");
            return;
        }

        assignTechnician(
            { bookingId: id, technicianId },
            {
                onSuccess: () => {
                    setAssignmentLocked(true);
                },
            },
        );
    };

    const handleStatusUpdate = () => {
        if (!selectedStatus) {
            toast.error("Please select a status first");
            return;
        }
        updateStatus({ id, status: selectedStatus });
    };

    // The assigned technician info - assumes booking.technicians is an array
    const assignedTech = booking.technicians && booking.technicians.length > 0 ? booking.technicians[0] : null;
    const techName = assignedTech ? `${assignedTech.user?.firstName || ''} ${assignedTech.user?.lastName || ''}`.trim() : null;
    const bookingAlreadyAssigned = Boolean(assignedTech || status === "ASSIGNED" || status === "IN_PROGRESS");
    const assignmentDisabled = assignmentLocked || bookingAlreadyAssigned;

    const customerName = `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim();

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
            <Button variant="ghost" size="sm" className="self-start gap-2 -ml-1 text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" /> Back to Bookings
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1">
                                        Booking ID: <span className="font-mono text-slate-600">{booking.id.slice(0, 8).toUpperCase()}</span>
                                    </p>
                                    <h1 className="text-2xl font-bold text-slate-900 mt-1">{booking.service?.name || 'Unknown Service'}</h1>
                                    <p className="text-sm text-slate-500 mt-1">Category: {booking.service?.category?.name || "General"}</p>
                                </div>
                                <span className={`text-sm font-semibold px-4 py-1.5 rounded-full border ${STATUS_BADGE[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                    {status.replace("_", " ")}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-5" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                <InfoRow icon={User} label="Customer Name" value={customerName || 'N/A'} />
                                <InfoRow icon={Phone} label="Customer Contact" value={booking.user?.phoneNumber || 'N/A'} />
                                <InfoRow icon={MapPin} label="Service Address" value={booking.address || booking.user?.address || 'N/A'} />
                                <InfoRow icon={Calendar} label="Scheduled Date" value={booking.scheduledDate ? formatBookingDate(d, "EEEE, MMMM d, yyyy") : 'N/A'} />
                                <InfoRow icon={Clock} label="Scheduled Time" value={booking.scheduledDate ? format(d, "hh:mm a") : 'N/A'} />
                                <InfoRow icon={Receipt} label="Service Price" value={`NPR ${booking.service?.price || 0}`} />
                            </div>

                            {booking.description && (
                                <>
                                    <Separator className="my-5" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                            <Briefcase className="h-3.5 w-3.5" /> Issue Description
                                        </p>
                                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{booking.description}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Status Update */}
                <div className="flex flex-col gap-6">
                    {status !== "COMPLETED" && (
                        <Card className="rounded-xl border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Update Booking Status</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700">Change Status</label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select new status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="ASSIGNED">Assigned</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleStatusUpdate}
                                        disabled={isUpdatingStatus || !selectedStatus || selectedStatus === status}
                                    >
                                        {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Status
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Bottom Row: Technician Recommendation */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* Assign Technician Card */}
                    <Card className="rounded-xl border-slate-200 shadow-sm border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-primary" /> Technician Recommendation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {techName ? (
                                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Currently Assigned To</p>
                                    <p className="font-bold text-slate-900">{techName}</p>
                                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                        <Phone className="h-3 w-3" /> {assignedTech.user?.phoneNumber || 'No phone'}
                                    </p>
                                    <p className="mt-2 text-xs font-semibold text-emerald-700">Assignment locked for this booking</p>
                                </div>
                            ) : (
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-2">
                                    <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Not Assigned Yet
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Required Skill</p>
                                    <p className="mt-1 text-sm font-medium text-slate-800">{booking.service?.category?.name || booking.service?.name || "Service"}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Eligible Technicians</p>
                                    <p className="mt-1 text-sm font-medium text-slate-800">{rankedTechnicians.length}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Mode</p>
                                    <p className="mt-1 text-sm font-medium text-slate-800">Admin assigns manually</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</label>
                                    <select
                                        value={sortMode}
                                        onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
                                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="recommended">Recommended</option>
                                        <option value="rating">Rating</option>
                                        <option value="experience">Experience</option>
                                        <option value="workload">Workload</option>
                                        <option value="acceptance">Acceptance Rate</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Availability</label>
                                    <select
                                        value={availabilityFilter}
                                        onChange={(e) => setAvailabilityFilter(e.target.value as typeof availabilityFilter)}
                                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="all">All eligible</option>
                                        <option value="available">Available only</option>
                                    </select>
                                </div>
                            </div>

                            {rankedTechnicians.length > 0 && (
                                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white p-4 shadow-sm">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Top Recommendation</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-900">{getTechnicianName(rankedTechnicians[0])}</h3>
                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                    <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                                                    Recommended
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Highest overall fit for this booking based on rating, experience, workload, and acceptance rate.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div className="rounded-xl border border-emerald-100 bg-white p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Score</p>
                                                <p className="mt-1 text-base font-bold text-emerald-700">{Math.round(rankedTechnicians[0].recommendationScore)}</p>
                                            </div>
                                            <div className="rounded-xl border border-emerald-100 bg-white p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Workload</p>
                                                <p className="mt-1 text-base font-bold text-slate-900">{rankedTechnicians[0].activeJobs}</p>
                                            </div>
                                            <div className="rounded-xl border border-emerald-100 bg-white p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Acceptance</p>
                                                <p className="mt-1 text-base font-bold text-slate-900">{Math.round(rankedTechnicians[0].acceptanceRateValue * 100)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                <table className="w-full min-w-[980px] text-sm">
                                    <thead className="sticky top-0 z-10 bg-slate-50">
                                        <tr className="border-b border-slate-200 text-left text-slate-500">
                                            <th className="px-4 py-3 font-semibold">Technician</th>
                                            <th className="px-4 py-3 font-semibold">Skills</th>
                                            <th className="px-4 py-3 font-semibold">Rating</th>
                                            <th className="px-4 py-3 font-semibold">Experience</th>
                                            <th className="px-4 py-3 font-semibold">Active Jobs</th>
                                            <th className="px-4 py-3 font-semibold">Availability</th>
                                            {/* <th className="px-4 py-3 font-semibold">Score</th> */}
                                            <th className="px-4 py-3 font-semibold">Badge</th>
                                            <th className="px-4 py-3 font-semibold text-right">Assign</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {rankedTechnicians.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                                                    No eligible technicians found for this service category.
                                                </td>
                                            </tr>
                                        ) : (
                                            rankedTechnicians.map((technician) => (
                                                <tr
                                                    key={technician.id}
                                                    className={`transition-colors hover:bg-slate-50/70 ${technician.isRecommended ? "bg-emerald-50/80 ring-1 ring-inset ring-emerald-200" : ""} ${technician.isFullyOccupied ? "bg-rose-50/80" : ""}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {technician.user?.avatar || technician.profilePicture ? (
                                                                <img
                                                                    src={technician.user?.avatar || technician.profilePicture || ""}
                                                                    alt={getTechnicianName(technician)}
                                                                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                                    {getTechnicianName(technician).charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <p className="font-semibold text-slate-900">{getTechnicianName(technician)}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                            {getTechnicianSkillText(technician)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1 font-medium text-slate-800">
                                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                            {Number(technician.rating || 0).toFixed(1)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {technician.experienceYears} {technician.experienceYears === 1 ? "Year" : "Years"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {technician.activeJobs} Active Jobs
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${technician.availabilityTone}`}>
                                                            {technician.availabilityLabel}
                                                        </span>
                                                    </td>
                                                    {/* <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-slate-900">{technician.isFullyOccupied ? "—" : Math.round(technician.recommendationScore)}</p>
                                                            <p className="text-[11px] text-slate-500">Acceptance {Math.round(technician.acceptanceRateValue * 100)}%</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {technician.recommendationReasons.slice(0, 2).map((reason) => (
                                                                    <Badge key={reason} variant="outline" className="text-[10px] border-slate-200 bg-slate-50 text-slate-600">
                                                                        {reason}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td> */}
                                                    <td className="px-4 py-3">
                                                        {technician.isFullyOccupied ? (
                                                            <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                                                                Fully Occupied
                                                            </Badge>
                                                        ) : technician.isRecommended ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                                <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                                                                Recommended
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-slate-200 text-slate-500">
                                                                Eligible
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            className={`bg-primary hover:bg-primary-active ${technician.isRecommended ? "shadow-md shadow-emerald-200/60" : ""}`}
                                                            onClick={() => handleAssign(technician.id)}
                                                            disabled={isAssigning || technician.isFullyOccupied || assignmentDisabled}
                                                        >
                                                            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            {assignmentDisabled
                                                                ? "Already Assigned"
                                                                : technician.isFullyOccupied
                                                                    ? "Occupied"
                                                                    : "Assign"}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                                The list is ranked using a workload-aware greedy score based on rating, experience, active jobs, acceptance rate, and availability. Fully occupied technicians stay visible but cannot be assigned.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
