"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomeSection = () => {
    const router = useRouter();
    const [title, setTitle] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const searchUrl = trimmedTitle
            ? `/find-job?q=${encodeURIComponent(trimmedTitle)}`
            : "/find-job";

        router.push(searchUrl);
    };

    return (
        <section className="relative flex min-h-[60vh] items-center overflow-hidden text-white sm:min-h-[70vh] ">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/home1.png')" }}
                aria-hidden="true"
            />

            {/* Left dark gradient overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />

            {/* Content */}
            <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:gap-16 lg:gap-20">

                {/* Text */}
                <div className="flex-1 max-w-xl space-y-6 text-left">
                    <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                        Expert Home Services <br /> at Your Doorstep
                    </h1>

                    <p className="text-sm text-white/85 sm:text-base md:text-lg">
                        Find trusted professionals for plumbing, computer repairs, electrical, and more. Quality service, guaranteed.
                    </p>

                    {/* Search Form */}
                    <div className="w-full max-w-3xl mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-xl sm:flex-row sm:items-center sm:gap-3"
                        >
                            {/* Input field */}
                            <div className="flex flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 sm:px-4 
                focus-within:ring-2 focus-within:ring-gray-200 focus-within:ring-offset-0 transition">
                                <Search className="h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="What help do you need today?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>


                            {/* Search button */}
                            <Button
                                type="submit"
                                className="w-full rounded-lg bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600 sm:w-auto sm:py-3 sm:text-base"
                            >
                                Search
                            </Button>
                        </form>
                    </div>

                </div>
            </div>
        </section>


    );
};

export default HomeSection;
