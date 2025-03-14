import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

const images = [
  { src: "/placeholder.svg?height=200&width=300", alt: "Sample 1" },
  { src: "/placeholder.svg?height=200&width=300", alt: "Sample 2" },
  { src: "/placeholder.svg?height=200&width=300", alt: "Sample 3" },
]

export function ImageGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      {images.map((img, index) => (
        <Card key={index}>
          <CardContent className="p-2">
            <Image src={img.src || "/placeholder.svg"} alt={img.alt} width={300} height={200} className="rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

