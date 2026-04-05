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

import { useGetMyBookings } from "@/src/hooks/useBookings";

export default function MyBookingsPage() {
    const { data: realBookings = [], isLoading } = useGetMyBookings();

    const mappedBookings = realBookings.map((b: any) => {
        const d = new Date(b.scheduledDate || new Date());
        let statusColor = "";
        let displayStatus = b.status;

        switch (displayStatus) {
            case "PENDING":
            case "ASSIGNED":
                statusColor = "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400";
                break;
            case "COMPLETED":
                statusColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
                break;
            case "CANCELLED":
                statusColor = "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400";
                break;
            default:
                statusColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
                displayStatus = "In Progress";
        }

        let paymentStatus = "Pending";
        let paymentColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
        if (b.payment?.status === "PAID") {
            paymentStatus = "Paid";
            paymentColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
        } else if (b.payment?.paymentMethod === "COD") {
            paymentStatus = "Cash on Delivery";
            paymentColor = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
        }

        return {
            id: b.id,
            shortId: b.id.substring(0, 4).toUpperCase(),
            service: b.service?.name || "Unknown Service",
            category: b.service?.category?.name || "General",
            status: displayStatus,
            date: format(d, "MMM d, yyyy"),
            time: format(d, "hh:mm a"),
            price: `Rs. ${b.service?.price || 0}`,
            statusColor,
            description: b.description || "No specific details provided.",
            paymentStatus,
            paymentColor,
            address: "No address provided"
        };
    });

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>(null);
    const [editingDate, setEditingDate] = useState<Date | undefined>(undefined);

    const handleEditClick = (booking: any) => {
        setEditingBooking({ ...booking });
        setEditingDate(new Date(booking.date));
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        toast.info("Edit feature requires backend API integration.");
        setIsEditDialogOpen(false);
        setEditingBooking(null);
    };

    const handleCancelBooking = (id: string) => {
        toast.info("Cancellation feature requires backend API integration.");
    };

    const handleDeleteBooking = (id: string) => {
        toast.info("Delete feature requires backend API integration.");
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 max-w-5xl items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading your bookings...</p>
            </div>
        );
    }

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
                        <Badge className="bg-[#0077b6]  text-white text-xs">{mappedBookings.length} total</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {mappedBookings.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No bookings found.</div>
                    ) : mappedBookings.map((booking: any) => (
                        <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/5 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold text-[10px] shrink-0">
                                        {booking.shortId}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{booking.service}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5 text-[#0077b6]" />{booking.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-[#0077b6]" />{booking.date}, {booking.time}
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
