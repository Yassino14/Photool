"use client"

import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { debounce } from "@/lib/utils"

interface AdjustmentPanelProps {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
  setBrightness: (value: number) => void
  setContrast: (value: number) => void
  setSaturation: (value: number) => void
  setHue: (value: number) => void
  setBlur: (value: number) => void
  applyAdjustments: () => void
}

export default function AdjustmentPanel({
  brightness,
  contrast,
  saturation,
  hue,
  blur,
  setBrightness,
  setContrast,
  setSaturation,
  setHue,
  setBlur,
  applyAdjustments,
}: AdjustmentPanelProps) {
  // Create a debounced version of applyAdjustments
  const debouncedApplyAdjustments = debounce(applyAdjustments, 300)

  useEffect(() => {
    return () => {
      // Clean up debounce on unmount
      debouncedApplyAdjustments.cancel()
    }
  }, [debouncedApplyAdjustments])

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="brightness">Brightness: {brightness}%</Label>
        <Slider
          id="brightness"
          min={0}
          max={200}
          step={1}
          value={[brightness]}
          onValueChange={(value) => {
            setBrightness(value[0])
            debouncedApplyAdjustments()
          }}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="contrast">Contrast: {contrast}%</Label>
        <Slider
          id="contrast"
          min={0}
          max={200}
          step={1}
          value={[contrast]}
          onValueChange={(value) => {
            setContrast(value[0])
            debouncedApplyAdjustments()
          }}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="saturation">Saturation: {saturation}%</Label>
        <Slider
          id="saturation"
          min={0}
          max={200}
          step={1}
          value={[saturation]}
          onValueChange={(value) => {
            setSaturation(value[0])
            debouncedApplyAdjustments()
          }}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="hue">Hue: {hue}°</Label>
        <Slider
          id="hue"
          min={0}
          max={360}
          step={1}
          value={[hue]}
          onValueChange={(value) => {
            setHue(value[0])
            debouncedApplyAdjustments()
          }}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="blur">Blur: {blur}px</Label>
        <Slider
          id="blur"
          min={0}
          max={20}
          step={0.5}
          value={[blur]}
          onValueChange={(value) => {
            setBlur(value[0])
            debouncedApplyAdjustments()
          }}
          className="mt-2"
        />
      </div>
    </div>
  )
}

