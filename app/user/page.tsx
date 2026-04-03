"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock, Settings, Wallet, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/src/hooks/useAuth";
import { useGetMyBookings } from "@/src/hooks/useBookings";
import { format } from "date-fns";

export default function UserDashboard() {
    const { data: userProfile } = useProfile();
    const { data: realBookings = [] } = useGetMyBookings();
    const firstName = userProfile?.data?.firstName || userProfile?.firstName || "User";

    // Computed real data
    const activeBookings = realBookings.filter((b: any) =>
        ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes((b.status || "").toUpperCase())
    ).length;

    const pastServices = realBookings.filter((b: any) =>
        ['COMPLETED'].includes((b.status || "").toUpperCase())
    ).length;

    const stats = [
        { label: "Active Bookings", value: activeBookings, icon: CalendarCheck, color: "text-sky-500", bg: "bg-sky-100 dark:bg-sky-900/20" },
        { label: "Past Services", value: pastServices, icon: Clock, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
        { label: "Wallet Balance", value: "Rs. 0", icon: Wallet, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
    ];

    // Format top 5 recent bookings
    const recentBookings = [...realBookings]
        .sort((a, b) => new Date(b.scheduledDate || 0).getTime() - new Date(a.scheduledDate || 0).getTime())
        .slice(0, 5)
        .map((b: any) => {
            const statusUpper = (b.status || "").toUpperCase();
            let statusColor = "bg-amber-100 text-amber-700";
            let displayStatus = b.status;

            if (statusUpper === "PENDING" || statusUpper === "ASSIGNED") {
                statusColor = "bg-sky-100 text-sky-700";
            } else if (statusUpper === "COMPLETED") {
                statusColor = "bg-emerald-100 text-emerald-700";
            } else if (statusUpper === "CANCELLED") {
                statusColor = "bg-rose-100 text-rose-700";
            }

            const dateStr = b.scheduledDate ? format(new Date(b.scheduledDate), "MMM d, yyyy 'at' h:mm a") : "Soon";

            return {
                id: b.id.substring(0, 5).toUpperCase(),
                service: b.service?.name || "Service",
                date: dateStr,
                status: displayStatus,
                statusColor
            };
        });

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome back, {firstName}! 👋</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is what&apos;s happening with your services today.</p>
                </div>
                <Link href="/user/book-service">
                    <Button className="bg-[#1e5b87] hover:bg-[#1e5b87] text-white shadow-sm gap-2">
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
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold text-xs shrink-0">
                                            {booking.id}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{booking.service}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{booking.date}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={`${booking.statusColor} border-0 rounded-full px-3 capitalize`}>{booking.status}</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-sm text-slate-500">
                                You have no recent bookings.
                            </div>
                        )}
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
