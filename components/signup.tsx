"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRegister, useVerifyRegistrationOtp } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";

const OTP_LENGTH = 6;

const formSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: verifyOtp, isPending: isVerifying } =
    useVerifyRegistrationOtp();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (values) => {
    setErrorMsg("");
    register(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phone,
        password: values.password,
      },
      {
        onSuccess: () => {
          setRegisteredEmail(values.email);
          setStep("otp");
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.error?.message ||
              err?.response?.data?.message ||
              err.message ||
              "Registration failed",
          );
        },
      },
    );
  };

  // ── OTP helpers ──────────────────────────────────────────────────────
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    setOtpError("");
    verifyOtp(
      { email: registeredEmail, otp: code },
      {
        onSuccess: () => {
          router.push("/signin");
        },
        onError: (err: any) => {
          setOtpError(
            err?.response?.data?.error?.message ||
              err?.response?.data?.message ||
              err.message ||
              "Invalid OTP. Please try again.",
          );
        },
      },
    );
  };

  // ── OTP Screen ────────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4 lg:p-8 font-sans">
        <div className="flex w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden bg-white min-h-screen lg:min-h-0 lg:h-[85vh] border-0 lg:border lg:border-gray-200 relative">
          <Link
            href="/"
            className="absolute top-4 left-4 lg:top-8 lg:left-8 flex items-center text-gray-800 hover:text-black hover:bg-gray-300 p-2 transition-colors z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>

          {/* Left Section - Form (50%) */}
          <div className="flex flex-col justify-center py-10 w-full lg:w-[50%] h-full overflow-y-auto px-6 lg:px-20 relative z-10 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="w-full max-w-md mx-auto relative lg:mt-8">
              <div className="flex flex-col space-y-3 mb-10 text-center lg:text-left">
                <h2 className="text-[2.5rem] font-bold tracking-tight text-[#1e5b87] leading-tight">
                  Verify Account
                </h2>
                <p className="text-[15px] font-medium text-slate-500 leading-relaxed">
                  Enter the 6-digit code sent to <br />
                  <strong className="text-[#1e5b87] block mt-1">
                    {registeredEmail}
                  </strong>
                </p>
              </div>

              <div className="bg-white rounded-2xl">
                <div className="flex justify-center items-center gap-2 mb-8 mt-4">
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <input
                        ref={(el) => {
                          inputsRef.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i]}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        onPaste={handleOtpPaste}
                        className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#236b9d] transition-all shadow-sm ${
                          otpError ? "border-red-500" : "border-slate-200"
                        } bg-[#F4F5F7]`}
                      />
                      {i === 2 && (
                        <span className="mx-1 text-xl text-slate-300">-</span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full h-14 rounded-xl text-[16px] font-semibold tracking-wide bg-[#236b9d] hover:bg-[#1e5b87] text-white shadow-sm hover:shadow-md transition-all mt-4"
                >
                  {isVerifying ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>

                <div className="text-center text-[15px] font-medium text-slate-600 mt-10">
                  Wrong email?{" "}
                  <button
                    onClick={() => {
                      setStep("form");
                      setOtp(Array(OTP_LENGTH).fill(""));
                      setOtpError("");
                    }}
                    className="text-[#1e5b87] hover:text-[#164263] font-bold transition-colors"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Visual (50%) */}
          <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-slate-100 items-center justify-center border-l border-gray-200">
            <img
              src="/metrosewabrnd.png"
              alt="Create account workspace"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ─────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 lg:p-8 font-sans">
      <Link
        href="/"
        className="absolute top-4 left-4 lg:top-8 lg:left-8 flex items-center text-gray-800 hover:text-black hover:bg-gray-300 p-2 rounded-full transition-colors z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </Link>

      <div className="flex w-full max-w-6xl shadow-2xl overflow-hidden bg-white min-h-screen lg:min-h-0 lg:h-[85vh] border-0 lg:border lg:border-gray-200 relative">
        {/* Left Section - Form (50%) */}
        <div className="flex flex-col py-10 w-full lg:w-[50%] h-full overflow-y-auto px-6 lg:px-20 relative z-10 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-md mx-auto relative pb-12 lg:mt-8">
            <div className="flex flex-col space-y-3 mb-10 text-center lg:text-left">
              <h2 className="text-[2.5rem] font-bold tracking-tight text-[#1e5b87] leading-tight">
                Create Account
              </h2>
              <p className="text-[15px] font-medium text-slate-500 leading-relaxed">
                Join MetroSewa today and discover
                <br className="hidden lg:block" /> reliable services whenever
                you need them.
              </p>
            </div>

            <div className="w-full">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative flex items-center">
                              <User
                                className="absolute left-4 h-5 w-5 text-gray-400"
                                strokeWidth={1.5}
                              />
                              <Input
                                placeholder="First name"
                                className={`w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] ${form.formState.errors.firstName ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:border-gray-400"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all`}
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
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative flex items-center">
                              <User
                                className="absolute left-4 h-5 w-5 text-gray-400"
                                strokeWidth={1.5}
                              />
                              <Input
                                placeholder="Last name"
                                className={`w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] ${form.formState.errors.lastName ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:border-gray-400"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all`}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Mail
                              className="absolute left-4 h-5 w-5 text-gray-400"
                              strokeWidth={1.5}
                            />
                            <Input
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Phone
                              className="absolute left-4 h-5 w-5 text-gray-400"
                              strokeWidth={1.5}
                            />
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              className={`w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] ${form.formState.errors.phone ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:border-gray-400"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all`}
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
                              className="absolute left-4 h-5 w-5 text-gray-400"
                              strokeWidth={1.5}
                            />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className={`w-full pl-12 pr-12 py-3 h-auto rounded border bg-[#F4F5F7] ${form.formState.errors.password ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:border-gray-400"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all`}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" strokeWidth={1.5} />
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

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Lock
                              className="absolute left-4 h-5 w-5 text-gray-400"
                              strokeWidth={1.5}
                            />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className={`w-full pl-12 pr-12 py-3 h-auto rounded border bg-[#F4F5F7] ${form.formState.errors.confirmPassword ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:border-gray-400"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all`}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" strokeWidth={1.5} />
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

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#1e5b87] data-[state=checked]:text-white rounded h-4 w-4 border-slate-300"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs font-semibold text-slate-600">
                            I agree to the{" "}
                            <Link
                              href="#"
                              className="text-[#1e5b87] hover:underline"
                            >
                              Terms
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="#"
                              className="text-[#1e5b87] hover:underline"
                            >
                              Conditions
                            </Link>
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-sm text-[16px] font-semibold tracking-wide bg-[#236b9d] hover:bg-[#1e5b87] text-white shadow-sm hover:shadow-md transition-all mt-4"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-[15px] font-medium text-slate-600 mt-10">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-[#1e5b87] hover:text-[#164263] font-bold transition-colors"
                >
                  Log In
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
