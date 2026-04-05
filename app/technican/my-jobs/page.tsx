"use client";

import { Briefcase, Clock, CheckCircle2, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const stats = [
    { icon: Briefcase, label: "Total Jobs", value: 4, iconClass: "bg-sky-50 dark:bg-sky-900/20 text-sky-500" },
    { icon: CheckCircle2, label: "Completed", value: 2, iconClass: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" },
    { icon: Clock, label: "Active / Pending", value: 2, iconClass: "bg-amber-50 dark:bg-amber-900/20 text-amber-500" },
];

const jobs = [
    { id: 1, title: "Pipe Leakage Fix", category: "Plumbing", status: "Active", date: "Today, 3:00 PM", pay: "Rs. 1,200", statusClass: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400" },
    { id: 2, title: "CCTV Camera Install", category: "IT/CCTV", status: "Completed", date: "Feb 22, 10:00 AM", pay: "Rs. 3,500", statusClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
    { id: 3, title: "Fan Wiring Repair", category: "Electrical", status: "Pending", date: "Today, 5:30 PM", pay: "Rs. 600", statusClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    { id: 4, title: "Sink Unclogging", category: "Plumbing", status: "Completed", date: "Feb 20, 9:00 AM", pay: "Rs. 800", statusClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
];

export default function MyJobsPage() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Jobs</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track all your assigned service jobs</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {stats.map((s) => (
                    <Card key={s.label} className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-5">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${s.iconClass}`}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Jobs List */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200">All Jobs</CardTitle>
                        <Badge className="bg-[#236b9d]  text-white text-xs">{jobs.length} jobs</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-sky-50/50 dark:hover:bg-sky-900/5 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{job.title}</p>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${job.statusClass}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-3.5 w-3.5 text-[#236b9d]" />{job.category}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5 text-[#236b9d]" />{job.date}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{job.pay}</span>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="rounded-xl text-xs bg-[#236b9d] text-white hover:bg-[#236b8d] hover:text-white">
                                            Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Job Details</DialogTitle>
                                            <DialogDescription>
                                                Full details for {job.title}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                                    <Badge variant="secondary" className={`${job.statusClass} border-0`}>{job.status}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-slate-500">Category</span>
                                                    <span className="text-sm font-semibold">{job.category}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-slate-500">Pay</span>
                                                    <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">{job.pay}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-4 w-4 mt-0.5 text-sky-500 flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Customer Address</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">123 Main St, Lalitpur, Nepal</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="h-4 w-4 mt-0.5 text-[#236b9d] flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Date & Time</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{job.date}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Briefcase className="h-4 w-4 mt-0.5 text-sky-500 flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Task Description</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please arrive on time. Fix the issue quickly and test. Report if additional material is required.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
