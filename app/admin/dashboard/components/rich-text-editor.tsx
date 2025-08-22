"use client"

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
  ImageIcon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import DOMPurify from "isomorphic-dompurify"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  socket?: WebSocket | null
}

export function RichTextEditor({ value, onChange, placeholder, className, socket }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const clientId = useRef<string>(Math.random().toString(36).slice(2))
  const [remoteCursors, setRemoteCursors] = useState<Record<string, number>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)

  // TipTap Editor Instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate({ editor }) {
      const html = DOMPurify.sanitize(editor.getHTML())
      onChange(html)
    },
  })

  // Keep TipTap in sync with prop changes
  if (editor && value !== editor.getHTML()) {
    editor.commands.setContent(value, false)
  }

  // Send local selection to WebSocket
  useEffect(() => {
    if (!editor || !socket) return

    const handleSelection = ({ editor }: { editor: any }) => {
      const { from, to } = editor.state.selection
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "cursor", from, to, id: clientId.current }))
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
          setRemoteCursors(prev => ({ ...prev, [data.id]: Number(data.from) || 1 }))
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
      className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className || ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="h-8 w-8 p-0"
              title="Heading 1"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="h-8 w-8 p-0 text-sm font-bold"
              title="Heading 2"
            >
              H2
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className="h-8 w-8 p-0 text-sm font-bold"
              title="Heading 3"
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
              className="h-8 w-8 p-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="h-8 w-8 p-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="h-8 w-8 p-0"
              title="Underline"
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
              className="h-8 w-8 p-0"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="h-8 w-8 p-0"
              title="Numbered List"
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
              className="h-8 w-8 p-0"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className="h-8 w-8 p-0"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className="h-8 w-8 p-0"
              title="Align Right"
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
              className="h-8 w-8 p-0"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className="h-8 w-8 p-0"
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkDialog(true)}
              className="h-8 w-8 p-0"
              title="Insert Link"
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
          className="min-h-[400px] p-4 focus:outline-none prose prose-lg max-w-none"
          style={{
            lineHeight: "1.6",
            fontSize: "16px",
          }}
        />

        {editor && containerRef.current &&
          Object.entries(remoteCursors).map(([id, pos]) => {
            try {
              const maxPos = editor.state.doc.content.size
              const clamped = Math.max(1, Math.min(pos, maxPos))
              const coords = editor.view.coordsAtPos(clamped)
              const box = containerRef.current.getBoundingClientRect()
              const left = coords.left - box.left + containerRef.current.scrollLeft
              const top = coords.top - box.top + containerRef.current.scrollTop

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
            className="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Link Text</label>
                <Input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Enter link text" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={insertLink} className="bg-gradient-to-r from-purple-600 to-blue-600">
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
        
        .prose h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        .prose h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        .prose h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .prose pre {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
        }
        
        .prose ul, .prose ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .prose a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </motion.div>
  )
}
