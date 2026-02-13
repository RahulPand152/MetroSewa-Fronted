"use client";

import {
    Facebook,
    Instagram,
    Linkedin,
    MapPin,
    Phone,
    Mail,
    Wrench,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-[#020817] text-slate-300 px-6">
            <div className="max-w-7xl mx-auto py-16">

                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            {/* <div className="bg-blue-600 p-2 rounded-xl">
                                <Wrench className="text-white w-5 h-5" />
                            </div> */}
                            <h2 className="text-xl font-semibold text-white">
                                MetroSewa
                            </h2>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed">
                            Redefining home maintenance with verified professionals
                            and seamless on-demand booking experiences.
                        </p>

                        <div className="flex gap-3 pt-2">
                            <Link
                                href="#"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 transition"
                            >
                                <Facebook size={18} />
                            </Link>
                            <Link
                                href="#"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 transition"
                            >
                                <Instagram size={18} />
                            </Link>
                            <Link
                                href="#"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 transition"
                            >
                                <Linkedin size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-6">
                            Services
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white transition">Plumbing Repair</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Electrical Work</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Computer & CCTV</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Appliance Repair</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-6">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Contact Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-6">
                            Contact
                        </h4>

                        <div className="space-y-4 text-sm text-slate-400">
                            <div className="flex items-start gap-3">
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <MapPin size={16} className="text-blue-500" />
                                </div>
                                <span>
                                    123 Service Lane, Tech City, <br /> Kathmandu, Nepal
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <Phone size={16} className="text-blue-500" />
                                </div>
                                <span>+977 9800000000</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <Mail size={16} className="text-blue-500" />
                                </div>
                                <span>hello@metrosewa.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
                    <p>
                        © {new Date().getFullYear()} MetroSewa Inc. All rights reserved. Providing trust at your doorstep.
                    </p>

                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition">Privacy</Link>
                        <Link href="#" className="hover:text-white transition">Terms</Link>
                        <Link href="#" className="hover:text-white transition">Cookies</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
