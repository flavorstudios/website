"use client"

import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MediaUploader() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[]>([])

  const handleFiles = (fileList: FileList) => {
    const arr = Array.from(fileList)
    setFiles((f) => [...f, ...arr])
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault()
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
      }}
      className="border-2 border-dashed rounded-md p-6 text-center"
    >
      <UploadCloud className="h-8 w-8 mx-auto mb-2 text-gray-500" />
      <p className="mb-2 text-sm">Drag and drop files here</p>
      <Button size="sm" onClick={() => inputRef.current?.click()}>
        Select Files
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {files.length > 0 && (
        <ul className="mt-4 text-sm text-left list-disc list-inside">
          {files.map((f) => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
