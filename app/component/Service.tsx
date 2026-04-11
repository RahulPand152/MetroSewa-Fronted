"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { useGetPublicServices } from "@/src/hooks/useServices";
import { useProfile } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/src/lib/cartContext";
import { toast } from "sonner";

export const ServicePage = () => {
  const { data: services = [], isLoading } = useGetPublicServices();
  const { data: userProfile } = useProfile();
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  
  const isEligibleToBook =
    userProfile?.data?.role !== "ADMIN" && userProfile?.data?.role !== "TECHNICIAN";

  const handleAddToCart = (svc: any) => {
    if (!userProfile?.data) {
      router.push("/signin");
      return;
    }
    
    addItem({
      serviceId: svc.id,
      serviceName: svc.name,
      serviceImage: svc.images?.[0]?.url,
      price: svc.price ? Number(svc.price) : 0,
      category: svc.categoryId,
      selectedAttributes: {},
      quantity: 1,
    });
    toast.success(`"${svc.name}" added to your Cart!`);
  };

  return (
    <div className="w-full pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-[#236b9d]">
            Services
          </span>
          <Link
            href="/services"
            className="ml-4 text-sm font-medium border border-gray-300 hover:bg-[#236b9d] hover:text-white hover:border-[#236b9d] whitespace-nowrap px-3 py-1.5 rounded-md transition-all duration-200"
          >
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-slate-500">
            No services available
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", skipSnaps: false }}
            className="w-full"
          >
            <CarouselContent className="flex gap-6">
              {services.map((svc: any) => {
                const mainImage =
                  svc.images?.[0] || svc.images?.find((img: any) => img.isMain);
                const inCart = isInCart(svc.id);

                return (
                  <CarouselItem
                    key={svc.id}
                    className="flex-none w-[260px] sm:w-[280px] md:w-[300px]"
                  >
                    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/40">

                      {/* Image */}
                      <Link href={`/service/${svc.categoryId ?? "all"}/${svc.id}`}>
                        <div className="relative h-52 w-full overflow-hidden flex items-center justify-center bg-slate-100">
                          {mainImage ? (
                            <img
                              src={mainImage.url}
                              alt={svc.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-200" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary transition">
                          {svc.name}
                        </h3>
                        <p
                          className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: svc.description ?? "" }}
                        />
                        {svc.price != null && (
                          <p className="mt-2 text-sm font-semibold text-primary">
                            Rs. {svc.price}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="mt-auto pt-4 flex gap-2">


                          {isEligibleToBook && (
                            <button
                              onClick={() => handleAddToCart(svc)}
                              title={inCart ? "Already in cart" : "Add to cart"}
                              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${
                                inCart
                                  ? "bg-emerald-500 text-white cursor-default"
                                  : "bg-[#236b9d] hover:bg-[#1a5177] text-white"
                              }`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {inCart ? "Added" : "Add Book"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Arrows */}
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-slate-100 z-10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-slate-100 z-10" />
          </Carousel>
        )}
      </div>

    </div>
  );
};