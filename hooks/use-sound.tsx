"use client"

import { useCallback } from "react"

export function useSound() {
  const playSound = useCallback((soundType: string) => {
    // Check if sound is muted
    const isMuted = localStorage.getItem("lumin-sound-muted")
    if (isMuted === "true") return

    let audioSrc = ""

    switch (soundType) {
      case "buttonClick":
        audioSrc = "/sounds/button-click.mp3"
        break
      case "gameStart":
        audioSrc = "/sounds/game-start.mp3"
        break
      case "gameComplete":
        audioSrc = "/sounds/game-complete.mp3"
        break
      case "achievement":
        audioSrc = "/sounds/achievement.mp3"
        break
      case "levelUp":
        audioSrc = "/sounds/level-up.mp3"
        break
      case "nftMint":
        audioSrc = "/sounds/nft-mint.mp3"
        break
      default:
        return
    }

    try {
      const audio = new Audio(audioSrc)
      audio.volume = 0.3 // Set volume to 30%
      audio.play().catch((error) => {
        console.log("Audio playback failed:", error)
      })
    } catch (error) {
      console.log("Audio creation failed:", error)
    }
  }, [])

  return { playSound }
}
