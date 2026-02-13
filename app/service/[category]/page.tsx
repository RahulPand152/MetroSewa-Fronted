"use client"
import { SubCategories } from '@/app/component/SubCategories'
import React from 'react'
import { NavbarPage } from '@/app/component/Navbar'
import { SubServicesData } from '@/date'

import { useParams, useRouter } from 'next/navigation'

import { CategoriesData } from '@/date'
import { ArrowLeft } from 'lucide-react'

const page = () => {
    const router = useRouter();
    // Get data based on category slug
    const params = useParams();
    const categorySlug = params.category as string;
    const subCategories = SubServicesData[categorySlug as keyof typeof SubServicesData] || [];

    // Find category details for the header
    const categoryInfo = CategoriesData.services.find(
        (service) => service.link === `/service/${categorySlug}`
    );

    if (!subCategories.length) {
        return (
            <div>
                <NavbarPage />
                <div className='p-10 flex justify-center'>
                    <h1 className='text-xl font-semibold text-gray-500'>No services found for {categorySlug}</h1>
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
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6 bg-gray-200 text-2xl  rounded-lg px-2"
                >
                    <ArrowLeft className="w-7 h-7 sm:w-5 sm:h-5" />
                    {/* <span className="font-medium ">Back</span> */}
                </button>

                {/* Header Section */}
                <div className="mb-10 text-center">
                    <h1 className="md:text-4xl text-2xl font-bold  text-slate-900 capitalize mb-4">
                        {categoryInfo?.title || categorySlug.replace('-', ' ')} Services
                    </h1>
                    <p className="md:text-lg text-base text-slate-600 max-w-2xl mx-auto">
                        {categoryInfo?.description || `Explore our professional ${categorySlug.replace('-', ' ')} services.`}
                    </p>
                </div>

                <SubCategories data={subCategories} category={categorySlug} />
            </div>

        </div>
    )
}

export default page
