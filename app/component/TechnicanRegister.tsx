"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { useTechnicianRegister, useVerifyRegistrationOtp } from "@/src/hooks/useAuth"

const OTP_LENGTH = 6

// --- Zod Schema ---
const technicianSchema = z.object({
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
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type TechnicianFormValues = z.infer<typeof technicianSchema>

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
]

export default function TechnicianRegistrationForm() {
    const router = useRouter()
    const [step, setStep] = useState<"form" | "otp">("form")
    const [registeredEmail, setRegisteredEmail] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [otpError, setOtpError] = useState("")
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""))
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])

    const { mutate: registerTechnician, isPending: isRegistering } = useTechnicianRegister()
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyRegistrationOtp()

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
    })

    async function onSubmit(data: TechnicianFormValues) {
        setErrorMsg("")
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
                    setRegisteredEmail(data.email)
                    setStep("otp")
                },
                onError: (err: any) => {
                    const msg =
                        err?.response?.data?.error?.message ||
                        err?.response?.data?.message ||
                        err.message ||
                        "Registration failed. Please try again."
                    setErrorMsg(msg)
                    toast.error(msg)
                },
            }
        )
    }

    // ── OTP helpers ─────────────────────────────────────────────────────
    const handleOtpChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return
        const next = [...otp]
        next[index] = value
        setOtp(next)
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
        const next = [...otp]
        pasted.split("").forEach((char, i) => { next[i] = char })
        setOtp(next)
        inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
    }

    const handleVerifyOtp = () => {
        const code = otp.join("")
        if (code.length < OTP_LENGTH) {
            setOtpError("Please enter all 6 digits.")
            return
        }
        setOtpError("")
        verifyOtp(
            { email: registeredEmail, otp: code },
            {
                onSuccess: () => {
                    toast.success("Email verified! Please sign in.")
                    router.push("/signin")
                },
                onError: (err: any) => {
                    const msg =
                        err?.response?.data?.error?.message ||
                        err?.response?.data?.message ||
                        err.message ||
                        "Invalid OTP. Please try again."
                    setOtpError(msg)
                },
            }
        )
    }

    // ── OTP Screen ───────────────────────────────────────────────────────
    if (step === "otp") {
        return (
            <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-8 border">
                <h1 className="text-center text-2xl font-bold tracking-wide mb-2">
                    Metro <span className="text-blue-600">Sewa</span>
                </h1>
                <h2 className="text-xl font-semibold text-center mb-2">OTP Verification</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Enter the 6-digit code sent to <strong>{registeredEmail}</strong>
                </p>

                <div className="flex justify-center items-center gap-2 mb-4">
                    {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <div key={i} className="flex items-center">
                            <input
                                ref={(el) => { inputsRef.current[i] = el }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otp[i]}
                                onChange={(e) => handleOtpChange(e.target.value, i)}
                                onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                onPaste={handleOtpPaste}
                                className={`w-11 h-13 text-center text-xl font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${otpError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    } dark:bg-slate-900 dark:text-white`}
                            />
                            {i === 2 && <span className="mx-2 text-xl text-gray-400">-</span>}
                        </div>
                    ))}
                </div>

                {otpError && (
                    <p className="text-center text-red-500 text-sm mb-3">{otpError}</p>
                )}

                <Button
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="w-full h-12 rounded-xl text-base font-semibold"
                >
                    {isVerifying ? (
                        <><Spinner className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                    ) : (
                        "Verify & Continue"
                    )}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Wrong email?{" "}
                    <button
                        onClick={() => {
                            setStep("form")
                            setOtp(Array(OTP_LENGTH).fill(""))
                            setOtpError("")
                        }}
                        className="text-primary hover:underline"
                    >
                        Go back
                    </button>
                </p>
            </div>
        )
    }

    // ── Registration Form ────────────────────────────────────────────────
    return (
        <Card className="w-full max-w-3xl mx-auto shadow-xl border-0 overflow-y-scroll rounded-2xl">
            <div className="flex flex-col h-full bg-white dark:bg-slate-950">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50">
                    <CardHeader className="p-0 flex items-center justify-center">
                        <CardTitle className="md:text-xl text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                            Join MetroSewa <span className="text-primary">as a Technician</span>
                        </CardTitle>
                        <CardDescription className="text-gray-500 text-base mt-2">
                            Create your account to get started
                        </CardDescription>
                    </CardHeader>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mx-8 mt-4 bg-rose-50 text-rose-500 p-3 rounded-md text-sm font-medium text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Scrollable Form Content */}
                <ScrollArea className="flex-1 px-8 py-6 max-h-[calc(90vh-100px)]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* 1. Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter first name" {...field} className="h-10 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all" />
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
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter last name" {...field} className="h-10 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all" />
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
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="name@example.com" {...field} className="h-10 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all" />
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
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+977 98XXXXXXXX" {...field} className="h-10 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all" />
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
                                                    <FormLabel>Full Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Street, City, Ward No" {...field} className="h-10 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all" />
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
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    Your Expertise
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="expertise"
                                    render={() => (
                                        <FormItem>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {EXPERTISE_OPTIONS.map((item) => (
                                                    <FormField
                                                        key={item}
                                                        control={form.control}
                                                        name="expertise"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={item}
                                                                    className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(item)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, item])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== item
                                                                                        )
                                                                                    )
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="text-sm font-normal cursor-pointer w-full">
                                                                        {item}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )
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
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Security
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} className="h-10 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all" />
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
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} className="h-10 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* 4. Terms */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <FormField
                                    control={form.control}
                                    name="terms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                                    I agree to the <span className="text-blue-600 underline cursor-pointer">Terms & Conditions</span> and <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
                                                </FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Submit */}
                            <div className="sticky bottom-0 bg-white dark:bg-slate-950 pt-4 pb-2 z-10 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.01]"
                                    disabled={isRegistering}
                                >
                                    {isRegistering ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        "Register as MetroSewa Technician"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
            </div>
        </Card>
    )
}
