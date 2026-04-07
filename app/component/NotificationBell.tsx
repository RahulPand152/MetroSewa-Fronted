'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
    AppNotification,
    useUserNotifications,
    useTechnicianNotifications,
    useAdminNotifications,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
} from '@/src/hooks/useNotifications';

// ── localStorage helpers for client-side read tracking ───────────────────────
const STORAGE_KEY = 'metro_sewa_read_ids';

function getReadIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function saveReadIds(ids: Set<string>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

// ── Single notification row ───────────────────────────────────────────────────
function NotificationItem({
    notification,
    isRead,
    onRead,
}: {
    notification: AppNotification;
    isRead: boolean;
    onRead: () => void;
}) {
    const router = useRouter();

    const handleClick = () => {
        onRead();
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!isRead ? 'bg-sky-50/60 dark:bg-sky-900/10' : ''}`}
        >
            {/* Unread dot */}
            <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 transition-colors ${!isRead ? 'bg-sky-500' : 'bg-transparent'}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!isRead ? 'font-semibold text-slate-800 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                    {notification.message}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
        </button>
    );
}

// ── Main NotificationBell component ─────────────────────────────────────────
export default function NotificationBell({ role }: { role: 'user' | 'technician' | 'admin' }) {
    const [open, setOpen] = useState(false);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const prevCountRef = useRef(0);

    // Load readIds from localStorage on mount
    useEffect(() => {
        setReadIds(getReadIds());
    }, []);

    // Fetch based on role
    const userQuery = useUserNotifications();
    const techQuery = useTechnicianNotifications();
    const adminQuery = useAdminNotifications();
    const markRead = useMarkNotificationRead();
    const markAllReadApi = useMarkAllNotificationsRead();

    const allNotifications: AppNotification[] =
        role === 'user' ? (userQuery.data || []) :
        role === 'technician' ? (techQuery.data || []) :
        (adminQuery.data || []);

    // Compute unread: for user role, use backend isRead; for others, use localStorage
    const isRead = (n: AppNotification) =>
        role === 'user' ? n.isRead : readIds.has(n.id);

    const activeNotifications = allNotifications.filter(n => !isRead(n));
    const unreadCount = activeNotifications.length;

    // Play a visual pulse when new notifications appear (no sound)
    const [pulse, setPulse] = useState(false);
    useEffect(() => {
        if (unreadCount > prevCountRef.current && prevCountRef.current !== 0) {
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);
        }
        prevCountRef.current = unreadCount;
    }, [unreadCount]);

    // Mark one as read
    const handleMarkOneRead = (id: string) => {
        if (role === 'user') {
            const notif = allNotifications.find(n => n.id === id);
            if (notif && !notif.isRead) {
                markRead.mutate(id);
            }
        } else {
            const next = new Set(readIds);
            next.add(id);
            setReadIds(next);
            saveReadIds(next);
        }
        setOpen(false);
    };

    // Mark all as read
    const handleMarkAllRead = () => {
        if (role === 'user') {
            if (activeNotifications.length > 0) {
                markAllReadApi.mutate();
            }
        } else {
            const next = new Set(readIds);
            activeNotifications.forEach(n => next.add(n.id));
            setReadIds(next);
            saveReadIds(next);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Bell className={`h-5 w-5 text-slate-600 dark:text-slate-400 ${pulse ? 'animate-bounce' : ''}`} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none ring-2 ring-white dark:ring-slate-950">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 p-0 shadow-xl rounded-2xl border-slate-200 dark:border-slate-700 overflow-hidden"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="text-xs font-bold bg-sky-100 text-[#236b9d] px-1.5 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Notification list */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {activeNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm font-medium text-slate-500">You're all caught up!</p>
                            <p className="text-xs text-slate-400 mt-1">No new notifications.</p>
                        </div>
                    ) : (
                        activeNotifications
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map(n => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    isRead={false} // Since we filter, they are always unread here
                                    onRead={() => handleMarkOneRead(n.id)}
                                />
                            ))
                    )}
                </div>

                {/* Footer */}
                {activeNotifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="px-4 py-2.5 text-center bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-400">
                                Refreshes every 30s
                            </p>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
