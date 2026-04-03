"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { useGetBookings, useUpdateBookingStatus } from "@/src/hooks/useAdmin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
    
import{
    Search,
    Filter,
    Calendar,
    Clock,
    MapPin,
    User,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock3,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Eye
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = "customerName" | "serviceName" | "date" | "amount" | null;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const s = (status || "UNKNOWN").toUpperCase().replace(' ', '_');
    
    const map: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
        IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
        COMPLETED: "bg-green-100 text-green-700 border-green-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };
    
    const iconMap: Record<string, React.ElementType> = {
        PENDING: Clock3,
        ASSIGNED: CheckCircle2,
        IN_PROGRESS: Clock,
        COMPLETED: CheckCircle2,
        CANCELLED: XCircle,
    };
    
    const Icon = iconMap[s] || Clock;
    const styleStr = map[s] || "bg-slate-100 text-slate-700 border-slate-200";

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styleStr}`}>
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
}

function SortHeader({ label, field, sortField, sortDir, onSort }: { label: string; field: SortField; sortField: SortField; sortDir: SortDir; onSort: (f: SortField) => void }) {
    return (
        <button onClick={() => onSort(field)} className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 transition-colors">
            {label}
            {sortField === field ? (
                sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
            ) : (
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
            )}
        </button>
    );
}

// ─── Booking Detail Dialog ────────────────────────────────────────────────────
function BookingDetailDialog({ booking, open, onClose }: { booking: any; open: boolean; onClose: () => void }) {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>ID: {booking.id}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-slate-500">Status</span>
                        <StatusBadge status={booking.status} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-slate-400 mt-1" />
                            <div>
                                <p className="text-xs text-slate-400">Customer</p>
                                <p className="font-medium">{booking.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                            <div>
                                <p className="text-xs text-slate-400">Address</p>
                                <p className="font-medium">{booking.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-slate-400 mt-1" />
                            <div>
                                <p className="text-xs text-slate-400">Date & Time</p>
                                <p className="font-medium">{booking.date} at {booking.time}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-600">Total Amount</span>
                        <span className="text-lg font-bold">Rs. {booking.amount}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingManagement() {
    const { data: rawBookings = [], isLoading } = useGetBookings();
    const { mutate: updateStatus } = useUpdateBookingStatus();
    
    // Process backend bookings into our display format
    const bookings = useMemo(() => {
        if (!Array.isArray(rawBookings)) return [];
        return rawBookings.map((b: any) => {
            const dateObj = b.scheduledDate ? new Date(b.scheduledDate) : new Date();
            return {
                id: b.id,
                customerName: `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim() || 'Unknown',
                serviceName: b.service?.name || 'Unknown Service',
                technicianName: b.technicians && b.technicians.length > 0 
                    ? `${b.technicians[0].user?.firstName || ''} ${b.technicians[0].user?.lastName || ''}`.trim()
                    : null,
                date: b.scheduledDate ? format(dateObj, "yyyy-MM-dd") : 'N/A',
                time: b.scheduledDate ? format(dateObj, "hh:mm a") : 'N/A',
                status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase().replace('_', ' ') : 'Unknown', // e.g. IN_PROGRESS -> In progress -> In Progress
                amount: b.service?.price || 0,
                address: b.address || b.user?.address || 'No Address',
                paymentStatus: b.payment?.status === "PAID" 
                    ? "Paid (Khalti)" 
                    : b.payment?.paymentMethod === "COD" 
                        ? "Cash on Delivery" 
                        : "Pending",
            };
        });
    }, [rawBookings]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(1);

    // Detail dialog
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const filtered = useMemo(() => {
        let list = bookings.filter((b: any) => {
            const q = search.toLowerCase();
            const matchSearch =
                (b.customerName || "").toLowerCase().includes(q) ||
                (b.serviceName || "").toLowerCase().includes(q) ||
                String(b.id || "").toLowerCase().includes(q);
            const matchStatus = statusFilter === "All" || (b.status || "").toUpperCase() === statusFilter.toUpperCase();
            return matchSearch && matchStatus;
        });

        if (sortField) {
            list = [...list].sort((a: any, b: any) => {
                let av: any = a[sortField];
                let bv: any = b[sortField];
                if (av < bv) return sortDir === "asc" ? -1 : 1;
                if (av > bv) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }
        return list;
    }, [bookings, search, statusFilter, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        let backendStatus = status.toUpperCase().replace(' ', '_');
        if (backendStatus === "CONFIRMED") backendStatus = "ASSIGNED"; // Map confirmed to assigned or similar if matching schema
        
        updateStatus({ id, status: backendStatus });
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center h-full p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                <p className="mt-4 text-slate-500">Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Booking Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage all service appointments.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Calendar className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Total Bookings</p><p className="text-xl font-bold">{bookings.length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Clock className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Pending</p><p className="text-xl font-bold">{bookings.filter((b:any) => (b.status || "").toUpperCase() === "PENDING").length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Completed</p><p className="text-xl font-bold">{bookings.filter((b:any) => (b.status || "").toUpperCase() === "COMPLETED").length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><AlertCircle className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Cancelled</p><p className="text-xl font-bold">{bookings.filter((b:any) => (b.status || "").toUpperCase() === "CANCELLED").length}</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search bookings..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Booking ID</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <SortHeader label="Customer" field="customerName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Service</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <SortHeader label="Date" field="date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Technician</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Payment</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <SortHeader label="Amount" field="amount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((booking: any) => (
                                    <tr key={booking.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{String(booking.id || "").substring(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">{booking.customerName}</p>
                                                <p className="text-xs text-slate-500">{booking.address}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{booking.serviceName}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-slate-900 dark:text-slate-100">{booking.date}</p>
                                                <p className="text-xs text-slate-500">{booking.time}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {booking.technicianName ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    {booking.technicianName}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                booking.paymentStatus.includes("Paid") ? "bg-green-100 text-green-700" :
                                                booking.paymentStatus.includes("Cash") ? "bg-blue-100 text-blue-700" :
                                                "bg-amber-100 text-amber-700"
                                            )}>
                                                {booking.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">Rs. {booking.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="top" align="center">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setDetailOpen(true); }}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "Confirmed")}>Mark Confirmed</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "In Progress")}>Mark In Progress</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "Completed")}>Mark Completed</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "Cancelled")} className="text-red-600">Cancel Booking</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-3 border-t">
                        <span className="text-sm text-slate-500">
                            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} bookings
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-slate-600">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <BookingDetailDialog booking={selectedBooking} open={detailOpen} onClose={() => setDetailOpen(false)} />
        </div>
    );
}
