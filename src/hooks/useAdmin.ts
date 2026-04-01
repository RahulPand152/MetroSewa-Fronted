import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { toast } from 'sonner';

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

export type AdminService = any;
export type ServiceImage = any;

export const useGetCategories = () => {
    return useQuery({
        queryKey: ['admin', 'categories'],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/categories');
            return response.data.data;
        },
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await axiosInstance.post(`/admin/categories`, formData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const response = await axiosInstance.put(`/admin/categories/${id}`, formData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete(`/admin/categories/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
        },
    });
};

export const useGetAdminServices = (categoryId?: string) => {
    return useQuery({
        queryKey: ['admin', 'services', categoryId],
        queryFn: async () => {
            const params = categoryId && categoryId !== 'all' ? { categoryId } : undefined;
            const response = await axiosInstance.get('/admin/services', { params });
            return response.data.data;
        },
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await axiosInstance.post(`/admin/services`, formData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const response = await axiosInstance.put(`/admin/services/${id}`, formData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete(`/admin/services/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
        },
    });
};

export const useGetBookings = () => {
    return useQuery({
        queryKey: ['admin', 'bookings'],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/bookings');
            return response.data.data;
        },
    });
};

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const response = await axiosInstance.patch(`/admin/bookings/${id}/status`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            toast.success("Booking status updated successfully");
        },
    });
};



export const useToggleService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.patch(`/admin/services/${id}/toggle`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
            queryClient.invalidateQueries({ queryKey: ['public', 'services'] });
        },
    });
};

