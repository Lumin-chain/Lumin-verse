"use client"

import { useCallback, useRef } from "react"

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback(
    (type: "click" | "success" | "error" | "complete" | "start") => {
      try {
        const audioContext = getAudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        let frequency = 440
        let duration = 0.2

        switch (type) {
          case "click":
            frequency = 800
            duration = 0.1
            break
          case "success":
            frequency = 600
            duration = 0.3
            break
          case "error":
            frequency = 200
            duration = 0.5
            break
          case "complete":
            frequency = 800
            duration = 0.8
            break
          case "start":
            frequency = 400
            duration = 0.3
            break
        }

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (error) {
        console.log("Sound not available:", error)
      }
    },
    [getAudioContext],
  )

  return { playSound }
}
