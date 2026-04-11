"use client";

import Link from "next/link";
import { Search, Star, Loader2, ShoppingCart, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, Suspense } from "react";
import { NavbarPage } from "../component/Navbar";
import { useGetPublicCategories, useGetPublicServices } from "@/src/hooks/useServices";
import { useProfile } from "@/src/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/src/lib/cartContext";
import { toast } from "sonner";

function fuzzyMatch(str: string, pattern: string) {
  if (!pattern) return true;
  let patternIdx = 0;
  const s = str.toLowerCase();
  const p = pattern.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    if (s[i] === p[patternIdx]) patternIdx++;
    if (patternIdx === p.length) return true;
  }
  return false;
}

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("search") || "";

  const [search, setSearch] = useState(querySearchParam);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (querySearchParam !== search) setSearch(querySearchParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySearchParam]);

  const { data: userProfile } = useProfile();
  const { addItem, isInCart } = useCart();

  const isEligibleToBook =
    userProfile?.data?.role !== "ADMIN" && userProfile?.data?.role !== "TECHNICIAN";

  const handleBookRoute = (serviceId: string) => {
    if (!userProfile?.data) { router.push("/signin"); return; }
    router.push(`/booking/${serviceId}`);
  };

  const handleOpenCart = (svc: any) => {
    if (!userProfile?.data) { router.push("/signin"); return; }
    
    addItem({
      serviceId: svc.id,
      serviceName: svc.name,
      serviceImage: svc.images?.[0]?.url,
      price: svc.price ? Number(svc.price) : 0,
      category: svc.categoryId,
      selectedAttributes: {},
      quantity: 1,
    });
    toast.success(`"${svc.name}" added to your Cart!`);
  };

  const { data: categories = [], isLoading: catLoading } = useGetPublicCategories();
  const { data: services = [], isLoading: svcLoading } = useGetPublicServices();

  const filteredServices = useMemo(() => {
    return services.filter((s: any) => {
      const matchesSearch =
        fuzzyMatch(s.name || "", search) || fuzzyMatch(s.description || "", search);
      const matchesCategory =
        selectedCategory === "all" || s.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const newUrl = value ? `/services?search=${encodeURIComponent(value)}` : "/services";
    router.replace(newUrl, { scroll: false });
  };

  return (
    <>
      <NavbarPage />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">

          {/* Header */}
          <div className="mt-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              All Services
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse categories or search for any service
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search for any service..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 border-slate-200 bg-white h-11"
            />
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-xl font-semibold text-slate-800">
                Service Categories
              </h2>
              <span className="text-xs text-slate-400">{categories.length} categories</span>
            </div>

            {catLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm">No categories available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {categories.map((cat: any) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isActive ? "all" : cat.id)}
                      className={`group relative rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer text-left ${isActive
                          ? "border-sky-500 ring-2 ring-sky-200"
                          : "border-slate-200 hover:border-sky-300 hover:shadow-sm"
                        }`}
                    >
                      <div className="relative h-24 w-full overflow-hidden flex items-center justify-center bg-slate-100">
                        {cat.icon ? (
                          <img
                            src={cat.icon}
                            alt={cat.name}
                            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-200" />
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-300" />
                      </div>
                      <div className="p-2 bg-white">
                        <p className={`text-xs sm:text-sm font-semibold text-center truncate ${isActive ? "text-sky-600" : "text-slate-700"
                          }`}>
                          {cat.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Services Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-xl font-semibold text-slate-800">
                {selectedCategory === "all"
                  ? "All Services"
                  : `${categories.find((c: any) => c.id === selectedCategory)?.name ?? ""} Services`}
              </h2>
              <div className="flex items-center gap-2">
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
                  >
                    Clear filter
                  </button>
                )}
                <Badge className="bg-sky-50 text-sky-600 border-sky-100 text-xs">
                  {filteredServices.length} services
                </Badge>
              </div>
            </div>

            {svcLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm sm:text-base font-medium">No services found</p>
                <p className="text-xs sm:text-sm mt-1">Try a different search term or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredServices.map((service: any) => {
                  const mainImg = service.images?.[0]?.url || "https://picsum.photos/200/300";
                  const inCart = isInCart(service.id);

                  return (
                    <div
                      key={service.id}
                      className="group relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative h-36 w-full overflow-hidden shrink-0 cursor-pointer">
                        <Link href={`/service/${service.categoryId ?? "all"}/${service.id}`}>
                          <img
                            src={mainImg}
                            alt={service.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 block"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-300" />
                        </Link>
                        {service.priority && (
                          <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 pointer-events-none">
                            {service.badge || "Priority"}
                          </Badge>
                        )}
                        {service.isPremium && !service.priority && (
                          <Badge className="absolute top-2 left-2 bg-sky-500 text-white text-[10px] px-2 py-0.5 pointer-events-none">
                            Premium
                          </Badge>
                        )}
                        {/* In-cart badge */}
                        {inCart && (
                          <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 pointer-events-none">
                            ✓ In Cart
                          </Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800 leading-tight">
                          {service.name}
                        </h3>
                        <p
                          className="text-xs text-slate-500 leading-relaxed line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: service.description ?? "" }}
                        />

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          {service.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="font-medium text-slate-700">{service.rating}</span>
                              {service.reviewsCount && <span>({service.reviewsCount})</span>}
                            </span>
                          )}
                          {service.duration && (
                            <span className="text-slate-400">{service.duration}</span>
                          )}
                        </div>

                        {/* Price + Action buttons */}
                        <div className="mt-auto pt-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-slate-800">
                              {service.price != null ? `Rs. ${service.price}` : "--"}
                            </span>
                          </div>
                          {/* Add Book + Book Now — hidden for Admin/Technician */}
                          {isEligibleToBook && (
                            <>
                              <div className="flex gap-2">


                                {/* Add Book */}
                                <button
                                  onClick={() => handleOpenCart(service)}
                                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${inCart
                                      ? "bg-emerald-500 text-white"
                                      : "bg-[#236b9d] hover:bg-[#1a5177] text-white"
                                    }`}
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  {inCart ? "Added" : "Add Book"}
                                </button>
                              </div>

                              {/* Book Now Directly */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-2 text-xs h-8 border-[#236b9d] text-[#236b9d] hover:bg-[#236b9d] hover:text-white transition-all"
                                onClick={() => handleBookRoute(service.id)}
                              >
                                Book Now Directly
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
