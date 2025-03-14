"use client"

import type React from "react"
import { useState } from "react"
import { Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import ImageEditor from "@/components/image-editor"
import { useImageProcessor } from "@/hooks/use-image-processor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { effectsList } from "@/lib/effects-list"

export default function PhotoTool() {
  const [image, setImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeEffect, setActiveEffect] = useState<string | null>(null)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const [beforeAfterPosition, setBeforeAfterPosition] = useState(50)
  const { toast } = useToast()

  const {
    brightness,
    contrast,
    saturation,
    hue,
    blur,
    rotation,
    isFlipped,
    history,
    historyIndex,
    cropMode,
    cropStart,
    cropEnd,
    cropPreview,
    setBrightness,
    setContrast,
    setSaturation,
    setHue,
    setBlur,
    setRotation,
    setIsFlipped,
    setCropMode,
    setCropStart,
    setCropEnd,
    setCropPreview,
    resetEffects,
    applyEffect,
    applyAdjustments,
    undo,
    redo,
    applyCrop,
    exitCropMode,
  } = useImageProcessor({
    image,
    setImage,
    originalImage,
    setIsProcessing,
    setActiveEffect,
    toast,
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file && file.type.match("image.*")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string)
          setOriginalImage(e.target.result as string)
          resetEffects()
          toast({ title: "Image loaded successfully" })
        }
      }
      reader.readAsDataURL(file)
    } else {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" })
    }
  }

  const downloadImage = () => {
    if (!image) return

    const link = document.createElement("a")
    link.download = "photool-edited-image.png"
    link.href = image
    link.click()

    toast({
      title: "Image downloaded",
      description: "Your edited image has been saved",
    })
  }

  const resetImage = () => {
    setImage(null)
    setOriginalImage(null)
    resetEffects()
  }

  // Quick effects for easy access
  const quickEffects = [
    { id: "black-white", name: "B&W" },
    { id: "sepia", name: "Sepia" },
    { id: "vintage", name: "Vintage" },
    { id: "pop-art", name: "Pop Art" },
    { id: "rotate", name: "Rotate" },
    { id: "crop", name: "Crop" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Photool</h1>

      {!image ? (
        <Card className="overflow-hidden mb-8">
          <CardContent className="p-6">
            <UploadArea
              isDragging={isDragging}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between mb-4">
                <Button variant="outline" onClick={resetImage} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>New Image</span>
                </Button>
                <Button onClick={downloadImage} className="flex items-center gap-2">
                  <span>Save Image</span>
                </Button>
              </div>
              <ImageEditor
                image={image}
                originalImage={originalImage}
                showBeforeAfter={showBeforeAfter}
                setShowBeforeAfter={setShowBeforeAfter}
                beforeAfterPosition={beforeAfterPosition}
                setBeforeAfterPosition={setBeforeAfterPosition}
                isProcessing={isProcessing}
                cropMode={cropMode}
                cropStart={cropStart}
                cropEnd={cropEnd}
                cropPreview={cropPreview}
                setCropStart={setCropStart}
                setCropEnd={setCropEnd}
                setCropPreview={setCropPreview}
                applyCrop={applyCrop}
                exitCropMode={exitCropMode}
                resetEffects={resetEffects}
                downloadImage={downloadImage}
                undo={undo}
                redo={redo}
                historyIndex={historyIndex}
                historyLength={history.length}
                quickEffects={quickEffects}
                applyEffect={applyEffect}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Effects</h2>
                <EffectsPanel activeEffect={activeEffect} applyEffect={applyEffect} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

interface UploadAreaProps {
  isDragging: boolean
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: () => void
  handleDrop: (e: React.DragEvent) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function UploadArea({ isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileChange }: UploadAreaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 md:p-12 transition-all",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Drag & drop your image here</h3>
      <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={handleFileChange}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outline"
          className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          Select Image
        </Button>
      </label>
    </motion.div>
  )
}

function EffectsPanel({
  activeEffect,
  applyEffect,
}: { activeEffect: string | null; applyEffect: (effectId: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(effectsList[0].id)

  // Filter effects based on search query
  const filteredCategories = searchQuery
    ? effectsList
        .map((category) => ({
          ...category,
          effects: category.effects.filter((effect) => effect.name.toLowerCase().includes(searchQuery.toLowerCase())),
        }))
        .filter((category) => category.effects.length > 0)
    : effectsList

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search effects..."
        className="w-full p-2 border rounded-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchQuery ? (
        // Show search results
        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-2">
            {filteredCategories.flatMap((category) =>
              category.effects.map((effect) => (
                <Button
                  key={effect.id}
                  variant={activeEffect === effect.id ? "default" : "outline"}
                  className="w-full text-sm"
                  onClick={() => applyEffect(effect.id)}
                >
                  {effect.name}
                </Button>
              )),
            )}
          </div>
        </div>
      ) : (
        // Show tabbed categories
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {effectsList.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="max-h-[600px] overflow-y-auto pr-2 mt-4">
            {effectsList.map((category) => (
              <TabsContent key={category.id} value={category.id} className="m-0">
                <div className="grid grid-cols-2 gap-2">
                  {category.effects.map((effect) => (
                    <Button
                      key={effect.id}
                      variant={activeEffect === effect.id ? "default" : "outline"}
                      className="w-full text-sm"
                      onClick={() => applyEffect(effect.id)}
                    >
                      {effect.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </div>
  )
}

