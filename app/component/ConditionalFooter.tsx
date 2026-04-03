"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Routes where the Footer should NOT be shown
const NO_FOOTER_PREFIXES = ["/admin", "/technican", "/user", "/signin", "/signup", "/forget-password", "/otp-verification", "/technician-register"];

export default function ConditionalFooter() {
    const pathname = usePathname();
    const shouldHideFooter = NO_FOOTER_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
    );

    if (shouldHideFooter) return null;
    return <Footer />;
}
