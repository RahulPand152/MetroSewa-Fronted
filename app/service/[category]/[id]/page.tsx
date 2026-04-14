"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Star,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { NavbarPage } from "@/app/component/Navbar";

import { Reviews } from "@/app/component/Reviews";
import { useGetPublicServices } from "@/src/hooks/useServices";
import { useGetReviewsByService } from "@/src/hooks/useReviews";
import { useProfile } from "@/src/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCart } from "@/src/lib/cartContext";
import { toast } from "sonner";


export default function ServiceDetails() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;
  const { data: services = [], isLoading } = useGetPublicServices();

  const service = services.find((item: any) => item.id === id);

  const { data: reviews = [] } = useGetReviewsByService(id);

  const { data: userProfile } = useProfile();
  const { addItem, isInCart } = useCart();
  const isEligibleToBook =
    userProfile?.data?.role !== "ADMIN" && userProfile?.data?.role !== "TECHNICIAN";
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleBookNow = () => {
    if (!userProfile?.data) {
      setShowAuthDialog(true);
      return;
    }
    router.push(`/booking/${service.id}`);
  };

  const handleAddToCart = () => {
    if (!userProfile?.data) {
      setShowAuthDialog(true);
      return;
    }

    addItem({
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.images?.[0]?.url || "",
      price: service.price ? Number(service.price) : 0,
      category: service.categoryId,
      selectedAttributes: {},
      quantity: 1,
    });
    toast.success(`"${service.name}" added to your Cart!`);
  };

  if (isLoading) {
    return (
      <div>
        <NavbarPage />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div>
        <NavbarPage />
        <div className="flex justify-center items-center h-[60vh] flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Service Not Found
          </h1>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Fallback values
  const images = service.images?.map((img: any) => img.url) || [];
  if (images.length === 0) images.push("https://picsum.photos/800/600"); // placeholder if missing

  const isPremium = service.isPremium || false;
  const price = service.price != null ? `Rs. ${service.price}` : "Contact for Price";
  const duration = service.duration || "Variable";

  const reviewsCount = reviews?.length || 0;
  const rating = reviewsCount > 0 ? (reviews.reduce((acc: number, cur: any) => acc + cur.rating, 0) / reviewsCount).toFixed(1) : 0;

  const longDescription = service.description || "";
  const features: string[] = service.features || [
    "Professional Service",
    "Verified Technician",
    "Satisfaction Guaranteed",
  ];

  const nextLightboxImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevLightboxImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <NavbarPage />

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => router.push(`/booking/${service.id}`)}
      />

      <div className="max-w-7xl mx-auto px-4 pt-8 mt-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6 bg-gray-200 text-2xl px-2 py-1 rounded-lg w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Carousel, Description & Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hero Carousel */}

            <Carousel
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {images.map((img: string, index: number) => (
                  <CarouselItem key={index}>
                    <div
                      className="relative h-full md:h-[400px] w-full overflow-hidden rounded-3xl shadow-lg cursor-pointer"
                      onClick={() => { setActiveIndex(index); setLightboxOpen(true); }}
                    >
                      <img
                        src={img}
                        alt={service.name}
                        className="h-full w-full object-cover bg-gray-100 transition-all duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 text-white max-w-2xl">
                        {isPremium && (
                          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium tracking-wide">
                              PREMIUM EXPERIENCE
                            </span>
                          </div>
                        )}
                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                          {service.name}
                        </h2>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 hidden md:flex h-12 w-12 border-none bg-white/20 hover:bg-white/40 text-gray-800" />
              <CarouselNext className="right-4 hidden md:flex h-12 w-12 border-none bg-white/20 hover:bg-white/40 text-gray-800" />
            </Carousel>

            {/* Description Card */}
            <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-8 md:p-10 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    About this Service
                  </h3>
                  <div
                    className="text-lg text-gray-600 leading-relaxed
                                    [&_p]:mb-4 last:[&_p]:mb-0
                                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul_li]:mb-2 
                                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol_li]:mb-2
                                    [&_li_p]:inline
                                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-8
                                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-4 [&_h2]:mt-8
                                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-3 [&_h3]:mt-6
                                    [&_strong]:font-semibold [&_strong]:text-gray-900
                                    [&_a]:text-sky-600 [&_a]:hover:underline [&_a]:transition-colors
                                    [&_blockquote]:border-l-4 [&_blockquote]:border-sky-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-gray-50 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-lg
                                    [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-6
                                    [&_code]:text-sm [&_code]:font-mono [&_code]:bg-sky-50 [&_code]:text-sky-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md
                                    [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold
                                    [&_td]:border [&_td]:border-gray-200 [&_td]:p-3"
                    dangerouslySetInnerHTML={{
                      __html:
                        longDescription || "<p>No description provided.</p>",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-[#236b9d]">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>

                      <span className="font-medium text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                Customer Reviews
                <div className="flex items-center gap-1.5 text-base font-normal bg-gray-100 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">{rating}</span>
                  <span className="text-gray-500">({reviewsCount})</span>
                </div>
              </h3>
              <Reviews serviceId={service.id} />
            </div>
          </div>

          {/* Right Column: Key Info & Booking */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="rounded-3xl border-0 shadow-xl bg-white p-6">
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-2 text-center pb-6 border-b border-gray-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                      Starting from
                    </p>
                    <p className="text-4xl font-bold text-gray-900">{price}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold text-gray-900">
                        {duration}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {rating}
                        </span>
                        <span className="text-gray-400">({reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  {isEligibleToBook && (
                    <div className="space-y-3">
                      {/* Add to Cart */}
                      <Button
                        size="lg"
                        variant="outline"
                        className={`w-full rounded-full h-10 font-medium transition-all border-2 ${service && isInCart(service.id)
                          ? "border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "border-[#236b9d] text-[#236b9d] hover:bg-[#236b9d] hover:text-white"
                          }`}
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {service && isInCart(service.id) ? "✓ Added" : "Add Book"}
                      </Button>

                      {/* Book Now */}
                      <Button
                        size="lg"
                        className="w-full rounded-full h-10 text-lg font-medium shadow-lg hover:shadow-xl transition-all bg-[#236b9d] hover:bg-[#1a5a8c]"
                        onClick={handleBookNow}
                      >
                        Book Now
                      </Button>
                    </div>
                  )}


                </CardContent>

              </Card>

              <div className="bg-blue-50 rounded-3xl p-6 text-center space-y-2">
                <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <BadgeCheck className="text-green-500 w-5 h-5" />
                </div>
                <h4 className="font-semibold text-[#236b9d]">
                  Verified Professionals
                </h4>
                <p className="text-sm text-blue-700/80">
                  All our Technician are background checked and trained.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/20 hover:bg-black/40 rounded-full"
            onClick={e => { e.stopPropagation(); prevLightboxImage(); }}
          >
            <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <img
            src={images[activeIndex]}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            alt={`Lightbox image ${activeIndex + 1}`}
            onClick={e => e.stopPropagation()}
          />

          <button
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/20 hover:bg-black/40 rounded-full"
            onClick={e => { e.stopPropagation(); nextLightboxImage(); }}
          >
            <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8 rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
