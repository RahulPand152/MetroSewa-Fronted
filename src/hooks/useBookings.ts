import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

export const useGetMyBookings = () => {
    return useQuery({
        queryKey: ['my-bookings'],
        queryFn: async () => {
            const response = await axiosInstance.get('/users/bookings');
            return response.data?.data || [];
        },
    });
};
