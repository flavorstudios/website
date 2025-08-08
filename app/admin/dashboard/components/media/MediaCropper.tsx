"use client";

import { useCallback, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { X, RotateCw, FlipHorizontal, FlipVertical, Save } from "lucide-react";

interface Props {
  /** Optional when you only want the editor UI; required to persist edits via /api/media/edit */
  id?: string;
  url: string;
  onClose: () => void;
}

export default function MediaCropper({ id, url, onClose }: Props) {
  const [mode, setMode] = useState<"crop" | "focal">("crop");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false); // horizontal
  const [flipY, setFlipY] = useState(false); // vertical
  const [saving, setSaving] = useState(false);
  const [area, setArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [focal, setFocal] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setArea({ x: pixels.x, y: pixels.y, width: pixels.width, height: pixels.height });
  }, []);

  const mediaStyle = useMemo(
    () => ({
      transform: `${flipX ? "scaleX(-1)" : ""} ${flipY ? "scaleY(-1)" : ""}`,
    }),
    [flipX, flipY]
  );

  const handleFocalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "focal") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setFocal({ x, y });
  };

  const canSave = Boolean(id);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: any = {
        id,
        options: {
          rotate: rotation,
          flip: flipY,
          flop: flipX,
          scale: zoom === 1 ? undefined : Number(zoom.toFixed(3)),
          focalPoint: focal,
        },
      };
      if (mode === "crop" && area) payload.options.crop = area;

      await fetch("/api/media/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="p-0 sm:p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm font-medium">Edit media</div>
          <Button variant="ghost" size="icon" aria-label="Close editor" onClick={onClose}>
            <X />
          </Button>
        </div>

        {/* Body */}
        <div className="p-3 space-y-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="crop" aria-controls="crop-tab">
                Crop
              </TabsTrigger>
              <TabsTrigger value="focal" aria-controls="focal-tab">
                Focal point
              </TabsTrigger>
            </TabsList>

            {/* Canvas */}
            <div
              className="relative w-full h-72 bg-black rounded-md overflow-hidden"
              onClick={handleFocalClick}
              aria-label={mode === "focal" ? "Click to set focal point" : "Crop area"}
            >
              <Cropper
                image={url}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                style={{ containerStyle: { width: "100%", height: "100%" }, mediaStyle }}
                disabled={mode === "focal"}
              />
              {mode === "focal" && (
                <div
                  className="absolute w-3 h-3 rounded-full bg-white ring-2 ring-blue-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
                  aria-label="Focal point marker"
                />
              )}
            </div>

            {/* Crop controls */}
            <TabsContent value="crop" className="space-y-3 pt-3" id="crop-tab">
              <div>
                <label className="text-xs font-medium">Zoom</label>
                <Slider
                  value={[zoom]}
                  min={0.5}
                  max={2}
                  step={0.05}
                  onValueChange={([v]) => setZoom(v)}
                  aria-label="Zoom"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Rotation</label>
                <Slider
                  value={[rotation]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={([v]) => setRotation(v)}
                  aria-label="Rotation"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setFlipX((x) => !x)} aria-pressed={flipX}>
                  <FlipHorizontal className="mr-1" />
                  Flip X
                </Button>
                <Button type="button" variant="outline" onClick={() => setFlipY((y) => !y)} aria-pressed={flipY}>
                  <FlipVertical className="mr-1" />
                  Flip Y
                </Button>
                <Button type="button" variant="outline" onClick={() => setRotation(0)}>
                  <RotateCw className="mr-1" />
                  Reset
                </Button>
              </div>
            </TabsContent>

            {/* Focal help */}
            <TabsContent value="focal" className="text-xs pt-3" id="focal-tab">
              Tap or click on the image to set the focal point used for smart crops and responsive variants.
            </TabsContent>
          </Tabs>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-1">
            {!canSave && (
              <p className="text-xs text-muted-foreground">
                Note: Provide an <code>id</code> prop to enable saving edits.
              </p>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!canSave || saving}>
                <Save className="mr-1" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
