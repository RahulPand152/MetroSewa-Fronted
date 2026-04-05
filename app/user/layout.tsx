import SidebarUser from "@/app/component/UserComponent/SidebarUser";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserCircle } from "lucide-react";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <SidebarUser />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1 text-gray-600 hover:text-gray-400" />

                </header>

                {/* Page content */}
                <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-3.5rem)] p-4 md:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
