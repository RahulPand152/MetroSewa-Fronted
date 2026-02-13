"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
    const router = useRouter()

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border bg-background p-6 shadow-sm">

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
                                            <Input
                                                id={`${id}-password`}
                                                type="password"
                                                placeholder="Enter your password"
                                                {...field}
                                            />
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


                        <Button type="submit" className="w-full">
                            Sign in
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
