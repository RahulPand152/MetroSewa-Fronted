import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./component/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Metrosewa - On-Demand Home & Professional Services",
    template: "%s | Metrosew",
  },

  description:
    "Metrosew connects you with trusted professionals for on-demand home and business services. Book electricians, plumbers, cleaners, and more — fast, reliable, and hassle-free.",

  keywords: [
    "on-demand services",
    "home services",
    "electrician booking",
    "plumber near me",
    "cleaning services",
    "local service professionals",
    "Metrosew",
  ],

  metadataBase: new URL("https://metrosew.com"), // replace with your real domain

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Metro sewa - On-Demand Home & Professional Services",
    description:
      "Book trusted electricians, plumbers, cleaners, and other professionals instantly with Metrosew. Fast, reliable, and secure service at your doorstep.",
    url: "/",
    siteName: "Metrosew",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // recommended 1200x630
        width: 1200,
        height: 630,
        alt: "Metrosewa On-Demand Services",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Metrosewa - On-Demand Home & Professional Services",
    description:
      "Find and book trusted home service professionals instantly with Metrosew.",
    images: ["/twitter-og.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="/favicon.ico" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>

    </html>
  );
}
