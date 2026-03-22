import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/src/lib/axios";
import { toast } from "sonner";

export interface ContactPayload {
    fullName: string;
    email: string;
    phone?: string;
    title: string;
    message: string;
}

export interface ContactMessage {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
}

// ── Submit Contact Message (public) ───────────────────────────────────────
export const useSubmitContact = () => {
    return useMutation({
        mutationFn: (data: ContactPayload) =>
            api.post("/contact", data).then((r) => r.data),
        onSuccess: () => {
            toast.success("Message sent successfully! We'll get back to you soon.");
        },
        onError: () => {
            toast.error("Failed to send message. Please try again.");
        },
    });
};

// ── Get All Contacts (admin) ──────────────────────────────────────────────
export const useGetContacts = () => {
    return useQuery<ContactMessage[]>({
        queryKey: ["contacts"],
        queryFn: () => api.get("/contact").then((r) => r.data.data),
    });
};

// ── Update Contact Status (admin) ─────────────────────────────────────────
export const useUpdateContactStatus = () => {
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.patch(`/contact/${id}/status`, { status }).then((r) => r.data),
        onSuccess: () => {
            toast.success("Status updated successfully.");
        },
        onError: () => {
            toast.error("Failed to update status.");
        },
    });
};
