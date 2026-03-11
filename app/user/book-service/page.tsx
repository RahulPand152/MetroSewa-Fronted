"use client";

import Link from "next/link";
import { CategoriesData, SubServicesData } from "@/date";
import { ArrowRight, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Flatten all sub-services with their category info
const allSubServices = Object.entries(SubServicesData).flatMap(([slug, services]) =>
    services.map((service: any) => ({
        ...service,
        slug,
        link: `/service/${slug}/${service.id}`,
    }))
);

export default function BookServicePage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const filteredServices = allSubServices.filter((s) => {
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || s.slug === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredCategories = CategoriesData.services.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 max-w-5xl">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Book a New Service
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Browse categories or search for a specific service
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search for any service..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
            </div>

            {/* Categories Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Service Categories
                    </h2>
                    <span className="text-xs text-slate-400">{CategoriesData.services.length} categories</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {CategoriesData.services.map((service) => {
                        // Extract slug from link e.g. /service/plumbing -> plumbing
                        const slug = service.link.replace("/service/", "");
                        const isActive = selectedCategory === slug;
                        return (
                            <button
                                key={service.id}
                                onClick={() => setSelectedCategory(isActive ? "all" : slug)}
                                className={`group relative rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer text-left ${isActive
                                        ? "border-sky-500 ring-2 ring-sky-200 dark:ring-sky-900"
                                        : "border-slate-200 dark:border-slate-800 hover:border-sky-300 hover:shadow-sm"
                                    }`}
                            >
                                <div className="relative h-20 w-full overflow-hidden">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-300" />
                                </div>
                                <div className="p-2 bg-white dark:bg-slate-900">
                                    <p className={`text-xs sm:text-sm font-semibold text-center truncate ${isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-200"}`}>
                                        {service.title}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sub-Services / All Services */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {selectedCategory === "all" ? "All Services" : `${CategoriesData.services.find(c => c.link === `/service/${selectedCategory}`)?.title ?? ""} Services`}
                    </h2>
                    <div className="flex items-center gap-2">
                        {selectedCategory !== "all" && (
                            <button onClick={() => setSelectedCategory("all")} className="text-xs text-slate-400 hover:text-slate-600">
                                Clear filter
                            </button>
                        )}
                        <Badge className="bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 text-xs">
                            {filteredServices.length} services
                        </Badge>
                    </div>
                </div>

                {filteredServices.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <p className="text-sm sm:text-base font-medium">No services found</p>
                        <p className="text-xs sm:text-sm mt-1">Try a different search term or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredServices.map((service) => (
                            <div
                                key={`${service.slug}-${service.id}`}
                                className="group relative rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative h-36 w-full overflow-hidden shrink-0">
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-300" />
                                    {service.priority && (
                                        <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5">
                                            {service.badge || "Priority"}
                                        </Badge>
                                    )}
                                    {service.isPremium && !service.priority && (
                                        <Badge className="absolute top-2 left-2 bg-sky-500 text-white text-[10px] px-2 py-0.5">
                                            Premium
                                        </Badge>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1 gap-2">
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                            {service.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                            {service.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        {service.rating && (
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{service.rating}</span>
                                                {service.reviewsCount && <span>({service.reviewsCount})</span>}
                                            </span>
                                        )}
                                        {service.duration && (
                                            <span className="text-slate-400">{service.duration}</span>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                                        {service.price && (
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                {service.price}
                                            </span>
                                        )}
                                        <Link href={service.link} className="ml-auto">
                                            <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-8 px-4">
                                                Book Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
