"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Routes where the Footer should NOT be shown
const DASHBOARD_PREFIXES = ["/admin", "/technican", "/user"];

export default function ConditionalFooter() {
    const pathname = usePathname();
    const isDashboard = DASHBOARD_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
    );

    if (isDashboard) return null;
    return <Footer />;
}
