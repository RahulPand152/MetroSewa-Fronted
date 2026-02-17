import { Star, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Review {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
}

interface ReviewsProps {
    reviews: Review[];
}

export function Reviews({ reviews }: ReviewsProps) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${review.user}`} />
                                <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-gray-900">{review.user}</h4>
                                <p className="text-xs text-gray-400">{review.date}</p>
                            </div>
                        </div>
                        {review.verified && (
                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 gap-1">
                                {/* <CheckCircle2 className="w-3 h-3" /> */}
                                <img src="/assets/verified.png" alt="Verified" className="w-4 h-4" />
                                Verified
                            </Badge>
                        )}
                    </div>

                    <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                            />
                        ))}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                        &quot;{review.comment}&quot;
                    </p>
                </div>
            ))}
        </div>
    );
}
