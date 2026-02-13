
"use client"
import { NavbarPage } from '@/app/component/Navbar'
import { SubServicesData } from '@/date'
import React from 'react'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const page = () => {
    const router = useRouter();
    const params = useParams();
    // Finding the subcategory using the id from params
    const id = Number(params.id)
    const categorySlug = params.category as string;
    const subCategories = SubServicesData[categorySlug as keyof typeof SubServicesData] || [];
    const subcategory = subCategories.find((item) => item.id === id)

    if (!subcategory) {
        return (
            <div>
                <NavbarPage />
                <div className='flex justify-center items-center h-screen'>
                    <h1 className='text-2xl font-bold text-red-500'>Service Not Found</h1>
                </div>
            </div>
        )
    }

    return (
        <div>
            <NavbarPage />
            <div className='max-w-7xl mx-auto px-4 py-24'>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to {categorySlug.replace('-', ' ')}</span>
                </button>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                    {/* Image Section */}
                    <div className='relative h-[400px] w-full overflow-hidden rounded-2xl shadow-lg'>
                        <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className='h-full w-full object-cover'
                        />
                        {subcategory.priority && (
                            <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md">
                                24/7 Priority
                            </span>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className='flex flex-col justify-center space-y-6'>
                        <div>
                            <p className='text-sm text-blue-600 font-medium tracking-wide uppercase'>
                                SERVER / {categorySlug.replace('-', ' ')}
                            </p>
                            <h1 className='text-4xl font-bold text-gray-900 mt-2'>
                                {subcategory.name}
                            </h1>
                        </div>



                        <p className='text-lg text-gray-600 leading-relaxed'>
                            {subcategory.description}
                        </p>

                        <div className='flex gap-4'>
                            <Link href={`/contact?service=${encodeURIComponent(subcategory.name)}`}>
                                <button className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all'>
                                    Book Now
                                </button>
                            </Link>
                            <Link href="/contact">
                                <button className='px-8 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-all'>
                                    Contact Support
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page
