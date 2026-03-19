"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
    Filter,
    Users,
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGetUsers, useDeleteUser } from "@/src/hooks/useAdmin";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = "name" | "joinedDate" | "bookings" | null;
type SortDir = "asc" | "desc";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    avatar: string | null;
    address: string | null;
    isEmailVerified: boolean;
    createdAt: string;
    _count: {
        bookings: number;
    };
}

const avatarColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
    "bg-yellow-500", "bg-cyan-500",
];

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
    const color = avatarColors[user.id.charCodeAt(0) % avatarColors.length];
    const initial = user.firstName ? user.firstName[0].toUpperCase() : "?";
    const cls = size === "lg"
        ? `flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${color}`
        : `flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`;

    if (user.avatar) {
        return <img src={user.avatar} alt={initial} className={`${size === "lg" ? 'h-16 w-16' : 'h-9 w-9'} rounded-full object-cover shrink-0`} />;
    }
    return <div className={cls}>{initial}</div>;
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
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</h2>
                        <div className="mt-1">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${user.isEmailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {user.isEmailVerified ? "Verified User" : "Unverified"}
                            </span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Info Grid */}
                <div className="mt-4 space-y-4">
                    <InfoRow icon={<Mail className="h-4 w-4 text-slate-400" />} label="Email" value={user.email} />
                    <InfoRow icon={<Phone className="h-4 w-4 text-slate-400" />} label="Phone" value={user.phoneNumber || "-"} />
                    <InfoRow
                        icon={<MapPin className="h-4 w-4 text-slate-400" />}
                        label="Address"
                        value={user.address || "-"}
                    />
                    <InfoRow
                        icon={<Calendar className="h-4 w-4 text-slate-400" />}
                        label="Joined"
                        value={new Date(user.createdAt).toLocaleDateString("en-NP", {
                            year: "numeric", month: "long", day: "numeric",
                        })}
                    />
                    <InfoRow
                        icon={<Briefcase className="h-4 w-4 text-slate-400" />}
                        label="Total Bookings"
                        value={String(user._count?.bookings || 0)}
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
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.firstName}</span>?
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
    onDelete,
}: {
    user: User;
    onView: () => void;
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
    const verified = users.filter((u) => u.isEmailVerified).length;
    const unverified = total - verified;

    const stats = [
        { label: "Total Users", value: total, icon: Users, bg: "bg-blue-100", ic: "text-blue-600" },
        { label: "Active Bookings", value: users.reduce((acc, u) => acc + (u._count?.bookings || 0), 0), icon: Briefcase, bg: "bg-purple-100", ic: "text-purple-600" },
        { label: "Verified Email", value: verified, icon: Mail, bg: "bg-green-100", ic: "text-green-600" },
        { label: "Unverified", value: unverified, icon: AlertTriangle, bg: "bg-amber-100", ic: "text-amber-600" },
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
    const { data: users = [], isLoading } = useGetUsers();
    const deleteUserMutation = useDeleteUser();

    const [search, setSearch] = useState("");
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

    const handleDelete = () => {
        if (!deleteUser) return;

        deleteUserMutation.mutate(deleteUser.id, {
            onSuccess: () => {
                toast.success("User deleted successfully");
                setDeleteOpen(false);
                setDeleteUser(null);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Failed to delete user");
            }
        });
    };

    // ── Filter + Sort ──
    const filtered = useMemo(() => {
        let list = users.filter((u: User) => {
            const name = `${u.firstName} ${u.lastName}`.toLowerCase();
            const q = search.toLowerCase();
            const matchSearch =
                name.includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.phoneNumber && u.phoneNumber.includes(q));
            return matchSearch;
        });

        if (sortField) {
            list = [...list].sort((a: User, b: User) => {
                let av: string | number = "";
                let bv: string | number = "";
                if (sortField === "name") { av = a.firstName; bv = b.firstName; }
                if (sortField === "joinedDate") { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }
                if (sortField === "bookings") { av = a._count?.bookings || 0; bv = b._count?.bookings || 0; }
                if (av < bv) return sortDir === "asc" ? -1 : 1;
                if (av > bv) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }
        return list;
    }, [users, search, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Spinner className="h-8 w-8 animate-spin" /></div>;
    }

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
                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Address</th>
                                    <th className="px-6 py-3 text-left">
                                        <SortHeader label="Bookings" field="bookings" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <SortHeader label="Joined Date" field="joinedDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((user: User, index: number) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-900/30"
                                        >
                                            <td className="px-6 py-4 text-slate-400">{(page - 1) * PAGE_SIZE + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={user} />
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.phoneNumber || "-"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[150px]">{user.address || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user._count?.bookings || 0}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {new Date(user.createdAt).toLocaleDateString("en-NP", {
                                                    year: "numeric", month: "short", day: "numeric",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <UserActionMenu
                                                    user={user}
                                                    onView={() => { setProfileUser(user); setProfileOpen(true); }}
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
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 px-3"
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
                                className="h-8 px-3"
                            >
                                Next
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
