"use client"

import { useState, useEffect, useCallback } from "react"

interface SoundEffects {
  gameStart: HTMLAudioElement | null
  gameComplete: HTMLAudioElement | null
  gameOver: HTMLAudioElement | null
  buttonClick: HTMLAudioElement | null
  success: HTMLAudioElement | null
  error: HTMLAudioElement | null
  powerup: HTMLAudioElement | null
  achievement: HTMLAudioElement | null
  place: HTMLAudioElement | null
}

export function useSound() {
  const [sounds, setSounds] = useState<SoundEffects>({
    gameStart: null,
    gameComplete: null,
    gameOver: null,
    buttonClick: null,
    success: null,
    error: null,
    powerup: null,
    achievement: null,
    place: null,
  })
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)

  // Initialize sounds
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create audio context and generate sounds programmatically
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      const createTone = (frequency: number, duration: number, type: OscillatorType = "sine") => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = type

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)

        return oscillator
      }

      const createSoundEffect = (frequencies: number[], durations: number[], types: OscillatorType[] = []) => {
        return () => {
          if (audioContext.state === "suspended") {
            audioContext.resume()
          }

          frequencies.forEach((freq, index) => {
            setTimeout(() => {
              createTone(freq, durations[index] || 0.1, types[index] || "sine")
            }, index * 100)
          })
        }
      }

      // Create sound effects
      const newSounds: any = {
        gameStart: createSoundEffect([523, 659, 784], [0.2, 0.2, 0.4]),
        gameComplete: createSoundEffect([523, 659, 784, 1047], [0.15, 0.15, 0.15, 0.5]),
        gameOver: createSoundEffect([392, 311, 247], [0.3, 0.3, 0.6]),
        buttonClick: createSoundEffect([800], [0.1]),
        success: createSoundEffect([659, 784], [0.1, 0.2]),
        error: createSoundEffect([311, 247], [0.2, 0.3]),
        powerup: createSoundEffect([523, 659, 784, 1047, 1319], [0.1, 0.1, 0.1, 0.1, 0.3]),
        achievement: createSoundEffect([1047, 1319, 1568, 2093], [0.2, 0.2, 0.2, 0.4]),
        place: createSoundEffect([440], [0.05]),
      }

      setSounds(newSounds)
    }
  }, [volume])

  const playSound = useCallback(
    (soundName: keyof SoundEffects) => {
      if (!isMuted && sounds[soundName]) {
        try {
          sounds[soundName]?.()
        } catch (error) {
          console.warn("Could not play sound:", error)
        }
      }
    },
    [sounds, isMuted],
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const setVolumeLevel = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))
  }, [])

  return {
    playSound,
    isMuted,
    volume,
    toggleMute,
    setVolume: setVolumeLevel,
  }
}
