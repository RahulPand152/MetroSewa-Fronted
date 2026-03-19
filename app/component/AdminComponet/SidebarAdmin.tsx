"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserCog,
    BarChart3,
    Settings,
    LogOut,
    Hammer,
    Wrench
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogout, useProfile } from "@/src/hooks/useAuth";

const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, tooltip: "Dashboard" },
    { label: "Users", href: "/admin/users", icon: Users, tooltip: "Users" },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar, tooltip: "Bookings" },
    { label: "Services", href: "/admin/services", icon: Wrench, tooltip: "Services" },
    { label: "Technicians", href: "/admin/technicians", icon: UserCog, tooltip: "Technicians" },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, tooltip: "Analytics" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();
    const { data: profile } = useProfile();

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                router.push("/signin");
            },
        });
    };

    const fullName = profile?.data
        ? `${profile.data.firstName ?? ""} ${profile.data.lastName ?? ""}`.trim()
        : "Admin";
    const initials = fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                        <Hammer className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-primary truncate group-data-[collapsible=icon]:hidden">
                        MetroSewa
                    </h1>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === "/admin"
                                        ? pathname === "/admin"
                                        : pathname.startsWith(item.href);
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton isActive={isActive} tooltip={item.tooltip} asChild>
                                            <Link href={item.href} className="flex items-center gap-2">
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto border border-slate-200">
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Settings" asChild>
                                    <Link href="/admin/settings">
                                        <Settings />
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <Dialog>
                                <SidebarMenuItem>
                                    <DialogTrigger asChild>
                                        <SidebarMenuButton
                                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                            tooltip="Logout"
                                        >
                                            <LogOut />
                                            <span>Logout</span>
                                        </SidebarMenuButton>
                                    </DialogTrigger>
                                </SidebarMenuItem>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirm Logout</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to log out of your account?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogTrigger>
                                        <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
                                            {isLoggingOut ? "Logging out..." : "Logout"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm">
                        {profile?.data?.avatar && (
                            <AvatarImage src={profile.data.avatar} alt={fullName} />
                        )}
                        <AvatarFallback className="bg-indigo-500 text-white text-sm font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{fullName}</p>
                        <p className="truncate text-xs text-slate-500">System Admin</p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
