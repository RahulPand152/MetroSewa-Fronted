import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

export const useGetUsers = () => {
    return useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/users');
            return response.data.data;
        },
    });
};

export const useGetTechnicians = () => {
    return useQuery({
        queryKey: ['admin', 'technicians'],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/technicians');
            return response.data.data;
        },
    });
};

export const useApproveTechnician = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (technicianId: string) => {
            const response = await axiosInstance.patch(`/admin/technicians/${technicianId}/approve`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'technicians'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await axiosInstance.delete(`/admin/users/${userId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};
