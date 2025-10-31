"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { avatarFileSchema } from "@/lib/schemas/settings"
import { initialsFromName, hashAvatar } from "@/lib/settings/client"

interface AvatarUploaderProps {
  value?: string | null
  displayName: string
  disabled?: boolean
  onAvatarUploaded: (payload: { url: string; storagePath?: string }) => void
  onUploadFile: (file: Blob, filename: string) => Promise<{ url: string; storagePath?: string }>
}

type DragState = { x: number; y: number }

const MASK_SIZE = 224
const CANVAS_SIZE = 512

export function AvatarUploader({
  value,
  displayName,
  disabled,
  onAvatarUploaded,
  onUploadFile,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(value ? value : null)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState<DragState>({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const dataUrlRef = useRef<string | null>(null)
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  })

  useEffect(() => {
    setPreview(value ? value : null)
  }, [value])

  const handleFile = useCallback(async (file: File) => {
    try {
      avatarFileSchema.parse({ name: file.name, size: file.size, type: file.type })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsupported file")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== "string") return
      const img = new window.Image()
      img.src = result
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height })
        setZoom(1)
        setOffset({ x: 0, y: 0 })
        dataUrlRef.current = result
        setPreview(result)
        setError(null)
      }
    }
    reader.onerror = () => {
      setError("Failed to read image")
    }
    reader.readAsDataURL(file)
  }, [])

  const onFileChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const file = event.target.files?.[0]
      if (file) void handleFile(file)
    },
    [handleFile],
  )

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (disabled) return
    const file = event.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }, [disabled, handleFile])

  const startDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!preview || !imageSize) return
    dragRef.current = { active: true, lastX: event.clientX, lastY: event.clientY }
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }, [preview, imageSize])

  const onDragMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !imageSize) return
    const deltaX = event.clientX - dragRef.current.lastX
    const deltaY = event.clientY - dragRef.current.lastY
    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY
    setOffset((prev) => clampOffset({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }, imageSize, zoom))
  }, [imageSize, zoom])

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    dragRef.current = { active: false, lastX: 0, lastY: 0 }
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
  }, [])

  const handleZoom = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = Number(event.target.value)
    setZoom(nextZoom)
    if (imageSize) {
      setOffset((current) => clampOffset(current, imageSize, nextZoom))
    }
  }, [imageSize])

  const handleClear = useCallback(() => {
    setPreview(null)
    setOffset({ x: 0, y: 0 })
    setZoom(1)
    dataUrlRef.current = null
    onAvatarUploaded({ url: "", storagePath: undefined })
  }, [onAvatarUploaded])

  const handleUpload = useCallback(async () => {
    if (!dataUrlRef.current) return
    if (!imageSize) return
    setIsUploading(true)
    const canvas = document.createElement("canvas")
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unsupported")
    const img = new window.Image()
    img.src = dataUrlRef.current
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(null)
      img.onerror = () => reject(new Error("Failed to load image"))
    })
    const scaledWidth = img.width * zoom
    const scaledHeight = img.height * zoom
    const maxOffsetX = Math.max(0, (scaledWidth - MASK_SIZE) / 2)
    const maxOffsetY = Math.max(0, (scaledHeight - MASK_SIZE) / 2)
    const clampedX = clamp(offset.x, -maxOffsetX, maxOffsetX)
    const clampedY = clamp(offset.y, -maxOffsetY, maxOffsetY)
    const drawX = (scaledWidth - MASK_SIZE) / 2 - clampedX
    const drawY = (scaledHeight - MASK_SIZE) / 2 - clampedY
    const scaleFactor = CANVAS_SIZE / MASK_SIZE
    ctx.fillStyle = "transparent"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.drawImage(
      img,
      -drawX * scaleFactor,
      -drawY * scaleFactor,
      scaledWidth * scaleFactor,
      scaledHeight * scaleFactor,
    )
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to export avatar"))), "image/webp", 0.9)
    })
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const filename = `users/avatar-${await hashAvatar(arrayBuffer)}.webp`
      const uploadResult = await onUploadFile(blob, filename)
      setPreview(uploadResult.url)
      await Promise.resolve(onAvatarUploaded(uploadResult))
      dataUrlRef.current = null
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar")
    } finally {
      setIsUploading(false)
    }
  }, [imageSize, offset.x, offset.y, onAvatarUploaded, onUploadFile, zoom])

  const dragStyle = useMemo(() => {
    const transform = `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`
    return { transform }
  }, [offset.x, offset.y, zoom])

  const initials = useMemo(() => initialsFromName(displayName), [displayName])

  return (
    <div className="space-y-3">
      <Label htmlFor="avatar">Avatar</Label>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full border bg-muted text-muted-foreground",
          disabled && "opacity-60",
        )}
        style={{ width: MASK_SIZE, height: MASK_SIZE }}
      >
        {preview ? (
          <div
            role="presentation"
            className="relative h-full w-full cursor-move"
            onPointerDown={startDrag}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            <Image
              src={preview}
              alt="Avatar preview"
              fill
              unoptimized
              sizes={`${MASK_SIZE}px`}
              className="pointer-events-none select-none object-cover"
              style={dragStyle}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl font-semibold">{initials}</span>
            <p className="text-xs text-muted-foreground text-center px-4">
              Drag & drop an image or click upload
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="avatar"
          name="avatar"
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={onFileChange}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          Upload
        </Button>
        {preview ? (
          <Button type="button" variant="ghost" onClick={handleClear} disabled={disabled}>
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Remove
          </Button>
        ) : null}
        <div className="flex-1" />
        {preview && (
          <>
            <Label htmlFor="avatar-zoom" className="text-xs uppercase tracking-wide text-muted-foreground">
              Zoom
            </Label>
            <Input
              id="avatar-zoom"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={handleZoom}
              className="w-40"
            />
            <Button type="button" onClick={handleUpload} disabled={disabled || isUploading}>
              Save avatar
            </Button>
          </>
        )}
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function clampOffset(offset: DragState, size: { width: number; height: number }, zoom: number): DragState {
  const previewSize = MASK_SIZE
  const scaledWidth = size.width * zoom
  const scaledHeight = size.height * zoom
  const maxX = Math.max(0, (scaledWidth - previewSize) / 2)
  const maxY = Math.max(0, (scaledHeight - previewSize) / 2)
  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  }
}