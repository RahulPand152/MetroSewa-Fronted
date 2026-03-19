"use client";

import { useRef, useState } from "react";
import { Phone, Mail, MapPin, Star, Briefcase, DollarSign, Award, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function ProfilePage() {
    const { data: userProfile, isLoading } = useProfile();
    const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const [isEditOpen, setIsEditOpen] = useState(false);
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
    const initials = user.firstName?.[0]?.toUpperCase() || "?";

    // In a real app we would get these from the technician profile extension
    const specializations = ["Plumbing", "Electrical"];
    const profileStats = [
        { icon: Briefcase, label: "Jobs Done", value: "-", iconClass: "text-sky-500" },
        { icon: Star, label: "Avg Rating", value: "-", iconClass: "text-amber-500" },
        { icon: DollarSign, label: "Earned", value: "-", iconClass: "text-emerald-500" },
    ];

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            {/* Header */}
            <div className="pt-2 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your technician profile</p>
                </div>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                        <form onSubmit={handleUpdateProfile}>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your technician profile here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                    <Label htmlFor="firstName" className="sm:text-right font-medium">
                                        First Name
                                    </Label>
                                    <Input name="firstName" id="firstName" defaultValue={user.firstName} required className="col-span-1 sm:col-span-3 rounded-xl" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                    <Label htmlFor="lastName" className="sm:text-right font-medium">
                                        Last Name
                                    </Label>
                                    <Input name="lastName" id="lastName" defaultValue={user.lastName} required className="col-span-1 sm:col-span-3 rounded-xl" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                    <Label htmlFor="phone" className="sm:text-right font-medium">
                                        Phone
                                    </Label>
                                    <Input name="phone" id="phone" defaultValue={user.phoneNumber || ""} className="col-span-1 sm:col-span-3 rounded-xl" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                    <Label htmlFor="email" className="sm:text-right font-medium">
                                        Email
                                    </Label>
                                    <Input id="email" type="email" defaultValue={user.email} disabled className="col-span-1 sm:col-span-3 rounded-xl bg-slate-50" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                    <Label htmlFor="location" className="sm:text-right font-medium">
                                        Location
                                    </Label>
                                    <Input name="location" id="location" defaultValue={user.address || ""} className="col-span-1 sm:col-span-3 rounded-xl" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isUpdating} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl w-full sm:w-auto">
                                    {isUpdating ? "Saving..." : "Save changes"}
                                </Button>
                            </DialogFooter>
                        </form>
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
                        <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                            <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-lg">
                                {user.avatar && (
                                    <AvatarImage src={user.avatar} alt={name} className="object-cover" />
                                )}
                                <AvatarFallback className="bg-sky-500 text-white text-xl font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                    <Spinner className="h-6 w-6 text-white animate-spin" />
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
                        <div className="flex-1 pb-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{name}</h2>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                {user.isEmailVerified && (
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                        <Award className="h-3 w-3 text-sky-500" /> Verified
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-sky-400" /> {user.phoneNumber || "-"}</span>
                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-sky-400" /> {user.email}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-sky-400" /> {user.address || "-"}</span>
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
        </div>
    );
}
