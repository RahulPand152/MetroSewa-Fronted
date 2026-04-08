"use client";

import { useGetMyJobs } from "@/src/hooks/useTechnician";
import { Briefcase, Clock, CheckCircle2, MapPin, Calendar, ChevronRight, Loader2, PackageOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatBookingDate } from "@/lib/utils";
import Link from "next/link";
import { useMemo } from "react";

const STATUS_STYLES: Record<string, string> = {
    ASSIGNED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200",
};

export default function MyJobsPage() {
    const { data: jobs = [], isLoading } = useGetMyJobs();

    const stats = useMemo(() => {
        return {
            total: jobs.length,
            active: jobs.filter((j: any) => ["ASSIGNED", "IN_PROGRESS"].includes(j.status)).length,
            completed: jobs.filter((j: any) => j.status === "COMPLETED").length,
        };
    }, [jobs]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#236b9d]" />
                <p className="text-slate-500 font-medium tracking-tight">Loading jobs...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Jobs</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track all your assigned service jobs</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-default">
                    <CardContent className="p-5">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 bg-slate-100 text-slate-500">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Jobs</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-default">
                    <CardContent className="p-5">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 bg-blue-50 text-blue-500">
                            <Clock className="h-5 w-5" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Jobs</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.active}</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-default">
                    <CardContent className="p-5">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-50 text-emerald-500">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.completed}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Jobs List */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200">All Jobs</CardTitle>
                        <Badge className="bg-[#236b9d] hover:bg-[#1a5279] text-white text-xs">{jobs.length} jobs</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                            <PackageOpen className="h-12 w-12 opacity-30" />
                            <p className="font-medium">No assigned jobs</p>
                            <p className="text-sm">You currently have no jobs assigned to you.</p>
                        </div>
                    ) : (
                        jobs.map((job: any) => {
                            const d = new Date(job.scheduledDate);
                            const customerName = `${job.user?.firstName || job.customer?.firstName || job.firstName || ''} ${job.user?.lastName || job.customer?.lastName || job.lastName || ''}`.trim() || "Customer";
                            const statusLabel = job.status ? String(job.status).replace("_", " ") : "UNKNOWN";

                            return (
                                <Link href={`/technican/my-jobs/${job.id}`} key={job.id}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                {job.user?.avatar || job.customer?.avatar ? (
                                                    <img src={job.user?.avatar || job.customer?.avatar} alt={customerName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="h-8 w-8 bg-[#236b9d]/10 text-[#236b9d] text-xs font-bold flex items-center justify-center rounded-full shrink-0">
                                                        {customerName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#236b9d] transition-colors">{job.service?.name}</p>
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[job.status] || "bg-slate-100"}`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                                    {job.address || job.user?.address || job.customer?.address || "No address"}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-[#236b9d]" />
                                                    {formatBookingDate(d, "MMM d, yyyy")} at {format(d, "hh:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0 sm:justify-end border-t sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                            <div className="flex flex-col sm:text-right">
                                                <span className="text-xs text-slate-400 uppercase font-semibold">Service Pay</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Rs. {job.service?.price}</span>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#236b9d] group-hover:text-white transition-colors">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
