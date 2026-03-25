"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import { common, createLowlight } from "lowlight";

// ─── Icons (inline SVG to avoid extra deps) ────────────────────────────────
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const Icons = {
    Bold: () => <Icon d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />,
    Italic: () => <Icon d="M19 4h-9M14 20H5M15 4 9 20" />,
    Underline: () => <Icon d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16" />,
    Strike: () => (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" />
        </svg>
    ),
    Code: () => <Icon d="M16 18 22 12 16 6M8 6 2 12 8 18" />,
    CodeBlock: () => (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="12" y1="2" x2="12" y2="22" />
        </svg>
    ),
    H1: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8M4 6v12M12 6v12M21 18V6l-3 3" /></svg>,
    H2: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8M4 6v12M12 6v12" /><path d="M16 12c1.1-1 4-1 4 0s-3 1-4 2 0 2 4 2" /></svg>,
    H3: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8M4 6v12M12 6v12" /><path d="M16 12c1.1-1 4-1 4 0s-3 1-4 2 3 1 4 2-2.9 1-4 0" /></svg>,
    BulletList: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>,
    OrderedList: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4M4 10h2M6 18H4c.7-1 2-1.5 2-2.5S5.3 14 4 15" /></svg>,
    TaskList: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="6" height="6" rx="1" /><path d="m3 17 2 2 4-4" /><line x1="13" y1="8" x2="21" y2="8" /><line x1="13" y1="18" x2="21" y2="18" /><line x1="13" y1="13" x2="21" y2="13" /></svg>,
    Blockquote: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>,
    Link: () => <Icon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
    Image: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    Table: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>,
    AlignLeft: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" /></svg>,
    AlignCenter: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6" /><line x1="17" y1="12" x2="7" y2="12" /><line x1="19" y1="18" x2="5" y2="18" /></svg>,
    AlignRight: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="18" x2="7" y2="18" /></svg>,
    AlignJustify: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="21" y1="18" x2="3" y2="18" /></svg>,
    Undo: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" /></svg>,
    Redo: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" /></svg>,
    Unlink: () => <Icon d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71M8 11l8 2M16 13l-8-2" />,
    Separator: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="12" x2="21" y2="12" /></svg>,
    ChevronDown: () => <Icon d="M6 9l6 6 6-6" />,
    Clear: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" /><path d="M15 9l-6 6M9 9l6 6" /></svg>,
    Write: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Preview: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
};

// ─── Toolbar Button ─────────────────────────────────────────────────────────
type ToolbarButtonProps = {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
};

const ToolbarButton = ({ onClick, active, disabled, title, children }: ToolbarButtonProps) => (
    <button
        type="button"
        title={title}
        disabled={disabled}
        onClick={onClick}
        style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            background: active ? "#eff6ff" : "transparent",
            color: active ? "#3b82f6" : disabled ? "#cbd5e1" : "#475569",
            transition: "all 0.15s ease",
            flexShrink: 0,
        }}
        onMouseEnter={(e) => {
            if (!active && !disabled) {
                (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9";
                (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
            }
        }}
        onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = active ? "#eff6ff" : "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = active ? "#3b82f6" : disabled ? "#cbd5e1" : "#475569";
        }}
    >
        {children}
    </button>
);

const Divider = () => (
    <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 6px", flexShrink: 0 }} />
);

// ─── Link Modal ─────────────────────────────────────────────────────────────
const LinkModal = ({
    onClose, onConfirm, initialUrl,
}: { onClose: () => void; onConfirm: (url: string) => void; initialUrl?: string }) => {
    const [url, setUrl] = useState(initialUrl || "https://");
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
            <div style={{
                background: "#fff", borderRadius: 12, padding: "20px 24px", width: 360,
                boxShadow: "0 16px 48px rgba(0,0,0,0.18)", border: "1px solid #d0d7de",
            }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14, color: "#24292f" }}>Insert Link</div>
                <input
                    autoFocus
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onConfirm(url)}
                    placeholder="https://example.com"
                    style={{
                        width: "100%", padding: "8px 12px", border: "1px solid #d0d7de", borderRadius: 6,
                        fontSize: 14, outline: "none", boxSizing: "border-box", color: "#24292f", background: "#f6f8fa",
                    }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                    <button type="button" onClick={onClose} style={{
                        padding: "6px 16px", borderRadius: 6, border: "1px solid #d0d7de",
                        background: "#f6f8fa", fontSize: 14, cursor: "pointer", color: "#24292f",
                    }}>Cancel</button>
                    <button type="button" onClick={() => onConfirm(url)} style={{
                        padding: "6px 16px", borderRadius: 6, border: "none",
                        background: "#0969da", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 500,
                    }}>Insert</button>
                </div>
            </div>
        </div>
    );
};

