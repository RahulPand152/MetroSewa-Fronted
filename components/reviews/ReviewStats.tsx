"use client";

import { StarRating } from "./StarRating";

interface ReviewStatsProps {
    reviews: Array<{ rating: number }>;
}

export function ReviewStats({ reviews }: ReviewStatsProps) {
    if (!reviews || reviews.length === 0) return null;

    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100)
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col md:flex-row gap-6 items-center">
            {/* Average big number */}
            <div className="flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-6xl font-bold text-gray-900 leading-none">{avgRating.toFixed(1)}</span>
                <StarRating rating={Math.round(avgRating)} size={18} />
                <p className="text-xs text-gray-400 mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 w-full space-y-2">
                {ratingCounts.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-4 shrink-0">{star}</span>
                        <StarRating rating={star} size={12} />
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 rounded-full bg-amber-400 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right shrink-0">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
