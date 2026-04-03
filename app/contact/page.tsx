"use client"

import React, { Suspense, useState } from 'react'
import { NavbarPage } from '@/app/component/Navbar'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubmitContact } from '@/src/hooks/useContact'

const ContactForm = () => {
    const searchParams = useSearchParams()
    const serviceName = searchParams.get('service')
    const { mutate: submitContact, isPending } = useSubmitContact()

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        title: serviceName ? `Inquiry about ${serviceName}` : '',
        message: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        submitContact(
            { ...form, phone: form.phone || undefined },
            { onSuccess: () => setForm({ fullName: '', phone: '', email: '', title: '', message: '' }) }
        )
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {serviceName ? `Book ${serviceName}` : 'Contact Us'}
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" placeholder="Rahul Pandit" value={form.fullName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="9800000000" type="tel" value={form.phone} onChange={handleChange} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" placeholder="rahul@example.com" type="email" value={form.email} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Subject / Title</Label>
                    <Input id="title" placeholder="e.g. Plumbing service inquiry" value={form.title} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                        id="message"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell us more about your inquiry..."
                        value={form.message}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#236b9d] hover:bg-[#1a5175] text-lg py-6 rounded-sm"
                >
                    {isPending ? 'Sending...' :'Send Message'}
                </Button>
            </form>
        </div>
    )
}

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <NavbarPage />
            <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Side - Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-5xl mb-4">
                                Get in Touch
                            </h1>
                            <p className="text-lg text-gray-600 max-w-lg">
                                Have questions or need a service? Fill out the form and our team will get back to you within 24 hours.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-[#236b9d]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                                    <p className="text-gray-600">+977 1-4000000</p>
                                    <p className="text-sm text-gray-500">Mon-Fri 9am-6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-[#236b9d]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email</h3>
                                    <p className="text-gray-600">support@metrosewa.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-[#236b9d]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Head Office</h3>
                                    <p className="text-gray-600">Kathmandu, Nepal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <Suspense fallback={<div>Loading form...</div>}>
                        <ContactForm />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export default ContactPage
