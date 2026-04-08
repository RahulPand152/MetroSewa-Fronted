"use client";

import { useRef, useState } from "react";
import { Phone, Mail, MapPin, Edit, Shield, Key, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUploadProfileImage, useUpdateProfile } from "@/src/hooks/useAuth";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function UserProfilePage() {
    const { data: userProfile, isLoading } = useProfile();
    const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Spinner className="h-8 w-8 animate-spin" /></div>;
    }

    const user = userProfile?.data;
    if (!user) return null;

    const handleAvatarClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            uploadImage(formData, {
                onSuccess: () => {
                    toast.success("Profile image updated");
                },
                onError: () => {
                    toast.error("Failed to update profile image");
                }
            });
        }
    };

    const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            phoneNumber: formData.get('phone') as string,
            address: formData.get('location') as string,
        };

        updateProfile(data, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
                setIsEditOpen(false);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Failed to update profile");
            }
        });
    };

    const name = `${user.firstName} ${user.lastName}`;
    const initials = [user.firstName, user.lastName]
        .filter(Boolean)
        .map((n: string) => n[0].toUpperCase())
        .join("")
        .slice(0, 2) || "?";
    const joinedDate = new Date(user.createdAt).toLocaleDateString("en-NP", { month: "short", year: "numeric" });

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
                <div className="h-28 bg-gradient-to-r from-[#1e5b87] to-[#1e5b97]" />

                <CardContent className="px-6 pb-6 -mt-12">
                    {/* Avatar & Action */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
                                {user.avatar && (
                                    <AvatarImage src={user.avatar} alt={name} className="object-cover" />
                                )}
                                <AvatarFallback className="bg-[#1e5b87] text-white text-2xl font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                    <Spinner className="h-8 w-8 text-white animate-spin" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>
                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 border-[#1e5b87]  hover:bg-[#1e5b87] hover:text-white"
                                >
                                    <Edit className="h-4 w-4" /> Edit Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <form onSubmit={handleUpdateProfile}>
                                    <DialogHeader>
                                        <DialogTitle>Edit Profile</DialogTitle>
                                        <DialogDescription>
                                            Update your personal information below.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                            <Label htmlFor="firstName" className="sm:text-right font-medium">First Name</Label>
                                            <Input name="firstName" id="firstName" defaultValue={user.firstName} required className="col-span-1 sm:col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                            <Label htmlFor="lastName" className="sm:text-right font-medium">Last Name</Label>
                                            <Input name="lastName" id="lastName" defaultValue={user.lastName} required className="col-span-1 sm:col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                            <Label htmlFor="phone" className="sm:text-right font-medium">Phone</Label>
                                            <Input name="phone" id="phone" defaultValue={user.phoneNumber || ""} className="col-span-1 sm:col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                            <Label htmlFor="location" className="sm:text-right font-medium">Address</Label>
                                            <Input name="location" id="location" defaultValue={user.address || ""} className="col-span-1 sm:col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isUpdating} className="bg-[#1e5b87] hover:bg-[#1e5b87] text-white w-full sm:w-auto">
                                            {isUpdating ? "Saving..." : "Save changes"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {user.isEmailVerified && (
                                <Badge className="bg-[#1e5b87]/10 text-[#1e5b87] hover:bg-[#1e5b87]/20 border-0">Verified User</Badge>
                            )}
                            <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-500">Joined {joinedDate}</Badge>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Contact info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Phone className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Phone Number</span>
                                <span className="font-medium text-slate-900 dark:text-slate-200">{user.phoneNumber || "Not provided"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Mail className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Email Address</span>
                                <span className="font-medium text-slate-900 dark:text-slate-200">{user.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-rose-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Address</span>
                                <span className="font-medium text-slate-900 dark:text-slate-200">{user.address || "Not provided"}</span>
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
                                <div className="h-10 w-10 rounded-lg bg-[#1e5b87]/10 flex items-center justify-center shrink-0">
                                    <Key className="h-5 w-5 text-amber-500" />
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
                                <div className="relative">
                                    <Input id="current-password" type={showCurrentPassword ? "text" : "password"} placeholder="Enter current password" className="pr-10" />
                                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input id="new-password" type={showNewPassword ? "text" : "password"} placeholder="Enter new password" className="pr-10" />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <div className="relative">
                                    <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" className="pr-10" />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" className="bg-[#1e5b87] hover:bg-[#1e5b87] text-white w-full sm:w-auto">
                                Update Password
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
