import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

export const useGetPublicCategories = () => {
    return useQuery({
        queryKey: ['public', 'categories'],
        queryFn: async () => {
            const response = await axiosInstance.get('/public/categories');
            return response.data.data;
        },
    });
};

export const useGetPublicServices = () => {
    return useQuery({
        queryKey: ['public', 'services'],
        queryFn: async () => {
            const response = await axiosInstance.get('/public/services');
            return response.data.data;
        },
    });
};
