"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useLogin } from "@/src/hooks/useAuth";
import { setCookie } from "@/src/lib/cookies";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export default function Signin() {
    const id = useId()

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
                setErrorMsg(err?.response?.data?.message || err.message || "Login failed");
            }
        });
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border bg-background p-6 shadow-sm">
                
                {/* Back to Home */}
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to home
                </Link>

                {/* Header */}
                <div className="flex flex-col items-center gap-2">
                    <div
                        className="flex size-11 items-center justify-center "

                    >

                    </div>

                    <h1 className="text-2xl font-semibold">Welcome to MetroSewa</h1>
                    <p className="text-center text-sm text-muted-foreground">
                        Login to manage your bookings and services
                    </p>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor={`${id}-email`}>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                id={`${id}-email`}
                                                type="email"
                                                placeholder="hi@yourcompany.com"
                                                {...field}
                                            />
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
                                        <FormLabel htmlFor={`${id}-password`}>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    id={`${id}-password`}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => router.push("/forget-password")}
                                className="text-sm underline hover:no-underline text-muted-foreground"
                            >
                                Forgot password?
                            </button>
                        </div>


                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>

                {/* Divider */}
                <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                    <span className="text-xs text-muted-foreground">Or</span>
                </div>

                {/* OAuth */}
                {/* <Button variant="outline" className="w-full">
                    Login with Google
                </Button> */}
            </div>
        </div >
    );
}
