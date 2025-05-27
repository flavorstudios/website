"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onUpload?: (file: File) => Promise<string>
  label?: string
  className?: string
}

export function ImageUpload({ value, onChange, onUpload, label = "Upload Image", className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    if (!onUpload) {
      // Fallback to local URL for preview
      const url = URL.createObjectURL(file)
      onChange(url)
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const url = await onUpload(file)

      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        onChange(url)
        setUploading(false)
        setProgress(0)
      }, 500)
    } catch (error) {
      console.error("Upload failed:", error)
      setUploading(false)
      setProgress(0)
      alert("Upload failed. Please try again.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeImage = () => {
    onChange("")
  }

  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value && !uploading ? (
        <div className="relative">
          <img src={value || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          {uploading ? (
            <div className="space-y-4">
              <ImageIcon className="h-12 w-12 mx-auto text-blue-500 animate-pulse" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploading to Firebase Storage...</p>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-gray-500">{progress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Drop an image here or click to upload</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
        </div>
      )}
    </motion.div>
  )
}
