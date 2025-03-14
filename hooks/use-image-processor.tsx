"use client"

import { useState, useRef, useCallback } from "react"

interface UseImageProcessorProps {
  image: string | null
  setImage: (image: string | null) => void
  originalImage: string | null
  setIsProcessing: (isProcessing: boolean) => void
  setActiveEffect: (effectId: string | null) => void
  toast: any
}

export function useImageProcessor({
  image,
  setImage,
  originalImage,
  setIsProcessing,
  setActiveEffect,
  toast,
}: UseImageProcessorProps) {
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [hue, setHue] = useState(0)
  const [blur, setBlur] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [cropMode, setCropMode] = useState(false)
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null)
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null)
  const [cropPreview, setCropPreview] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Create canvas element if it doesn't exist
  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas")
    }
    return canvasRef.current
  }, [])

  const addToHistory = useCallback(
    (newImage: string) => {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newImage])
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex],
  )

  const exitCropMode = useCallback(() => {
    setCropMode(false)
    setCropStart(null)
    setCropEnd(null)
    setCropPreview(null)
  }, [])

  const resetEffects = useCallback(() => {
    if (originalImage) {
      setImage(originalImage)
      setHistory([originalImage])
      setHistoryIndex(0)
    }
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setHue(0)
    setBlur(0)
    setActiveEffect(null)
    setRotation(0)
    setIsFlipped(false)
    exitCropMode()
  }, [originalImage, setImage, setActiveEffect, exitCropMode])

  const rotateImage = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360)

    // Apply the rotation to the current image
    const img = new Image()
    img.src = image || ""
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = getCanvas()
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      const newRotation = (rotation + 90) % 360

      // Set canvas size based on rotation
      if (newRotation === 90 || newRotation === 270) {
        canvas.width = img.height
        canvas.height = img.width
      } else {
        canvas.width = img.width
        canvas.height = img.height
      }

      // Apply rotation
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((newRotation * Math.PI) / 180)
      ctx.scale(isFlipped ? -1 : 1, 1)
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height)
      ctx.restore()

      // Update the image
      const newImage = canvas.toDataURL()
      setImage(newImage)
      addToHistory(newImage)
    }

    toast({
      title: "Image rotated",
      description: "Your image has been rotated 90 degrees",
    })
  }, [image, rotation, isFlipped, getCanvas, setImage, addToHistory, toast])

  const flipImage = useCallback(() => {
    setIsFlipped((prev) => !prev)

    // Apply the flip to the current image
    const img = new Image()
    img.src = image || ""
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = getCanvas()
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height

      // Apply flip
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(isFlipped ? 1 : -1, 1) // Toggle the flip
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height)
      ctx.restore()

      // Update the image
      const newImage = canvas.toDataURL()
      setImage(newImage)
      addToHistory(newImage)
    }

    toast({
      title: "Image flipped",
      description: "Your image has been flipped horizontally",
    })
  }, [image, rotation, isFlipped, getCanvas, setImage, addToHistory, toast])

  const enterCropMode = useCallback(() => {
    setCropMode(true)
    setCropStart(null)
    setCropEnd(null)
    setCropPreview(null)

    toast({
      title: "Crop mode activated",
      description: "Drag to select the area you want to keep",
    })
  }, [toast])

  const applyCrop = useCallback(() => {
    if (!cropPreview || !image) return

    const img = new Image()
    img.src = image
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = getCanvas()
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      const cropX = cropPreview.x * img.width
      const cropY = cropPreview.y * img.height
      const cropWidth = cropPreview.width * img.width
      const cropHeight = cropPreview.height * img.height

      // Set canvas to crop size
      canvas.width = cropWidth
      canvas.height = cropHeight

      // Draw only the cropped portion
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

      // Update the image and exit crop mode
      const newImage = canvas.toDataURL()
      setImage(newImage)
      addToHistory(newImage)
      exitCropMode()

      toast({
        title: "Image cropped",
        description: "Your image has been cropped successfully",
      })
    }
  }, [cropPreview, image, getCanvas, setImage, addToHistory, exitCropMode, toast])

  // Basic effect functions
  const applyGrayscale = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = data[i + 1] = data[i + 2] = avg
    }
    ctx.putImageData(imageData, 0, 0)
  }

  const applySepia = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
    }
    ctx.putImageData(imageData, 0, 0)
  }

  const applyVintage = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // First apply sepia
    applySepia(ctx, canvas)

    // Then add a slight vignette
    applyVignette(ctx, canvas, 0.3)

    // Add noise
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 20 - 10
      data[i] = Math.max(0, Math.min(255, data[i] + noise))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyBrightnessAdjustment = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, value: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const factor = value / 100

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor)
      data[i + 1] = Math.min(255, data[i + 1] * factor)
      data[i + 2] = Math.min(255, data[i + 2] * factor)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyContrastEnhancement = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, value: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const factor = (value / 100) * 2

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, 128 + (data[i] - 128) * factor)
      data[i + 1] = Math.min(255, 128 + (data[i + 1] - 128) * factor)
      data[i + 2] = Math.min(255, 128 + (data[i + 2] - 128) * factor)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applySaturationBoost = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, value: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const factor = value / 100

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const gray = 0.2989 * r + 0.587 * g + 0.114 * b

      data[i] = Math.min(255, gray + factor * (r - gray))
      data[i + 1] = Math.min(255, gray + factor * (g - gray))
      data[i + 2] = Math.min(255, gray + factor * (b - gray))
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyHueShift = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, degrees: number) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Convert RGB to HSL
      const [h, s, l] = rgbToHsl(r, g, b)

      // Shift hue
      const newHue = (h * 360 + degrees) % 360

      // Convert back to RGB
      const [newR, newG, newB] = hslToRgb(newHue / 360, s, l)

      data[i] = newR
      data[i + 1] = newG
      data[i + 2] = newB
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyHDR = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Apply a simulated HDR effect
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // First increase contrast
    applyContrastEnhancement(ctx, canvas, 130)

    // Then boost saturation
    applySaturationBoost(ctx, canvas, 120)

    // Add a slight vignette
    applyVignette(ctx, canvas, 0.2)
  }

  const applyCrossProcess = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      // Boost blues in shadows
      if (data[i] < 120 && data[i + 1] < 120) {
        data[i + 2] = Math.min(255, data[i + 2] * 1.2)
      }

      // Boost greens in midtones
      if (data[i] > 80 && data[i] < 180) {
        data[i + 1] = Math.min(255, data[i + 1] * 1.2)
      }

      // Add yellow to highlights
      if (data[i] > 150 && data[i + 1] > 150) {
        data[i] = Math.min(255, data[i] * 1.1)
        data[i + 1] = Math.min(255, data[i + 1] * 1.1)
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applySharpen = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Sharpen using a convolution filter
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCtx.putImageData(imageData, 0, 0)

    // Apply unsharp masking
    ctx.filter = "contrast(1.5) brightness(1.1)"
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.filter = "none"
  }

  const applyNoiseReduction = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Simple blur for noise reduction
    ctx.filter = "blur(0.5px)"
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCtx.drawImage(canvas, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.filter = "none"
  }

  const applyClarity = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clarity is like a subtle local contrast enhancement
    applySharpen(ctx, canvas)
    applyContrastEnhancement(ctx, canvas, 110)
  }

  const applySoftFocus = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Create a blurred version
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCtx.filter = "blur(5px)"
    tempCtx.drawImage(canvas, 0, 0)

    // Blend the original with the blurred version
    ctx.globalAlpha = 0.7
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.globalAlpha = 1.0
  }

  const applyVignette = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity = 0.5) => {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)),
    )

    gradient.addColorStop(0, "rgba(0,0,0,0)")
    gradient.addColorStop(0.5, "rgba(0,0,0,0)")
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`)

    ctx.fillStyle = gradient
    ctx.globalCompositeOperation = "multiply"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = "source-over"
  }

  const simulateEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, effectId: string) => {
    // For effects that would require ML models or complex processing,
    // we'll simulate the effect with a simple visual change

    // First apply a basic effect to show something changed
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Generate a random color shift based on the effect name
    const hash = effectId.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0)
    const hue = hash % 360

    // Apply a color shift
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Convert RGB to HSL, shift hue, convert back to RGB
      const [h, s, l] = rgbToHsl(r, g, b)
      const newHue = (h * 360 + hue) % 360
      const [newR, newG, newB] = hslToRgb(newHue / 360, s, l)

      data[i] = newR
      data[i + 1] = newG
      data[i + 2] = newB
    }

    ctx.putImageData(imageData, 0, 0)

    // Add text overlay to indicate this is a simulation
    ctx.font = "20px Arial"
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillRect(10, 10, 200, 30)
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillText(`${effectId} (simulated)`, 15, 30)
  }

  // Helper function to convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }

      h /= 6
    }

    return [h, s, l]
  }

  // Helper function to convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  const applyEffect = useCallback(
    (effectId: string) => {
      if (!image) return

      setIsProcessing(true)
      setActiveEffect(effectId)

      // Simulate effect processing
      setTimeout(() => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          setIsProcessing(false)
          return
        }

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // Find the effect in the effects list to get its name for the toast
          let effectName = effectId.replace(/-/g, " ")
          // Assuming effectsList is defined elsewhere and accessible in this scope
          const effectsList = [
            {
              category: "Basic",
              effects: [
                { id: "black-white", name: "Black and White" },
                { id: "grayscale", name: "Grayscale" },
                { id: "sepia", name: "Sepia" },
                { id: "vintage", name: "Vintage" },
                { id: "vintage-film", name: "Vintage Film" },
                { id: "hdr", name: "HDR" },
                { id: "cross-process", name: "Cross Process" },
                { id: "brightness", name: "Brightness" },
                { id: "contrast", name: "Contrast" },
                { id: "saturation-boost", name: "Saturation Boost" },
                { id: "color-boost", name: "Color Boost" },
                { id: "desaturation", name: "Desaturation" },
                { id: "hue-shift", name: "Hue Shift" },
              ],
            },
            {
              category: "Enhance",
              effects: [
                { id: "sharpen", name: "Sharpen" },
                { id: "noise-reduction", name: "Noise Reduction" },
                { id: "clarity", name: "Clarity" },
                { id: "vignette", name: "Vignette" },
                { id: "soft-focus", name: "Soft Focus" },
              ],
            },
            {
              category: "Transform",
              effects: [
                { id: "rotate", name: "Rotate" },
                { id: "flip", name: "Flip" },
                { id: "crop", name: "Crop" },
              ],
            },
          ]
          for (const category of effectsList) {
            const effect = category.effects.find((e) => e.id === effectId)
            if (effect) {
              effectName = effect.name
              break
            }
          }

          // Apply the selected effect
          switch (effectId) {
            // Basic effects
            case "black-white":
            case "grayscale":
              applyGrayscale(ctx, canvas)
              break
            case "sepia":
              applySepia(ctx, canvas)
              break
            case "vintage":
            case "vintage-film":
              applyVintage(ctx, canvas)
              break
            case "hdr":
              applyHDR(ctx, canvas)
              break
            case "cross-process":
              applyCrossProcess(ctx, canvas)
              break
            case "brightness":
              applyBrightnessAdjustment(ctx, canvas, 120)
              break
            case "contrast":
              applyContrastEnhancement(ctx, canvas, 120)
              break
            case "saturation-boost":
            case "color-boost":
              applySaturationBoost(ctx, canvas, 150)
              break
            case "desaturation":
              applySaturationBoost(ctx, canvas, 50)
              break
            case "hue-shift":
              applyHueShift(ctx, canvas, 180)
              break

            // Enhance effects
            case "sharpen":
              applySharpen(ctx, canvas)
              break
            case "noise-reduction":
              applyNoiseReduction(ctx, canvas)
              break
            case "clarity":
              applyClarity(ctx, canvas)
              break
            case "vignette":
              applyVignette(ctx, canvas, 0.5)
              break
            case "soft-focus":
              applySoftFocus(ctx, canvas)
              break

            // Transform effects
            case "rotate":
              rotateImage()
              return // rotateImage handles its own image update
            case "flip":
              flipImage()
              return // flipImage handles its own image update
            case "crop":
              enterCropMode()
              setIsProcessing(false)
              setActiveEffect(null)
              return

            // For all other effects, apply a simulated effect
            default:
              simulateEffect(ctx, canvas, effectId)
          }

          const newImage = canvas.toDataURL()
          setImage(newImage)
          addToHistory(newImage)
          setIsProcessing(false)
          setActiveEffect(null)
          toast({ title: `${effectName} effect applied` })
        }
        img.src = image
      }, 500) // Simulate processing time
    },
    [image, setImage, setIsProcessing, setActiveEffect, toast, addToHistory, rotateImage, flipImage, enterCropMode],
  )

  const applyAdjustments = useCallback(() => {
    if (!image) return

    const img = new Image()
    img.src = image
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = getCanvas()
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      setIsProcessing(true)

      applyBrightnessAdjustment(ctx, canvas, brightness)
      applyContrastEnhancement(ctx, canvas, contrast)
      applySaturationBoost(ctx, canvas, saturation)
      applyHueShift(ctx, canvas, hue)

      const newImage = canvas.toDataURL()
      setImage(newImage)
      addToHistory(newImage)
      setIsProcessing(false)

      toast({
        title: "Adjustments applied",
        description: "The image adjustments have been applied",
      })
    }
  }, [image, brightness, contrast, saturation, hue, getCanvas, setImage, setIsProcessing, addToHistory, toast])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      setImage(history[historyIndex - 1])
    } else {
      toast({
        title: "Cannot undo",
        description: "No more undo's available",
      })
    }
  }, [history, historyIndex, setImage, toast])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      setImage(history[historyIndex + 1])
    } else {
      toast({
        title: "Cannot redo",
        description: "No more redo's available",
      })
    }
  }, [history, historyIndex, setImage, toast])

  return {
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
  }
}

