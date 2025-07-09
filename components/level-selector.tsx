"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useGameLevels } from "@/hooks/use-game-levels"

interface LevelSelectorProps {
  gameId: string
  gameName: string
  onLevelSelect: (level: number) => void
  onBack: () => void
}

export default function LevelSelector({ gameId, gameName, onLevelSelect, onBack }: LevelSelectorProps) {
  const { getGameProgress, getLevelConfig, getGradeProgress } = useGameLevels()
  const [selectedGrade, setSelectedGrade] = useState<number>(1)

  const gameProgress = getGameProgress(gameId)
  const gradeProgress = getGradeProgress(gameId)

  const getGradeInfo = (grade: number) => {
    switch (grade) {
      case 1:
      case 2:
        return {
          name: "Beginner",
          color: "from-green-400 to-green-600",
          emoji: "🌱",
          bgColor: "bg-green-900/30",
          borderColor: "border-green-500/30",
        }
      case 3:
      case 4:
        return {
          name: "Easy",
          color: "from-blue-400 to-blue-600",
          emoji: "⭐",
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-500/30",
        }
      case 5:
      case 6:
        return {
          name: "Medium",
          color: "from-yellow-400 to-yellow-600",
          emoji: "💎",
          bgColor: "bg-yellow-900/30",
          borderColor: "border-yellow-500/30",
        }
      case 7:
      case 8:
        return {
          name: "Hard",
          color: "from-orange-400 to-orange-600",
          emoji: "🔥",
          bgColor: "bg-orange-900/30",
          borderColor: "border-orange-500/30",
        }
      case 9:
      case 10:
        return {
          name: "Expert",
          color: "from-red-400 to-red-600",
          emoji: "👑",
          bgColor: "bg-red-900/30",
          borderColor: "border-red-500/30",
        }
      default:
        return {
          name: "Unknown",
          color: "from-gray-400 to-gray-600",
          emoji: "❓",
          bgColor: "bg-gray-900/30",
          borderColor: "border-gray-500/30",
        }
    }
  }

  const isGradeUnlocked = (grade: number) => {
    if (grade === 1) return true
    const prevGrade = grade - 1
    const prevGradeProgress = gradeProgress[prevGrade]
    return prevGradeProgress && prevGradeProgress.completed >= 1 // At least 1 level completed in previous grade
  }

  const isLevelUnlocked = (level: number) => {
    return level <= gameProgress.unlockedLevels
  }

  const isLevelCompleted = (level: number) => {
    return gameProgress.completedLevels.includes(level)
  }

  const getBestScore = (level: number) => {
    return gameProgress.bestScores[level] || 0
  }

  const renderGradeSelector = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => {
          const gradeInfo = getGradeInfo(grade)
          const progress = gradeProgress[grade]
          const isUnlocked = isGradeUnlocked(grade)
          const isSelected = selectedGrade === grade
          const progressPercent = progress ? (progress.completed / progress.total) * 100 : 0

          return (
            <Card
              key={grade}
              className={`${gradeInfo.bgColor} ${gradeInfo.borderColor} backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                isSelected ? "ring-2 ring-white scale-105" : "hover:scale-102"
              } ${!isUnlocked ? "opacity-50" : ""}`}
              onClick={() => isUnlocked && setSelectedGrade(grade)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{gradeInfo.emoji}</div>
                <div className="text-white font-bold text-sm mb-1">Grade {grade}</div>
                <div className="text-xs text-white/70 mb-2">{gradeInfo.name}</div>
                {isUnlocked && (
                  <>
                    <Progress value={progressPercent} className="h-2 mb-2" />
                    <div className="text-xs text-white/60">{progress?.completed || 0}/3 ⭐</div>
                  </>
                )}
                {!isUnlocked && <div className="text-xs text-white/40">🔒 Locked</div>}
                {grade === 5 && <Badge className="mt-1 bg-purple-500 text-white text-xs">🎨 NFT Reward</Badge>}
                {grade === 10 && (
                  <Badge className="mt-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                    👑 Legendary NFT
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderLevelSelector = () => {
    const startLevel = (selectedGrade - 1) * 3 + 1
    const endLevel = selectedGrade * 3
    const levels = Array.from({ length: 3 }, (_, i) => startLevel + i)
    const gradeInfo = getGradeInfo(selectedGrade)

    return (
      <Card className={`${gradeInfo.bgColor} ${gradeInfo.borderColor} backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">{gradeInfo.emoji}</span>
            <span>
              Grade {selectedGrade} - {gradeInfo.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map((level) => {
              const config = getLevelConfig(level)
              const isUnlocked = isLevelUnlocked(level)
              const isCompleted = isLevelCompleted(level)
              const bestScore = getBestScore(level)

              return (
                <Card
                  key={level}
                  className={`bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    !isUnlocked ? "opacity-50" : ""
                  }`}
                  onClick={() => isUnlocked && onLevelSelect(level)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{isCompleted ? "✅" : isUnlocked ? "🎯" : "🔒"}</div>
                    <div className="text-white font-bold mb-1">Level {level}</div>
                    <div className="text-xs text-white/70 mb-2">{config.difficulty}</div>

                    {isUnlocked && (
                      <>
                        <div className="text-xs text-white/60 mb-1">
                          ⏱️ {Math.floor(config.timeLimit / 60)}:{(config.timeLimit % 60).toString().padStart(2, "0")}
                        </div>
                        <div className="text-xs text-yellow-400 mb-2">💰 {config.lumReward} $LUM</div>
                        {bestScore > 0 && <div className="text-xs text-green-400">🏆 Best: {bestScore}</div>}
                      </>
                    )}

                    {!isUnlocked && <div className="text-xs text-white/40">Complete previous level</div>}

                    {/* Special NFT indicators */}
                    {level === 15 && <Badge className="mt-2 bg-purple-500 text-white text-xs">🎨 NFT Mint</Badge>}
                    {(level === 28 || level === 29 || level === 30) && (
                      <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                        👑 Legendary NFT
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-purple-900/30 border-purple-500/30 text-purple-100 hover:bg-purple-800/40"
          >
            ← Back to Games
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{gameName}</h1>
            <p className="text-purple-300">Choose your level and start your cosmic journey! 🌌</p>
          </div>
        </div>
      </div>

      {/* Grade Selector */}
      {renderGradeSelector()}

      {/* Level Selector */}
      {renderLevelSelector()}

      {/* Progress Summary */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <span>Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{gameProgress.completedLevels.length}</div>
            <div className="text-sm text-white/70">Levels Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{gameProgress.unlockedLevels}</div>
            <div className="text-sm text-white/70">Levels Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Object.values(gameProgress.bestScores).reduce((sum, score) => sum + score, 0)}
            </div>
            <div className="text-sm text-white/70">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((gameProgress.completedLevels.length / 30) * 100)}%
            </div>
            <div className="text-sm text-white/70">Game Progress</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
