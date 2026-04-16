"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

interface ChatOpenButtonProps {
  conversationId: string;
  bookingId: string;
  currentUserId: string;
  onClick: () => void;
  isChatOpen?: boolean;
}

export function ChatOpenButton({
  conversationId,
  bookingId,
  currentUserId,
  onClick,
  isChatOpen = false,
}: ChatOpenButtonProps) {
  const messages = useQuery(api.messages.getByConversationAndBooking, {
    conversationId,
    bookingId,
  });

  const otherMessages = messages?.filter((m) => m.senderId !== currentUserId) || [];
  
  const storageKey = `chat_read_count_${bookingId}_${conversationId}`;
  
  const [readCount, setReadCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setReadCount(parseInt(stored, 10));
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (isChatOpen && otherMessages.length > readCount) {
      setReadCount(otherMessages.length);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, otherMessages.length.toString());
      }
    }
  }, [isChatOpen, otherMessages.length, readCount, storageKey]);

  const unreadCount = Math.max(0, otherMessages.length - readCount);

  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, otherMessages.length.toString());
        }
        setReadCount(otherMessages.length);
        onClick();
      }}
      className="relative flex items-center justify-center gap-2 px-4 py-2 bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-lg text-sm font-medium transition-colors"
    >
      <span>MetroSewa Chat</span>
      {unreadCount > 0 && (!isChatOpen) && (
        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
