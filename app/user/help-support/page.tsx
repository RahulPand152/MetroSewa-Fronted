"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, PhoneCall } from "lucide-react";

const faqs = [
    {
        question: "How do I book a service?",
        answer: "Select the category you need, choose a specific service, pick an available time slot, and confirm your booking. You will be matched with the nearest available professional."
    },
    {
        question: "How do I cancel my booking?",
        answer: "Go to the 'My Bookings' section, find your upcoming booking, click 'Details', and select 'Cancel Booking'. Note that cancellation fees may apply if canceled within 2 hours of the scheduled time."
    },
    {
        question: "Is there a warranty on the repairs?",
        answer: "Yes, we offer a standard 30-day warranty on all repair services. If the same issue occurs within 30 days, we'll send a technician to fix it for free."
    },
    {
        question: "How can I pay for the service?",
        answer: "You can pay securely online via eSewa, Khalti, or mobile banking directly through the app. We also accept cash on delivery once the job is completed."
    }
];

export default function HelpSupportPage() {
    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Help & Support</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We're here to help you with any issues or questions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Options */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <Card className="border-sky-100 dark:border-sky-900/30 bg-sky-50/50 dark:bg-sky-900/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base text-sky-900 dark:text-sky-100 flex items-center gap-2">
                                <PhoneCall className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                Call Us
                            </CardTitle>
                            <CardDescription className="text-sky-700/70 dark:text-sky-300">Mon-Sun, 8am to 8pm</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-sky-900 dark:text-sky-100">+977-98XXXXXXXX</p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Mail className="h-5 w-5 text-slate-500" />
                                Email Support
                            </CardTitle>
                            <CardDescription>Send us an email anytime</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">support@metrosewa.com</p>
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ and Contact Form */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* FAQ Section */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                            <CardTitle className="text-base text-slate-800 dark:text-slate-200">Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, i) => (
                                    <AccordionItem value={`item-${i}`} key={i} className="px-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <AccordionTrigger className="text-sm font-medium hover:no-underline hover:text-sky-600 dark:hover:text-sky-400 py-4 text-left">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    {/* Send Message Form */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="py-4">
                            <CardTitle className="text-base text-slate-800 dark:text-slate-200">Send us a Message</CardTitle>
                            <CardDescription>We'll get back to you as soon as possible.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" placeholder="What is this about?" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="bookingId">Booking ID (Optional)</Label>
                                        <Input id="bookingId" placeholder="e.g. B-1029" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Describe your issue or question..." className="min-h-[120px] resize-none" />
                                </div>
                                <Button type="button" className="bg-sky-500 hover:bg-sky-600 text-white self-start px-8">
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
