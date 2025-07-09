"use client"

import { useState, useCallback } from "react"

interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  rarity: "common" | "rare" | "epic" | "legendary"
  reward: string
}

const achievements: Achievement[] = [
  {
    id: "first-game",
    title: "First Steps",
    description: "Complete your first puzzle game",
    emoji: "🎯",
    rarity: "common",
    reward: "+10 $LUM",
  },
  {
    id: "puzzle-master",
    title: "Puzzle Master",
    description: "Solve 100 puzzles",
    emoji: "🧩",
    rarity: "rare",
    reward: "+100 $LUM",
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete a puzzle in under 30 seconds",
    emoji: "⚡",
    rarity: "epic",
    reward: "+50 $LUM + NFT",
  },
  {
    id: "galaxy-explorer",
    title: "Galaxy Explorer",
    description: "Play all 5 game types",
    emoji: "🌌",
    rarity: "legendary",
    reward: "+500 $LUM + Rare NFT",
  },
]

export function useAchievements() {
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])

  const checkAchievements = useCallback(
    (userStats: any, gameId?: string) => {
      const newUnlocked: Achievement[] = []

      // Check first game achievement
      if (userStats.puzzlesSolved >= 1 && !unlockedAchievements.includes("first-game")) {
        newUnlocked.push(achievements.find((a) => a.id === "first-game")!)
      }

      // Check puzzle master achievement
      if (userStats.puzzlesSolved >= 100 && !unlockedAchievements.includes("puzzle-master")) {
        newUnlocked.push(achievements.find((a) => a.id === "puzzle-master")!)
      }

      // Add more achievement checks here...

      if (newUnlocked.length > 0) {
        setNewAchievements(newUnlocked)
        setUnlockedAchievements((prev) => [...prev, ...newUnlocked.map((a) => a.id)])

        // Clear notifications after 5 seconds
        setTimeout(() => {
          setNewAchievements([])
        }, 5000)
      }
    },
    [unlockedAchievements],
  )

  return { checkAchievements, newAchievements }
}
