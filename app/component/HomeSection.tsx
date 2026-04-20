"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetPublicCategories,
  useGetPublicServices,
} from "@/src/hooks/useServices";
import { cn } from "@/lib/utils";

const HomeSection = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = useGetPublicCategories();
  const { data: services = [] } = useGetPublicServices();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredServices = services
    .filter((s: any) => s.name?.toLowerCase().includes(title.toLowerCase()))
    .slice(0, 5);

  const filteredCategories = categories
    .filter((c: any) => c.name?.toLowerCase().includes(title.toLowerCase()))
    .slice(0, 5);

  const hasResults =
    title.trim().length > 0 &&
    (filteredServices.length > 0 || filteredCategories.length > 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const searchUrl = trimmedTitle
      ? `/services?search=${encodeURIComponent(trimmedTitle)}`
      : "/services";

    router.push(searchUrl);
  };

  const handleSelectOption = (text: string) => {
    setTitle(text);
    setShowDropdown(false);
    router.push(`/services?search=${encodeURIComponent(text)}`);
  };

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden text-white sm:min-h-[70vh] ">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/metrosewabrndd.png')" }}
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:gap-16 lg:gap-20">
        {/* Text */}
        <div className="flex-1 max-w-xl space-y-6 text-left">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Expert Home Services <br /> at Your Doorstep
          </h1>

          <p className="text-sm text-white/85 sm:text-base md:text-lg">
            Fix. Clean. Repair. Relax.
            Metro Sewa Has Your Back.
          </p>

          {/* Search Form */}
          <div className="w-full max-w-3xl mx-auto relative" ref={dropdownRef}>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-xl sm:flex-row sm:items-center sm:gap-3 relative"
            >
              {/* Input field */}
              <div
                className="flex flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 sm:px-4 
                focus-within:ring-2 focus-within:ring-[#236b9d] focus-within:ring-offset-0 transition relative z-20"
              >
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="What help do you need today?"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  autoComplete="off"
                />
              </div>

              {/* Search button */}
              <Button
                type="submit"
                className="w-full rounded-lg bg-[#236b9d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a5a8c] sm:w-auto sm:py-3 sm:text-base z-20"
              >
                Search
              </Button>
            </form>

            {/* Search Dropdown */}
            {showDropdown && title.trim().length > 0 && (
              <div className="absolute top-16 left-0 right-0 z-30 mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-[300px] overflow-y-auto">
                {!hasResults ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No services or categories found for &quot;{title}&quot;.
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Categories matched */}
                    {filteredCategories.length > 0 && (
                      <div className="mb-2">
                        {/* <div className="px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                          Categories
                        </div> */}
                        <ul className="text-left">
                          {filteredCategories.map((c: any) => (
                            <li
                              key={`cat-${c.id}`}
                              onClick={() => handleSelectOption(c.name)}
                              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              <div className="font-semibold">{c.name}</div>
                              {c.description && (
                                <div className="text-xs text-slate-400 truncate">
                                  {c.description}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Separator if both exist */}
                    {filteredCategories.length > 0 &&
                      filteredServices.length > 0 && (
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                      )}

                    {/* Services matched */}
                    {filteredServices.length > 0 && (
                      <div>
                        <div className="px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                          Services
                        </div>
                        <ul className="text-left">
                          {filteredServices.map((s: any) => (
                            <li
                              key={`srv-${s.id}`}
                              onClick={() => handleSelectOption(s.name)}
                              className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-700">
                                  {s.name}
                                </span>
                                {/* <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                                  {s.description || "Top service"}
                                </span> */}
                              </div>
                              {/* <div className="text-xs font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded ml-2">
                                Book
                              </div> */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
