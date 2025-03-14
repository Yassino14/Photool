"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface Effect {
  id: string
  name: string
  premium?: boolean
}

interface EffectCategory {
  id: string
  name: string
  effects: Effect[]
}

interface EffectsPanelProps {
  filteredEffects: EffectCategory[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeEffect: string | null
  applyEffect: (effectId: string) => void
  isMobile?: boolean
}

export default function EffectsPanel({
  filteredEffects,
  searchQuery,
  setSearchQuery,
  activeEffect,
  applyEffect,
  isMobile = false,
}: EffectsPanelProps) {
  // Reset search when component unmounts (for mobile view)
  useEffect(() => {
    return () => {
      if (isMobile) {
        setSearchQuery("")
      }
    }
  }, [isMobile, setSearchQuery])

  if (filteredEffects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No effects found matching "{searchQuery}"</p>
        <Button variant="link" onClick={() => setSearchQuery("")}>
          Clear search
        </Button>
      </div>
    )
  }

  return (
    <Tabs defaultValue={filteredEffects[0]?.id}>
      <TabsList className="w-full mb-4 flex flex-wrap h-auto">
        {filteredEffects.map((category) => (
          <TabsTrigger key={category.id} value={category.id} className="flex-1">
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {filteredEffects.map((category) => (
        <TabsContent key={category.id} value={category.id} className="m-0">
          <ScrollArea className={isMobile ? "h-[60vh]" : "h-[400px]"}>
            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
              {category.effects.map((effect) => (
                <motion.div key={effect.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={activeEffect === effect.id ? "default" : "outline"}
                    className="h-auto py-3 justify-start relative w-full"
                    onClick={() => applyEffect(effect.id)}
                  >
                    {effect.name}
                    {effect.premium && (
                      <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] px-1">
                        PRO
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  )
}

