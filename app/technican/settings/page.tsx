"use client";

import { useState } from "react";
import { Bell, Lock, Globe, Moon, Smartphone, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface SettingItem {
    id: string;
    label: string;
    description: string;
    defaultOn: boolean;
}

interface Section {
    title: string;
    icon: React.ElementType;
    settings: SettingItem[];
}

const sections: Section[] = [
    {
        title: "Notifications",
        icon: Bell,
        settings: [
            { id: "job-alerts", label: "Job Request Alerts", description: "Get notified when a new job is assigned", defaultOn: true },
            { id: "pay-notif", label: "Payment Notifications", description: "Alerts for payment received or pending", defaultOn: true },

        ],
    },

    {
        title: "Preferences",
        icon: Globe,
        settings: [
            { id: "dark-mode", label: "Dark Mode", description: "Use dark theme across the portal", defaultOn: false },

        ],
    },
];

function SettingsSection({ section }: { section: Section }) {
    const [values, setValues] = useState<Record<string, boolean>>(
        Object.fromEntries(section.settings.map((s) => [s.id, s.defaultOn]))
    );

    const toggle = (id: string) => setValues((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="flex-row items-center gap-2 border-b border-slate-100 dark:border-slate-800 py-4">
                <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-4 w-4 text-sky-500" />
                </div>
                <CardTitle className="text-base text-slate-800 dark:text-slate-200">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                {section.settings.map((setting, idx) => (
                    <div key={setting.id}>
                        <div className="flex items-center justify-between gap-4 px-6 py-4">
                            <Label htmlFor={setting.id} className="flex-1 cursor-pointer">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{setting.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{setting.description}</p>
                            </Label>
                            <Switch
                                id={setting.id}
                                checked={values[setting.id]}
                                onCheckedChange={() => toggle(setting.id)}
                                className="data-[state=checked]:bg-sky-500"
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your portal preferences</p>
            </div>

            {/* Account Banner */}
            <Card className="rounded-2xl border-sky-100 dark:border-sky-900/40 bg-gradient-to-r from-sky-50 to-sky-100/50 dark:from-sky-900/20 dark:to-sky-900/10 shadow-sm">
                {/* <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">Expert Technician Plan</p>
                        <p className="text-xs text-sky-600/80 dark:text-sky-400/80 mt-0.5">Verified account · All features unlocked</p>
                    </div>
                    <Button
                        size="sm"
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-sm shadow-sky-500/20 text-xs gap-1.5"
                    >
                        Upgrade <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                </CardContent> */}
            </Card>

            {/* Settings Sections */}
            {sections.map((section) => (
                <SettingsSection key={section.title} section={section} />
            ))}

            {/* Danger Zone */}
            <Card className="rounded-2xl border-rose-100 dark:border-rose-900/30 shadow-sm overflow-hidden">
                <CardHeader className="flex-row items-center gap-2 border-b border-rose-100 dark:border-rose-900/20 py-4">
                    <Badge variant="destructive" className="text-xs">Danger Zone</Badge>
                </CardHeader>
                <CardContent className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Delete Account</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Permanently remove your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm" className="rounded-xl text-xs flex-shrink-0">
                        Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
