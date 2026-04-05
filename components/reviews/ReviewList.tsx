"use client";

import { useState } from "react";
import { Loader2, MessageSquare, ChevronDown, SortAsc } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { ReviewStats } from "./ReviewStats";

interface RawReview {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string | null;
    };
    booking?: {
        status?: string;
    };
}

interface ReviewListProps {
    reviews: RawReview[];
    isLoading?: boolean;
    isAuthenticated: boolean;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest";

const REVIEWS_PER_PAGE = 5;

export function ReviewList({ reviews, isLoading, isAuthenticated }: ReviewListProps) {
    const [sort, setSort] = useState<SortOption>("newest");
    const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#236b9d]" />
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No reviews yet</p>
                <p className="text-xs text-gray-400 mt-1">Be the first to review this service!</p>
            </div>
        );
    }

    // Map raw backend reviews to ReviewCard shape
    const mapped = reviews.map((r) => ({
        id: r.id,
        user: `${r.user.firstName} ${r.user.lastName}`,
        avatar: r.user.avatar || undefined,
        rating: r.rating,
        comment: r.comment || "No comment provided.",
        date: r.createdAt,
        verified: r.booking?.status === "COMPLETED",
        helpfulCount: 0,
        notHelpfulCount: 0,
    }));

    // Sort
    const sorted = [...mapped].sort((a, b) => {
        if (sort === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sort === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sort === "highest") return b.rating - a.rating;
        if (sort === "lowest") return a.rating - b.rating;
        return 0;
    });

    const visible = sorted.slice(0, visibleCount);
    const hasMore = visibleCount < sorted.length;

    return (
        <div className="space-y-4">
            {/* Stats */}
            <ReviewStats reviews={mapped} />

            {/* Sort bar */}
            <div className="flex items-center justify-between gap-3 py-2">
                <p className="text-xs text-gray-400 font-medium">
                    Showing {visible.length} of {sorted.length} review{sorted.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                    <SortAsc className="w-3.5 h-3.5 text-gray-400" />
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value as SortOption);
                            setVisibleCount(REVIEWS_PER_PAGE);
                        }}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#236b9d] text-gray-600 font-medium"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                    </select>
                </div>
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {visible.map((review) => (
                    <ReviewCard key={review.id} review={review} isAuthenticated={isAuthenticated} />
                ))}
            </div>

            {/* Load more */}
            {hasMore && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
                        className="flex items-center gap-2 text-sm text-[#236b9d] font-medium border border-[#236b9d]/30 bg-[#236b9d]/5 hover:bg-[#236b9d]/10 rounded-full px-6 py-2 transition-all"
                    >
                        <ChevronDown className="w-4 h-4" />
                        Load More Reviews
                    </button>
                </div>
            )}
        </div>
    );
}
