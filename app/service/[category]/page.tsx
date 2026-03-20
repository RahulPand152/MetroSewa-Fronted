"use client"
import { SubCategories } from '@/app/component/SubCategories'
import React from 'react'
import { NavbarPage } from '@/app/component/Navbar'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useGetPublicCategories, useGetPublicServices } from '@/src/hooks/useServices'

const page = () => {
    const router = useRouter();
    // Get data based on category slug
    const params = useParams();
    const categoryId = params.category as string;

    const { data: categories = [], isLoading: catLoading } = useGetPublicCategories();
    const { data: services = [], isLoading: svcLoading } = useGetPublicServices();

    // Find category details for the header
    const categoryInfo = categories.find((cat: any) => cat.id === categoryId);

    const categoryServices = services.filter((svc: any) => svc.categoryId === categoryId);

    const mappedServices = categoryServices.map((svc: any) => {
        const mainImage = svc.images?.[0] || svc.images?.find((img: any) => img.isMain);
        return {
            id: svc.id,
            name: svc.name,
            description: svc.description || '',
            image: mainImage?.url || '',
            buttonText: "Book Now",
            priority: false
        }
    });

    if (catLoading || svcLoading) {
        return (
            <div>
                <NavbarPage />
                <div className='p-10 flex justify-center items-center h-[60vh]'>
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (!categoryInfo && !mappedServices.length) {
        return (
            <div>
                <NavbarPage />
                <div className='p-10 flex justify-center'>
                    <h1 className='text-xl font-semibold text-gray-500'>No services found for this category</h1>
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
                        {categoryInfo?.name || "Category"} Services
                    </h1>
                    <p className="md:text-lg text-base text-slate-600 max-w-2xl mx-auto">
                        {categoryInfo?.description || `Explore our professional services.`}
                    </p>
                </div>

                {mappedServices.length > 0 ? (
                    <SubCategories data={mappedServices} category={categoryId} />
                ) : (
                    <div className='flex justify-center'>
                        <h1 className='text-xl font-semibold text-gray-500 mt-10'>No services available under this category</h1>
                    </div>
                )}
            </div>

        </div>
    )
}

export default page
