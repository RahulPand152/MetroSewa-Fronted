


import Link from 'next/link'
import { plumbingSubcategories } from '@/date'

interface SubCategoryProps {
    id: number;
    name: string;
    description: string;
    image: string;
    buttonText: string;
    priority: boolean;
    badge?: string;
}

export const SubCategories = ({ data, category }: { data: SubCategoryProps[], category: string }) => {
    return (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-auto">
            {data.map((service) => (
                <Link href={`/service/${category}/${service.id}`}
                    key={service.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/40"
                >
                    {/* Image Section */}
                    <div className="relative h-52 w-full overflow-hidden">
                        <img
                            src={service.image}
                            alt={service.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />

                        {/* Priority Badge */}
                        {service.priority && (
                            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                                24/7 Priority
                            </span>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col justify-between h-[190px]">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                                {service.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                                {service.description}
                            </p>
                        </div>

                        {/* Button */}
                        <button className="w-full rounded-xl bg-[#020817] hover:bg-gray-400  hover:text-gray-200 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b1224] hover:shadow-lg">
                            {service.buttonText}
                        </button>
                    </div>
                </Link>
            ))}
        </div>

    )
}