"use client";

import React, { useRef } from "react";
import {
    Sun,
    Moon,
    Monitor,
    Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useProfile, useUploadProfileImage } from "@/src/hooks/useAuth";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function SettingsPage() {
    const { data: userProfile, isLoading } = useProfile();
    const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
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

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const initials = name ? name.split(" ").map((n: string) => n[0]).join("") : "?";

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage admin account settings and platform preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="general">Platform</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information and profile picture.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-sm dark:border-slate-900">
                                        <AvatarImage src={user.avatar || ""} className="object-cover" />
                                        <AvatarFallback className="text-2xl font-bold bg-blue-600 text-white">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit className="h-6 w-6 text-white" />
                                    </div>
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
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">{name}</h3>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={handleAvatarClick} disabled={isUploading}>
                                        Change Picture
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue={user.firstName} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue={user.lastName} />
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" defaultValue={user.email} />
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" defaultValue={user.role} disabled className="bg-slate-50" />
                                </div>
                            </div>
                            <Button className="w-fit mt-2">Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and security preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                            <Button variant="outline" className="w-fit mt-2">Update Password</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* General Settings */}
                <TabsContent value="general" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Settings</CardTitle>
                            <CardDescription>Configure general platform preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-slate-500">Temporarily disable the platform for all users.</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Public Registration</Label>
                                    <p className="text-sm text-slate-500">Allow new users to sign up without invitation.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription>Choose what you want to be notified about via email.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">New Bookings</Label>
                                    <p className="text-sm text-slate-500">Receive an email when a new booking is made.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Technician Signups</Label>
                                    <p className="text-sm text-slate-500">Receive an email when a new technician registers.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme</CardTitle>
                            <CardDescription>Select the theme for the dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <div className="cursor-pointer border-2 border-primary rounded-lg p-4 flex flex-col items-center gap-2 bg-slate-50">
                                <Sun className="h-6 w-6 text-slate-900" />
                                <span className="font-medium text-sm">Light</span>
                            </div>
                            <div className="cursor-pointer border-2 border-slate-200 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors">
                                <Moon className="h-6 w-6 text-slate-900" />
                                <span className="font-medium text-sm">Dark</span>
                            </div>
                            <div className="cursor-pointer border-2 border-slate-200 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors">
                                <Monitor className="h-6 w-6 text-slate-900" />
                                <span className="font-medium text-sm">System</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
