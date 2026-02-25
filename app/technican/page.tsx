"use client";

import React, { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import {
    Briefcase, DollarSign, Star, Zap, Bell, Calendar,
    ChevronRight, MapPin, Clock, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Data ─────────────────────────────────────────────────────────────────────
const weeklyData = [
    { day: "Mon", jobs: 3 },
    { day: "Tue", jobs: 5 },
    { day: "Wed", jobs: 2 },
    { day: "Thu", jobs: 7 },
    { day: "Fri", jobs: 4 },
    { day: "Sat", jobs: 6 },
    { day: "Sun", jobs: 1 },
];

const categoryData = [
    { name: "Plumbing", value: 45, color: "#0ea5e9" },
    { name: "Electrical", value: 30, color: "#22c55e" },
    { name: "IT/CCTV", value: 25, color: "#f59e0b" },
];

const newJobs = [
    {
        id: 1,
        title: "Pipe Leakage Fix",
        category: "Plumbing",
        location: "Lalitpur, Kumaripati",
        time: "Today, 3:00 PM",
        budget: "Rs. 1,200",
        urgency: "Urgent",
        urgencyVariant: "destructive" as const,
    },
    {
        id: 2,
        title: "CCTV Camera Install",
        category: "IT/CCTV",
        location: "Kathmandu, Thamel",
        time: "Tomorrow, 10:00 AM",
        budget: "Rs. 3,500",
        urgency: "Normal",
        urgencyVariant: "secondary" as const,
    },
    {
        id: 3,
        title: "Fan Wiring Repair",
        category: "Electrical",
        location: "Bhaktapur, Suryabinayak",
        time: "Today, 5:30 PM",
        budget: "Rs. 600",
        urgency: "Normal",
        urgencyVariant: "secondary" as const,
    },
];

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
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
            <p className="text-sm font-bold text-sky-500">{payload[0].value} jobs</p>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TechnicanDashboard() {
    const [dateFilter] = useState("Last 7 Days");

    return (
        <div className="flex flex-col gap-6">
            {/* ── Page Header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        Analytical Dashboard
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Live Updates Active
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 rounded-xl border-slate-200 dark:border-slate-700">
                        <Calendar className="h-4 w-4 text-sky-500" />
                        {dateFilter}
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-slate-200 dark:border-slate-700 relative">
                        <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
                    </Button>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Briefcase}
                    iconClass="bg-sky-50 dark:bg-sky-900/20 text-sky-500"
                    label="Total Jobs"
                    value="128"
                    badge="+12%"
                    badgeClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                />
                <StatCard
                    icon={DollarSign}
                    iconClass="bg-green-50 dark:bg-green-900/20 text-green-500"
                    label="Total Income"
                    value="Rs. 84,250"
                    badge="+8.4%"
                    badgeClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                />
                <StatCard
                    icon={Zap}
                    iconClass="bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                    label="Active Jobs"
                    value="3"
                    badge="Current"
                    badgeClass="bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                />
                <StatCard
                    icon={Star}
                    iconClass="bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                    label="Avg. Rating"
                    value="4.92"
                    badge="Top 5%"
                    badgeClass="bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                />
            </div>

            {/* ── Charts ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar Chart */}
                <Card className="lg:col-span-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                            Weekly Performance
                        </CardTitle>
                        <Badge
                            variant="secondary"
                            className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-0 flex items-center gap-1.5"
                        >
                            <TrendingUp className="h-3 w-3" /> Jobs Completed
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyData} barSize={28}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                                />
                                <YAxis hide />
                                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(14,165,233,0.06)" }} />
                                <Bar dataKey="jobs" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Donut Chart */}
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                            Job Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="relative">
                            <PieChart width={180} height={180}>
                                <Pie
                                    data={categoryData}
                                    cx={90} cy={90}
                                    innerRadius={55} outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">128</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TOTAL</span>
                            </div>
                        </div>
                        <Separator className="my-3 w-full" />
                        <div className="w-full space-y-2">
                            {categoryData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                                    </div>
                                    <Badge variant="secondary" className="font-bold text-xs">{item.value}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── New Job Requests ────────────────────────────────── */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 py-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                            New Job Requests
                        </CardTitle>
                        <Badge className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-2 py-0.5">
                            {newJobs.length}
                        </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sm font-semibold gap-1">
                        View all <ChevronRight className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {newJobs.map((job) => (
                        <div key={job.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-sky-50/50 dark:hover:bg-sky-900/5 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{job.title}</p>
                                    <Badge variant="secondary" className="text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-0">
                                        {job.category}
                                    </Badge>
                                    {job.urgency === "Urgent" && (
                                        <Badge variant="destructive" className="text-xs">{job.urgency}</Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 text-sky-400" />{job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-sky-400" />{job.time}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{job.budget}</span>
                                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-sm shadow-sky-500/20 text-xs px-4">
                                    Accept
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-xl text-xs px-4 border-slate-200 dark:border-slate-700">
                                    Decline
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
