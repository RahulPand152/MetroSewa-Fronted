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
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Briefcase,
    User,
    Settings,
    LogOut,
    Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "Dashboard", href: "/technican", icon: LayoutDashboard, tooltip: "Dashboard" },
    { label: "My Jobs", href: "/technican/my-jobs", icon: Briefcase, tooltip: "My Jobs" },
    { label: "Profile", href: "/technican/profile", icon: User, tooltip: "Profile" },
    { label: "Settings", href: "/technican/settings", icon: Settings, tooltip: "Settings" },
];

export default function SidebarTechnican() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            {/* ── Header ─────────────────────────────────── */}
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30 flex-shrink-0">
                        <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden min-w-0">
                        <p className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate leading-tight">
                            MetroSewa
                        </p>
                        <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 border-0 px-1.5 mt-0.5"
                        >
                            Technician Portal
                        </Badge>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarSeparator />

            {/* ── Navigation ─────────────────────────────── */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === "/technican"
                                        ? pathname === "/technican"
                                        : pathname.startsWith(item.href);
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.tooltip}
                                            asChild
                                            className={
                                                isActive
                                                    ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 font-semibold"
                                                    : ""
                                            }
                                        >
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

                {/* ── Logout ─────────────────────────────── */}
                <SidebarGroup className="mt-auto">
                    <SidebarSeparator className="mb-2" />
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="text-rose-500 hover:text-white hover:bg-rose-500 dark:text-rose-400 dark:hover:bg-rose-600 transition-colors"
                                    tooltip="Logout"
                                >
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer – User Profile ────────────────────── */}
            <SidebarFooter className="p-3">
                <Link
                    href="/technican/profile"
                    className="flex items-center gap-3 rounded-xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/70 dark:bg-sky-900/10 p-3 hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent"
                >
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9 border-2 border-sky-200 dark:border-sky-800">
                            <AvatarImage
                                src="https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0ea5e9&color=fff&size=80"
                                alt="Rajesh Kumar"
                            />
                            <AvatarFallback className="bg-sky-500 text-white text-sm font-bold">RK</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-400" />
                    </div>

                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            Rajesh Kumar
                        </p>
                        <p className="truncate text-xs text-sky-500 dark:text-sky-400 font-medium">
                            View Profile →
                        </p>
                    </div>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}
