import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { toast } from 'sonner';

export const useGetMyBookings = () => {
    return useQuery({
        queryKey: ['my-bookings'],
        queryFn: async () => {
            const response = await axiosInstance.get('/users/bookings');
            return response.data?.data || [];
        },
    });
};

export const useGetBookingById = (bookingId: string) => {
    return useQuery({
        queryKey: ['my-bookings', bookingId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/users/bookings`);
            const allBookings = response.data?.data || [];
            const booking = allBookings.find((b: any) => b.id === bookingId);
            if (!booking) {
                throw new Error("Booking not found");
            }
            return booking;
        },
        enabled: !!bookingId,
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            const response = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            toast.success('Booking cancelled successfully');
        },
        onError: () => {
            toast.error('Failed to cancel booking');
        },
    });
};

export const useSubmitReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { bookingId: string, rating: number, comment: string, serviceId: string }) => {
            const response = await axiosInstance.post(`/bookings/review`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            toast.success('Review submitted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to submit review');
        },
    });
};
