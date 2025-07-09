"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  type: "star" | "planet" | "comet"
  rotation: number
  rotationSpeed: number
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
          color:
            type === "star"
              ? ["#FFD700", "#FFF", "#87CEEB", "#DDA0DD"][Math.floor(Math.random() * 4)]
              : type === "planet"
                ? ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][Math.floor(Math.random() * 5)]
                : "#FF69B4",
          type,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        })
      }
      particlesRef.current = particles
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)

      switch (particle.type) {
        case "star":
          ctx.fillStyle = particle.color
          ctx.shadowBlur = 10
          ctx.shadowColor = particle.color
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5
            const x = Math.cos(angle) * particle.size
            const y = Math.sin(angle) * particle.size
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
          break

        case "planet":
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
          gradient.addColorStop(0, particle.color)
          gradient.addColorStop(1, "rgba(0,0,0,0.3)")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break

        case "comet":
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 2
          ctx.shadowBlur = 15
          ctx.shadowColor = particle.color
          ctx.beginPath()
          ctx.moveTo(-particle.size * 3, 0)
          ctx.lineTo(particle.size, 0)
          ctx.stroke()
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.size, 0, particle.size / 2, 0, Math.PI * 2)
          ctx.fill()
          break
      }

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed

        // Wrap around screen
        if (particle.x < -10) particle.x = canvas.width + 10
        if (particle.x > canvas.width + 10) particle.x = -10
        if (particle.y < -10) particle.y = canvas.height + 10
        if (particle.y > canvas.height + 10) particle.y = -10

        drawParticle(particle)
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

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: "transparent" }} />
  )
}
