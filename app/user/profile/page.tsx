"use client";

import { Phone, Mail, MapPin, Edit, Shield, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserProfilePage() {
    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            {/* Header */}
            <div className="pt-2 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account information</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Sky banner */}
                <div className="h-28 bg-gradient-to-r from-sky-400 to-sky-600" />

                <CardContent className="px-6 pb-6 -mt-12">
                    {/* Avatar & Action */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
                                <AvatarImage
                                    src="https://ui-avatars.com/api/?name=John+Doe&background=0ea5e9&color=fff&size=160"
                                    alt="John Doe"
                                />
                                <AvatarFallback className="bg-sky-500 text-white text-2xl font-bold">JD</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                >
                                    <Edit className="h-4 w-4" /> Edit Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your personal information below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                        <Label htmlFor="name" className="sm:text-right font-medium">Name</Label>
                                        <Input id="name" defaultValue="John Doe" className="col-span-1 sm:col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                        <Label htmlFor="phone" className="sm:text-right font-medium">Phone</Label>
                                        <Input id="phone" defaultValue="+977-98XXXXXXXX" className="col-span-1 sm:col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                        <Label htmlFor="email" className="sm:text-right font-medium">Email</Label>
                                        <Input id="email" type="email" defaultValue="johndoe@example.com" className="col-span-1 sm:col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                        <Label htmlFor="location" className="sm:text-right font-medium">Location</Label>
                                        <Input id="location" defaultValue="Kathmandu, Nepal" className="col-span-1 sm:col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" className="bg-sky-500 hover:bg-sky-600 text-white w-full sm:w-auto">
                                        Save changes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">John Doe</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-400 border-0">Premium Member</Badge>
                            <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-500">Joined Feb 2026</Badge>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Contact info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Phone className="h-4 w-4 text-sky-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Phone Number</span>
                                <span className="font-medium text-slate-900 dark:text-slate-200">+977-98XXXXXXXX</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Mail className="h-4 w-4 text-sky-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Email Address</span>
                                <span className="font-medium text-slate-900 dark:text-slate-200">johndoe@example.com</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-sky-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Address</span>
                                <span className="font-medium text-slate-900 dark:text-slate-200">Kathmandu, Nepal</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-pointer">
                            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
                                <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                                    <Key className="h-5 w-5 text-sky-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Password</CardTitle>
                                    <CardDescription className="text-xs mt-0.5">Change your password</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                                Enter your current password and a new password below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" placeholder="Enter current password" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" placeholder="Enter new password" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" className="bg-sky-500 hover:bg-sky-600 text-white w-full sm:w-auto">
                                Update Password
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
