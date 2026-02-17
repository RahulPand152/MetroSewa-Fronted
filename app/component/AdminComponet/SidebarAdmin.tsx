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
import {
    LayoutDashboard,
    Users,
    Calendar,
    PenTool,
    UserCog,
    BarChart3,
    Settings,
    LogOut,
    Hammer,
    Wrench
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminSidebar() {
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
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive tooltip="Dashboard">
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Users">
                                    <Users />
                                    <span>User</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Bookings">
                                    <Calendar />
                                    <span>Bookings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Services">
                                    <Wrench />
                                    <span>Services</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Technicians">
                                    <UserCog />
                                    <span>Technicians</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Analytics">
                                    <BarChart3 />
                                    <span>Analytics</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto border border-slate-200">
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Settings">
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" tooltip="Logout">
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPVjfM8YBd0J8lta0_KGP-ZindhsJG3lnomjhw9gPjf0pSHYFYLj6_o8hrfyl4sIDrZzcH9NP2Mr603XAEJF95Iw_xg4uvhwU_ahgKsc-aMdJhwmof5zeA26yuRlf4IXogyrefKFwGXdPUuxVsHjbPO8dYlFpdqUBUjLbPbk5F_tUiVrWAkAaH2D2RH0ILsmQp0Sqj-G5XzIFMmK5zWYftY1pjf25mKkaa1O7cOFoeuTVl_9fbTucM3ZQ4GlB5VL_syqiRFatC4cM3"
                        alt="Admin Profile"
                        className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm dark:border-slate-700"
                        width={40}
                        height={40}
                    />
                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">Rahul Sharma</p>
                        <p className="truncate text-xs text-slate-500">System Admin</p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
