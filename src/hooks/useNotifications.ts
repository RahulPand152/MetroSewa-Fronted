'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

export interface AppNotification {
    id: string;
    message: string;
    type?: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

// ── User Notifications (real DB table via GET /users/notifications) ───────────
export const useUserNotifications = () => {
    return useQuery<AppNotification[]>({
        queryKey: ['user-notifications'],
        queryFn: async () => {
            const res = await axiosInstance.get('/users/notifications');
            const data: any[] = res.data?.data || [];
            return data.map(n => ({
                id: n.id,
                message: n.message,
                type: n.type,
                isRead: n.isRead,
                link: `/user/my-bookings`,  // generic link – no bookingId on notification model
                createdAt: n.createdAt,
            }));
        },
        refetchInterval: 30000,
        staleTime: 10000,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await axiosInstance.patch(`/users/notifications/${notificationId}/read`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.patch('/users/notifications/read-all');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
        },
    });
};

// ── Technician Notifications (real backend endpoint GET /technicians/notifications) ─
export const useTechnicianNotifications = () => {
    return useQuery<AppNotification[]>({
        queryKey: ['technician-notifications'],
        queryFn: async () => {
            const res = await axiosInstance.get('/technicians/notifications');
            return res.data?.data || [];
        },
        refetchInterval: 30000,
        staleTime: 10000,
    });
};

// ── Admin Notifications (real backend endpoint GET /admin/notifications) ───────
export const useAdminNotifications = () => {
    return useQuery<AppNotification[]>({
        queryKey: ['admin-notifications'],
        queryFn: async () => {
            const res = await axiosInstance.get('/admin/notifications');
            return res.data?.data || [];
        },
        refetchInterval: 30000,
        staleTime: 10000,
    });
};
