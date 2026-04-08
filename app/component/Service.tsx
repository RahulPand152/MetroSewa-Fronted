"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link"
import { useGetPublicServices } from "@/src/hooks/useServices"
import { Loader2 } from "lucide-react"

export const ServicePage = () => {
    const { data: services = [], isLoading } = useGetPublicServices();

    return (
        <div className="w-full pb-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-[#236b9d]">
                        Services
                    </span>
                    <Link href="/services"
                        className="ml-4 text-sm font-medium border border-gray-300 hover:bg-[#236b9d] hover:text-white hover:border-[#236b9d] whitespace-nowrap px-3 py-1.5 rounded-md transition-all duration-200"> View All →
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
                        opts={{
                            align: "start",
                            skipSnaps: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="flex gap-6">
                            {services.map((svc: any) => {
                                const mainImage = svc.images?.[0] || svc.images?.find((img: any) => img.isMain);
                                return (
                                    <CarouselItem
                                        key={svc.id}
                                        className="flex-none w-[260px] sm:w-[280px] md:w-[300px]"
                                    >
                                        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/40">

                                            {/* Image */}
                                            <Link href={`/service/${svc.categoryId ?? 'all'}/${svc.id}`}>
                                                <div className="relative h-52 w-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                    {mainImage ? (
                                                        <img
                                                            src={mainImage.url}
                                                            alt={svc.name}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
                                                </div>
                                            </Link>

                                            {/* Content */}
                                            <div className="flex flex-1 flex-col p-5">
                                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-primary transition">
                                                    {svc.name}
                                                </h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2"
                                                    dangerouslySetInnerHTML={{ __html: svc.description ?? '' }}
                                                />
                                                {svc.price != null && (
                                                    <p className="mt-2 text-sm font-semibold text-primary">
                                                        Rs. {svc.price}
                                                    </p>
                                                )}
                                                <div className="mt-auto pt-5">
                                                    <Link href={`/service/${svc.categoryId ?? 'all'}/${svc.id}`}>
                                                        <button className="w-full rounded-xl bg-[#020817] hover:bg-gray-400  hover:text-gray-200 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b1224] hover:shadow-lg">
                                                            View Details
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>

                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>

                        {/* Arrows */}
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-slate-800 p-2 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 z-10" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-slate-800 p-2 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 z-10" />

                    </Carousel>
                )}


            </div>
        </div >
    );
};