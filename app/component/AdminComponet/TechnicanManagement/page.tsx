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
    Star,
    Wrench,
    MoreHorizontal
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
import { useGetTechnicians, useApproveTechnician } from "@/src/hooks/useAdmin";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = "name" | "rating" | "joinedDate" | null;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

interface Technician {
    id: string;
    userId: string;
    profilePicture: string | null;
    experience: number | null;
    bio: string | null;
    rating: number;
    isAvailable: boolean;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        avatar: string | null;
        address: string | null;
    };
    specializations: { id: string; name: string }[];
}

const avatarColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ isApproved, isAvailable }: { isApproved: boolean; isAvailable: boolean }) {
    if (!isApproved) {
        return (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 border-amber-200">
                Pending Approval
            </span>
        );
    }
    if (isAvailable) {
        return (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 border-green-200">
                Available
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border-blue-200">
            On Job
        </span>
    );
}

function TechnicianAvatar({ technician, size = "sm" }: { technician: Technician; size?: "sm" | "lg" }) {
    const defaultColor = avatarColors[technician.id.charCodeAt(0) % avatarColors.length];
    const initial = technician.user.firstName ? technician.user.firstName[0].toUpperCase() : "?";

    const cls = size === "lg"
        ? `flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${defaultColor}`
        : `flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${defaultColor}`;

    if (technician.user.avatar || technician.profilePicture) {
        return (
            <img
                src={technician.user.avatar || technician.profilePicture || ""}
                alt={initial}
                className={`${size === "lg" ? "h-16 w-16" : "h-9 w-9"} rounded-full object-cover shrink-0`}
            />
        );
    }
    return <div className={cls}>{initial}</div>;
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

// ─── Profile Popup ────────────────────────────────────────────────────────────
function TechnicianProfilePopup({
    technician, open, onClose,
}: {
    technician: Technician | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!technician) return null;
    const name = `${technician.user.firstName} ${technician.user.lastName}`;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Technician Profile</DialogTitle>
                    <DialogDescription>Full details of the technician</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-3 py-4">
                    <TechnicianAvatar technician={technician} size="lg" />
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{name}</h2>
                        <div className="mt-1">
                            <StatusBadge isApproved={technician.isApproved} isAvailable={technician.isAvailable} />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="mt-4 space-y-4">
                    <InfoRow icon={<Mail className="h-4 w-4 text-slate-400" />} label="Email" value={technician.user.email} />
                    <InfoRow icon={<Phone className="h-4 w-4 text-slate-400" />} label="Phone" value={technician.user.phoneNumber || "-"} />
                    <InfoRow
                        icon={<MapPin className="h-4 w-4 text-slate-400" />}
                        label="Address"
                        value={technician.user.address || "-"}
                    />
                    <InfoRow
                        icon={<Briefcase className="h-4 w-4 text-slate-400" />}
                        label="Experience"
                        value={technician.experience ? `${technician.experience} years` : "-"}
                    />
                    <InfoRow
                        icon={<Star className="h-4 w-4 text-amber-500" />}
                        label="Average Rating"
                        value={typeof technician.rating === 'number' ? `${technician.rating.toFixed(1)} Stars` : "New"}
                    />
                    <InfoRow
                        icon={<Wrench className="h-4 w-4 text-slate-400" />}
                        label="Specializations"
                        value={technician.specializations?.map(s => s.name).join(", ") || "-"}
                    />
                    <InfoRow
                        icon={<Calendar className="h-4 w-4 text-slate-400" />}
                        label="Joined Date"
                        value={new Date(technician.createdAt).toLocaleDateString("en-NP", {
                            year: "numeric", month: "long", day: "numeric",
                        })}
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

// ─── Action Dropdown ──────────────────────────────────────────────────────────
function TechnicianActionMenu({
    technician,
    onView,
}: {
    technician: Technician;
    onView: () => void;
}) {
    const { mutate: approve, isPending } = useApproveTechnician();

    const handleApprove = () => {
        approve(technician.id, {
            onSuccess: () => {
                toast.success("Technician approved");
            },
            onError: () => {
                toast.error("Failed to approve technician");
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onView} className="cursor-pointer">
                    <UserCheck className="mr-2 h-4 w-4" />
                    View Profile
                </DropdownMenuItem>

                {!technician.isApproved && (
                    <DropdownMenuItem
                        onClick={handleApprove}
                        disabled={isPending}
                        className="cursor-pointer text-green-600 focus:text-green-600"
                    >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Approve Technician
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TechnicianManagement() {
    const { data: technicians = [], isLoading } = useGetTechnicians();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(1);

    const [profileTech, setProfileTech] = useState<Technician | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const filtered = useMemo(() => {
        let list = technicians.filter((t: Technician) => {
            const name = `${t.user.firstName} ${t.user.lastName}`.toLowerCase();
            const q = search.toLowerCase();
            const matchSearch = name.includes(q) || t.user.email.toLowerCase().includes(q) || (t.user.phoneNumber && t.user.phoneNumber.includes(q));

            let matchStatus = true;
            if (statusFilter === "Pending") matchStatus = !t.isApproved;
            else if (statusFilter === "Available") matchStatus = t.isApproved && t.isAvailable;
            else if (statusFilter === "On Job") matchStatus = t.isApproved && !t.isAvailable;

            return matchSearch && matchStatus;
        });

        if (sortField) {
            list = [...list].sort((a: Technician, b: Technician) => {
                let av: any = "";
                let bv: any = "";
                if (sortField === "name") { av = a.user.firstName; bv = b.user.firstName; }
                if (sortField === "rating") { av = a.rating; bv = b.rating; }
                if (sortField === "joinedDate") { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }

                if (av < bv) return sortDir === "asc" ? -1 : 1;
                if (av > bv) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }
        return list;
    }, [technicians, search, statusFilter, sortField, sortDir]);

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

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Spinner className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Technician Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage service providers, their status, and details.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Total Technicians</p><p className="text-xl font-bold">{technicians.length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Briefcase className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Pending</p><p className="text-xl font-bold">{technicians.filter((t: Technician) => !t.isApproved).length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><UserCheck className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Available</p><p className="text-xl font-bold">{technicians.filter((t: Technician) => t.isApproved && t.isAvailable).length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Star className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Avg Rating</p><p className="text-xl font-bold">
                            {technicians.length > 0 ? (technicians.reduce((acc: number, t: Technician) => acc + t.rating, 0) / technicians.length).toFixed(1) : 0}
                        </p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search technicians..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Available">Available</option>
                    <option value="On Job">On Job</option>
                </select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Technician</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Specialties</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <SortHeader label="Rating" field="rating" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <SortHeader label="Joined Date" field="joinedDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No technicians found.</td>
                                    </tr>
                                ) : (
                                    paginated.map((tech: Technician) => (
                                        <tr key={tech.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <TechnicianAvatar technician={tech} />
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">{tech.user.firstName} {tech.user.lastName}</p>
                                                        <p className="text-xs text-slate-500">{tech.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[150px]">{tech.specializations?.map(s => s.name).join(", ") || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge isApproved={tech.isApproved} isAvailable={tech.isAvailable} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
                                                    <span className="font-medium">{tech.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(tech.createdAt).toLocaleDateString("en-NP")}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <TechnicianActionMenu
                                                    technician={tech}
                                                    onView={() => { setProfileTech(tech); setProfileOpen(true); }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-3 border-t">
                        <span className="text-sm text-slate-500">
                            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} technicians
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

            <TechnicianProfilePopup
                technician={profileTech}
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
            />
        </div>
    );
}
