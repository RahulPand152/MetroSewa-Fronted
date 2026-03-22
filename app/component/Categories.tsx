"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetPublicCategories } from "@/src/hooks/useServices";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Loader2 } from "lucide-react";

export const Categories = () => {
    const { data: categories = [], isLoading } = useGetPublicCategories();

    return (
        <div className="w-full bg-background pt-10 pb-4">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-center">
                        <span className="text-gray-900">Service</span>{" "}
                        <span className="bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">
                            Categories
                        </span>
                    </div>
                    <Link href="/services" className="text-sm font-medium text-sky-500 hover:text-sky-600 whitespace-nowrap ml-4">
                        View All →
                    </Link>
                </div>


                <div className="w-full pt-8 pb-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex justify-center items-center h-40 text-slate-500">
                            No categories available
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {categories.map((cat: any) => (
                                <Link key={cat.id} href={`/service/${cat.id}`}>
                                    <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">

                                        {/* Image */}
                                        <div className="relative h-40 w-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                            {cat.icon ? (
                                                <img
                                                    src={cat.icon}
                                                    alt={cat.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                                            )}
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition duration-300" />
                                        </div>

                                        {/* Title */}
                                        <div className="p-4 text-center">
                                            <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white group-hover:text-primary transition">
                                                {cat.name}
                                            </h3>
                                        </div>

                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>


    );
};