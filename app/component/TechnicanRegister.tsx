"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  useTechnicianRegister,
  useVerifyRegistrationOtp,
} from "@/src/hooks/useAuth";

const OTP_LENGTH = 6;

// --- Zod Schema ---
const technicianSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(5, "Address is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm Password is required"),
    expertise: z.array(z.string()).min(1, "Select at least one expertise"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type TechnicianFormValues = z.infer<typeof technicianSchema>;

const EXPERTISE_OPTIONS = [
  "Plumbing",
  "Electrical",
  "Computer/CCTV",
  "Painting",
  "Moving",
  "Cleaning",
  "AC Repair",
  "Beauty & Salon",
  "Carpentry",
];

export default function TechnicianRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: registerTechnician, isPending: isRegistering } =
    useTechnicianRegister();
  const { mutate: verifyOtp, isPending: isVerifying } =
    useVerifyRegistrationOtp();

  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      expertise: [],
      terms: false,
    },
  });

  async function onSubmit(data: TechnicianFormValues) {
    setErrorMsg("");
    registerTechnician(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        address: data.address,
        password: data.password,
        bio: "",
        experience: 0,
        skills: data.expertise.join(", "), // Convert array to comma-separated string for backend
        certification: "",
      },
      {
        onSuccess: () => {
          setRegisteredEmail(data.email);
          setStep("otp");
        },
        onError: (err: any) => {
          // Error is handled entirely by global Axios interceptor which triggers a toast
        },
      },
    );
  }

  // ── OTP helpers ─────────────────────────────────────────────────────
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
          toast.success("Email verified! Please sign in.");
          router.push("/signin");
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            err.message ||
            "Invalid OTP. Please try again.";
          setOtpError(msg);
        },
      },
    );
  };

  // ── OTP Screen ───────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4 lg:p-8 font-sans">
        <div className="flex w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden bg-white min-h-screen lg:min-h-0 lg:h-[85vh] border-0 lg:border lg:border-gray-200 relative">
          {/* Back Link */}
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
                      className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#236b9d] bg-[#F4F5F7] ${
                        otpError ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {i === 2 && (
                      <span className="mx-1 text-xl text-slate-300">-</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Error messages are handled by global toast */}

              <Button
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full h-14 rounded-sm text-[16px] font-semibold tracking-wide bg-[#236b9d] hover:bg-[#1e5b87] text-white shadow-sm hover:shadow-md transition-all mt-4"
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

              <p className="text-center text-[15px] font-medium text-slate-600 mt-10">
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
              </p>
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

  // ── Registration Form ────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 lg:p-8 font-sans">
      <Link
        href="/"
        className="absolute top-4 left-4 lg:top-8 lg:left-8 flex items-center text-gray-800 hover:text-black hover:bg-gray-300 p-2 rounded-full transition-colors z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </Link>
      <div className="flex w-full max-w-6xl  overflow-hidden bg-white min-h-screen lg:min-h-0 lg:h-[85vh] border-0 lg:border lg:border-gray-200 relative">
        {/* Left Section - Form (50%) */}
        <div className="flex flex-col py-10 w-full lg:w-[50%] h-full overflow-y-auto px-6 lg:px-20 relative z-10 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-lg mx-auto">
            <div className="flex flex-col space-y-3 mb-10 text-center lg:text-left">
              <h2 className="text-[2.5rem] font-bold tracking-tight text-[#1e5b87] leading-tight">
                Join MetroSewa
              </h2>
              <p className="text-[15px] font-medium text-slate-500">
                Create your technician account to get started.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* 1. Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                placeholder="First Name"
                                {...field}
                                className="w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] border-gray-300 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all"
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
                                placeholder="Last Name"
                                {...field}
                                className="w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] border-gray-300 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                                placeholder="Email address"
                                {...field}
                                className="w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] border-gray-300 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all"
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
                                placeholder="Phone number"
                                {...field}
                                className="w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] border-gray-300 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative flex items-center">
                                <MapPin
                                  className="absolute left-4 h-5 w-5 text-gray-400"
                                  strokeWidth={1.5}
                                />
                                <Input
                                  placeholder="Full Address"
                                  {...field}
                                  className="w-full pl-12 pr-3 py-3 h-auto rounded border bg-[#F4F5F7] border-gray-300 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Expertise */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Your Expertise
                  </h3>
                  <FormField
                    control={form.control}
                    name="expertise"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                          {EXPERTISE_OPTIONS.map((item) => (
                            <FormField
                              key={item}
                              control={form.control}
                              name="expertise"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item}
                                    className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium cursor-pointer w-full text-gray-700">
                                      {item}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 3. Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                placeholder="Password"
                                {...field}
                                className="w-full pl-12 pr-12 py-3 h-auto rounded border bg-[#F4F5F7] border-gray-300 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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
                                placeholder="Confirm Password"
                                {...field}
                                className="w-full pl-12 pr-12 py-3 h-auto rounded border bg-[#F4F5F7] border-gray-300 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 text-black text-sm transition-all"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                              >
                                {showConfirmPassword ? (
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
                </div>

                {/* 4. Terms */}
                <div className="pt-4 border-t border-gray-100">
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-[13px] font-medium text-slate-500">
                            I agree to the{" "}
                            <span className="text-[#1e5b87] underline cursor-pointer hover:text-[#164263]">
                              Terms & Conditions
                            </span>{" "}
                            and{" "}
                            <span className="text-[#1e5b87] underline cursor-pointer hover:text-[#164263]">
                              Privacy Policy
                            </span>
                            .
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit */}
                <div className="pt-4 pb-2 z-10">
                  <Button
                    type="submit"
                    className="w-full py-6 text-sm font-medium rounded-sm bg-[#236B9D] hover:bg-[#1a5177] text-white transition-colors duration-300 mt-4"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register as Technician"
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="text-center text-[15px] font-medium text-slate-600 mt-10">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-[#1e5b87] hover:text-[#164263] font-bold transition-colors"
              >
                Sign In
              </Link>
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
