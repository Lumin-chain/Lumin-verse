"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

export default function SoundManager() {
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Preload audio files
    const audioFiles = [
      "/sounds/background-music.mp3",
      "/sounds/button-click.mp3",
      "/sounds/game-start.mp3",
      "/sounds/game-complete.mp3",
      "/sounds/achievement.mp3",
      "/sounds/level-up.mp3",
      "/sounds/nft-mint.mp3",
    ]

    const preloadAudio = async () => {
      try {
        await Promise.all(
          audioFiles.map((src) => {
            return new Promise((resolve, reject) => {
              const audio = new Audio(src)
              audio.addEventListener("canplaythrough", resolve)
              audio.addEventListener("error", reject)
              audio.load()
            })
          }),
        )
        setIsLoaded(true)
      } catch (error) {
        console.log("Audio preloading failed:", error)
        setIsLoaded(true) // Continue without audio
      }
    }

    preloadAudio()

    // Load mute preference
    const savedMute = localStorage.getItem("lumin-sound-muted")
    if (savedMute) {
      setIsMuted(JSON.parse(savedMute))
    }
  }, [])

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    localStorage.setItem("lumin-sound-muted", JSON.stringify(newMuted))

    // Stop all currently playing audio
    const audioElements = document.querySelectorAll("audio")
    audioElements.forEach((audio) => {
      if (newMuted) {
        audio.pause()
      }
    })
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className="bg-purple-900/50 border-purple-400/50 text-purple-100 hover:bg-purple-800/50 backdrop-blur-sm"
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
