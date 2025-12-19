import { useRef } from 'react'
import Image from "next/image"
import { motion, useMotionValue, useSpring } from 'motion/react'

type WobbleProjectImageProps = {
  src: string
  alt: string
  href: string
}

export default function WobbleProjectImage({ src, alt, href }: WobbleProjectImageProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // Calculate rotation based on mouse position (max 10 degrees)
    const maxRotation = 10
    rotateX.set((-mouseY / (rect.height / 2)) * maxRotation)
    rotateY.set((mouseX / (rect.width / 2)) * maxRotation)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative block rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50 cursor-pointer overflow-hidden"
    >
      <Image
        src={src}
        alt={alt}
        width={600}
        height={400}
        className="aspect-video w-full rounded-xl object-cover"
      />
    </motion.a>
  )
}
