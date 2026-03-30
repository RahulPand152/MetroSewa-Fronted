"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLogin } from "@/src/hooks/useAuth"
import { setCookie } from "@/src/lib/cookies"
import { LogIn, Mail, Lock } from "lucide-react"
import Link from "next/link"

interface AuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
    const [authEmail, setAuthEmail] = useState("")
    const [authPassword, setAuthPassword] = useState("")
    const [authError, setAuthError] = useState("")
    
    const { mutate: loginUser, isPending: isLoggingIn } = useLogin()

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("")
        loginUser({ email: authEmail, password: authPassword }, {
            onSuccess: (res: any) => {
                const data = res?.data ?? res
                if (data.token) setCookie("token", data.token)
                if (data.user?.role) setCookie("role", data.user.role)
                onOpenChange(false)
                if (onSuccess) onSuccess()
            },
            onError: (err: any) => {
                setAuthError(err?.response?.data?.message || err.message || "Login failed")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
                <div className="bg-slate-50 p-6 sm:p-8">
                    <DialogHeader className="space-y-3">
                        <div className="flex justify-center mb-2">
                            <div className="flex items-center gap-2 group cursor-default">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md">
                                    ✕
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900">
                                    MetroSewa
                                </span>
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center text-slate-900">Welcome Back</DialogTitle>
                        <DialogDescription className="text-center text-slate-500">
                            Sign in to your account to continue booking.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {authError && (
                        <div className="mt-4 text-red-600 text-sm font-medium p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                            {authError}
                        </div>
                    )}
                    
                    <form onSubmit={handleLoginSubmit} className="space-y-5 mt-6">
                        <div className="space-y-2 relative">
                            <Label className="text-slate-700 font-semibold">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input 
                                    type="email" 
                                    required 
                                    value={authEmail} 
                                    onChange={(e) => setAuthEmail(e.target.value)} 
                                    className="pl-10 h-12 bg-white border-slate-200 focus:border-blue-500 rounded-md"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <Label className="text-slate-700 font-semibold">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input 
                                    type="password" 
                                    required 
                                    value={authPassword} 
                                    onChange={(e) => setAuthPassword(e.target.value)} 
                                    className="pl-10 h-12 bg-white border-slate-200 focus:border-blue-500 rounded-md"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-md transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2" 
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? "Signing in..." : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>
                    
                    <div className="mt-8 pt-4 border-t border-slate-200 text-center">
                        <p className="text-slate-600">
                            Don't have an account?{" "}
                            <Link 
                                href="/signup" 
                                onClick={() => onOpenChange(false)}
                                className="text-blue-600 font-bold hover:underline transition-all"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
