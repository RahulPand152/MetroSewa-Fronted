"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetAdminBookingById, useGetTechnicians, useAssignTechnician, useUpdateBookingStatus } from "@/src/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft, Calendar, Clock, Briefcase, User, Phone,
    Receipt, Loader2, AlertTriangle, MapPin, Wrench
} from "lucide-react";
import { format } from "date-fns";
import { formatBookingDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-[#236b9d]" />
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
    const { data: technicians, isLoading: isTechsLoading } = useGetTechnicians();

    const { mutate: assignTechnician, isPending: isAssigning } = useAssignTechnician();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBookingStatus();

    const [selectedTech, setSelectedTech] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    if (isBookingLoading || isTechsLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-[#236b9d]" />
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

    const handleAssign = () => {
        if (!selectedTech) {
            toast.error("Please select a technician first");
            return;
        }
        assignTechnician({ bookingId: id, technicianId: selectedTech });
    };

    const handleStatusUpdate = () => {
        if (!selectedStatus) {
            toast.error("Please select a status first");
            return;
        }
        updateStatus({ id, status: selectedStatus });
    };

    const d = booking.scheduledDate ? new Date(booking.scheduledDate) : new Date();
    const status = (booking.status || "UNKNOWN").toUpperCase();

    // The assigned technician info - assumes booking.technicians is an array
    const assignedTech = booking.technicians && booking.technicians.length > 0 ? booking.technicians[0] : null;
    const techName = assignedTech ? `${assignedTech.user?.firstName || ''} ${assignedTech.user?.lastName || ''}`.trim() : null;

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
                                    <p className="text-xs text-slate-400 font-medium mb-1">Booking ID: <span className="font-mono text-slate-600">{booking.id}</span></p>
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
                                <InfoRow icon={Receipt} label="Service Price" value={`Rs. ${booking.service?.price || 0}`} />
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

                {/* Right Column: Management Actions */}
                <div className="flex flex-col gap-6">

                    {/* Assign Technician Card */}
                    <Card className="rounded-xl border-slate-200 shadow-sm border-t-4 border-t-[#236b9d]">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-[#236b9d]" /> Technician Assignment
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
                                </div>
                            ) : (
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-2">
                                    <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Not Assigned Yet
                                    </p>
                                </div>
                            )}

                            {/* Avoid assigning if cancelled or completed unless explicit override needed. But admin can do anything. */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700">Assign / Reassign Technician</label>
                                <Select value={selectedTech} onValueChange={setSelectedTech}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a technician" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(technicians || []).filter((t: any) => t.isApproved).map((tech: any) => (
                                            <SelectItem key={tech.id} value={tech.id}>
                                                {tech.user?.firstName} {tech.user?.lastName} - {tech.expertise?.replace(/_/g, " ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    className="w-full bg-[#236b9d] hover:bg-[#1a5177]"
                                    onClick={handleAssign}
                                    disabled={isAssigning || !selectedTech}
                                >
                                    {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Assign Selected Technician
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Update Status Card */}
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

                </div>
            </div>
        </div>
    );
}
