import clientReviews from "@/app/data/clientReviews.json";

type Review = {
  firstName: string;
  lastName: string;
  reviewDescription: string;
  rating: number;
  image?: string;
};

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName?.trim()?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.trim()?.charAt(0)?.toUpperCase() ?? "";
  return `${first}${last}`;
};

const renderStars = (rating: number) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < safeRating ? "text-amber-400" : "text-slate-300"}>
      ★
    </span>
  ));
};

export const ClientReview = () => {
  const reviews = clientReviews as Review[];

  return (
    <section className="w-full bg-slate-50 py-14 sm:py-12 ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <p className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-center text-[#236b9d]"> Our Client Reviews</p>

        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => {
            const fullName = `${review.firstName} ${review.lastName}`;
            const hasImage = Boolean(review.image && review.image.trim().length > 0);

            return (
              <article
                key={`${fullName}-${index}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center gap-3">
                  {hasImage ? (
                    <img
                      src={review.image}
                      alt={fullName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#236b9d] text-sm font-bold text-white ring-2 ring-slate-100">
                      {getInitials(review.firstName, review.lastName)}
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{fullName}</h3>
                    <div className="text-base leading-none">{renderStars(review.rating)}</div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">{review.reviewDescription}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
