import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { deleteCookie } from '../lib/cookies';

// --- AUTH METADATA & PROFILE ---

export const useProfile = (options?: Omit<import('@tanstack/react-query').UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await axiosInstance.get('/auth/profile');
            return response.data;
        },
        ...options,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axiosInstance.put('/auth/profile', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useUploadProfileImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await axiosInstance.post('/auth/profile/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useDeleteProfileImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete('/auth/profile/image');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

// --- AUTHENTICATION FLOWS ---

export const useRegister = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axiosInstance.post('/auth/register', data);
            return response.data;
        },
    });
};

export const useTechnicianRegister = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axiosInstance.post('/auth/technician-register', data);
            return response.data;
        },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axiosInstance.post('/auth/login', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post('/auth/logout');
            return response.data;
        },
        onSuccess: () => {
            queryClient.clear(); // Clear all queries on logout
            deleteCookie('token');
            deleteCookie('role');
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (data: { email: string }) => {
            const response = await axiosInstance.post('/auth/forgot-password', data);
            return response.data;
        },
    });
};

export const useVerifyRegistrationOtp = () => {
    return useMutation({
        mutationFn: async (data: { email: string; otp: string }) => {
            const response = await axiosInstance.post('/auth/verify-registration-otp', data);
            return response.data;
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axiosInstance.post('/auth/reset-password', data);
            return response.data;
        },
    });
};
