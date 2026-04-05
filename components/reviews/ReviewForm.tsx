"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";

const reviewSchema = z.object({
    rating: z.number().min(1, "Please select a star rating").max(5),
    comment: z.string()
        .min(10, "Review must be at least 10 characters")
        .max(500, "Review must be at most 500 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    onSubmit: (data: ReviewFormValues & { bookingId: string }) => Promise<void>;
    isAuthenticated: boolean;
    hasCompletedBooking: boolean;
    hasAlreadyReviewed: boolean;
    bookingId: string | null;
}

export function ReviewForm({
    onSubmit,
    isAuthenticated,
    hasCompletedBooking,
    hasAlreadyReviewed,
    bookingId,
}: ReviewFormProps) {
    const [hoverRating, setHoverRating] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0, comment: "" },
    });

    const currentRating = watch("rating");
    const commentValue = watch("comment");

    const handleFormSubmit = async (data: ReviewFormValues) => {
        try {
            await onSubmit({ ...data, bookingId: bookingId || "" });
            setIsSuccess(true);
            reset();
        } catch (error: any) {
            // Error is handled by axios interceptor (toast) typically,
            // but we ensure it doesn't just stop at success state if it fails.
        }
    };

    // ── Unauthenticated ──────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#236b9d]/10 flex items-center justify-center shrink-0">
                        <LogIn className="w-5 h-5 text-[#236b9d]" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                        👉 Please login to write a review
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-[#236b9d] border-[#236b9d] hover:bg-[#236b9d] hover:text-white shrink-0 rounded-full px-6"
                    onClick={() => (window.location.href = "/signin")}
                >
                    Sign In
                </Button> */}
            </div>
        );
    }

    // ── Already reviewed or just submitted ───────────────────────────────────
    if (hasAlreadyReviewed || isSuccess) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                <p className="text-sm font-semibold text-green-800">
                    Your review has been submitted! Thank you for your feedback.
                </p>
            </div>
        );
    }

    // ── Write Review Form ────────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#236b9d]" />

            <h4 className="text-lg font-bold text-gray-900 mb-1">Write a Review</h4>
            <p className="text-sm text-gray-400 mb-5">Share your experience to help others decide.</p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Overall Rating <span className="text-red-500">*</span>
                    </label>
                    <StarRating
                        rating={currentRating}
                        size={32}
                        interactive
                        hoverRating={hoverRating}
                        onRatingChange={(r) => setValue("rating", r, { shouldValidate: true })}
                        onHoverChange={setHoverRating}
                    />
                    {currentRating > 0 && (
                        <p className="text-xs text-amber-600 mt-1.5">
                            {["", "Poor ⭐", "Fair ⭐⭐", "Good ⭐⭐⭐", "Very Good ⭐⭐⭐⭐", "Excellent ⭐⭐⭐⭐⭐"][currentRating]} — {currentRating} out of 5 stars
                        </p>
                    )}
                    {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>}
                </div>

                {/* Comment */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Your Review <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-xs font-medium ${(commentValue?.length || 0) > 450 ? "text-red-500" : "text-gray-400"}`}>
                            {commentValue?.length || 0} / 500
                        </span>
                    </div>
                    <Textarea
                        {...register("comment")}
                        placeholder="Tell us what you liked or how we can improve..."
                        className={`resize-none h-28 bg-gray-50 border-gray-200 focus-visible:ring-[#236b9d] rounded-lg ${errors.comment ? "border-red-300" : ""}`}
                    />
                    {errors.comment && <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>}
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#236b9d] hover:bg-[#1a5a8c] text-white rounded-full px-8 font-semibold"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : "Submit Review"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
