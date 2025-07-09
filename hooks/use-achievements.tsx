"use client"

import { useState, useCallback } from "react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  reward: string
}

interface GameStats {
  totalPoints: number
  lumTokens: number
  level: number
  streak: number
  nftsOwned: number
  puzzlesSolved: number
}

export function useAchievements() {
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  const achievements: Achievement[] = [
    {
      id: "first_puzzle",
      title: "First Steps",
      description: "Complete your first puzzle",
      icon: "🎯",
      rarity: "common",
      reward: "+10 $LUM",
    },
    {
      id: "puzzle_master_10",
      title: "Puzzle Apprentice",
      description: "Solve 10 puzzles",
      icon: "🧩",
      rarity: "common",
      reward: "+25 $LUM",
    },
    {
      id: "puzzle_master_50",
      title: "Puzzle Expert",
      description: "Solve 50 puzzles",
      icon: "🏆",
      rarity: "rare",
      reward: "+100 $LUM",
    },
    {
      id: "puzzle_master_100",
      title: "Puzzle Legend",
      description: "Solve 100 puzzles",
      icon: "👑",
      rarity: "epic",
      reward: "+250 $LUM + NFT",
    },
    {
      id: "streak_5",
      title: "On Fire",
      description: "Achieve a 5-game winning streak",
      icon: "🔥",
      rarity: "rare",
      reward: "+50 $LUM",
    },
    {
      id: "streak_10",
      title: "Unstoppable",
      description: "Achieve a 10-game winning streak",
      icon: "⚡",
      rarity: "epic",
      reward: "+150 $LUM",
    },
    {
      id: "level_10",
      title: "Rising Star",
      description: "Reach level 10",
      icon: "⭐",
      rarity: "common",
      reward: "+30 $LUM",
    },
    {
      id: "level_25",
      title: "Cosmic Explorer",
      description: "Reach level 25",
      icon: "🌟",
      rarity: "rare",
      reward: "+75 $LUM",
    },
    {
      id: "grade_5_nft",
      title: "NFT Collector",
      description: "Reach Grade 5 and mint your first NFT",
      icon: "🎨",
      rarity: "legendary",
      reward: "Exclusive NFT worth 3000 $LUM",
    },
    {
      id: "token_collector_100",
      title: "Token Hoarder",
      description: "Accumulate 100 $LUM tokens",
      icon: "💰",
      rarity: "rare",
      reward: "+25 $LUM Bonus",
    },
  ]

  const checkAchievements = useCallback(
    (stats: GameStats, gameId?: string) => {
      const unlockedAchievements: Achievement[] = []

      // Check puzzle completion achievements
      if (stats.puzzlesSolved === 1) {
        unlockedAchievements.push(achievements.find((a) => a.id === "first_puzzle")!)
      }
      if (stats.puzzlesSolved === 10) {
        unlockedAchievements.push(achievements.find((a) => a.id === "puzzle_master_10")!)
      }
      if (stats.puzzlesSolved === 50) {
        unlockedAchievements.push(achievements.find((a) => a.id === "puzzle_master_50")!)
      }
      if (stats.puzzlesSolved === 100) {
        unlockedAchievements.push(achievements.find((a) => a.id === "puzzle_master_100")!)
      }

      // Check streak achievements
      if (stats.streak === 5) {
        unlockedAchievements.push(achievements.find((a) => a.id === "streak_5")!)
      }
      if (stats.streak === 10) {
        unlockedAchievements.push(achievements.find((a) => a.id === "streak_10")!)
      }

      // Check level achievements
      if (stats.level === 10) {
        unlockedAchievements.push(achievements.find((a) => a.id === "level_10")!)
      }
      if (stats.level === 25) {
        unlockedAchievements.push(achievements.find((a) => a.id === "level_25")!)
      }

      // Check token achievements
      if (stats.lumTokens >= 100) {
        unlockedAchievements.push(achievements.find((a) => a.id === "token_collector_100")!)
      }

      // Check Grade 5 NFT achievement (level 15 = Grade 5)
      if (stats.level >= 15) {
        unlockedAchievements.push(achievements.find((a) => a.id === "grade_5_nft")!)
      }

      if (unlockedAchievements.length > 0) {
        setNewAchievements(unlockedAchievements)

        // Clear achievements after showing them
        setTimeout(() => {
          setNewAchievements([])
        }, 6000)
      }
    },
    [achievements],
  )

  return { checkAchievements, newAchievements }
}
