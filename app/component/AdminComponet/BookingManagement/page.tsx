"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { formatBookingDate } from "@/lib/utils";
import { useGetBookings, useUpdateBookingStatus, useGetTechnicians, useAssignTechnician } from "@/src/hooks/useAdmin";
import { cn } from "@/lib/utils";
import Link from "next/link";

import {
    Search,
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
    Eye,
    UserPlus,
    Loader2
} from "lucide-react";
import {
    Card,
    CardContent,
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
                date: b.scheduledDate ? formatBookingDate(dateObj, "MMM d, yyyy") : 'N/A',
                time: b.scheduledDate ? format(dateObj, "hh:mm a") : 'N/A',
                status: b.status ? b.status.toUpperCase() : 'UNKNOWN',
                amount: b.service?.price || 0,
                address: b.address || b.user?.address || 'No Address',
                user: b.user,
                service: b.service,
                technicians: b.technicians,
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
        updateStatus({ id, status: backendStatus });
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-[#236b9d]" />
                <p className="mt-4 text-slate-500 font-medium">Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Booking Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage all service appointments.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="rounded-2xl border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Calendar className="h-5 w-5" /></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p><p className="text-2xl font-bold text-slate-900">{bookings.length}</p></div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-amber-100 p-3 rounded-xl text-amber-600"><Clock className="h-5 w-5" /></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</p><p className="text-2xl font-bold text-slate-900">{bookings.filter((b: any) => b.status === "PENDING").length}</p></div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><UserPlus className="h-5 w-5" /></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned</p><p className="text-2xl font-bold text-slate-900">{bookings.filter((b: any) => b.status === "ASSIGNED").length}</p></div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><Clock3 className="h-5 w-5" /></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</p><p className="text-2xl font-bold text-slate-900">{bookings.filter((b: any) => b.status === "IN_PROGRESS").length}</p></div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-green-100 p-3 rounded-xl text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">{bookings.filter((b: any) => b.status === "COMPLETED").length}</p></div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-600"><AlertCircle className="h-5 w-5" /></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cancelled</p><p className="text-2xl font-bold text-slate-900">{bookings.filter((b: any) => b.status === "CANCELLED").length}</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search bookings..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-10 border-slate-200" />
                </div>
                <div className="w-full sm:w-auto">
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="All">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <Card className="border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50/50">
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">Booking ID</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                                        <SortHeader label="Customer" field="customerName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">Service</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                                        <SortHeader label="Date" field="date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">Technician</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">Payment</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                                        <SortHeader label="Amount" field="amount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-10 text-slate-500">
                                            No bookings found matching your filters.
                                        </td>
                                    </tr>
                                ) : paginated.map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {String(booking.id || "").substring(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{booking.customerName}</span>
                                                <span className="text-xs text-slate-500 max-w-[150px] truncate">{booking.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{booking.serviceName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-medium">{booking.date}</span>
                                                <span className="text-xs text-slate-500">{booking.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.technicianName ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {booking.technicianName}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-semibold",
                                                booking.paymentStatus.includes("Paid") ? "bg-green-100 text-green-700" :
                                                    booking.paymentStatus.includes("Cash") ? "bg-blue-100 text-blue-700" :
                                                        "bg-amber-100 text-amber-700"
                                            )}>
                                                {booking.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">Rs. {booking.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-slate-700">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="bottom" align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Link href={`/admin/bookings/${booking.id}`}>
                                                            <Eye className="mr-2 h-4 w-4 text-slate-500" /> View Details & Assign
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-xs text-slate-400">Update Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "IN_PROGRESS")} className="cursor-pointer">Mark In Progress</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "COMPLETED")} className="cursor-pointer text-emerald-600 focus:text-emerald-700">Mark Completed</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "CANCELLED")} className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50">Cancel Booking</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/30">
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
                            <span className="text-sm font-medium text-slate-600 px-2">
                                {page} / {totalPages}
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

        </div>
    );
}
