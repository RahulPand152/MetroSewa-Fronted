"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock, Settings, Wallet, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/src/hooks/useAuth";

const stats = [
    { label: "Active Bookings", value: 2, icon: CalendarCheck, color: "text-sky-500", bg: "bg-sky-100 dark:bg-sky-900/20" },
    { label: "Past Services", value: 15, icon: Clock, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
    { label: "Wallet Balance", value: "Rs. 1,500", icon: Wallet, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
];

const recentBookings = [
    { id: "B-1029", service: "Plumbing Repair", date: "Today, 3:00 PM", status: "Upcoming", statusColor: "bg-sky-100 text-sky-700" },
    { id: "B-1028", service: "AC Servicing", date: "Feb 23, 10:00 AM", status: "Completed", statusColor: "bg-emerald-100 text-emerald-700" },
];

export default function UserDashboard() {
    const { data: userProfile } = useProfile();
    const firstName = userProfile?.data?.firstName || "User";

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome back, {firstName}! 👋</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is what&apos;s happening with your services today.</p>
                </div>
                <Link href="/user/book-service">
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white shadow-sm gap-2">
                        Book a New Service <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200">Recent Bookings</CardTitle>
                        <Link href="/user/my-bookings" className="text-sm font-medium text-sky-500 hover:text-sky-600 dark:text-sky-400">View all</Link>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                        {recentBookings.map((booking, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold text-xs">
                                        {booking.id.split('-')[1]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{booking.service}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{booking.date}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className={`${booking.statusColor} border-0 rounded-full px-3`}>{booking.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-2">
                        <Link href="/user/profile">
                            <Button variant="outline" className="w-full justify-start gap-3 h-11 border-slate-200 dark:border-slate-800">
                                <Settings className="h-4 w-4 text-slate-500" /> Manage Profile
                            </Button>
                        </Link>
                        <Link href="/user/help-support">
                            <Button variant="outline" className="w-full justify-start gap-3 h-11 border-slate-200 dark:border-slate-800">
                                <HelpCircle className="h-4 w-4 text-slate-500" /> Help & Support
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
