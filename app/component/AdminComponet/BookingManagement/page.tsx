"use client";

import React, { useState, useMemo } from "react";
import {
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
type BookingStatus = "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
type SortField = "customerName" | "serviceName" | "date" | "amount" | null;
type SortDir = "asc" | "desc";

interface Booking {
    id: string;
    customerName: string;
    serviceName: string;
    technicianName: string | null;
    date: string;
    time: string;
    status: BookingStatus;
    amount: number;
    address: string;
    paymentStatus: "Paid" | "Unpaid" | "Pending";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialBookings: Booking[] = [
    { id: "BK-001", customerName: "Aarav Sharma", serviceName: "Leak Repair", technicianName: "Ramesh Gupta", date: "2024-06-15", time: "10:00 AM", status: "Completed", amount: 1500, address: "Baneshwor, Kathmandu", paymentStatus: "Paid" },
    { id: "BK-002", customerName: "Priya Thapa", serviceName: "Deep Cleaning", technicianName: "Gita Rai", date: "2024-06-16", time: "02:00 PM", status: "In Progress", amount: 3500, address: "Pulchowk, Lalitpur", paymentStatus: "Pending" },
    { id: "BK-003", customerName: "Sita Rai", serviceName: "Electric Wiring", technicianName: null, date: "2024-06-18", time: "11:30 AM", status: "Pending", amount: 2000, address: "Thamel, Kathmandu", paymentStatus: "Unpaid" },
    { id: "BK-004", customerName: "Rohan Gurung", serviceName: "AC Service", technicianName: "Suresh Thapa", date: "2024-06-14", time: "04:00 PM", status: "Confirmed", amount: 2500, address: "Lakeside, Pokhara", paymentStatus: "Unpaid" },
    { id: "BK-005", customerName: "Bikash Karki", serviceName: "Pipe Installation", technicianName: "Ramesh Gupta", date: "2024-06-10", time: "09:00 AM", status: "Cancelled", amount: 1200, address: "Suryabinayak, Bhaktapur", paymentStatus: "Unpaid" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
    const map: Record<BookingStatus, string> = {
        Pending: "bg-amber-100 text-amber-700 border-amber-200",
        Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
        "In Progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
        Completed: "bg-green-100 text-green-700 border-green-200",
        Cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    const iconMap: Record<BookingStatus, React.ElementType> = {
        Pending: Clock3,
        Confirmed: CheckCircle2,
        "In Progress": Clock,
        Completed: CheckCircle2,
        Cancelled: XCircle,
    };
    const Icon = iconMap[status];

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
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
function BookingDetailDialog({ booking, open, onClose }: { booking: Booking | null; open: boolean; onClose: () => void }) {
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
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    // Detail dialog
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const filtered = useMemo(() => {
        let list = bookings.filter((b) => {
            const q = search.toLowerCase();
            const matchSearch =
                b.customerName.toLowerCase().includes(q) ||
                b.serviceName.toLowerCase().includes(q) ||
                b.id.toLowerCase().includes(q);
            const matchStatus = statusFilter === "All" || b.status === statusFilter;
            return matchSearch && matchStatus;
        });

        if (sortField) {
            list = [...list].sort((a, b) => {
                let av: any = a[sortField];
                let bv: any = b[sortField];
                if (av < bv) return sortDir === "asc" ? -1 : 1;
                if (av > bv) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }
        return list;
    }, [bookings, search, statusFilter, sortField, sortDir]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const handleStatusChange = (id: string, status: BookingStatus) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    };

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
                        <div><p className="text-sm text-slate-500">Pending</p><p className="text-xl font-bold">{bookings.filter(b => b.status === "Pending").length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Completed</p><p className="text-xl font-bold">{bookings.filter(b => b.status === "Completed").length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><AlertCircle className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Cancelled</p><p className="text-xl font-bold">{bookings.filter(b => b.status === "Cancelled").length}</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
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
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <SortHeader label="Amount" field="amount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((booking) => (
                                    <tr key={booking.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{booking.id}</td>
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
                                        <td className="px-6 py-4 font-medium">Rs. {booking.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
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
                </CardContent>
            </Card>

            <BookingDetailDialog booking={selectedBooking} open={detailOpen} onClose={() => setDetailOpen(false)} />
        </div>
    );
}
