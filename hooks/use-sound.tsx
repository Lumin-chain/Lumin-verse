"use client"

import { useCallback } from "react"

export function useSound() {
  const playSound = useCallback((soundName: string) => {
    if (typeof window !== "undefined" && (window as any).sounds) {
      const sound = (window as any).sounds[soundName]
      if (sound) {
        sound.currentTime = 0
        sound.play().catch(() => {
          // Silently handle play failures
        })
      }
    }
  }, [])

  return { playSound }
}
