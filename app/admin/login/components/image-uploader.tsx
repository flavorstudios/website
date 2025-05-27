"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ImageIcon, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  onImageUpload?: (webpUrl: string) => void
  className?: string
}

export function ImageUploader({ onImageUpload, className }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convertToWebP = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width
        canvas.height = img.height

        // Draw image on canvas
        ctx?.drawImage(img, 0, 0)

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpUrl = URL.createObjectURL(blob)
              resolve(webpUrl)
            } else {
              reject(new Error("Failed to convert to WebP"))
            }
          },
          "image/webp",
          0.8, // Quality setting
        )
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setUploading(true)

    try {
      // Convert to WebP
      const webpUrl = await convertToWebP(file)
      setUploadedImage(webpUrl)
      onImageUpload?.(webpUrl)
    } catch (error) {
      console.error("Failed to process image:", error)
      alert("Failed to process image. Please try again.")
    } finally {
      setUploading(false)
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
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
    }
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {uploadedImage ? (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Uploaded"
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-green-600 text-center">✅ Converted to WebP format</div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-600" />
                <p className="text-sm text-gray-600">Converting to WebP...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Drop an image here or click to upload</p>
                <p className="text-xs text-gray-500">Automatically converts to WebP format</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
