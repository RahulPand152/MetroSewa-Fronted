
import type { Metadata } from "next";
import React from "react";
import HomeSection from "./component/HomeSection";

export const metadata: Metadata = {
  title: "Kaamhubs - Find the right job for your next step",
  description:
    "Kaamhubs helps you find the perfect job opportunities tailored to your skills and career goals. Explore thousands of listings and take the next step in your professional journey with Kaamhubs.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kaamhubs - Find the right job for your next step",
    description:
      "Kaamhubs helps you find the perfect job opportunities tailored to your skills and career goals. Explore thousands of listings and take the next step in your professional journey with Kaamhubs.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/home.jpg",
        width: 1200,
        height: 630,
        alt: "Kaamhubs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaamhubs - Find the right job for your next step",
    description:
      "Kaamhubs helps you find the perfect job opportunities tailored to your skills and career goals. Explore thousands of listings and take the next step in your professional journey with Kaamhubs.",
    images: ["/twitter-og.png"],
  },
};

const Home = () => {
  return <>
    <HomeSection />

  </>;
};

export default Home;
