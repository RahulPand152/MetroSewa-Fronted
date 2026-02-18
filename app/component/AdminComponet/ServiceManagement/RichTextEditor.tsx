"use client";

import React from "react";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleFormat = (format: string, type: 'wrap' | 'prefix') => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = value || "";

        let newText = "";
        let newCursorPos = end;

        if (type === 'wrap') {
            const before = text.substring(0, start);
            const selected = text.substring(start, end);
            const after = text.substring(end);
            newText = `${before}${format}${selected}${format}${after}`;
            newCursorPos = end + (format.length * 2);
        } else {
            // prefix (for lists)
            const before = text.substring(0, start);
            const after = text.substring(start);
            // If we are not at the start of a line, add a newline
            const prefix = (start > 0 && text[start - 1] !== '\n') ? `\n${format} ` : `${format} `;
            newText = `${before}${prefix}${after}`;
            newCursorPos = start + prefix.length;
        }

        onChange(newText);

        // Restore focus and cursor
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const formatButtons = [
        { icon: Bold, label: "Bold", action: () => handleFormat("**", "wrap") },
        { icon: Italic, label: "Italic", action: () => handleFormat("_", "wrap") },
        { icon: Underline, label: "Underline", action: () => handleFormat("__", "wrap") }, // Markdown doesn't really have underline, using bold/italic mix or custom
    ];

    const listButtons = [
        { icon: List, label: "Bullet List", action: () => handleFormat("-", "prefix") },
        { icon: ListOrdered, label: "Ordered List", action: () => handleFormat("1.", "prefix") },
    ];

    return (
        <TooltipProvider>
            <div className="border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {formatButtons.map((btn, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); btn.action(); }}
                                    className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                >
                                    <btn.icon className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{btn.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                    {listButtons.map((btn, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); btn.action(); }}
                                    className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                >
                                    <btn.icon className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{btn.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    className="w-full bg-white dark:bg-slate-900 border-none p-4 text-sm focus:outline-none resize-y min-h-[120px]"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </TooltipProvider>
    );
}
