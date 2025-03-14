"use client"

import type React from "react"
import { motion } from "framer-motion"
import { CameraIcon } from "lucide-react"

interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ rotate: -5 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary rounded-md blur-sm opacity-40" />
        <div className="relative bg-gradient-to-br from-primary to-purple-600 rounded-md p-1.5 flex items-center justify-center">
          <CameraIcon className="h-full w-full text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export default Logo

