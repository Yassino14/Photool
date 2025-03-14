import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Logo from "@/components/logo"
import { ThemeProvider } from "@/components/theme-provider"
import { LinkedinIcon as LinkedIn, Github, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Photool",
  description: "Advanced photo editing web application",
  generator: "v0.dev",
  icons: { icon: "/ph.png" },
  openGraph: {
    title: "Photool",
    description: "Advanced photo editing web application",
    url: "photool.yassinolouati.me",
    type: "website",
    images: [
      {
        url: "/ph.png",
        width: 800,
        height: 600,
        alt: "Photool",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <nav className="bg-background border-b">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 transition-transform transform hover:scale-105">
                <Logo className="h-6 w-6" />
                <span className="font-semibold text-lg">Photool</span>
              </a>
              <div className="flex gap-4 items-center">
                <a href="/" className="text-sm hover:text-primary transition-transform transform hover:scale-105">
                  Home
                </a>
                <a href="/about" className="text-sm hover:text-primary transition-transform transform hover:scale-105">
                  About
                </a>
                <a href="/contact" className="text-sm hover:text-primary transition-transform transform hover:scale-105">
                  Contact
                </a>
                <ThemeToggle />
              </div>
            </div>
          </nav>
          {children}
          <footer className="bg-background border-t py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Photool</p>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/yassine-louati-9629a219a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-transform transform hover:scale-105"
                >
                  <LinkedIn size={20} />
                </a>
                <a
                  href="https://github.com/Yassino14"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-transform transform hover:scale-105"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://www.yassinolouati.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-transform transform hover:scale-105"
                >
                  <Globe size={20} />
                </a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}