"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type: "star" | "planet" | "comet"
  color: string
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 10000))

      for (let i = 0; i < particleCount; i++) {
        const type = Math.random() < 0.7 ? "star" : Math.random() < 0.9 ? "planet" : "comet"
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size:
            type === "star" ? Math.random() * 2 + 1 : type === "planet" ? Math.random() * 4 + 2 : Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          type,
          color: type === "star" ? "#FFD700" : type === "planet" ? "#4A90E2" : "#FF6B6B",
        })
      }
      particlesRef.current = particles
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color

        if (particle.type === "star") {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (particle.type === "planet") {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 1
          ctx.stroke()
        } else {
          // Comet with tail
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particle.x - particle.vx * 10, particle.y - particle.vy * 10)
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 2
          ctx.stroke()
        }
        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createParticles()
    animate()

    window.addEventListener("resize", () => {
      resizeCanvas()
      createParticles()
    })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
}