// ─── Image Modal ─────────────────────────────────────────────────────────────
const ImageModal = ({
    onClose, onConfirm,
}: { onClose: () => void; onConfirm: (src: string, alt: string) => void }) => {
    const [src, setSrc] = useState("https://");
    const [alt, setAlt] = useState("");
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
            <div style={{
                background: "#fff", borderRadius: 12, padding: "20px 24px", width: 380,
                boxShadow: "0 16px 48px rgba(0,0,0,0.18)", border: "1px solid #d0d7de",
            }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14, color: "#24292f" }}>Insert Image</div>
                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 13, color: "#57606a", display: "block", marginBottom: 4 }}>Image URL</label>
                    <input autoFocus value={src} onChange={(e) => setSrc(e.target.value)}
                        placeholder="https://example.com/image.png"
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #d0d7de", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box", color: "#24292f", background: "#f6f8fa" }}
                    />
                </div>
                <div style={{ marginBottom: 4 }}>
                    <label style={{ fontSize: 13, color: "#57606a", display: "block", marginBottom: 4 }}>Alt text</label>
                    <input value={alt} onChange={(e) => setAlt(e.target.value)}
                        placeholder="Image description"
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #d0d7de", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box", color: "#24292f", background: "#f6f8fa" }}
                    />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                    <button type="button" onClick={onClose} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #d0d7de", background: "#f6f8fa", fontSize: 14, cursor: "pointer", color: "#24292f" }}>Cancel</button>
                    <button type="button" onClick={() => onConfirm(src, alt)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#0969da", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Insert</button>
                </div>
            </div>
        </div>
    );
};

// ─── Toolbar ─────────────────────────────────────────────────────────────────
const Toolbar = ({ editor, onLinkClick, onImageClick }: {

    editor: Editor;
    onLinkClick: () => void;
    onImageClick: () => void;
}) => {
    if (!editor) return null;

    return (
        <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2,
            padding: "8px 12px", borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc", borderRadius: "12px 12px 0 0",
        }}>
            {/* Undo / Redo */}
            <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                <Icons.Undo />
            </ToolbarButton>
            <ToolbarButton title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                <Icons.Redo />
            </ToolbarButton>
            <Divider />

            {/* Headings */}
            <ToolbarButton title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Icons.H1 />
            </ToolbarButton>
            <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Icons.H2 />
            </ToolbarButton>
            <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Icons.H3 />
            </ToolbarButton>
            <Divider />

            {/* Inline Formatting */}
            <ToolbarButton title="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                <Icons.Bold />
            </ToolbarButton>
            <ToolbarButton title="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Icons.Italic />
            </ToolbarButton>
            <ToolbarButton title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <Icons.Underline />
            </ToolbarButton>
            <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                <Icons.Strike />
            </ToolbarButton>
            <ToolbarButton title="Inline Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
                <Icons.Code />
            </ToolbarButton>
            <Divider />

            {/* Alignment */}
            <ToolbarButton title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                <Icons.AlignLeft />
            </ToolbarButton>
            <ToolbarButton title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                <Icons.AlignCenter />
            </ToolbarButton>
            <ToolbarButton title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                <Icons.AlignRight />
            </ToolbarButton>
            <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
                <Icons.AlignJustify />
            </ToolbarButton>
            <Divider />

            {/* Lists */}
            <ToolbarButton title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <Icons.BulletList />
            </ToolbarButton>
            <ToolbarButton title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <Icons.OrderedList />
            </ToolbarButton>
            <ToolbarButton title="Task List" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
                <Icons.TaskList />
            </ToolbarButton>
            <Divider />

            {/* Block */}
            <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Icons.Blockquote />
            </ToolbarButton>
            <ToolbarButton title="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <Icons.CodeBlock />
            </ToolbarButton>
            <ToolbarButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <Icons.Separator />
            </ToolbarButton>
            <Divider />

            {/* Link / Image / Table */}
            <ToolbarButton title="Insert Link" active={editor.isActive("link")} onClick={onLinkClick}>
                <Icons.Link />
            </ToolbarButton>
            {editor.isActive("link") && (
                <ToolbarButton title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()}>
                    <Icons.Unlink />
                </ToolbarButton>
            )}
            <Divider />

            {/* Clear */}
            <ToolbarButton title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
                <Icons.Clear />
            </ToolbarButton>
        </div>
    );
};

