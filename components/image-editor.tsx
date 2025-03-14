"use client"

import { useRef } from "react"
import type React from "react"
import { Undo, Redo, Zap, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"


interface ImageEditorProps {
  image: string | null
  originalImage: string | null
  showBeforeAfter: boolean
  setShowBeforeAfter: (value: boolean) => void
  beforeAfterPosition: number
  setBeforeAfterPosition: (value: number) => void
  isProcessing: boolean
  cropMode: boolean
  cropStart: { x: number; y: number } | null
  cropEnd: { x: number; y: number } | null
  cropPreview: { x: number; y: number; width: number; height: number } | null
  setCropStart: (value: { x: number; y: number } | null) => void
  setCropEnd: (value: { x: number; y: number } | null) => void
  setCropPreview: (value: { x: number; y: number; width: number; height: number } | null) => void
  applyCrop: () => void
  exitCropMode: () => void
  resetEffects: () => void
  downloadImage: () => void
  undo: () => void
  redo: () => void
  historyIndex: number
  historyLength: number
  quickEffects: { id: string; name: string }[]
  applyEffect: (effectId: string) => void
}

export default function ImageEditor({
  image,
  originalImage,
  showBeforeAfter,
  setShowBeforeAfter,
  beforeAfterPosition,
  setBeforeAfterPosition,
  isProcessing,
  cropMode,
  cropStart,
  cropEnd,
  cropPreview,
  setCropStart,
  setCropEnd,
  setCropPreview,
  applyCrop,
  exitCropMode,
  resetEffects,
  downloadImage,
  undo,
  redo,
  historyIndex,
  historyLength,
  quickEffects,
  applyEffect,
}: ImageEditorProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const beforeAfterRef = useRef<HTMLDivElement>(null)
  const cropperRef = useRef<HTMLDivElement>(null)
  

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropMode || !cropperRef.current) return

    const rect = cropperRef.current.getBoundingClientRect()
    setCropStart({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
    setCropEnd(null)
    setCropPreview(null)
  }

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropMode || !cropStart || !cropperRef.current) return

    const rect = cropperRef.current.getBoundingClientRect()
    const currentEnd = {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    }

    setCropEnd(currentEnd)

    // Calculate crop preview
    const startX = Math.min(cropStart.x, currentEnd.x)
    const startY = Math.min(cropStart.y, currentEnd.y)
    const width = Math.abs(cropStart.x - currentEnd.x)
    const height = Math.abs(cropStart.y - currentEnd.y)

    setCropPreview({ x: startX, y: startY, width, height })
  }

  const handleCropMouseUp = () => {
    if (!cropMode || !cropPreview || !image) return
  }

  const handleBeforeAfterMove = (e: React.MouseEvent) => {
    if (!beforeAfterRef.current) return

    const rect = beforeAfterRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    // Calculate position as percentage
    const position = Math.max(0, Math.min(100, (x / width) * 100))
    setBeforeAfterPosition(position)
  }

  // For mobile, provide touch support for before/after slider
  const handleBeforeAfterTouch = (e: React.TouchEvent) => {
    if (!beforeAfterRef.current || e.touches.length === 0) return

    const rect = beforeAfterRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const width = rect.width

    // Calculate position as percentage
    const position = Math.max(0, Math.min(100, (x / width) * 100))
    setBeforeAfterPosition(position)
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-auto max-h-[70vh] overflow-hidden rounded-lg border">
        {cropMode ? (
          <div
            className="relative w-full h-full"
            ref={cropperRef}
            onMouseDown={handleCropMouseDown}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          >
            <img src={image || "/placeholder.svg"} alt="Crop Preview" className="max-w-full h-auto object-contain" />
            {cropPreview && (
              <div
                className="absolute border-2 border-primary bg-primary/10"
                style={{
                  left: `${cropPreview.x * 100}%`,
                  top: `${cropPreview.y * 100}%`,
                  width: `${cropPreview.width * 100}%`,
                  height: `${cropPreview.height * 100}%`,
                }}
              />
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="destructive" size="sm" onClick={exitCropMode}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={applyCrop} disabled={!cropPreview}>
                Apply Crop
              </Button>
            </div>
          </div>
        ) : showBeforeAfter ? (
          <div
            className="relative w-full h-full cursor-col-resize"
            ref={beforeAfterRef}
            onMouseMove={handleBeforeAfterMove}
            onTouchMove={handleBeforeAfterTouch}
          >
            <div className="absolute inset-0 z-10">
              <img
                src={originalImage || "/placeholder.svg"}
                alt="Original"
                className="max-w-full h-auto object-contain"
                ref={imageRef}
              />
            </div>
            <div className="absolute inset-0 overflow-hidden z-20" style={{ width: `${beforeAfterPosition}%` }}>
              <img
                src={image || "/placeholder.svg"}
                alt="Edited"
                className="max-w-full h-auto object-contain"
                style={{
                  width: imageRef.current?.width || "100%",
                  height: imageRef.current?.height || "auto",
                }}
              />
            </div>
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-white z-30 cursor-col-resize"
              style={{ left: `${beforeAfterPosition}%` }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
            />
          </div>
        ) : (
          <img
            src={image || "/placeholder.svg"}
            alt="Edited"
            className="max-w-full h-auto object-contain mx-auto"
            ref={imageRef}
          />
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white dark:bg-slate-800 p-4 rounded-lg flex items-center gap-3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Zap className="h-5 w-5 text-primary animate-pulse" />
              <span>Processing effect...</span>
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-md">
          <Label htmlFor="before-after" className="text-xs">
            Before/After
          </Label>
          <Switch
            id="before-after"
            checked={showBeforeAfter}
            onCheckedChange={setShowBeforeAfter}
            disabled={cropMode}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={historyIndex <= 0 || cropMode} onClick={undo}>
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm" disabled={historyIndex >= historyLength - 1 || cropMode} onClick={redo}>
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Button variant="outline" size="sm" onClick={resetEffects} disabled={cropMode}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickEffects.map((effect) => (
          <Button
            key={effect.id}
            variant="secondary"
            size="sm"
            onClick={() => applyEffect(effect.id)}
            className="h-8 px-3"
          >
            {effect.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

