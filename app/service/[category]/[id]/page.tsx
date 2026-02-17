"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, ShoppingCart } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { SubServicesData } from "@/date"
import { NavbarPage } from "@/app/component/Navbar"
import Link from "next/link"
import { Reviews } from "@/app/component/Reviews"

export default function ServiceDetails() {
    const router = useRouter();
    const params = useParams();

    // Finding the subcategory using the id from params
    const id = Number(params.id)
    const categorySlug = params.category as string;
    const subCategories = SubServicesData[categorySlug as keyof typeof SubServicesData] || [];

    interface Review {
        id: number;
        user: string;
        rating: number;
        comment: string;
        date: string;
        verified: boolean;
    }

    interface ServiceItem {
        id: number;
        name: string;
        description: string;
        image: string;
        buttonText: string;
        priority: boolean;
        price?: string;
        duration?: string;
        rating?: number;
        reviewsCount?: number;
        longDescription?: string;
        features?: string[];
        images?: string[];
        isPremium?: boolean;
        reviews?: Review[];
    }

    const service = subCategories.find((item) => item.id === id) as ServiceItem | undefined;

    if (!service) {
        return (
            <div>
                <NavbarPage />
                <div className='flex justify-center items-center h-[60vh] flex-col gap-4'>
                    <h1 className='text-2xl font-bold text-gray-800'>Service Not Found</h1>
                    <Button onClick={() => router.back()} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    // Fallback values
    const images = service.images || [service.image];
    const price = service.price || "Contact for Price";
    const duration = service.duration || "Variable";
    const rating = service.rating || 4.5;
    const reviewsCount = service.reviewsCount || 0;
    const longDescription = service.longDescription || service.description;
    const features = service.features || ["Professional Service", "Verified Expert", "Satisfaction Guaranteed"];
    const isPremium = service.isPremium || false;
    const reviews = service.reviews || [];

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <NavbarPage />
            {/* Hero Carousel */}
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to {categorySlug.replace('-', ' ')}</span>
                </button>

                <Carousel
                    plugins={[
                        Autoplay({
                            delay: 3000,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent>
                        {images.map((img, index) => (
                            <CarouselItem key={index}>
                                <div className="relative h-[200px] md:h-[400px] w-full overflow-hidden rounded-3xl shadow-lg">
                                    <img
                                        src={img}
                                        alt={service.name}
                                        className="h-fit w-full object-cover transition-all duration-700 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 text-white max-w-2xl">
                                        {isPremium && (
                                            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-medium tracking-wide">PREMIUM EXPERIENCE</span>
                                            </div>
                                        )}
                                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">{service.name}</h2>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-max">
                        <Button
                            size="lg"
                            className="rounded-full shadow-2xl bg-white text-black hover:bg-gray-100 font-bold text-lg px-4 py-2 h-auto border border-gray-100 flex items-center gap-2 transition-all duration-300 hover:scale-105"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </Button>
                    </div>

                    <CarouselPrevious className="left-4 hidden md:flex h-12 w-12 border-none bg-white/20 hover:bg-white/40 text-gray-800" />
                    <CarouselNext className="right-4 hidden md:flex h-12 w-12 border-none bg-white/20 hover:bg-white/40 text-gray-800" />

                </Carousel>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Description & Reviews */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Description Card */}
                    <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-8 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">About this Service</h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {longDescription}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-sky-500">
                                            <svg
                                                className="h-3 w-3 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Customer Reviews
                            <span className="text-base font-normal text-gray-500">({reviews.length})</span>
                        </h3>
                        <Reviews reviews={reviews} />
                    </div>
                </div>

                {/* Right Column: Key Info & Booking */}
                <div className="space-y-6">
                    <div className="sticky top-24 space-y-6">
                        <Card className="rounded-3xl border-0 shadow-xl bg-white p-6">
                            <CardContent className="p-0 space-y-6">
                                <div className="space-y-2 text-center pb-6 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Starting from</p>
                                    <p className="text-4xl font-bold text-gray-900">{price}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Duration</span>
                                        <span className="font-semibold text-gray-900">{duration}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold text-gray-900">{rating}</span>
                                            <span className="text-gray-400">({reviewsCount})</span>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/contact?service=${encodeURIComponent(service.name)}`} className="block">
                                    <Button size="lg" className="w-full rounded-full h-10 text-lg font-medium shadow-lg hover:shadow-xl transition-all bg-sky-500 hover:bg-sky-600">
                                        Book Now
                                    </Button>
                                </Link>
                                <Link href="/contact" className="block">
                                    <Button variant="outline" size="lg" className="w-full rounded-full h-10  text-lg font-medium border-gray-200 bg-gray-50 hover:bg-gray-50">
                                        Contact Support
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <div className="bg-blue-50 rounded-3xl p-6 text-center space-y-2">
                            <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                <img src="/assets/verified.png" alt="Verified" className="w-5 h-5 opacity-80" />
                            </div>
                            <h4 className="font-semibold text-blue-900">Verified Professionals</h4>
                            <p className="text-sm text-blue-700/80">All our experts are background checked and trained.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
