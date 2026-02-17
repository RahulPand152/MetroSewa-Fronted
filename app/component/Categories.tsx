import { Button } from "@/components/ui/button";
import { CategoriesData } from "@/date";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
export const Categories = () => {
    return (
        <div className="w-full bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-5xl font-bold tracking-tight mb-4">
                    <span className="text-gray-900">Service</span>{" "}
                    <span className="bg-gradient-to-r from-gray-600 to-gray-600 bg-clip-text text-transparent">
                        Categories
                    </span>
                </h1>


                <div className="w-full py-12">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {CategoriesData.services.map((product) => (
                            <Link key={product.id} href={product.link}>
                                <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">

                                    {/* Image */}
                                    <div className="relative h-40 w-full overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition duration-300" />
                                    </div>

                                    {/* Title */}
                                    <div className="p-4 text-center">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white group-hover:text-primary transition">
                                            {product.title}
                                        </h3>
                                    </div>

                                </div>
                            </Link>
                        ))}
                    </div>
                </div>


            </div>
        </div>


    );
};