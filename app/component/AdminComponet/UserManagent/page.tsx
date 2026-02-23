"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
    Filter,
    UserCheck,
    UserX,
    Users,
    ShieldOff,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Briefcase,
    AlertTriangle,
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserStatus = "Active" | "Inactive" | "Banned";
type SortField = "name" | "joinedDate" | "bookings" | null;
type SortDir = "asc" | "desc";

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: UserStatus;
    joinedDate: string;
    bookings: number;
    avatar: string;
    location: string;
    address: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialUsers: User[] = [
    { id: 1, name: "Aarav Sharma", email: "aarav.sharma@gmail.com", phone: "9841234567", status: "Active", joinedDate: "2024-01-15", bookings: 12, avatar: "AS", location: "Kathmandu", address: "Baneshwor, Kathmandu" },
    { id: 2, name: "Priya Thapa", email: "priya.thapa@gmail.com", phone: "9852345678", status: "Active", joinedDate: "2024-02-20", bookings: 8, avatar: "PT", location: "Lalitpur", address: "Pulchowk, Lalitpur" },
    { id: 3, name: "Bikash Karki", email: "bikash.karki@yahoo.com", phone: "9863456789", status: "Inactive", joinedDate: "2024-01-05", bookings: 3, avatar: "BK", location: "Bhaktapur", address: "Suryabinayak, Bhaktapur" },
    { id: 4, name: "Sita Rai", email: "sita.rai@gmail.com", phone: "9874567890", status: "Active", joinedDate: "2023-11-10", bookings: 0, avatar: "SR", location: "Kathmandu", address: "Thamel, Kathmandu" },
    { id: 5, name: "Rohan Gurung", email: "rohan.gurung@hotmail.com", phone: "9885678901", status: "Active", joinedDate: "2024-03-01", bookings: 21, avatar: "RG", location: "Pokhara", address: "Lakeside, Pokhara" },
    { id: 6, name: "Anita Shrestha", email: "anita.shrestha@gmail.com", phone: "9896789012", status: "Banned", joinedDate: "2023-12-18", bookings: 1, avatar: "AN", location: "Kathmandu", address: "Koteshwor, Kathmandu" },
    { id: 7, name: "Deepak Magar", email: "deepak.magar@gmail.com", phone: "9807890123", status: "Active", joinedDate: "2024-04-10", bookings: 5, avatar: "DM", location: "Chitwan", address: "Bharatpur-10, Chitwan" },
    { id: 8, name: "Kamala Tamang", email: "kamala.tamang@gmail.com", phone: "9818901234", status: "Active", joinedDate: "2024-05-22", bookings: 9, avatar: "KT", location: "Lalitpur", address: "Imadol, Lalitpur" },
    { id: 9, name: "Suresh Limbu", email: "suresh.limbu@gmail.com", phone: "9829012345", status: "Inactive", joinedDate: "2024-02-14", bookings: 2, avatar: "SL", location: "Dharan", address: "Dharan-5, Sunsari" },
    { id: 10, name: "Nisha Pandey", email: "nisha.pandey@gmail.com", phone: "9830123456", status: "Active", joinedDate: "2024-06-01", bookings: 15, avatar: "NP", location: "Kathmandu", address: "Balaju, Kathmandu" },
    { id: 11, name: "Nisha Pandey", email: "nisha.pandey@gmail.com", phone: "9830123456", status: "Active", joinedDate: "2024-06-01", bookings: 15, avatar: "NP", location: "Kathmandu", address: "Balaju, Kathmandu" },
    { id: 13, name: "Nisha Pandey", email: "nisha.pandey@gmail.com", phone: "9830123456", status: "Active", joinedDate: "2024-06-01", bookings: 15, avatar: "NP", location: "Kathmandu", address: "Balaju, Kathmandu" },


];

const avatarColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
    "bg-yellow-500", "bg-cyan-500",
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UserStatus }) {
    const map: Record<UserStatus, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Inactive: "bg-gray-100  text-gray-600  border-gray-200",
        Banned: "bg-red-100   text-red-700   border-red-200",
    };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
            {status}
        </span>
    );
}

// ─── Sort Header Button ───────────────────────────────────────────────────────
function SortHeader({
    label, field, sortField, sortDir, onSort,
}: {
    label: string;
    field: SortField;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (f: SortField) => void;
}) {
    const active = sortField === field;
    return (
        <button
            onClick={() => onSort(field)}
            className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 transition-colors select-none"
        >
            {label}
            {active ? (
                sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
            ) : (
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
            )}
        </button>
    );
}

// ─── User Avatar ──────────────────────────────────────────────────────────────
function UserAvatar({ user, size = "sm" }: { user: User; size?: "sm" | "lg" }) {
    const color = avatarColors[user.id % avatarColors.length];
    const cls = size === "lg"
        ? `flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ${color}`
        : `flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${color}`;
    return <div className={cls}>{user.avatar}</div>;
}

// ─── Profile Popup (Dialog) ───────────────────────────────────────────────────
function UserProfilePopup({
    user, open, onClose,
}: {
    user: User | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!user) return null;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>Full details for this user account</DialogDescription>
                </DialogHeader>

                {/* Avatar + Name */}
                <div className="flex flex-col items-center gap-3 py-4">
                    <UserAvatar user={user} size="lg" />
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
                        <div className="mt-1"><StatusBadge status={user.status} /></div>
                    </div>
                </div>

                <Separator />

                {/* Info Grid */}
                <div className="mt-4 space-y-4">
                    <InfoRow icon={<Mail className="h-4 w-4 text-slate-400" />} label="Email" value={user.email} />
                    <InfoRow icon={<Phone className="h-4 w-4 text-slate-400" />} label="Phone" value={user.phone} />
                    <InfoRow
                        icon={<MapPin className="h-4 w-4 text-slate-400" />}
                        label="Location"
                        value={user.location}
                        sub={user.address}
                    />
                    <InfoRow
                        icon={<Calendar className="h-4 w-4 text-slate-400" />}
                        label="Joined"
                        value={new Date(user.joinedDate).toLocaleDateString("en-NP", {
                            year: "numeric", month: "long", day: "numeric",
                        })}
                    />
                    <InfoRow
                        icon={<Briefcase className="h-4 w-4 text-slate-400" />}
                        label="Total Bookings"
                        value={String(user.bookings)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
                {sub && <p className="text-xs text-slate-400">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteDialog({
    user, open, onClose, onConfirm,
}: {
    user: User | null;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <DialogTitle>Delete User</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Action Dropdown ──────────────────────────────────────────────────────────
function UserActionMenu({
    user,
    onView,
    onStatusChange,
    onDelete,
}: {
    user: User;
    onView: () => void;
    onStatusChange: (status: UserStatus) => void;
    onDelete: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* View Profile */}
                <DropdownMenuItem onClick={onView} className="cursor-pointer">
                    <Mail className="mr-2 h-4 w-4" />
                    View Profile
                </DropdownMenuItem>

                {/* Change Status submenu */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Change Status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem
                            onClick={() => onStatusChange("Active")}
                            className="cursor-pointer text-green-600 focus:text-green-600"
                        >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onStatusChange("Inactive")}
                            className="cursor-pointer text-gray-600 focus:text-gray-600"
                        >
                            <UserX className="mr-2 h-4 w-4" />
                            Set Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onStatusChange("Banned")}
                            className="cursor-pointer text-orange-600 focus:text-orange-600"
                        >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Ban User
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Delete */}
                <DropdownMenuItem
                    onClick={onDelete}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Delete User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────
function StatsCards({ users }: { users: User[] }) {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const inactive = users.filter((u) => u.status === "Inactive").length;
    const banned = users.filter((u) => u.status === "Banned").length;

    const stats = [
        { label: "Total Users", value: total, icon: Users, bg: "bg-blue-100", ic: "text-blue-600" },
        { label: "Active", value: active, icon: UserCheck, bg: "bg-green-100", ic: "text-green-600" },
        { label: "Inactive", value: inactive, icon: UserX, bg: "bg-gray-100", ic: "text-gray-600" },
        { label: "Banned", value: banned, icon: ShieldOff, bg: "bg-red-100", ic: "text-red-600" },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {stats.map((s) => (
                <Card key={s.label}>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                            <s.icon className={`h-5 w-5 ${s.ic}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{s.label}</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserManagement() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    // Profile sheet
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    // Delete dialog
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // ── Handlers ──
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setPage(1);
    };

    const handleStatusChange = (userId: number, status: UserStatus) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, status } : u))
        );
    };

    const handleDelete = () => {
        if (!deleteUser) return;
        setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
        setDeleteOpen(false);
        setDeleteUser(null);
    };

    // ── Filter + Sort ──
    const filtered = useMemo(() => {
        let list = users.filter((u) => {
            const q = search.toLowerCase();
            const matchSearch =
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.phone.includes(q);
            const matchStatus = statusFilter === "All" || u.status === statusFilter;
            return matchSearch && matchStatus;
        });

        if (sortField) {
            list = [...list].sort((a, b) => {
                let av: string | number = "";
                let bv: string | number = "";
                if (sortField === "name") { av = a.name; bv = b.name; }
                if (sortField === "joinedDate") { av = a.joinedDate; bv = b.joinedDate; }
                if (sortField === "bookings") { av = a.bookings; bv = b.bookings; }
                if (av < bv) return sortDir === "asc" ? -1 : 1;
                if (av > bv) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }
        return list;
    }, [users, search, statusFilter, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage all registered users on MetroSewa</p>
            </div>

            {/* Stats */}
            <StatsCards users={users} />

            {/* Table Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="h-9 w-52 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                                />
                            </div>
                            {/* Status Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 appearance-none cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Banned">Banned</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                                    <th className="px-6 py-3 text-left font-medium text-slate-500 w-10">S.N</th>
                                    <th className="px-6 py-3 text-left">
                                        <SortHeader label="User" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Phone</th>
                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Location</th>
                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
                                    <th className="px-6 py-3 text-left">
                                        <SortHeader label="Bookings" field="bookings" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <SortHeader label="Joined" field="joinedDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-900/30"
                                        >
                                            {/* S.N — global across pages */}
                                            <td className="px-6 py-4 text-slate-400">{(page - 1) * PAGE_SIZE + index + 1}</td>

                                            {/* User */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={user} />
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                                        <p className="text-xs text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.phone}</td>

                                            {/* Location */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>{user.location}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <StatusBadge status={user.status} />
                                            </td>

                                            {/* Bookings */}
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.bookings}</td>

                                            {/* Joined */}
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {new Date(user.joinedDate).toLocaleDateString("en-NP", {
                                                    year: "numeric", month: "short", day: "numeric",
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <UserActionMenu
                                                    user={user}
                                                    onView={() => { setProfileUser(user); setProfileOpen(true); }}
                                                    onStatusChange={(s) => handleStatusChange(user.id, s)}
                                                    onDelete={() => { setDeleteUser(user); setDeleteOpen(true); }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                        <p className="text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">{filtered.length}</span>{" "}
                            users
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="h-8 w-8 p-0"
                            >
                                «
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 px-3"
                            >
                                Previous
                            </Button>
                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${i}`} className="px-1 text-slate-400">…</span>
                                    ) : (
                                        <Button
                                            key={p}
                                            variant={page === p ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(p as number)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {p}
                                        </Button>
                                    )
                                )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="h-8 px-3"
                            >
                                Next
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                »
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Profile Popup */}
            <UserProfilePopup
                user={profileUser}
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                user={deleteUser}
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
