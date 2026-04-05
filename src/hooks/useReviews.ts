import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

// ── Public: Get reviews for a specific service ────────────────────────────────
export const useGetReviewsByService = (serviceId: string) => {
    return useQuery({
        queryKey: ['reviews', 'service', serviceId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/reviews/service/${serviceId}`);
            return response.data?.data || [];
        },
        enabled: !!serviceId,
    });
};

// ── Check review eligibility for a service ────────────────────────────────────
export const useGetReviewEligibility = (serviceId: string, isAuthenticated: boolean) => {
    return useQuery({
        queryKey: ['reviews', 'eligibility', serviceId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/reviews/eligibility/${serviceId}`);
            return response.data?.data || { hasCompletedBooking: false, hasAlreadyReviewed: false, bookingId: null };
        },
        enabled: !!serviceId && isAuthenticated,
    });
};

// ── Submit a review ───────────────────────────────────────────────────────────
export const useCreateReview = (serviceId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { bookingId: string; rating: number; comment: string }) => {
            const response = await axiosInstance.post('/reviews', { ...data, serviceId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', 'service', serviceId] });
            queryClient.invalidateQueries({ queryKey: ['reviews', 'eligibility', serviceId] });
        },
    });
};

// ── Admin: Get all reviews ─────────────────────────────────────────────────────
export const useAdminGetAllReviews = () => {
    return useQuery({
        queryKey: ['admin', 'reviews'],
        queryFn: async () => {
            const response = await axiosInstance.get('/reviews/admin/all');
            return response.data?.data || [];
        },
    });
};

// ── Admin: Delete a review ─────────────────────────────────────────────────────
export const useAdminDeleteReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reviewId: string) => {
            const response = await axiosInstance.delete(`/reviews/admin/${reviewId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
        },
    });
};
