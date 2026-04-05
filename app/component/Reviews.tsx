"use client";

import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useGetReviewsByService, useGetReviewEligibility, useCreateReview } from "@/src/hooks/useReviews";
import { useProfile } from "@/src/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ReviewsSectionProps {
    serviceId: string;
}

export function Reviews({ serviceId }: ReviewsSectionProps) {
    const { data: userProfile } = useProfile();
    const isAuthenticated = !!userProfile;

    const { data: reviews = [], isLoading: reviewsLoading } = useGetReviewsByService(serviceId);

    const { data: eligibility, isLoading: eligibilityLoading } = useGetReviewEligibility(
        serviceId,
        isAuthenticated
    );

    const { mutateAsync: submitReview } = useCreateReview(serviceId);

    const handleSubmit = async (data: { bookingId: string; rating: number; comment: string }) => {
        await submitReview(data);
    };

    const hasCompletedBooking = eligibility?.hasCompletedBooking ?? false;
    const hasAlreadyReviewed = eligibility?.hasAlreadyReviewed ?? false;
    const bookingId = eligibility?.bookingId ?? null;

    return (
        <div className="space-y-6">
            {/* Write a Review */}
            {eligibilityLoading && isAuthenticated ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-[#236b9d]" />
                </div>
            ) : (
                <ReviewForm
                    onSubmit={handleSubmit}
                    isAuthenticated={isAuthenticated}
                    hasCompletedBooking={hasCompletedBooking}
                    hasAlreadyReviewed={hasAlreadyReviewed}
                    bookingId={bookingId}
                />
            )}

            {/* Review List */}
            <ReviewList
                reviews={reviews}
                isLoading={reviewsLoading}
                isAuthenticated={isAuthenticated}
            />
        </div>
    );
}
