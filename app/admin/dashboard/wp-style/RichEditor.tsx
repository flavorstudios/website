"use client"

import { Bold, Italic, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"
import TiptapEditor from "../components/tiptap-editor"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import UnderlineExtension from "@tiptap/extension-underline"

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, UnderlineExtension],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const toggle = (command: () => void) => {
    command()
  }

  return (
    <div>
      <div className="flex gap-1 mb-2">
        <Button variant="ghost" size="sm" onClick={() => toggle(() => editor.chain().focus().toggleBold().run())}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toggle(() => editor.chain().focus().toggleItalic().run())}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toggle(() => editor.chain().focus().toggleUnderline().run())}>
          <Underline className="h-4 w-4" />
        </Button>
      </div>
      <TiptapEditor value={value} onChange={onChange} />
    </div>
  )
}
