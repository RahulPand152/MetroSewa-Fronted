"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { formatDistanceToNow } from "date-fns";

export interface ReviewData {
    id: string | number;
    user: string;
    avatar?: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
    helpfulCount?: number;
    notHelpfulCount?: number;
}

interface ReviewCardProps {
    review: ReviewData;
    isAuthenticated: boolean;
}

export function ReviewCard({ review, isAuthenticated }: ReviewCardProps) {
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
    const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpfulCount || 0);
    const [userVote, setUserVote] = useState<"helpful" | "not-helpful" | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const fallback = review.user ? review.user.charAt(0).toUpperCase() : "U";
    const isLong = review.comment.length > 180;

    const formattedDate = (() => {
        try {
            return formatDistanceToNow(new Date(review.date), { addSuffix: true });
        } catch {
            return review.date;
        }
    })();

    const vote = (type: "helpful" | "not-helpful") => {
        if (!isAuthenticated) return;
        if (userVote === type) {
            if (type === "helpful") setHelpfulCount(h => h - 1);
            else setNotHelpfulCount(n => n - 1);
            setUserVote(null);
        } else {
            if (type === "helpful") {
                setHelpfulCount(h => h + 1);
                if (userVote === "not-helpful") setNotHelpfulCount(n => n - 1);
            } else {
                setNotHelpfulCount(n => n + 1);
                if (userVote === "helpful") setHelpfulCount(h => h - 1);
            }
            setUserVote(type);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col gap-3">
            {/* Header: Avatar + Name + Date + Verified */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                        <AvatarImage src={review.avatar || `https://i.pravatar.cc/80?u=${review.user}`} />
                        <AvatarFallback className="bg-sky-50 text-sky-700 text-sm font-semibold">{fallback}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{review.user}</p>
                        <p className="text-xs text-gray-400">{formattedDate}</p>
                    </div>
                </div>
                {review.verified && (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 text-[11px] shrink-0">
                        <BadgeCheck className="w-3 h-3" />
                        Verified Purchase
                    </Badge>
                )}
            </div>

            {/* Star Rating */}
            <StarRating rating={review.rating} size={15} />

            {/* Comment */}
            <div>
                <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded && isLong ? "line-clamp-3" : ""}`}>
                    {review.comment}
                </p>
                {isLong && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sky-600 text-xs font-medium mt-1 hover:underline focus:outline-none"
                    >
                        {isExpanded ? "Show less" : "Read more"}
                    </button>
                )}
            </div>

            {/* Helpful Buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-50 mt-auto">
                <span className="text-xs text-gray-400 mr-auto">Helpful?</span>
                <button
                    onClick={() => vote("helpful")}
                    disabled={!isAuthenticated}
                    title={!isAuthenticated ? "Login to vote" : ""}
                    className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1 transition-colors ${
                        !isAuthenticated
                            ? "text-gray-300 cursor-default"
                            : userVote === "helpful"
                            ? "bg-sky-50 text-sky-600"
                            : "text-gray-400 hover:text-sky-600 hover:bg-sky-50"
                    }`}
                >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{helpfulCount > 0 ? helpfulCount : ""} Yes</span>
                </button>
                <button
                    onClick={() => vote("not-helpful")}
                    disabled={!isAuthenticated}
                    title={!isAuthenticated ? "Login to vote" : ""}
                    className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1 transition-colors ${
                        !isAuthenticated
                            ? "text-gray-300 cursor-default"
                            : userVote === "not-helpful"
                            ? "bg-red-50 text-red-500"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    }`}
                >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{notHelpfulCount > 0 ? notHelpfulCount : ""} No</span>
                </button>
            </div>
        </div>
    );
}
