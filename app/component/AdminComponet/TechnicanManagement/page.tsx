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
    Plus,
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

// ─── Types ────────────────────────────────────────────────────────────────────
type TechnicianStatus = "Active" | "Inactive" | "Suspended";
type SortField = "name" | "joinedDate" | "rating" | "jobsCompleted" | null;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

interface Technician {
    id: number;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    status: TechnicianStatus;
    rating: number;
    jobsCompleted: number;
    joinedDate: string;
    avatar: string;
    location: string;
    availability: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialTechnicians: Technician[] = [
    { id: 1, name: "Ramesh Gupta", email: "ramesh.gupta@example.com", phone: "9801234567", specialty: "Plumber", status: "Active", rating: 4.8, jobsCompleted: 154, joinedDate: "2023-11-15", avatar: "RG", location: "Kathmandu", availability: "Available" },
    { id: 2, name: "Suresh Thapa", email: "suresh.thapa@example.com", phone: "9812345678", specialty: "Electrician", status: "Active", rating: 4.5, jobsCompleted: 89, joinedDate: "2024-01-10", avatar: "ST", location: "Lalitpur", availability: "On Job" },
    { id: 3, name: "Hari Sharma", email: "hari.sharma@example.com", phone: "9823456789", specialty: "Carpenter", status: "Inactive", rating: 4.2, jobsCompleted: 45, joinedDate: "2024-02-05", avatar: "HS", location: "Bhaktapur", availability: "Unavailable" },
    { id: 4, name: "Gita Rai", email: "gita.rai@example.com", phone: "9845671234", specialty: "Cleaner", status: "Active", rating: 4.9, jobsCompleted: 210, joinedDate: "2023-10-20", avatar: "GR", location: "Kathmandu", availability: "Available" },
    { id: 5, name: "Bikram Lama", email: "bikram.lama@example.com", phone: "9867123456", specialty: "Painter", status: "Suspended", rating: 3.5, jobsCompleted: 20, joinedDate: "2024-03-12", avatar: "BL", location: "Pokhara", availability: "Unavailable" },
];

const avatarColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TechnicianStatus }) {
    const map: Record<TechnicianStatus, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Inactive: "bg-slate-100 text-slate-600 border-slate-200",
        Suspended: "bg-red-100 text-red-700 border-red-200",
    };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
            {status}
        </span>
    );
}

function TechnicianAvatar({ technician, size = "sm" }: { technician: Technician; size?: "sm" | "lg" }) {
    const color = avatarColors[technician.id % avatarColors.length];
    const cls = size === "lg"
        ? `flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ${color}`
        : `flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${color}`;
    return <div className={cls}>{technician.avatar}</div>;
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

// ─── Add/Edit Technician Dialog ───────────────────────────────────────────────
function TechnicianFormDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");

    const handleSubmit = () => {
        onSave({ name, specialty, status: "Active", joinedDate: new Date().toISOString(), rating: 5.0, jobsCompleted: 0 });
        onClose();
        setName("");
        setSpecialty("");
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Technician</DialogTitle>
                    <DialogDescription>Register a new service provider.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Specialty</label>
                        <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Plumber" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Technician</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TechnicianManagement() {
    const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let list = technicians.filter((t) => {
            const q = search.toLowerCase();
            const matchSearch = t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.specialty.toLowerCase().includes(q);
            const matchStatus = statusFilter === "All" || t.status === statusFilter;
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

    const handleAdd = (data: any) => {
        const newId = Math.max(0, ...technicians.map(t => t.id)) + 1;
        setTechnicians([...technicians, { id: newId, ...data, email: "new.tech@example.com", phone: "9800000000", avatar: "NT", location: "Ktm", availability: "Available" }]);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Technician Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage service providers, their status, and performance.</p>
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
                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><UserCheck className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Active Now</p><p className="text-xl font-bold">{technicians.filter(t => t.status === "Active").length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Briefcase className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">On Job</p><p className="text-xl font-bold">{technicians.filter(t => t.availability === "On Job").length}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Star className="h-6 w-6" /></div>
                        <div><p className="text-sm text-slate-500">Avg Rating</p><p className="text-xl font-bold">4.6</p></div>
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
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
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Specialty</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <SortHeader label="Rating" field="rating" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Jobs</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((tech) => (
                                    <tr key={tech.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <TechnicianAvatar technician={tech} />
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{tech.name}</p>
                                                    <p className="text-xs text-slate-500">{tech.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="h-3.5 w-3.5 text-slate-400" />
                                                <span>{tech.specialty}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={tech.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
                                                <span className="font-medium">{tech.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{tech.jobsCompleted}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
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

            <TechnicianFormDialog open={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAdd} />
        </div>
    );
}
