"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, X, Loader2, ImageIcon, XCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ChatBoxProps {
    conversationId: string;
    bookingId: string;
    currentUserId: string;
    currentUserName: string;
    currentUserRole: "USER" | "TECHNICIAN";
    embedded?: boolean;
}

export default function ChatBox({
    conversationId,
    bookingId,
    currentUserId,
    currentUserName,
    currentUserRole,
    embedded = false,
}: ChatBoxProps) {
    const messages = useQuery(api.messages.getByConversationAndBooking, { conversationId, bookingId });
    const sendMessage = useMutation(api.messages.sendMessage);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setSelectedFilePreview(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setSelectedFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed && !selectedFile) return;
        if (isSending) return;

        setIsSending(true);
        try {
            let photoId: Id<"_storage"> | undefined;

            if (selectedFile) {
                // Generate upload URL and post the file
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });
                
                if (!result.ok) throw new Error("Failed to upload image");
                const { storageId } = await result.json();
                photoId = storageId as Id<"_storage">;
            }

            await sendMessage({
                conversationId,
                bookingId,
                senderId: currentUserId,
                senderRole: currentUserRole,
                senderName: currentUserName,
                content: trimmed,
                photoId,
            });
            setInput("");
            clearFile();
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const unreadCount = messages?.length ?? 0;

    // ─── Floating Button ────────────────────────────────────
    if (!embedded && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5
                    bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white
                    px-5 py-3.5 rounded-full shadow-xl
                    hover:shadow-2xl hover:scale-105 active:scale-95
                    transition-all duration-300 group"
            >
                <MessageCircle className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-semibold">Chat</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px]
                        font-bold w-5 h-5 rounded-full flex items-center justify-center
                        ring-2 ring-white animate-pulse"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>
        );
    }

    // ─── Chat Panel ─────────────────────────────────────────
    return (
        <div className={
            embedded
                ? "flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm h-full min-h-[400px] max-h-[500px]"
                : "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
        }>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5
                bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white shrink-0"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm leading-tight">{embedded ? "MetroSewa Chat" : "MetroSewa Chat"}</p>
                        {/* <p className="text-[11px] text-white/70">Real-time messaging</p> */}
                    </div>
                </div>
                {!embedded && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                            flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3
                    bg-slate-50 dark:bg-slate-950 scroll-smooth"
            >
                {messages === undefined ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-[#0077b6]" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#0077b6]/10 flex items-center justify-center">
                            <MessageCircle className="h-7 w-7 text-[#0077b6]" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">No messages yet</p>
                        <p className="text-xs text-slate-400 max-w-[200px]">
                            Start the conversation below
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                        ${isMe
                                            ? "bg-[#0077b6] text-white rounded-br-md"
                                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-md"
                                        }`}
                                >
                                    {!isMe && (
                                        <p className={`text-[10px] font-bold mb-1 ${isMe ? "text-white/60" : "text-[#0077b6]"}`}>
                                            {msg.senderName}
                                        </p>
                                    )}
                                    {msg.photoUrl && (
                                        <div className="mb-2 w-full overflow-hidden rounded-xl border border-white/10 shadow-sm bg-black/5 dark:bg-white/5">
                                            <a href={msg.photoUrl} target="_blank" rel="noopener noreferrer">
                                                <img 
                                                    src={msg.photoUrl} 
                                                    alt="Attached photo" 
                                                    className="w-full max-w-[240px] max-h-[300px] object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                                />
                                            </a>
                                        </div>
                                    )}
                                    {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                                    <p className={`text-[10px] mt-1.5 text-right ${isMe ? "text-white/50" : "text-slate-400"}`}>
                                        {new Date(msg.createdAt).toLocaleString([], {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3">
                {selectedFilePreview && (
                    <div className="mb-3 relative group w-fit">
                        <img 
                            src={selectedFilePreview} 
                            alt="Preview" 
                            className="h-20 w-auto rounded-lg object-cover ring-2 ring-[#0077b6]/30 shadow-sm"
                        />
                        <button 
                            onClick={clearFile}
                            className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-0.5 hover:bg-rose-500 hover:scale-110 transition-all shadow-md"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                        className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800
                            dark:text-slate-400 flex items-center justify-center shrink-0
                            transition-all hover:text-[#0077b6] disabled:opacity-40"
                    >
                        <ImageIcon className="h-5 w-5" />
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700
                            bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm
                            text-slate-800 dark:text-slate-200
                            placeholder:text-slate-400
                            focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6]
                            transition-all max-h-24 overflow-y-auto"
                        style={{ minHeight: "40px" }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !selectedFile) || isSending}
                        className="w-10 h-10 rounded-xl bg-[#0077b6] text-white
                            flex items-center justify-center shrink-0
                            hover:bg-[#023e8a] disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all active:scale-90 shadow-md"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
