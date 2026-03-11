"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, MapPin, Clock, AlignLeft, Receipt, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is installed, otherwise standard alert/console

const initialBookings = [
    {
        id: "B-1029", service: "Plumbing Repair", category: "Plumbing", status: "Upcoming",
        date: "Today", time: "3:00 PM", price: "Rs. 1,200",
        statusColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
        description: "Fixing a leaky pipe under the kitchen sink. Requires urgent attention before it damages the wooden cabinet."
    },
    {
        id: "B-1028", service: "AC Servicing", category: "Appliance Repair", status: "Completed",
        date: "Feb 23, 2026", time: "10:00 AM", price: "Rs. 2,500",
        statusColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        description: "Standard AC servicing including filter cleaning, gas check, and overall performance tuning."
    },
    {
        id: "B-1027", service: "House Cleaning", category: "Cleaning", status: "Cancelled",
        date: "Feb 15, 2026", time: "9:00 AM", price: "Rs. 3,000",
        statusColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
        description: "Deep cleaning of a 3BHK apartment including bathrooms, kitchen, and living areas."
    },
];

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState(initialBookings);

    // Load any bookings saved from Book Now flow
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("metro_bookings") || "[]");
            if (stored.length > 0) {
                // Merge: stored bookings first (newest), then initial seed (avoid duplicates by id)
                setBookings([
                    ...stored,
                    ...initialBookings.filter(
                        (ib) => !stored.some((sb: any) => sb.id === ib.id)
                    ),
                ]);
            }
        } catch (_) { }
    }, []);

    // State for Editing
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>(null);
    const [editingDate, setEditingDate] = useState<Date | undefined>(undefined);

    const handleCancelBooking = (id: string) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status: "Cancelled", statusColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" } : b
        ));
        // You would typically also call an API here
    };

    const handleDeleteBooking = (id: string) => {
        setBookings(prev => prev.filter(b => b.id !== id));
        try {
            const stored = JSON.parse(localStorage.getItem("metro_bookings") || "[]");
            localStorage.setItem(
                "metro_bookings",
                JSON.stringify(stored.filter((b: any) => b.id !== id))
            );
        } catch (_) { }
    };

    const handleEditClick = (booking: any) => {
        setEditingBooking({ ...booking });
        // Try parsing the existing date, otherwise leave undefined
        let parsedDate: Date | undefined = undefined;
        try {
            const d = new Date(booking.date);
            if (!isNaN(d.getTime())) parsedDate = d;
        } catch (e) { }
        setEditingDate(parsedDate);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (!editingBooking) return;
        const finalBooking = { ...editingBooking };
        if (editingDate) {
            finalBooking.date = format(editingDate, "MMM d, yyyy");
        }
        setBookings(prev => prev.map(b => b.id === finalBooking.id ? finalBooking : b));
        setIsEditDialogOpen(false);
        setEditingBooking(null);
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Bookings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage all your service bookings</p>
            </div>

            {/* Bookings List */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200">All Bookings</CardTitle>
                        <Badge className="bg-sky-500 hover:bg-sky-600 text-white text-xs">{bookings.length} total</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/5 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold text-[10px] shrink-0">
                                        {booking.id.split('-')[1]}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{booking.service}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5 text-sky-400" />{booking.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-sky-400" />{booking.date}, {booking.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <Badge variant="secondary" className={`${booking.statusColor} border-0 rounded-full px-3 shrink-0`}>
                                    {booking.status}
                                </Badge>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{booking.price}</span>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="text-xs border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
                                                Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <div className="flex items-center justify-between mt-2">
                                                    <Badge variant="secondary" className={`${booking.statusColor} border-0 rounded-full px-3`}>
                                                        {booking.status}
                                                    </Badge>
                                                    <span className="text-sm text-slate-500 font-medium">{booking.id}</span>
                                                </div>
                                                <DialogTitle className="text-xl pt-2 pb-1">{booking.service}</DialogTitle>
                                                <DialogDescription className="flex items-center gap-1">
                                                    <Briefcase className="h-3.5 w-3.5" /> {booking.category}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-6 py-4">
                                                {/* Date & Time */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-sky-500" /> Date
                                                        </span>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{booking.date}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-sky-500" /> Time
                                                        </span>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{booking.time}</span>
                                                    </div>
                                                </div>

                                                <Separator className="bg-slate-100 dark:bg-slate-800" />

                                                {/* Description */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                        <AlignLeft className="h-3.5 w-3.5 text-slate-400" /> Details
                                                    </span>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        {booking.description}
                                                    </p>
                                                </div>

                                                <Separator className="bg-slate-100 dark:bg-slate-800" />

                                                {/* Price */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                                                        <Receipt className="h-4 w-4 text-slate-400" /> Total Amount
                                                    </span>
                                                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                        {booking.price}
                                                    </span>
                                                </div>
                                            </div>

                                            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-start">
                                                {booking.status === "Upcoming" && (
                                                    <>
                                                        <DialogClose asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="text-sky-600 border-sky-200 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-900/50 dark:hover:bg-sky-900/20"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleEditClick(booking);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" /> Edit Booking
                                                            </Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-900/20"
                                                                onClick={() => handleCancelBooking(booking.id)}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
                                                            </Button>
                                                        </DialogClose>
                                                    </>
                                                )}

                                                {(booking.status === "Completed" || booking.status === "Cancelled") && (
                                                    <DialogClose asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="text-slate-600 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                                                            onClick={() => handleDeleteBooking(booking.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" /> Delete Record
                                                        </Button>
                                                    </DialogClose>
                                                )}
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Edit Dialog */}
                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit Booking</DialogTitle>
                                                <DialogDescription>
                                                    Modify the date, time, and description of your service requirement.
                                                </DialogDescription>
                                            </DialogHeader>

                                            {editingBooking && (
                                                <div className="grid gap-4 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>Preferred Date</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full justify-start text-left font-normal",
                                                                        !editingDate && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                    {editingDate ? format(editingDate, "PPP") : <span>Pick a date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 z-[10000] pointer-events-auto" align="start">
                                                                <CalendarUI
                                                                    mode="single"
                                                                    selected={editingDate}
                                                                    onSelect={setEditingDate}
                                                                    className="bg-white dark:bg-slate-950 rounded-md border"
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="edit-time">Preferred Time</Label>
                                                        <Input
                                                            id="edit-time"
                                                            value={editingBooking.time}
                                                            onChange={(e) => setEditingBooking({ ...editingBooking, time: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="edit-description">Description of Issue</Label>
                                                        <Textarea
                                                            id="edit-description"
                                                            className="min-h-[100px] resize-none"
                                                            value={editingBooking.description}
                                                            onChange={(e) => setEditingBooking({ ...editingBooking, description: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <DialogFooter className="flex gap-2">
                                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="button" className="bg-sky-500 hover:bg-sky-600 text-white" onClick={handleSaveEdit}>
                                                    Save Changes
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
