import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    hoverRating?: number;
    onHoverChange?: (rating: number) => void;
}

export function StarRating({ 
    rating, 
    maxRating = 5, 
    size = 16, 
    interactive = false,
    onRatingChange,
    hoverRating = 0,
    onHoverChange
}: StarRatingProps) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(maxRating)].map((_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= (interactive && hoverRating > 0 ? hoverRating : rating);
                
                return (
                    <button
                        key={i}
                        type="button"
                        disabled={!interactive}
                        className={cn(
                            "focus:outline-none transition-transform",
                            interactive && "hover:scale-110 cursor-pointer",
                            !interactive && "cursor-default"
                        )}
                        onClick={() => interactive && onRatingChange?.(starValue)}
                        onMouseEnter={() => interactive && onHoverChange?.(starValue)}
                        onMouseLeave={() => interactive && onHoverChange?.(0)}
                    >
                        <Star 
                            size={size}
                            className={cn(
                                "transition-colors duration-200",
                                isFilled 
                                    ? "text-amber-400 fill-amber-400" 
                                    : "text-gray-200 fill-gray-100"
                            )} 
                        />
                    </button>
                );
            })}
        </div>
    );
}
