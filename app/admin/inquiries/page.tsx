"use client";

import { useState } from "react";
import { useGetContacts, useUpdateContactStatus } from "@/src/hooks/useContact";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Mail, Phone, MessageSquare, CalendarDays, BadgeInfo, MessageCircle } from "lucide-react";
import type { ContactMessage } from "@/src/hooks/useContact";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    RESOLVED: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function UserInquiriesPage() {
    const { data: contacts, isLoading, refetch } = useGetContacts();
    const { mutate: updateStatus } = useUpdateContactStatus();
    const [search, setSearch] = useState("");
    const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const filtered = contacts?.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.fullName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q)
        );
    });

    const handleStatusChange = (id: string, status: string) => {
        updateStatus({ id, status }, { onSuccess: () => refetch() });
    };

    const handleViewDetails = (contact: ContactMessage) => {
        setSelectedContact(contact);
        setIsDetailOpen(true);
    };

    return (
        <div className="p-6 max-w-6xl  space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Inquiries</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage all contact form submissions from users
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>{contacts?.length ?? 0} total inquiries</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name, email, or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold text-slate-700">Name</TableHead>
                            <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                            <TableHead className="font-semibold text-slate-700">Subject</TableHead>
                            <TableHead className="font-semibold text-slate-700">Message</TableHead>
                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : filtered?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No inquiries found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered?.map((contact) => (
                                <TableRow 
                                    key={contact.id} 
                                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                    onClick={() => handleViewDetails(contact)}
                                >
                                    <TableCell className="font-medium text-slate-900">
                                        {contact.fullName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                {contact.email}
                                            </div>
                                            {contact.phone && (
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                    {contact.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[160px]">
                                        <p className="text-sm font-medium text-slate-800 truncate">{contact.title}</p>
                                    </TableCell>
                                    <TableCell className="max-w-[220px]">
                                        <p className="text-sm text-slate-500 truncate">{contact.message}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-semibold ${STATUS_COLORS[contact.status] ?? STATUS_COLORS.PENDING}`}
                                        >
                                            {contact.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                                        {new Date(contact.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleViewDetails(contact)}
                                                    className="cursor-pointer"
                                                >
                                                    <BadgeInfo className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled className="cursor-default text-slate-400">
                                                    <MessageCircle className="mr-2 h-4 w-4" />
                                                    Quick Message View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled className="cursor-default text-slate-400">
                                                    <CalendarDays className="mr-2 h-4 w-4" />
                                                    {new Date(contact.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(contact.id, "PENDING")}
                                                    disabled={contact.status === "PENDING"}
                                                >
                                                    Mark as Pending
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(contact.id, "RESOLVED")}
                                                    disabled={contact.status === "RESOLVED"}
                                                >
                                                    Mark as Resolved
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(contact.id, "CLOSED")}
                                                    disabled={contact.status === "CLOSED"}
                                                >
                                                    Mark as Closed
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Inquiry Details</DialogTitle>
                        <DialogDescription>
                            Full details for the selected user inquiry.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedContact && (
                        <div className="space-y-5 pt-2">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedContact.fullName}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                                    <Badge
                                        variant="outline"
                                        className={`mt-1 text-xs font-semibold ${STATUS_COLORS[selectedContact.status] ?? STATUS_COLORS.PENDING}`}
                                    >
                                        {selectedContact.status}
                                    </Badge>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedContact.email}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedContact.phone || "-"}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{selectedContact.title}</p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {selectedContact.message}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created At</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {new Date(selectedContact.createdAt).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
