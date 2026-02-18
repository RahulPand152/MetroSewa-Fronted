import { Droplets, Zap, Wrench, Tv2, Paintbrush, Wind } from "lucide-react";

export interface Category {
    id: number;
    name: string;
    icon: any; // Using 'any' for Lucide icons as they are React components
    color: string;
    bg: string;
    hoverBg: string;
}

export const CATEGORIES: Category[] = [
    { id: 1, name: "Plumbing", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", hoverBg: "group-hover:bg-blue-600" },
    { id: 2, name: "Electrical", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", hoverBg: "group-hover:bg-amber-600" },
    { id: 3, name: "Cleaning", icon: Wrench, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", hoverBg: "group-hover:bg-purple-600" },
    { id: 4, name: "Appliance", icon: Tv2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", hoverBg: "group-hover:bg-emerald-600" },
    { id: 5, name: "Renovation", icon: Paintbrush, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", hoverBg: "group-hover:bg-orange-600" },
    { id: 6, name: "HVAC", icon: Wind, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20", hoverBg: "group-hover:bg-cyan-600" },
];

export const getCategoryConfig = (name: string): Category =>
    CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[0];
