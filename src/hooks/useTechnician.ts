import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { toast } from 'sonner';

export const useGetMyJobs = () => {
    return useQuery({
        queryKey: ['technician-jobs'],
        queryFn: async () => {
            const response = await axiosInstance.get('/technicians/bookings');
            return response.data?.data || [];
        },
    });
};

export const useGetJobById = (bookingId: string) => {
    return useQuery({
        queryKey: ['technician-jobs', bookingId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/technicians/bookings/${bookingId}`);
            return response.data?.data;
        },
        enabled: !!bookingId,
    });
};

export const useAcceptJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            const response = await axiosInstance.patch(`/technicians/bookings/${bookingId}/accept`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['technician-jobs'] });
            toast.success('Job accepted! Status updated to In Progress.');
        },
        onError: () => {
            toast.error('Failed to accept job');
        },
    });
};

export const useCompleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            const response = await axiosInstance.patch(`/technicians/bookings/${bookingId}/complete`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['technician-jobs'] });
            toast.success('Job marked as completed!');
        },
        onError: () => {
            toast.error('Failed to complete job');
        },
    });
};
