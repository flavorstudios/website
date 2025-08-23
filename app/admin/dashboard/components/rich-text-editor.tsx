"use client"

/**
 * RichTextEditor
 * Google Fonts via next/font/google are free and self-hosted at build time.
 * No runtime requests to fonts.googleapis.com or gstatic.
 * Render saved content with the same fonts using:
 *   <div className="tiptap" dangerouslySetInnerHTML={{ __html: html }} />
 */

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import TextStyle from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import DOMPurify from "isomorphic-dompurify"
import { FontFamilySelect } from "./FontFamilySelect"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  socket?: WebSocket | null
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  socket,
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const clientId = useRef<string>(Math.random().toString(36).slice(2))
  const [remoteCursors, setRemoteCursors] = useState<Record<string, number>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)

  const activeClass = (active: boolean) =>
    active ? "bg-gray-200 text-gray-900" : ""

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      TextStyle,
      FontFamily,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Start typing…" }),
    ],
    content: value,
    onUpdate({ editor }) {
      const html = DOMPurify.sanitize(editor.getHTML())
      onChange(html)
    },
  })

  const handleFontChange = (font: string) => {
    if (!editor) return
    const chain = editor.chain().focus()
    if (font) {
      chain.setFontFamily(font).run()
    } else {
      chain.unsetFontFamily().run()
    }
  }

  // Keep TipTap in sync with prop changes
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [editor, value])

  // Send local selection to WebSocket
  useEffect(() => {
    if (!editor || !socket) return

    const handleSelection = ({ editor }: { editor: Editor }) => {
      const { from, to } = editor.state.selection
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({ type: "cursor", from, to, id: clientId.current }),
        )
      }
    }

    editor.on("selectionUpdate", handleSelection)
    return () => {
      editor.off("selectionUpdate", handleSelection)
    }
  }, [editor, socket])

  // Receive remote cursor messages
  useEffect(() => {
    if (!socket) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data))
        if (data?.type === "cursor" && data.id !== clientId.current) {
          setRemoteCursors((prev) => ({
            ...prev,
            [data.id]: Number(data.from) || 1,
          }))
        }
      } catch {
        // ignore malformed payloads
      }
    }

    socket.addEventListener("message", handleMessage)
    return () => {
      socket.removeEventListener("message", handleMessage)
    }
  }, [socket])

  // Insert Link Handler
  const insertLink = () => {
    if (!editor) return
    if (linkUrl) {
      if (linkText) {
        editor
          .chain()
          .focus()
          .insertContent(
            `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`,
          )
          .run()
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
      }
      setShowLinkDialog(false)
      setLinkUrl("")
      setLinkText("")
    }
  }

  // Image Insert Handler (by URL only)
  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  if (!editor) return null

  return (
    <motion.div
      className={`relative border border-gray-300 rounded-lg overflow-hidden bg-white w-full ${
        className || ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 sticky top-0 z-10">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Font family selector */}
          {editor && (
            <FontFamilySelect
              value={(editor.getAttributes("textStyle")?.fontFamily as string) || ""}
              onChange={handleFontChange}
            />
          )}

          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`h-8 w-8 p-0 ${activeClass(
                editor.isActive("heading", { level: 1 }),
              )}`}
              title="Heading 1"
              aria-label="Heading 1"
              aria-pressed={editor.isActive("heading", { level: 1 })}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`h-8 w-8 p-0 text-sm font-bold ${activeClass(
                editor.isActive("heading", { level: 2 }),
              )}`}
              title="Heading 2"
              aria-label="Heading 2"
              aria-pressed={editor.isActive("heading", { level: 2 })}
            >
              H2
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`h-8 w-8 p-0 text-sm font-bold ${activeClass(
                editor.isActive("heading", { level: 3 }),
              )}`}
              title="Heading 3"
              aria-label="Heading 3"
              aria-pressed={editor.isActive("heading", { level: 3 })}
            >
              H3
            </Button>
          </div>

          {/* Style Formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("bold"))}`}
              title="Bold"
              aria-label="Bold"
              aria-pressed={editor.isActive("bold")}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("italic"))}`}
              title="Italic"
              aria-label="Italic"
              aria-pressed={editor.isActive("italic")}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("underline"))}`}
              title="Underline"
              aria-label="Underline"
              aria-pressed={editor.isActive("underline")}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("bulletList"))}`}
              title="Bullet List"
              aria-label="Bullet List"
              aria-pressed={editor.isActive("bulletList")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("orderedList"))}`}
              title="Numbered List"
              aria-label="Numbered List"
              aria-pressed={editor.isActive("orderedList")}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`h-8 w-8 p-0 ${activeClass(
                editor.isActive({ textAlign: "left" }),
              )}`}
              title="Align Left"
              aria-label="Align Left"
              aria-pressed={editor.isActive({ textAlign: "left" })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`h-8 w-8 p-0 ${activeClass(
                editor.isActive({ textAlign: "center" }),
              )}`}
              title="Align Center"
              aria-label="Align Center"
              aria-pressed={editor.isActive({ textAlign: "center" })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`h-8 w-8 p-0 ${activeClass(
                editor.isActive({ textAlign: "right" }),
              )}`}
              title="Align Right"
              aria-label="Align Right"
              aria-pressed={editor.isActive({ textAlign: "right" })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Special Elements */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("blockquote"))}`}
              title="Quote"
              aria-label="Quote"
              aria-pressed={editor.isActive("blockquote")}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("codeBlock"))}`}
              title="Code Block"
              aria-label="Code Block"
              aria-pressed={editor.isActive("codeBlock")}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkDialog(true)}
              className={`h-8 w-8 p-0 ${activeClass(editor.isActive("link"))}`}
              title="Insert Link"
              aria-label="Insert Link"
              aria-pressed={editor.isActive("link")}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertImage}
              className="h-8 w-8 p-0"
              title="Insert Image"
              aria-label="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor + remote cursor overlay */}
      <div ref={containerRef} className="relative">
        <EditorContent
          editor={editor}
          data-placeholder={placeholder}
          className="tiptap min-h-[60vh] p-6 focus:outline-none prose-lg max-w-none"
          style={{
            lineHeight: "1.7",
            fontSize: "18px",
          }}
        />

        {editor &&
          containerRef.current &&
          Object.entries(remoteCursors).map(([id, pos]) => {
            try {
              const maxPos = editor.state.doc.content.size
              const clamped = Math.max(1, Math.min(pos, maxPos))
              const coords = editor.view.coordsAtPos(clamped)
              const box = containerRef.current.getBoundingClientRect()
              const left =
                coords.left - box.left + containerRef.current.scrollLeft
              const top =
                coords.top - box.top + containerRef.current.scrollTop

              return (
                <span
                  key={id}
                  className="pointer-events-none absolute w-0.5 h-4 bg-red-500"
                  style={{ left, top }}
                />
              )
            } catch {
              return null
            }
          })}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg p-6 w-96 max-w=[90vw]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Link Text
                </label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={insertLink}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Insert Link
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        /* Editor font roles using CSS variables from globals.css */
        .tiptap {
          font-family: var(--fs-body);
        }
        .tiptap h1,
        .tiptap h2,
        .tiptap h3,
        .tiptap h4,
        .tiptap h5,
        .tiptap h6 {
          font-family: var(--fs-heading);
        }
        .tiptap code,
        .tiptap pre,
        .tiptap kbd,
        .tiptap samp {
          font-family: var(--fs-code);
        }

        /* Typography scale for headings (kept like your previous styles) */
        .tiptap h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        .tiptap h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        .tiptap h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .tiptap blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .tiptap pre {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }

        .tiptap ul,
        .tiptap ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .tiptap a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </motion.div>
  )
}
