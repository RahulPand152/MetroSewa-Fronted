import AdminSidebar from "@/app/component/AdminComponet/SidebarAdmin";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotificationBell from "@/app/component/NotificationBell";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Dashboard</span>
                    <div className="flex-1" />
                    <NotificationBell role="admin" />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
