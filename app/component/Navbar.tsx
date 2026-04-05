"use client";

import Link from "next/link";
import { Menu, LogOut, LayoutDashboard, Home, Briefcase, Phone, LogIn, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile, useLogout } from "@/src/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export const NavbarPage = () => {
  const { data: profile, isLoading } = useProfile();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/signin");
      },
    });
  };

  const getDashboardLink = () => {
    if (!profile?.data) return "/";
    switch (profile.data.role) {
      case "ADMIN":
        return "/admin";
      case "TECHNICIAN":
        return "/technican";
      default:
        return "/user";
    }
  };

  const renderAuthNav = () => {
    if (isLoading) {
      return <Spinner className="h-6 w-6 animate-spin text-slate-400" />;
    }

    if (profile?.data) {
      const fullName =
        `${profile.data.firstName || ""} ${profile.data.lastName || ""}`.trim() ||
        "User";
      const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent transition-all focus-visible:ring-blue-500 hover:ring-blue-200"
            >
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={profile.data.avatar || ""}
                  alt={fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-medium">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-semibold text-sm">{fullName}</p>
                <p className="text-xs text-slate-500 truncate">
                  {profile.data.email}
                </p>
              </div>
            </div>
            <div className="px-2 py-1">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={getDashboardLink()} className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </div>
            <div className="px-2 py-1 border-t border-slate-100">
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <>
        <Link
          href="/signin"
          className="text-sm font-semibold text-[#236b9d] bg-white border border-[#236b9d] hover:bg-[#236b9d] hover:text-white h-9 px-4 flex items-center justify-center rounded-sm transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="text-sm font-semibold text-white bg-[#236b9d] hover:bg-[#1a5175] h-9 px-4 flex items-center justify-center rounded-sm shadow-sm transition-colors"
        >
          Sign Up
        </Link>
        <Link href="/technician-register" className="flex">
          <Button className="rounded-sm h-9 px-4 text-sm shadow-sm bg-[#2baba8] text-white font-semibold hover:bg-[#208f8c] transition-colors flex items-center justify-center border-none">
            Become a Technician
          </Button>
        </Link>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center cursor-pointer gap-2"
          onClick={() => router.push("/")}
        >
          {/* Logo Image */}
          <div className="flex items-center">
            <Image
              alt="MetroSewa logo"
              src="/metrosewalogo.png"
              width={80}
              height={50}
              className="object-contain p-1 w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-12"
            />
          </div>
          <div className="font-bold tracking-tight flex items-center text-sm sm:text-base md:text-xl">
            <span className="text-[#236b9d]">Metro</span>
            <span className="text-[#2baba8] ml-0.5">Sewa</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link
            href="/"
            className="font-semibold text-sm text-slate-800 hover:text-[#236b9d] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="font-semibold text-sm text-slate-800 hover:text-[#236b9d] transition-colors"
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="font-semibold text-sm text-slate-800 hover:text-[#236b9d] transition-colors"
          >
            Contacts
          </Link>
        </nav>

        {/* Desktop Buttons & Avatar */}
        <div className="hidden md:flex items-center gap-4">
          {renderAuthNav()}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-700">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[280px] sm:w-[320px] bg-white border-r border-slate-200 flex flex-col !px-0"
            >
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              {/* Logo Section */}
              <div className="px-6 pb-4 pt-2 border-b border-slate-100 flex items-center">
                <div className="flex items-center">
                  <Image
                    alt="MetroSewa logo"
                    className="object-contain"
                    src="/metrosewalogo.png"
                    width={55}
                    height={38}
                  />
                </div>
                <div className="font-bold text-xl tracking-tight flex items-center ml-2">
                  <span className="text-[#236b9d]">Metro</span>
                  <span className="text-[#2baba8] ml-0.5"> Sewa</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-2">
                <div className="flex flex-col px-3 gap-1">
                  <Link
                    href="/"
                    className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                      pathname === "/" 
                      ? "bg-gray-200 text-slate-900 font-bold" 
                      : "text-slate-700 hover:text-white hover:bg-gray-400"
                    }`}
                  >
                    <Home className="h-5 w-5 stroke-[1.5]" />
                    Home
                  </Link>

                  <Link
                    href="/services"
                    className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                      pathname.startsWith("/services") 
                      ? "bg-gray-200 text-slate-900 font-bold" 
                      : "text-slate-700 hover:text-white hover:bg-gray-400"
                    }`}
                  >
                    <Briefcase className="h-5 w-5 stroke-[1.5]" />
                    Services
                  </Link>

                  <Link
                    href="/contact"
                    className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                      pathname.startsWith("/contact") 
                      ? "bg-gray-200 text-slate-900 font-bold" 
                      : "text-slate-700 hover:text-white hover:bg-gray-400"
                    }`}
                  >
                    <Phone className="h-5 w-5 stroke-[1.5]" />
                    Contacts
                  </Link>
                </div>

                <div className="h-px bg-slate-100 w-full my-3" />

                <div className="flex flex-col px-3 gap-1">
                  {!profile?.data ? (
                    <>
                      <Link href="/signin" className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        pathname.startsWith("/signin") 
                        ? "bg-gray-200 text-slate-900 font-bold" 
                        : "text-slate-700 hover:text-white hover:bg-gray-400"
                      }`}>
                        <LogIn className="h-5 w-5 stroke-[1.5]" />
                        Login
                      </Link>

                      <Link href="/signup" className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        pathname.startsWith("/signup") 
                        ? "bg-gray-200 text-slate-900 font-bold" 
                        : "text-slate-700 hover:text-white hover:bg-gray-400"
                      }`}>
                        <UserPlus className="h-5 w-5 stroke-[1.5]" />
                        Register
                      </Link>

                      <Link href="/technician-register" className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        pathname.startsWith("/technician-register") 
                        ? "bg-gray-200 text-slate-900 font-bold" 
                        : "text-slate-700 hover:text-white hover:bg-gray-400"
                      }`}>
                        <UserCheck className="h-5 w-5 stroke-[1.5]" />
                        For Technicians
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={getDashboardLink()} className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        pathname.startsWith(getDashboardLink() || "##") 
                        ? "bg-gray-200 text-slate-900 font-bold" 
                        : "text-slate-700 hover:text-white hover:bg-gray-400"
                      }`}>
                        <LayoutDashboard className="h-5 w-5 stroke-[1.5]" />
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-4 px-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                      >
                        <LogOut className="h-5 w-5 stroke-[1.5]" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </>
                  )}
                </div>
              </div>
      </SheetContent>
    </Sheet>
        </div >
      </div >
    </header >
  );
};
