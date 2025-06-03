"use client"

import { useEffect, useRef } from "react"

interface VoiceAnimationProps {
  isActive: boolean
  size?: number
}

export function VoiceAnimation({ isActive, size = 40 }: VoiceAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 4

    const circles = Array.from({ length: 3 }, (_, i) => ({
      radius: maxRadius * (0.5 + i * 0.15),
      opacity: 0.7 - i * 0.2,
      phase: Math.random() * Math.PI * 2,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (isActive) {
        circles.forEach((circle, i) => {
          const time = Date.now() / 1000
          const amplitude = isActive ? 0.15 : 0
          const frequency = 2 + i

          // Calculate pulsing radius
          const radiusOffset = Math.sin(time * frequency + circle.phase) * amplitude
          const radius = circle.radius * (1 + radiusOffset)

          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(25, 165, 162, ${circle.opacity})`
          ctx.fill()
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  return <canvas ref={canvasRef} width={size} height={size} className="absolute inset-0 z-10 pointer-events-none" />
}

