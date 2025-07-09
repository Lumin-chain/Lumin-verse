"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SoundManager() {
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Preload sounds
    const sounds = {
      backgroundMusic: "/sounds/space-ambient.mp3",
      gameStart: "/sounds/game-start.mp3",
      gameComplete: "/sounds/game-complete.mp3",
      buttonClick: "/sounds/button-click.mp3",
      achievement: "/sounds/achievement.mp3",
      notification: "/sounds/notification.mp3",
    }

    // Create audio elements
    Object.entries(sounds).forEach(([key, src]) => {
      const audio = new Audio(src)
      audio.preload = "auto"
      audio.volume = key === "backgroundMusic" ? 0.3 : 0.5
      if (key === "backgroundMusic") {
        audio.loop = true
      }
      // Store in global object for access
      ;(window as any).sounds = (window as any).sounds || {}
      ;(window as any).sounds[key] = audio
    })

    setIsLoaded(true)

    // Start background music
    if (!isMuted) {
      setTimeout(() => {
        const bgMusic = (window as any).sounds?.backgroundMusic
        if (bgMusic) {
          bgMusic.play().catch(() => {
            // Auto-play blocked, will need user interaction
          })
        }
      }, 1000)
    }
  }, [])

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)

    if ((window as any).sounds) {
      Object.values((window as any).sounds).forEach((audio: any) => {
        audio.muted = newMuted
      })
    }
  }

  if (!isLoaded) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className="bg-purple-900/50 border-purple-400/50 text-purple-100 hover:bg-purple-800/50 backdrop-blur-sm"
      >
        {isMuted ? "🔇" : "🔊"}
      </Button>
    </div>
  )
}
