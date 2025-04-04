'use client'

import { useEffect, useRef } from 'react'

const StarCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Star properties
    const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[] = []
    const numStars = 150

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01
      })
    }

    // Animation
    let animationFrame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and animate stars
      stars.forEach(star => {
        // Update star opacity for twinkling effect
        star.opacity += star.twinkleSpeed
        if (star.opacity >= 1 || star.opacity <= 0) {
          star.twinkleSpeed = -star.twinkleSpeed
        }

        // Draw star with current opacity
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = gradient
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Add subtle glow effect
        ctx.beginPath()
        const glowGradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        )
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.3})`)
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
      style={{ 
        // background: 'linear-gradient(to bottom, #000000, #0A0A1B) ',
        opacity: 0.8
      }}
    />
  )
}

export default StarCanvas 