"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useLogin } from "@/src/hooks/useAuth";
import { setCookie } from "@/src/lib/cookies";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export default function Signin() {
  const id = useId();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setErrorMsg("");
    login(values, {
      onSuccess: (res: any) => {
        const data = res?.data ?? res;
        if (data.token) {
          setCookie("token", data.token);
        }
        if (data.user?.role) {
          setCookie("role", data.user.role);
        }

        const role = data.user?.role;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "TECHNICIAN") {
          router.push("/technican");
        } else {
          router.push("/user");
        }
      },
      onError: (err: any) => {
        setErrorMsg(
          err?.response?.data?.message || err.message || "Login failed",
        );
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 lg:p-8 font-sans">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 lg:top-8 lg:left-8 flex items-center text-gray-800 hover:text-black hover:bg-gray-300 p-2  transition-colors z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </Link>
      <div className="flex w-full max-w-6xl shadow-2xl  overflow-hidden bg-white min-h-screen lg:min-h-0 lg:h-[85vh] border-0 lg:border lg:border-gray-200 relative">
        <div className="flex flex-col justify-center w-full lg:w-[50%] h-full overflow-y-auto px-6 py-12 lg:px-20 relative z-10 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-md mx-auto relative lg:mt-8">
            {/* Header */}
            <div className="flex flex-col space-y-3 mb-10 text-center lg:text-left">
              <h2 className="text-[2.5rem] font-bold tracking-tight text-[#1e5b87] leading-tight">
                Welcome Back{" "}
                <span className="inline-block origin-bottom-right hover:animate-wave">
                  👋
                </span>
              </h2>
              <p className="text-[15px] font-medium text-slate-500 leading-relaxed">
                Login to access your home services
              </p>
            </div>

            {/* Form */}
            <div className="w-full">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative flex items-center">
                              <Mail
                                className="absolute left-4 h-5 w-5 text-slate-400"
                                strokeWidth={1.5}
                              />
                              <Input
                                id={`${id}-email`}
                                type="email"
                                placeholder="Enter your email"
                                className={`w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] ${form.formState.errors.email ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:border-gray-400"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all`}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative flex items-center">
                              <Lock
                                className="absolute left-4 h-5 w-5 text-slate-400"
                                strokeWidth={1.5}
                              />
                              <Input
                                id={`${id}-password`}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className={`w-full pl-12 pr-12 py-3 h-auto rounded border bg-[#F4F5F7] ${form.formState.errors.password ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:border-gray-400"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all`}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showPassword ? (
                                  <EyeOff
                                    className="h-5 w-5"
                                    strokeWidth={1.5}
                                  />
                                ) : (
                                  <Eye className="h-5 w-5" strokeWidth={1.5} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-end pt-1 mb-8">
                    <Link
                      href="/forget-password"
                      className="text-[14px] font-semibold text-[#1e5b87] hover:text-[#164263] transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-sm text-[16px] font-semibold tracking-wide bg-[#236b9d] hover:bg-[#1e5b87] text-white shadow-sm hover:shadow-md transition-all"
                    disabled={isPending}
                  >
                    {isPending ? "Logging In..." : "Log In"}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-[15px] font-medium text-slate-600 mt-10">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#1e5b87] hover:text-[#164263] font-bold transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Visual (50%) */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <Image
                  src="/metrosewabrnd.png"
                  alt="Create account workspace"
                  fill
                  sizes="40vw"
                  className="object-cover object-top"
                  priority
                />
              </div>
      </div>
    </div>
  );
}
