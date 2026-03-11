"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
// removed TechnicianRegistrationModal

export const NavbarPage = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md">
            ✕
          </div>
          <span className="text-lg font-semibold">
            MetroSewa
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className=" font-semibold text-lg">
            Home
          </Link>
          <Link
            href="/contact"
            className=" font-semibold text-lg"
          >
            Contacts
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/signin"
            className="text-sm font-medium text-white font-semibold text-2xl bg-gray-500 hover:bg-gray-600 px-5 py-2 rounded-full"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white font-semibold text-2xl bg-gray-500 hover:bg-gray-600 px-5 py-2 rounded-full"
          >
            Sign Up
          </Link>

          <Link href="/technician-register">
            <Button className="rounded-full px-5 shadow-sm bg-gray-600 font-semibold hover:bg-gray-700">
              Become an Technician
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-6">
                <Link href="/" className="text-sm font-medium">
                  Home
                </Link>
                <Link href="/services" className="text-sm font-medium">
                  Services
                </Link>
                <Link href="/signin" className="text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="text-sm font-medium">
                  Sign Up
                </Link>

                <Link href="/technician-register" className="mt-4 w-full">
                  <Button className="w-full rounded-full">
                    Become a Technician
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>

  )
}
