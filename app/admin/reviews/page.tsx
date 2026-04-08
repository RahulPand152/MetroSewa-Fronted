"use client";

import { useState } from "react";
import { useAdminGetAllReviews, useAdminDeleteReview } from "@/src/hooks/useReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Trash2, Search, Loader2, MessageSquare, RefreshCw,
    Star, TrendingUp, Users, BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RATING_COLORS: Record<number, string> = {
    5: "bg-emerald-50 text-emerald-700 border-emerald-200",
    4: "bg-blue-50 text-blue-700 border-blue-200",
    3: "bg-yellow-50 text-yellow-700 border-yellow-200",
    2: "bg-orange-50 text-orange-700 border-orange-200",
    1: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminReviewsPage() {
    const { data: reviews = [], isLoading, refetch } = useAdminGetAllReviews();
    const { mutateAsync: deleteReview, isPending: isDeleting } = useAdminDeleteReview();

    const [search, setSearch] = useState("");
    const [filterRating, setFilterRating] = useState<number | "all">("all");
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    // ── Derived stats ─────────────────────────────────────────────────────────
    const avgRating = reviews.length
        ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r: any) => r.rating === star).length,
        pct: reviews.length
            ? Math.round((reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100)
            : 0,
    }));

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filtered = reviews.filter((r: any) => {
        const nameMatch = `${r.user?.firstName} ${r.user?.lastName} ${r.booking?.service?.name} ${r.comment}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const ratingMatch = filterRating === "all" || r.rating === filterRating;
        return nameMatch && ratingMatch;
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteReview(deleteTarget);
        setDeleteTarget(null);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Monitor and moderate all service reviews</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="gap-2 self-start sm:self-auto"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Avg Rating</p>
                        <p className="text-xl font-bold text-gray-900">{avgRating}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Total Reviews</p>
                        <p className="text-xl font-bold text-gray-900">{reviews.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">5-Star Reviews</p>
                        <p className="text-xl font-bold text-gray-900">
                            {reviews.filter((r: any) => r.rating === 5).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">1-Star Reviews</p>
                        <p className="text-xl font-bold text-gray-900">
                            {reviews.filter((r: any) => r.rating === 1).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Rating Breakdown Bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Rating Distribution</h3>
                <div className="space-y-2">
                    {ratingBreakdown.map(({ star, count, pct }) => (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-500 w-4 shrink-0">{star}</span>
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-2 rounded-full bg-amber-400 transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-400 w-12 text-right shrink-0">
                                {count} ({pct}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by user, service, or comment..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 border-gray-200"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["all", 5, 4, 3, 2, 1] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setFilterRating(r)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${filterRating === r
                                    ? "bg-[#236b9d] text-white border-[#236b9d]"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-[#236b9d] hover:text-[#236b9d]"
                                }`}
                        >
                            {r === "all" ? "All Ratings" : `${r} ⭐`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews Table / Cards */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#236b9d]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-500">No reviews found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((review: any) => {
                        const fullName = `${review.user?.firstName || ""} ${review.user?.lastName || ""}`.trim();
                        const fallback = fullName ? fullName.charAt(0).toUpperCase() : "U";
                        const serviceName = review.booking?.service?.name || "Unknown Service";
                        const formattedDate = (() => {
                            try {
                                return formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });
                            } catch {
                                return review.createdAt;
                            }
                        })();

                        return (
                            <div
                                key={review.id}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4"
                            >
                                {/* Left: Avatar + Meta */}
                                <div className="flex items-start gap-3 sm:w-56 shrink-0">
                                    <Avatar className="h-9 w-9 border border-gray-100">
                                        <AvatarImage src={review.user?.avatar || ""} />
                                        <AvatarFallback className="bg-sky-50 text-sky-700 text-sm font-semibold">
                                            {fallback}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                                        <p className="text-xs text-gray-400 truncate">{review.user?.email}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
                                    </div>
                                </div>

                                {/* Center: Review content */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                            className={`border text-[11px] font-semibold px-2 py-0.5 ${RATING_COLORS[review.rating] || ""}`}
                                        >
                                            {review.rating} / 5
                                        </Badge>
                                        <StarRating rating={review.rating} size={13} />
                                        <span className="text-xs text-gray-400">for</span>
                                        <span className="text-xs font-semibold text-[#236b9d] truncate max-w-[160px]">
                                            {serviceName}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                        {review.comment || <span className="italic text-gray-400">No comment</span>}
                                    </p>
                                </div>

                                {/* Right: Delete action */}
                                <div className="flex items-center sm:items-start sm:pt-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteTarget(review.id)}
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o: boolean) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The review will be permanently removed from the platform.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white gap-2"
                        >
                            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Delete Review
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
