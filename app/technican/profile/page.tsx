"use client";

import { Phone, Mail, MapPin, Star, Briefcase, DollarSign, Award, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const specializations = ["Plumbing", "Electrical", "IT/CCTV", "Pipe Installation", "Leak Repair", "Wiring"];

const profileStats = [
    { icon: Briefcase, label: "Jobs Done", value: "128", iconClass: "text-sky-500" },
    { icon: Star, label: "Avg Rating", value: "4.92", iconClass: "text-amber-500" },
    { icon: DollarSign, label: "Earned", value: "₨ 84,250", iconClass: "text-emerald-500" },
];

const reviews = [
    { name: "Sanjay T.", rating: 5, text: "Very professional and quick. Highly recommend!", date: "Feb 20, 2026" },
    { name: "Priya S.", rating: 5, text: "Fixed the pipe issue in minutes. Great work!", date: "Feb 18, 2026" },
];

export default function ProfilePage() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            {/* Header */}
            <div className="pt-2 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your technician profile</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-xl border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <Edit className="h-4 w-4" /> Edit Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your technician profile here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="name" className="sm:text-right font-medium">
                                    Name
                                </Label>
                                <Input id="name" defaultValue="Rajesh Kumar" className="col-span-1 sm:col-span-3 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="phone" className="sm:text-right font-medium">
                                    Phone
                                </Label>
                                <Input id="phone" defaultValue="+977-98XXXXXXXX" className="col-span-1 sm:col-span-3 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="email" className="sm:text-right font-medium">
                                    Email
                                </Label>
                                <Input id="email" type="email" defaultValue="rajesh@metrosewa.com" className="col-span-1 sm:col-span-3 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="location" className="sm:text-right font-medium">
                                    Location
                                </Label>
                                <Input id="location" defaultValue="Lalitpur, Nepal" className="col-span-1 sm:col-span-3 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="specializations" className="sm:text-right font-medium">
                                    Specializations
                                </Label>
                                <Input id="specializations" defaultValue={specializations.join(", ")} className="col-span-1 sm:col-span-3 rounded-xl" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl w-full sm:w-auto">
                                Save changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Profile Card */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Sky blue banner */}
                <div className="h-24 bg-gradient-to-r from-sky-400 to-sky-600" />

                <CardContent className="px-6 pb-6 -mt-12">
                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-lg">
                                <AvatarImage
                                    src="https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0ea5e9&color=fff&size=160"
                                    alt="Rajesh Kumar"
                                />
                                <AvatarFallback className="bg-sky-500 text-white text-xl font-bold">RK</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
                        </div>
                        <div className="flex-1 pb-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Rajesh Kumar</h2>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                <Badge className="bg-sky-500 hover:bg-sky-600 text-white text-xs border-0">Expert Technician</Badge>
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <Award className="h-3 w-3 text-sky-500" /> Verified
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-sky-400" /> +977-98XXXXXXXX</span>
                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-sky-400" /> rajesh@metrosewa.com</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-sky-400" /> Lalitpur, Nepal</span>
                    </div>

                    <Separator className="my-5" />

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {profileStats.map((s) => (
                            <div key={s.label} className="flex flex-col items-center gap-1 text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <s.icon className={`h-5 w-5 ${s.iconClass}`} />
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Specializations */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-800 dark:text-slate-200">Specializations</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                    {specializations.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="px-3 py-1.5 text-xs font-semibold bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-0 rounded-full"
                        >
                            {tag}
                        </Badge>
                    ))}
                </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                    <CardTitle className="text-base text-slate-800 dark:text-slate-200">Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {reviews.map((review) => (
                        <div key={review.name} className="px-6 py-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{review.name}</span>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{review.text}</p>
                            <p className="text-xs text-slate-400 mt-1">{review.date}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
