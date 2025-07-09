"use client"

import { useState, useEffect } from "react"

export interface LevelConfig {
  level: number
  grade: number
  difficulty: string
  basePoints: number
  lumReward: number
  timeLimit: number
  difficultyMultiplier: number
}

export interface GameProgress {
  [gameId: string]: {
    currentLevel: number
    unlockedLevels: number
    completedLevels: number[]
    bestScores: { [level: number]: number }
  }
}

export function useGameLevels() {
  const [gameProgress, setGameProgress] = useState<GameProgress>({})

  // Initialize game progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lumin-game-progress")
    if (saved) {
      setGameProgress(JSON.parse(saved))
    } else {
      // Initialize with default progress
      const defaultProgress: GameProgress = {
        lumlogic: { currentLevel: 1, unlockedLevels: 1, completedLevels: [], bestScores: {} },
        lumword: { currentLevel: 1, unlockedLevels: 1, completedLevels: [], bestScores: {} },
        lummatch: { currentLevel: 1, unlockedLevels: 1, completedLevels: [], bestScores: {} },
        lumcode: { currentLevel: 1, unlockedLevels: 1, completedLevels: [], bestScores: {} },
        lumtrivia: { currentLevel: 1, unlockedLevels: 1, completedLevels: [], bestScores: {} },
      }
      setGameProgress(defaultProgress)
    }
  }, [])

  // Save to localStorage whenever progress changes
  useEffect(() => {
    if (Object.keys(gameProgress).length > 0) {
      localStorage.setItem("lumin-game-progress", JSON.stringify(gameProgress))
    }
  }, [gameProgress])

  const getLevelConfig = (level: number): LevelConfig => {
    const grade = Math.ceil(level / 3)
    const levelInGrade = ((level - 1) % 3) + 1

    return {
      level,
      grade,
      difficulty:
        grade <= 2 ? "Beginner" : grade <= 4 ? "Easy" : grade <= 6 ? "Medium" : grade <= 8 ? "Hard" : "Expert",
      basePoints: 100 + (grade - 1) * 50,
      lumReward: grade * 2 + (levelInGrade - 1) * 0.5,
      timeLimit: Math.max(300 - (grade - 1) * 20, 180),
      difficultyMultiplier: 1 + (grade - 1) * 0.2,
    }
  }

  const completeLevel = (gameId: string, level: number, score: number) => {
    setGameProgress((prev) => {
      const gameData = prev[gameId] || { currentLevel: 1, unlockedLevels: 1, completedLevels: [], bestScores: {} }

      const newCompletedLevels = [...gameData.completedLevels]
      if (!newCompletedLevels.includes(level)) {
        newCompletedLevels.push(level)
      }

      const newBestScores = { ...gameData.bestScores }
      if (!newBestScores[level] || score > newBestScores[level]) {
        newBestScores[level] = score
      }

      const newUnlockedLevels = Math.max(gameData.unlockedLevels, level + 1)
      const newCurrentLevel = Math.min(level + 1, 30)

      return {
        ...prev,
        [gameId]: {
          currentLevel: newCurrentLevel,
          unlockedLevels: Math.min(newUnlockedLevels, 30),
          completedLevels: newCompletedLevels,
          bestScores: newBestScores,
        },
      }
    })
  }

  const getGameProgress = (gameId: string) => {
    return gameProgress[gameId] || { currentLevel: 1, unlockedLevels: 1, completedLevels: [], bestScores: {} }
  }

  const shouldMintNFT = (gameId: string, level: number): { shouldMint: boolean; nftValue: number; grade: number } => {
    const config = getLevelConfig(level)

    // Grade 5 NFT (Level 15) - worth 3000 $LUM
    if (config.grade === 5 && level === 15) {
      return { shouldMint: true, nftValue: 3000, grade: 5 }
    }

    // Grade 10 NFT (Levels 28, 29, 30) - worth 6000 $LUM
    if (config.grade === 10 && (level === 28 || level === 29 || level === 30)) {
      return { shouldMint: true, nftValue: 6000, grade: 10 }
    }

    return { shouldMint: false, nftValue: 0, grade: config.grade }
  }

  const getTotalProgress = () => {
    let totalCompleted = 0
    let totalLevels = 0

    Object.values(gameProgress).forEach((progress) => {
      totalCompleted += progress.completedLevels.length
      totalLevels += 30 // Each game has 30 levels
    })

    return { completed: totalCompleted, total: totalLevels }
  }

  const getGradeProgress = (gameId: string) => {
    const progress = getGameProgress(gameId)
    const gradeProgress: { [grade: number]: { completed: number; total: number } } = {}

    for (let grade = 1; grade <= 10; grade++) {
      const levelsInGrade = [grade * 3 - 2, grade * 3 - 1, grade * 3]
      const completedInGrade = levelsInGrade.filter((level) => progress.completedLevels.includes(level)).length
      gradeProgress[grade] = { completed: completedInGrade, total: 3 }
    }

    return gradeProgress
  }

  return {
    gameProgress,
    getLevelConfig,
    completeLevel,
    getGameProgress,
    shouldMintNFT,
    getTotalProgress,
    getGradeProgress,
  }
}
