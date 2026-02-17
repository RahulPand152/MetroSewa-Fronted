
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { CategoriesData, subServiceDatas } from "@/date"
import Link from "next/link"
export const ServicePage = () => {
    return (
        <div className="w-full">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-5xl font-bold tracking-tight mb-4 text-gray-900">
                    Service
                </h1>


                <Carousel
                    opts={{
                        align: "start",
                        skipSnaps: false, // optional: smooth snapping
                        // allow drag scroll
                    }}
                    className="w-full"
                >
                    <CarouselContent className="flex gap-6">
                        {subServiceDatas.map((product: any) => (
                            <CarouselItem
                                key={product.uniqueId}
                                className="flex-none w-[260px] sm:w-[280px] md:w-[300px]"
                            >
                                <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/40">

                                    {/* Image */}
                                    <Link href={product.link}>
                                        <div className="relative h-52 w-full overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex flex-1 flex-col p-5">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-primary transition">
                                            {product.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                                            {product.description}
                                        </p>
                                        {product.price && (
                                            <p className="mt-2 text-sm font-semibold text-primary">
                                                {product.price}
                                            </p>
                                        )}
                                        <div className="mt-auto pt-5">
                                            <Link href={product.link}>
                                                <button className="w-full rounded-xl bg-[#020817] hover:bg-gray-400  hover:text-gray-200 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b1224] hover:shadow-lg">
                                                    View Details
                                                </button>
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Arrows */}
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-slate-800 p-2 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-slate-800 p-2 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 z-10" />

                </Carousel>


            </div>
        </div>
    );
};