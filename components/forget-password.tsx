"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPassword, useVerifyOTP, useResetPassword } from "@/src/hooks/useAuth";
import { toast } from "sonner";

const OTP_LENGTH = 6;

const EmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const PasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const ForgetPassword = ({ onBack }: { onBack?: () => void }) => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mutations
  const { mutate: forgotPassword, isPending: isSendingEmail } = useForgotPassword();
  const { mutate: verifyOtpMutate, isPending: isVerifyingOTP } = useVerifyOTP();
  const { mutate: resetPasswordMutate, isPending: isResettingPassword } = useResetPassword();

  // Forms
  const emailForm = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleBack = () => {
    if (step !== "email") {
      setStep("email");
      return;
    }
    if (onBack) {
      onBack();
    } else {
      router.push("/signin");
    }
  };

  const onEmailSubmit: SubmitHandler<z.infer<typeof EmailSchema>> = (data) => {
    forgotPassword({ email: data.email }, {
      onSuccess: () => {
        setEmail(data.email);
        setStep("otp");
        toast.success("OTP sent to your email.");
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err.message || "Failed to send reset email.";
        toast.error(msg);
      }
    });
  };

  // OTP handlers
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
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
    verifyOtpMutate({ email, otp: code }, {
      onSuccess: () => {
        setStep("password");
        toast.success("OTP Verified! Enter your new password.");
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err.message || "Invalid OTP.";
        setOtpError(msg);
      }
    });
  };

  // Password handler
  const onPasswordSubmit: SubmitHandler<z.infer<typeof PasswordSchema>> = (data) => {
    resetPasswordMutate({ email, password: data.password }, {
      onSuccess: () => {
        toast.success("Password reset successfully! Please sign in.");
        router.push("/signin");
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err.message || "Failed to reset password.";
        toast.error(msg);
      }
    });
  };

  return (
    <Card className="flex w-full max-w-[440px] shadow-none flex-col gap-6 p-5 md:p-8 border-none md:border-solid">
      <CardHeader className="flex flex-col items-center gap-2">
        <div className="flex flex-col space-y-1.5 text-center">
          <CardTitle className="md:text-xl font-medium">
            {step === "email" && "Forgot password?"}
            {step === "otp" && "OTP Verification"}
            {step === "password" && "Reset Password"}
          </CardTitle>
          <CardDescription className="tracking-[-0.006em]">
            {step === "email" && "Enter your email address and we'll send you an OTP to reset your password."}
            {step === "otp" && `Enter the 6-digit code sent to ${email}`}
            {step === "password" && "Enter your new password below."}
          </CardDescription>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">

        {/* Step 1: Email */}
        {step === "email" && (
          <Form {...emailForm}>
            <form className="flex flex-col gap-4" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="metrosewa@gmail.com" className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSendingEmail}>
                {isSendingEmail ? <><Spinner className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send OTP"}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center items-center gap-2 my-2">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <input
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    onPaste={handleOtpPaste}
                    className={`w-10 h-12 text-center text-lg font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${otpError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } dark:bg-slate-900 dark:text-white`}
                  />
                  {i === 2 && <span className="mx-1 text-gray-400">-</span>}
                </div>
              ))}
            </div>
            {otpError && <p className="text-center text-red-500 text-sm">{otpError}</p>}

            <Button onClick={handleVerifyOtp} disabled={isVerifyingOTP} className="w-full">
              {isVerifyingOTP ? <><Spinner className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify OTP"}
            </Button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === "password" && (
          <Form {...passwordForm}>
            <form className="flex flex-col gap-4" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="rounded-lg"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className="rounded-lg"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isResettingPassword}>
                {isResettingPassword ? <><Spinner className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}

        <Separator className="mt-6 mb-2" />
        <div className="text-sm flex items-center gap-1">
          <Button type="button" onClick={handleBack} variant="link" size="sm" className="p-0 underline">
            {step === "email" ? "Back to Sign in" : "Back"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
