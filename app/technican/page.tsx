"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import {
    Briefcase, DollarSign, Star, Zap, Bell, Calendar,
    ChevronRight, MapPin, Clock, TrendingUp, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/src/lib/axios";
import { format, subDays, isSameDay } from "date-fns";
import { formatBookingDate } from "@/lib/utils";

// ── Components ────────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon, iconClass, label, value, badge, badgeClass,
}: {
    icon: React.ElementType; iconClass: string; label: string;
    value: string; badge: string; badgeClass: string;
}) {
    return (
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${iconClass}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {badge}
                    </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</h3>
            </CardContent>
        </Card>
    );
}

function BarTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2 z-50">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
            <p className="text-sm font-bold text-[#236b9d]">{payload[0].value} jobs</p>
        </div>
    );
}

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TechnicanDashboard() {
    const [dateFilter] = useState("Last 7 Days");

    const [realBookings, setRealBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Returns all jobs attached to this technician (assigned, in-progress, completed)
                const response = await axiosInstance.get("/technicians/bookings");
                setRealBookings(response.data?.data || response.data || []);
            } catch (error) {
                console.error("Failed to fetch technician dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // ── Computed Real Data ──
    const activeJobs = realBookings.filter(b => b.status === "IN_PROGRESS").length;
    const completedJobsCount = realBookings.filter(b => b.status === "COMPLETED").length;
    const newJobsData = realBookings.filter(b => b.status === "ASSIGNED");

    // Dynamic Weekly Graph (Last 7 Days)
    const weeklyData = useMemo(() => {
        const days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
        return days.map(d => {
            const jobsCount = realBookings.filter(b =>
                (b.status === "COMPLETED" || b.status === "IN_PROGRESS") &&
                b.updatedAt &&
                isSameDay(new Date(b.updatedAt), d)
            ).length;

            return {
                day: format(d, "EEE"), // "Mon", "Tue"
                jobs: jobsCount
            };
        });
    }, [realBookings]);

    // Dynamic Service Distribution Donut Chart
    const categoryData = useMemo(() => {
        const serviceCounts: Record<string, number> = {};
        realBookings.forEach(b => {
            const name = b.service?.name || "Other";
            serviceCounts[name] = (serviceCounts[name] || 0) + 1;
        });

        const segments = Object.entries(serviceCounts).map(([name, value], i) => ({
            name: name.length > 15 ? name.substring(0, 15) + "..." : name,
            value,
            color: COLORS[i % COLORS.length]
        }));

        // Return a visually stable array if there are zero real entries yet
        if (segments.length === 0) {
            return [{ name: "No Data", value: 1, color: "#cbd5e1" }];
        }
        return segments;
    }, [realBookings]);

    const totalJobsInPie = realBookings.length;

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-8 min-h-[500px]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#236b9d]" />
                    <p className="text-sm text-slate-500">Loading your board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ── Page Header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        Analytical Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 rounded-xl border-slate-200 dark:border-slate-700 pointer-events-none">
                        <Calendar className="h-4 w-4 text-[#236b9d]" />
                        {dateFilter}
                    </Button>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Zap}
                    iconClass="bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                    label="Active Jobs"
                    value={activeJobs.toString()}
                    badge="Ongoing"
                    badgeClass="bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                />
                <StatCard
                    icon={Briefcase}
                    iconClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"
                    label="Completed Jobs"
                    value={completedJobsCount.toString()}
                    badge="All Time"
                    badgeClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                />
            </div>

            {/* ── Charts ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar Chart */}
                <Card className="lg:col-span-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                            Weekly Performance
                        </CardTitle>
                        <Badge
                            variant="secondary"
                            className="bg-[#236b9d] text-white border-0 flex items-center gap-1.5"
                        >
                            <TrendingUp className="h-3 w-3" /> Job Progress
                        </Badge>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barSize={28} margin={{ top: 10 }}>
                                <defs>
                                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#0284c7" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(2, 132, 199, 0.08)" }} />
                                <Bar dataKey="jobs" fill="url(#colorJobs)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Donut Chart */}
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                            Job Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center flex-1">
                        <div className="relative">
                            <PieChart width={180} height={180}>
                                <Pie
                                    data={categoryData}
                                    cx={90} cy={90}
                                    innerRadius={55} outerRadius={80}
                                    paddingAngle={categoryData.length > 1 ? 3 : 0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalJobsInPie}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LIFETIME</span>
                            </div>
                        </div>
                        <Separator className="my-3 w-full" />
                        <div className="w-full space-y-2">
                            {categoryData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {item.name === "No Data" ? "No Jobs Yet" : item.name}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="font-bold text-xs">{item.value}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── New Job Requests ────────────────────────────────── */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
                <CardHeader className="flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 py-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                            New Job Requests
                        </CardTitle>
                        {newJobsData.length > 0 && (
                            <Badge className="bg-[#236b9d] hover:bg-[#236b8d] text-white text-xs px-2 py-0.5">
                                {newJobsData.length}
                            </Badge>
                        )}
                    </div>
                    <Link href="/technican/my-jobs">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-400 hover:bg-sky-50 text-sm font-semibold gap-1">
                            View all <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>

                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800 flex-1">
                    {newJobsData.length > 0 ? newJobsData.map((job) => (
                        <Link key={job.id} href={`/technican/my-jobs/${job.id}`} className="block hover:bg-sky-50/50 dark:hover:bg-[#236b9d]/5 transition-colors group">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#236b9d] transition-colors">{job.service?.name || "Job Request"}</p>
                                        <Badge variant="secondary" className="text-xs bg-[#236b9d] text-white dark:text-sky-400 border-0">
                                            New
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                            {job.user?.address || "Location pending"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                                            {job.scheduledDate ? `${formatBookingDate(new Date(job.scheduledDate), "PP")} at ${format(new Date(job.scheduledDate), "p")}` : "Awaiting Schedule"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 mt-3 sm:mt-0">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Rs. {job.totalAmount || job.service?.price || 0}</span>
                                    <Button size="sm" className="bg-[#236b9d] hover:bg-[#1a5177] text-white rounded-xl shadow-sm text-xs px-4 pointer-events-none">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 h-full">
                            <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-sm font-medium">You're all caught up!</p>
                            <p className="text-xs mt-1 max-w-[200px]">There are no new job requests assigned to you right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