// ─── Main Editor Props ───────────────────────────────────────────────────────
interface RichTextEditorProps {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
    maxHeight?: number;
    readOnly?: boolean;
    showCharCount?: boolean;
    characterLimit?: number;
    className?: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Write something...",
    minHeight = 200,
    maxHeight,
    readOnly = false,
    showCharCount = true,
    characterLimit,
}: RichTextEditorProps) {
    const lowlight = createLowlight(common);

    const [tab, setTab] = useState<"write" | "preview">("write");
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Underline,
            Link.configure({ openOnClick: false, autolink: true }),
            Image.configure({ allowBase64: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({ placeholder }),
            CodeBlockLowlight.configure({ lowlight }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            ...(characterLimit ? [CharacterCount.configure({ limit: characterLimit })] : [CharacterCount]),
        ],
        content: value,
        editable: !readOnly,
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    });

    // Sync external value changes
    useEffect(() => {
        if (!editor) return;

        editor.commands.setContent(value || "", {
            emitUpdate: false,
        });
    }, [value]);

    const handleLinkConfirm = useCallback((url: string) => {
        if (!editor) return;
        if (url) editor.chain().focus().setLink({ href: url }).run();
        setShowLinkModal(false);
    }, [editor]);

    const handleImageConfirm = useCallback((src: string, alt: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src, alt }).run();
        setShowImageModal(false);
    }, [editor]);

    const charCount = editor?.storage?.characterCount?.characters?.() ?? 0;
    const wordCount = editor?.storage?.characterCount?.words?.() ?? 0;

    const editorStyles = `
    .tiptap-gh-editor .ProseMirror {
      outline: none;
      min-height: ${minHeight}px;
      ${maxHeight ? `max-height: ${maxHeight}px; overflow-y: auto;` : ""}
      padding: 18px 22px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #334155;
      word-break: break-word;
    }
    .tiptap-gh-editor .ProseMirror p { margin-bottom: 0.75em; }
    .tiptap-gh-editor .ProseMirror p:last-child { margin-bottom: 0; }
    .tiptap-gh-editor .ProseMirror p.is-editor-empty:first-child::before {
      color: #94a3b8;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
    .tiptap-gh-editor .ProseMirror h1 { font-size: 1.875em; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; margin: 1.25em 0 0.75em; line-height: 1.2; }
    .tiptap-gh-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; margin: 1em 0 0.5em; line-height: 1.3; }
    .tiptap-gh-editor .ProseMirror h3 { font-size: 1.25em; font-weight: 600; color: #0f172a; margin: 1em 0 0.5em; line-height: 1.4; }
    .tiptap-gh-editor .ProseMirror strong { font-weight: 600; color: #0f172a; }
    .tiptap-gh-editor .ProseMirror em { font-style: italic; }
    .tiptap-gh-editor .ProseMirror u { text-decoration: underline; text-underline-offset: 3px; }
    .tiptap-gh-editor .ProseMirror s { text-decoration: line-through; color: #64748b; }
    .tiptap-gh-editor .ProseMirror a { color: #3b82f6; text-decoration: none; font-weight: 500; transition: color 0.15s; }
    .tiptap-gh-editor .ProseMirror a:hover { color: #2563eb; text-decoration: underline; }
    .tiptap-gh-editor .ProseMirror code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.85em;
      padding: 0.2em 0.4em;
      margin: 0;
      background-color: #f1f5f9;
      border-radius: 0.375rem;
      color: #e21d48;
    }
    .tiptap-gh-editor .ProseMirror pre {
      background-color: #0f172a;
      border-radius: 0.5rem;
      padding: 1rem 1.25rem;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
      line-height: 1.6;
      color: #e2e8f0;
      margin: 1.25em 0;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    .tiptap-gh-editor .ProseMirror pre code { background: none; padding: 0; font-size: inherit; color: inherit; }
    .tiptap-gh-editor .ProseMirror blockquote {
      border-left: 4px solid #cbd5e1;
      padding-left: 1rem;
      color: #64748b;
      margin: 1.25em 0;
      font-style: italic;
    }
    .tiptap-gh-editor .ProseMirror hr {
      border: none;
      border-top: 2px solid #e2e8f0;
      margin: 2em 0;
    }
    /* Fixed Bullet and Ordered Lists Override */
    .tiptap-gh-editor .ProseMirror ul { padding-left: 1.5rem !important; list-style-type: disc !important; margin: 1em 0; }
    .tiptap-gh-editor .ProseMirror ul li { display: list-item !important; list-style-type: disc !important; }
    .tiptap-gh-editor .ProseMirror ol { padding-left: 1.5rem !important; list-style-type: decimal !important; margin: 1em 0; }
    .tiptap-gh-editor .ProseMirror ol li { display: list-item !important; list-style-type: decimal !important; }
    .tiptap-gh-editor .ProseMirror li { margin: 0.25em 0; }
    .tiptap-gh-editor .ProseMirror li > p { margin: 0; display: inline-block; }
    
    .tiptap-gh-editor .ProseMirror ul[data-type="taskList"] { list-style: none !important; padding-left: 0.5rem !important; }
    .tiptap-gh-editor .ProseMirror ul[data-type="taskList"] li { display: flex !important; align-items: flex-start; gap: 0.5rem; list-style-type: none !important; }
    .tiptap-gh-editor .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] { margin-top: 0.35rem; cursor: pointer; accent-color: #3b82f6; width: 1.1em; height: 1.1em; border-radius: 0.25rem; }
    .tiptap-gh-editor .ProseMirror table {
      border-collapse: collapse; width: 100%; margin: 1.5em 0;
      display: block; overflow-x: auto;
    }
    .tiptap-gh-editor .ProseMirror th, .tiptap-gh-editor .ProseMirror td {
      border: 1px solid #cbd5e1; padding: 0.75rem 1rem; font-size: 0.875rem; text-align: left;
    }
    .tiptap-gh-editor .ProseMirror th { background-color: #f8fafc; font-weight: 600; color: #0f172a; }
    .tiptap-gh-editor .ProseMirror tr:nth-child(even) td { background-color: #f8fafc; }
    .tiptap-gh-editor .ProseMirror img { max-width: 100%; border-radius: 0.5rem; border: 1px solid #e2e8f0; height: auto; }
    .tiptap-gh-editor .ProseMirror .selectedCell:after { background: rgba(59, 130, 246, 0.1); content: ""; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none; position: absolute; z-index: 2; }
  `;

    return (
        <>
            <style>{editorStyles}</style>
            {showLinkModal && (
                <LinkModal
                    onClose={() => setShowLinkModal(false)}
                    onConfirm={handleLinkConfirm}
                    initialUrl={editor?.getAttributes("link").href}
                />
            )}
            {showImageModal && (
                <ImageModal
                    onClose={() => setShowImageModal(false)}
                    onConfirm={handleImageConfirm}
                />
            )}

            <div style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
                transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)";
            }}>
                {/* Write / Preview tabs */}
                {!readOnly && (
                    <div style={{
                        display: "flex", borderBottom: "1px solid #d0d7de",
                        background: "#f6f8fa", gap: 0,
                    }}>
                        {(["write", "preview"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    borderBottom: tab === t ? "2px solid #fd8c73" : "2px solid transparent",
                                    background: tab === t ? "#fff" : "transparent",
                                    color: tab === t ? "#24292f" : "#57606a",
                                    fontSize: 14,
                                    fontWeight: tab === t ? 600 : 400,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 6,
                                    transition: "all 0.1s",
                                }}
                            >
                                {t === "write" ? <><Icons.Write /> Write</> : <><Icons.Preview /> Preview</>}
                            </button>
                        ))}
                    </div>
                )}

                {/* Toolbar (only in write mode) */}
                {tab === "write" && !readOnly && editor && (
                    <Toolbar
                        editor={editor}
                        onLinkClick={() => setShowLinkModal(true)}
                        onImageClick={() => setShowImageModal(true)}
                    />
                )}

                {/* Bubble Menu */}



                {/* Editor / Preview Content */}
                <div className="tiptap-gh-editor">
                    {tab === "write" ? (
                        <EditorContent editor={editor} />
                    ) : (
                        <div
                            className="tiptap-gh-editor"
                            style={{ padding: "14px 16px", minHeight, color: "#24292f" }}
                            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "<p style='color:#8c959f'>Nothing to preview.</p>" }}
                        />
                    )}
                </div>

                {/* Footer: char/word count */}
                {showCharCount && !readOnly && (
                    <div style={{
                        display: "flex", justifyContent: "flex-end", alignItems: "center",
                        padding: "6px 14px", borderTop: "1px solid #d0d7de",
                        background: "#f6f8fa", fontSize: 12, color: "#8c959f", gap: 12,
                    }}>
                        {characterLimit && (
                            <span style={{ color: charCount > characterLimit * 0.9 ? "#cf222e" : "#8c959f" }}>
                                {charCount}/{characterLimit}
                            </span>
                        )}
                        <span>{wordCount} words · {charCount} chars</span>
                    </div>
                )}
            </div>
        </>
    );
}

export default RichTextEditor;
